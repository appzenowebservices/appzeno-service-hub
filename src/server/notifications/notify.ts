import type { PrismaClient } from "@prisma/client";
import { getFirebaseAdminMessaging } from "~/server/firebase/admin";

type Db = PrismaClient;

interface PushPayload {
  title: string;
  body: string;
  url?: string | null;
  image?: string | null;
}

interface NotifyInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  image?: string | null;
}

const STALE_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

/** Turns "/path" into an absolute URL for the push click action (FCM requires one). */
function absoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "";
  if (!base) return undefined;
  return base.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`);
}

/** Sends a web-push to every registered device of a user and prunes dead tokens. */
export async function sendPushToUser(db: Db, userId: string, payload: PushPayload): Promise<void> {
  const messaging = getFirebaseAdminMessaging();
  if (!messaging) return;

  const user = await db.user.findUnique({ where: { id: userId }, select: { fcmTokens: true } });
  const tokens = user?.fcmTokens ?? [];
  if (tokens.length === 0) return;

  const link = absoluteUrl(payload.url);
  const image = absoluteUrl(payload.image);

  try {
    const res = await messaging.sendEachForMulticast({
      tokens,
      // `notification` gives browsers an auto-display fallback; `data` lets our
      // service worker and foreground handler render it consistently.
      notification: { title: payload.title, body: payload.body, ...(image ? { image } : {}) },
      data: {
        title: payload.title,
        body: payload.body,
        ...(payload.url ? { url: payload.url } : {}),
        ...(image ? { image } : {}),
      },
      webpush: {
        headers: { Urgency: "high" },
        notification: {
          title: payload.title,
          body: payload.body,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          ...(image ? { image } : {}),
        },
        ...(link ? { fcmOptions: { link } } : {}),
      },
    });

    if (res.failureCount > 0 || process.env.NODE_ENV === "development") {
      console.log(`[fcm] "${payload.title}" → ${res.successCount} delivered, ${res.failureCount} failed`);
    }

    const stale: string[] = [];
    res.responses.forEach((r, i) => {
      if (!r.success && STALE_TOKEN_CODES.has(r.error?.code ?? "")) {
        const token = tokens[i];
        if (token) stale.push(token);
      }
    });
    if (stale.length > 0) {
      await db.user.update({
        where: { id: userId },
        data: { fcmTokens: { set: tokens.filter((t) => !stale.includes(t)) } },
      });
    }
  } catch (error) {
    // Push is best-effort — never break the primary action because of FCM.
    console.error("[fcm] send failed", error);
  }
}

/** Creates the in-app notification row and mirrors it as a device push. */
export async function notifyUser(db: Db, input: NotifyInput): Promise<void> {
  await db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl ?? null,
      image: input.image ?? null,
    },
  });
  await sendPushToUser(db, input.userId, {
    title: input.title,
    body: input.message,
    url: input.actionUrl ?? null,
    image: input.image ?? null,
  });
}

/** Fans a push out to many users (used by admin broadcasts). */
export async function sendPushToUsers(
  db: Db,
  userIds: string[],
  base: { title: string; body: string; url?: string | null; image?: string | null },
): Promise<void> {
  if (userIds.length === 0) return;
  const users = await db.user.findMany({
    where: { id: { in: userIds }, fcmTokens: { isEmpty: false } },
    select: { id: true },
  });
  await Promise.allSettled(users.map((u) => sendPushToUser(db, u.id, base)));
}
