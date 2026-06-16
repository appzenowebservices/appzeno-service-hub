// src/pages/admin/dashboard/components/VendorStatsCards.tsx

import { Store, CheckCircle2, Clock, Ban } from "lucide-react";

interface Props {
  total:     number;
  active:    number;
  inactive:  number;
  suspended: number;
}

export default function VendorStatsCards({ total, active, inactive, suspended }: Props) {
  const cards = [
    {
      label:  "Total Vendors",
      value:  total,
      sub:    "Registered on platform",
      icon:   Store,
      color:  "text-sky-600",
      bg:     "bg-sky-50",
      border: "border-sky-200",
    },
    {
      label:  "Active",
      value:  active,
      sub:    `${Math.round((active / total) * 100)}% of total`,
      icon:   CheckCircle2,
      color:  "text-emerald-600",
      bg:     "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label:  "Inactive",
      value:  inactive,
      sub:    "Not accepting leads",
      icon:   Clock,
      color:  inactive > 0 ? "text-amber-600"   : "text-slate-400",
      bg:     inactive > 0 ? "bg-amber-50"       : "bg-slate-50",
      border: inactive > 0 ? "border-amber-200"  : "border-slate-200",
    },
    {
      label:  "Suspended",
      value:  suspended,
      sub:    "Access restricted",
      icon:   Ban,
      color:  suspended > 0 ? "text-red-600"    : "text-slate-400",
      bg:     suspended > 0 ? "bg-red-50"       : "bg-slate-50",
      border: suspended > 0 ? "border-red-200"  : "border-slate-200",
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
