// src/pages/admin/dashboard/components/FinPLTab.tsx

import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { MONTHLY_PL } from "../mockAdminData";

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function Delta({ curr, prev }: { curr: number; prev: number }) {
  if (!prev) return null;
  const pct  = ((curr - prev) / prev) * 100;
  const up   = pct >= 0;
  return (
    <span className={`text-xs font-bold ml-1.5 ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

const ROWS: { key: keyof typeof MONTHLY_PL[0]; label: string; sign: "pos" | "neg" | "neutral"; bold?: boolean }[] = [
  { key: "grossRevenue",  label: "Gross Revenue",        sign: "pos",    bold: true  },
  { key: "platformFee",   label: "Platform Fee (20%)",   sign: "pos"                  },
  { key: "payouts",       label: "Vendor Payouts",       sign: "neg"                  },
  { key: "commissions",   label: "Agent Commissions",    sign: "neg"                  },
  { key: "subscriptions", label: "Subscription Income",  sign: "pos"                  },
  { key: "refunds",       label: "Refunds Issued",       sign: "neg"                  },
  { key: "gstCollected",  label: "GST Collected",        sign: "neutral"              },
  { key: "netProfit",     label: "Net Profit",           sign: "pos",    bold: true   },
  { key: "bookings",      label: "Total Bookings",       sign: "neutral"              },
];

export default function FinPLTab() {
  const data = [...MONTHLY_PL];
  const totals = {
    grossRevenue:  data.reduce((s, m) => s + m.grossRevenue, 0),
    platformFee:   data.reduce((s, m) => s + m.platformFee, 0),
    payouts:       data.reduce((s, m) => s + m.payouts, 0),
    commissions:   data.reduce((s, m) => s + m.commissions, 0),
    subscriptions: data.reduce((s, m) => s + m.subscriptions, 0),
    refunds:       data.reduce((s, m) => s + m.refunds, 0),
    gstCollected:  data.reduce((s, m) => s + m.gstCollected, 0),
    netProfit:     data.reduce((s, m) => s + m.netProfit, 0),
    bookings:      data.reduce((s, m) => s + m.bookings, 0),
  };

  const latestPL  = data[data.length - 1];
  const margin    = ((latestPL.netProfit / latestPL.grossRevenue) * 100).toFixed(1);
  const feeRatio  = ((latestPL.platformFee / latestPL.grossRevenue) * 100).toFixed(0);
  const refundRatio = ((latestPL.refunds / latestPL.grossRevenue) * 100).toFixed(2);

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "6-Month Revenue",  value: fmt(totals.grossRevenue), color: "text-sky-700",     bg: "bg-sky-50"    },
          { label: "6-Month Profit",   value: fmt(totals.netProfit),    color: "text-emerald-700", bg: "bg-emerald-50"},
          { label: "Profit Margin",    value: `${margin}%`,             color: "text-violet-700",  bg: "bg-violet-50" },
          { label: "Refund Rate",      value: `${refundRatio}%`,        color: parseFloat(refundRatio) > 2 ? "text-red-700" : "text-slate-700", bg: parseFloat(refundRatio) > 2 ? "bg-red-50" : "bg-slate-50" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* P&L Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-black text-slate-800">Profit & Loss Statement</p>
          <p className="text-xs text-slate-400 mt-0.5">Sep 2025 — Feb 2026 (6 months)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-3 font-bold w-44">Metric</th>
                {data.map(m => (
                  <th key={m.month} className="px-4 py-3 font-bold text-right whitespace-nowrap">{m.month}</th>
                ))}
                <th className="px-4 py-3 font-bold text-right bg-slate-100 whitespace-nowrap">6M Total</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ key, label, sign, bold }, ri) => {
                const isNetProfit   = key === "netProfit";
                const isGrossRev    = key === "grossRevenue";
                const isSeparator   = key === "netProfit" || key === "gstCollected";
                return (
                  <tr key={key}
                    className={`border-b border-slate-50 last:border-0
                      ${bold ? "bg-slate-50/60" : "hover:bg-slate-50/40"}
                      ${isSeparator ? "border-t-2 border-slate-200" : ""} transition-colors`}>
                    <td className={`px-5 py-3 ${bold ? "font-black text-slate-800" : "text-slate-600"} whitespace-nowrap`}>
                      {label}
                    </td>
                    {data.map((m, mi) => {
                      const val  = m[key] as number;
                      const prev = mi > 0 ? data[mi - 1][key] as number : null;
                      const colorClass =
                        !bold           ? "text-slate-600" :
                        sign === "pos"  ? "text-emerald-700" :
                        sign === "neg"  ? "text-red-700" :
                        "text-amber-700";
                      return (
                        <td key={m.month} className={`px-4 py-3 text-right whitespace-nowrap
                          ${bold ? `font-black ${colorClass}` : "font-medium text-slate-700"}`}>
                          {key === "bookings" ? val.toLocaleString() : fmt(val)}
                          {bold && prev !== null && <Delta curr={val} prev={prev} />}
                        </td>
                      );
                    })}
                    {/* Total column */}
                    <td className={`px-4 py-3 text-right bg-slate-100 whitespace-nowrap
                      ${bold ? `font-black ${
                        sign === "pos"  ? "text-emerald-700" :
                        sign === "neg"  ? "text-red-700" : "text-amber-700"}` : "font-bold text-slate-700"}`}>
                      {key === "bookings"
                        ? (totals[key] as number).toLocaleString()
                        : fmt(totals[key] as number)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Margin analysis */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <p className="text-sm font-black text-slate-800 mb-4">Margin Trend</p>
        <div className="flex items-end gap-3 h-24">
          {data.map((m, i) => {
            const marginPct = Math.round((m.netProfit / m.grossRevenue) * 100);
            const h         = Math.round((marginPct / 25) * 96); // 25% = max
            const isLast    = i === data.length - 1;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                <p className="text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {marginPct}%
                </p>
                <div className={`w-full rounded-t-xl transition-all duration-700
                  ${isLast ? "bg-emerald-500" : "bg-emerald-200"}`}
                  style={{ height: `${h}px`, minHeight: "6px" }} />
                <p className="text-xs text-slate-400" style={{ fontSize: "10px" }}>
                  {m.month.split(" ")[0]}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">Net profit margin — currently at {margin}%</p>
      </div>
    </div>
  );
}
