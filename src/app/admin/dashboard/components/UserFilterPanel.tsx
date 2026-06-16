// src/pages/admin/dashboard/components/UserFilterPanel.tsx

import { X } from "lucide-react";

const CITIES = ["All", "Ghaziabad", "Delhi", "Noida", "Lucknow", "Kanpur", "Varanasi"];

interface Props {
  statusFilter:  string;
  onStatusChange:(v: string) => void;
  cityFilter:    string;
  onCityChange:  (v: string) => void;
  filtersActive: boolean;
  onClear:       () => void;
}

export default function UserFilterPanel({
  statusFilter, onStatusChange,
  cityFilter, onCityChange,
  filtersActive, onClear,
}: Props) {

  const statusOptions = [
    { value: "all",     label: "All Users" },
    { value: "active",  label: "Active"    },
    { value: "blocked", label: "Blocked"   },
  ];

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-4">

      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-sky-700 uppercase tracking-widest">Active Filters</p>
        {filtersActive && (
          <button onClick={onClear}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Status filter */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">Account Status</p>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map(o => (
              <button key={o.value}
                onClick={() => onStatusChange(o.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                  ${statusFilter === o.value
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* City filter */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">City</p>
          <div className="flex gap-2 flex-wrap">
            {CITIES.map(c => (
              <button key={c}
                onClick={() => onCityChange(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                  ${cityFilter === c
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
