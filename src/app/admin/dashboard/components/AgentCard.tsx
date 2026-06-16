// src/pages/admin/dashboard/components/AgentCard.tsx

import { MapPin, Briefcase, IndianRupee, Scale, ChevronRight, TrendingUp } from "lucide-react";
import type { AgentRecord } from "../mockAdminData";
import AgentAvatar      from "./AgentAvatar";
import AgentStatusBadge from "./AgentStatusBadge";
import AgentPerfBadge   from "./AgentPerfBadge";

interface Props {
  agent:  AgentRecord;
  onView: () => void;
}

export default function AgentCard({ agent: a, onView }: Props) {
  return (
    <div
      onClick={onView}
      className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md
        hover:border-sky-200 transition-all cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <AgentAvatar name={a.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-slate-800 truncate">{a.name}</p>
            <AgentStatusBadge status={a.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{a.agentId} · {a.city}</p>
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-400 transition-colors flex-shrink-0 mt-1" />
      </div>

      {/* Performance badge */}
      <div className="mb-3">
        <AgentPerfBadge performance={a.performance} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center bg-sky-50 rounded-xl py-2">
          <p className="text-sm font-black text-sky-700">{a.totalLeads.toLocaleString("en-IN")}</p>
          <p className="text-xs text-slate-400">Leads</p>
        </div>
        <div className="text-center bg-violet-50 rounded-xl py-2">
          <p className="text-sm font-black text-violet-700">{a.vendors}</p>
          <p className="text-xs text-slate-400">Vendors</p>
        </div>
        <div className="text-center bg-emerald-50 rounded-xl py-2">
          <p className="text-sm font-black text-emerald-700">{a.disputesHandled}</p>
          <p className="text-xs text-slate-400">Disputes</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={10} /> {a.city}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee size={10} />
            {a.commission >= 1000
              ? `₹${(a.commission / 1000).toFixed(0)}K`
              : `₹${a.commission}`}
          </span>
        </div>
        <span className="text-xs text-slate-400">{a.lastActive}</span>
      </div>
    </div>
  );
}
