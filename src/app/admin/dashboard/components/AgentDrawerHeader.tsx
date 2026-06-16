// src/pages/admin/dashboard/components/AgentDrawerHeader.tsx

import { useState } from "react";
import { X, Phone, Mail, MapPin, Calendar, PowerOff, RefreshCw, Trash2, Copy, CheckCheck } from "lucide-react";
import type { AgentRecord } from "../mockAdminData";
import AgentAvatar      from "./AgentAvatar";
import AgentStatusBadge from "./AgentStatusBadge";
import AgentPerfBadge   from "./AgentPerfBadge";

interface Props {
  agent:       AgentRecord;
  onClose:     () => void;
  onDeactivate:(id: string) => void;
  onActivate:  (id: string) => void;
  onDelete:    (id: string) => void;
}

export default function AgentDrawerHeader({ agent: a, onClose, onDeactivate, onActivate, onDelete }: Props) {
  const [copied,      setCopied]      = useState(false);
  const [showConfirm, setShowConfirm] = useState<"deactivate" | "delete" | null>(null);

  function copyId() {
    navigator.clipboard.writeText(a.agentId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-sm font-black text-slate-800">Agent Details</p>
          <p className="text-xs text-slate-400">Full profile, activity & commission</p>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Profile hero — light bg, dark text */}
      <div className="px-5 py-5 bg-gradient-to-br from-sky-50 to-slate-50 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start gap-4">
          <AgentAvatar name={a.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-black text-slate-800 truncate">{a.name}</h3>
              <AgentStatusBadge status={a.status} pulse />
            </div>

            {/* Agent ID with copy */}
            <button onClick={copyId}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-500
                hover:text-sky-600 transition-colors mb-3">
              {a.agentId}
              {copied
                ? <CheckCheck size={12} className="text-emerald-500" />
                : <Copy size={11} className="text-slate-400" />}
            </button>

            {/* Contact chips */}
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${a.phone}`}
                className="flex items-center gap-1 text-xs bg-white border border-slate-200
                  text-slate-600 px-2.5 py-1 rounded-full hover:border-sky-300 transition-colors">
                <Phone size={10} /> {a.phone}
              </a>
              <span className="flex items-center gap-1 text-xs bg-white border border-slate-200
                text-slate-500 px-2.5 py-1 rounded-full">
                <MapPin size={10} /> {a.city}
              </span>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> Joined {a.joinedDate}
          </span>
          <span className="flex items-center gap-1">
            <Mail size={11} /> {a.email}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              a.lastActive === "Today" ? "bg-emerald-400" :
              a.lastActive === "Yesterday" ? "bg-amber-400" : "bg-slate-300"
            }`} />
            Active {a.lastActive}
          </span>
        </div>

        {/* Performance badge */}
        <div className="mt-3">
          <AgentPerfBadge performance={a.performance} />
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 px-5 py-3 border-b border-slate-100 flex-shrink-0">
        {showConfirm === null ? (
          <>
            {a.status === "active" ? (
              <button onClick={() => setShowConfirm("deactivate")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                  bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold
                  hover:bg-amber-100 transition-colors">
                <PowerOff size={12} /> Deactivate
              </button>
            ) : (
              <button onClick={() => onActivate(a.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                  bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold
                  hover:bg-emerald-100 transition-colors">
                <RefreshCw size={12} /> Activate
              </button>
            )}
            <button onClick={() => setShowConfirm("delete")}
              className="flex-1 py-2 rounded-xl bg-slate-50 border border-slate-200
                text-slate-600 text-xs font-bold hover:bg-red-50 hover:border-red-200
                hover:text-red-600 transition-colors flex items-center justify-center gap-1.5">
              <Trash2 size={12} /> Delete Agent
            </button>
          </>
        ) : (
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-bold text-red-700 text-center mb-2">
              {showConfirm === "deactivate"
                ? "Deactivate agent? They won't receive new assignments."
                : "Permanently delete this agent? Cannot be undone."}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button onClick={() => {
                  setShowConfirm(null);
                  if (showConfirm === "deactivate") onDeactivate(a.id);
                  else onDelete(a.id);
                }}
                className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700">
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
