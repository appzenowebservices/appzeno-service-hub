// src/pages/admin/dashboard/components/CityDrawer.tsx

import { LayoutGrid } from "lucide-react";
import type { CityData } from "../mockAdminData";
import CityDrawerHeader from "./CityDrawerHeader";
import CityOverviewTab  from "./CityOverviewTab";

interface Props {
  city:     CityData;
  onClose:  () => void;
  onEdit:   () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CityDrawer({ city, onClose, onEdit, onToggle, onDelete }: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50
        shadow-2xl flex flex-col overflow-hidden animate-slide-in">

        <CityDrawerHeader
          city={city}
          onClose={onClose}
          onEdit={onEdit}
          onToggle={onToggle}
          onDelete={onDelete}
        />

        {/* Tab label */}
        <div className="flex border-b border-slate-100 px-5 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold
            border-b-2 border-sky-600 text-sky-700 -mb-px">
            <LayoutGrid size={13} />
            Overview
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <CityOverviewTab city={city} />
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.25s cubic-bezier(0.22,1,0.36,1); }
      `}</style>
    </>
  );
}
