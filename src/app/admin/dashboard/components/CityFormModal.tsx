// src/pages/admin/dashboard/components/CityFormModal.tsx
// Uses FREE API: https://api.postalpincode.in/pincode/{pincode}
// No API key required — India Post open data

import { useState, useEffect } from "react";
import { X, Save, Plus, Search, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import type { CityData } from "../mockAdminData";
import { MOCK_AGENTS } from "../mockAdminData";

// ─── Pincode API types ─────────────────────────────────────────────────────────
interface PostOffice {
  Name:     string;
  District: string;
  State:    string;
  Pincode:  string;
}
interface PincodeAPIResult {
  Status:    "Success" | "Error";
  PostOffice: PostOffice[] | null;
}

// ─── Form state ────────────────────────────────────────────────────────────────
interface FormData {
  pincode:  string;
  name:     string;
  state:    string;
  district: string;
  agent:    string;
  active:   boolean;
}

const EMPTY: FormData = {
  pincode:  "",
  name:     "",
  state:    "",
  district: "",
  agent:    "Unassigned",
  active:   true,
};

type FetchStatus = "idle" | "loading" | "success" | "error" | "not_found";

interface Props {
  mode:     "add" | "edit";
  initial?: CityData | null;
  existing: CityData[];          // to check duplicate pincodes
  onSave:   (data: Omit<CityData, "id" | "vendors" | "customers" | "bookings" | "revenue" | "growth" | "topCategory">) => void;
  onClose:  () => void;
}

export default function CityFormModal({ mode, initial, existing, onSave, onClose }: Props) {
  const [form,        setForm]        = useState<FormData>(EMPTY);
  const [errors,      setErrors]      = useState<Partial<Record<keyof FormData, string>>>({});
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [saving,      setSaving]      = useState(false);

  // Agent list from mock — only active agents
  const AGENT_OPTIONS = [
    "Unassigned",
    ...MOCK_AGENTS.filter(a => a.status === "active").map(a => a.name),
  ];

  // Populate form in edit mode
  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        pincode:  initial.pincode,
        name:     initial.name,
        state:    initial.state,
        district: initial.district,
        agent:    initial.agent,
        active:   initial.active,
      });
      setFetchStatus("success"); // already have data
    } else {
      setForm(EMPTY);
      setFetchStatus("idle");
    }
  }, [mode, initial]);

  // ── Pincode auto-fetch ──────────────────────────────────────────────────────
  async function fetchPincode(pin: string) {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) return;

    // Duplicate check (only for add mode)
    if (mode === "add") {
      const dup = existing.find(c => c.pincode === pin);
      if (dup) {
        setErrors(e => ({ ...e, pincode: `"${dup.name}" already added with this pincode` }));
        setFetchStatus("error");
        return;
      }
    }

    setFetchStatus("loading");
    setErrors(e => ({ ...e, pincode: "" }));

    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const json = await res.json() as PincodeAPIResult[];
      const result = json[0];

      if (result.Status === "Success" && result.PostOffice && result.PostOffice.length > 0) {
        const po = result.PostOffice[0];
        // Use District as city name (more city-level), fallback to first PostOffice name
        const cityName = po.District.split(" ")[0]; // e.g. "Gautam Buddha Nagar" → use as-is
        setForm(f => ({
          ...f,
          name:     po.District,
          state:    po.State,
          district: po.District,
        }));
        setFetchStatus("success");
      } else {
        setFetchStatus("not_found");
        setErrors(e => ({ ...e, pincode: "No location found for this pincode" }));
      }
    } catch {
      setFetchStatus("error");
      setErrors(e => ({ ...e, pincode: "Network error — check connection" }));
    }
  }

  // Trigger fetch when pincode reaches 6 digits
  function handlePincodeChange(val: string) {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setForm(f => ({ ...f, pincode: cleaned, name: "", state: "", district: "" }));
    setErrors(e => ({ ...e, pincode: "" }));
    setFetchStatus("idle");
    if (cleaned.length === 6) fetchPincode(cleaned);
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.pincode || form.pincode.length !== 6) errs.pincode = "Enter a valid 6-digit pincode";
    if (!form.name.trim())                          errs.name    = "City name is required";
    if (!form.state.trim())                         errs.state   = "State is required";
    if (fetchStatus === "loading")                  errs.pincode = "Please wait for pincode lookup";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({
        pincode:  form.pincode,
        name:     form.name.trim(),
        state:    form.state.trim(),
        district: form.district.trim(),
        agent:    form.agent,
        active:   form.active,
      });
      setSaving(false);
    }, 600);
  }

  // ── Status icon for pincode field ───────────────────────────────────────────
  function PincodeStatusIcon() {
    if (fetchStatus === "loading") return <Loader size={15} className="text-sky-500 animate-spin" />;
    if (fetchStatus === "success") return <CheckCircle2 size={15} className="text-emerald-500" />;
    if (fetchStatus === "error" || fetchStatus === "not_found") return <AlertCircle size={15} className="text-red-400" />;
    return <Search size={15} className="text-slate-300" />;
  }

  const autoFilled = fetchStatus === "success" && (form.name || form.state);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />

      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                {mode === "add" ? <Plus size={15} className="text-sky-600" /> : <span className="text-base">✏️</span>}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {mode === "add" ? "Add New City" : `Edit — ${initial?.name}`}
                </h3>
                <p className="text-xs text-slate-400">
                  {mode === "add" ? "Enter pincode to auto-fill city details" : "Update city details"}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* ── PINCODE — the star feature ── */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                Pincode <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">
                  — city details will auto-fill
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={e => handlePincodeChange(e.target.value)}
                  placeholder="e.g. 201001"
                  maxLength={6}
                  disabled={mode === "edit"}
                  className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border font-mono
                    focus:outline-none focus:ring-2 transition-all
                    ${mode === "edit" ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}
                    ${errors.pincode
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : fetchStatus === "success"
                        ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100 bg-emerald-50/40"
                        : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <PincodeStatusIcon />
                </div>
              </div>
              {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
              {mode === "edit" && (
                <p className="text-xs text-slate-400 mt-1">Pincode cannot be changed after creation</p>
              )}
            </div>

            {/* Auto-fill success banner */}
            {autoFilled && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">
                  City details auto-filled from pincode ✓
                </p>
              </div>
            )}

            {/* Loading state */}
            {fetchStatus === "loading" && (
              <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
                <Loader size={14} className="text-sky-500 animate-spin flex-shrink-0" />
                <p className="text-xs text-sky-700 font-medium">
                  Looking up pincode…
                </p>
              </div>
            )}

            {/* City Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                City Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e => ({ ...e, name: "" })); }}
                placeholder="Auto-filled from pincode…"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all
                  ${errors.name
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* State + District row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={e => { setForm(f => ({ ...f, state: e.target.value })); setErrors(e => ({ ...e, state: "" })); }}
                  placeholder="Auto-filled…"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all
                    ${errors.state
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`}
                />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">District</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  placeholder="Auto-filled…"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200
                    focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>
            </div>

            {/* Assign Agent */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Assign Agent</label>
              <select
                value={form.agent}
                onChange={e => setForm(f => ({ ...f, agent: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200
                  focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100
                  transition-all appearance-none cursor-pointer text-slate-700 bg-white">
                {AGENT_OPTIONS.map(a => (
                  <option key={a} value={a}>{a === "Unassigned" ? "— Unassigned —" : a}</option>
                ))}
              </select>
            </div>

            {/* Status toggle */}
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
              disabled={saving || fetchStatus === "loading"}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold
                hover:bg-sky-700 transition-colors flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-sky-200">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Save size={15} /> {mode === "add" ? "Add City" : "Save Changes"}</>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { transform: scale(0.95) translateY(10px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);    opacity: 1; }
        }
        .animate-modal-in { animation: modal-in 0.2s cubic-bezier(0.22,1,0.36,1); }
      `}</style>
    </>
  );
}
