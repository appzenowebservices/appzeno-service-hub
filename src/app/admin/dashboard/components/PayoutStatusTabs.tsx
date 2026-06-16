// src/pages/admin/dashboard/components/PayoutStatusTabs.tsx

import type { PendingPayout } from "../mockAdminData";
import type { PayoutStatus } from "./PayoutStatusBadge";

type TabKey = PayoutStatus | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "on_hold",  label: "On Hold"  },
  { key: "released", label: "Released" },
];

interface Props {
  payouts:   PendingPayout[];
  activeTab: TabKey;
  onChange:  (t: TabKey) => void;
}

export default function PayoutStatusTabs({ payouts, activeTab, onChange }: Props) {
  function countFor(key: TabKey): number {
    return key === "all" ? payouts.length : payouts.filter(p => p.status === key).length;
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
      {TABS.map(({ key, label }) => {
        const count  = countFor(key);
        const active = activeTab === key;
        return (
          <button key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
              whitespace-nowrap flex-shrink-0 transition-all
              ${active
                ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                : "bg-white text-slate-500 border border-slate-200 hover:border-sky-300 hover:text-sky-600"}`}>
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
