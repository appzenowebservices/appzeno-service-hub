import type { PrismaClient } from "@prisma/client";

interface EventInput {
  bookingId: string;
  status: string;
  action?: string;
  actorRole?: string;
  actorId?: string | null;
  note?: string | null;
}

/** Appends a lifecycle event to a booking; never breaks the primary action. */
export async function logBookingEvent(db: PrismaClient, input: EventInput): Promise<void> {
  try {
    await db.bookingEvent.create({
      data: {
        bookingId: input.bookingId,
        status: input.status,
        action: input.action ?? "STATUS",
        actorRole: input.actorRole ?? "SYSTEM",
        actorId: input.actorId ?? null,
        note: input.note ?? null,
      },
    });
  } catch (error) {
    console.error("[timeline] failed to log booking event", error);
  }
}
