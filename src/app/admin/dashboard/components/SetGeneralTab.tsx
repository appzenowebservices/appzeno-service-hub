// src/pages/admin/dashboard/components/SetGeneralTab.tsx

import { useState } from "react";
import { Save, Globe, Phone, Mail, Clock, Calendar, AlertTriangle,
         FileText, Shield, Zap } from "lucide-react";
import { PLATFORM_CONFIG } from "../mockAdminData";
import SetSectionCard from "./SetSectionCard";

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button onClick={() => !disabled && onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${value ? "bg-sky-600" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
        ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3.5 border-b border-slate-50 last:border-0 flex-wrap">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Input({ value, onChange, type = "text", prefix, suffix }:
  { value: string | number; onChange: (v: string) => void; type?: string; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-xs text-slate-400 font-bold">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full max-w-[192px] min-w-[120px] px-3 py-2 text-sm border border-slate-200 rounded-xl
          focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-right"
      />
      {suffix && <span className="text-xs text-slate-400 font-bold">{suffix}</span>}
    </div>
  );
}

export default function SetGeneralTab() {
  const [cfg,     setCfg]     = useState({ ...PLATFORM_CONFIG });
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [showMaintConfirm, setShowMaintConfirm] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 800);
  }

  function f(key: keyof typeof cfg) {
    return (v: string | boolean | number) =>
      setCfg(prev => ({ ...prev, [key]: v }));
  }

  return (
    <div className="space-y-5">

      {/* Save bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4
        bg-white/95 backdrop-blur border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
        <p className="text-xs text-slate-500">
          Last saved: <strong className="text-slate-700">{cfg.lastUpdated}</strong> by {cfg.updatedBy}
        </p>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold
            rounded-xl hover:bg-sky-700 transition-colors shadow-md shadow-sky-200 disabled:opacity-60">
          {saving
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            : saved
              ? <><span>✓</span> Saved!</>
              : <><Save size={13} /> Save Changes</>}
        </button>
      </div>

      {/* Maintenance mode — danger first */}
      {cfg.maintenanceMode && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-red-800">Maintenance Mode is ON</p>
            <p className="text-xs text-red-600 mt-0.5">
              The platform is currently offline for customers and vendors. Disable when ready.
            </p>
          </div>
        </div>
      )}

      {/* Brand & Identity */}
      <SetSectionCard title="Brand & Identity" subtitle="Platform name, tagline and support contact">
        <Field label="App Name" hint="Displayed in emails, notifications and UI">
          <Input value={cfg.appName} onChange={f("appName") as any} />
        </Field>
        <Field label="Tagline" hint="Short platform description">
          <Input value={cfg.tagline} onChange={f("tagline") as any} />
        </Field>
        <Field label="Support Email">
          <Input value={cfg.supportEmail} onChange={f("supportEmail") as any} />
        </Field>
        <Field label="Support Phone">
          <Input value={cfg.supportPhone} onChange={f("supportPhone") as any} />
        </Field>
      </SetSectionCard>

      {/* Localisation */}
      <SetSectionCard title="Localisation" subtitle="Timezone, date format and currency">
        <Field label="Timezone">
          <select value={cfg.timezone}
            onChange={e => f("timezone")(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl
              focus:outline-none focus:border-sky-400 appearance-none cursor-pointer
              bg-white text-slate-700 w-full max-w-[192px] text-right">
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="UTC">UTC</option>
          </select>
        </Field>
        <Field label="Date Format">
          <select value={cfg.dateFormat}
            onChange={e => f("dateFormat")(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl
              focus:outline-none focus:border-sky-400 appearance-none cursor-pointer
              bg-white text-slate-700 w-full max-w-[192px] text-right">
            <option>DD MMM YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </Field>
        <Field label="Currency">
          <Input value={cfg.currency} onChange={f("currency") as any} />
        </Field>
        <Field label="Currency Symbol">
          <Input value={cfg.currencySymbol} onChange={f("currencySymbol") as any} />
        </Field>
      </SetSectionCard>

      {/* Booking Rules */}
      <SetSectionCard title="Booking Rules" subtitle="Slot limits, advance booking and cancellation windows">
        <Field label="Max Bookings per Slot" hint="Maximum concurrent bookings for a single vendor">
          <Input value={cfg.maxBookingsPerSlot} onChange={v => f("maxBookingsPerSlot")(Number(v))} type="number" suffix="slots" />
        </Field>
        <Field label="Min Booking Advance" hint="Minimum hours before a booking can be placed">
          <Input value={cfg.minBookingAdvance} onChange={v => f("minBookingAdvance")(Number(v))} type="number" suffix="hrs" />
        </Field>
        <Field label="Cancellation Window" hint="Hours within which free cancellation is allowed">
          <Input value={cfg.cancellationWindow} onChange={v => f("cancellationWindow")(Number(v))} type="number" suffix="hrs" />
        </Field>
        <Field label="Refund Window" hint="Days within which refund requests are accepted">
          <Input value={cfg.refundWindow} onChange={v => f("refundWindow")(Number(v))} type="number" suffix="days" />
        </Field>
      </SetSectionCard>

      {/* Feature Flags */}
      <SetSectionCard title="Feature Flags" subtitle="Toggle platform-wide behaviour">
        <Field label="Vendor Auto-Approve" hint="Automatically approve new vendors without manual KYC review">
          <Toggle value={cfg.vendorAutoApprove} onChange={f("vendorAutoApprove") as any} />
        </Field>
        <Field label="Accept New City Requests" hint="Allow vendors to request new city onboarding">
          <Toggle value={cfg.newCityRequests} onChange={f("newCityRequests") as any} />
        </Field>
        <Field label="Maintenance Mode"
          hint={cfg.maintenanceMode ? "Platform is offline for all users" : "Platform is live and fully operational"}>
          {showMaintConfirm ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-red-600 font-bold">Confirm?</p>
              <button onClick={() => { f("maintenanceMode")(!cfg.maintenanceMode); setShowMaintConfirm(false); }}
                className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700">Yes</button>
              <button onClick={() => setShowMaintConfirm(false)}
                className="px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg text-slate-600">No</button>
            </div>
          ) : (
            <Toggle value={cfg.maintenanceMode}
              onChange={() => setShowMaintConfirm(true)} />
          )}
        </Field>
      </SetSectionCard>

      {/* Legal Docs */}
      <SetSectionCard title="Legal Documents" subtitle="Current Terms of Service and Privacy Policy versions">
        <Field label="Terms of Service Version">
          <Input value={cfg.termsVersion} onChange={f("termsVersion") as any} />
        </Field>
        <Field label="Privacy Policy Version">
          <Input value={cfg.privacyVersion} onChange={f("privacyVersion") as any} />
        </Field>
        <div className="pt-2 flex items-center gap-3">
          <button className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700">
            <FileText size={13} /> View Current Terms
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700">
            <Shield size={13} /> View Privacy Policy
          </button>
        </div>
      </SetSectionCard>
    </div>
  );
}
