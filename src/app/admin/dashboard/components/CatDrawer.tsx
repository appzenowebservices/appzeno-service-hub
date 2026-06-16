// src/pages/admin/dashboard/components/CatDrawer.tsx

import { useState } from "react";
import { LayoutGrid, Users } from "lucide-react";
import type { CategoryPerf } from "../mockAdminData";
import { CATEGORY_VENDORS } from "../mockAdminData";
import CatDrawerHeader from "./CatDrawerHeader";
import CatOverviewTab  from "./CatOverviewTab";
import CatVendorsTab   from "./CatVendorsTab";

type Tab = "overview" | "vendors";

interface Props {
  category: CategoryPerf;
  onClose:  () => void;
  onEdit:   () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CatDrawer({ category, onClose, onEdit, onToggle, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const vendorCount   = (CATEGORY_VENDORS[category.id] || []).length;

  const TABS: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutGrid                  },
    { key: "vendors",  label: "Vendors",  icon: Users,  badge: vendorCount  },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50
        shadow-2xl flex flex-col overflow-hidden animate-slide-in">

        <CatDrawerHeader
          category={category}
          onClose={onClose}
          onEdit={onEdit}
          onToggle={onToggle}
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && <CatOverviewTab category={category} />}
          {tab === "vendors"  && <CatVendorsTab  categoryId={category.id} />}
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
