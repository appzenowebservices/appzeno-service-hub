// src/pages/admin/dashboard/components/FinBreakdownTab.tsx

import { useState } from "react";
import { BarChart2, MapPin } from "lucide-react";
import { CATEGORY_REVENUE, CITY_REVENUE } from "../mockAdminData";

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

type View = "category" | "city";

export default function FinBreakdownTab() {
  const [view, setView] = useState<View>("category");

  const maxCatRev  = Math.max(...CATEGORY_REVENUE.map(c => c.revenue), 1);
  const maxCityRev = Math.max(...CITY_REVENUE.map(c => c.revenue), 1);
  const totalRev   = CATEGORY_REVENUE.reduce((s, c) => s + c.revenue, 0);
  const totalFee   = CATEGORY_REVENUE.reduce((s, c) => s + c.platformFee, 0);
  // Fix: separate total for city view share % calculation
  const totalCityRev = CITY_REVENUE.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="space-y-5">

      {/* Tab toggle */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        {(["category", "city"] as View[]).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all
              ${view === v
                ? "bg-white text-sky-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"}`}>
            {v === "category" ? <BarChart2 size={13} /> : <MapPin size={13} />}
            By {v === "category" ? "Category" : "City"}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
          <p className="text-xl font-black text-sky-700">{fmt(totalRev)}</p>
          <p className="text-xs text-slate-500 mt-1">Total Revenue</p>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
          <p className="text-xl font-black text-violet-700">{fmt(totalFee)}</p>
          <p className="text-xs text-slate-500 mt-1">Platform Fee</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-xl font-black text-emerald-700">
            {((totalFee / totalRev) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Avg Take Rate</p>
        </div>
      </div>

      {/* Category breakdown */}
      {view === "category" && (
        <>
          {/* Visual bars */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-sm font-black text-slate-800 mb-4">Revenue by Category</p>
            <div className="space-y-3.5">
              {CATEGORY_REVENUE.sort((a, b) => b.revenue - a.revenue).map(c => (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.icon}</span>
                      <span className="font-bold text-slate-700">{c.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${c.growth > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                        {c.growth > 0 ? `+${c.growth}%` : "—"}
                      </span>
                      <span className="font-black text-slate-800">{fmt(c.revenue)}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden bg-slate-100">
                    <div className="bg-sky-400 rounded-l-full transition-all duration-700"
                      style={{ width: `${Math.round((c.revenue / maxCatRev) * 100)}%` }} />
                    <div className="bg-violet-400 rounded-r-full transition-all duration-700"
                      style={{ width: `${Math.round((c.platformFee / maxCatRev) * 100)}%` }} />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span>{c.bookings} bookings</span>
                    <span>Avg ₹{c.avgValue.toLocaleString()}</span>
                    <span>Fee: {fmt(c.platformFee)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full bg-sky-400" /> Revenue
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full bg-violet-400" /> Platform Fee
              </div>
            </div>
          </div>

          {/* Category table */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left text-slate-400">
                    <th className="px-4 py-3 font-bold">Category</th>
                    <th className="px-4 py-3 font-bold text-right">Revenue</th>
                    <th className="px-4 py-3 font-bold text-right">Platform Fee</th>
                    <th className="px-4 py-3 font-bold text-right">Bookings</th>
                    <th className="px-4 py-3 font-bold text-right">Avg Value</th>
                    <th className="px-4 py-3 font-bold text-right">Share</th>
                    <th className="px-4 py-3 font-bold text-right">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORY_REVENUE.sort((a, b) => b.revenue - a.revenue).map(c => (
                    <tr key={c.category} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.icon}</span>
                          <span className="font-bold text-slate-700">{c.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-800">{fmt(c.revenue)}</td>
                      <td className="px-4 py-3 text-right font-bold text-violet-700">{fmt(c.platformFee)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 font-bold">{c.bookings}</td>
                      <td className="px-4 py-3 text-right text-slate-600">₹{c.avgValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-600">
                        {((c.revenue / totalRev) * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${c.growth > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                          {c.growth > 0 ? `+${c.growth}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* City breakdown */}
      {view === "city" && (
        <>
          {/* Visual bars */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-sm font-black text-slate-800 mb-4">Revenue by City</p>
            <div className="space-y-3.5">
              {CITY_REVENUE.sort((a, b) => b.revenue - a.revenue).map(c => (
                <div key={c.city}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center
                        text-sky-700 font-black text-xs flex-shrink-0">
                        {c.city.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{c.city}</span>
                      <span className="text-slate-400">{c.state}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.growth > 0 && (
                        <span className="text-xs font-bold text-emerald-600">+{c.growth}%</span>
                      )}
                      <span className="font-black text-slate-800">{fmt(c.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((c.revenue / maxCityRev) * 100)}%` }} />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span>{c.bookings} bookings</span>
                    <span>{c.vendors} vendors</span>
                    <span>Fee: {fmt(c.platformFee)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* City table */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left text-slate-400">
                    <th className="px-4 py-3 font-bold">City</th>
                    <th className="px-4 py-3 font-bold">State</th>
                    <th className="px-4 py-3 font-bold text-right">Revenue</th>
                    <th className="px-4 py-3 font-bold text-right">Platform Fee</th>
                    <th className="px-4 py-3 font-bold text-right">Bookings</th>
                    <th className="px-4 py-3 font-bold text-right">Vendors</th>
                    <th className="px-4 py-3 font-bold text-right">Share</th>
                    <th className="px-4 py-3 font-bold text-right">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {CITY_REVENUE.sort((a, b) => b.revenue - a.revenue).map(c => (
                    <tr key={c.city} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-700">{c.city}</td>
                      <td className="px-4 py-3 text-slate-500">{c.state}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-800">{fmt(c.revenue)}</td>
                      <td className="px-4 py-3 text-right font-bold text-violet-700">{fmt(c.platformFee)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-600">{c.bookings}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{c.vendors}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-600">
                        {((c.revenue / totalCityRev) * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${c.growth > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                          {c.growth > 0 ? `+${c.growth}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
