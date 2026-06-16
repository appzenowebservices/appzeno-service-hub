// src/pages/admin/dashboard/components/DemandPatternCharts.tsx

import { useState } from "react";
import { HOURLY_PATTERN, DAY_PERF } from "../mockAdminData";

// ── Hourly Pattern ─────────────────────────────────────────────────────────────
function HourlyChart() {
  const [type, setType] = useState<"weekday" | "weekend">("weekday");
  const data   = HOURLY_PATTERN;
  const maxVal = Math.max(...data.map(h => Math.max(h.weekday, h.weekend)));
  const barW   = 100 / data.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black text-slate-600">Avg Hourly Bookings</p>
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5">
          {(["weekday", "weekend"] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all
                ${type === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
              {t === "weekday" ? "Weekday" : "Weekend"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-1 h-24">
        {data.map(h => {
          const val     = type === "weekday" ? h.weekday : h.weekend;
          const heightP = (val / maxVal) * 100;
          const isPeak  = val === Math.max(...data.map(d => type === "weekday" ? d.weekday : d.weekend));
          return (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1" title={`${h.label}: ${val}`}>
              <div className="w-full flex items-end" style={{ height: "80px" }}>
                <div
                  className={`w-full rounded-t-lg transition-all ${isPeak ? "bg-sky-600" : "bg-sky-300"}`}
                  style={{ height: `${heightP}%` }} />
              </div>
              {h.hour % 3 === 0 && (
                <span className="text-xs text-slate-400" style={{ fontSize: "9px" }}>{h.label.replace(" AM", "").replace(" PM", "")}</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Peak: {data.reduce((p, h) => (type === "weekday" ? h.weekday : h.weekend) > (type === "weekday" ? p.weekday : p.weekend) ? h : p).label}
      </p>
    </div>
  );
}

// ── Day of Week ────────────────────────────────────────────────────────────────
function DayPerfChart() {
  const maxBookings = Math.max(...DAY_PERF.map(d => d.bookings));
  return (
    <div>
      <p className="text-xs font-black text-slate-600 mb-3">Bookings by Day of Week</p>
      <div className="space-y-2">
        {DAY_PERF.map(d => {
          const pct     = (d.bookings / maxBookings) * 100;
          const isTop   = d.bookings === maxBookings;
          const isWeekend = d.day === "Saturday" || d.day === "Sunday";
          return (
            <div key={d.day} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 w-8 flex-shrink-0">{d.shortDay}</span>
              <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all duration-700
                    ${isTop ? "bg-sky-600" : isWeekend ? "bg-sky-400" : "bg-sky-300"}`}
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">
                  {d.bookings}
                </span>
              </div>
              <span className="text-xs text-slate-400 w-8 flex-shrink-0">
                {d.cancellations}✗
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Exported combined card ─────────────────────────────────────────────────────
export default function DemandPatternCharts() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-black text-slate-700 mb-1">Demand Patterns</h3>
      <p className="text-xs text-slate-400 mb-5">When customers book — optimise vendor availability</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HourlyChart />
        <DayPerfChart />
      </div>
    </div>
  );
}
