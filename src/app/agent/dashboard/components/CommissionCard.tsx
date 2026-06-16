// src/pages/agent/dashboard/components/CommissionCard.tsx

import { useState } from "react";
import {
  IndianRupee, TrendingUp, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Users,
} from "lucide-react";
import type { CommissionBreakdown } from "../mockAgentData";
import type { Period } from "./PeriodSelector";

interface Props {
  data:   CommissionBreakdown;
  period: Period;
}

const PERIOD_LABEL: Record<Period, string> = {
  day:   "Today",
  week:  "This Week",
  month: "This Month",
  year:  "This Year",
};

export default function CommissionCard({ data, period }: Props) {
  const [expanded, setExpanded] = useState(false);
  const pl = PERIOD_LABEL[period];

  const creditedPct = data.agentShare > 0
    ? Math.round((data.creditedAmount / data.agentShare) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl overflow-hidden text-white">

      {/* Top section */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee size={16} className="text-amber-400" />
          <h3 className="font-black text-sm text-slate-300 uppercase tracking-wide">
            Commission — {pl}
          </h3>
        </div>

        {/* Main amount */}
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-4xl font-black text-amber-400">
              ₹{data.agentShare.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-400 mt-1">5% of platform earnings</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-emerald-400 justify-end">
              <TrendingUp size={14} />
              <span className="text-sm font-black">+{creditedPct}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">credited</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Credited</span>
            <span className="text-slate-400">Pending</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${creditedPct}%` }}
            />
          </div>
        </div>

        {/* Credited / Pending pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Gross Revenue</p>
            <p className="text-sm font-black">₹{data.totalGross.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-emerald-500/20 rounded-xl p-3 text-center border border-emerald-400/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 size={10} className="text-emerald-400" />
              <p className="text-xs text-emerald-300">Credited</p>
            </div>
            <p className="text-sm font-black text-emerald-400">
              ₹{data.creditedAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-amber-500/20 rounded-xl p-3 text-center border border-amber-400/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={10} className="text-amber-400" />
              <p className="text-xs text-amber-300">Pending</p>
            </div>
            <p className="text-sm font-black text-amber-400">
              ₹{data.pendingAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Vendor breakdown toggle */}
      <div className="border-t border-white/10">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2">
            <Users size={13} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-300">Top Vendors by Commission</span>
          </div>
          {expanded
            ? <ChevronUp  size={14} className="text-slate-400" />
            : <ChevronDown size={14} className="text-slate-400" />}
        </button>

        {expanded && (
          <div className="px-5 pb-4 space-y-2">
            {data.vendors.map((v, i) => (
              <div key={v.name}
                className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-xs font-black text-slate-500 w-4 flex-shrink-0">
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-300 truncate">{v.name}</p>
                  <p className="text-2xs text-slate-500">{v.jobs} jobs · ₹{v.gross.toLocaleString("en-IN")} gross</p>
                </div>
                <span className="text-xs font-black text-amber-400 flex-shrink-0">
                  +₹{v.agentEarned.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
