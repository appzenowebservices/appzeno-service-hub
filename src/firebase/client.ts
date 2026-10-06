import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  type MessagePayload,
  type Messaging,
} from "firebase/messaging";

// Read NEXT_PUBLIC_* straight from process.env: Next.js inlines these at build
// time. (Going through the t3-env `env` object returns undefined for client
// vars on @t3-oss/env-nextjs v0.13 unless `experimental__runtimeEnv` is used.)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      vapidKey,
  );
}

let messaging: Messaging | null = null;

const noop = () => undefined;

/** Single Firebase app instance shared by messaging and phone auth. */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  try {
    return getApps().length ? getApp() : initializeApp(firebaseConfig);
  } catch {
    return null;
  }
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;
  if (messaging) return messaging;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    messaging = getMessaging(app);
    return messaging;
  } catch {
    return null;
  }
}

const SW_URL = "/firebase-messaging-sw.js";
const SW_SCOPE = "/firebase-cloud-messaging-push-scope/";

/** Registers the FCM service worker (dedicated scope) and waits until active. */
async function getSwRegistration(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  if (registration.active) return registration;
  const worker = registration.installing ?? registration.waiting;
  if (worker) {
    await new Promise<void>((resolve) => {
      const onState = () => {
        if (worker.state === "activated") {
          worker.removeEventListener("statechange", onState);
          resolve();
        }
      };
      worker.addEventListener("statechange", onState);
    });
  }
  return registration;
}

/**
 * Ask for notification permission (must be called from a user gesture on Safari)
 * and return the FCM registration token for this browser, or null if unavailable.
 */
export async function requestFcmToken(): Promise<string | null> {
  const m = getFirebaseMessaging();
  if (!m || !vapidKey) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const registration = await getSwRegistration();
    return await getToken(m, { vapidKey, serviceWorkerRegistration: registration });
  } catch (error) {
    console.error("[fcm] failed to get registration token", error);
    throw error;
  }
}

/**
 * Shows a notification via the service worker — the reliable path. `new Notification()`
 * is ignored/blocked in several browsers, so use this for foreground messages too.
 */
export async function showLocalNotification(payload: { title: string; body: string; url?: string; image?: string }): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const registration = await getSwRegistration();
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      ...(payload.image ? { image: payload.image } : {}),
      data: { url: payload.url ?? "/" },
    });
  } catch (error) {
    console.error("[fcm] failed to show notification", error);
  }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
  const m = getFirebaseMessaging();
  if (!m) return noop;
  return onMessage(m, callback);
}
