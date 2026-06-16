// src/pages/admin/dashboard/components/UserDrawerHeader.tsx

import { X, Phone, Mail, MapPin, Calendar, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";
import type { CustomerRecord } from "../mockAdminData";
import UserAvatar      from "./UserAvatar";
import UserStatusBadge from "./UserStatusBadge";

interface Props {
  customer:   CustomerRecord;
  onClose:    () => void;
  onBlock:    (id: string) => void;
  onUnblock:  (id: string) => void;
  onDelete:   (id: string) => void;
}

export default function UserDrawerHeader({ customer: c, onClose, onBlock, onUnblock, onDelete }: Props) {
  const [copied,      setCopied]      = useState(false);
  const [showConfirm, setShowConfirm] = useState<"block" | "delete" | null>(null);

  function copyId() {
    navigator.clipboard.writeText(c.customerId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-sm font-black text-slate-800">User Details</p>
          <p className="text-xs text-slate-400">Full profile & booking history</p>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Profile hero */}
      <div className="px-5 py-5 bg-gradient-to-br from-sky-50 to-slate-50 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start gap-4">
          <UserAvatar name={c.name} size="lg" shape="circle" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-black text-slate-800">{c.name}</h3>
              <UserStatusBadge status={c.status} pulse />
            </div>
            {/* ID with copy */}
            <button onClick={copyId}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-500
                hover:text-sky-600 transition-colors mb-3">
              {c.customerId}
              {copied
                ? <CheckCheck size={12} className="text-emerald-500" />
                : <Copy size={11} className="text-slate-400" />}
            </button>

            {/* Contact chips */}
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${c.phone}`}
                className="flex items-center gap-1 text-xs bg-white border border-slate-200
                  text-slate-600 px-2.5 py-1 rounded-full hover:border-sky-300 transition-colors">
                <Phone size={10} /> {c.phone}
              </a>
              <a href={`mailto:${c.email}`}
                className="flex items-center gap-1 text-xs bg-white border border-slate-200
                  text-slate-600 px-2.5 py-1 rounded-full hover:border-sky-300 transition-colors truncate max-w-[180px]">
                <Mail size={10} /> {c.email}
              </a>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin size={11} /> {c.city}</span>
          <span className="flex items-center gap-1"><Calendar size={11} /> Joined {c.joinedDate}</span>
          <span className={`flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              c.lastActive === "Today" ? "bg-emerald-400" :
              c.lastActive === "Yesterday" ? "bg-amber-400" : "bg-slate-300"
            }`} />
            Active {c.lastActive}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-5 py-3 border-b border-slate-100 flex-shrink-0">
        {showConfirm === null ? (
          <>
            {c.status === "active" ? (
              <button onClick={() => setShowConfirm("block")}
                className="flex-1 py-2 rounded-xl bg-amber-50 border border-amber-200
                  text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">
                Block User
              </button>
            ) : (
              <button onClick={() => onUnblock(c.id)}
                className="flex-1 py-2 rounded-xl bg-emerald-50 border border-emerald-200
                  text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
                Unblock User
              </button>
            )}
            <button onClick={() => setShowConfirm("delete")}
              className="flex-1 py-2 rounded-xl bg-red-50 border border-red-200
                text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">
              Delete Account
            </button>
          </>
        ) : (
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-bold text-red-700 mb-2 text-center">
              {showConfirm === "block"
                ? "Block this user? They won't be able to book."
                : "Permanently delete this account? This cannot be undone."}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(null);
                  if (showConfirm === "block") onBlock(c.id);
                  else onDelete(c.id);
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
