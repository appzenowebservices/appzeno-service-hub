// src/pages/admin/dashboard/components/SetAuditTab.tsx

import { useState, useMemo } from "react";
import { Search, X, AlertTriangle, Info, Zap, Filter } from "lucide-react";
import { AUDIT_LOG } from "../mockAdminData";

const SEVERITY_CFG = {
  info:     { bg: "bg-sky-50",    text: "text-sky-700",     border: "border-sky-200",    dot: "bg-sky-400",    icon: Info,          label: "Info"     },
  warning:  { bg: "bg-amber-50",  text: "text-amber-700",   border: "border-amber-200",  dot: "bg-amber-400",  icon: AlertTriangle, label: "Warning"  },
  critical: { bg: "bg-red-50",    text: "text-red-700",     border: "border-red-200",    dot: "bg-red-500",    icon: Zap,           label: "Critical" },
};

const ACTION_LABELS: Record<string, string> = {
  settings_changed:   "Settings Changed",   user_created:      "User Created",
  user_blocked:       "User Blocked",       vendor_approved:   "Vendor Approved",
  vendor_rejected:    "Vendor Rejected",    plan_updated:      "Plan Updated",
  plan_created:       "Plan Created",       payout_released:   "Payout Released",
  dispute_resolved:   "Dispute Resolved",   role_created:      "Role Created",
  role_updated:       "Role Updated",       city_added:        "City Added",
  commission_updated: "Commission Updated", ip_added:          "IP Whitelisted",
  password_changed:   "Password Changed",   login_failed:      "Login Failed",
  "2fa_toggled":      "2FA Toggled",        export_done:       "Data Exported",
  notification_sent:  "Notification Sent",  city_deactivated:  "City Deactivated",
};

export default function SetAuditTab() {
  const [search,   setSearch]   = useState("");
  const [severity, setSeverity] = useState<"all" | "info" | "warning" | "critical">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return AUDIT_LOG.filter(e =>
      (severity === "all" || e.severity === severity) &&
      (!search || e.detail.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        ACTION_LABELS[e.action]?.toLowerCase().includes(q))
    );
  }, [search, severity]);

  const counts = {
    info:     AUDIT_LOG.filter(e => e.severity === "info").length,
    warning:  AUDIT_LOG.filter(e => e.severity === "warning").length,
    critical: AUDIT_LOG.filter(e => e.severity === "critical").length,
  };

  return (
    <div className="space-y-4">

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["critical", "warning", "info"] as const).map(s => {
          const cfg = SEVERITY_CFG[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => setSeverity(prev => prev === s ? "all" : s)}
              className={`rounded-2xl p-4 border text-left transition-all
                ${severity === s
                  ? `${cfg.bg} ${cfg.border} ring-2 ring-offset-1 ring-${s === "critical" ? "red" : s === "warning" ? "amber" : "sky"}-400`
                  : `${cfg.bg} ${cfg.border} hover:shadow-sm`}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={cfg.text} />
                <p className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</p>
              </div>
              <p className={`text-2xl font-black ${cfg.text}`}>{counts[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search actor, target, action…"
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl
              focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
          {(["all", "critical", "warning", "info"] as const).map(s => (
            <button key={s} onClick={() => setSeverity(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize border transition-all
                ${severity === s
                  ? "bg-slate-700 text-white border-slate-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 flex-shrink-0">{filtered.length} entries</p>
      </div>

      {/* Log */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Filter size={24} className="text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No audit entries match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(e => {
              const cfg  = SEVERITY_CFG[e.severity];
              const Icon = cfg.icon;
              const isOpen = expanded === e.id;

              return (
                <div key={e.id}
                  className={`transition-colors hover:bg-slate-50/50
                    ${e.severity === "critical" ? "bg-red-50/20" : e.severity === "warning" ? "bg-amber-50/10" : ""}`}>

                  <button
                    onClick={() => setExpanded(prev => prev === e.id ? null : e.id)}
                    className="w-full flex items-start gap-3 px-5 py-4 text-left">

                    {/* Severity dot */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon size={14} className={cfg.text} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-black text-slate-700">
                          {ACTION_LABELS[e.action] ?? e.action}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5
                          rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{e.detail}</p>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-xs font-bold text-slate-600">{e.actor}</p>
                      <p className="text-xs text-slate-400">{e.timestamp.split(",")[0]}</p>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className={`mx-5 mb-4 rounded-xl border p-4 text-xs ${cfg.bg} ${cfg.border}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: "Actor",     value: `${e.actor} (${e.actorRole})`  },
                          { label: "Target",    value: e.target                       },
                          { label: "Timestamp", value: e.timestamp                    },
                          { label: "IP Address",value: e.ipAddress                    },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-slate-400 font-bold mb-0.5">{label}</p>
                            <p className={`font-bold ${cfg.text}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-current/10">
                        <p className="text-slate-400 font-bold mb-0.5">Full Detail</p>
                        <p className={`font-medium ${cfg.text}`}>{e.detail}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
