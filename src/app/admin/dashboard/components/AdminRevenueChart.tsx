// src/pages/admin/dashboard/components/AdminRevenueChart.tsx

import { useState } from "react";
import { REVENUE_CHART, type Period } from "../mockAdminData";

interface Props {
  period: Period;
}

function fmt(n: number): string {
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}L`;
  if (n >= 1000)    return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function AdminRevenueChart({ period }: Props) {
  const data   = REVENUE_CHART[period];
  const maxRev = Math.max(...data.map(d => d.revenue));
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-800">Revenue Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Gross revenue vs platform fee</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" /> Gross
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Platform Fee
          </span>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-40 px-1">
        {data.map((d, i) => {
          const revPct = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
          const feePct = maxRev > 0 ? (d.platformFee / maxRev) * 100 : 0;
          const isHov  = hovered === i;

          return (
            <div key={d.label}
              className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>

              {/* Tooltip */}
              <div className={`transition-all text-center ${isHov ? "opacity-100" : "opacity-0"}`}
                style={{ minHeight: "28px" }}>
                <div className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                  {fmt(d.revenue)} · {d.bookings} jobs
                </div>
              </div>

              {/* Bar group */}
              <div className="w-full flex items-end gap-0.5" style={{ height: "100px" }}>
                <div className="flex-1 rounded-t-lg transition-all duration-300 bg-sky-200 group-hover:bg-sky-500"
                  style={{ height: `${Math.max(revPct, 4)}%` }} />
                <div className="flex-1 rounded-t-lg transition-all duration-300 bg-emerald-200 group-hover:bg-emerald-400"
                  style={{ height: `${Math.max(feePct, 4)}%` }} />
              </div>

              <p className="text-xs text-slate-400 text-center truncate w-full" style={{ fontSize: "9px" }}>
                {d.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
