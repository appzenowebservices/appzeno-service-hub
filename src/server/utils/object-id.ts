const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/** True when the value is a 24-hex Mongo ObjectId (guards Prisma from "env-superadmin" style ids). */
export function isObjectId(value: string | null | undefined): boolean {
  return typeof value === "string" && OBJECT_ID_RE.test(value);
}
