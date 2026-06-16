// src/pages/admin/dashboard/components/DisputeTimelineTab.tsx

import { User, Store, Shield, Paperclip } from "lucide-react";
import type { AdminDispute } from "../mockAdminData";

interface Props { dispute: AdminDispute }

const FROM_CFG = {
  customer: { icon: User,   color: "text-sky-600",     bg: "bg-sky-50",    border: "border-sky-200",    label: "Customer" },
  vendor:   { icon: Store,  color: "text-violet-600",  bg: "bg-violet-50", border: "border-violet-200", label: "Vendor"   },
  admin:    { icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50",border: "border-emerald-200",label: "Admin"    },
};

export default function DisputeTimelineTab({ dispute: d }: Props) {
  return (
    <div className="px-5 py-4 space-y-4">
      {/* Complaint description */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Original Complaint</p>
        <p className="text-xs text-slate-700 leading-relaxed">{d.description}</p>
        <p className="text-xs font-bold text-slate-500 mt-2">Reason: <span className="text-slate-700">{d.reason}</span></p>
      </div>

      {/* Messages thread */}
      <div className="space-y-3">
        {d.messages.map((msg, i) => {
          const cfg  = FROM_CFG[msg.from];
          const Icon = cfg.icon;
          const isLast = i === d.messages.length - 1;
          return (
            <div key={msg.id} className="relative flex items-start gap-3">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-slate-100 -z-0" />
              )}

              {/* Avatar */}
              <div className={`relative z-10 w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border}
                flex items-center justify-center flex-shrink-0`}>
                <Icon size={13} className={cfg.color} />
              </div>

              {/* Bubble */}
              <div className={`flex-1 rounded-2xl border p-3 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-xs font-black ${cfg.color}`}>{msg.name}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{msg.time}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{msg.text}</p>

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.attachments.map(att => (
                      <span key={att}
                        className="flex items-center gap-1 text-xs font-medium text-slate-500
                          bg-white border border-slate-200 px-2 py-1 rounded-lg">
                        <Paperclip size={10} /> {att}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
