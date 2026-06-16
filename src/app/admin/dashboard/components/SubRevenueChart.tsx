// src/pages/admin/dashboard/components/SubRevenueChart.tsx

import { SUB_REVENUE_TREND } from "../mockAdminData";

const PLAN_COLORS = {
  basic:      { bar: "bg-sky-400",    label: "Basic",      text: "text-sky-600"     },
  premium:    { bar: "bg-violet-500", label: "Premium",    text: "text-violet-600"  },
  enterprise: { bar: "bg-amber-500",  label: "Enterprise", text: "text-amber-600"   },
};

function fmtK(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function SubRevenueChart() {
  const maxTotal = Math.max(
    ...SUB_REVENUE_TREND.map(m => m.basic + m.premium + m.enterprise), 1
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-black text-slate-800">Revenue Trend</p>
          <p className="text-xs text-slate-400 mt-0.5">Last 6 months — by plan</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {(Object.keys(PLAN_COLORS) as (keyof typeof PLAN_COLORS)[]).map(key => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${PLAN_COLORS[key].bar}`} />
              <span className="text-xs text-slate-500">{PLAN_COLORS[key].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-36">
        {SUB_REVENUE_TREND.map((m) => {
          const total   = m.basic + m.premium + m.enterprise;
          const totalH  = Math.round((total / maxTotal) * 144); // 144px max = h-36
          const basicH  = Math.round((m.basic      / total) * totalH);
          const premH   = Math.round((m.premium    / total) * totalH);
          const entH    = totalH - basicH - premH;

          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Total label on hover */}
              <p className="text-xs font-black text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity -mb-1">
                {fmtK(total)}
              </p>

              {/* Stacked bar */}
              <div className="w-full flex flex-col justify-end rounded-xl overflow-hidden"
                style={{ height: `${totalH}px`, minHeight: "8px" }}>
                <div className="bg-amber-500 w-full transition-all duration-700"
                  style={{ height: `${entH}px` }} />
                <div className="bg-violet-500 w-full transition-all duration-700"
                  style={{ height: `${premH}px` }} />
                <div className="bg-sky-400 w-full transition-all duration-700"
                  style={{ height: `${basicH}px` }} />
              </div>

              <p className="text-xs text-slate-400 font-medium">{m.month}</p>
            </div>
          );
        })}
      </div>

      {/* Latest month breakdown */}
      {(() => {
        const latest = SUB_REVENUE_TREND[SUB_REVENUE_TREND.length - 1];
        const total  = latest.basic + latest.premium + latest.enterprise;
        return (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            {[
              { key: "basic"      as const, val: latest.basic      },
              { key: "premium"    as const, val: latest.premium    },
              { key: "enterprise" as const, val: latest.enterprise },
            ].map(({ key, val }) => (
              <div key={key} className="text-center">
                <p className={`text-sm font-black ${PLAN_COLORS[key].text}`}>{fmtK(val)}</p>
                <p className="text-xs text-slate-400">{PLAN_COLORS[key].label}</p>
                <p className="text-xs text-slate-300">{Math.round((val / total) * 100)}%</p>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
