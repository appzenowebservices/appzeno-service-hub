// src/pages/agent/dashboard/components/StatsGrid.tsx

import {
  Users, Briefcase, CheckCircle2, IndianRupee,
  Star, AlertTriangle, UserPlus, Activity,
} from "lucide-react";
import type { StatData } from "../mockAgentData";
import type { Period } from "./PeriodSelector";

interface Props {
  stats:  StatData;
  period: Period;
}

const PERIOD_LABEL: Record<Period, string> = {
  day:   "Today",
  week:  "This Week",
  month: "This Month",
  year:  "This Year",
};

export default function StatsGrid({ stats, period }: Props) {
  const pl = PERIOD_LABEL[period];

  const CARDS = [
    {
      label:   "Total Vendors",
      value:   stats.totalVendors,
      sub:     `${stats.activeVendors} currently active`,
      icon:    Users,
      color:   "text-violet-600",
      bg:      "bg-violet-50",
      border:  "border-violet-200",
    },
    {
      label:   "Active Jobs",
      value:   stats.activeJobsToday,
      sub:     `${stats.completedJobs} completed ${pl.toLowerCase()}`,
      icon:    Activity,
      color:   "text-blue-600",
      bg:      "bg-blue-50",
      border:  "border-blue-200",
    },
    {
      label:   `Revenue ${pl}`,
      value:   `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      sub:     `Platform: ₹${stats.platformRevenue.toLocaleString("en-IN")}`,
      icon:    IndianRupee,
      color:   "text-emerald-600",
      bg:      "bg-emerald-50",
      border:  "border-emerald-200",
    },
    {
      label:   `Your Commission ${pl}`,
      value:   `₹${stats.agentCommission.toLocaleString("en-IN")}`,
      sub:     "5% of platform earnings",
      icon:    Briefcase,
      color:   "text-amber-600",
      bg:      "bg-amber-50",
      border:  "border-amber-200",
    },
    {
      label:   "Avg Vendor Rating",
      value:   `${stats.avgVendorRating}★`,
      sub:     "Across all active vendors",
      icon:    Star,
      color:   "text-yellow-600",
      bg:      "bg-yellow-50",
      border:  "border-yellow-200",
    },
    {
      label:   "New Registrations",
      value:   stats.newRegistrations,
      sub:     `${pl} signups`,
      icon:    UserPlus,
      color:   "text-cyan-600",
      bg:      "bg-cyan-50",
      border:  "border-cyan-200",
    },
    {
      label:   "Open Disputes",
      value:   stats.disputesOpen,
      sub:     `${stats.disputesResolved} resolved ${pl.toLowerCase()}`,
      icon:    AlertTriangle,
      color:   stats.disputesOpen > 3 ? "text-red-600" : "text-orange-600",
      bg:      stats.disputesOpen > 3 ? "bg-red-50"   : "bg-orange-50",
      border:  stats.disputesOpen > 3 ? "border-red-200" : "border-orange-200",
    },
    {
      label:   "Pending Approvals",
      value:   stats.approvalsP,
      sub:     "KYC review required",
      icon:    CheckCircle2,
      color:   stats.approvalsP > 0 ? "text-rose-600"  : "text-green-600",
      bg:      stats.approvalsP > 0 ? "bg-rose-50"     : "bg-green-50",
      border:  stats.approvalsP > 0 ? "border-rose-200": "border-green-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
        <div key={label}
          className={`bg-white rounded-2xl border-2 ${border} p-4 hover:shadow-md transition-shadow`}>
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
            <Icon size={18} className={color} />
          </div>
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">{label}</p>
          <p className="text-xs text-slate-400 mt-1 leading-snug">{sub}</p>
        </div>
      ))}
    </div>
  );
}
