// src/pages/admin/dashboard/components/SetIPModal.tsx

import { useState } from "react";
import { X, Shield } from "lucide-react";

interface Props {
  onSave:  (ip: string, label: string) => void;
  onClose: () => void;
}

export default function SetIPModal({ onSave, onClose }: Props) {
  const [ip,    setIp]    = useState("");
  const [label, setLabel] = useState("");
  const [saving,setSaving] = useState(false);
  const [errors,setErrors] = useState<Record<string, string>>({});

  // Basic IPv4 validation
  function isValidIP(ip: string) {
    const parts = ip.split(".");
    return parts.length === 4 && parts.every(p => !isNaN(Number(p)) && Number(p) >= 0 && Number(p) <= 255);
  }

  function handleSave() {
    const e: Record<string, string> = {};
    if (!ip.trim())       e.ip    = "IP address is required";
    else if (!isValidIP(ip.trim())) e.ip = "Enter a valid IPv4 address";
    if (!label.trim())    e.label = "Label is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    setTimeout(() => { onSave(ip.trim(), label.trim()); setSaving(false); }, 500);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-in">

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                <Shield size={14} className="text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">Whitelist IP Address</p>
                <p className="text-xs text-slate-400">Allow admin access from this IP</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">IP Address *</label>
              <input value={ip} onChange={e => { setIp(e.target.value); setErrors(x => ({...x, ip: ""})); }}
                placeholder="e.g. 103.27.12.84"
                className={`w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border transition-all
                  focus:outline-none focus:ring-2
                  ${errors.ip ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`} />
              {errors.ip && <p className="text-xs text-red-500 mt-1">{errors.ip}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Label *</label>
              <input value={label} onChange={e => { setLabel(e.target.value); setErrors(x => ({...x, label: ""})); }}
                placeholder="e.g. Office — Ghaziabad HQ"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all
                  focus:outline-none focus:ring-2
                  ${errors.label ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`} />
              {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              ⚠️ Only whitelist IPs you trust. Whitelisted IPs bypass location-based security checks.
            </div>
          </div>

          <div className="flex gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold
                hover:bg-sky-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-sky-200">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding…</>
                : <><Shield size={14} /> Add to Whitelist</>}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modal-in { from { transform:scale(0.95) translateY(8px);opacity:0; } to { transform:scale(1) translateY(0);opacity:1; } }
        .animate-modal-in { animation: modal-in 0.2s cubic-bezier(0.22,1,0.36,1); }
      `}</style>
    </>
  );
}
