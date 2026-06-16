// src/pages/admin/dashboard/components/NotifFilterBar.tsx

import { Search, X } from "lucide-react";
import type { NotifCategory, NotifPriority } from "../mockAdminData";
import { CATEGORY_CFG, PRIORITY_CFG } from "./NotifBadge";

type StatusFilter = "all" | "unread" | "read" | "archived";

interface Props {
  search:     string;
  onSearch:   (v: string) => void;
  status:     StatusFilter;
  onStatus:   (v: StatusFilter) => void;
  category:   NotifCategory | "all";
  onCategory: (v: NotifCategory | "all") => void;
  priority:   NotifPriority | "all";
  onPriority: (v: NotifPriority | "all") => void;
}

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "unread",   label: "Unread"   },
  { key: "read",     label: "Read"     },
  { key: "archived", label: "Archived" },
];

const CATEGORIES = (["all", "dispute", "vendor", "payout", "booking", "customer", "system", "agent", "city"] as const);
const PRIORITIES = (["all", "urgent", "high", "normal", "low"] as const);

export default function NotifFilterBar({
  search, onSearch, status, onStatus, category, onCategory, priority, onPriority,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => onSearch(e.target.value)}
          placeholder="Search notifications…"
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
            focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
        {search && (
          <button onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => onStatus(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all
              ${status === t.key
                ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                : "bg-white text-slate-500 border border-slate-200 hover:border-sky-300"}`}>
            {t.label}
          </button>
        ))}

        <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />

        {/* Priority filter */}
        {PRIORITIES.map(p => {
          if (p === "all") return (
            <button key="all-p" onClick={() => onPriority("all")}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all
                ${priority === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400"}`}>
              All Priority
            </button>
          );
          const cfg = PRIORITY_CFG[p];
          return (
            <button key={p} onClick={() => onPriority(p)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all border
                ${priority === p
                  ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"}`}>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {CATEGORIES.map(cat => {
          if (cat === "all") return (
            <button key="all-c" onClick={() => onCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all
                ${category === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-400 border border-slate-200 hover:border-slate-400"}`}>
              All Types
            </button>
          );
          const cfg = CATEGORY_CFG[cat];
          return (
            <button key={cat} onClick={() => onCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all
                ${category === cat
                  ? `${cfg.bg} ${cfg.text} ring-1 ring-current`
                  : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"}`}>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
