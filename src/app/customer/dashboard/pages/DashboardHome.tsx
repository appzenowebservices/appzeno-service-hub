// src/pages/customer/dashboard/pages/DashboardHome.tsx

import {
  CalendarCheck, CheckCircle2, Wallet, MapPin, Package,
  ChevronRight, Star, Clock, TrendingUp, Zap, ArrowUpRight,
  Wrench, Shield, Bell
} from "lucide-react";
import { useAuthStore } from "../../../../../store/authStore";

const MOCK_BOOKINGS = [
  { id:"BK-2502-0023", service:"Home Cleaning",  vendor:"CleanPro Services", date:"25 Feb",  time:"10:00 AM", status:"completed",  amount:499,  rating:5,    icon:"🧹" },
  { id:"BK-2702-0087", service:"Plumbing",        vendor:"Kumar Plumbers",    date:"27 Feb",  time:"2:00 PM",  status:"assigned",   amount:350,  rating:null, icon:"🔧" },
  { id:"BK-0103-0041", service:"AC Service",      vendor:"CoolBreeze AC",     date:"1 Mar",   time:"11:00 AM", status:"pending",    amount:699,  rating:null, icon:"❄️" },
  { id:"BK-1802-0015", service:"Electrical",      vendor:"Power Fix",         date:"18 Feb",  time:"9:00 AM",  status:"completed",  amount:420,  rating:4,    icon:"⚡" },
];

const STATUS_STYLE: Record<string, { label:string; bg:string; text:string; dot:string }> = {
  completed:   { label:"Completed",   bg:"bg-emerald-50", text:"text-emerald-700", dot:"bg-emerald-500" },
  assigned:    { label:"Assigned",    bg:"bg-blue-50",    text:"text-blue-700",    dot:"bg-blue-500" },
  pending:     { label:"Pending",     bg:"bg-amber-50",   text:"text-amber-700",   dot:"bg-amber-400" },
  cancelled:   { label:"Cancelled",  bg:"bg-red-50",     text:"text-red-700",     dot:"bg-red-500" },
  in_progress: { label:"In Progress",bg:"bg-violet-50",  text:"text-violet-700",  dot:"bg-violet-500" },
};

interface Props { setTab: (t: string) => void }

