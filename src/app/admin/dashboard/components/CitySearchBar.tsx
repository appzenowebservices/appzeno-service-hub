// src/pages/admin/dashboard/components/CitySearchBar.tsx

import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "revenue",   label: "Highest Revenue"  },
  { value: "bookings",  label: "Most Bookings"     },
  { value: "vendors",   label: "Most Vendors"      },
  { value: "customers", label: "Most Customers"    },
  { value: "growth",    label: "Fastest Growing"   },
  { value: "name",      label: "Name A–Z"          },
];

interface Props {
  search: string; onSearch: (v: string) => void;
  sortBy: string; onSort:   (v: string) => void;
  showFilter: boolean; onToggleFilter: () => void;
  filtersActive: boolean;
}

export default function CitySearchBar({ search, onSearch, sortBy, onSort, showFilter, onToggleFilter, filtersActive }: Props) {
  return (
    <div className="flex gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => onSearch(e.target.value)}
          placeholder="Search city, state, district, pincode…"
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
            focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
        {search && (
          <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="relative">
        <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <select value={sortBy} onChange={e => onSort(e.target.value)}
          className="pl-8 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl appearance-none
            cursor-pointer focus:outline-none focus:border-sky-400 font-medium text-slate-700 transition-all">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <button onClick={onToggleFilter}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all
          ${showFilter || filtersActive
            ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-200"
            : "bg-white text-slate-600 border-slate-200 hover:border-sky-400 hover:text-sky-600"}`}>
        <SlidersHorizontal size={15} /> Filters
        {filtersActive && !showFilter && <span className="w-2 h-2 rounded-full bg-white opacity-80" />}
      </button>
    </div>
  );
}
