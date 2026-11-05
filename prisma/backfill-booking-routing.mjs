import { PrismaClient } from "@prisma/client";

/**
 * Backfills the pincode-routing fields on bookings created before the
 * pincode→agent routing change.
 *
 * - copies address.pincode / address.city onto Booking.pincode / Booking.city
 * - assigns the primary area agent (city match first, then first covering agent)
 * - appends an AGENT_ASSIGNED timeline event for each backfilled assignment
 *
 * Safe to run multiple times.
 *
 *   node prisma/backfill-booking-routing.mjs
 */

const db = new PrismaClient();

try {
  const bookings = await db.booking.findMany({
    select: { id: true, status: true, address: true, pincode: true, city: true, agentId: true },
  });

  let updated = 0;
  let assigned = 0;
  let skipped = 0;

  for (const booking of bookings) {
    const addr = booking.address ?? {};
    const pincode = (booking.pincode ?? addr.pincode ?? "").trim();
    const city = (booking.city ?? addr.city ?? "").trim();

    const data = {};
    if (pincode && pincode !== booking.pincode) data.pincode = pincode;
    if (city && city !== booking.city) data.city = city;

    let newAgentId = null;
    if (!booking.agentId && pincode) {
      const profiles = await db.agentProfile.findMany({
        where: { serviceAreaPincodes: { has: pincode }, user: { is: { isActive: true } } },
        select: { userId: true, assignedCity: true },
      });
      const chosen =
        profiles.find((p) => city && p.assignedCity.toLowerCase() === city.toLowerCase()) ??
        profiles[0];
      if (chosen) {
        newAgentId = chosen.userId;
        data.agentId = chosen.userId;
        data.agentAssignedAt = new Date();
      }
    }

    if (Object.keys(data).length === 0) {
      skipped += 1;
      continue;
    }

    await db.booking.update({ where: { id: booking.id }, data });
    updated += 1;

    if (newAgentId) {
      assigned += 1;
      await db.bookingEvent.create({
        data: {
          bookingId: booking.id,
          status: booking.status,
          action: "AGENT_ASSIGNED",
          actorRole: "SYSTEM",
          note: `Backfilled area agent for pincode ${pincode}`,
        },
      });
    }
  }

  console.log(
    JSON.stringify({ total: bookings.length, updated, agentAssigned: assigned, unchanged: skipped }),
  );
} finally {
  await db.$disconnect();
}
