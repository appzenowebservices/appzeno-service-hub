// src/pages/admin/dashboard/components/SubSubscribersTab.tsx

import { Users, MapPin, RefreshCw, Calendar } from "lucide-react";
import { PLAN_SUBSCRIBERS } from "../mockAdminData";

const STATUS_CFG = {
  active:         { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Active"         },
  expiring_soon:  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Expiring Soon"  },
  expired:        { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400",     label: "Expired"        },
  cancelled:      { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400",   label: "Cancelled"      },
};

interface Props { planId: string; }

export default function SubSubscribersTab({ planId }: Props) {
  const subscribers = PLAN_SUBSCRIBERS[planId] ?? [];

  if (subscribers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-5">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Users size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">No subscribers yet</p>
        <p className="text-xs text-slate-400 mt-1">No vendors have subscribed to this plan.</p>
      </div>
    );
  }

  const active   = subscribers.filter(s => s.status === "active").length;
  const expiring = subscribers.filter(s => s.status === "expiring_soon").length;
  const expired  = subscribers.filter(s => s.status === "expired").length;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Active",   val: active,   color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Expiring", val: expiring, color: "text-amber-600",   bg: "bg-amber-50"   },
          { label: "Expired",  val: expired,  color: "text-red-600",     bg: "bg-red-50"     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl py-2.5 text-center`}>
            <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subscriber list */}
      <div className="space-y-2.5">
        {subscribers.map(s => {
          const cfg = STATUS_CFG[s.status];
          return (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center
                  text-sky-700 font-black text-sm flex-shrink-0">
                  {s.vendorName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-black text-slate-800 truncate">{s.vendorName}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5
                      rounded-full flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {s.city}</span>
                    <span>{s.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> Joined {s.joinedDate}
                    </span>
                    <span className={`flex items-center gap-1 ${s.status === "expiring_soon" || s.status === "expired" ? "text-amber-600 font-bold" : ""}`}>
                      ↻ Renews {s.renewalDate}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-slate-800">₹{s.amountPaid.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-xs justify-end mt-1
                    ${s.autoRenew ? "text-emerald-600" : "text-slate-400"}`}>
                    <RefreshCw size={10} />
                    <span>{s.autoRenew ? "Auto" : "Manual"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
