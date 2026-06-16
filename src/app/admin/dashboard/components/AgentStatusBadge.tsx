// src/pages/admin/dashboard/components/AgentStatusBadge.tsx

export type AgentStatus = "active" | "inactive";

export const AGENT_STATUS_CONFIG: Record<AgentStatus, {
  label: string; dot: string; bg: string; text: string; border: string;
}> = {
  active:   { label: "Active",   dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  inactive: { label: "Inactive", dot: "bg-slate-400",   bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-300"   },
};

export type AgentPerformance = "excellent" | "good" | "average" | "poor";

export const PERF_CONFIG: Record<AgentPerformance, {
  label: string; bg: string; text: string; border: string;
}> = {
  excellent: { label: "Excellent", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  good:      { label: "Good",      bg: "bg-sky-100",     text: "text-sky-700",     border: "border-sky-200"     },
  average:   { label: "Average",   bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200"   },
  poor:      { label: "Poor",      bg: "bg-red-100",     text: "text-red-600",     border: "border-red-200"     },
};

interface Props {
  status: AgentStatus;
  pulse?: boolean;
}

export default function AgentStatusBadge({ status, pulse = false }: Props) {
  const c = AGENT_STATUS_CONFIG[status];
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
