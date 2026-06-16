import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, ShieldCheck, UserCircle, Briefcase, Building2, Crown, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import PublicLayout from "../components/layout/PublicLayout";

// ─── MOCK USERS (demo credentials) ─────────────────────────────────────────
const MOCK_USERS = [
  {
    username: "customer1",
    password: "Customer@123",
    user: {
      id: "C001",
      fullName: "Priya Sharma",
      email: "priya@example.com",
      mobile: "9876543210",
      role: "customer" as const,
      registrationId: "ADDIESCUST2602260001",
      city: "Lucknow",
      state: "Uttar Pradesh",
      address: "12, MG Road, Hazratganj",
      languages: ["Hindi", "English"],
      createdAt: "2026-01-15",
      isActive: true,
      walletBalance: 250,
      totalBookings: 8,
      avatar: "PS",
    },
  },
  {
    username: "vendor1",
    password: "Vendor@123",
    user: {
      id: "V001",
      fullName: "Rajesh Kumar",
      email: "rajesh@example.com",
      mobile: "9123456789",
      role: "vendor" as const,
      registrationId: "ADDIESVEND2602260001",
      city: "Delhi",
      state: "Delhi",
      address: "45, Lajpat Nagar, New Delhi",
      businessName: "Kumar Home Services",
      experience: "5",
      categories: ["Plumbing", "Electrical"],
      languages: ["Hindi", "English"],
      createdAt: "2025-11-20",
      isActive: true,
      rating: 4.7,
      totalJobs: 134,
      earnings: 67500,
      subscriptionPlan: "Premium",
      kycStatus: "approved",
      avatar: "RK",
    },
  },
  {
    username: "agent1",
    password: "Agent@123",
    user: {
      id: "A001",
      fullName: "Sunita Verma",
      email: "sunita@example.com",
      mobile: "9988776655",
      role: "agent" as const,
      registrationId: "ADDIESAGEN2602260001",
      city: "Jaipur",
      state: "Rajasthan",
      address: "78, Civil Lines, Jaipur",
      languages: ["Hindi", "English", "Rajasthani"],
      createdAt: "2025-09-10",
      isActive: true,
      assignedCity: "Jaipur",
      totalVendors: 42,
      commissionEarned: 18900,
      commissionShare: "5",
      avatar: "SV",
    },
  },
  {
    username: "superadmin",
    password: "Admin@123#",
    user: {
      id: "SA001",
      fullName: "Super Administrator",
      email: "admin@addies.in",
      mobile: "9000000001",
      role: "admin" as const,
      registrationId: "ADDIESADMIN000001",
      city: "Lucknow",
      state: "Uttar Pradesh",
      address: "ADDies HQ, Lucknow, UP",
      languages: ["Hindi", "English"],
      createdAt: "2025-01-01",
      isActive: true,
      isSuperAdmin: true,
      avatar: "SA",
    },
  },
];

const ROLE_HINTS = [
  { role: "Customer",     icon: UserCircle,  color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   user: "customer1",  pass: "Customer@123" },
  { role: "Vendor",       icon: Briefcase,   color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200", user: "vendor1",    pass: "Vendor@123" },
  { role: "City Agent",   icon: Building2,   color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200",  user: "agent1",     pass: "Agent@123" },
  { role: "Super Admin",  icon: Crown,       color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",   user: "superadmin", pass: "Admin@123#" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location  = useLocation();
  const { login } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  function handleQuickFill(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    const found = MOCK_USERS.find(
      (u) => u.username === username.trim() && u.password === password
    );

    setLoading(false);
    if (!found) {
      setError("Invalid username or password. Try the demo credentials below.");
      return;
    }

    login(found.user as any, `mock-token-${found.user.id}`);

    // location.state carries: { redirect?, openTab?, citySlug?, categorySlug? }
    // Set by ServiceDetailPage: { redirect:"/customer", openTab:"book", categorySlug, citySlug }
    const ls = (location.state ?? {}) as {
      redirect?:     string;
      openTab?:      string;
      citySlug?:     string;
      categorySlug?: string;
    };

    const dashMap: Record<string, string> = {
      customer: "/customer", vendor: "/vendor", agent: "/agent", admin: "/admin",
    };

    navigate(ls.redirect ?? dashMap[found.user.role] ?? "/", {
      replace: true,
      state: { openTab: ls.openTab, citySlug: ls.citySlug, categorySlug: ls.categorySlug },
    });
  }

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-800 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl">
          <div className="w-full h-full border-white/5 rounded-3xl" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        {/* <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl"
              style={{ background: "linear-gradient(135deg, #2E86C1, #1A5276)" }}>
              A
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-white leading-none block">ADDies</span>
              <span className="text-xs font-semibold text-primary-300 leading-none tracking-widest">SERVICE HUB</span>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-white mt-2">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div> */}

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />
          
          <div className="p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500
                             focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500
                               focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Forgot password */}
              <div className="flex justify-end -mt-2">
                <Link to="/forgot-password" className="text-xs text-primary-300 hover:text-primary-200 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-sm
                           hover:from-primary-600 hover:to-primary-700 disabled:opacity-60 transition-all
                           flex items-center justify-center gap-2 shadow-lg">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
              </button>

              <p className="text-center text-xs text-slate-400">
                New user?{" "}
                <Link to="/register" className="text-primary-300 font-semibold hover:text-primary-200 hover:underline">
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={13} className="text-slate-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demo Credentials — Click to Fill</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_HINTS.map(({ role, icon: Icon, color, bg, border, user: u, pass: p }) => (
              <button key={role} type="button"
                onClick={() => handleQuickFill(u, p)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${border} ${bg}/20 hover:${bg}/40 transition-all text-left group`}>
                <Icon size={14} className={color} />
                <div>
                  <p className={`text-xs font-bold ${color}`}>{role}</p>
                  <p className="text-2xs text-slate-500 font-mono">{u}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}
