// src/pages/admin/dashboard/components/AdminTopVendors.tsx

import { ChevronRight, Star } from "lucide-react";
import type { TopVendor } from "../mockAdminData";

interface Props {
  vendors:    TopVendor[];
  onNavigate: (tab: string) => void;
}

export default function AdminTopVendors({ vendors, onNavigate }: Props) {
  function fmtRevenue(n: number): string {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${(n / 1000).toFixed(0)}K`;
  }

  const statusDot: Record<TopVendor["status"], string> = {
    active:    "bg-emerald-400",
    suspended: "bg-red-400",
    inactive:  "bg-slate-300",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">Top Vendors</h3>
        <button onClick={() => onNavigate("vendors")}
          className="text-xs text-sky-600 font-bold hover:text-sky-700 flex items-center gap-1">
          All Vendors <ChevronRight size={12} />
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {vendors.map((v, i) => (
          <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-black text-slate-400 w-4 flex-shrink-0">{i + 1}.</span>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{v.name}</p>
              <p className="text-xs text-slate-400">{v.city} · {v.category}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-xs font-black text-slate-800">{fmtRevenue(v.revenue)}</p>
              <p className="text-xs text-amber-500 flex items-center justify-end gap-0.5">
                <Star size={9} className="fill-amber-400" /> {v.rating}
              </p>
            </div>

            <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-1 ${statusDot[v.status]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
