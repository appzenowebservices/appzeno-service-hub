// src/pages/admin/dashboard/components/CityPerformanceTable.tsx

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CITY_RADAR, CITY_REVENUE } from "../mockAdminData";

type SortKey = "revenue" | "bookings" | "growth" | "vendors";

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function GrowthBadge({ pct }: { pct: number }) {
  const up = pct > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full
      ${up ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {pct > 0 ? `+${pct}%` : `${pct}%`}
    </span>
  );
}

export default function CityPerformanceTable() {
  const [sort, setSort] = useState<SortKey>("revenue");

  const sorted = [...CITY_REVENUE].sort((a, b) => {
    if (sort === "revenue")  return b.revenue  - a.revenue;
    if (sort === "bookings") return b.bookings - a.bookings;
    if (sort === "growth")   return b.growth   - a.growth;
    if (sort === "vendors")  return b.vendors  - a.vendors;
    return 0;
  });

  const maxRev = Math.max(...sorted.map(c => c.revenue));

  const SORT_BTNS: { key: SortKey; label: string }[] = [
    { key: "revenue",  label: "Revenue"  },
    { key: "bookings", label: "Bookings" },
    { key: "growth",   label: "Growth"   },
    { key: "vendors",  label: "Vendors"  },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-700">City Performance</h3>
          <p className="text-xs text-slate-400 mt-0.5">Current month breakdown</p>
        </div>
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
          {SORT_BTNS.map(b => (
            <button key={b.key} onClick={() => setSort(b.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${sort === b.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((city, i) => {
          const widthPct = (city.revenue / maxRev) * 100;
          // get radar score if available
          const radar = CITY_RADAR.find(r => r.city === city.city);
          return (
            <div key={city.city}>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                  <span className="text-sm font-black text-slate-800 truncate">{city.city}</span>
                  <span className="text-xs text-slate-400">{city.state}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <GrowthBadge pct={city.growth} />
                  <span className="text-sm font-black text-slate-800">{fmt(city.revenue)}</span>
                </div>
              </div>
              {/* Revenue bar */}
              <div className="h-2 bg-slate-50 rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full bg-sky-500 transition-all duration-700"
                  style={{ width: `${widthPct}%` }} />
              </div>
              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{city.bookings.toLocaleString("en-IN")} bookings</span>
                <span>{city.vendors} vendors</span>
                <span>{fmt(city.platformFee)} fee</span>
                {radar && (
                  <span className="ml-auto text-sky-600 font-bold">
                    Growth potential: {radar.growth}/100
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
