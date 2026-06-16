// src/pages/admin/dashboard/components/DisputeStatusBadge.tsx

import type { DisputeStatus } from "../mockAdminData";

export const DISPUTE_STATUS_CFG: Record<DisputeStatus, {
  label: string; dot: string; bg: string; text: string; border: string;
}> = {
  open:          { label: "Open",          dot: "bg-red-400",    bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200"    },
  under_review:  { label: "Under Review",  dot: "bg-amber-400",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  escalated:     { label: "Escalated",     dot: "bg-violet-400", bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  resolved:      { label: "Resolved",      dot: "bg-emerald-400",bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
};

interface Props {
  status: DisputeStatus;
  pulse?: boolean;
}

export default function DisputeStatusBadge({ status, pulse = false }: Props) {
  const c = DISPUTE_STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      border text-xs font-bold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`relative w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`}>
        {pulse && (status === "open" || status === "escalated") && (
          <span className={`absolute inset-0 rounded-full ${c.dot} animate-ping opacity-75`} />
        )}
      </span>
      {c.label}
    </span>
  );
}
