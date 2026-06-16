// src/pages/admin/dashboard/components/AgentActivityTab.tsx

import { Activity } from "lucide-react";
import { AGENT_ACTIVITY, type AgentActivity } from "../mockAdminData";

const ACTIVITY_CFG: Record<AgentActivity["type"], { bg: string; text: string; label: string }> = {
  vendor_approved:    { bg: "bg-emerald-100", text: "text-emerald-700", label: "Approved"   },
  vendor_rejected:    { bg: "bg-red-100",     text: "text-red-700",     label: "Rejected"   },
  dispute_resolved:   { bg: "bg-blue-100",    text: "text-blue-700",    label: "Dispute"    },
  lead_converted:     { bg: "bg-violet-100",  text: "text-violet-700",  label: "Lead"       },
  city_visit:         { bg: "bg-cyan-100",    text: "text-cyan-700",    label: "Visit"      },
  commission_credited:{ bg: "bg-amber-100",   text: "text-amber-700",   label: "Commission" },
};

interface Props {
  agentId: string;
}

export default function AgentActivityTab({ agentId }: Props) {
  const activities = AGENT_ACTIVITY[agentId] || [];

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Activity size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">No activity yet</p>
        <p className="text-xs text-slate-400 mt-1">This agent has no recorded activity.</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Summary */}
      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
        <span className="text-xs text-slate-500 font-medium">{activities.length} recent actions</span>
        <span className="text-xs font-black text-slate-800">Last: {activities[0]?.date}</span>
      </div>

      {/* Activity list */}
      <div className="space-y-2.5">
        {activities.map(item => {
          const cfg = ACTIVITY_CFG[item.type];
          return (
            <div key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200
                flex items-center justify-center text-xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-sm font-black text-slate-800 truncate">{item.title}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{item.sub}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {item.amount != null && (
                  <p className="text-sm font-black text-emerald-700">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </p>
                )}
                <p className="text-xs text-slate-400">{item.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
