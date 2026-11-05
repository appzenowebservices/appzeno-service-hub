"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock, Smartphone } from "lucide-react";
import { trpc } from "~/trpc/react";
import { confirmPhoneCode, phoneAuthErrorMessage, startPhoneVerification } from "~/firebase/phone";

type Step = "mobile" | "otp" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const busyRef = useRef(false);

  const startReset = trpc.auth.startPasswordReset.useMutation();
  const resetPassword = trpc.auth.resetPasswordWithOtp.useMutation();

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const sendOtp = async () => {
    if (busyRef.current) return;
    if (!/^\d{10}$/.test(mobile.trim())) {
      setErr("Enter your 10-digit mobile number.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setErr("");
    try {
      const check = await startReset.mutateAsync({ mobile: mobile.trim() });
      if (!check.ok) {
        if (check.reason === "NO_ACCOUNT") setErr("No ADDies account found with this mobile number.");
        else if (check.reason === "PROTECTED") setErr("This account can't be reset here — contact the administrator.");
        else setErr("This account is blocked. Please contact support.");
        return;
      }
      setInfo(check.hasPassword ? "" : "This account has no password yet — set one below.");
      await startPhoneVerification(mobile.trim(), "reset-recaptcha");
      setStep("otp");
      setResendIn(30);
    } catch (e) {
      setErr(phoneAuthErrorMessage(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const resetNow = async () => {
    setErr("");
    if (newPass.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const idToken = await confirmPhoneCode(otp);
      await resetPassword.mutateAsync({ mobile: mobile.trim(), idToken, newPassword: newPass });
      setStep("success");
      // Try to sign in straight away with the new password.
      const r = await signIn("credentials", { redirect: false, mobile: mobile.trim(), password: newPass });
      if (r?.error) {
        window.setTimeout(() => router.replace("/auth/login?reset=1"), 1200);
        return;
      }
      const session = await getSession();
      const role = (((session?.user as { role?: string } | undefined)?.role) ?? "").toUpperCase();
      const dest = { CUSTOMER: "/customer/dashboard", VENDOR: "/vendor", AGENT: "/agent", ADMIN: "/admin" }[role] ?? "/";
      window.setTimeout(() => { router.replace(dest); router.refresh(); }, 1200);
    } catch (e) {
      const code = (e as { code?: string } | null)?.code ?? "";
      setErr(code.startsWith("auth/") ? phoneAuthErrorMessage(e) : (e instanceof Error && e.message) || "Reset failed. Please try again.");
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
          {step === "success" ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft"><CheckCircle2 size={26} className="text-success" /></span>
              <p className="mt-4 text-xl font-extrabold text-ink">Password updated</p>
              <p className="sub mt-1">{err === "" ? "Signing you in…" : "You can now sign in with your new password."}</p>
              {err !== "" ? <Link href="/auth/login" className="btn-primary mt-4 w-full !py-3">Go to sign in</Link> : null}
            </div>
          ) : (
            <>
              <p className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink"><KeyRound size={18} className="text-primary-600" /> Reset your password</p>
              <p className="sub mt-1">
                {step === "mobile" ? "Enter your registered mobile — we'll send a one-time SMS code." : `Enter the 6-digit code sent to +91 ${mobile.trim()} and choose a new password.`}
              </p>

              {info !== "" ? <p className="mt-3 rounded-xl bg-accent-50 px-3 py-2 text-[12px] font-semibold text-accent-600">{info}</p> : null}

              {step === "mobile" ? (
                <div className="mt-4">
                  <label htmlFor="reset-mobile" className="mb-1.5 block text-[13px] font-extrabold text-ink">Mobile number</label>
                  <input
                    id="reset-mobile"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="input !py-3"
                  />
                  <button onClick={() => { void sendOtp(); }} disabled={busy} className="btn-primary mt-3 w-full !py-3 disabled:opacity-50">
                    {busy ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</> : <><Smartphone size={16} /> Send OTP</>}
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="reset-otp" className="mb-1.5 block text-[13px] font-extrabold text-ink">OTP</label>
                    <input
                      id="reset-otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="input !py-3 !text-center !font-mono !text-lg !tracking-[0.4em]"
                    />
                  </div>
                  <div>
                    <label htmlFor="reset-pass" className="mb-1.5 block text-[13px] font-extrabold text-ink">New password</label>
                    <input id="reset-pass" type="password" autoComplete="new-password" placeholder="Min 6 characters" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="input !py-3" />
                  </div>
                  <div>
                    <label htmlFor="reset-confirm" className="mb-1.5 block text-[13px] font-extrabold text-ink">Confirm password</label>
                    <input id="reset-confirm" type="password" autoComplete="new-password" placeholder="Repeat password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="input !py-3" />
                  </div>
                  <button onClick={() => { void resetNow(); }} disabled={busy || otp.length !== 6} className="btn-primary w-full !py-3 disabled:opacity-50">
                    {busy ? <><Loader2 size={16} className="animate-spin" /> Updating…</> : <><Lock size={16} /> Set new password</>}
                  </button>
                  <div className="flex items-center justify-between">
                    <button onClick={() => { if (resendIn === 0 && !busy) void sendOtp(); }} disabled={busy || resendIn > 0} className="text-[12px] font-bold text-primary-600 hover:underline disabled:opacity-50">
                      {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                    </button>
                    <button onClick={() => { setStep("mobile"); setOtp(""); setErr(""); }} className="text-[12px] font-bold text-muted hover:text-ink">← Change number</button>
                  </div>
                </div>
              )}

              {err !== "" && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft p-3 text-[13px] font-semibold text-danger">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />{err}
                </div>
              )}

              <div id="reset-recaptcha" />
            </>
          )}
        </div>

        <Link href="/auth/login" className="mt-5 flex items-center justify-center gap-1.5 text-[13px] font-bold text-muted hover:text-primary-700">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
