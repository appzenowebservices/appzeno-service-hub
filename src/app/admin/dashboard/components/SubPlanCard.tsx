// src/pages/admin/dashboard/components/SubPlanCard.tsx

import { Check, Edit2, ChevronRight, Crown, Users, IndianRupee, PowerOff, CheckCircle2 } from "lucide-react";
import type { SubscriptionPlan } from "../mockAdminData";
import { PLAN_SUBSCRIBERS } from "../mockAdminData";

const COLOR_MAP: Record<string, { ring: string; badge: string; badgeText: string; icon: string; bg: string }> = {
  blue:   { ring: "ring-sky-200",     badge: "bg-sky-100",    badgeText: "text-sky-700",    icon: "text-sky-500",   bg: "bg-sky-50"    },
  violet: { ring: "ring-violet-200",  badge: "bg-violet-100", badgeText: "text-violet-700", icon: "text-violet-500", bg: "bg-violet-50" },
  amber:  { ring: "ring-amber-200",   badge: "bg-amber-100",  badgeText: "text-amber-700",  icon: "text-amber-500", bg: "bg-amber-50"  },
};

function fmtMRR(price: number, subs: number) {
  const mrr = price * subs;
  if (mrr >= 100000) return `₹${(mrr / 100000).toFixed(1)}L`;
  if (mrr >= 1000)   return `₹${(mrr / 1000).toFixed(1)}K`;
  return `₹${mrr}`;
}

interface Props {
  plan:     SubscriptionPlan;
  onView:   () => void;
  onEdit:   () => void;
  onToggle: (id: string) => void;
}

export default function SubPlanCard({ plan: p, onView, onEdit, onToggle }: Props) {
  const c         = COLOR_MAP[p.color] ?? COLOR_MAP.blue;
  const subs      = PLAN_SUBSCRIBERS[p.id] ?? [];
  const activeSubs= subs.filter(s => s.status === "active" || s.status === "expiring_soon").length;

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all hover:shadow-lg
      ${p.active ? `ring-2 ${c.ring} border-transparent` : "border-slate-200 opacity-70"}`}>

      {/* Popular badge */}
      {p.popular && (
        <div className="flex justify-center -mb-3 pt-3">
          <span className={`flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full
            ${c.badge} ${c.badgeText}`}>
            <Crown size={11} /> Most Popular
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Plan name + status */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-2`}>
              <IndianRupee size={18} className={c.icon} />
            </div>
            <h3 className="text-lg font-black text-slate-800">{p.name}</h3>
            <p className="text-xs text-slate-400 capitalize">{p.billingCycle} plan</p>
          </div>
          {p.active
            ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">Active</span>
            : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0">Inactive</span>}
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-3xl font-black text-slate-800">₹{p.price.toLocaleString("en-IN")}</span>
          <span className="text-sm text-slate-400 ml-1">/ {p.billingCycle === "monthly" ? "mo" : p.billingCycle === "quarterly" ? "qtr" : "yr"}</span>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-5">
          {p.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <Check size={13} className={`${c.icon} flex-shrink-0 mt-0.5`} />
              {f}
            </li>
          ))}
        </ul>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className={`${c.bg} rounded-xl p-2.5 text-center`}>
            <div className="flex items-center justify-center gap-1">
              <Users size={11} className={c.icon} />
              <p className={`text-base font-black ${c.badgeText}`}>{activeSubs}</p>
            </div>
            <p className="text-xs text-slate-400">Subscribers</p>
          </div>
          <div className={`${c.bg} rounded-xl p-2.5 text-center`}>
            <p className={`text-base font-black ${c.badgeText}`}>{fmtMRR(p.price, activeSubs)}</p>
            <p className="text-xs text-slate-400">MRR</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <button onClick={e => { e.stopPropagation(); onToggle(p.id); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              text-xs font-bold border transition-all
              ${p.active
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"}`}>
            {p.active ? <><PowerOff size={11} /> Deactivate</> : <><CheckCircle2 size={11} /> Activate</>}
          </button>
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200
              text-slate-600 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700
              transition-all">
            <Edit2 size={13} />
          </button>
          <button onClick={onView}
            className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200
              text-sky-700 hover:bg-sky-100 transition-all">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
