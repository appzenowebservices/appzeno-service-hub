// src/pages/agent/AgentDashboard.tsx
//
// App.tsx mein add karo:
//   import AgentDashboard from "./pages/agent/AgentDashboard";
//   <Route path="/agent" element={<ProtectedRoute allowedRoles={["agent"]}><AgentDashboard /></ProtectedRoute>} />

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CheckSquare, ClipboardList,
  Scale, IndianRupee, BarChart2, Bell, User, LogOut,
  Menu, X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import AgentDashboardHome     from "./dashboard/AgentDashboardHome";
import VendorManagementPage   from "./dashboard/VendorManagementPage";
import VendorApprovalsPage    from "./dashboard/VendorApprovalsPage";
import LeadManagementPage     from "./dashboard/LeadManagementPage";
import DisputeResolutionPage  from "./dashboard/DisputeResolutionPage";
import CommissionPage         from "./dashboard/CommissionPage";
import CityAnalyticsPage      from "./dashboard/CityAnalyticsPage";
import NotificationsPage      from "./dashboard/NotificationsPage";
import AgentProfilePage       from "./dashboard/AgentProfilePage";

// ─── Nav items ────────────────────────────────────────────────────────────────
interface NavItem {
  key:    string;
  label:  string;
  icon:   React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",     label: "Dashboard",         icon: LayoutDashboard },
  { key: "vendors",       label: "Vendor Management", icon: Users,        badge: 0 },
  { key: "approvals",     label: "Approvals",         icon: CheckSquare,  badge: 4 },
  { key: "leads",         label: "Lead Management",   icon: ClipboardList },
  { key: "disputes",      label: "Disputes",          icon: Scale,        badge: 2 },
  { key: "commission",    label: "Commission",        icon: IndianRupee },
  { key: "analytics",     label: "City Analytics",    icon: BarChart2 },
  { key: "notifications", label: "Notifications",     icon: Bell,         badge: 5 },
  { key: "profile",       label: "Profile",           icon: User },
];

// ─── Placeholder for unbuilt tabs ─────────────────────────────────────────────
function PlaceholderTab({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-violet-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">{label}</h3>
      <p className="text-sm text-slate-400 max-w-xs">This section is coming soon.</p>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const navigate                       = useNavigate();
  const { user, logout }               = useAuthStore();
  const [activeTab,   setActiveTab]    = useState("dashboard");
  const [sidebarOpen, setSidebarOpen]  = useState(true);

  function handleLogout() {
    logout();
    navigate("/");
  }

  function renderContent() {
    switch (activeTab) {
      case "dashboard":     return <AgentDashboardHome />;
      case "vendors":       return <VendorManagementPage />;
      case "approvals":     return <VendorApprovalsPage />;
      case "leads":         return <LeadManagementPage />;
      case "disputes":      return <DisputeResolutionPage />;
      case "commission":    return <CommissionPage />;
      case "analytics":     return <CityAnalyticsPage />;
      case "notifications": return <NotificationsPage onNavigate={(tab) => setActiveTab(tab)} />;
      case "profile":       return <AgentProfilePage />;
      default:              return <AgentDashboardHome />;
    }
  }

  const activeNav = NAV_ITEMS.find(n => n.key === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 bg-white border-r border-slate-200
        flex flex-col transition-all duration-300 shadow-lg lg:shadow-none lg:sticky lg:top-0 lg:h-screen
        ${sidebarOpen ? "w-64" : "w-0 lg:w-16 overflow-hidden"}`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}>
            A
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-black text-slate-800 leading-none">ADDies</p>
              <p className="text-xs text-slate-400 leading-none tracking-wide mt-0.5">Agent Portal</p>
            </div>
          )}
        </div>

        {/* User badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-100 bg-violet-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.avatar || user?.fullName?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-violet-600 font-semibold">
                  {(user as any)?.assignedCity || user?.city || "City"} Agent
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon   = item.icon;
            const active = activeTab === item.key;
            return (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-left
                  ${active
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center
                        ${active ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600"}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center gap-4 px-4 lg:px-6
          flex-shrink-0 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(s => !s)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-base font-bold text-slate-800 flex-1">
            {activeNav?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={() => setActiveTab("profile")}
              className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.avatar || user?.fullName?.charAt(0) || "A"}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
