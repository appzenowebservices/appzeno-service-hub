// src/pages/admin/dashboard/components/UserDrawer.tsx

import { useState } from "react";
import { User, ShoppingBag } from "lucide-react";
import type { CustomerRecord } from "../mockAdminData";
import UserDrawerHeader from "./UserDrawerHeader";
import UserProfileTab   from "./UserProfileTab";
import UserBookingsTab  from "./UserBookingsTab";

type Tab = "profile" | "bookings";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "profile",   label: "Profile",   icon: User         },
  { key: "bookings",  label: "Bookings",  icon: ShoppingBag  },
];

interface Props {
  customer:  CustomerRecord;
  onClose:   () => void;
  onBlock:   (id: string) => void;
  onUnblock: (id: string) => void;
  onDelete:  (id: string) => void;
}

export default function UserDrawer({ customer, onClose, onBlock, onUnblock, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50
        shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

        {/* Header + hero + actions */}
        <UserDrawerHeader
          customer={customer}
          onClose={onClose}
          onBlock={onBlock}
          onUnblock={onUnblock}
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
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all -mb-px
                  ${active
                    ? "border-sky-600 text-sky-700"
                    : "border-transparent text-slate-400 hover:text-slate-700"}`}>
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {tab === "profile"  && <UserProfileTab  customer={customer} />}
          {tab === "bookings" && <UserBookingsTab customer={customer} />}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </>
  );
}
