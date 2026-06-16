// src/pages/customer/booking/components/StepBar.tsx
import { Check } from "lucide-react";
import { STEPS } from "../data";

export default function StepBar({ current }: { current: number }) {
  return (
    <div className="w-full">
      {/* Mobile: compact progress */}
      <div className="flex sm:hidden items-center justify-between mb-1">
        <p className="text-xs font-black text-emerald-600">Step {current + 1} of 7</p>
        <p className="text-xs text-slate-400 font-medium">{STEPS[current].label}</p>
      </div>
      <div className="sm:hidden h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${((current + 1) / 7) * 100}%` }}
        />
      </div>

      {/* Desktop: full steps */}
      <div className="hidden sm:flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                  ${done   ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : active ? "bg-slate-900 text-white shadow-md ring-2 ring-emerald-400 ring-offset-1"
                           : "bg-slate-100 text-slate-400"}`}>
                  {done ? <Check size={13} /> : s.short}
                </div>
                <p className={`text-xs font-semibold whitespace-nowrap
                  ${active ? "text-slate-800" : done ? "text-emerald-600" : "text-slate-300"}`}>
                  {s.label}
                </p>
              </div>
              {i < 6 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500
                  ${i < current ? "bg-emerald-400" : "bg-slate-100"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
