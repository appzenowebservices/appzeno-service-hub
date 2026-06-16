import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VendorLeadsPage        from "./VendorLeadsPage";
import VendorAcceptedJobsPage from "./VendorAcceptedJobsPage";
import VendorEarningsPage     from "./VendorEarningsPage";
import VendorCompletedJobsPage  from "./VendorCompletedJobsPage";
import VendorSubscriptionPage  from "./VendorSubscriptionPage";
import VendorReviewsPage       from "./VendorReviewsPage";
import VendorWalletPage        from "./VendorWalletPage";
import VendorServiceAreaPage   from "./VendorServiceAreaPage";
import VendorAnalyticsPage     from "./VendorAnalyticsPage";
import VendorProfileKYCPage    from "./VendorProfileKYCPage";

import {
  LayoutDashboard, Star, TrendingUp, Briefcase, Bell, User, LogOut,
  CheckCircle2, Clock, XCircle, ChevronRight, Wrench, Menu, X,
  HelpCircle, IndianRupee, ShieldCheck, BarChart2, MapPin, Settings,
  Phone, Mail, Edit3, Camera, CreditCard, BadgeCheck, AlertTriangle,
  Zap, Package, Users, Wallet
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

const MOCK_LEADS = [
  { id: "L001", service: "Plumbing - Pipe Leak", customer: "Ramesh S.",  city: "Delhi",   date: "27 Feb 2026", time: "2:00 PM",  budget: 350,  urgency: "urgent" },
  { id: "L002", service: "Electrical - Wiring",  customer: "Pooja M.",   city: "Delhi",   date: "28 Feb 2026", time: "10:00 AM", budget: 500,  urgency: "normal" },
  { id: "L003", service: "AC Service",            customer: "Amit K.",    city: "Delhi",   date: "01 Mar 2026", time: "11:00 AM", budget: 700,  urgency: "normal" },
];

const MOCK_JOBS = [
  { id: "J001", service: "Plumbing Fix",    customer: "Ravi T.",    date: "25 Feb", amount: 450, status: "completed", rating: 5 },
  { id: "J002", service: "Switch Repair",   customer: "Meena P.",   date: "24 Feb", amount: 280, status: "completed", rating: 4 },
  { id: "J003", service: "AC Gas Refill",   customer: "Suresh K.",  date: "23 Feb", amount: 800, status: "completed", rating: 5 },
  { id: "J004", service: "Pipe Fitting",    customer: "Priya S.",   date: "22 Feb", amount: 350, status: "completed", rating: 3 },
];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const NAV = [
    { label: "Dashboard",          icon: LayoutDashboard, href: "dashboard" },
    { label: "New Leads",          icon: Zap,             href: "leads",     badge: 3 },
    { label: "Accepted Jobs",      icon: CheckCircle2,    href: "accepted" },
    { label: "Completed Jobs",     icon: Package,         href: "completed" },
    { label: "Earnings",           icon: IndianRupee,     href: "earnings" },
    { label: "Wallet",             icon: Wallet,          href: "wallet" },
    { label: "Subscription",       icon: CreditCard,      href: "subscription" },
    { label: "Reviews",            icon: Star,            href: "reviews" },
    { label: "Service Area",       icon: MapPin,          href: "area" },
    { label: "Analytics",          icon: BarChart2,       href: "analytics" },
    { label: "Profile & KYC",      icon: User,            href: "profile" },
  ];

  const stats = [
    { label: "Total Jobs",    value: user?.totalJobs || 134,          icon: Briefcase,    color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Avg Rating",    value: `${user?.rating || 4.7} ⭐`,     icon: Star,         color: "text-yellow-600",  bg: "bg-yellow-50" },
    { label: "Total Earned",  value: `₹${(user?.earnings || 67500).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "New Leads",     value: 3,                                icon: Zap,          color: "text-blue-600",    bg: "bg-blue-50" },
  ];

  function handleLogout() { logout(); navigate("/"); }

  function PlaceholderTab({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon size={28} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">{label}</h3>
        <p className="text-sm text-slate-400 max-w-xs">This section is coming soon.</p>
      </div>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case "dashboard": return (
        <div className="space-y-6">
          {/* Welcome */}
          <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-full opacity-10">
              <Briefcase size={180} className="absolute -right-6 top-4" />
            </div>
            <div className="relative z-10">
              <p className="text-emerald-200 text-xs font-semibold mb-1">Vendor Dashboard</p>
              <h2 className="text-2xl font-black mb-1">Welcome, {user?.fullName?.split(" ")[0]} 👋</h2>
              <p className="text-emerald-200 text-sm mb-1">{user?.businessName || "Your Business"}</p>
              <p className="text-emerald-300 text-xs mb-4">{user?.city} · {user?.categories?.join(", ") || "Multi-service"}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab("leads")}
                  className="px-4 py-2 bg-white text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all flex items-center gap-2">
                  <Zap size={15} /> View Leads ({3})
                </button>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${user?.kycStatus === "approved" ? "bg-white/20 text-white" : "bg-amber-400/20 text-amber-200"} flex items-center gap-1.5`}>
                  {user?.kycStatus === "approved" ? <><BadgeCheck size={13} /> KYC Verified</> : <><AlertTriangle size={13} /> KYC Pending</>}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <Icon size={18} className={s.color} />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* New Leads + Recent Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">New Leads</h3>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-slate-50">
                {MOCK_LEADS.map((lead) => (
                  <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{lead.service}</p>
                        <p className="text-xs text-slate-500">{lead.customer} · {lead.city}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{lead.date} · {lead.time}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-emerald-600">₹{lead.budget}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                          ${lead.urgency === "urgent" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                          {lead.urgency}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">Accept</button>
                      <button className="flex-1 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">Pass</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Recent Completed</h3>
                <button onClick={() => setActiveTab("completed")} className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  All <ChevronRight size={13} />
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {MOCK_JOBS.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{job.service}</p>
                      <p className="text-xs text-slate-400">{job.customer} · {job.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-800">₹{job.amount}</p>
                      <div className="flex justify-end">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={10} className={s <= job.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription Banner */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-5 text-white flex items-center justify-between">
            <div>
              <p className="font-black text-lg">Subscription: {user?.subscriptionPlan || "Premium"}</p>
              <p className="text-violet-200 text-sm">Access to all leads · Priority listing · Unlimited bookings</p>
            </div>
            <button onClick={() => setActiveTab("subscription")}
              className="px-4 py-2 bg-white text-violet-700 text-sm font-bold rounded-xl hover:bg-violet-50 transition-all flex-shrink-0">
              Manage
            </button>
          </div>
        </div>
      );

      case "profile": return <VendorProfileKYCPage />;


      case "leads":        return <VendorLeadsPage />;
      case "accepted":     return <VendorAcceptedJobsPage />;
      case "completed":    return <VendorCompletedJobsPage />;
      case "earnings":     return <VendorEarningsPage />;
      case "wallet":       return <VendorWalletPage />;
      case "subscription": return <VendorSubscriptionPage />;
      case "reviews":      return <VendorReviewsPage />;
      case "area":         return <VendorServiceAreaPage />;
      case "analytics":    return <VendorAnalyticsPage />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 bg-white border-r border-slate-200
        flex flex-col transition-all duration-300 shadow-lg lg:shadow-none lg:sticky lg:top-0 lg:h-screen
        ${sidebarOpen ? "w-64" : "w-0 lg:w-16 overflow-hidden"}`}>
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #27AE60, #1E8449)" }}>A</div>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-black text-slate-800 leading-none">ADDies</p>
              <p className="text-2xs text-slate-400 leading-none tracking-wide">Vendor Portal</p>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-100 bg-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.avatar || user?.fullName?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-emerald-600 font-semibold">Vendor · {user?.subscriptionPlan || "Premium"}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.href;
            return (
              <button key={item.href} onClick={() => setActiveTab(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-left
                  ${active ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}>
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center
                        ${active ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-base font-bold text-slate-800 flex-1 capitalize">
            {NAV.find((n) => n.href === activeTab)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={() => setActiveTab("profile")}
              className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.avatar || user?.fullName?.charAt(0)}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{renderContent()}</main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
