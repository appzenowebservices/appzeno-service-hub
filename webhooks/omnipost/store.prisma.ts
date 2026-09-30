import { Prisma } from "@prisma/client";
import { db } from "~/server/db";
import type { OmnipostConfirmation, OmnipostStore } from "./core";

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

/**
 * Agent rows to verify for a registration confirm, as collected profile IDs.
 *
 * MAPPING NOTE (this repo): core.ts only knows two registration branches —
 * `vendor` and `deliveryPartner`. This project has a single pro role that
 * confirms by email: the city **agent** (service.apnidesidukaan-agents
 * list). The route adapter therefore feeds the agents list UUID as
 * `vendorListUuids`, so the VENDOR branch of the (verbatim) core carries the
 * agent-registration signal. The store below maps that branch onto
 * AgentProfile.isVerified — same semantic as super-admin's Vendor.isVerified
 * flip, not the same table.
 *
 * Key rules (mirrored from super-admin):
 * - Exact Mongo ID wins: `vendorId`/`vendor_id` from subscriber metadata /
 *   subscriber / top-level (tell the Omnipost agent to send
 *   `subscriber.metadata.vendorId` = the AgentProfile id, User id also
 *   accepted). A supplied-but-unknown/non-ObjectId ID matches NOTHING (never
 *   falls back to email — wrong-person risk).
 * - Otherwise the subscriber email falls back (case-insensitive) onto
 *   role=AGENT users.
 * - One email can own several agent rows → ALL matching profiles flip via
 *   updateMany.
 */
async function agentProfileIdsFor(
  tx: Prisma.TransactionClient,
  agentId: string | null,
  email: string,
): Promise<string[]> {
  if (agentId) {
    if (!OBJECT_ID.test(agentId)) return [];
    const byProfile = await tx.agentProfile.findUnique({
      where: { id: agentId },
      select: { id: true },
    });
    if (byProfile) return [byProfile.id];
    const byUser = await tx.user.findFirst({
      where: { id: agentId, role: "AGENT" },
      select: { id: true, agentProfile: { select: { id: true } } },
    });
    if (byUser?.agentProfile) return [byUser.agentProfile.id];
    return [];
  }
  const users = await tx.user.findMany({
    where: { role: "AGENT", email: { equals: email, mode: "insensitive" } },
    select: { agentProfile: { select: { id: true } } },
  });
  return users
    .map((u) => u.agentProfile?.id)
    .filter((id): id is string => typeof id === "string");
}

/**
 * Production persistence for the Omnipost receiver (this project).
 *
 * Atomicity: processed-key insert + subscriber upsert + optional agent
 * verify run in one transaction, so a retried delivery can never create a
 * half-applied state. Duplicate deliveries (same `idempotency_key`) hit the
 * unique key and return `{ duplicate: true }` — including under races
 * (P2002 fallback).
 */
export const prismaOmnipostStore: OmnipostStore = {
  async processConfirmation(input: OmnipostConfirmation) {
    try {
      return await db.$transaction(async (tx) => {
        await tx.omnipostProcessedKey.create({
          data: { key: input.idempotencyKey },
        });

        // Omnipost fires once per confirmed list — merge so a subscriber
        // confirming list B later keeps list A instead of overwriting it.
        const existing = await tx.newsletterSubscriber.findUnique({
          where: { uuid: input.subscriber.uuid },
        });
        const listUuids = Array.from(
          new Set([...(existing?.listUuids ?? []), ...input.listUuids]),
        );

        await tx.newsletterSubscriber.upsert({
          where: { uuid: input.subscriber.uuid },
          create: {
            uuid: input.subscriber.uuid,
            email: input.subscriber.email,
            name: input.subscriber.name,
            listUuids,
            status: "confirmed",
            confirmedAt: input.confirmedAt,
          },
          update: {
            email: input.subscriber.email,
            name: input.subscriber.name,
            listUuids,
            status: "confirmed",
            confirmedAt: input.confirmedAt,
          },
        });

        // Agent registration (carried by core's vendor branch — see note
        // above): flip AgentProfile.isVerified on EVERY matching profile.
        let vendorVerified = false;
        let vendorMatched = 0;
        if (input.vendor.verify) {
          const profileIds = await agentProfileIdsFor(
            tx,
            input.vendor.vendorId,
            input.vendor.email,
          );
          if (profileIds.length > 0) {
            const updated = await tx.agentProfile.updateMany({
              where: { id: { in: profileIds } },
              data: { isVerified: true },
            });
            vendorMatched = updated.count;
            vendorVerified = updated.count > 0;
          }
        }

        // No delivery-partner model in this project. The branch is accepted
        // and reported (never throws) so a multi-purpose payload still
        // returns 200 with a visible miss.
        const deliveryPartnerVerified = false;
        const deliveryPartnerMatched = 0;

        return {
          duplicate: false,
          vendorVerified,
          vendorMatched,
          deliveryPartnerVerified,
          deliveryPartnerMatched,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          duplicate: true,
          vendorVerified: false,
          vendorMatched: 0,
          deliveryPartnerVerified: false,
          deliveryPartnerMatched: 0,
        };
      }
      throw error;
    }
  },
};
