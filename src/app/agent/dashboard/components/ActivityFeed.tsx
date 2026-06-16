// src/pages/agent/dashboard/components/ActivityFeed.tsx

import { useState } from "react";
import type { ActivityItem } from "../mockAgentData";

interface Props {
  activities: ActivityItem[];
}

const TYPE_COLORS: Record<ActivityItem["type"], { dot: string; badge: string; text: string }> = {
  vendor_approved:    { dot: "bg-green-400",  badge: "bg-green-100 text-green-700",   text: "Approved" },
  vendor_rejected:    { dot: "bg-red-400",    badge: "bg-red-100 text-red-700",       text: "Rejected" },
  vendor_suspended:   { dot: "bg-red-500",    badge: "bg-red-100 text-red-700",       text: "Suspended" },
  dispute_raised:     { dot: "bg-orange-400", badge: "bg-orange-100 text-orange-700", text: "Dispute" },
  dispute_resolved:   { dot: "bg-blue-400",   badge: "bg-blue-100 text-blue-700",     text: "Resolved" },
  lead_assigned:      { dot: "bg-violet-400", badge: "bg-violet-100 text-violet-700", text: "Lead" },
  commission_credited:{ dot: "bg-emerald-400",badge: "bg-emerald-100 text-emerald-700",text: "Commission" },
  new_registration:   { dot: "bg-cyan-400",   badge: "bg-cyan-100 text-cyan-700",     text: "New" },
};

const PAGE_SIZE = 5;

export default function ActivityFeed({ activities }: Props) {
  const [page, setPage] = useState(1);

  const total   = activities.length;
  const visible = activities.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < total;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-black text-slate-800 text-sm">Recent Activity</h3>
        <span className="text-xs text-slate-400 font-medium">{total} actions</span>
      </div>

      {/* Timeline */}
      <div className="relative px-5 py-4">
        {/* Vertical line */}
        <div className="absolute left-[2.15rem] top-4 bottom-4 w-0.5 bg-slate-100" />

        <div className="space-y-4">
          {visible.map((item) => {
            const cfg = TYPE_COLORS[item.type];
            return (
              <div key={item.id} className="relative flex items-start gap-4">
                {/* Emoji icon circle */}
                <div className="relative z-10 w-8 h-8 rounded-xl bg-slate-50 border border-slate-200
                  flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className={`text-2xs font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${cfg.badge}`}>
                          {cfg.text}
                        </span>
                        {item.amount && (
                          <span className="text-2xs font-black text-emerald-600">
                            +₹{item.amount.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{item.subtitle}</p>
                    </div>
                    <span className="text-2xs text-slate-300 font-medium flex-shrink-0 mt-0.5 whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="px-5 pb-4">
          <button onClick={() => setPage(p => p + 1)}
            className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500
              hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all">
            Load More ({total - visible.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
