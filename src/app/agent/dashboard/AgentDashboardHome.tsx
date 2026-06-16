// src/pages/agent/dashboard/AgentDashboardHome.tsx

import { useState } from "react";
import { useAuthStore }   from "../../../store/authStore";
import { Sparkles, MapPin } from "lucide-react";

import PeriodSelector, { type Period } from "./components/PeriodSelector";
import StatsGrid                        from "./components/StatsGrid";
import AlertsPanel                      from "./components/AlertsPanel";
import ActivityFeed                     from "./components/ActivityFeed";
import CommissionCard                   from "./components/CommissionCard";
import {
  getStats, getCommission,
  MOCK_ALERTS, MOCK_ACTIVITY,
} from "./mockAgentData";

export default function AgentDashboardHome() {
  const { user }            = useAuthStore();
  const [period, setPeriod] = useState<Period>("month");

  const stats      = getStats(period);
  const commission = getCommission(period);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" :
    hour < 17 ? "Good Afternoon" :
                "Good Evening";

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-br from-pink-600 via-pink-700 to-pink-900 rounded-2xl p-6 overflow-hidden text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-violet-300" />
                <span className="text-violet-300 text-xs font-semibold">{greeting}!</span>
              </div>
              <h2 className="text-2xl text-violet-800 mb-1">
                {user?.fullName?.split(" ")[0]} 👋
              </h2>
              <div className="flex items-center gap-1.5 text-violet-300 text-sm">
                <MapPin size={13} />
                <span>
                  {user?.assignedCity || user?.city || "Your City"} — City Agent
                </span>
              </div>
            </div>

            {/* Quick commission badge */}
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-xs text-violet-300 font-semibold mb-1">Commission This Month</p>
              <p className="text-2xl font-black text-amber-400">
                ₹{getCommission("month").agentShare.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-violet-300 mt-0.5">
                ₹{getCommission("month").creditedAmount.toLocaleString("en-IN")} credited
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Period Selector ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider">
          Overview
        </h3>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* ── Stats Grid ── */}
      <StatsGrid stats={stats} period={period} />

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left col — Alerts + Activity */}
        <div className="xl:col-span-2 space-y-6">
          <AlertsPanel alerts={MOCK_ALERTS} />
          <ActivityFeed activities={MOCK_ACTIVITY} />
        </div>

        {/* Right col — Commission */}
        <div className="xl:col-span-1">
          <CommissionCard data={commission} period={period} />
        </div>
      </div>

    </div>
  );
}
