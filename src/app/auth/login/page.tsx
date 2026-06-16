"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, ShieldCheck, UserCircle, Briefcase, Building2, Crown, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useAuthStore } from "../../../../store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    login(
      { id: result?.id ?? "", mobile: mobile.trim(), role: (result?.role as any) ?? "customer", fullName: "", email: "", isVerified: false, isActive: true, createdAt: "" },
      result?.id ?? ""
    );

    const dashMap: Record<string, string> = {
      customer: "/customer",
      vendor: "/vendor",
      agent: "/agent",
      admin: "/admin",
    };
    router.push(dashMap[result?.role ?? "customer"] ?? "/");
  };

  const ROLE_HINTS = [
    { role: "Customer", icon: UserCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", mobile: "9876543210", pass: "Customer@123" },
    { role: "Vendor", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", mobile: "9123456789", pass: "Vendor@123" },
    { role: "City Agent", icon: Building2, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", mobile: "9988776655", pass: "Agent@123" },
    { role: "Super Admin", icon: Crown, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", mobile: "9000000001", pass: "Admin@123#" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-800 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />
          <div className="p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number</label>
                <input
                  type="text"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-sm hover:from-primary-600 hover:to-primary-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={13} className="text-slate-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demo Credentials</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_HINTS.map(({ role, icon: Icon, color, bg, border, mobile: m, pass: p }) => (
              <button key={role} type="button"
                onClick={() => { setMobile(m); setPassword(p); setError(""); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${border} ${bg}/20 hover:${bg}/40 transition-all text-left group`}>
                <Icon size={14} className={color} />
                <div>
                  <p className={`text-xs font-bold ${color}`}>{role}</p>
                  <p className="text-2xs text-slate-500 font-mono">{m}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}