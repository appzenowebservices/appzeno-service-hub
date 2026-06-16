// src/pages/admin/dashboard/components/AdminCategoryList.tsx

import { ChevronRight } from "lucide-react";
import type { CategoryPerf } from "../mockAdminData";

interface Props {
  categories: CategoryPerf[];
  onNavigate: (tab: string) => void;
}

export default function AdminCategoryList({ categories, onNavigate }: Props) {
  const active  = categories.filter(c => c.active);
  const maxRev  = Math.max(...active.map(c => c.revenue));

  function fmtRevenue(n: number): string {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${(n / 1000).toFixed(0)}K`;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">Top Categories</h3>
        <button onClick={() => onNavigate("categories")}
          className="text-xs text-sky-600 font-bold hover:text-sky-700 flex items-center gap-1">
          Manage <ChevronRight size={12} />
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {active.slice(0, 6).map(cat => {
          const pct = Math.round((cat.revenue / maxRev) * 100);
          return (
            <div key={cat.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{cat.icon}</span>
                <p className="text-xs font-bold text-slate-800 flex-1 truncate">{cat.name}</p>
                <span className="text-xs font-black text-sky-700">{fmtRevenue(cat.revenue)}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {cat.bookings} bookings · {cat.vendors} vendors · +{cat.growth}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
