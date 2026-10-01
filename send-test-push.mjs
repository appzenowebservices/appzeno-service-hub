import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { cert, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const env = readFileSync(".env", "utf8");
const line = env.match(/^FIREBASE_SERVICE_ACCOUNT_KEY=(.*)$/m);
if (!line) { console.log("no SA key in .env"); process.exit(1); }
const sa = JSON.parse(Buffer.from(line[1].trim(), "base64").toString("utf8"));
initializeApp({ credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }) });

const STALE = ["messaging/registration-token-not-registered", "messaging/invalid-registration-token", "messaging/invalid-argument"];

const db = new PrismaClient();
const users = await db.user.findMany({ where: { fcmTokens: { isEmpty: false } }, select: { id: true, fullName: true, role: true, mobile: true, fcmTokens: true } });
console.log("users with tokens:", users.length);
for (const u of users) console.log(" -", u.role, u.mobile, u.fullName, "=> tokens:", u.fcmTokens.length);
const tokens = users.flatMap((u) => u.fcmTokens);
if (tokens.length === 0) { console.log("NO_TOKENS (open the app, Allow notifications, then retry)"); await db.$disconnect(); process.exit(0); }

const title = "ADDies test";
const body = "If you see this, FCM push is working!";
const path = "/customer/dashboard";
const link = `${APP_URL.replace(/\/+$/, "")}${path}`;

const res = await getMessaging().sendEachForMulticast({
  tokens,
  notification: { title, body },
  data: { title, body, url: path },
  webpush: {
    headers: { Urgency: "high" },
    notification: { title, body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png" },
    fcmOptions: { link },
  },
});
console.log("success:", res.successCount, "failure:", res.failureCount, "| link:", link);

const stale = [];
res.responses.forEach((r, i) => {
  const code = r.error?.code ?? "";
  console.log(" token", i, r.success ? "OK" : code);
  if (!r.success && STALE.includes(code)) stale.push(tokens[i]);
});

if (stale.length > 0) {
  for (const u of users) {
    const remaining = u.fcmTokens.filter((t) => !stale.includes(t));
    if (remaining.length !== u.fcmTokens.length) {
      await db.user.update({ where: { id: u.id }, data: { fcmTokens: { set: remaining } } });
    }
  }
  console.log("pruned stale tokens:", stale.length);
}

await db.$disconnect();
