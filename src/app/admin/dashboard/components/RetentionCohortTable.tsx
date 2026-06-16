// src/pages/admin/dashboard/components/RetentionCohortTable.tsx

import { RETENTION_COHORTS } from "../mockAdminData";

const MONTHS = ["M0", "M1", "M2", "M3", "M4", "M5"];

function cellBg(val: number): string {
  if (val === 0)   return "bg-slate-50 text-slate-300";
  if (val === 100) return "bg-sky-600 text-white";
  if (val >= 45)   return "bg-sky-400 text-white";
  if (val >= 35)   return "bg-sky-300 text-slate-800";
  if (val >= 25)   return "bg-sky-200 text-slate-700";
  if (val >= 15)   return "bg-sky-100 text-slate-600";
  return "bg-slate-100 text-slate-500";
}

const MONTH_LABELS: Record<string, string> = {
  m0: "Start", m1: "+1M", m2: "+2M", m3: "+3M", m4: "+4M", m5: "+5M",
};

export default function RetentionCohortTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-black text-slate-700 mb-1">Customer Retention Cohorts</h3>
      <p className="text-xs text-slate-400 mb-4">% of customers still active each month after joining</p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-slate-500 font-bold pb-2 pr-4 min-w-[72px]">Cohort</th>
              <th className="text-left text-slate-500 font-bold pb-2 pr-4 min-w-[52px]">Size</th>
              {MONTHS.map(m => (
                <th key={m} className="text-center text-slate-500 font-bold pb-2 min-w-[54px]">
                  {MONTH_LABELS[m.toLowerCase()]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="space-y-1">
            {RETENTION_COHORTS.map(row => {
              const vals: Record<string, number> = {
                m0: row.m0, m1: row.m1, m2: row.m2,
                m3: row.m3, m4: row.m4, m5: row.m5,
              };
              return (
                <tr key={row.cohort}>
                  <td className="font-bold text-slate-700 pr-4 py-1">{row.cohort}</td>
                  <td className="text-slate-500 pr-4 py-1">{row.size.toLocaleString("en-IN")}</td>
                  {MONTHS.map(m => {
                    const v = vals[m.toLowerCase()];
                    return (
                      <td key={m} className="py-1 px-1">
                        <div className={`h-10 rounded-xl flex items-center justify-center font-black text-xs
                          ${cellBg(v)}`}>
                          {v > 0 ? `${v}%` : "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Avg retention note */}
      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-4 text-xs text-slate-500">
        <span>Avg M1 retention: <strong className="text-sky-700">45%</strong></span>
        <span>Avg M3 retention: <strong className="text-sky-700">32%</strong></span>
        <span className="text-emerald-600 font-bold">↑ Improving trend</span>
      </div>
    </div>
  );
}
