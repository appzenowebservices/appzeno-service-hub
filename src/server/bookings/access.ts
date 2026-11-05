import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export type SessionUser = { id: string; role?: string };

export function roleOf(user: SessionUser): string {
  return (user.role ?? "").toUpperCase();
}

type BookingAccessShape = {
  customerId: string;
  vendorId?: string | null;
  agentId?: string | null;
  pincode?: string | null;
};

/**
 * Central booking access check. Returns the actor's role when allowed.
 * - ADMIN: everything
 * - CUSTOMER: own bookings
 * - VENDOR: bookings assigned to them
 * - AGENT: primary assigned agent, or any booking whose pincode is in their
 *   service area (so every covering agent can track/manage it).
 */
export async function assertBookingAccess(
  db: PrismaClient,
  user: SessionUser,
  booking: BookingAccessShape,
): Promise<"ADMIN" | "CUSTOMER" | "VENDOR" | "AGENT"> {
  const role = roleOf(user);

  if (role === "ADMIN") return "ADMIN";
  if (role === "CUSTOMER" && booking.customerId === user.id) return "CUSTOMER";
  if (role === "VENDOR" && booking.vendorId === user.id) return "VENDOR";
  if (role === "AGENT") {
    if (booking.agentId === user.id) return "AGENT";
    if (booking.pincode) {
      const profile = await db.agentProfile.findFirst({
        where: { userId: user.id },
        select: { serviceAreaPincodes: true },
      });
      if ((profile?.serviceAreaPincodes ?? []).includes(booking.pincode)) return "AGENT";
    }
  }

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "You don't have access to this booking.",
  });
}

export async function agentPincodes(db: PrismaClient, userId: string): Promise<string[]> {
  const profile = await db.agentProfile.findFirst({
    where: { userId },
    select: { serviceAreaPincodes: true },
  });
  return profile?.serviceAreaPincodes ?? [];
}
