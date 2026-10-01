import { readFileSync } from "node:fs";
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { env } from "~/env";

interface ServiceAccountShape {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

function parseServiceAccount(raw: string | undefined): ServiceAccountShape | null {
  if (!raw) return null;
  const value = raw.trim();
  try {
    // Accepts, in order: raw JSON, base64-encoded JSON, or a path to the JSON file.
    if (value.startsWith("{")) return JSON.parse(value) as ServiceAccountShape;
    const decoded = Buffer.from(value, "base64").toString("utf8");
    if (decoded.trim().startsWith("{")) return JSON.parse(decoded) as ServiceAccountShape;
    return JSON.parse(readFileSync(value, "utf8")) as ServiceAccountShape;
  } catch {
    return null;
  }
}

let app: App | null = null;
let initialized = false;

export function getFirebaseAdminApp(): App | null {
  if (initialized) return app;
  initialized = true;

  if (getApps().length > 0) {
    app = getApp();
    return app;
  }

  const sa = parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (!sa?.client_email || !sa.private_key) {
    console.warn("[fcm] Firebase admin not configured — push notifications disabled");
    return null;
  }

  try {
    app = initializeApp({
      credential: cert({
        projectId: sa.project_id ?? env.FIREBASE_PROJECT_ID,
        clientEmail: sa.client_email,
        privateKey: sa.private_key.replace(/\\n/g, "\n"),
      }),
    });
    return app;
  } catch (error) {
    console.error("[fcm] Firebase admin init failed", error);
    return null;
  }
}

export function getFirebaseAdminMessaging(): Messaging | null {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;
  try {
    return getMessaging(adminApp);
  } catch {
    return null;
  }
}
