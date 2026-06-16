// src/pages/admin/dashboard/components/UserProfileTab.tsx

import { Star, ShoppingBag, IndianRupee, TrendingUp, Clock } from "lucide-react";
import type { CustomerRecord } from "../mockAdminData";
import { CUSTOMER_BOOKINGS } from "../mockAdminData";

interface Props {
  customer: CustomerRecord;
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className={`text-xs font-bold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function UserProfileTab({ customer: c }: Props) {
  const bookings   = CUSTOMER_BOOKINGS[c.id] ?? [];
  const completed  = bookings.filter(b => b.status === "completed").length;
  const disputed   = bookings.filter(b => b.status === "disputed").length;
  const cancelled  = bookings.filter(b => b.status === "cancelled").length;
  const avgSpend   = c.totalBookings > 0
    ? Math.round(c.totalSpend / c.totalBookings)
    : 0;

  // Category frequency
  const catCount: Record<string, number> = {};
  bookings.forEach(b => {
    catCount[b.service] = (catCount[b.service] ?? 0) + 1;
  });
  const topService = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="space-y-5 px-5 py-4">

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Bookings", value: c.totalBookings, icon: ShoppingBag, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Total Spend",    value: `₹${c.totalSpend.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Avg Order Value",value: `₹${avgSpend.toLocaleString("en-IN")}`,    icon: TrendingUp,  color: "text-sky-600",     bg: "bg-sky-50"     },
          { label: "Rating Given",   value: `${c.rating}★`,    icon: Star,        color: "text-amber-600",  bg: "bg-amber-50"   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 border border-slate-100`}>
            <Icon size={15} className={`${color} mb-1.5`} />
            <p className={`text-lg font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Booking breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Booking Breakdown</p>
        <div className="space-y-2.5">
          {[
            { label: "Completed", count: completed, bar: "bg-emerald-400", pct: c.totalBookings > 0 ? (completed / c.totalBookings) * 100 : 0 },
            { label: "Disputed",  count: disputed,  bar: "bg-orange-400",  pct: c.totalBookings > 0 ? (disputed  / c.totalBookings) * 100 : 0 },
            { label: "Cancelled", count: cancelled, bar: "bg-red-300",     pct: c.totalBookings > 0 ? (cancelled / c.totalBookings) * 100 : 0 },
          ].map(({ label, count, bar, pct }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-700">{count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${bar} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account details */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Account Details</p>
        <Row label="Customer ID"    value={c.customerId}  mono />
        <Row label="Joined"         value={c.joinedDate}  />
        <Row label="City"           value={c.city}        />
        <Row label="Last Active"    value={c.lastActive}  />
        <Row label="Top Service"    value={topService}    />
      </div>
    </div>
  );
}
