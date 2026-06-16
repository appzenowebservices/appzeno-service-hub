// src/pages/admin/dashboard/components/CategoryTrendChart.tsx

import { useState } from "react";
import { CATEGORY_TREND } from "../mockAdminData";

const LINES = [
  { key: "acService",   label: "AC Service",   color: "#0ea5e9", icon: "❄️" },
  { key: "cleaning",    label: "Cleaning",      color: "#10b981", icon: "🧹" },
  { key: "plumbing",    label: "Plumbing",      color: "#6366f1", icon: "🔧" },
  { key: "electrical",  label: "Electrical",    color: "#f59e0b", icon: "⚡" },
  { key: "pestControl", label: "Pest Control",  color: "#8b5cf6", icon: "🐛" },
  { key: "painting",    label: "Painting",      color: "#f97316", icon: "🎨" },
];

export default function CategoryTrendChart() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const data   = CATEGORY_TREND;
  const allVals = data.flatMap(d => LINES.map(l => d[l.key as keyof typeof d] as number));
  const maxVal  = Math.max(...allVals);

  const W = 580; const H = 160; const PAD_L = 8; const PAD_R = 8; const PAD_T = 16; const PAD_B = 24;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-black text-slate-700 mb-1">Category Bookings Trend — 6 Months</h3>
      <p className="text-xs text-slate-400 mb-4">Monthly booking volume per category</p>

      {/* Legend toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {LINES.map(l => (
          <button key={l.key}
            onClick={() => setHidden(prev => {
              const n = new Set(prev);
              n.has(l.key) ? n.delete(l.key) : n.add(l.key);
              return n;
            })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all
              ${hidden.has(l.key)
                ? "bg-slate-50 text-slate-400 border-slate-200 opacity-40"
                : "bg-white border-slate-200"}`}
            style={{ color: hidden.has(l.key) ? undefined : l.color,
                     borderColor: hidden.has(l.key) ? undefined : l.color + "60" }}>
            {l.icon} {l.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        {/* Grid */}
        {[0.33, 0.66, 1].map(pct => (
          <line key={pct}
            x1={PAD_L} y1={PAD_T + plotH * (1 - pct)}
            x2={W - PAD_R} y2={PAD_T + plotH * (1 - pct)}
            stroke="#f1f5f9" strokeWidth="1" />
        ))}

        {/* Lines */}
        {LINES.filter(l => !hidden.has(l.key)).map(l => {
          const pts = data.map((d, i) => {
            const v = d[l.key as keyof typeof d] as number;
            return {
              x: PAD_L + (i / (data.length - 1)) * plotW,
              y: PAD_T + plotH - (v / maxVal) * plotH,
            };
          });
          const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return (
            <g key={l.key}>
              <path d={pathD} fill="none" stroke={l.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill={l.color} />
              ))}
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i}
            x={PAD_L + (i / (data.length - 1)) * plotW}
            y={H - 4} fontSize="9" fill="#94a3b8" textAnchor="middle">
            {d.month.split(" ")[0]}
          </text>
        ))}
      </svg>

      {/* Latest values */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-50">
        {LINES.filter(l => !hidden.has(l.key)).map(l => {
          const latest = data[data.length - 1][l.key as keyof typeof data[0]] as number;
          const prev   = data[data.length - 2][l.key as keyof typeof data[0]] as number;
          const growth = (((latest - prev) / prev) * 100).toFixed(1);
          return (
            <div key={l.key} className="flex items-center gap-1.5">
              <span className="text-base">{l.icon}</span>
              <div>
                <p className="text-xs font-black text-slate-700">{latest} bookings</p>
                <p className="text-xs font-bold" style={{ color: l.color }}>+{growth}% MoM</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
