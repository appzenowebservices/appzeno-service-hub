// src/pages/admin/dashboard/components/VendorJobsTab.tsx

import { Briefcase } from "lucide-react";
import type { VendorItem } from "../../../../agent/dashboard/mockAgentData";

type JobStatus = "completed" | "ongoing" | "cancelled";

const JOB_STATUS_CFG: Record<JobStatus, { label: string; bg: string; text: string }> = {
  completed: { label: "Completed", bg: "bg-emerald-100", text: "text-emerald-700" },
  ongoing:   { label: "Ongoing",   bg: "bg-blue-100",    text: "text-blue-700"    },
  cancelled: { label: "Cancelled", bg: "bg-red-100",     text: "text-red-600"     },
};

interface Props {
  vendor: VendorItem;
}

export default function VendorJobsTab({ vendor: v }: Props) {
  if (v.recentJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Briefcase size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">No recent jobs</p>
        <p className="text-xs text-slate-400 mt-1">This vendor has no job history yet.</p>
      </div>
    );
  }

  const totalAmount = v.recentJobs.reduce((s, j) => s + j.amount, 0);

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Summary */}
      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
        <span className="text-xs text-slate-500 font-medium">{v.recentJobs.length} recent jobs</span>
        <span className="text-xs font-black text-slate-800">
          ₹{totalAmount.toLocaleString("en-IN")} total
        </span>
      </div>

      {/* Jobs list */}
      <div className="space-y-2.5">
        {v.recentJobs.map(job => {
          const status = job.status as JobStatus;
          const cfg    = JOB_STATUS_CFG[status] ?? JOB_STATUS_CFG.completed;
          return (
            <div key={job.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200
                flex items-center justify-center text-xl flex-shrink-0">
                {job.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 truncate">{job.service}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {job.customer} · {job.date}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-slate-800">
                  ₹{job.amount.toLocaleString("en-IN")}
                </p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
