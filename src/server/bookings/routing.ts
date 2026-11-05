import type { PrismaClient } from "@prisma/client";

export type ResolvedAgent = {
  userId: string;
  fullName: string;
  assignedCity: string;
};

/**
 * Picks the primary agent for a booking's pincode:
 *  1. agents whose service area contains the pincode,
 *  2. prefer agents assigned to the booking's city,
 *  3. among those, the one with the fewest active bookings.
 */
export async function resolvePincodeAgent(
  db: PrismaClient,
  pincode: string,
  city: string,
): Promise<ResolvedAgent | null> {
  if (!pincode) return null;

  const profiles = await db.agentProfile.findMany({
    where: {
      serviceAreaPincodes: { has: pincode },
      user: { is: { isActive: true } },
    },
    select: {
      userId: true,
      assignedCity: true,
      user: { select: { fullName: true } },
    },
  });
  if (profiles.length === 0) return null;

  const wantedCity = city.trim().toLowerCase();
  const cityMatches = profiles.filter((p) => p.assignedCity.trim().toLowerCase() === wantedCity);
  const pool = cityMatches.length > 0 ? cityMatches : profiles;

  const counts = await db.booking.groupBy({
    by: ["agentId"],
    where: {
      agentId: { in: pool.map((p) => p.userId) },
      status: { in: ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
    },
    _count: { _all: true },
  });
  const load = new Map(
    counts
      .filter((c) => c.agentId)
      .map((c) => [c.agentId as string, c._count._all]),
  );

  pool.sort((a, b) => (load.get(a.userId) ?? 0) - (load.get(b.userId) ?? 0));
  const chosen = pool[0];
  if (!chosen) return null;
  return {
    userId: chosen.userId,
    fullName: chosen.user.fullName,
    assignedCity: chosen.assignedCity,
  };
}
