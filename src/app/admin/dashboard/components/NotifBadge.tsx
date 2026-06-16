// src/pages/admin/dashboard/components/NotifBadge.tsx

import type { NotifPriority, NotifCategory } from "../mockAdminData";

export const PRIORITY_CFG: Record<NotifPriority, {
  label: string; dot: string; bg: string; text: string; border: string;
}> = {
  urgent: { label: "Urgent", dot: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  high:   { label: "High",   dot: "bg-amber-500",  bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  normal: { label: "Normal", dot: "bg-sky-400",    bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200"    },
  low:    { label: "Low",    dot: "bg-slate-400",  bg: "bg-slate-50",  text: "text-slate-500",  border: "border-slate-200"  },
};

export const CATEGORY_CFG: Record<NotifCategory, { label: string; bg: string; text: string }> = {
  dispute:  { label: "Dispute",  bg: "bg-violet-100", text: "text-violet-700" },
  vendor:   { label: "Vendor",   bg: "bg-sky-100",    text: "text-sky-700"    },
  payout:   { label: "Payout",   bg: "bg-emerald-100",text: "text-emerald-700"},
  booking:  { label: "Booking",  bg: "bg-amber-100",  text: "text-amber-700"  },
  customer: { label: "Customer", bg: "bg-pink-100",   text: "text-pink-700"   },
  system:   { label: "System",   bg: "bg-slate-100",  text: "text-slate-600"  },
  agent:    { label: "Agent",    bg: "bg-indigo-100", text: "text-indigo-700" },
  city:     { label: "City",     bg: "bg-teal-100",   text: "text-teal-700"   },
};

export function PriorityBadge({ priority, pulse }: { priority: NotifPriority; pulse?: boolean }) {
  const c = PRIORITY_CFG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border
      text-xs font-bold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`relative w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`}>
        {pulse && priority === "urgent" && (
          <span className={`absolute inset-0 rounded-full ${c.dot} animate-ping opacity-75`} />
        )}
      </span>
      {c.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: NotifCategory }) {
  const c = CATEGORY_CFG[category];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
