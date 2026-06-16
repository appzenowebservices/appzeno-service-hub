// src/pages/admin/dashboard/components/SubStatsCards.tsx

import { IndianRupee, Users, AlertTriangle, TrendingDown } from "lucide-react";

function fmtRev(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

interface Props {
  mrr:          number;
  totalSubs:    number;
  expiringSoon: number;
  cancelled:    number;
}

export default function SubStatsCards({ mrr, totalSubs, expiringSoon, cancelled }: Props) {
  const cards = [
    {
      label:  "Monthly Revenue",
      value:  fmtRev(mrr),
      sub:    "MRR across all plans",
      icon:   IndianRupee,
      color:  "text-emerald-600",
      bg:     "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label:  "Total Subscribers",
      value:  String(totalSubs),
      sub:    "Active vendor subscriptions",
      icon:   Users,
      color:  "text-sky-600",
      bg:     "bg-sky-50",
      border: "border-sky-200",
    },
    {
      label:  "Expiring Soon",
      value:  String(expiringSoon),
      sub:    "Renewals due in 30 days",
      icon:   AlertTriangle,
      color:  expiringSoon > 0 ? "text-amber-600"   : "text-slate-400",
      bg:     expiringSoon > 0 ? "bg-amber-50"      : "bg-slate-50",
      border: expiringSoon > 0 ? "border-amber-200" : "border-slate-200",
    },
    {
      label:  "Cancelled",
      value:  String(cancelled),
      sub:    "This month",
      icon:   TrendingDown,
      color:  cancelled > 0 ? "text-red-600"    : "text-slate-400",
      bg:     cancelled > 0 ? "bg-red-50"       : "bg-slate-50",
      border: cancelled > 0 ? "border-red-200"  : "border-slate-200",
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
