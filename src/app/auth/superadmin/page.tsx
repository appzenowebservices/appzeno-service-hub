"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  ShieldEllipsis,
} from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [granted, setGranted] = useState(false);

  // Already signed in as the env-root admin? Skip the form.
  useEffect(() => {
    let cancelled = false;
    void getSession().then((session) => {
      const u = session?.user as { id?: string; role?: string } | undefined;
      if (!cancelled && u?.id === "env-superadmin" && (u.role ?? "").toUpperCase() === "ADMIN") {
        router.replace("/admin");
      }
    });
    return () => { cancelled = true; };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password) {
      setError("Enter the superadmin mobile and password.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      mobile: identifier.trim(),
      password,
      scope: "superadmin",
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid superadmin credentials. Access is limited to the environment-configured account.");
      return;
    }

    const session = await getSession();
    const sUser = session?.user as { id?: string; role?: string; name?: string; mobile?: string } | undefined;
    if (!session || !sUser || sUser.id !== "env-superadmin" || (sUser.role ?? "").toUpperCase() !== "ADMIN") {
      await signOut({ redirect: false });
      setLoading(false);
      setError("This console only accepts the environment-configured superadmin account.");
      return;
    }

    login(
      {
        id: sUser.id,
        mobile: sUser.mobile ?? identifier.trim(),
        role: "admin",
        fullName: sUser.name ?? "Super Administrator",
        email: "",
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      `nextauth-${sUser.id}`,
    );

    setGranted(true);
    window.setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 900);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050b16] px-4 py-10 font-sans">
      {/* ambient security-console backdrop */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary-600/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-32 h-[520px] w-[520px] rounded-full bg-accent-500/15 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "28px 28px" }}
      />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-7 flex items-center justify-center gap-3">
          <Image src="/logo.png" alt="ADDies" width={40} height={40} className="h-10 w-10 rounded-2xl bg-white object-contain p-0.5" priority />
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight text-white">ADDies</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-accent-300">Service Hub</span>
          </span>
        </Link>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {/* top accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-accent-400 to-danger" />

          <div className="p-7">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-300 to-accent-500 text-accent-ink shadow-lg shadow-accent-500/20">
                <ShieldEllipsis size={24} />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-100">
                <LockKeyhole size={11} className="text-accent-300" /> Restricted
              </span>
            </div>

            <h1 className="mt-4 text-[22px] font-extrabold tracking-tight text-white">Super Admin Console</h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-primary-100/70">
              Owner-only access. Credentials are verified server-side from the environment — never stored in the database.
            </p>

            {error ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-[13px] font-semibold text-rose-200">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label htmlFor="sa-mobile" className="mb-1.5 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-primary-100/80">
                  <Fingerprint size={13} className="text-accent-300" /> Admin mobile
                </label>
                <input
                  id="sa-mobile"
                  type="text"
                  inputMode="tel"
                  autoComplete="username"
                  placeholder="Environment superadmin mobile"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-semibold text-white outline-none transition placeholder:font-medium placeholder:text-white/25 focus:border-accent-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-accent-400/20"
                />
              </div>

              <div>
                <label htmlFor="sa-pass" className="mb-1.5 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-primary-100/80">
                  <KeyRound size={13} className="text-accent-300" /> Password
                </label>
                <div className="relative">
                  <input
                    id="sa-pass"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter superadmin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-[15px] font-semibold text-white outline-none transition placeholder:font-medium placeholder:text-white/25 focus:border-accent-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-accent-400/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-primary-100/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || granted}
                className="btn-accent mt-1 w-full !py-3.5 !text-[15px] shadow-lg shadow-accent-500/20 disabled:opacity-60"
              >
                {granted ? (
                  <><CheckCircle2 size={17} /> Access granted — opening console…</>
                ) : loading ? (
                  <><Loader2 size={17} className="animate-spin" /> Verifying credentials…</>
                ) : (
                  <><ShieldCheck size={17} /> Enter secure console</>
                )}
              </button>
            </form>

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-[11px] font-medium leading-relaxed text-primary-100/50">
              <LockKeyhole size={14} className="mt-0.5 shrink-0 text-accent-300/70" />
              <span>
                This door is separate from the customer, vendor and agent login. The account is defined by{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-primary-100/80">SUPERADMIN_MOBILE</code>{" "}
                and{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-primary-100/80">SUPERADMIN_PASSWORD_HASH_B64</code>.
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-[12px] font-bold text-primary-100/50 transition-colors hover:text-accent-300"
        >
          <ArrowLeft size={13} /> Back to standard login
        </Link>
      </div>

      {/* success transition */}
      {granted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050b16]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/30">
              <ShieldCheck size={30} className="text-success" />
            </span>
            <p className="mt-4 text-xl font-extrabold tracking-tight text-white">Access granted</p>
            <p className="mt-1 text-sm text-primary-100/60">Opening the operations console…</p>
            <div className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full origin-left animate-pulse rounded-full bg-gradient-to-r from-accent-400 to-primary-400" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
