import { Prisma } from "@prisma/client";
import { db } from "~/server/db";
import { parseVendorListUuids } from "./core";
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
 * User IDs to verify for a vendor/customer confirm, restricted to the given
 * roles. Same rules: exact Mongo ID wins, case-insensitive email fallback
 * within those roles only, unknown ID matches nothing. Approval/KYC fields
 * are NEVER touched here.
 */
async function verifyUserIdsFor(
  tx: Prisma.TransactionClient,
  partnerId: string | null,
  email: string,
  roles: ("VENDOR" | "CUSTOMER")[],
): Promise<string[]> {
  if (partnerId) {
    if (!OBJECT_ID.test(partnerId)) return [];
    const byId = await tx.user.findFirst({
      where: { id: partnerId, role: { in: roles } },
      select: { id: true },
    });
    return byId ? [byId.id] : [];
  }
  const users = await tx.user.findMany({
    where: { role: { in: roles }, email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

/**
 * Vendor user IDs to verify for a registration confirm.
 *
 * Same rules as the agent matcher: exact Mongo ID wins (tell the Omnipost
 * agent to send `subscriber.metadata.partnerId` = the vendor's **User** id),
 * case-insensitive email fallback restricted to role=VENDOR users, and a
 * supplied-but-unknown ID matches NOTHING (never falls back to email).
 *
 * This flips ONLY `User.isVerified` — approval/KYC (`isApproved`,
 * `kycStatus`) is never touched by email confirmation.
 */
async function vendorUserIdsFor(
  tx: Prisma.TransactionClient,
  partnerId: string | null,
  email: string,
): Promise<string[]> {
  return verifyUserIdsFor(tx, partnerId, email, ["VENDOR"]);
}
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
        // above): flip AgentProfile.isVerified on EVERY matching profile,
        // plus User.isVerified on the linked users (login is email-gated).
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
            const owners = await tx.agentProfile.findMany({
              where: { id: { in: profileIds } },
              select: { userId: true },
            });
            await tx.user.updateMany({
              where: { id: { in: owners.map((o) => o.userId) } },
              data: { isVerified: true },
            });
          }
        }

        // Vendor / customer registration (carried by core's
        // delivery-partner branch — see mapping note in the route adapter).
        // Which flag flips depends on which list confirmed (a confirm can
        // carry several lists — each matching list applies independently):
        // - vendors list   → User.isVerified on role=VENDOR rows
        // - customers list → User.isVerified on role=CUSTOMER rows +
        //   CustomerProfile.isApproved (their email-verified mirror)
        // Approval/KYC (isApproved on vendors, kycStatus) is NEVER touched.
        let deliveryPartnerVerified = false;
        let deliveryPartnerMatched = 0;
        if (input.deliveryPartner.verify) {
          const vendorLists = parseVendorListUuids(process.env.OMNIPOST_VENDOR_LIST_UUIDS);
          const customerLists = parseVendorListUuids(process.env.OMNIPOST_CUSTOMER_LIST_UUIDS);
          const firesVendor = input.listUuids.some((uuid) => vendorLists.includes(uuid));
          const firesCustomer = input.listUuids.some((uuid) => customerLists.includes(uuid));

          if (firesVendor) {
            const userIds = await vendorUserIdsFor(
              tx,
              input.deliveryPartner.partnerId,
              input.deliveryPartner.email,
            );
            if (userIds.length > 0) {
              const updated = await tx.user.updateMany({
                where: { id: { in: userIds } },
                data: { isVerified: true },
              });
              deliveryPartnerMatched += updated.count;
            }
          }

          if (firesCustomer) {
            const userIds = await verifyUserIdsFor(
              tx,
              input.deliveryPartner.partnerId,
              input.deliveryPartner.email,
              ["CUSTOMER"],
            );
            if (userIds.length > 0) {
              const updated = await tx.user.updateMany({
                where: { id: { in: userIds } },
                data: { isVerified: true },
              });
              deliveryPartnerMatched += updated.count;
              await tx.customerProfile.updateMany({
                where: { userId: { in: userIds } },
                data: { isApproved: true },
              });
            }
          }

          deliveryPartnerVerified = deliveryPartnerMatched > 0;
        }

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
