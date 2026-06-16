// src/pages/admin/dashboard/components/FinRevenueChart.tsx

import { REVENUE_CHART, type Period } from "../mockAdminData";

function fmt(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

interface Props {
  period: Period;
  metric: "revenue" | "platformFee" | "bookings";
}

export default function FinRevenueChart({ period, metric }: Props) {
  const data   = REVENUE_CHART[period];
  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  const maxFee = Math.max(...data.map(d => d.platformFee), 1);
  const maxBk  = Math.max(...data.map(d => d.bookings), 1);

  const METRIC_CFG = {
    revenue:     { bar: "bg-sky-400",    label: "Gross Revenue",  getValue: (d: typeof data[0]) => d.revenue,     getMax: maxRev, color: "text-sky-600"    },
    platformFee: { bar: "bg-violet-500", label: "Platform Fee",   getValue: (d: typeof data[0]) => d.platformFee, getMax: maxFee, color: "text-violet-600" },
    bookings:    { bar: "bg-emerald-400",label: "Bookings",       getValue: (d: typeof data[0]) => d.bookings,    getMax: maxBk,  color: "text-emerald-600"},
  };

  const cfg = METRIC_CFG[metric];

  // Show both revenue + fee bars always
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-black text-slate-800">Revenue Chart</p>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{period} view</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-sky-400" /> Revenue
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-violet-400" /> Platform Fee
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-emerald-400" /> Bookings
          </div>
        </div>
      </div>

      {/* Dual bars */}
      <div className="flex items-end gap-1.5 h-44 mb-3">
        {data.map((d) => {
          const revPct = Math.round((d.revenue     / maxRev) * 176);
          const feePct = Math.round((d.platformFee / maxRev) * 176);

          return (
            <div key={d.label} className="flex-1 flex flex-col items-end gap-0 group relative">
              {/* Tooltip — fixed: position:absolute on the tooltip div itself, parent is relative */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                bg-slate-800 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap z-10 shadow-lg">
                <p className="font-bold">₹{fmt(d.revenue)}</p>
                <p className="text-slate-300">Fee: ₹{fmt(d.platformFee)}</p>
                <p className="text-slate-300">Bookings: {d.bookings}</p>
              </div>

              {/* Bar container — fixed: both bars inside one relative container, aligned to bottom */}
              <div className="w-full relative flex items-end" style={{ height: "176px" }}>
                {/* Revenue bar — full width, from bottom */}
                <div className="absolute bottom-0 left-0 w-full rounded-t-lg bg-sky-400 transition-all duration-700"
                  style={{ height: `${revPct}px`, minHeight: "4px" }} />
                {/* Fee bar — overlaid on top of revenue bar, from bottom */}
                <div className="absolute bottom-0 left-0 w-full rounded-t-lg bg-violet-400 opacity-60 transition-all duration-700"
                  style={{ height: `${feePct}px`, minHeight: "4px" }} />
              </div>

              {/* Label — fixed: simple mt-2, no magic margin numbers */}
              <p className="text-xs text-slate-400 font-medium mt-2 whitespace-nowrap">{d.label}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom summary row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
        <div className="text-center">
          <p className="text-sm font-black text-sky-700">
            ₹{fmt(data.reduce((s, d) => s + d.revenue, 0))}
          </p>
          <p className="text-xs text-slate-400">Total Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-violet-700">
            ₹{fmt(data.reduce((s, d) => s + d.platformFee, 0))}
          </p>
          <p className="text-xs text-slate-400">Platform Fee</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-emerald-700">
            {data.reduce((s, d) => s + d.bookings, 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">Bookings</p>
        </div>
      </div>
    </div>
  );
}
