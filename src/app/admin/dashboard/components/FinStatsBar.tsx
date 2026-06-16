// src/pages/admin/dashboard/components/FinStatsBar.tsx

import { IndianRupee, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { getPlatformStats, MONTHLY_PL, type Period } from "../mockAdminData";

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

interface Props { period: Period; }

export default function FinStatsBar({ period }: Props) {
  const s   = getPlatformStats(period);
  const pl  = MONTHLY_PL[MONTHLY_PL.length - 1]; // Feb 26

  const cards = [
    {
      label:  "Gross Revenue",
      value:  fmt(s.totalRevenue),
      change: `+${s.platformGrowth}%`,
      up:     true,
      color:  "text-sky-700",
      bg:     "bg-sky-50",
      border: "border-sky-200",
    },
    {
      label:  "Platform Fee",
      value:  fmt(s.platformFee),
      change: `${((s.platformFee / s.totalRevenue) * 100).toFixed(0)}% of gross`,
      up:     true,
      color:  "text-violet-700",
      bg:     "bg-violet-50",
      border: "border-violet-200",
    },
    {
      label:  "Vendor Payouts",
      value:  fmt(s.pendingPayouts),
      change: "Pending this cycle",
      up:     false,
      color:  "text-amber-700",
      bg:     "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label:  "Subscriptions",
      value:  fmt(pl.subscriptions),
      change: "+18.4% vs last mo",
      up:     true,
      color:  "text-emerald-700",
      bg:     "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label:  "Refunds",
      value:  fmt(pl.refunds),
      change: `${((pl.refunds / pl.grossRevenue) * 100).toFixed(1)}% of revenue`,
      up:     false,
      color:  "text-red-700",
      bg:     "bg-red-50",
      border: "border-red-200",
    },
    {
      label:  "Net Profit",
      value:  fmt(pl.netProfit),
      change: `${((pl.netProfit / pl.grossRevenue) * 100).toFixed(1)}% margin`,
      up:     true,
      color:  "text-green-700",
      bg:     "bg-green-50",
      border: "border-green-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(({ label, value, change, up, color, bg, border }) => (
        <div key={label}
          className={`${bg} border ${border} rounded-2xl p-3.5 hover:shadow-md transition-shadow`}>
          <p className={`text-lg font-black ${color} leading-none mb-1`}>{value}</p>
          <p className="text-xs font-bold text-slate-600">{label}</p>
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium
            ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {change}
          </div>
        </div>
      ))}
    </div>
  );
}
