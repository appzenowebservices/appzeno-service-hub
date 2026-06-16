// src/pages/admin/dashboard/components/VendorFilterPanel.tsx

import { X } from "lucide-react";
import type { VendorStatus } from "./VendorStatusBadge";

const CATEGORIES = [
  "All", "Plumbing", "Electrical", "AC Service",
  "Cleaning", "Pest Control", "Carpentry", "Appliance Repair",
];

const CITIES = ["All", "Ghaziabad", "Delhi", "Noida", "Lucknow", "Kanpur"];

const KYC_OPTIONS = [
  { value: "all",      label: "All"          },
  { value: "complete", label: "KYC Complete" },
  { value: "pending",  label: "KYC Pending"  },
];

interface Props {
  statusFilter:   VendorStatus | "all";
  onStatusChange: (v: string) => void;
  catFilter:      string;
  onCatChange:    (v: string) => void;
  cityFilter:     string;
  onCityChange:   (v: string) => void;
  kycFilter:      string;
  onKycChange:    (v: string) => void;
  filtersActive:  boolean;
  onClear:        () => void;
}

export default function VendorFilterPanel({
  statusFilter, onStatusChange,
  catFilter,    onCatChange,
  cityFilter,   onCityChange,
  kycFilter,    onKycChange,
  filtersActive, onClear,
}: Props) {

  const statusOptions: { value: VendorStatus | "all"; label: string }[] = [
    { value: "all",       label: "All"       },
    { value: "active",    label: "Active"    },
    { value: "inactive",  label: "Inactive"  },
    { value: "suspended", label: "Suspended" },
    { value: "pending",   label: "Pending"   },
  ];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Status */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map(o => (
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

        {/* KYC */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">KYC Status</p>
          <div className="flex flex-wrap gap-1.5">
            {KYC_OPTIONS.map(o => (
              <button key={o.value} onClick={() => onKycChange(o.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                  ${kycFilter === o.value
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => onCatChange(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                  ${catFilter === c
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"}`}>
                {c}
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
