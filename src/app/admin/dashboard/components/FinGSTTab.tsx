// src/pages/admin/dashboard/components/FinGSTTab.tsx

import { FileCheck, AlertCircle, Clock, IndianRupee, Calculator, FileText } from "lucide-react";
import { GST_SUMMARY } from "../mockAdminData";

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

const FILING_CFG = {
  filed:   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FileCheck,    label: "Filed"   },
  pending: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,        label: "Pending" },
  overdue: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: AlertCircle,  label: "Overdue" },
};

export default function FinGSTTab() {
  const ytdTotal      = GST_SUMMARY.reduce((s, g) => s + g.totalGST, 0);
  const ytdTaxable    = GST_SUMMARY.reduce((s, g) => s + g.taxableAmount, 0);
  const ytdCGST       = GST_SUMMARY.reduce((s, g) => s + g.cgst, 0);
  const ytdSGST       = GST_SUMMARY.reduce((s, g) => s + g.sgst, 0);
  const pending       = GST_SUMMARY.filter(g => g.filedStatus === "pending");
  const overdue       = GST_SUMMARY.filter(g => g.filedStatus === "overdue");
  const latestPending = pending[pending.length - 1];

  return (
    <div className="space-y-5">

      {/* Alert for pending/overdue */}
      {(pending.length > 0 || overdue.length > 0) && (
        <div className={`flex items-start gap-3 rounded-2xl p-4 border
          ${overdue.length > 0
            ? "bg-red-50 border-red-200"
            : "bg-amber-50 border-amber-200"}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
            ${overdue.length > 0 ? "bg-red-100" : "bg-amber-100"}`}>
            {overdue.length > 0
              ? <AlertCircle size={18} className="text-red-600" />
              : <Clock size={18} className="text-amber-600" />}
          </div>
          <div>
            <p className={`text-sm font-black ${overdue.length > 0 ? "text-red-800" : "text-amber-800"}`}>
              {overdue.length > 0
                ? `${overdue.length} GST filing(s) overdue — file immediately`
                : `${pending.length} GST filing pending`}
            </p>
            <p className={`text-xs mt-1 ${overdue.length > 0 ? "text-red-600" : "text-amber-600"}`}>
              {latestPending
                ? `${latestPending.month} — ₹${(latestPending.totalGST / 100000).toFixed(1)}L due`
                : "Take action to avoid penalties"}
            </p>
          </div>
        </div>
      )}

      {/* YTD summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "YTD Taxable",  value: fmt(ytdTaxable), color: "text-slate-700",   bg: "bg-slate-50",    icon: Calculator   },
          { label: "Total GST",    value: fmt(ytdTotal),   color: "text-amber-700",   bg: "bg-amber-50",    icon: IndianRupee  },
          { label: "CGST (9%)",    value: fmt(ytdCGST),    color: "text-violet-700",  bg: "bg-violet-50",   icon: FileText     },
          { label: "SGST (9%)",    value: fmt(ytdSGST),    color: "text-sky-700",     bg: "bg-sky-50",      icon: FileText     },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className={`${color} opacity-70`} />
              <p className="text-xs text-slate-500">{label}</p>
            </div>
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">Sep 25 – Feb 26</p>
          </div>
        ))}
      </div>

      {/* GST filing table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-slate-800">GST Filing Summary</p>
            <p className="text-xs text-slate-400 mt-0.5">Monthly GSTR-1 filing status</p>
          </div>
          <span className="text-xs font-bold text-slate-400">GST Rate: 18%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-400">
                <th className="px-5 py-3 font-bold">Month</th>
                <th className="px-5 py-3 font-bold text-right">Taxable Amount</th>
                <th className="px-5 py-3 font-bold text-right">CGST (9%)</th>
                <th className="px-5 py-3 font-bold text-right">SGST (9%)</th>
                <th className="px-5 py-3 font-bold text-right">Total GST</th>
                <th className="px-5 py-3 font-bold">Filing Status</th>
              </tr>
            </thead>
            <tbody>
              {GST_SUMMARY.map(g => {
                const cfg = FILING_CFG[g.filedStatus];
                const Icon = cfg.icon;
                return (
                  <tr key={g.month}
                    className={`border-b border-slate-50 last:border-0 transition-colors
                      ${g.filedStatus === "overdue" ? "bg-red-50/30" :
                        g.filedStatus === "pending" ? "bg-amber-50/30" :
                        "hover:bg-slate-50/40"}`}>
                    <td className="px-5 py-3.5 font-bold text-slate-700">{g.month}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-700">{fmt(g.taxableAmount)}</td>
                    <td className="px-5 py-3.5 text-right text-violet-700 font-bold">{fmt(g.cgst)}</td>
                    <td className="px-5 py-3.5 text-right text-sky-700 font-bold">{fmt(g.sgst)}</td>
                    <td className="px-5 py-3.5 text-right font-black text-amber-700">{fmt(g.totalGST)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                        text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals row */}
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-200">
                <td className="px-5 py-3.5 font-black text-slate-800">YTD Total</td>
                <td className="px-5 py-3.5 text-right font-black text-slate-800">{fmt(ytdTaxable)}</td>
                <td className="px-5 py-3.5 text-right font-black text-violet-800">{fmt(ytdCGST)}</td>
                <td className="px-5 py-3.5 text-right font-black text-sky-800">{fmt(ytdSGST)}</td>
                <td className="px-5 py-3.5 text-right font-black text-amber-800">{fmt(ytdTotal)}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {GST_SUMMARY.filter(g => g.filedStatus === "filed").length}/{GST_SUMMARY.length} filed
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* GST breakdown donut-style */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <p className="text-sm font-black text-slate-800 mb-4">Monthly GST Trend</p>
        <div className="flex items-end gap-2 h-28">
          {(() => {
            const maxGST = Math.max(...GST_SUMMARY.map(x => x.totalGST), 1);
            return GST_SUMMARY.map((g, i) => {
            const h      = Math.round((g.totalGST / maxGST) * 112);
            const isLast = i === GST_SUMMARY.length - 1;
            const color  =
              g.filedStatus === "overdue" ? "bg-red-400" :
              g.filedStatus === "pending" ? "bg-amber-400" :
              "bg-amber-300";
            return (
              <div key={g.month} className="flex-1 flex flex-col items-center gap-1 group">
                <p className="text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: "10px" }}>
                  {fmt(g.totalGST)}
                </p>
                <div className={`w-full rounded-t-xl transition-all duration-700 ${color}`}
                  style={{ height: `${h}px`, minHeight: "6px" }} />
                <p className="text-xs text-slate-400" style={{ fontSize: "10px" }}>
                  {g.month.split(" ")[0]}
                </p>
              </div>
            );
          });
          })()}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-3 h-3 rounded-full bg-amber-300" /> Filed
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-3 h-3 rounded-full bg-amber-400" /> Pending
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-3 h-3 rounded-full bg-red-400" /> Overdue
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">GST Info</p>
        <div className="space-y-1.5 text-xs text-slate-500">
          <p>• Platform services are taxed at <strong className="text-slate-700">18% GST</strong> (CGST 9% + SGST 9%)</p>
          <p>• GSTR-1 filing is due by the <strong className="text-slate-700">11th of the following month</strong></p>
          <p>• Input Tax Credit (ITC) applicable on platform expenses</p>
          <p>• Vendor payouts are GST-exclusive — vendors file their own GSTR</p>
        </div>
      </div>
    </div>
  );
}
