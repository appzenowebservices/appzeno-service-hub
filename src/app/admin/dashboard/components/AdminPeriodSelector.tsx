// src/pages/admin/dashboard/components/AdminPeriodSelector.tsx

import type { Period } from "../mockAdminData";

const PERIODS: { key: Period; label: string }[] = [
  { key: "day",   label: "Today"      },
  { key: "week",  label: "This Week"  },
  { key: "month", label: "This Month" },
  { key: "year",  label: "This Year"  },
];

interface Props {
  value:    Period;
  onChange: (p: Period) => void;
}

export default function AdminPeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
      {PERIODS.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
            ${value === key
              ? "bg-white text-sky-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
