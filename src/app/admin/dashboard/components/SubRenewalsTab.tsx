// src/pages/admin/dashboard/components/SubRenewalsTab.tsx

import { RefreshCw, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { EXPIRING_RENEWALS } from "../mockAdminData";

interface Props { planId: string; }

export default function SubRenewalsTab({ planId }: Props) {
  const renewals = EXPIRING_RENEWALS.filter(r => r.planId === planId);

  if (renewals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-5">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
          <CheckCircle2 size={24} className="text-emerald-400" />
        </div>
        <p className="text-sm font-bold text-slate-500">No renewals due soon</p>
        <p className="text-xs text-slate-400 mt-1">All subscriptions are stable for now.</p>
      </div>
    );
  }

  function urgencyConfig(daysLeft: number, autoRenew: boolean) {
    if (daysLeft === 0) return { bg: "bg-red-50",    border: "border-red-200",   icon: AlertTriangle,  iconColor: "text-red-500",  label: "Expired",       labelBg: "bg-red-100 text-red-700"          };
    if (!autoRenew)     return { bg: "bg-amber-50",  border: "border-amber-200", icon: AlertTriangle,  iconColor: "text-amber-500",label: `${daysLeft}d left`, labelBg: "bg-amber-100 text-amber-700"  };
    return               { bg: "bg-slate-50",  border: "border-slate-200", icon: RefreshCw,      iconColor: "text-slate-400",label: `${daysLeft}d`,      labelBg: "bg-slate-100 text-slate-500"    };
  }

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
        <Clock size={14} className="text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          {renewals.length} renewal{renewals.length > 1 ? "s" : ""} coming up in 30 days
        </p>
      </div>

      <div className="space-y-3">
        {renewals.map((r, i) => {
          const cfg = urgencyConfig(r.daysLeft, r.autoRenew);
          const Icon = cfg.icon;
          return (
            <div key={i} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className={cfg.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-black text-slate-800 truncate">{r.vendorName}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.labelBg}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{r.city} · Renewal: {r.renewalDate}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-black text-slate-700">₹{r.amount.toLocaleString()}</span>
                    <span className={`text-xs flex items-center gap-1 ${r.autoRenew ? "text-emerald-600" : "text-red-500 font-bold"}`}>
                      <RefreshCw size={10} />
                      {r.autoRenew ? "Auto-renew ON" : "Auto-renew OFF — action needed"}
                    </span>
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
