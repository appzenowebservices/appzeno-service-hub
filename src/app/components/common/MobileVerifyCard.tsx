"use client";

import { useState } from "react";
import { BadgeCheck, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { confirmPhoneCode, startPhoneVerification } from "~/firebase/phone";
import { trpc } from "~/trpc/react";

/**
 * Mobile number verification via Firebase Phone Auth (SMS OTP).
 * Reusable across customer/vendor/agent consoles.
 */
export default function MobileVerifyCard({
  mobile,
  verified,
  onVerified,
}: {
  mobile: string;
  verified: boolean;
  onVerified?: () => void;
}) {
  const [stage, setStage] = useState<"idle" | "sending" | "otp" | "verifying">("idle");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(verified);

  const verify = trpc.users.verifyMobile.useMutation({
    onSuccess: () => {
      setDone(true);
      setStage("idle");
      setOtp("");
      onVerified?.();
    },
    onError: (e) => {
      setErr(e.message);
      setStage("otp");
    },
  });

  const send = async () => {
    setErr("");
    setStage("sending");
    try {
      await startPhoneVerification(mobile, "addies-recaptcha");
      setStage("otp");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send the OTP. Try again.");
      setStage("idle");
    }
  };

  const confirm = async () => {
    setErr("");
    setStage("verifying");
    try {
      const idToken = await confirmPhoneCode(otp);
      verify.mutate({ idToken });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid or expired code.");
      setStage("otp");
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"><Smartphone size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-ink">Mobile number</p>
          <p className="text-xs font-medium text-muted">+91 {mobile}</p>
        </div>
        {done ? (
          <span className="chip chip-success shrink-0"><BadgeCheck size={12} /> Verified</span>
        ) : stage === "idle" ? (
          <button onClick={() => { void send(); }} className="btn-primary shrink-0 !px-4 !py-1.5 !text-xs">Verify</button>
        ) : null}
      </div>

      {stage === "sending" ? (
        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted"><Loader2 size={13} className="animate-spin" /> Sending OTP…</p>
      ) : null}

      {stage === "otp" || stage === "verifying" ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-body">Enter the 6-digit code sent to +91 {mobile}</p>
          <div className="mt-2 flex gap-2">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              className="input flex-1 !text-center !font-mono !text-lg !tracking-[0.4em]"
            />
            <button onClick={() => { void confirm(); }} disabled={otp.length !== 6 || stage === "verifying"} className="btn-primary shrink-0 !px-5 disabled:opacity-50">
              {stage === "verifying" ? <Loader2 size={15} className="animate-spin" /> : "Confirm"}
            </button>
          </div>
          <button onClick={() => { void send(); }} className="mt-2 text-[11px] font-bold text-primary-600 hover:underline">Resend OTP</button>
        </div>
      ) : null}

      {err ? <p className="mt-2 rounded-xl bg-danger-soft px-3 py-2 text-[11px] font-semibold text-danger">{err}</p> : null}

      {!done && stage === "idle" ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-muted"><ShieldCheck size={12} /> We&apos;ll send an SMS code to confirm it&apos;s you.</p>
      ) : null}

      <div id="addies-recaptcha" />
    </div>
  );
}
