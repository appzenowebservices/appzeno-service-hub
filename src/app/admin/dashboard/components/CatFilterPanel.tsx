// src/pages/admin/dashboard/components/CatFilterPanel.tsx

import { X } from "lucide-react";

interface Props {
  statusFilter:   "all" | "active" | "inactive";
  onStatusChange: (v: string) => void;
  filtersActive:  boolean;
  onClear:        () => void;
}

const STATUS_OPTS = [
  { value: "all",      label: "All"      },
  { value: "active",   label: "Active"   },
  { value: "inactive", label: "Inactive" },
];

export default function CatFilterPanel({
  statusFilter, onStatusChange, filtersActive, onClear,
}: Props) {
  return (
    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-3">

      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-sky-700 uppercase tracking-widest">Filters</p>
        {filtersActive && (
          <button onClick={onClear}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTS.map(o => (
            <button key={o.value} onClick={() => onStatusChange(o.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                ${statusFilter === o.value
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
