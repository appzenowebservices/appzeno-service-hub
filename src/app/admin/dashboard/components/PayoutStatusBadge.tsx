// src/pages/admin/dashboard/components/PayoutStatusBadge.tsx

export type PayoutStatus = "pending" | "approved" | "on_hold" | "released";

export const PAYOUT_STATUS_CFG: Record<PayoutStatus, {
  label: string; dot: string; bg: string; text: string; border: string;
}> = {
  pending:  { label: "Pending",  dot: "bg-amber-400",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  approved: { label: "Approved", dot: "bg-sky-400",     bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200"    },
  on_hold:  { label: "On Hold",  dot: "bg-orange-400",  bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  released: { label: "Released", dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

interface Props {
  status: PayoutStatus;
  pulse?: boolean;
}

export default function PayoutStatusBadge({ status, pulse = false }: Props) {
  const c = PAYOUT_STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      border text-xs font-bold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`relative w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`}>
        {pulse && status === "approved" && (
          <span className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-75" />
        )}
      </span>
      {c.label}
    </span>
  );
}
