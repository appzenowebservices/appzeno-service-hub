// src/pages/admin/dashboard/components/PayoutCard.tsx

import { MapPin, Briefcase, Calendar, Smartphone, ChevronRight } from "lucide-react";
import type { PendingPayout } from "../mockAdminData";
import PayoutStatusBadge from "./PayoutStatusBadge";

interface Props {
  payout:  PendingPayout;
  onView:  () => void;
  onQuickApprove?: () => void;
}

function fmt(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// Category → color map for avatar
const CAT_COLOR: Record<string, string> = {
  "Cleaning":       "bg-sky-500",
  "AC Service":     "bg-cyan-500",
  "Plumbing":       "bg-blue-500",
  "Painting":       "bg-violet-500",
  "Pest Control":   "bg-green-500",
  "Electrical":     "bg-amber-500",
  "Carpentry":      "bg-orange-500",
  "Appliance Repair":"bg-rose-500",
};

export default function PayoutCard({ payout: p, onView, onQuickApprove }: Props) {
  const avatarColor = CAT_COLOR[p.category] ?? "bg-slate-500";

  return (
    <div
      onClick={onView}
      className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md
        hover:border-sky-200 transition-all cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-xl ${avatarColor}
          flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
          {p.vendorName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-black text-slate-800 truncate">{p.vendorName}</p>
          </div>
          <p className="text-xs text-slate-400">{p.vendorId} · {p.category}</p>
        </div>

        <PayoutStatusBadge status={p.status} />
      </div>

      {/* Amount highlight */}
      <div className="bg-slate-50 rounded-xl px-4 py-3 mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Payout Amount</p>
          <p className="text-2xl font-black text-slate-900">₹{p.amount.toLocaleString("en-IN")}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-0.5">Period</p>
          <p className="text-sm font-bold text-slate-700">{p.period}</p>
        </div>
      </div>

      {/* Meta info */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Briefcase size={11} className="text-slate-400 flex-shrink-0" />
          <span>{p.jobs} jobs completed</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin size={11} className="text-slate-400 flex-shrink-0" />
          <span>{p.city}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Smartphone size={11} className="text-slate-400 flex-shrink-0" />
          <span className="font-mono">{p.upiId}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar size={11} className="text-slate-400 flex-shrink-0" />
          <span>Requested {p.requestedAt}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50 gap-2">
        {p.status === "pending" && onQuickApprove && (
          <button
            onClick={e => { e.stopPropagation(); onQuickApprove(); }}
            className="flex-1 py-2 rounded-xl bg-sky-50 border border-sky-200
              text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors">
            Quick Approve
          </button>
        )}
        {p.status === "approved" && onQuickApprove && (
          <button
            onClick={e => { e.stopPropagation(); onQuickApprove(); }}
            className="flex-1 py-2 rounded-xl bg-emerald-50 border border-emerald-200
              text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
            Release Now
          </button>
        )}
        {(p.status === "on_hold" || p.status === "released") && (
          <div className="flex-1" />
        )}
        <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-sky-500 transition-colors">
          <span>View</span>
          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
