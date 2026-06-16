// src/pages/admin/dashboard/components/AgentOverviewTab.tsx

import { Briefcase, Scale, IndianRupee, TrendingUp, Users, Clock } from "lucide-react";
import type { AgentRecord } from "../mockAdminData";

interface Props {
  agent: AgentRecord;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 font-medium w-24 flex-shrink-0">{label}</span>
      <span className="text-xs font-bold text-slate-700 flex-1">{value}</span>
    </div>
  );
}

export default function AgentOverviewTab({ agent: a }: Props) {
  const commissionFormatted = a.commission >= 100000
    ? `₹${(a.commission / 100000).toFixed(1)}L`
    : `₹${(a.commission / 1000).toFixed(0)}K`;

  // derive simple performance %s from available data
  const leadConvRate = a.totalLeads > 0
    ? Math.min(Math.round((a.vendors / a.totalLeads) * 1000), 100)
    : 0;
  const activityScore =
    a.performance === "excellent" ? 95 :
    a.performance === "good"      ? 78 :
    a.performance === "average"   ? 55 : 28;

  return (
    <div className="p-5 space-y-5">

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Leads",    value: a.totalLeads.toLocaleString("en-IN"), icon: TrendingUp,   color: "text-sky-600",     bg: "bg-sky-50"     },
          { label: "Vendors Managed",value: String(a.vendors),                    icon: Users,        color: "text-violet-600",  bg: "bg-violet-50"  },
          { label: "Disputes",       value: String(a.disputesHandled),            icon: Scale,        color: "text-amber-600",   bg: "bg-amber-50"   },
          { label: "Commission",     value: commissionFormatted,                  icon: IndianRupee,  color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Since",   value: a.joinedDate,                         icon: Clock,        color: "text-cyan-600",    bg: "bg-cyan-50"    },
          { label: "Last Active",    value: a.lastActive,                         icon: Briefcase,    color: "text-indigo-600",  bg: "bg-indigo-50"  },
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

      {/* Agent info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Agent Info</p>
        <Row label="Agent ID" value={a.agentId}   />
        <Row label="City"     value={a.city}       />
        <Row label="Email"    value={a.email}      />
        <Row label="Phone"    value={a.phone}      />
        <Row label="Joined"   value={a.joinedDate} />
      </div>

      {/* Performance bars */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Performance</p>
        <div className="space-y-3">
          {[
            { label: "Activity Score",       value: activityScore, color: "bg-sky-400"     },
            { label: "Lead-to-Vendor Rate",  value: leadConvRate,  color: "bg-violet-400"  },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">{label}</span>
                <span className={`font-black ${value >= 70 ? "text-emerald-600" : value >= 40 ? "text-amber-600" : "text-red-500"}`}>
                  {value}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`}
                  style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
