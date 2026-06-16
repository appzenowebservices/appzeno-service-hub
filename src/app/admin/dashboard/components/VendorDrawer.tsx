// src/pages/admin/dashboard/components/VendorDrawer.tsx

import { useState } from "react";
import { LayoutGrid, Briefcase, Star } from "lucide-react";
import type { VendorItem } from "../../../../agent/dashboard/mockAgentData";
import VendorDrawerHeader from "./VendorDrawerHeader";
import VendorOverviewTab  from "./VendorOverviewTab";
import VendorJobsTab      from "./VendorJobsTab";
import VendorReviewsTab   from "./VendorReviewsTab";

type Tab = "overview" | "jobs" | "reviews";

interface Props {
  vendor:     VendorItem;
  onClose:    () => void;
  onSuspend:  (id: string) => void;
  onActivate: (id: string) => void;
  onDelete:   (id: string) => void;
}

export default function VendorDrawer({ vendor, onClose, onSuspend, onActivate, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  const TABS: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "overview", label: "Overview",                         icon: LayoutGrid },
    { key: "jobs",     label: "Jobs",    badge: vendor.recentJobs.length, icon: Briefcase  },
    { key: "reviews",  label: "Reviews", badge: vendor.reviews.length,    icon: Star       },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50
        shadow-2xl flex flex-col overflow-hidden animate-slide-in">

        {/* Header + hero + quick actions */}
        <VendorDrawerHeader
          vendor={vendor}
          onClose={onClose}
          onSuspend={onSuspend}
          onActivate={onActivate}
          onDelete={onDelete}
        />

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 px-5 flex-shrink-0">
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold
                  border-b-2 transition-all -mb-px
                  ${active
                    ? "border-sky-600 text-sky-700"
                    : "border-transparent text-slate-400 hover:text-slate-700"}`}>
                <Icon size={13} />
                {t.label}
                {t.badge != null && t.badge > 0 && (
                  <span className={`text-xs font-black px-1.5 py-0.5 rounded-full
                    ${active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && <VendorOverviewTab vendor={vendor} />}
          {tab === "jobs"     && <VendorJobsTab     vendor={vendor} />}
          {tab === "reviews"  && <VendorReviewsTab  vendor={vendor} />}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </>
  );
}
