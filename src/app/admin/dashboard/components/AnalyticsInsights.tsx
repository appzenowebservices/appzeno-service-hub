// src/pages/admin/dashboard/components/AnalyticsInsights.tsx

import { ANALYTICS_INSIGHTS } from "../mockAdminData";

const TYPE_CFG = {
  achievement: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  opportunity: { bg: "bg-sky-50",     border: "border-sky-200",     badge: "bg-sky-100 text-sky-700"         },
  warning:     { bg: "bg-amber-50",   border: "border-amber-200",   badge: "bg-amber-100 text-amber-700"     },
  info:        { bg: "bg-slate-50",   border: "border-slate-200",   badge: "bg-slate-100 text-slate-600"     },
};

const TYPE_LABEL = {
  achievement: "Achievement",
  opportunity: "Opportunity",
  warning:     "Warning",
  info:        "Insight",
};

export default function AnalyticsInsights() {
  return (
    <div>
      <h3 className="text-sm font-black text-slate-700 mb-3">💡 Smart Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {ANALYTICS_INSIGHTS.map(ins => {
          const cfg = TYPE_CFG[ins.type];
          return (
            <div key={ins.id}
              className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{ins.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-black text-slate-800">{ins.title}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {TYPE_LABEL[ins.type]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ins.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-black text-slate-800">{ins.metric}</span>
                    <span className="text-xs text-slate-500">{ins.change}</span>
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
