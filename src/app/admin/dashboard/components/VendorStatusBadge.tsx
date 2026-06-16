// src/pages/admin/dashboard/components/VendorStatusBadge.tsx

export type VendorStatus = "active" | "inactive" | "suspended" | "pending";

export const STATUS_CONFIG: Record<VendorStatus, {
  label: string; dot: string; bg: string; text: string; border: string;
}> = {
  active:    { label: "Active",    dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  inactive:  { label: "Inactive",  dot: "bg-slate-400",   bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-300"   },
  suspended: { label: "Suspended", dot: "bg-red-400",     bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200"     },
  pending:   { label: "Pending",   dot: "bg-amber-400",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
};

interface Props {
  status: VendorStatus;
  pulse?: boolean;
}

export default function VendorStatusBadge({ status, pulse = false }: Props) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      border text-xs font-bold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`relative w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`}>
        {pulse && status === "active" && (
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
        )}
      </span>
      {c.label}
    </span>
  );
}
