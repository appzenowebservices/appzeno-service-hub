// src/pages/admin/dashboard/components/VendorDrawerHeader.tsx

import { useState } from "react";
import { X, Phone, MapPin, Calendar, BadgeCheck, Ban, RefreshCw, Copy, CheckCheck } from "lucide-react";
import type { VendorItem } from "../../../../agent/dashboard/mockAgentData";
import VendorAvatar      from "./VendorAvatar";
import VendorStatusBadge from "./VendorStatusBadge";

interface Props {
  vendor:     VendorItem;
  onClose:    () => void;
  onSuspend:  (id: string) => void;
  onActivate: (id: string) => void;
  onDelete:   (id: string) => void;
}

export default function VendorDrawerHeader({ vendor: v, onClose, onSuspend, onActivate, onDelete }: Props) {
  const [copied,      setCopied]      = useState(false);
  const [showConfirm, setShowConfirm] = useState<"suspend" | "delete" | null>(null);
  const kycOk = v.kycAadhaar && v.kycPan && v.kycPhoto && v.kycAddress;

  function copyId() {
    navigator.clipboard.writeText(v.vendorId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-sm font-black text-slate-800">Vendor Details</p>
          <p className="text-xs text-slate-400">Full profile, jobs & reviews</p>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Profile hero */}
      <div className="px-5 py-5 bg-gradient-to-br from-sky-50 to-slate-50 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start gap-4">
          <VendorAvatar name={v.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-black text-slate-800 truncate">{v.name}</h3>
              {kycOk && <BadgeCheck size={15} className="text-blue-500 flex-shrink-0" />}
              <VendorStatusBadge status={v.status} pulse />
            </div>

            {/* Vendor ID with copy */}
            <button onClick={copyId}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-500
                hover:text-sky-600 transition-colors mb-3">
              {v.vendorId}
              {copied
                ? <CheckCheck size={12} className="text-emerald-500" />
                : <Copy size={11} className="text-slate-400" />}
            </button>

            {/* Contact + location chips */}
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${v.phone}`}
                className="flex items-center gap-1 text-xs bg-white border border-slate-200
                  text-slate-600 px-2.5 py-1 rounded-full hover:border-sky-300 transition-colors">
                <Phone size={10} /> {v.phone}
              </a>
              <span className="flex items-center gap-1 text-xs bg-white border border-slate-200
                text-slate-500 px-2.5 py-1 rounded-full">
                <MapPin size={10} /> {v.area}, {v.city}
              </span>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> Joined {v.joinedDate}
          </span>
          <span>{v.ownerName}</span>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              v.lastActive.includes("min")  ? "bg-emerald-400" :
              v.lastActive.includes("hour") ? "bg-amber-400"   : "bg-slate-300"
            }`} />
            Active {v.lastActive}
          </span>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 px-5 py-3 border-b border-slate-100 flex-shrink-0">
        {showConfirm === null ? (
          <>
            {v.status !== "suspended" ? (
              <button onClick={() => setShowConfirm("suspend")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                  bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">
                <Ban size={12} /> Suspend
              </button>
            ) : (
              <button onClick={() => onActivate(v.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                  bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
                <RefreshCw size={12} /> Reactivate
              </button>
            )}
            <button onClick={() => setShowConfirm("delete")}
              className="flex-1 py-2 rounded-xl bg-slate-50 border border-slate-200
                text-slate-600 text-xs font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
              Delete Vendor
            </button>
          </>
        ) : (
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-bold text-red-700 text-center mb-2">
              {showConfirm === "suspend"
                ? "Suspend vendor? They won't receive new leads."
                : "Permanently delete this vendor? Cannot be undone."}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button onClick={() => {
                  setShowConfirm(null);
                  if (showConfirm === "suspend") onSuspend(v.id);
                  else onDelete(v.id);
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
