// src/pages/admin/dashboard/components/CustomerSegmentsChart.tsx

import { useState } from "react";
import { CUSTOMER_SEGMENTS } from "../mockAdminData";

function fmt(n: number) {
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function CustomerSegmentsChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = CUSTOMER_SEGMENTS.reduce((s, c) => s + c.count, 0);

  // Build donut segments
  let cumulative = 0;
  const R = 60; const CX = 80; const CY = 80;
  const segments = CUSTOMER_SEGMENTS.map((seg, i) => {
    const startAngle = cumulative;
    const slice      = (seg.pct / 100) * 360;
    cumulative      += slice;
    const mid        = startAngle + slice / 2;

    const toRad = (a: number) => ((a - 90) * Math.PI) / 180;
    const x1 = CX + R * Math.cos(toRad(startAngle));
    const y1 = CY + R * Math.sin(toRad(startAngle));
    const x2 = CX + R * Math.cos(toRad(startAngle + slice));
    const y2 = CY + R * Math.sin(toRad(startAngle + slice));
    const large = slice > 180 ? 1 : 0;

    return { ...seg, i, x1, y1, x2, y2, large, midAngle: mid };
  });

  const COLORS = ["#8b5cf6","#0ea5e9","#10b981","#f59e0b","#f97316","#ef4444"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-black text-slate-700 mb-1">Customer Segments (RFM)</h3>
      <p className="text-xs text-slate-400 mb-4">{total.toLocaleString("en-IN")} customers classified by recency, frequency & spend</p>

      <div className="flex items-start gap-6">
        {/* Donut SVG */}
        <div className="flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {segments.map((seg, i) => {
              const color     = COLORS[i];
              const isHovered = hovered === i;
              const toRad     = (a: number) => ((a - 90) * Math.PI) / 180;
              const OR = isHovered ? 66 : 60;
              const IR = 34;

              const x1o = CX + OR * Math.cos(toRad(seg.startAngle ?? 0));
              const y1o = CY + OR * Math.sin(toRad(seg.startAngle ?? 0));
              const x2o = CX + OR * Math.cos(toRad((seg.startAngle ?? 0) + (seg.pct / 100) * 360));
              const y2o = CY + OR * Math.sin(toRad((seg.startAngle ?? 0) + (seg.pct / 100) * 360));

              // recalculate with segments cumulative
              let cum2 = 0;
              for (let j = 0; j < i; j++) cum2 += (CUSTOMER_SEGMENTS[j].pct / 100) * 360;
              const slice  = (seg.pct / 100) * 360;
              const xA1    = CX + OR * Math.cos(toRad(cum2));
              const yA1    = CY + OR * Math.sin(toRad(cum2));
              const xA2    = CX + OR * Math.cos(toRad(cum2 + slice));
              const yA2    = CY + OR * Math.sin(toRad(cum2 + slice));
              const xB1    = CX + IR * Math.cos(toRad(cum2 + slice));
              const yB1    = CY + IR * Math.sin(toRad(cum2 + slice));
              const xB2    = CX + IR * Math.cos(toRad(cum2));
              const yB2    = CY + IR * Math.sin(toRad(cum2));
              const large  = slice > 180 ? 1 : 0;

              return (
                <path key={i}
                  d={`M${xA1},${yA1} A${OR},${OR} 0 ${large} 1 ${xA2},${yA2} L${xB1},${yB1} A${IR},${IR} 0 ${large} 0 ${xB2},${yB2} Z`}
                  fill={color}
                  opacity={hovered === null || hovered === i ? 1 : 0.5}
                  style={{ transition: "all 0.2s", cursor: "pointer" }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
            {/* Centre label */}
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize="18" fontWeight="900" fill="#1e293b">
              {total.toLocaleString("en-IN")}
            </text>
            <text x={CX} y={CY + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">customers</text>
          </svg>
        </div>

        {/* Legend list */}
        <div className="flex-1 space-y-2 min-w-0">
          {CUSTOMER_SEGMENTS.map((seg, i) => (
            <div key={seg.segment}
              className={`flex items-center gap-2 p-2 rounded-xl transition-all cursor-default
                ${hovered === i ? "bg-slate-50" : ""}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-700 truncate">{seg.segment}</span>
                  <span className="text-xs font-black text-slate-600 flex-shrink-0">{seg.pct}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{seg.count.toLocaleString("en-IN")} users</span>
                  <span>·</span>
                  <span>avg {fmt(seg.avgSpend)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hovered detail */}
      {hovered !== null && (
        <div className="mt-4 bg-slate-50 rounded-xl px-4 py-3 text-xs border border-slate-100">
          <span className="font-black text-slate-700">{CUSTOMER_SEGMENTS[hovered].segment} — </span>
          <span className="text-slate-500">{CUSTOMER_SEGMENTS[hovered].desc}</span>
          <span className="ml-2 text-slate-600">· Avg {CUSTOMER_SEGMENTS[hovered].avgBookings} bookings/user</span>
        </div>
      )}
    </div>
  );
}
