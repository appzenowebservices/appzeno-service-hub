// src/pages/admin/dashboard/components/AnalyticsKPIStrip.tsx

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GROWTH_KPIS } from "../mockAdminData";

function fmt(value: number, unit: string): string {
  if (unit === "₹") {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000)   return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000)     return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  }
  if (unit === "%") return `${value}%`;
  if (value >= 1000) return value.toLocaleString("en-IN");
  return `${value}`;
}

export default function AnalyticsKPIStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {GROWTH_KPIS.map(k => {
        const isGood = (k.trend === "up" && k.positive) || (k.trend === "down" && !k.positive);
        const isBad  = (k.trend === "up" && !k.positive) || (k.trend === "down" && k.positive);
        const trendColor = isGood ? "text-emerald-600" : isBad ? "text-red-500" : "text-slate-400";
        const bgColor    = isGood ? "bg-emerald-50"    : isBad ? "bg-red-50"    : "bg-slate-50";
        const TrendIcon  = k.trend === "up" ? TrendingUp : k.trend === "down" ? TrendingDown : Minus;

        return (
          <div key={k.metric}
            className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="text-lg">{k.icon}</span>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${bgColor} ${trendColor}`}>
                <TrendIcon size={11} />
                {Math.abs(k.growthPct)}%
              </div>
            </div>
            <p className="text-xl font-black text-slate-800">{fmt(k.current, k.unit)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.metric}</p>
            <p className="text-xs text-slate-400 mt-1">prev: {fmt(k.previous, k.unit)}</p>
          </div>
        );
      })}
    </div>
  );
}
