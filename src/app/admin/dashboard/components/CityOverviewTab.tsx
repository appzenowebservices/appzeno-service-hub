// src/pages/admin/dashboard/components/CityOverviewTab.tsx

import { IndianRupee, Briefcase, Users, TrendingUp, Store, UserCheck, MapPin, Hash } from "lucide-react";
import type { CityData } from "../mockAdminData";

function fmtRev(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 font-medium w-28 flex-shrink-0">{label}</span>
      <span className="text-xs font-bold text-slate-700 flex-1">{value}</span>
    </div>
  );
}

interface Props { city: CityData; }

export default function CityOverviewTab({ city: c }: Props) {
  const avgBookingVal = c.bookings > 0 ? Math.round(c.revenue / c.bookings) : 0;

  return (
    <div className="p-5 space-y-5">

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Revenue",    value: fmtRev(c.revenue),                    icon: IndianRupee, color: "text-sky-600",     bg: "bg-sky-50"     },
          { label: "Total Bookings",   value: c.bookings.toLocaleString(),           icon: Briefcase,   color: "text-violet-600",  bg: "bg-violet-50"  },
          { label: "Customers",        value: c.customers.toLocaleString(),          icon: Users,       color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Vendors",          value: String(c.vendors),                     icon: Store,       color: "text-amber-600",   bg: "bg-amber-50"   },
          { label: "Growth",           value: c.growth > 0 ? `+${c.growth}%` : "—", icon: TrendingUp,  color: c.growth > 0 ? "text-green-600" : "text-slate-400", bg: c.growth > 0 ? "bg-green-50" : "bg-slate-50" },
          { label: "Avg Booking Value",value: avgBookingVal > 0 ? `₹${avgBookingVal.toLocaleString()}` : "—", icon: IndianRupee, color: "text-cyan-600", bg: "bg-cyan-50" },
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

      {/* City Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">City Info</p>
        <Row label="City ID"      value={c.id}           />
        <Row label="State"        value={c.state}        />
        <Row label="District"     value={c.district}     />
        <Row label="Pincode"      value={c.pincode}      />
        <Row label="Top Category" value={c.topCategory}  />
        <Row label="Status"       value={c.active ? "Active — Accepting bookings" : "Inactive — Paused"} />
      </div>

      {/* Assigned Agent */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Assigned Agent</p>
        {c.agent === "Unassigned" ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <UserCheck size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-700">No Agent Assigned</p>
              <p className="text-xs text-amber-600 mt-0.5">Assign an agent to activate this city</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-3 py-3">
            <div className="w-10 h-10 rounded-xl bg-sky-200 flex items-center justify-center
              text-sky-800 font-black text-sm flex-shrink-0">
              {c.agent.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{c.agent}</p>
              <p className="text-xs text-sky-600 mt-0.5 flex items-center gap-1">
                <MapPin size={10} /> Managing {c.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
