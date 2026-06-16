// src/pages/admin/dashboard/components/PayoutStatsCards.tsx

import { Wallet, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { PendingPayout } from "../mockAdminData";

interface Props {
  payouts: PendingPayout[];
}

function fmt(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function PayoutStatsCards({ payouts }: Props) {
  const totalPending  = payouts.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalApproved = payouts.filter(p => p.status === "approved").reduce((s, p) => s + p.amount, 0);
  const totalOnHold   = payouts.filter(p => p.status === "on_hold").reduce((s, p) => s + p.amount, 0);
  const totalReleased = payouts.filter(p => p.status === "released").reduce((s, p) => s + p.amount, 0);

  const cards = [
    {
      label:  "Pending Payouts",
      value:  fmt(totalPending),
      sub:    `${payouts.filter(p => p.status === "pending").length} vendors awaiting`,
      icon:   Clock,
      color:  totalPending > 100000 ? "text-red-600"    : "text-amber-600",
      bg:     totalPending > 100000 ? "bg-red-50"       : "bg-amber-50",
      border: totalPending > 100000 ? "border-red-200"  : "border-amber-200",
    },
    {
      label:  "Approved",
      value:  fmt(totalApproved),
      sub:    `${payouts.filter(p => p.status === "approved").length} ready to release`,
      icon:   ShieldCheck,
      color:  "text-sky-600",
      bg:     "bg-sky-50",
      border: "border-sky-200",
    },
    {
      label:  "On Hold",
      value:  fmt(totalOnHold),
      sub:    `${payouts.filter(p => p.status === "on_hold").length} under review`,
      icon:   Wallet,
      color:  "text-orange-600",
      bg:     "bg-orange-50",
      border: "border-orange-200",
    },
    {
      label:  "Released",
      value:  fmt(totalReleased),
      sub:    `${payouts.filter(p => p.status === "released").length} settled this cycle`,
      icon:   CheckCircle2,
      color:  "text-emerald-600",
      bg:     "bg-emerald-50",
      border: "border-emerald-200",
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
