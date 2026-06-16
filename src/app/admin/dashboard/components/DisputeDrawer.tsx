// src/pages/admin/dashboard/components/DisputeDrawer.tsx

import { useState } from "react";
import { MessageSquare, Scale } from "lucide-react";
import type { AdminDispute, DisputeVerdict } from "../mockAdminData";
import DisputeDrawerHeader from "./DisputeDrawerHeader";
import DisputeTimelineTab  from "./DisputeTimelineTab";
import DisputeVerdictTab   from "./DisputeVerdictTab";

type Tab = "timeline" | "verdict";

interface Props {
  dispute:    AdminDispute;
  onClose:    () => void;
  onResolve:  (id: string, verdict: NonNullable<DisputeVerdict>, refund: number, note: string) => void;
  onEscalate: (id: string) => void;
}

export default function DisputeDrawer({ dispute, onClose, onResolve, onEscalate }: Props) {
  const [tab, setTab] = useState<Tab>("timeline");

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "timeline", label: "Messages",    icon: MessageSquare },
    { key: "verdict",  label: dispute.status === "resolved" ? "Verdict" : "Give Verdict", icon: Scale },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50
        shadow-2xl flex flex-col overflow-hidden animate-slide-in">

        {/* Header + hero */}
        <DisputeDrawerHeader dispute={dispute} onClose={onClose} />

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 px-5 flex-shrink-0">
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold
                  border-b-2 transition-all -mb-px
                  ${active
                    ? "border-sky-600 text-sky-700"
                    : "border-transparent text-slate-400 hover:text-slate-700"}`}>
                <Icon size={13} />
                {t.label}
                {t.key === "timeline" && (
                  <span className={`text-xs font-black px-1.5 py-0.5 rounded-full
                    ${active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                    {dispute.messages.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {tab === "timeline" && <DisputeTimelineTab dispute={dispute} />}
          {tab === "verdict"  && (
            <DisputeVerdictTab
              dispute={dispute}
              onResolve={onResolve}
              onEscalate={onEscalate}
            />
          )}
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
