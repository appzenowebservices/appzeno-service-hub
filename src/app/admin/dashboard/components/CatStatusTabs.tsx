// src/pages/admin/dashboard/components/CatStatusTabs.tsx

import type { CategoryPerf } from "../mockAdminData";

type TabKey = "all" | "active" | "inactive";

interface Props {
  categories: CategoryPerf[];
  activeTab:  TabKey;
  onChange:   (t: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "active",   label: "Active"   },
  { key: "inactive", label: "Inactive" },
];

export default function CatStatusTabs({ categories, activeTab, onChange }: Props) {
  function countFor(key: TabKey): number {
    if (key === "all")      return categories.length;
    if (key === "active")   return categories.filter(c => c.active).length;
    return categories.filter(c => !c.active).length;
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
