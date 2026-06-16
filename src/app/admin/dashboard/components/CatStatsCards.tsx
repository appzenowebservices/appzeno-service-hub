// src/pages/admin/dashboard/components/CatStatsCards.tsx

import { FolderOpen, CheckCircle2, PowerOff, TrendingUp } from "lucide-react";

interface Props {
  total:      number;
  active:     number;
  inactive:   number;
  topRevenue: number; // highest single category revenue
}

function fmtRev(n: number) {
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}L`;
  if (n >= 1000)    return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function CatStatsCards({ total, active, inactive, topRevenue }: Props) {
  const cards = [
    {
      label:  "Total Categories",
      value:  total,
      sub:    "Platform-wide",
      icon:   FolderOpen,
      color:  "text-sky-600",
      bg:     "bg-sky-50",
      border: "border-sky-200",
    },
    {
      label:  "Active",
      value:  active,
      sub:    `${Math.round((active / Math.max(total, 1)) * 100)}% operational`,
      icon:   CheckCircle2,
      color:  "text-emerald-600",
      bg:     "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label:  "Inactive",
      value:  inactive,
      sub:    "Disabled / paused",
      icon:   PowerOff,
      color:  inactive > 0 ? "text-amber-600"  : "text-slate-400",
      bg:     inactive > 0 ? "bg-amber-50"     : "bg-slate-50",
      border: inactive > 0 ? "border-amber-200": "border-slate-200",
    },
    {
      label:  "Top Category Rev",
      value:  fmtRev(topRevenue),
      sub:    "Highest earner this month",
      icon:   TrendingUp,
      color:  "text-violet-600",
      bg:     "bg-violet-50",
      border: "border-violet-200",
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
