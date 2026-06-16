// src/pages/agent/dashboard/components/AlertsPanel.tsx

import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, TrendingDown,
  UserX, MessageSquareWarning, ChevronRight, Bell,
} from "lucide-react";
import type { AlertItem } from "../mockAgentData";

interface Props {
  alerts:       AlertItem[];
  onViewAll?:   () => void;
  onAction?:    (alert: AlertItem) => void;
}

const ALERT_CONFIG: Record<AlertItem["type"], {
  icon:    React.ElementType;
  color:   string;
  bg:      string;
  border:  string;
  label:   string;
  action:  string;
}> = {
  approval:      { icon: CheckCircle2,          color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",  label: "KYC Approval",  action: "Review" },
  dispute:       { icon: AlertTriangle,          color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",   label: "Dispute",       action: "Resolve" },
  low_performer: { icon: TrendingDown,           color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",label: "Performance",   action: "View" },
  inactive:      { icon: UserX,                  color: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200", label: "Inactive",      action: "Contact" },
  complaint:     { icon: MessageSquareWarning,   color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",  label: "Complaint",     action: "Review" },
};

export default function AlertsPanel({ alerts, onViewAll, onAction }: Props) {
  const [showAll, setShowAll] = useState(false);

  const urgentCount  = alerts.filter(a => a.urgent).length;
  const displayAlerts = showAll ? alerts : alerts.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-slate-500" />
          <h3 className="font-black text-slate-800 text-sm">Quick Alerts</h3>
          {urgentCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              {urgentCount} urgent
            </span>
          )}
        </div>
        {alerts.length > 3 && (
          <button onClick={() => setShowAll(s => !s)}
            className="text-xs text-violet-600 font-bold hover:text-violet-700">
            {showAll ? "Show Less" : `View All (${alerts.length})`}
          </button>
        )}
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
          <CheckCircle2 size={32} className="text-green-400 mb-2" />
          <p className="text-sm font-bold text-slate-600">All clear!</p>
          <p className="text-xs text-slate-400 mt-0.5">No pending alerts right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {displayAlerts.map((alert) => {
            const cfg  = ALERT_CONFIG[alert.type];
            const Icon = cfg.icon;
            return (
              <div key={alert.id}
                className={`flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors
                  ${alert.urgent ? "border-l-4 border-l-red-400" : ""}`}>

                {/* Icon */}
                <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={14} className={cfg.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} uppercase tracking-wide`}>
                          {cfg.label}
                        </span>
                        {alert.urgent && (
                          <span className="text-2xs font-bold text-red-500 uppercase tracking-wide">
                            • Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">{alert.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug truncate">{alert.subtitle}</p>
                    </div>
                    <button
                      onClick={() => onAction?.(alert)}
                      className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 mt-1
                        ${cfg.color} hover:opacity-70 transition-opacity`}>
                      {cfg.action} <ChevronRight size={12} />
                    </button>
                  </div>
                  <p className="text-2xs text-slate-300 mt-1.5">{alert.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
