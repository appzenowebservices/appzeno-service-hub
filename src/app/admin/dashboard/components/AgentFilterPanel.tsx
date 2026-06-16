// src/pages/admin/dashboard/components/AgentFilterPanel.tsx

import { X } from "lucide-react";
import type { AgentStatus, AgentPerformance } from "./AgentStatusBadge";

const CITIES = ["All", "Ghaziabad", "Delhi", "Noida", "Lucknow", "Kanpur", "Varanasi"];

interface Props {
  statusFilter:   AgentStatus | "all";
  onStatusChange: (v: string) => void;
  perfFilter:     AgentPerformance | "all";
  onPerfChange:   (v: string) => void;
  cityFilter:     string;
  onCityChange:   (v: string) => void;
  filtersActive:  boolean;
  onClear:        () => void;
}

const STATUS_OPTS: { value: AgentStatus | "all"; label: string }[] = [
  { value: "all",      label: "All"      },
  { value: "active",   label: "Active"   },
  { value: "inactive", label: "Inactive" },
];

const PERF_OPTS: { value: AgentPerformance | "all"; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "excellent", label: "Excellent" },
  { value: "good",      label: "Good"      },
  { value: "average",   label: "Average"   },
  { value: "poor",      label: "Poor"      },
];

export default function AgentFilterPanel({
  statusFilter, onStatusChange,
  perfFilter,   onPerfChange,
  cityFilter,   onCityChange,
  filtersActive, onClear,
}: Props) {
  return (
    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-4">

      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-sky-700 uppercase tracking-widest">Filters</p>
        {filtersActive && (
          <button onClick={onClear}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Status */}
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

        {/* Performance */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">Performance</p>
          <div className="flex flex-wrap gap-1.5">
            {PERF_OPTS.map(o => (
              <button key={o.value} onClick={() => onPerfChange(o.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                  ${perfFilter === o.value
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">City</p>
          <div className="flex flex-wrap gap-1.5">
            {CITIES.map(c => (
              <button key={c} onClick={() => onCityChange(c)}
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
