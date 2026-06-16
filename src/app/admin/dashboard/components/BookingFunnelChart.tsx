// src/pages/admin/dashboard/components/BookingFunnelChart.tsx

import { BOOKING_FUNNEL } from "../mockAdminData";

export default function BookingFunnelChart() {
  const top = BOOKING_FUNNEL[0].count;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-black text-slate-700 mb-1">Booking Conversion Funnel</h3>
      <p className="text-xs text-slate-400 mb-5">Monthly — how users convert to confirmed bookings</p>

      <div className="space-y-3">
        {BOOKING_FUNNEL.map((step, i) => {
          const widthPct = (step.count / top) * 100;
          const isLast   = i === BOOKING_FUNNEL.length - 1;
          return (
            <div key={step.step}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">{step.step}</span>
                <div className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-red-500 font-bold">−{step.dropoffPct}%</span>
                  )}
                  <span className="font-black text-slate-800">{step.count.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="h-8 bg-slate-50 rounded-xl overflow-hidden relative">
                <div
                  className="h-full rounded-xl flex items-center pl-3 transition-all duration-700"
                  style={{
                    width: `${widthPct}%`,
                    background: isLast
                      ? `linear-gradient(90deg, ${step.color}, #34d399)`
                      : step.color,
                    minWidth: "2rem",
                  }}
                >
                  <span className="text-white text-xs font-black">
                    {((step.count / top) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              {!isLast && (
                <div className="flex justify-center mt-1">
                  <div className="w-0.5 h-2 bg-slate-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall conversion */}
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs text-slate-500">Overall conversion (open → booked)</span>
        <span className="text-sm font-black text-emerald-600">
          {((BOOKING_FUNNEL[BOOKING_FUNNEL.length - 1].count / top) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
