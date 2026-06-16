// src/pages/admin/dashboard/components/SubDrawerHeader.tsx

import { useState } from "react";
import { X, Edit2, Trash2, CheckCircle2, PowerOff, IndianRupee, Crown } from "lucide-react";
import type { SubscriptionPlan } from "../mockAdminData";
import { PLAN_SUBSCRIBERS } from "../mockAdminData";

interface Props {
  plan:     SubscriptionPlan;
  onClose:  () => void;
  onEdit:   () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
  blue:   { bg: "bg-sky-600",    text: "text-sky-600",    border: "border-sky-200",    lightBg: "bg-sky-50"    },
  violet: { bg: "bg-violet-600", text: "text-violet-600", border: "border-violet-200", lightBg: "bg-violet-50" },
  amber:  { bg: "bg-amber-500",  text: "text-amber-600",  border: "border-amber-200",  lightBg: "bg-amber-50"  },
};

export default function SubDrawerHeader({ plan: p, onClose, onEdit, onToggle, onDelete }: Props) {
  const [showConfirm, setShowConfirm] = useState<"toggle" | "delete" | null>(null);
  const c         = COLOR_MAP[p.color] ?? COLOR_MAP.blue;
  const subs      = PLAN_SUBSCRIBERS[p.id] ?? [];
  const activeSubs= subs.filter(s => s.status === "active" || s.status === "expiring_soon").length;
  const mrr       = p.price * activeSubs;
  const fmtMRR    = mrr >= 100000 ? `₹${(mrr / 100000).toFixed(1)}L` : mrr >= 1000 ? `₹${(mrr / 1000).toFixed(1)}K` : `₹${mrr}`;

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-sm font-black text-slate-800">Plan Details</p>
          <p className="text-xs text-slate-400">Subscribers, revenue & settings</p>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Hero — light bg */}
      <div className="px-5 py-5 bg-gradient-to-br from-sky-50 to-slate-50 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl ${c.lightBg} ${c.border} border-2
            flex items-center justify-center flex-shrink-0`}>
            <IndianRupee size={22} className={c.text} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg font-black text-slate-800">{p.name}</h3>
              {p.popular && (
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5
                  rounded-full ${c.lightBg} ${c.text}`}>
                  <Crown size={10} /> Popular
                </span>
              )}
              {p.active
                ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">● Active</span>
                : <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-300">● Inactive</span>}
            </div>
            <p className="text-2xl font-black text-slate-800">
              ₹{p.price.toLocaleString("en-IN")}
              <span className="text-sm text-slate-400 font-normal ml-1 capitalize">/ {p.billingCycle}</span>
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Subscribers",  value: String(activeSubs) },
            { label: "MRR",          value: fmtMRR             },
            { label: "Billing",      value: p.billingCycle.charAt(0).toUpperCase() + p.billingCycle.slice(1) },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-center">
              <p className="text-slate-800 font-black text-base leading-none">{s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-5 py-3 border-b border-slate-100 flex-shrink-0">
        {showConfirm === null ? (
          <>
            <button onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors">
              <Edit2 size={12} /> Edit Plan
            </button>
            <button onClick={() => setShowConfirm("toggle")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors
                ${p.active
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"}`}>
              {p.active ? <><PowerOff size={12} /> Deactivate</> : <><CheckCircle2 size={12} /> Activate</>}
            </button>
            <button onClick={() => setShowConfirm("delete")}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500
                hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
              <Trash2 size={13} />
            </button>
          </>
        ) : (
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-bold text-red-700 text-center mb-2">
              {showConfirm === "delete"
                ? `Delete "${p.name}" plan? ${activeSubs} active subscribers will lose access.`
                : p.active
                  ? `Deactivate "${p.name}"? New signups will be blocked.`
                  : `Reactivate "${p.name}" plan?`}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button onClick={() => { setShowConfirm(null); showConfirm === "delete" ? onDelete(p.id) : onToggle(p.id); }}
                className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700">
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
