// src/pages/admin/dashboard/components/SetCommissionModal.tsx

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import type { CommissionTier } from "../mockAdminData";

interface Props {
  tier:    CommissionTier;
  onSave:  (tier: CommissionTier) => void;
  onClose: () => void;
}

export default function SetCommissionModal({ tier, onSave, onClose }: Props) {
  const [form, setForm] = useState({ ...tier, maxLeads: tier.maxLeads ?? "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({ ...tier, maxLeads: tier.maxLeads ?? "" }); }, [tier]);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...tier,
        rate:        Number(form.rate),
        bonusRate:   Number(form.bonusRate),
        maxLeads:    form.maxLeads === "" ? null : Number(form.maxLeads),
        description: String(form.description),
      });
      setSaving(false);
    }, 500);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-in">

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-black text-slate-800">Edit Commission Tier</p>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="font-bold">{tier.label}</span> · {tier.minLeads}–{tier.maxLeads ?? "∞"} leads
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Commission Rate (%)</label>
                <input type="number" step="0.5" value={form.rate}
                  onChange={e => setForm(f => ({ ...f, rate: e.target.value as any }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                    focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Bonus Rate (%)</label>
                <input type="number" step="0.5" value={form.bonusRate}
                  onChange={e => setForm(f => ({ ...f, bonusRate: e.target.value as any }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                    focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Min Leads</label>
                <input type="number" value={form.minLeads} disabled
                  className="w-full px-3 py-2.5 text-sm border border-slate-100 rounded-xl bg-slate-50 text-slate-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Max Leads (blank = ∞)</label>
                <input type="number" value={form.maxLeads}
                  onChange={e => setForm(f => ({ ...f, maxLeads: e.target.value as any }))}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                    focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Description</label>
              <input type="text" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                  focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-700">
              Effective rate: <strong>{form.rate}% base</strong>
              {Number(form.bonusRate) > 0 && ` + ${form.bonusRate}% performance bonus`}
              {" "} on gross revenue
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
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Save size={14} /> Save Tier</>}
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
