"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, ShieldCheck, UserCircle, Briefcase, Building2, Crown, Loader2, AlertCircle, ArrowLeft, BadgeCheck, Wallet, Star, CheckCircle2 } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { useAuthStore } from "../../../../store/authStore";
import { trpc } from "~/trpc/react";

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
  const [welcome, setWelcome] = useState<{ name: string; dest: string } | null>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setMobile(saved);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!mobile.trim() || !password.trim()) {
      setError("Please enter mobile and password.");
      return;
    }
    setLoading(true);

    // Pre-check credentials via tRPC first so we can tell "unverified email"
    // apart from "wrong password" (NextAuth only returns a generic error).
    // A failed pre-check does NOT stop the login: DB-unknown accounts (like
    // the env-root superadmin) are decided by authorize() itself.
    try {
      const check = await utils.auth.login.fetch({ mobile: mobile.trim(), password });
      if (!check.isVerified) {
        setLoading(false);
        setError("Please verify your email first — check your inbox for the confirmation link, then sign in.");
        return;
      }
    } catch {
      // fall through to signIn — authorize() is the final authority
    }

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

  const ROLE_HINTS = [
    { role: "Customer", icon: UserCircle, color: "text-blue-600", bg: "bg-blue-50", mobile: "9876543210", pass: "Customer@123" },
    { role: "Vendor", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50", mobile: "9123456789", pass: "Vendor@123" },
    { role: "City Agent", icon: Building2, color: "text-violet-600", bg: "bg-violet-50", mobile: "9988776655", pass: "Agent@123" },
    { role: "Super Admin", icon: Crown, color: "text-amber-600", bg: "bg-amber-50", mobile: "9000000001", pass: "Admin@123#" },
  ];

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

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <div>
              <label htmlFor="login-mobile" className="mb-1.5 block text-[13px] font-extrabold text-ink">Mobile number / Email</label>
              <input
                id="login-mobile"
                type="text"
                inputMode="tel"
                autoComplete="username"
                placeholder="e.g. 98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="input !py-3 !text-[15px]"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-pass" className="block text-[13px] font-extrabold text-ink">Password</label>
                <span className="cursor-not-allowed text-xs font-bold text-muted" title="Password reset over OTP — coming soon">Forgot password?</span>
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

          <div className="mt-6 flex items-center gap-3 text-xs font-bold text-muted">
            <span className="h-px flex-1 bg-line" /> NEW TO ADDIES? <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Link href="/auth/register" className="btn-primary !py-3">Join as customer</Link>
            <Link href="/auth/register?role=vendor" className="btn-ghost !py-3">Become a pro</Link>
          </div>

          <details className="card group mt-5 !p-0">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-[13px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
              <ShieldCheck size={15} className="text-primary-600" />
              Demo accounts — click to autofill
              <span className="ml-auto text-lg font-bold leading-none text-primary-600 group-open:rotate-45">＋</span>
            </summary>
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              {ROLE_HINTS.map(({ role, icon: Icon, color, bg, mobile: m, pass: p }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setMobile(m); setPassword(p); setError(""); }}
                  className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition-all hover:border-primary-300 hover:bg-primary-50"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}><Icon size={15} className={color} /></span>
                  <span>
                    <span className="block text-xs font-extrabold text-ink">{role}</span>
                    <span className="block font-mono text-[11px] text-muted">{m}</span>
                  </span>
                </button>
              ))}
            </div>
          </details>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted">
            Protected by OTP-verified accounts • By signing in you agree to our{" "}
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
