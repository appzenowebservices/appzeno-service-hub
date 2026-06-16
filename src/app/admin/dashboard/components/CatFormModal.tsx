// src/pages/admin/dashboard/components/CatFormModal.tsx

import { useState, useEffect } from "react";
import { X, Save, Plus } from "lucide-react";
import type { CategoryPerf } from "../mockAdminData";
import { CATEGORY_EMOJI_OPTIONS } from "../mockAdminData";

interface FormData {
  name:     string;
  icon:     string;
  avgPrice: string;
  active:   boolean;
}

interface Props {
  mode:     "add" | "edit";
  initial?: CategoryPerf | null;
  onSave:   (data: Omit<CategoryPerf, "id" | "vendors" | "bookings" | "revenue" | "growth">) => void;
  onClose:  () => void;
}

const EMPTY: FormData = { name: "", icon: "🔧", avgPrice: "", active: true };

export default function CatFormModal({ mode, initial, onSave, onClose }: Props) {
  const [form,        setForm]        = useState<FormData>(EMPTY);
  const [errors,      setErrors]      = useState<Partial<FormData>>({});
  const [showPicker,  setShowPicker]  = useState(false);
  const [saving,      setSaving]      = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        name:     initial.name,
        icon:     initial.icon,
        avgPrice: String(initial.avgPrice),
        active:   initial.active,
      });
    } else {
      setForm(EMPTY);
    }
  }, [mode, initial]);

  function validate(): boolean {
    const errs: Partial<FormData> = {};
    if (!form.name.trim())              errs.name     = "Category name is required";
    if (form.name.trim().length < 3)    errs.name     = "Name must be at least 3 characters";
    if (!form.avgPrice)                 errs.avgPrice = "Average price is required";
    if (isNaN(Number(form.avgPrice)) || Number(form.avgPrice) <= 0)
                                        errs.avgPrice = "Enter a valid price";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({
        name:     form.name.trim(),
        icon:     form.icon,
        avgPrice: Number(form.avgPrice),
        active:   form.active,
      });
      setSaving(false);
    }, 600);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                {mode === "add" ? <Plus size={15} className="text-sky-600" /> : <span className="text-base">{form.icon}</span>}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {mode === "add" ? "Add New Category" : `Edit — ${initial?.name}`}
                </h3>
                <p className="text-xs text-slate-400">
                  {mode === "add" ? "Create a new service category" : "Update category details"}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form body */}
          <div className="px-6 py-5 space-y-5">

            {/* Emoji + Name row */}
            <div className="flex gap-3 items-start">
              {/* Emoji picker trigger */}
              <div className="flex-shrink-0">
                <p className="text-xs font-bold text-slate-500 mb-1.5">Icon</p>
                <button
                  onClick={() => setShowPicker(s => !s)}
                  className={`w-14 h-14 rounded-2xl border-2 text-2xl flex items-center justify-center
                    transition-all hover:border-sky-400
                    ${showPicker ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-slate-50"}`}>
                  {form.icon}
                </button>
              </div>

              {/* Name */}
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 block mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e => ({ ...e, name: "" })); }}
                  placeholder="e.g. AC Service, Cleaning…"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all
                    ${errors.name
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Emoji picker grid */}
            {showPicker && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <p className="text-xs font-bold text-slate-400 mb-2">Pick an emoji</p>
                <div className="grid grid-cols-10 gap-1.5">
                  {CATEGORY_EMOJI_OPTIONS.map(emoji => (
                    <button key={emoji}
                      onClick={() => { setForm(f => ({ ...f, icon: emoji })); setShowPicker(false); }}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all
                        hover:bg-sky-100 hover:scale-110
                        ${form.icon === emoji ? "bg-sky-200 ring-2 ring-sky-400" : "bg-white"}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Avg Price */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                Average Booking Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={form.avgPrice}
                  onChange={e => { setForm(f => ({ ...f, avgPrice: e.target.value })); setErrors(e => ({ ...e, avgPrice: "" })); }}
                  placeholder="e.g. 1200"
                  className={`w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all
                    ${errors.avgPrice
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`}
                />
              </div>
              {errors.avgPrice && (
                <p className="text-xs text-red-500 mt-1">{errors.avgPrice}</p>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-700">Status</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {form.active ? "Active — visible to customers" : "Inactive — hidden from customers"}
                </p>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                  ${form.active ? "bg-emerald-500" : "bg-slate-300"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
                  ${form.active ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold
                text-slate-600 hover:bg-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold
                hover:bg-sky-700 transition-colors flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-sky-200">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Save size={15} /> {mode === "add" ? "Add Category" : "Save Changes"}</>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { transform: scale(0.95) translateY(10px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);    opacity: 1; }
        }
        .animate-modal-in {
          animation: modal-in 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </>
  );
}
