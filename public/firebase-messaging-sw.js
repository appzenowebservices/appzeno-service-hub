// /public/firebase-messaging-sw.js
// NOTE: values here are the public Web-App config (safe to expose).
// They must belong to the same Firebase project as the NEXT_PUBLIC_FIREBASE_* env vars.

importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA5I4jP9syPQ5-hTyEcgPxjdCiKq13kvos",
  authDomain: "service-hub-df5e3.firebaseapp.com",
  projectId: "service-hub-df5e3",
  storageBucket: "service-hub-df5e3.firebasestorage.app",
  messagingSenderId: "990502707671",
  appId: "1:990502707671:web:eb5934cdb81d4b3fe76b92",
  measurementId: "G-KKL8KGQWH6",
});

// Background notifications
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const note = payload?.notification || {};
  const title = note.title || data.title || "ADDies";
  const body = note.body || data.body || "";
  const icon = note.icon || "/icons/icon-192.png";
  const image = note.image || data.image || undefined;
  const url = data.url || payload?.fcmOptions?.link || "/";

  self.registration.showNotification(title, {
    body,
    icon,
    badge: "/icons/icon-192.png",
    ...(image ? { image } : {}),
    data: { url },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if ("navigate" in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
