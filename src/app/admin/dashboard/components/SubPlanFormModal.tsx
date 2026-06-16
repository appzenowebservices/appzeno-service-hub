// src/pages/admin/dashboard/components/SubPlanFormModal.tsx

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Crown } from "lucide-react";
import type { SubscriptionPlan } from "../mockAdminData";

type BillingCycle = "monthly" | "quarterly" | "yearly";

interface FormData {
  name:         string;
  price:        string;
  billingCycle: BillingCycle;
  color:        string;
  popular:      boolean;
  active:       boolean;
  features:     string[];
}

const EMPTY: FormData = {
  name: "", price: "", billingCycle: "monthly", color: "blue",
  popular: false, active: true, features: [""],
};

const COLOR_OPTS = [
  { value: "blue",   label: "Blue (Basic)",      dot: "bg-sky-500"    },
  { value: "violet", label: "Violet (Premium)",  dot: "bg-violet-500" },
  { value: "amber",  label: "Amber (Enterprise)",dot: "bg-amber-500"  },
  { value: "rose",   label: "Rose",              dot: "bg-rose-500"   },
  { value: "emerald",label: "Emerald",           dot: "bg-emerald-500"},
];

const BILLING_OPTS: { value: BillingCycle; label: string }[] = [
  { value: "monthly",   label: "Monthly"   },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly",    label: "Yearly"    },
];

interface Props {
  mode:     "add" | "edit";
  initial?: SubscriptionPlan | null;
  onSave:   (data: Omit<SubscriptionPlan, "id" | "subscribers">) => void;
  onClose:  () => void;
}

export default function SubPlanFormModal({ mode, initial, onSave, onClose }: Props) {
  const [form,   setForm]   = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "features_0", string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        name:         initial.name,
        price:        String(initial.price),
        billingCycle: initial.billingCycle,
        color:        initial.color,
        popular:      initial.popular,
        active:       initial.active,
        features:     initial.features.length > 0 ? [...initial.features] : [""],
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [mode, initial]);

  // Feature list helpers
  function updateFeature(i: number, val: string) {
    setForm(f => { const fs = [...f.features]; fs[i] = val; return { ...f, features: fs }; });
  }
  function addFeature()    { setForm(f => ({ ...f, features: [...f.features, ""] })); }
  function removeFeature(i: number) {
    setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.name.trim())             errs.name  = "Plan name is required";
    if (!form.price)                   errs.price = "Price is required";
    if (isNaN(Number(form.price)) || Number(form.price) < 0)
                                       errs.price = "Enter a valid price";
    const filled = form.features.filter(f => f.trim());
    if (filled.length === 0)           errs.features_0 = "At least one feature required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({
        name:         form.name.trim(),
        price:        Number(form.price),
        billingCycle: form.billingCycle,
        color:        form.color,
        popular:      form.popular,
        active:       form.active,
        features:     form.features.filter(f => f.trim()),
      });
      setSaving(false);
    }, 600);
  }

  const dotColor = COLOR_OPTS.find(c => c.value === form.color)?.dot ?? "bg-sky-500";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-in">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                {mode === "add" ? <Plus size={15} className="text-sky-600" /> : <span className="text-base">✏️</span>}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {mode === "add" ? "Create New Plan" : `Edit — ${initial?.name}`}
                </h3>
                <p className="text-xs text-slate-400">
                  {mode === "add" ? "Define pricing, features & billing cycle" : "Update plan details"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e => ({ ...e, name: "" })); }}
                placeholder="e.g. Basic, Premium, Enterprise…"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all
                  ${errors.name ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Price + Billing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                  <input type="number" min="0" value={form.price}
                    onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setErrors(e => ({ ...e, price: "" })); }}
                    placeholder="e.g. 499"
                    className={`w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all
                      ${errors.price ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                     : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`}
                  />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Billing Cycle</label>
                <select value={form.billingCycle}
                  onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value as BillingCycle }))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200
                    focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100
                    appearance-none cursor-pointer text-slate-700 bg-white transition-all">
                  {BILLING_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Color theme */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2">Plan Color Theme</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTS.map(c => (
                  <button key={c.value}
                    onClick={() => setForm(f => ({ ...f, color: c.value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all
                      ${form.color === c.value
                        ? "border-slate-400 bg-slate-50 text-slate-800"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Features list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500">
                  Features <span className="text-red-500">*</span>
                </label>
                <button onClick={addFeature}
                  className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700">
                  <Plus size={12} /> Add feature
                </button>
              </div>
              {errors.features_0 && <p className="text-xs text-red-500 mb-2">{errors.features_0}</p>}
              <div className="space-y-2">
                {form.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={feat}
                      onChange={e => updateFeature(i, e.target.value)}
                      placeholder={`Feature ${i + 1} — e.g. Unlimited leads`}
                      className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200
                        focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                    />
                    {form.features.length > 1 && (
                      <button onClick={() => removeFeature(i)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {/* Popular */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Crown size={15} className="text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Mark as Popular</p>
                    <p className="text-xs text-slate-400">Shows "Most Popular" badge on the plan</p>
                  </div>
                </div>
                <button onClick={() => setForm(f => ({ ...f, popular: !f.popular }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                    ${form.popular ? "bg-amber-400" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
                    ${form.popular ? "left-5" : "left-0.5"}`} />
                </button>
              </div>

              {/* Active */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-700">Status</p>
                  <p className="text-xs text-slate-400">
                    {form.active ? "Active — visible to new vendors" : "Inactive — hidden from vendors"}
                  </p>
                </div>
                <button onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                    ${form.active ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
                    ${form.active ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Live preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
                  style={{ backgroundColor: `var(--preview-bg)` }}>
                  <span className={`w-4 h-4 rounded-full ${dotColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-800">{form.name || "Plan Name"}</p>
                    {form.popular && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        ★ Popular
                      </span>
                    )}
                  </div>
                  <p className="text-base font-black text-slate-700">
                    {form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "₹—"}
                    <span className="text-xs text-slate-400 font-normal ml-1">/ {form.billingCycle}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold
                hover:bg-sky-700 transition-colors flex items-center justify-center gap-2
                disabled:opacity-60 shadow-md shadow-sky-200">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Save size={15} /> {mode === "add" ? "Create Plan" : "Save Changes"}</>}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modal-in {
          from { transform: scale(0.95) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-modal-in { animation: modal-in 0.2s cubic-bezier(0.22,1,0.36,1); }
      `}</style>
    </>
  );
}
