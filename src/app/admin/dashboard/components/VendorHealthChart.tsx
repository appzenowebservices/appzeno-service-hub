// src/pages/admin/dashboard/components/VendorHealthChart.tsx

import { VENDOR_HEALTH, AGENT_LEADERBOARD } from "../mockAdminData";

const LABEL_DESC: Record<string, string> = {
  Elite:    "Consistently excellent performance",
  Good:     "Above average, reliable",
  Average:  "Meets expectations",
  "At Risk":"Declining quality, needs attention",
  Critical: "Below threshold, action required",
};

export default function VendorHealthChart() {
  const total = VENDOR_HEALTH.reduce((s, b) => s + b.count, 0);

  const COLORS = [
    { bar: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-100" },
    { bar: "bg-sky-500",     text: "text-sky-700",     badge: "bg-sky-100"     },
    { bar: "bg-amber-500",   text: "text-amber-700",   badge: "bg-amber-100"   },
    { bar: "bg-orange-500",  text: "text-orange-700",  badge: "bg-orange-100"  },
    { bar: "bg-red-500",     text: "text-red-700",     badge: "bg-red-100"     },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-700">Vendor Health Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">{total} vendors classified by rating</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-emerald-600">
            {(((VENDOR_HEALTH[0].count + VENDOR_HEALTH[1].count) / total) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-400">Elite + Good</p>
        </div>
      </div>

      <div className="space-y-3">
        {VENDOR_HEALTH.map((bucket, i) => {
          const pct = (bucket.count / total) * 100;
          const c   = COLORS[i];
          return (
            <div key={bucket.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`font-black ${c.text}`}>{bucket.label}</span>
                  <span className="text-slate-400">{bucket.range}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-black px-2 py-0.5 rounded-full text-xs ${c.badge} ${c.text}`}>
                    {bucket.count}
                  </span>
                  <span className="text-slate-400 w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                <div className={`h-full ${c.bar} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{LABEL_DESC[bucket.label]}</p>
            </div>
          );
        })}
      </div>

      {/* Agent leaderboard mini */}
      <div className="mt-5 pt-4 border-t border-slate-50">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Agent Leaderboard</p>
        <div className="space-y-2">
          {AGENT_LEADERBOARD.map(a => (
            <div key={a.agentId} className="flex items-center gap-3">
              <span className={`text-xs font-black w-5 text-center flex-shrink-0
                ${a.rank === 1 ? "text-amber-500" : a.rank === 2 ? "text-slate-400" : "text-slate-300"}`}>
                #{a.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 truncate">{a.name}</span>
                  <span className={`text-xs font-black ml-2 flex-shrink-0
                    ${a.score >= 90 ? "text-emerald-600" : a.score >= 75 ? "text-sky-600" : "text-amber-600"}`}>
                    {a.score}/100
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full
                    ${a.score >= 90 ? "bg-emerald-400" : a.score >= 75 ? "bg-sky-400" : "bg-amber-400"}`}
                    style={{ width: `${a.score}%` }} />
                </div>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{a.city}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
