// src/pages/admin/dashboard/components/FinOverviewTab.tsx

import { TrendingUp, TrendingDown, Store, Users, AlertCircle, Star } from "lucide-react";
import { getPlatformStats, TOP_VENDORS, PENDING_PAYOUTS, MONTHLY_PL, type Period } from "../mockAdminData";
import FinRevenueChart from "./FinRevenueChart";

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

interface Props { period: Period; }

export default function FinOverviewTab({ period }: Props) {
  const s   = getPlatformStats(period);
  const pl  = MONTHLY_PL[MONTHLY_PL.length - 1];
  const pl_prev = MONTHLY_PL[MONTHLY_PL.length - 2];
  const pending = PENDING_PAYOUTS.filter(p => p.status === "pending");
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  const quickStats = [
    { label: "Gross Revenue",      value: fmt(s.totalRevenue),                color: "text-sky-700",    bg: "bg-sky-50"    },
    { label: "Platform Fee (20%)", value: fmt(s.platformFee),                 color: "text-violet-700", bg: "bg-violet-50" },
    { label: "Total Bookings",     value: s.totalBookings.toLocaleString(),   color: "text-slate-700",  bg: "bg-slate-50"  },
    { label: "Avg Order Value",    value: `₹${s.avgOrderValue.toLocaleString()}`, color: "text-amber-700",  bg: "bg-amber-50"  },
    { label: "Completed",          value: s.completedBookings.toLocaleString(), color: "text-emerald-700", bg: "bg-emerald-50"},
    { label: "Cancelled",          value: s.cancelledBookings.toLocaleString(), color: "text-red-700",    bg: "bg-red-50"    },
  ];

  const profitDelta = pl.netProfit - pl_prev.netProfit;
  const profitDeltaPct = ((profitDelta / pl_prev.netProfit) * 100).toFixed(1);

  return (
    <div className="space-y-5">

      {/* Revenue Chart */}
      <FinRevenueChart period={period} metric="revenue" />

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickStats.map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3.5`}>
            <p className={`text-lg font-black ${color} leading-none mb-1`}>{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Profit trend + pending payouts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Month-on-month profit */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <p className="text-sm font-black text-slate-800 mb-4">Monthly Profit Trend</p>
          <div className="flex items-end gap-2 h-28">
            {(() => {
              const maxP = Math.max(...MONTHLY_PL.map(x => x.netProfit), 1);
              return MONTHLY_PL.map((m, i) => {
              const h    = Math.round((m.netProfit / maxP) * 112);
              const isLast = i === MONTHLY_PL.length - 1;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full rounded-t-xl transition-all duration-700
                    ${isLast ? "bg-emerald-500" : "bg-slate-200"}`}
                    style={{ height: `${h}px`, minHeight: "6px" }} />
                  <p className="text-xs text-slate-400 whitespace-nowrap"
                    style={{ fontSize: "10px" }}>
                    {m.month.split(" ")[0]}
                  </p>
                </div>
              );
            });
            })()}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400">Net Profit (Feb 26)</p>
              <p className="text-lg font-black text-emerald-700">{fmt(pl.netProfit)}</p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold
              ${profitDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {profitDelta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {profitDelta >= 0 ? "+" : ""}{profitDeltaPct}% vs Jan
            </div>
          </div>
        </div>

        {/* Pending payouts */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-slate-800">Pending Payouts</p>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {pending.length} vendors
            </span>
          </div>
          <p className="text-2xl font-black text-amber-700 mb-1">{fmt(totalPending)}</p>
          <p className="text-xs text-slate-400 mb-4">Awaiting release this week</p>

          <div className="space-y-2.5">
            {pending.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center
                    text-amber-700 font-black text-xs flex-shrink-0">
                    {p.vendorName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-700 truncate">{p.vendorName}</p>
                    <p className="text-slate-400">{p.city} · {p.jobs} jobs</p>
                  </div>
                </div>
                <span className="font-black text-slate-800 flex-shrink-0 ml-3">{fmt(p.amount)}</span>
              </div>
            ))}
          </div>

          {pending.length > 4 && (
            <p className="text-xs text-sky-600 font-bold mt-3">+{pending.length - 4} more pending</p>
          )}
        </div>
      </div>

      {/* Top vendors by revenue */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <p className="text-sm font-black text-slate-800 mb-4">Top Vendors by Revenue</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-2 font-bold pr-4">#</th>
                <th className="pb-2 font-bold pr-4">Vendor</th>
                <th className="pb-2 font-bold pr-4">City</th>
                <th className="pb-2 font-bold pr-4">Category</th>
                <th className="pb-2 font-bold pr-4">Jobs</th>
                <th className="pb-2 font-bold pr-4">Revenue</th>
                <th className="pb-2 font-bold">Rating</th>
              </tr>
            </thead>
            <tbody>
              {TOP_VENDORS.map((v, i) => (
                <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-xs
                      ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "text-slate-400"}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-bold text-slate-700">{v.name}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{v.city}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{v.category}</td>
                  <td className="py-2.5 pr-4 font-bold text-slate-700">{v.jobs}</td>
                  <td className="py-2.5 pr-4 font-black text-slate-800">{fmt(v.revenue)}</td>
                  <td className="py-2.5">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={11} className="fill-amber-400" /> {v.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
