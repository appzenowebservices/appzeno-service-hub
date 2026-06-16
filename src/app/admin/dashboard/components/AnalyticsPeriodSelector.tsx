// src/pages/admin/dashboard/components/AnalyticsPeriodSelector.tsx

import type { Period } from "../mockAdminData";

const OPTIONS: { key: Period; label: string }[] = [
  { key: "day",   label: "Today"     },
  { key: "week",  label: "This Week" },
  { key: "month", label: "This Month"},
  { key: "year",  label: "This Year" },
];

interface Props {
  period:   Period;
  onChange: (p: Period) => void;
}

export default function AnalyticsPeriodSelector({ period, onChange }: Props) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
      {OPTIONS.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
            ${period === o.key
              ? "bg-white text-sky-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
