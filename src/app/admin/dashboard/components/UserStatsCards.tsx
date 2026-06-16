// src/pages/admin/dashboard/components/UserStatsCards.tsx

import { Users, UserCheck, UserX, Activity } from "lucide-react";

interface Props {
  total:   number;
  active:  number;
  blocked: number;
  today:   number;
}

export default function UserStatsCards({ total, active, blocked, today }: Props) {
  const cards = [
    {
      label:  "Total Users",
      value:  total.toLocaleString("en-IN"),
      sub:    "Registered customers",
      icon:   Users,
      color:  "text-sky-600",
      bg:     "bg-sky-50",
      border: "border-sky-200",
    },
    {
      label:  "Active Users",
      value:  active.toLocaleString("en-IN"),
      sub:    `${Math.round((active / total) * 100)}% of total`,
      icon:   UserCheck,
      color:  "text-emerald-600",
      bg:     "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label:  "Blocked",
      value:  blocked.toLocaleString("en-IN"),
      sub:    "Access restricted",
      icon:   UserX,
      color:  blocked > 0 ? "text-red-600"    : "text-slate-400",
      bg:     blocked > 0 ? "bg-red-50"       : "bg-slate-50",
      border: blocked > 0 ? "border-red-200"  : "border-slate-200",
    },
    {
      label:  "Active Today",
      value:  today.toLocaleString("en-IN"),
      sub:    "Opened app today",
      icon:   Activity,
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
