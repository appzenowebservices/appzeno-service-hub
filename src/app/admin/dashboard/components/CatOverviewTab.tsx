// src/pages/admin/dashboard/components/CatOverviewTab.tsx

import { IndianRupee, Briefcase, Users, TrendingUp, Star, BarChart2 } from "lucide-react";
import type { CategoryPerf } from "../mockAdminData";
import { CATEGORY_VENDORS } from "../mockAdminData";

function fmtRev(n: number) {
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}L`;
  if (n >= 1000)    return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 font-medium w-28 flex-shrink-0">{label}</span>
      <span className="text-xs font-bold text-slate-700 flex-1">{value}</span>
    </div>
  );
}

interface Props { category: CategoryPerf; }

export default function CatOverviewTab({ category: c }: Props) {
  const vendors        = CATEGORY_VENDORS[c.id] || [];
  const activeVendors  = vendors.filter(v => v.status === "active").length;
  const avgRating      = vendors.length > 0
    ? (vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1)
    : "—";

  // city breakdown from vendors
  const cityMap: Record<string, number> = {};
  vendors.forEach(v => { cityMap[v.city] = (cityMap[v.city] || 0) + 1; });
  const cities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);

  const maxVendors = Math.max(...cities.map(([, n]) => n), 1);

  return (
    <div className="p-5 space-y-5">

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Revenue",  value: fmtRev(c.revenue),               icon: IndianRupee, color: "text-sky-600",     bg: "bg-sky-50"     },
          { label: "Total Bookings", value: c.bookings.toLocaleString(),      icon: Briefcase,   color: "text-violet-600",  bg: "bg-violet-50"  },
          { label: "Vendors",        value: `${activeVendors} / ${c.vendors}`,icon: Users,       color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Growth",         value: c.growth > 0 ? `+${c.growth}%` : "—", icon: TrendingUp, color: c.growth > 0 ? "text-green-600" : "text-slate-400", bg: c.growth > 0 ? "bg-green-50" : "bg-slate-50" },
          { label: "Avg Booking",    value: `₹${c.avgPrice.toLocaleString()}`,icon: BarChart2,   color: "text-amber-600",   bg: "bg-amber-50"   },
          { label: "Avg Rating",     value: avgRating !== "—" ? `${avgRating} ★` : "—", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 flex items-center gap-3`}>
            <Icon size={16} className={`${color} flex-shrink-0`} />
            <div className="min-w-0">
              <p className={`text-sm font-black ${color} truncate`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Category Info</p>
        <Row label="Category ID" value={c.id} />
        <Row label="Status"      value={c.active ? "Active — Accepting bookings" : "Inactive — Paused"} />
        <Row label="Avg Price"   value={`₹${c.avgPrice.toLocaleString("en-IN")} per booking`} />
        <Row label="Total Vendors" value={`${c.vendors} registered`} />
      </div>

      {/* City breakdown */}
      {cities.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Vendor City Distribution</p>
          <div className="space-y-2.5">
            {cities.map(([city, count]) => (
              <div key={city}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{city}</span>
                  <span className="font-black text-slate-800">{count} vendors</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((count / maxVendors) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
