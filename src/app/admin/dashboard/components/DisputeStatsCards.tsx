// src/pages/admin/dashboard/components/DisputeStatsCards.tsx

import { Scale, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import type { AdminDispute } from "../mockAdminData";

interface Props { disputes: AdminDispute[] }

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function DisputeStatsCards({ disputes }: Props) {
  const open       = disputes.filter(d => d.status === "open").length;
  const escalated  = disputes.filter(d => d.status === "escalated").length;
  const inReview   = disputes.filter(d => d.status === "under_review").length;
  const resolved   = disputes.filter(d => d.status === "resolved").length;
  const refundTotal = disputes.reduce((s, d) => s + d.refundIssued, 0);

  const cards = [
    {
      label: "Open Disputes",
      value: open + escalated,
      sub:   `${escalated} escalated, ${open} new`,
      icon: Scale,
      color:  (open + escalated) > 0 ? "text-red-600"   : "text-slate-400",
      bg:     (open + escalated) > 0 ? "bg-red-50"      : "bg-slate-50",
      border: (open + escalated) > 0 ? "border-red-200" : "border-slate-200",
    },
    {
      label: "Under Review",
      value: inReview,
      sub:   "Agent investigating",
      icon: Clock,
      color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    },
    {
      label: "Resolved",
      value: resolved,
      sub:   `${disputes.filter(d => d.verdict === "favor_customer").length} customer · ${disputes.filter(d => d.verdict === "favor_vendor").length} vendor`,
      icon: CheckCircle2,
      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    },
    {
      label: "Refunds Issued",
      value: fmt(refundTotal),
      sub:   `${disputes.filter(d => d.refundIssued > 0).length} disputes settled`,
      icon: AlertTriangle,
      color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200",
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
