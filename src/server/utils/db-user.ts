import type { PrismaClient } from "@prisma/client";
import { isObjectId } from "~/server/utils/object-id";

/**
 * Resolves the DB user id for a session. The env superadmin has a non-ObjectId
 * id, so it is mapped to its DB row by mobile (see prisma/ensure-superadmin.mjs).
 */
export async function resolveDbUserId(
  db: PrismaClient,
  sessionUser: { id: string; mobile?: string },
): Promise<string | null> {
  if (isObjectId(sessionUser.id)) return sessionUser.id;
  const mobile = (sessionUser.mobile ?? "").trim();
  if (!mobile) return null;
  const row = await db.user.findFirst({ where: { mobile }, select: { id: true } });
  return row?.id ?? null;
}
