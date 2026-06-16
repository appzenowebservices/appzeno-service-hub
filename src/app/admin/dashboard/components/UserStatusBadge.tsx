// src/pages/admin/dashboard/components/UserStatusBadge.tsx

type Status = "active" | "blocked";

const CONFIG: Record<Status, { label: string; dot: string; bg: string; text: string; border: string }> = {
  active:  { label: "Active",  dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  blocked: { label: "Blocked", dot: "bg-red-400",     bg: "bg-red-50",    text: "text-red-700",     border: "border-red-200"     },
};

interface Props {
  status: Status;
  pulse?: boolean;
}

export default function UserStatusBadge({ status, pulse = false }: Props) {
  const c = CONFIG[status];
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
