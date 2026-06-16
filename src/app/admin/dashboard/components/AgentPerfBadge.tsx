// src/pages/admin/dashboard/components/AgentPerfBadge.tsx

import type { AgentPerformance } from "./AgentStatusBadge";
import { PERF_CONFIG } from "./AgentStatusBadge";

interface Props {
  performance: AgentPerformance;
}

export default function AgentPerfBadge({ performance }: Props) {
  const c = PERF_CONFIG[performance];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full
      border text-xs font-bold ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}
