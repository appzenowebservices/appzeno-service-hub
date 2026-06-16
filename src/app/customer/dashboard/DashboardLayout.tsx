// src/pages/customer/dashboard/DashboardLayout.tsx
// Fixed sidebar on large screens, slide-out on mobile
// Clean white/slate design — no dark backgrounds

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarCheck, Package, Wallet,
  MapPin, Bell, User, HelpCircle, LogOut, Menu, X,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";

interface NavItem {
  label: string;
  icon:  React.ElementType;
  href:  string;
  badge?: number;
  color:  string;   // accent color for active state
}

const NAV_ITEMS: NavItem[] = [
  { label:"Dashboard",     icon:LayoutDashboard, href:"dashboard",    color:"emerald" },
  { label:"My Bookings",   icon:CalendarCheck,   href:"bookings",     color:"blue",    badge:2 },
  { label:"Book Service",  icon:Package,         href:"book",         color:"violet" },
  { label:"Wallet",        icon:Wallet,          href:"wallet",       color:"amber" },
  { label:"Addresses",     icon:MapPin,          href:"addresses",    color:"rose" },
  { label:"Notifications", icon:Bell,            href:"notifications",color:"orange",  badge:3 },
  { label:"Profile",       icon:User,            href:"profile",      color:"cyan" },
  { label:"Support",       icon:HelpCircle,      href:"support",      color:"purple" },
];

const COLOR_MAP: Record<string, { bg: string; text: string; light: string; dot: string }> = {
  emerald: { bg:"bg-emerald-500", text:"text-emerald-600", light:"bg-emerald-50", dot:"bg-emerald-500" },
  blue:    { bg:"bg-blue-500",    text:"text-blue-600",    light:"bg-blue-50",    dot:"bg-blue-500" },
  violet:  { bg:"bg-violet-500",  text:"text-violet-600",  light:"bg-violet-50",  dot:"bg-violet-500" },
  amber:   { bg:"bg-amber-500",   text:"text-amber-600",   light:"bg-amber-50",   dot:"bg-amber-500" },
  rose:    { bg:"bg-rose-500",    text:"text-rose-600",    light:"bg-rose-50",    dot:"bg-rose-500" },
  orange:  { bg:"bg-orange-500",  text:"text-orange-600",  light:"bg-orange-50",  dot:"bg-orange-500" },
  cyan:    { bg:"bg-cyan-500",    text:"text-cyan-600",    light:"bg-cyan-50",    dot:"bg-cyan-500" },
  purple:  { bg:"bg-purple-500",  text:"text-purple-600",  light:"bg-purple-50",  dot:"bg-purple-500" },
};

interface Props {
  children:    React.ReactNode;
  activeTab:   string;
  setActiveTab:(t: string) => void;
}

export default function DashboardLayout({ children, activeTab, setActiveTab }: Props) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentNav = NAV_ITEMS.find(n => n.href === activeTab);
  const c = COLOR_MAP[currentNav?.color ?? "emerald"];

  function handleLogout() {
    logout();
    navigate("/");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm">A</span>
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 leading-none tracking-tight">ADDies</p>
          <p className="text-xs text-slate-400 leading-none mt-0.5">ServiceHub</p>
        </div>
      </div>

      {/* ── User Card ── */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md shadow-emerald-100">
            {user?.fullName?.charAt(0) ?? "C"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">{user?.fullName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs text-slate-400">Customer</p>
            </div>
          </div>
          <button onClick={() => { setActiveTab("profile"); setMobileOpen(false); }}
            className="ml-auto w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center flex-shrink-0 transition-colors">
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.href;
          const colors = COLOR_MAP[item.color];
          return (
            <button key={item.href}
              onClick={() => { setActiveTab(item.href); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group relative
                ${active
                  ? `${colors.light} ${colors.text} font-semibold`
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}>

              {/* Active indicator bar */}
              {active && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${colors.bg}`} />
              )}

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                ${active ? `${colors.bg} shadow-md` : "bg-slate-100 group-hover:bg-slate-200"}`}>
                <Icon size={15} className={active ? "text-white" : "text-slate-500"} />
              </div>

              <span className="text-sm flex-1 truncate">{item.label}</span>

              {item.badge && (
                <span className={`text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5
                  ${active ? `${colors.bg} text-white` : "bg-slate-200 text-slate-600"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="p-3 border-t border-slate-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500
                     hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <LogOut size={15} className="text-red-400" />
          </div>
          Logout
        </button>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Desktop Fixed Sidebar ── */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col fixed inset-y-0 left-0 z-30 border-r border-slate-100 shadow-sm">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* drawer */}
          <div className="relative w-60 flex-shrink-0 shadow-2xl z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Main Content Area (offset by sidebar on desktop) ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">

        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0 sticky top-0 z-20 shadow-sm">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <Menu size={18} />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {currentNav && (
              <div className={`w-7 h-7 rounded-lg ${COLOR_MAP[currentNav.color].bg} flex items-center justify-center flex-shrink-0`}>
                <currentNav.icon size={14} className="text-white" />
              </div>
            )}
            <h1 className="text-base font-bold text-slate-800 truncate">
              {currentNav?.label ?? "Dashboard"}
            </h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setActiveTab("notifications")}
              className="relative w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>
            <button onClick={() => setActiveTab("profile")}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-emerald-100">
              {user?.fullName?.charAt(0) ?? "C"}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
