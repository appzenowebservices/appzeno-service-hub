"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, ShieldCheck, Loader2, AlertCircle, ArrowLeft, BadgeCheck, Wallet, Star, CheckCircle2, Smartphone } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { useAuthStore } from "../../../../store/authStore";
import { trpc } from "~/trpc/react";
import { confirmPhoneCode, phoneAuthErrorMessage, startPhoneVerification } from "~/firebase/phone";

const REMEMBER_KEY = "addies:remember-mobile";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [welcome, setWelcome] = useState<{ name: string; dest: string } | null>(null);
  const utils = trpc.useUtils();
  const loginCheck = trpc.auth.login.useMutation();
  const verifyOtpMutation = trpc.auth.verifyMobileOtp.useMutation();

  // ── login-time mobile verification (Firebase Phone Auth OTP) ──
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpErr, setOtpErr] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [otpMode, setOtpMode] = useState<"login" | "signup">("login");
  const [otpDone, setOtpDone] = useState(false);
  const otpBusyRef = useRef(false);
  const pendingSendRef = useRef(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setMobile(saved);
      setRemember(true);
    }
    const q = new URLSearchParams(window.location.search);
    if (q.get("registered") === "1") {
      setInfo("Account created! Sign in with Google using your email.");
    } else if (q.get("reset") === "1") {
      setInfo("Password updated — sign in with your new password.");
    }
  }, []);

  const proceedSignIn = async () => {
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      mobile: mobile.trim(),
      password,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid mobile or password. Try demo credentials below.");
      return;
    }

    // NextAuth signIn with redirect:false only returns {ok,error,url} — fetch real session for role
    const session = await getSession();
    const sUser = session?.user;

    let role = (sUser?.role ?? "").toUpperCase();
    let userId = sUser?.id ?? "";
    let fullName = sUser?.name ?? "";

    // Mobile verification is on hold — e-mail confirmation is the gate, and it
    // is already enforced by `auth.login` (isVerified). Do not block sign-in
    // for an unverified mobile number.

    // Fallback: fetch via public tRPC lookup if session race
    if (!role) {
      try {
        const lookup = await utils.users.getByMobile.fetch({ mobile: mobile.trim() });
        role = (lookup?.role ?? "").toUpperCase();
        userId = lookup?.id ?? "";
        fullName = lookup?.fullName ?? "";
      } catch {
        role = "";
      }
    }

    setLoading(false);

    if (!role) {
      setError("Signed in but session not ready. Please retry.");
      return;
    }

    if (remember) window.localStorage.setItem(REMEMBER_KEY, mobile.trim());
    else window.localStorage.removeItem(REMEMBER_KEY);

    const roleLower = role.toLowerCase() as "customer" | "vendor" | "agent" | "admin";
    login(
      { id: userId, mobile: mobile.trim(), role: roleLower, fullName, email: "", isVerified: true, isActive: true, createdAt: new Date().toISOString() },
      `nextauth-${userId}`
    );

    const dashMap: Record<string, string> = {
      CUSTOMER: "/customer/dashboard",
      VENDOR: "/vendor",
      AGENT: "/agent",
      ADMIN: "/admin",
    };
    const dest = dashMap[role] ?? "/";
    // Success beat: show a welcome overlay momentarily instead of a hard cut.
    setWelcome({ name: fullName.trim() === "" ? "Welcome back" : fullName.trim(), dest });
    window.setTimeout(() => {
      router.push(dest);
      router.refresh();
    }, 1400);
  };

  const sendOtp = async () => {
    if (otpBusyRef.current) return;
    otpBusyRef.current = true;
    setOtpErr("");
    setOtpSending(true);
    try {
      await startPhoneVerification(mobile.trim(), "login-recaptcha");
      setOtpSent(true);
      setResendIn(30);
    } catch (e) {
      setOtpSent(false);
      setOtpErr(phoneAuthErrorMessage(e));
    } finally {
      otpBusyRef.current = false;
      setOtpSending(false);
    }
  };

  // Fire the SMS once the panel (and its reCAPTCHA container) is mounted.
  useEffect(() => {
    if (otpOpen && pendingSendRef.current) {
      pendingSendRef.current = false;
      void sendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpOpen]);

  const openOtp = (mode: "login" | "signup") => {
    setOtpMode(mode);
    setOtpOpen(true);
    setOtpCode("");
    setOtpErr("");
    setOtpDone(false);
    pendingSendRef.current = true;
  };

  const confirmOtp = async () => {
    setOtpErr("");
    setOtpVerifying(true);
    try {
      const idToken = await confirmPhoneCode(otpCode);
      if (otpMode === "signup") {
        // No DB account yet — the number is verified; continue to registration.
        setOtpDone(true);
        return;
      }
      await verifyOtpMutation.mutateAsync({ mobile: mobile.trim(), password, idToken });
      setOtpOpen(false);
      await proceedSignIn();
    } catch (e) {
      const code = (e as { code?: string } | null)?.code ?? "";
      setOtpErr(code.startsWith("auth/") ? phoneAuthErrorMessage(e) : (e instanceof Error && e.message) || "Verification failed. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const skipOtp = () => {
    setOtpOpen(false);
    setOtpErr("");
    setOtpDone(false);
    if (otpMode === "login") void proceedSignIn();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!mobile.trim() || !password.trim()) {
      setError("Please enter mobile and password.");
      return;
    }
    setLoading(true);

    // Ask the server why a login would fail so we can drive the right UX
    // (env superadmin, blocked, wrong password, unverified email, unknown number).
    try {
      const check = await loginCheck.mutateAsync({ mobile: mobile.trim(), password });
      if (!check.ok) {
        setLoading(false);
        if (check.reason === "ENV_ADMIN") {
          // The env-root superadmin has its own secured console — never sign
          // it in through the customer/vendor/agent login page.
          setLoading(false);
          router.push("/auth/superadmin");
          return;
        }
        if (check.reason === "BLOCKED") {
          setError(check.message ?? "Account blocked. Contact support.");
          return;
        }
        if (check.reason === "EMAIL_UNVERIFIED") {
          setError("Please verify your email first — check your inbox for the confirmation link, then sign in.");
          return;
        }
        if (check.reason === "WRONG_PASSWORD") {
          setError("Incorrect password. Please try again.");
          return;
        }
        if (check.reason === "NO_PASSWORD") {
          setError("This account has no password — sign in with Google using your account email.");
          return;
        }
        // NO_ACCOUNT: no OTP gate (mobile verification is on hold) — send the
        // visitor to registration.
        setError("No account found with these details. Tap “Join as customer” below to create one.");
        return;
      }

      // Mobile verification is on hold — proceed straight to NextAuth. E-mail
      // verification is already enforced inside `auth.login`.
    } catch {
      // Pre-check unavailable — let NextAuth decide.
    }

    await proceedSignIn();
  };

  return (
    <div className="grid min-h-screen bg-white font-sans lg:grid-cols-[1.05fr_1fr]">
      {/* ── Left: brand panel ── */}
      <aside className="relative hidden overflow-hidden bg-primary-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-primary-500/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-accent-400/20 blur-3xl" />
        {/* faint house-grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "26px 26px" }}
        />

        <Link href="/" className="relative flex items-center gap-3">
          <Image src="/logo.png" alt="ADDies" width={44} height={44} className="h-11 w-11 rounded-2xl bg-white object-contain p-0.5" priority />
          <span className="leading-none">
            <span className="block text-xl font-extrabold tracking-tight">ADDies</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-accent-200">Service Hub</span>
          </span>
        </Link>

        <div className="relative max-w-lg">
          <p className="eyebrow !bg-white/10 !text-accent-200">★ 4.8 • 10+ cities • 2,000+ verified pros</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl">
            Ghar ka har kaam, <span className="text-accent-300">one login away.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-primary-100">
            Track bookings live, get upfront pricing, chat with your pro and raise re-service requests — all from your dashboard.
          </p>
          <ul className="mt-7 space-y-3.5">
            {[
              { icon: BadgeCheck, t: "Verified pros only", d: "KYC + background-checked experts at your door" },
              { icon: Wallet, t: "Fixed, upfront pricing", d: "Digital invoice. No bargaining, no surprises" },
              { icon: ShieldCheck, t: "Up to 30-day warranty", d: "Free re-visit or refund on workmanship" },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur"><Icon size={18} className="text-accent-300" /></span>
                <span>
                  <span className="block text-[15px] font-extrabold">{t}</span>
                  <span className="block text-[13px] text-primary-200">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="flex items-center gap-1 text-sm font-bold text-accent-300">{"★".repeat(5)} <span className="ml-1 font-semibold text-white/70">Verified booking</span></p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/90">“AC service done in 50 minutes, technician showed cooling before/after. This is how home services should feel.”</p>
            <p className="mt-2 text-xs font-extrabold">Priya Sharma <span className="font-medium text-white/60">• Lucknow</span></p>
          </div>
          <div className="mt-4 flex items-center gap-5 text-[13px] font-semibold text-primary-100">
            <span><b className="text-lg font-extrabold text-white">50k+</b> bookings</span>
            <span><b className="text-lg font-extrabold text-white">4.8<Star size={13} className="mb-0.5 inline text-accent-300" /></b> rated</span>
            <span><b className="text-lg font-extrabold text-white">10</b> cities live</span>
          </div>
        </div>
      </aside>

      {/* ── Right: form panel ── */}
      <main className="flex items-center justify-center bg-surface px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* mobile brand */}
          <Link href="/" className="mb-6 flex items-center gap-2.5 lg:hidden">
            <Image src="/logo.png" alt="ADDies" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="leading-none">
              <span className="block text-[17px] font-extrabold tracking-tight text-ink">ADDies</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">Service Hub</span>
            </span>
          </Link>
          <Link href="/" className="mb-6 hidden items-center gap-1.5 text-[13px] font-bold text-muted transition-colors hover:text-primary-700 lg:inline-flex">
            <ArrowLeft size={14} /> Back to home
          </Link>

          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Welcome back 👋</h2>
          <p className="sub mt-1.5">Sign in to track bookings, pay & rate your pro.</p>

          {info !== "" ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-success/20 bg-success-soft p-3 text-[13px] font-semibold text-success">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
              {info}
            </div>
          ) : null}

          {otpOpen ? (
            <div className="mt-7">
              <div className="card !p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"><Smartphone size={20} /></span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-ink">Verify your mobile</p>
                    <p className="truncate text-xs font-medium text-muted">
                      {otpDone
                        ? `+91 ${mobile.trim()} is verified`
                        : otpSent
                          ? `Enter the 6-digit code sent to +91 ${mobile.trim()}`
                          : otpMode === "signup"
                            ? `No account for +91 ${mobile.trim()} yet — verify it to create one.`
                            : `We'll SMS a code to +91 ${mobile.trim()}`}
                    </p>
                  </div>
                </div>

                {otpErr !== "" ? (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft p-3 text-[13px] font-semibold text-danger">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    {otpErr}
                  </div>
                ) : null}

                {otpDone ? (
                  <div className="mt-4">
                    <p className="rounded-xl bg-success-soft px-3 py-2.5 text-[13px] font-bold text-success">
                      ✓ Number verified — no account exists yet.
                    </p>
                    <Link href={`/auth/register?role=customer&mobile=${mobile.trim()}`} className="btn-primary mt-3 w-full !py-3">
                      Create your account
                    </Link>
                  </div>
                ) : !otpSent ? (
                  <button onClick={() => { void sendOtp(); }} disabled={otpSending} className="btn-primary mt-4 w-full !py-3 disabled:opacity-50">
                    {otpSending ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</> : <><Smartphone size={16} /> Send OTP</>}
                  </button>
                ) : (
                  <>
                    <div className="mt-4 flex gap-2">
                      <input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="••••••"
                        className="input flex-1 !text-center !font-mono !text-lg !tracking-[0.4em]"
                      />
                      <button onClick={() => { void confirmOtp(); }} disabled={otpCode.length !== 6 || otpVerifying} className="btn-primary shrink-0 !px-5 disabled:opacity-50">
                        {otpVerifying ? <Loader2 size={16} className="animate-spin" /> : <><BadgeCheck size={16} /> Verify</>}
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <button onClick={() => { if (resendIn === 0 && !otpSending) void sendOtp(); }} disabled={otpSending || resendIn > 0} className="text-[12px] font-bold text-primary-600 hover:underline disabled:opacity-50">
                        {otpSending ? "Sending…" : resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                      </button>
                      <button onClick={() => { setOtpOpen(false); setOtpErr(""); }} className="text-[12px] font-bold text-muted hover:text-ink">← Use another account</button>
                    </div>
                  </>
                )}

                <div id="login-recaptcha" />
              </div>

              <button onClick={skipOtp} className="btn-ghost mt-3 w-full !py-3 !text-xs">
                {otpMode === "login" ? "Skip for now — sign in without verifying" : "← Back to sign in"}
              </button>
              {otpMode === "login" && !otpDone ? (
                <p className="mt-2 text-center text-[11px] font-medium text-muted">You can verify anytime from your dashboard.</p>
              ) : null}
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <div>
              <label htmlFor="login-mobile" className="mb-1.5 block text-[13px] font-extrabold text-ink">Mobile number / Email</label>
              <input
                id="login-mobile"
                type="text"
                inputMode="tel"
                autoComplete="username"
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={(e) => {
                  const raw = e.target.value;
                  // Phone entry → digits only, max 10. Email entry stays as typed.
                  if (raw === "" || /^\d/.test(raw)) {
                    setMobile(raw.replace(/\D/g, "").slice(0, 10));
                  } else {
                    setMobile(raw);
                  }
                }}
                className="input !py-3 !text-[15px]"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-pass" className="block text-[13px] font-extrabold text-ink">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-bold text-primary-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  id="login-pass"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !py-3 !text-[15px] pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-semibold text-body">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-primary-600"
              />
              Remember my mobile on this device
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft p-3 text-[13px] font-semibold text-danger">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 !text-[15px]">
              {loading ? <><Loader2 size={17} className="animate-spin" /> Signing in…</> : <><LogIn size={17} /> Sign In</>}
            </button>
          </form>
          )}

          {!otpOpen ? (
            <>
              <div className="mt-4 flex items-center gap-3 text-xs font-bold text-muted">
                <span className="h-px flex-1 bg-line" /> OR <span className="h-px flex-1 bg-line" />
              </div>
              <button
                type="button"
                onClick={() => { setError(""); void signIn("google", { callbackUrl: "/auth/google" }); }}
                className="btn-ghost mt-3 flex w-full items-center justify-center gap-2.5 !py-3"
              >
                <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.5 13.3l7.8 6.1C12.2 13.6 17.6 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10 7.1-17.5z" />
                  <path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z" />
                  <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.2-7.7 2.2-6.4 0-11.8-4.1-13.7-9.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
                </svg>
                Continue with Google
              </button>
              <p className="mt-2 text-center text-[11px] font-medium text-muted">Use the Google email linked to your ADDies account.</p>
            </>
          ) : null}

          <div className="mt-6 flex items-center gap-3 text-xs font-bold text-muted">
            <span className="h-px flex-1 bg-line" /> NEW TO ADDIES? <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Link href="/auth/register" className="btn-primary !py-3">Join as customer</Link>
            <Link href="/auth/register?role=vendor" className="btn-ghost !py-3">Become a pro</Link>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted">
            Protected by e-mail verified accounts • By signing in you agree to our{" "}
            <Link href="/terms" className="font-bold text-primary-600 hover:underline">Terms</Link> &{" "}
            <Link href="/privacy" className="font-bold text-primary-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </main>

      {/* ── success overlay ── */}
      {welcome ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-pop">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
              <CheckCircle2 size={32} className="text-success" />
            </span>
            <p className="mt-4 text-xl font-extrabold tracking-tight text-ink">Welcome back, {welcome.name}!</p>
            <p className="sub mt-1">Signed in successfully — taking you to your dashboard…</p>
            <div className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-surface">
              <div className="h-full w-full origin-left animate-pulse rounded-full bg-gradient-to-r from-primary-600 to-accent-400" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
