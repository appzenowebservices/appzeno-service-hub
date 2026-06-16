// src/pages/admin/dashboard/components/AdminAlertsPanel.tsx

import {
  Wallet, AlertTriangle, MapPin, Store,
  TrendingUp, Activity, ArrowUpRight,
} from "lucide-react";
import type { AdminAlert } from "../mockAdminData";

const ALERT_ICONS: Record<AdminAlert["type"], { icon: React.ElementType; color: string; bg: string }> = {
  payout:  { icon: Wallet,        color: "text-amber-600",  bg: "bg-amber-50"  },
  dispute: { icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50"    },
  city:    { icon: MapPin,        color: "text-slate-600",  bg: "bg-slate-100" },
  vendor:  { icon: Store,         color: "text-blue-600",   bg: "bg-blue-50"   },
  revenue: { icon: TrendingUp,    color: "text-orange-600", bg: "bg-orange-50" },
  system:  { icon: Activity,      color: "text-violet-600", bg: "bg-violet-50" },
};

interface Props {
  alerts:     AdminAlert[];
  onNavigate: (tab: string) => void;
}

export default function AdminAlertsPanel({ alerts, onNavigate }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">Platform Alerts</h3>
        <span className="text-xs text-slate-400">{alerts.filter(a => a.urgent).length} urgent</span>
      </div>

      <div className="divide-y divide-slate-50">
        {alerts.map(alert => {
          const cfg  = ALERT_ICONS[alert.type];
          const Icon = cfg.icon;
          return (
            <div key={alert.id}
              className={`flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors
                ${alert.urgent ? "border-l-4 border-l-red-400" : ""}`}>

              <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={14} className={cfg.color} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold text-slate-800">{alert.title}</p>
                  {alert.urgent && (
                    <span className="text-xs font-bold text-red-500 uppercase">• Urgent</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{alert.subtitle}</p>
              </div>

              <button onClick={() => onNavigate(alert.tab)}
                className={`text-xs font-bold flex-shrink-0 flex items-center gap-1 ${cfg.color} hover:opacity-70`}>
                {alert.action} <ArrowUpRight size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
