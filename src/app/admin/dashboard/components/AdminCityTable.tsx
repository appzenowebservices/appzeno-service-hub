// src/pages/admin/dashboard/components/AdminCityTable.tsx

import { ChevronRight } from "lucide-react";
import type { CityData } from "../mockAdminData";

interface Props {
  cities:     CityData[];
  onNavigate: (tab: string) => void;
}

export default function AdminCityTable({ cities, onNavigate }: Props) {
  function fmtRevenue(n: number): string {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${(n / 1000).toFixed(0)}K`;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">City Breakdown</h3>
        <button onClick={() => onNavigate("cities")}
          className="text-xs text-sky-600 font-bold hover:text-sky-700 flex items-center gap-1">
          Manage <ChevronRight size={12} />
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {cities.map(city => (
          <div key={city.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
            <div className={`w-2 h-2 rounded-full flex-shrink-0
              ${city.active ? "bg-emerald-400" : "bg-slate-300"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">{city.name}</p>
              <p className="text-xs text-slate-400">
                {city.vendors}V · {city.customers.toLocaleString()}C · {city.topCategory}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-black text-slate-800">{fmtRevenue(city.revenue)}</p>
              <p className={`text-xs font-bold ${city.growth > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                {city.growth > 0 ? `+${city.growth}%` : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
