"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
import { trpc } from "~/trpc/react";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = (params.get("token") ?? "").trim();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const reset = trpc.auth.resetPassword.useMutation();

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => router.replace("/auth/login?reset=1"), 2600);
    return () => window.clearTimeout(t);
  }, [done, router]);

  const submit = async () => {
    setErr("");
    if (!token) {
      setErr("This reset link is incomplete. Please request a new e-mail.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await reset.mutateAsync({ token, password });
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update your password. Please request a new link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10 font-sans">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-2.5">
          <Image src="/logo.png" alt="ADDies" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="leading-none">
            <span className="block text-[17px] font-extrabold tracking-tight text-ink">ADDies</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">Service Hub</span>
          </span>
        </Link>

        <div className="card !p-6">
          {done ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
                <CheckCircle2 size={26} className="text-success" />
              </span>
              <p className="mt-4 text-xl font-extrabold text-ink">Password updated</p>
              <p className="sub mt-1">Taking you to sign in…</p>
              <Link href="/auth/login?reset=1" className="btn-primary mt-4 w-full !py-3">
                Sign in now
              </Link>
            </div>
          ) : !token ? (
            <div className="py-4 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft">
                <AlertCircle size={26} className="text-danger" />
              </span>
              <p className="mt-4 text-xl font-extrabold text-ink">Link is incomplete</p>
              <p className="sub mt-1">Request a fresh reset e-mail and use the button inside it.</p>
              <Link href="/auth/forgot-password" className="btn-primary mt-4 w-full !py-3">
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <p className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink">
                <KeyRound size={18} className="text-primary-600" /> Choose a new password
              </p>
              <p className="sub mt-1">Pick something strong — at least 6 characters.</p>

              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="new-pass" className="mb-1.5 block text-[13px] font-extrabold text-ink">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-pass"
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input !py-3 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-pass" className="mb-1.5 block text-[13px] font-extrabold text-ink">
                    Confirm password
                  </label>
                  <input
                    id="confirm-pass"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!busy) void submit();
                      }
                    }}
                    className="input !py-3"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={busy}
                  className="btn-primary w-full !py-3 disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating…
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Set new password
                    </>
                  )}
                </button>
              </div>

              {err !== "" && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft p-3 text-[13px] font-semibold text-danger">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {err}
                </div>
              )}

              <p className="mt-3 text-[12px] font-medium text-muted">
                Link expired?{" "}
                <Link href="/auth/forgot-password" className="font-bold text-primary-600 hover:underline">
                  Request a new one
                </Link>
                .
              </p>
            </>
          )}
        </div>

        <Link
          href="/auth/login"
          className="mt-5 flex items-center justify-center gap-1.5 text-[13px] font-bold text-muted hover:text-primary-700"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface text-sm font-semibold text-muted">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
