// src/pages/admin/dashboard/components/CatCard.tsx

import { Users, Briefcase, IndianRupee, TrendingUp, Edit2, ChevronRight } from "lucide-react";
import type { CategoryPerf } from "../mockAdminData";

function fmtRev(n: number) {
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}L`;
  if (n >= 1000)    return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

interface Props {
  category:    CategoryPerf;
  maxRevenue:  number;
  onView:      () => void;
  onEdit:      () => void;
  onToggle:    (id: string) => void;
}

export default function CatCard({ category: c, maxRevenue, onView, onEdit, onToggle }: Props) {
  const revPct = maxRevenue > 0 ? Math.round((c.revenue / maxRevenue) * 100) : 0;

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all hover:shadow-md
      ${c.active ? "border-slate-100 hover:border-sky-200" : "border-slate-100 opacity-75"}`}>

      {/* Inactive stripe */}
      {!c.active && (
        <div className="h-1 bg-gradient-to-r from-slate-300 to-slate-400 rounded-t-2xl" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0
            ${c.active ? "bg-sky-50" : "bg-slate-100"}`}>
            {c.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-800 truncate">{c.name}</p>
              {c.active ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                  Active
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-300 flex-shrink-0">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{c.id}</p>
          </div>
        </div>

        {/* Revenue bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Revenue</span>
            <span className="font-black text-slate-800">{fmtRev(c.revenue)}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${c.active ? "bg-sky-400" : "bg-slate-300"}`}
              style={{ width: `${revPct}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center bg-slate-50 rounded-xl py-2">
            <p className="text-sm font-black text-slate-700">{c.vendors}</p>
            <p className="text-xs text-slate-400">Vendors</p>
          </div>
          <div className="text-center bg-slate-50 rounded-xl py-2">
            <p className="text-sm font-black text-slate-700">{c.bookings}</p>
            <p className="text-xs text-slate-400">Bookings</p>
          </div>
          <div className="text-center bg-slate-50 rounded-xl py-2">
            <p className={`text-sm font-black ${c.growth > 0 ? "text-emerald-600" : "text-slate-400"}`}>
              {c.growth > 0 ? `+${c.growth}%` : "—"}
            </p>
            <p className="text-xs text-slate-400">Growth</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
          {/* Toggle active/inactive */}
          <button
            onClick={e => { e.stopPropagation(); onToggle(c.id); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all
              ${c.active
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"}`}>
            {c.active ? "Deactivate" : "Activate"}
          </button>

          {/* Edit */}
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600
              hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 text-xs font-bold transition-all">
            <Edit2 size={13} />
          </button>

          {/* View details */}
          <button
            onClick={onView}
            className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700
              hover:bg-sky-100 text-xs font-bold transition-all">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