export default function DashboardHome({ setTab }: Props) {
  const { user } = useAuthStore();
  const firstName = user?.fullName?.split(" ")[0] ?? "User";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const stats = [
    { label:"Total Bookings", value:"8",    sub:"+2 this month",   icon:CalendarCheck, color:"blue",    bg:"bg-blue-50",    text:"text-blue-600",    iconBg:"bg-blue-500" },
    { label:"Completed",      value:"6",    sub:"All satisfied ✓", icon:CheckCircle2,  color:"emerald", bg:"bg-emerald-50", text:"text-emerald-600", iconBg:"bg-emerald-500" },
    { label:"Wallet Balance", value:`₹${user?.walletBalance ?? 250}`, sub:"₹50 cashback pending", icon:Wallet, color:"violet", bg:"bg-violet-50", text:"text-violet-600", iconBg:"bg-violet-500" },
    { label:"Saved Addresses",value:"2",    sub:"Home + Office",   icon:MapPin,        color:"rose",    bg:"bg-rose-50",    text:"text-rose-600",    iconBg:"bg-rose-500" },
  ];

  const quickActions = [
    { label:"Book Service",    sub:"Schedule new",        icon:"📦", tab:"book",          bg:"bg-emerald-500", hover:"hover:bg-emerald-600" },
    { label:"My Bookings",     sub:"Track & manage",      icon:"📅", tab:"bookings",       bg:"bg-blue-500",    hover:"hover:bg-blue-600" },
    { label:"Wallet & Offers", sub:"₹250 balance",        icon:"💰", tab:"wallet",         bg:"bg-violet-500",  hover:"hover:bg-violet-600" },
    { label:"Get Support",     sub:"24/7 help available", icon:"💬", tab:"support",        bg:"bg-amber-500",   hover:"hover:bg-amber-600" },
  ];

  const recentBookings = MOCK_BOOKINGS.slice(0, 3);

  return (
    <div className="space-y-6 mx-auto">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-6 overflow-hidden text-white shadow-xl shadow-emerald-100">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -right-4 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-32 w-16 h-16 bg-white/10 rounded-full" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <p className="text-emerald-100 text-sm font-medium mb-1">{greeting} 👋</p>
            <h2 className="text-2xl sm:text-3xl font-black mb-1.5">Namaste, {firstName}!</h2>
            <p className="text-emerald-100 text-sm">
              {user?.city && <span className="font-semibold">{user.city}</span>}
              {user?.city && " · "}
              Member since {user?.createdAt?.slice(0, 7) ?? "2026"}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button onClick={() => setTab("book")}
              className="px-5 py-2.5 bg-white text-emerald-700 rounded-xl text-sm font-bold
                         hover:bg-emerald-50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
              <Package size={15} /> Book Now
            </button>
            <button onClick={() => setTab("bookings")}
              className="px-5 py-2.5 bg-white/15 backdrop-blur-sm text-white border border-white/30 rounded-xl text-sm font-medium
                         hover:bg-white/25 transition-all">
              My Bookings
            </button>
          </div>
        </div>

        {/* Stat pills */}
        <div className="relative z-10 mt-5 flex flex-wrap gap-3">
          {[
            { label:"8 Total Bookings",    icon:"📋" },
            { label:"4.8★ Avg Rating",    icon:"⭐" },
            { label:"₹250 Wallet",        icon:"💳" },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs text-white font-semibold border border-white/20">
              <span>{p.icon}</span> {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
              onClick={() => {
                if (s.label === "Wallet Balance") setTab("wallet");
                if (s.label === "Total Bookings" || s.label === "Completed") setTab("bookings");
                if (s.label === "Saved Addresses") setTab("addresses");
              }}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon size={18} className={s.text} />
                </div>
                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <p className="text-2xl font-black text-slate-800 leading-none">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <button key={a.tab} onClick={() => setTab(a.tab)}
              className={`${a.bg} ${a.hover} text-white rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md`}>
              <span className="text-2xl block mb-2">{a.icon}</span>
              <p className="text-sm font-bold leading-tight">{a.label}</p>
              <p className="text-xs text-white/70 mt-0.5">{a.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom Row: Recent Bookings + Offers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800">Recent Bookings</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 4 service requests</p>
            </div>
            <button onClick={() => setTab("bookings")}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              View All <ChevronRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.map(b => {
              const st = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending;
              return (
                <div key={b.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-xl">
                    {b.icon}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{b.service}</p>
                    <p className="text-xs text-slate-400 truncate">{b.vendor}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={10} className="text-slate-300" />
                      <span className="text-xs text-slate-400">{b.date} · {b.time}</span>
                    </div>
                  </div>
                  {/* Right */}
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="text-sm font-bold text-slate-800">₹{b.amount}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${st.bg} ${st.text}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    {b.rating && (
                      <div className="flex items-center gap-0.5 justify-end">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-slate-600">{b.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Wallet card */}
          <div
            className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white cursor-pointer hover:-translate-y-0.5 transition-all shadow-lg shadow-violet-100"
            onClick={() => setTab("wallet")}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-violet-200 uppercase tracking-wide">Wallet Balance</p>
              <Wallet size={16} className="text-violet-200" />
            </div>
            <p className="text-3xl font-black">₹{user?.walletBalance ?? 250}</p>
            <p className="text-violet-200 text-xs mt-1">₹50 cashback pending</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/20">
                <div className="h-full w-2/3 rounded-full bg-white/60" />
              </div>
              <span className="text-xs text-violet-200">250/500 pts</span>
            </div>
          </div>

          {/* Quick offer */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber-500" />
              <p className="text-sm font-bold text-slate-800">Active Offers</p>
            </div>
            <div className="space-y-2">
              {[
                { label:"CLEAN20 — 20% off Cleaning", expiry:"28 Feb" },
                { label:"ACFREE — Free AC Visit",      expiry:"10 Mar" },
              ].map(o => (
                <div key={o.label} className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 truncate pr-2">{o.label}</p>
                  <p className="text-xs text-amber-500 flex-shrink-0">Exp {o.expiry}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Your Account</p>
            <div className="space-y-2.5">
              {[
                { icon:Shield,      label:"KYC Verified",      color:"text-emerald-500" },
                { icon:TrendingUp,  label:"Loyalty: Silver",   color:"text-amber-500" },
                { icon:Bell,        label:"3 Notifications",   color:"text-blue-500" },
              ].map(i => {
                const Icon = i.icon;
                return (
                  <div key={i.label} className="flex items-center gap-3">
                    <Icon size={14} className={i.color} />
                    <p className="text-sm text-slate-700 font-medium">{i.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
