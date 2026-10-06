import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// Creates/refreshes the DB row that backs the env superadmin's device tokens
// and notifications. Login itself stays env-based (config.ts checks env first).
// Usage: node prisma/ensure-superadmin.mjs

function envVar(name) {
  if (process.env[name]) return process.env[name];
  try {
    const env = readFileSync(".env", "utf8");
    const m = env.match(new RegExp(`^${name}=(.*)$`, "m"));
    return m ? m[1].trim().replace(/^"|"$/g, "") : undefined;
  } catch {
    return undefined;
  }
}

const mobile = envVar("SUPERADMIN_MOBILE");
if (!mobile) {
  console.log("SUPERADMIN_MOBILE not set in env/.env — nothing to do");
  process.exit(1);
}

const db = new PrismaClient();
const admin = await db.user.upsert({
  where: { mobile },
  update: { role: "ADMIN", isVerified: true, isActive: true },
  create: {
    fullName: "Super Administrator",
    mobile,
    role: "ADMIN",
    city: "Lucknow",
    state: "Uttar Pradesh",
    isVerified: true,
    isActive: true,
  },
  select: { id: true, mobile: true, fullName: true, role: true, fcmTokens: true },
});
console.log("superadmin row ready:", admin.id, admin.mobile, admin.role, "| devices:", admin.fcmTokens.length);
await db.$disconnect();
