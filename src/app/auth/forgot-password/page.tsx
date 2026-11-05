"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, Send } from "lucide-react";
import { trpc } from "~/trpc/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const requestReset = trpc.auth.requestPasswordReset.useMutation();

  const submit = async () => {
    setErr("");
    const value = email.trim();
    if (!/\S+@\S+\.\S+/.test(value)) {
      setErr("Enter the e-mail address linked to your account.");
      return;
    }
    setBusy(true);
    try {
      await requestReset.mutateAsync({ email: value });
      setSent(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send the reset e-mail. Please try again.");
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
          {sent ? (
            <div className="py-2 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                <Mail size={26} className="text-primary-600" />
              </span>
              <p className="mt-4 text-xl font-extrabold text-ink">Check your inbox</p>
              <p className="sub mt-2">
                We sent a secure password-reset link to <strong className="text-ink">{email.trim()}</strong>.
              </p>
              <div className="mt-4 rounded-xl bg-accent-50 px-3 py-2.5 text-[12px] font-semibold text-accent-600">
                The link is valid for 30 minutes and can be used once.
              </div>
              <p className="mt-3 text-[12px] font-medium text-muted">
                Didn&apos;t receive it? Check spam, or{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="font-bold text-primary-600 hover:underline"
                >
                  try another e-mail
                </button>
                .
              </p>
              <Link href="/auth/login" className="btn-primary mt-5 w-full !py-3">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink">
                <KeyRound size={18} className="text-primary-600" /> Reset your password
              </p>
              <p className="sub mt-1">Enter your registered e-mail and we&apos;ll send you a secure reset link.</p>

              <div className="mt-4">
                <label htmlFor="reset-email" className="mb-1.5 block text-[13px] font-extrabold text-ink">
                  E-mail address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!busy) void submit();
                    }
                  }}
                  className="input !py-3"
                />
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={busy}
                  className="btn-primary mt-3 w-full !py-3 disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending link…
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send reset link
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

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-[12px] font-medium text-body">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
                For your safety we don&apos;t reveal whether an e-mail is registered.
              </div>
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
