"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, ShieldCheck, UserCircle, Briefcase, Building2, Crown, Loader2, AlertCircle } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { useAuthStore } from "../../../../store/authStore";
import { trpc } from "~/trpc/react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!mobile.trim() || !password.trim()) {
      setError("Please enter mobile and password.");
      return;
    }
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
    const sUser = session?.user as { id?: string; role?: string; mobile?: string } | undefined;

    let role = (sUser?.role ?? "").toUpperCase();
    let userId = sUser?.id ?? "";
    let fullName = (session?.user?.name as string) ?? "";

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
    router.push(dashMap[role] ?? "/");
    router.refresh();
  };

  const ROLE_HINTS = [
    { role: "Customer", icon: UserCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", mobile: "9876543210", pass: "Customer@123" },
    { role: "Vendor", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", mobile: "9123456789", pass: "Vendor@123" },
    { role: "City Agent", icon: Building2, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", mobile: "9988776655", pass: "Agent@123" },
    { role: "Super Admin", icon: Crown, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", mobile: "9000000001", pass: "Admin@123#" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-900 px-4 relative overflow-hidden font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-5 text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-400 text-xl font-extrabold text-accent-ink">A</span>
          <p className="mt-2 text-lg font-extrabold text-white">ADDies Service Hub</p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">Primary Blue • Secondary Slate • Accent Amber</p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/15 bg-white shadow-pop">
          <div className="h-1.5 bg-gradient-to-r from-primary-600 via-accent-400 to-success" />
          <div className="p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink">Mobile Number</label>
                <input
                  type="text"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-11"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted transition-colors hover:text-ink">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft p-3 text-xs font-semibold text-danger">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full !py-3.5">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/15 bg-white/95 p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={13} className="text-primary-600" />
            <p className="text-xs font-bold uppercase tracking-wider text-body">Demo Credentials — click to fill</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_HINTS.map(({ role, icon: Icon, color, bg, border, mobile: m, pass: p }) => (
              <button key={role} type="button"
                onClick={() => { setMobile(m); setPassword(p); setError(""); }}
                className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition-all hover:border-primary-300 hover:bg-primary-50">
                <Icon size={14} className={color} />
                <div>
                  <p className="text-xs font-extrabold text-ink">{role}</p>
                  <p className="font-mono text-[11px] text-muted">{m}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}