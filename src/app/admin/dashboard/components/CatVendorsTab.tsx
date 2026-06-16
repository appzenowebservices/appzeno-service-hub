// src/pages/admin/dashboard/components/CatVendorsTab.tsx

import { Users, Star, MapPin } from "lucide-react";
import { CATEGORY_VENDORS } from "../mockAdminData";

const STATUS_CFG = {
  active:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Active"    },
  inactive:  { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400",   label: "Inactive"  },
  suspended: { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400",     label: "Suspended" },
};

function fmtRev(n: number) {
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}L`;
  if (n >= 1000)    return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

interface Props { categoryId: string; }

export default function CatVendorsTab({ categoryId }: Props) {
  const vendors = CATEGORY_VENDORS[categoryId] || [];

  if (vendors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Users size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">No vendors yet</p>
        <p className="text-xs text-slate-400 mt-1">No vendors registered in this category.</p>
      </div>
    );
  }

  const totalRev = vendors.reduce((s, v) => s + v.revenue, 0);

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Summary */}
      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
        <span className="text-xs text-slate-500 font-medium">{vendors.length} vendors registered</span>
        <span className="text-xs font-black text-slate-800">{fmtRev(totalRev)} total</span>
      </div>

      {/* Vendor list */}
      <div className="space-y-2.5">
        {vendors.map(v => {
          const cfg = STATUS_CFG[v.status];
          return (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                {/* Color avatar */}
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center
                  text-sky-700 font-black text-sm flex-shrink-0">
                  {v.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black text-slate-800 truncate">{v.name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5
                      rounded-full flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {v.city}
                    </span>
                    <span>{v.jobs} jobs</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-slate-800">{fmtRev(v.revenue)}</p>
                  <p className="text-xs text-amber-500 flex items-center justify-end gap-0.5">
                    <Star size={10} className="fill-amber-400" /> {v.rating}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
