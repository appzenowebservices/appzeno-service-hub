// src/pages/admin/dashboard/components/AdminActivityFeed.tsx

import { useState } from "react";
import type { AdminActivity } from "../mockAdminData";

const BADGE_CLASS: Record<AdminActivity["type"], string> = {
  payout_released:  "bg-emerald-100 text-emerald-700",
  dispute_resolved: "bg-blue-100 text-blue-700",
  vendor_approved:  "bg-green-100 text-green-700",
  vendor_suspended: "bg-red-100 text-red-700",
  city_added:       "bg-cyan-100 text-cyan-700",
  category_updated: "bg-violet-100 text-violet-700",
  plan_updated:     "bg-amber-100 text-amber-700",
  refund_issued:    "bg-orange-100 text-orange-700",
  agent_assigned:   "bg-sky-100 text-sky-700",
  new_city_request: "bg-slate-100 text-slate-600",
};

const BADGE_LABEL: Record<AdminActivity["type"], string> = {
  payout_released:  "Payout",
  dispute_resolved: "Dispute",
  vendor_approved:  "Vendor",
  vendor_suspended: "Suspended",
  city_added:       "City",
  category_updated: "Category",
  plan_updated:     "Plan",
  refund_issued:    "Refund",
  agent_assigned:   "Agent",
  new_city_request: "Request",
};

const PAGE_SIZE = 5;

interface Props {
  activities: AdminActivity[];
}

export default function AdminActivityFeed({ activities }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? activities : activities.slice(0, PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">Platform Activity</h3>
        <span className="text-xs text-slate-400 font-medium">{activities.length} actions</span>
      </div>

      {/* Timeline */}
      <div className="relative px-5 py-4">
        <div className="absolute left-[2.15rem] top-4 bottom-4 w-0.5 bg-slate-100" />
        <div className="space-y-4">
          {displayed.map(item => {
            const badgeCls = BADGE_CLASS[item.type] || "bg-slate-100 text-slate-600";
            const labelTxt = BADGE_LABEL[item.type] || "Action";
            return (
              <div key={item.id} className="relative flex items-start gap-4">
                <div className="relative z-10 w-8 h-8 rounded-xl bg-slate-50 border border-slate-200
                  flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${badgeCls}`}>
                          {labelTxt}
                        </span>
                        {item.amount && (
                          <span className="text-xs font-black text-emerald-600">
                            ₹{item.amount.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{item.subtitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-slate-300 whitespace-nowrap">{item.time}</span>
                      <p className="text-xs text-slate-400 mt-0.5">by {item.by}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activities.length > PAGE_SIZE && (
        <div className="px-5 pb-4">
          <button onClick={() => setShowAll(s => !s)}
            className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500
              hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all">
            {showAll
              ? "Show Less"
              : `Load More (${activities.length - PAGE_SIZE} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
