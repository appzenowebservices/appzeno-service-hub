// src/pages/admin/dashboard/components/RevenueTrendChart.tsx

import { useState } from "react";
import { REVENUE_TREND_12M } from "../mockAdminData";

type Metric = "grossRevenue" | "platformFee" | "netProfit" | "bookings";

const METRIC_CFG: Record<Metric, { label: string; color: string; fill: string; unit: string }> = {
  grossRevenue: { label: "Gross Revenue", color: "#0ea5e9", fill: "#0ea5e920", unit: "₹" },
  platformFee:  { label: "Platform Fee",  color: "#8b5cf6", fill: "#8b5cf620", unit: "₹" },
  netProfit:    { label: "Net Profit",    color: "#10b981", fill: "#10b98120", unit: "₹" },
  bookings:     { label: "Bookings",      color: "#f59e0b", fill: "#f59e0b20", unit: ""  },
};

function fmtVal(v: number, unit: string) {
  if (unit === "₹") {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    return `₹${(v / 1000).toFixed(0)}K`;
  }
  return v.toLocaleString("en-IN");
}

export default function RevenueTrendChart() {
  const [metric, setMetric] = useState<Metric>("grossRevenue");
  const [hovered, setHovered] = useState<number | null>(null);

  const data   = REVENUE_TREND_12M;
  const values = data.map(d => d[metric] as number);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range  = maxVal - minVal || 1;

  const W = 660;
  const H = 180;
  const PAD_L = 12; const PAD_R = 12; const PAD_T = 20; const PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const pts = data.map((d, i) => ({
    x: PAD_L + (i / (data.length - 1)) * plotW,
    y: PAD_T + plotH - ((( d[metric] as number) - minVal) / range) * plotH,
    val: d[metric] as number,
    label: d.shortMonth,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x},${H - PAD_B} L${pts[0].x},${H - PAD_B} Z`;

  const cfg = METRIC_CFG[metric];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h3 className="text-sm font-black text-slate-700">Revenue Trend — Last 12 Months</h3>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {(Object.keys(METRIC_CFG) as Metric[]).map(m => (
            <button key={m} onClick={() => setMetric(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${metric === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {METRIC_CFG[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Current value display */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-black" style={{ color: cfg.color }}>
          {fmtVal(hovered !== null ? pts[hovered].val : values[values.length - 1], cfg.unit)}
        </span>
        <span className="text-sm text-slate-400">
          {hovered !== null ? data[hovered].month : data[data.length - 1].month}
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(pct => {
            const y = PAD_T + plotH * (1 - pct);
            return (
              <g key={pct}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                  stroke="#f1f5f9" strokeWidth="1" />
                <text x={PAD_L} y={y - 3} fontSize="9" fill="#94a3b8" textAnchor="start">
                  {fmtVal(minVal + range * pct, cfg.unit)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${metric})`} />

          {/* Line */}
          <path d={pathD} fill="none" stroke={cfg.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Month labels */}
          {pts.map((p, i) => (
            <text key={i} x={p.x} y={H - 4} fontSize="9" fill="#94a3b8" textAnchor="middle">
              {p.label}
            </text>
          ))}

          {/* Hover dots + tooltip trigger */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="10" fill="transparent"
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
              {(hovered === i) && (
                <>
                  <line x1={p.x} y1={PAD_T} x2={p.x} y2={H - PAD_B}
                    stroke={cfg.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                  <circle cx={p.x} cy={p.y} r="5" fill={cfg.color} />
                  <circle cx={p.x} cy={p.y} r="3" fill="white" />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Mini sparkline summary */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
        <div className="text-center flex-1">
          <p className="text-xs text-slate-400">12M Total</p>
          <p className="text-sm font-black text-slate-700">
            {fmtVal(values.reduce((a, b) => a + b, 0), cfg.unit)}
          </p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-slate-400">Peak</p>
          <p className="text-sm font-black text-slate-700">{fmtVal(maxVal, cfg.unit)}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-slate-400">Avg / Month</p>
          <p className="text-sm font-black text-slate-700">
            {fmtVal(Math.round(values.reduce((a, b) => a + b, 0) / values.length), cfg.unit)}
          </p>
        </div>
      </div>
    </div>
  );
}
