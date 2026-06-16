// src/pages/admin/dashboard/components/CityDrawerHeader.tsx

import { useState } from "react";
import { X, Edit2, Trash2, CheckCircle2, PowerOff, MapPin, Hash } from "lucide-react";
import type { CityData } from "../mockAdminData";

interface Props {
  city:     CityData;
  onClose:  () => void;
  onEdit:   () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function fmtRev(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function CityDrawerHeader({ city: c, onClose, onEdit, onToggle, onDelete }: Props) {
  const [showConfirm, setShowConfirm] = useState<"toggle" | "delete" | null>(null);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-sm font-black text-slate-800">City Details</p>
          <p className="text-xs text-slate-400">Performance, vendors & agent info</p>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Hero */}
      <div className="px-5 py-5 bg-gradient-to-br from-sky-50 to-slate-50 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black
            flex-shrink-0 shadow-sm
            ${c.active ? "bg-white border-2 border-sky-200 text-sky-700" : "bg-slate-100 border-2 border-slate-200 text-slate-400"}`}>
            {c.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg font-black text-slate-800">{c.name}</h3>
              {c.active
                ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">● Active</span>
                : <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-300">● Inactive</span>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <MapPin size={11} />
              <span>{c.district}, {c.state}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Hash size={11} />
              <span>{c.pincode}</span>
              <span className="text-slate-300">·</span>
              <span>{c.id}</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Revenue",   value: fmtRev(c.revenue)           },
            { label: "Bookings",  value: c.bookings.toLocaleString()  },
            { label: "Growth",    value: c.growth > 0 ? `+${c.growth}%` : "—" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-center">
              <p className="text-slate-800 font-black text-base leading-none">{s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-5 py-3 border-b border-slate-100 flex-shrink-0">
        {showConfirm === null ? (
          <>
            <button onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors">
              <Edit2 size={12} /> Edit City
            </button>
            <button onClick={() => setShowConfirm("toggle")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors
                ${c.active
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"}`}>
              {c.active ? <><PowerOff size={12} /> Deactivate</> : <><CheckCircle2 size={12} /> Activate</>}
            </button>
            <button onClick={() => setShowConfirm("delete")}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500
                hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
              <Trash2 size={13} />
            </button>
          </>
        ) : (
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-bold text-red-700 text-center mb-2">
              {showConfirm === "delete"
                ? `Delete "${c.name}"? This cannot be undone.`
                : c.active
                  ? `Deactivate "${c.name}"? Vendors will stop receiving leads.`
                  : `Activate "${c.name}"?`}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button onClick={() => { setShowConfirm(null); showConfirm === "delete" ? onDelete(c.id) : onToggle(c.id); }}
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
