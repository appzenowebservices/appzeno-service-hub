// src/pages/admin/AdminDashboard.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, UserCheck, FolderOpen,
  MapPin, IndianRupee, CreditCard, Scale, BarChart2,
  Bell, Settings, LogOut, Menu, X, Search, Shield,
  Wallet, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import AdminDashboardHome    from "./dashboard/AdminDashboardHome";
import UserManagementPage   from "./dashboard/UserManagementPage";
import VendorControlPage    from "./dashboard/VendorControlPage";
import AgentManagementPage  from "./dashboard/AgentManagementPage";
import CategoriesPage       from "./dashboard/CategoriesPage";
import CitiesPage           from "./dashboard/CitiesPage";
import SubscriptionsPage    from "./dashboard/SubscriptionsPage";
import FinancePage          from "./dashboard/FinancePage";
import PayoutsPage          from "./dashboard/PayoutsPage";
import AnalyticsPage        from "./dashboard/AnalyticsPage";
import DisputesPage         from "./dashboard/DisputesPage";
import NotificationsPage    from "./dashboard/NotificationsPage";
import SettingsPage         from "./dashboard/SettingsPage";

// ─── Placeholder for unbuilt tabs ─────────────────────────────────────────────
function PlaceholderTab({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-sky-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">{label}</h3>
      <p className="text-sm text-slate-400 max-w-xs">This section is coming soon.</p>
    </div>
  );
}

// ─── Nav Config ───────────────────────────────────────────────────────────────
interface NavGroup {
  heading?: string;
  items: {
    key:    string;
    label:  string;
    icon:   React.ElementType;
    badge?: number;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { key: "dashboard",    label: "Dashboard",         icon: LayoutDashboard },
    ],
  },
  {
    heading: "People",
    items: [
      { key: "users",        label: "User Management",   icon: Users                  },
      { key: "vendors",      label: "Vendor Control",    icon: Store,     badge: 12   },
      { key: "agents",       label: "Agents",            icon: UserCheck              },
    ],
  },
  {
    heading: "Platform",
    items: [
      { key: "categories",   label: "Categories",        icon: FolderOpen             },
      { key: "cities",       label: "Cities",            icon: MapPin,    badge: 1    },
      { key: "subscriptions",label: "Subscriptions",     icon: CreditCard             },
    ],
  },
  {
    heading: "Finance",
    items: [
      { key: "finance",      label: "Finance",           icon: IndianRupee            },
      { key: "payouts",      label: "Payouts",           icon: Wallet,    badge: 5    },
    ],
  },
  {
    heading: "Support",
    items: [
      { key: "disputes",     label: "Disputes",          icon: Scale,     badge: 4    },
      { key: "analytics",    label: "Analytics",         icon: BarChart2              },
    ],
  },
  {
    items: [
      { key: "notifications",label: "Notifications",     icon: Bell,      badge: 8    },
      { key: "settings",     label: "Settings",          icon: Settings               },
    ],
  },
];

// flat list for topbar label lookup
const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate                       = useNavigate();
  const { user, logout }               = useAuthStore();
  const [activeTab,   setActiveTab]    = useState("dashboard");
  const [sidebarOpen, setSidebarOpen]  = useState(true);
  const [globalSearch,setGlobalSearch] = useState("");

  function handleLogout() { logout(); navigate("/"); }

  function renderContent() {
    switch (activeTab) {
      case "dashboard":     return <AdminDashboardHome onNavigate={setActiveTab} />;
      case "users":         return <UserManagementPage />;
      case "vendors":       return <VendorControlPage />;
      case "agents":        return <AgentManagementPage />;
      case "categories":    return <CategoriesPage />;
      case "cities":        return <CitiesPage />;
      case "subscriptions":  return <SubscriptionsPage />;
      case "finance":        return <FinancePage />;
      case "payouts":       return <PayoutsPage />;
      case "disputes":      return <DisputesPage />;
      case "analytics":     return <AnalyticsPage />;
      case "notifications": return <NotificationsPage onNavigate={setActiveTab} />;
      case "settings":      return <SettingsPage />;
      default:              return <AdminDashboardHome onNavigate={setActiveTab} />;
    }
  }

  const activeNav = ALL_NAV.find(n => n.key === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 bg-white border-r border-slate-200
        flex flex-col transition-all duration-300 shadow-lg lg:shadow-none lg:sticky lg:top-0 lg:h-screen
        ${sidebarOpen ? "w-64" : "w-0 lg:w-16 overflow-hidden"}`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)" }}>
            A
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-black text-slate-800 leading-none">ADDies</p>
              <p className="text-xs text-slate-400 leading-none tracking-wide mt-0.5">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Admin badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-100 bg-sky-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center
                text-white text-sm font-bold flex-shrink-0">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || "Admin"}</p>
                <p className="text-xs text-sky-600 font-semibold flex items-center gap-1">
                  <Shield size={10} /> Super Admin
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Collapsed admin icon */}
        {!sidebarOpen && (
          <div className="flex justify-center py-3 border-b border-slate-100 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.fullName?.charAt(0) || "A"}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {/* Group heading */}
              {group.heading && sidebarOpen && (
                <p className="text-2xs font-black text-slate-400 uppercase tracking-widest px-3 py-2 mt-2">
                  {group.heading}
                </p>
              )}
              {group.heading && !sidebarOpen && (
                <div className="my-2 mx-3 h-px bg-slate-100" />
              )}

              {group.items.map(item => {
                const Icon   = item.icon;
                const active = activeTab === item.key;
                return (
                  <button key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-left
                      ${active
                        ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                    <Icon size={18} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                        {item.badge != null && item.badge > 0 && (
                          <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0
                            ${active ? "bg-white/20 text-white" : "bg-sky-100 text-sky-700"}`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {/* Collapsed badge dot */}
                    {!sidebarOpen && item.badge != null && item.badge > 0 && (
                      <span className="absolute right-1.5 top-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center gap-3 px-4 lg:px-6
          flex-shrink-0 sticky top-0 z-40">

          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(s => !s)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Global search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search vendors, customers, cities…"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm
                focus:outline-none focus:border-sky-400 transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Page title (mobile) */}
          <h1 className="text-sm font-bold text-slate-800 flex-1 sm:hidden truncate">
            {activeNav?.label || "Dashboard"}
          </h1>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={() => setActiveTab("settings")}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors hidden sm:flex">
              <Settings size={18} />
            </button>
            <button
              className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0) || "A"}
            </button>
          </div>
        </header>

        {/* Breadcrumb bar */}
        <div className="hidden lg:flex items-center gap-2 px-6 py-2 border-b border-slate-100 bg-white text-xs text-slate-400">
          <span className="font-semibold text-sky-600">ADDies Admin</span>
          <ChevronRight size={12} />
          <span className="font-semibold text-slate-700">{activeNav?.label || "Dashboard"}</span>
        </div>

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
