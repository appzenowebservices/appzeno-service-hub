// src/pages/admin/dashboard/components/DisputeSearchBar.tsx

import { Search, X, ArrowUpDown } from "lucide-react";

interface Props {
  search:   string;
  onSearch: (v: string) => void;
  sortBy:   string;
  onSort:   (v: string) => void;
}

const SORT_OPTIONS = [
  { value: "date_desc",    label: "Newest First"      },
  { value: "date_asc",     label: "Oldest First"      },
  { value: "amount_desc",  label: "Highest Amount"    },
  { value: "escalated",    label: "Escalated First"   },
];

export default function DisputeSearchBar({ search, onSearch, sortBy, onSort }: Props) {
  return (
    <div className="flex gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search booking ID, customer, vendor, category…"
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
            focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
        />
        {search && (
          <button onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="relative">
        <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <select
          value={sortBy} onChange={e => onSort(e.target.value)}
          className="pl-8 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
            appearance-none cursor-pointer focus:outline-none focus:border-sky-400
            font-medium text-slate-700 transition-all">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
