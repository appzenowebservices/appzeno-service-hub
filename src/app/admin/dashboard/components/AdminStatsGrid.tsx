// src/pages/admin/dashboard/components/AdminStatsGrid.tsx

import {
  IndianRupee, Briefcase, Users, Store,
  TrendingUp, BarChart2, Wallet, AlertTriangle,
} from "lucide-react";
import type { PlatformStat, Period } from "../mockAdminData";

interface Props {
  stats:  PlatformStat;
  period: Period;
}

const PERIOD_LABEL: Record<Period, string> = {
  day:   "Today",
  week:  "This Week",
  month: "This Month",
  year:  "This Year",
};

function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function AdminStatsGrid({ stats, period }: Props) {
  const pl = PERIOD_LABEL[period];

  const cards = [
    {
      label: "Total Revenue",
      value: fmt(stats.totalRevenue),
      sub:   `Platform fee: ${fmt(stats.platformFee)}`,
      icon: IndianRupee, color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-200",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings.toLocaleString("en-IN"),
      sub:   `${stats.completedBookings} completed · ${stats.cancelledBookings} cancelled`,
      icon: Briefcase, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200",
    },
    {
      label: "Active Customers",
      value: stats.activeCustomers.toLocaleString("en-IN"),
      sub:   `of ${stats.totalCustomers.toLocaleString("en-IN")} registered`,
      icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    },
    {
      label: "Active Vendors",
      value: stats.activeVendors.toLocaleString("en-IN"),
      sub:   `of ${stats.totalVendors} total vendors`,
      icon: Store, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    },
    {
      label: "New Registrations",
      value: stats.newRegistrations.toLocaleString("en-IN"),
      sub:   "Customers + vendors",
      icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200",
    },
    {
      label: "Platform Growth",
      value: `+${stats.platformGrowth}%`,
      sub:   "vs previous period",
      icon: BarChart2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200",
    },
    {
      label: "Pending Payouts",
      value: fmt(stats.pendingPayouts),
      sub:   "Awaiting processing",
      icon:   Wallet,
      color:  stats.pendingPayouts > 100000 ? "text-red-600"    : "text-orange-600",
      bg:     stats.pendingPayouts > 100000 ? "bg-red-50"       : "bg-orange-50",
      border: stats.pendingPayouts > 100000 ? "border-red-200"  : "border-orange-200",
    },
    {
      label: "Open Disputes",
      value: stats.openDisputes.toString(),
      sub:   "Including escalated",
      icon:   AlertTriangle,
      color:  stats.openDisputes > 5 ? "text-red-600"    : "text-slate-600",
      bg:     stats.openDisputes > 5 ? "bg-red-50"       : "bg-slate-100",
      border: stats.openDisputes > 5 ? "border-red-200"  : "border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
        <div key={label}
          className={`bg-white rounded-2xl border-2 ${border} p-4 hover:shadow-md transition-shadow`}>
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
            <Icon size={18} className={color} />
          </div>
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">{label}</p>
          <p className="text-xs text-slate-400 mt-1 leading-snug">{sub}</p>
        </div>
      ))}
    </div>
  );
}
