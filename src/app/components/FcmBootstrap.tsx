"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, BellOff, BellRing, Loader2, X } from "lucide-react";
import { isFirebaseConfigured, onForegroundMessage, requestFcmToken, showLocalNotification } from "~/firebase/client";
import { trpc } from "~/trpc/react";

// Dismissal lasts for the browsing session only.
const DISMISS_KEY = "addies.push.prompt.dismissed";
// Token obtained before login is parked here and registered right after sign-in.
const PENDING_TOKEN_KEY = "addies.fcm.pendingToken";

type Mode = "ask" | "blocked" | null;

/**
 * Prompts the user to turn on notifications whenever permission is not granted
 * (signed in or not). Shows unlock instructions when the browser has blocked it.
 * Mounted globally from the root layout.
 */
export default function FcmBootstrap() {
  const { status } = useSession();
  const [mode, setMode] = useState<Mode>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; body: string; url: string; image?: string } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const register = trpc.users.registerFcmToken.useMutation({
    onSuccess: (res: { ok?: boolean; reason?: string } | undefined) => {
      if (res?.ok === false) {
        if (res.reason === "no-db-user") {
          // No DB row to attach tokens to (e.g. env superadmin before
          // `node prisma/ensure-superadmin.mjs` has been run) — not a user error.
          console.info("[fcm] push disabled for this session (no database account)");
          window.localStorage.removeItem(PENDING_TOKEN_KEY);
          return;
        }
        setErr(`This session has no database account (${res.reason ?? "unknown"}) — log in as a real customer/vendor/agent to receive push.`);
      }
    },
    onError: (e: { message?: string }) => {
      console.error("[fcm] register failed", e);
      setErr(`Server rejected the token: ${e?.message ?? "unknown error"}`);
    },
  });

  // Refs keep the callbacks/timers stable — otherwise the modal timer is
  // cancelled and re-created on every render and may never fire.
  const registerRef = useRef(register);
  registerRef.current = register;
  const statusRef = useRef(status);
  statusRef.current = status;
  const busyRef = useRef(false);
  const dismissedRef = useRef(false);

  const saveToken = useCallback((token: string) => {
    if (statusRef.current === "authenticated") {
      registerRef.current.mutate({ token });
    } else {
      window.localStorage.setItem(PENDING_TOKEN_KEY, token);
    }
  }, []);

  const enable = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setErr(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMode("blocked");
        return;
      }
      if (!isFirebaseConfigured()) {
        setErr("Firebase web config is missing — add the NEXT_PUBLIC_FIREBASE_* values and restart the dev server.");
        return;
      }
      try {
        const token = await requestFcmToken();
        if (!token) {
          setErr("Browser allowed notifications, but no FCM token was issued. Check the browser console for [fcm] logs.");
          return;
        }
        saveToken(token);
        setMode(null);
      } catch (error) {
        setErr(`FCM registration failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [saveToken]);

  // Register a token captured before the user signed in.
  useEffect(() => {
    if (status !== "authenticated") return;
    const pending = window.localStorage.getItem(PENDING_TOKEN_KEY);
    if (!pending) return;
    register.mutate(
      { token: pending },
      { onSuccess: () => window.localStorage.removeItem(PENDING_TOKEN_KEY) },
    );
  }, [status, register]);

  // Decide what to show; re-checks when the tab regains focus, so enabling
  // notifications from browser settings updates the app without a reload.
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const evaluate = () => {
      if (Notification.permission === "granted") {
        setMode(null);
        setErr(null);
        if (statusRef.current === "authenticated") void enable();
        return;
      }
      if (dismissedRef.current || window.sessionStorage.getItem(DISMISS_KEY) === "1") return;
      setMode(Notification.permission === "denied" ? "blocked" : "ask");
    };

    const timer = window.setTimeout(evaluate, 1200);
    window.addEventListener("focus", evaluate);
    document.addEventListener("visibilitychange", evaluate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", evaluate);
      document.removeEventListener("visibilitychange", evaluate);
    };
  }, [enable]);

  // Foreground pushes: show the OS notification AND an in-app popup. Chrome may
  // suppress the banner for regular (non-installed) tabs, so the popup is the
  // guaranteed visible path.
  useEffect(() => {
    return onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? payload.data?.title ?? "ADDies";
      const body = payload.notification?.body ?? payload.data?.body ?? "";
      const url = payload.data?.url ?? payload.fcmOptions?.link ?? "/";
      const image = payload.notification?.image ?? payload.data?.image ?? undefined;
      void showLocalNotification({ title, body, url, image });
      setToast({ title, body, url, image });
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 8000);
    });
  }, []);

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
    dismissedRef.current = true;
    setErr(null);
    setMode(null);
  };

  const blocked = mode === "blocked";
  const showModal = Boolean(mode ?? err);

  return (
    <>
      {toast ? (
        <div className="fixed right-3 top-3 z-[80] w-full max-w-sm px-1">
          <button
            type="button"
            onClick={() => { setToast(null); window.location.href = toast.url; }}
            className="w-full overflow-hidden rounded-2xl border border-line bg-white text-left shadow-pop transition-transform hover:scale-[1.01]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {toast.image ? <img src={toast.image} alt="" className="h-28 w-full object-cover" /> : null}
            <div className="flex items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"><BellRing size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-ink">{toast.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-body">{toast.body}</p>
              </div>
              <span
                role="button"
                tabIndex={0}
                aria-label="Dismiss"
                onClick={(e) => { e.stopPropagation(); setToast(null); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setToast(null); } }}
                className="shrink-0 rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"
              >
                <X size={15} />
              </span>
            </div>
          </button>
        </div>
      ) : null}

      {showModal ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">
      <div role="alertdialog" aria-modal="true" aria-label="Notifications" className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-pop">
        <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${blocked ? "bg-danger-soft" : "bg-accent-soft"}`}>
          {blocked ? <BellOff size={24} className="text-danger" /> : <BellRing size={24} className="text-accent-600" />}
        </span>

        <p className="mt-3 text-lg font-extrabold tracking-tight text-ink">
          {blocked ? "Notifications are blocked" : err ? "Couldn't turn on notifications" : "Turn on notifications"}
        </p>

        {blocked ? (
          <div className="mt-1.5 space-y-1.5 text-left">
            <p className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-[12px] font-semibold text-danger">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Your browser blocked notifications, so we can&apos;t ask again from here.
            </p>
            <p className="text-[12px] font-medium text-body">
              To enable them: click the <b>padlock / tune icon</b> in the address bar → <b>Notifications</b> → <b>Allow</b>, then come back to this tab.
            </p>
          </div>
        ) : (
          <p className="sub mt-1">
            Get live booking updates, payment receipts and offers. It takes one tap — you can turn it off anytime.
          </p>
        )}

        {!isFirebaseConfigured() ? (
          <p className="mt-2 rounded-xl bg-surface px-3 py-2 text-[11px] font-semibold text-muted">
            Firebase isn&apos;t configured in this build — check .env (restart the dev server).
          </p>
        ) : null}

        {err ? (
          <p className="mt-2 flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-left text-[11px] font-semibold text-danger">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {err}
          </p>
        ) : null}

        <div className="mt-5 grid gap-2">
          {blocked ? (
            <button onClick={() => window.location.reload()} className="btn-primary w-full !py-3">
              I&apos;ve enabled it — Reload
            </button>
          ) : (
            <button onClick={() => { void enable(); }} disabled={busy} className="btn-primary w-full !py-3 disabled:opacity-50">
              {busy ? <><Loader2 size={16} className="animate-spin" /> Asking browser…</> : <><BellRing size={16} /> Allow notifications</>}
            </button>
          )}
          <button onClick={dismiss} className="btn-ghost w-full !py-2.5 text-sm">
            {blocked ? "Not now" : "Maybe later"}
          </button>
        </div>

        <button onClick={dismiss} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink">
          <X size={17} />
        </button>
      </div>
    </div>
      ) : null}
    </>
  );
}
