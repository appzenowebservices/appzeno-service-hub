// src/pages/admin/dashboard/components/DisputeStatusTabs.tsx

import type { AdminDispute, DisputeStatus } from "../mockAdminData";

type TabKey = DisputeStatus | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",          label: "All"          },
  { key: "escalated",    label: "Escalated"    },
  { key: "open",         label: "Open"         },
  { key: "under_review", label: "Under Review" },
  { key: "resolved",     label: "Resolved"     },
];

interface Props {
  disputes:  AdminDispute[];
  activeTab: TabKey;
  onChange:  (t: TabKey) => void;
}

const ACTIVE_COLORS: Partial<Record<TabKey, string>> = {
  escalated:    "bg-violet-600 shadow-violet-200",
  open:         "bg-red-600 shadow-red-200",
  under_review: "bg-amber-500 shadow-amber-200",
  resolved:     "bg-emerald-600 shadow-emerald-200",
};

export default function DisputeStatusTabs({ disputes, activeTab, onChange }: Props) {
  function countFor(key: TabKey) {
    return key === "all" ? disputes.length : disputes.filter(d => d.status === key).length;
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      {TABS.map(({ key, label }) => {
        const count  = countFor(key);
        const active = activeTab === key;
        const activeColor = ACTIVE_COLORS[key] ?? "bg-sky-600 shadow-sky-200";
        return (
          <button key={key} onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
              whitespace-nowrap flex-shrink-0 transition-all
              ${active
                ? `${activeColor} text-white shadow-md`
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400"}`}>
            {label}
            <span className={`text-xs font-black px-1.5 py-0.5 rounded-full
              ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
