// src/pages/admin/dashboard/components/AgentCommissionTab.tsx

import { IndianRupee } from "lucide-react";
import { AGENT_COMMISSION, type AgentCommissionMonth } from "../mockAdminData";

const STATUS_CFG: Record<AgentCommissionMonth["status"], { bg: string; text: string; label: string }> = {
  credited:   { bg: "bg-emerald-100", text: "text-emerald-700", label: "Credited"   },
  pending:    { bg: "bg-amber-100",   text: "text-amber-700",   label: "Pending"    },
  processing: { bg: "bg-blue-100",    text: "text-blue-700",    label: "Processing" },
};

interface Props {
  agentId: string;
}

export default function AgentCommissionTab({ agentId }: Props) {
  const history = AGENT_COMMISSION[agentId] || [];

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <IndianRupee size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">No commission history</p>
        <p className="text-xs text-slate-400 mt-1">Commission will appear once the agent is active.</p>
      </div>
    );
  }

  const totalCommission = history.reduce((s, h) => s + h.commission, 0);

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Summary banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3
        flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-600 font-medium">Total Paid Out</p>
          <p className="text-xl font-black text-emerald-700">
            ₹{totalCommission.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{history.length} months</p>
          <p className="text-xs font-bold text-slate-700">
            Avg ₹{Math.round(totalCommission / history.length).toLocaleString("en-IN")}/mo
          </p>
        </div>
      </div>

      {/* History cards */}
      <div className="space-y-2.5">
        {history.map((h, i) => {
          const cfg = STATUS_CFG[h.status];
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">

              {/* Month + status */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black text-slate-800">{h.month}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center bg-sky-50 rounded-xl py-2">
                  <p className="text-sm font-black text-sky-700">{h.leads}</p>
                  <p className="text-xs text-slate-400">Leads</p>
                </div>
                <div className="text-center bg-violet-50 rounded-xl py-2">
                  <p className="text-sm font-black text-violet-700">{h.vendors}</p>
                  <p className="text-xs text-slate-400">Vendors</p>
                </div>
                <div className="text-center bg-amber-50 rounded-xl py-2">
                  <p className="text-sm font-black text-amber-700">{h.disputes}</p>
                  <p className="text-xs text-slate-400">Disputes</p>
                </div>
              </div>

              {/* Revenue + commission */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                <span className="text-slate-500">
                  Gross Rev:{" "}
                  <span className="font-bold text-slate-700">
                    ₹{(h.grossRev / 100000).toFixed(1)}L
                  </span>
                </span>
                <span className="font-black text-emerald-700 text-sm">
                  +₹{h.commission.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
