// src/pages/admin/dashboard/components/BookingHeatmap.tsx

import { useState } from "react";
import { BOOKING_HEATMAP, HEATMAP_DAYS, HEATMAP_HOURS } from "../mockAdminData";

function cellColor(value: number): string {
  if (value === 0)    return "bg-slate-50 border-slate-100";
  if (value < 30)     return "bg-sky-100 border-sky-200";
  if (value < 50)     return "bg-sky-200 border-sky-300";
  if (value < 65)     return "bg-sky-300 border-sky-400";
  if (value < 80)     return "bg-sky-400 border-sky-500";
  if (value < 90)     return "bg-sky-500 border-sky-600";
  return "bg-sky-600 border-sky-700";
}

function textColor(value: number): string {
  return value >= 50 ? "text-white" : "text-slate-600";
}

export default function BookingHeatmap() {
  const [hovered, setHovered] = useState<{ day: string; hour: string; val: number } | null>(null);

  function getVal(day: string, hour: string): number {
    return BOOKING_HEATMAP.find(c => c.day === day && c.hour === hour)?.value ?? 0;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-700">Booking Demand Heatmap</h3>
          <p className="text-xs text-slate-400 mt-0.5">Peak hours and days — higher intensity = more bookings</p>
        </div>
        {hovered && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-xs">
            <span className="font-bold text-sky-700">{hovered.day} {hovered.hour}</span>
            <span className="text-slate-500 ml-2">Intensity: <strong className="text-slate-700">{hovered.val}/100</strong></span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: 3 }}>
          <thead>
            <tr>
              <th className="text-xs font-bold text-slate-400 text-left pr-2 pb-1 w-10">Day</th>
              {HEATMAP_HOURS.map(h => (
                <th key={h} className="text-xs font-bold text-slate-400 text-center pb-1 min-w-[52px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEATMAP_DAYS.map(day => (
              <tr key={day}>
                <td className="text-xs font-bold text-slate-500 pr-2 py-0.5">{day}</td>
                {HEATMAP_HOURS.map(hour => {
                  const val = getVal(day, hour);
                  return (
                    <td key={hour}
                      className={`h-10 rounded-xl border text-center cursor-default transition-all
                        ${cellColor(val)} ${textColor(val)}`}
                      onMouseEnter={() => setHovered({ day, hour, val })}
                      onMouseLeave={() => setHovered(null)}>
                      <span className="text-xs font-bold">{val > 0 ? val : ""}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
        <span className="text-xs text-slate-400 mr-1">Low</span>
        {["bg-sky-100", "bg-sky-200", "bg-sky-300", "bg-sky-400", "bg-sky-500", "bg-sky-600"].map(c => (
          <div key={c} className={`w-6 h-4 rounded ${c}`} />
        ))}
        <span className="text-xs text-slate-400 ml-1">High</span>
      </div>
    </div>
  );
}
