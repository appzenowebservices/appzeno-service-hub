// src/pages/admin/dashboard/components/VendorOverviewTab.tsx

import { Star, Briefcase, CheckCircle2, Activity, TrendingUp, IndianRupee } from "lucide-react";
import type { VendorItem } from "../../../../agent/dashboard/mockAgentData";
import VendorKycBadge from "./VendorKycBadge";

interface Props {
  vendor: VendorItem;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 font-medium w-24 flex-shrink-0">{label}</span>
      <span className="text-xs font-bold text-slate-700 flex-1">{value}</span>
    </div>
  );
}

export default function VendorOverviewTab({ vendor: v }: Props) {
  return (
    <div className="p-5 space-y-5">

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Rating",        value: `${v.rating}★`,         icon: Star,          color: "text-amber-600",   bg: "bg-amber-50"   },
          { label: "Jobs Done",     value: v.jobsDone,              icon: Briefcase,     color: "text-violet-600",  bg: "bg-violet-50"  },
          { label: "Completion",    value: `${v.completionRate}%`,  icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Response Rate", value: `${v.responseRate}%`,    icon: Activity,      color: "text-sky-600",     bg: "bg-sky-50"     },
          { label: "Active Jobs",   value: v.activeJobs,            icon: TrendingUp,    color: "text-cyan-600",    bg: "bg-cyan-50"    },
          { label: "Total Earnings",value: `₹${v.totalEarnings.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 flex items-center gap-3`}>
            <Icon size={16} className={`${color} flex-shrink-0`} />
            <div className="min-w-0">
              <p className={`text-sm font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vendor info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Vendor Info</p>
        <Row label="Owner"    value={v.ownerName} />
        <Row label="Category" value={v.category} />
        <Row label="Location" value={`${v.area}, ${v.city}`} />
        <Row label="Joined"   value={v.joinedDate} />
        <Row label="Services" value={v.services.join(", ")} />
      </div>

      {/* KYC Status */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">KYC Status</p>
        <VendorKycBadge
          aadhaar={v.kycAadhaar} pan={v.kycPan}
          photo={v.kycPhoto}   address={v.kycAddress}
        />
      </div>

      {/* Performance bars */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Performance</p>
        <div className="space-y-3">
          {[
            { label: "Completion Rate", value: v.completionRate, color: "bg-emerald-400" },
            { label: "Response Rate",   value: v.responseRate,   color: "bg-sky-400"     },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">{label}</span>
                <span className={`font-black ${value >= 85 ? "text-emerald-600" : value >= 70 ? "text-amber-600" : "text-red-500"}`}>
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
