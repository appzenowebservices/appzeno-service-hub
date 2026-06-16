// src/pages/admin/dashboard/components/SetGatewayTab.tsx

import { useState } from "react";
import { Save, MessageSquare, Mail, CreditCard, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { GATEWAY_CONFIG } from "../mockAdminData";
import SetSectionCard from "./SetSectionCard";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer
        ${value ? "bg-sky-600" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
        ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3.5 border-b border-slate-50 last:border-0 flex-wrap">
      <div>
        <p className="text-sm font-bold text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, monospace }:
  { value: string; onChange: (v: string) => void; placeholder?: string; monospace?: boolean }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full max-w-[192px] min-w-[120px] px-3 py-2 text-sm border border-slate-200 rounded-xl text-right
        focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all
        ${monospace ? "font-mono" : ""}`} />
  );
}

function SaveBtn({ label, onSave }: { label: string; onSave: () => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <button onClick={() => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 shadow-md shadow-sky-200">
      {saved ? "✓ Saved" : <><Save size={12} /> {label}</>}
    </button>
  );
}

const SMS_PROVIDERS  = ["msg91", "twilio", "textlocal", "kaleyra"];
const EMAIL_PROVIDERS = ["sendgrid", "mailgun", "ses", "smtp"];

export default function SetGatewayTab() {
  const [cfg, setCfg] = useState({ ...GATEWAY_CONFIG });
  const f = (key: keyof typeof cfg) => (v: any) => setCfg(prev => ({ ...prev, [key]: v }));

  const smsUsagePct  = 0; // Real usage would come from API
  const emailUsagePct = Math.round((cfg.emailSentToday / cfg.emailDailyLimit) * 100);

  const PAYMENT_GWS = [
    {
      key: "razorpay",
      label: "Razorpay",
      desc:  "Primary payment gateway — UPI, cards, netbanking",
      enabled: cfg.razorpayEnabled,
      mode:    cfg.razorpayMode,
      modeKey: "razorpayMode" as keyof typeof cfg,
      enableKey: "razorpayEnabled" as keyof typeof cfg,
      color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200",
    },
    {
      key: "cashfree",
      label: "Cashfree",
      desc:  "Backup gateway for instant payouts",
      enabled: cfg.cashfreeEnabled,
      mode:    "live" as const,
      modeKey: undefined,
      enableKey: "cashfreeEnabled" as keyof typeof cfg,
      color: "text-green-700", bg: "bg-green-50", border: "border-green-200",
    },
    {
      key: "paytm",
      label: "Paytm Business",
      desc:  "Paytm wallet & UPI payments",
      enabled: cfg.paytmEnabled,
      mode:    "live" as const,
      modeKey: undefined,
      enableKey: "paytmEnabled" as keyof typeof cfg,
      color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200",
    },
  ];

  return (
    <div className="space-y-5">

      {/* SMS Gateway */}
      <SetSectionCard title="SMS Gateway"
        subtitle="Send OTPs, booking alerts and notifications via SMS"
        action={<SaveBtn label="Save SMS" onSave={() => {}} />}>

        <Field label="SMS Provider">
          <select value={cfg.smsProvider} onChange={e => f("smsProvider")(e.target.value)}
            className="w-full max-w-[144px] px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none
              focus:border-sky-400 appearance-none cursor-pointer bg-white capitalize">
            {SMS_PROVIDERS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </Field>
        <Field label="Sender ID">
          <TextInput value={cfg.smsSenderId} onChange={f("smsSenderId")} monospace />
        </Field>
        <Field label="SMS Credits Remaining"
          hint={cfg.smsBalance < 5000 ? "⚠️ Low balance — top up soon" : "Balance is healthy"}>
          <div className="text-right">
            <p className={`text-base font-black ${cfg.smsBalance < 5000 ? "text-amber-600" : "text-emerald-600"}`}>
              {cfg.smsBalance.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">credits</p>
          </div>
        </Field>
        <div className="pt-2">
          <button className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700">
            <ExternalLink size={12} /> Open MSG91 Dashboard
          </button>
        </div>
      </SetSectionCard>

      {/* Email Gateway */}
      <SetSectionCard title="Email Gateway"
        subtitle="Transactional emails — booking confirmation, payouts, alerts"
        action={<SaveBtn label="Save Email" onSave={() => {}} />}>

        <Field label="Email Provider">
          <select value={cfg.emailProvider} onChange={e => f("emailProvider")(e.target.value)}
            className="w-full max-w-[144px] px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none
              focus:border-sky-400 appearance-none cursor-pointer bg-white capitalize">
            {EMAIL_PROVIDERS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
        </Field>
        <Field label="Sender Name">
          <TextInput value={cfg.emailSenderName} onChange={f("emailSenderName")} />
        </Field>
        <Field label="Sender Address">
          <TextInput value={cfg.emailSenderAddr} onChange={f("emailSenderAddr")} monospace />
        </Field>
        <Field label="Daily Send Limit">
          <div className="flex items-center gap-2">
            <input type="number" value={cfg.emailDailyLimit}
              onChange={e => f("emailDailyLimit")(Number(e.target.value))}
              className="w-24 sm:w-28 px-3 py-2 text-sm border border-slate-200 rounded-xl text-right
                focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
            <span className="text-xs text-slate-400">/day</span>
          </div>
        </Field>
        <Field label="Emails Sent Today"
          hint={`${emailUsagePct}% of daily limit used`}>
          <div className="text-right">
            <p className={`text-base font-black ${emailUsagePct > 80 ? "text-amber-600" : "text-emerald-600"}`}>
              {cfg.emailSentToday.toLocaleString()}
            </p>
            <div className="w-20 sm:w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div className={`h-full rounded-full transition-all ${emailUsagePct > 80 ? "bg-amber-400" : "bg-emerald-400"}`}
                style={{ width: `${Math.min(emailUsagePct, 100)}%` }} />
            </div>
          </div>
        </Field>
      </SetSectionCard>

      {/* Payment Gateways */}
      <SetSectionCard title="Payment Gateways"
        subtitle="Enable payment methods and set live / test mode">
        <div className="space-y-4">
          {PAYMENT_GWS.map(gw => (
            <div key={gw.key}
              className={`border rounded-2xl p-4 transition-all
                ${gw.enabled ? `${gw.bg} ${gw.border}` : "border-slate-200 bg-slate-50/50"}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <CreditCard size={18} className={gw.enabled ? gw.color : "text-slate-400"} />
                  <div>
                    <p className={`text-sm font-black ${gw.enabled ? gw.color : "text-slate-500"}`}>
                      {gw.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{gw.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {gw.enabled ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <AlertCircle size={12} /> Inactive
                    </span>
                  )}
                  <Toggle
                    value={gw.enabled as boolean}
                    onChange={v => f(gw.enableKey)(v)} />
                </div>
              </div>

              {/* Mode selector (only if enabled and has modeKey) */}
              {gw.enabled && gw.modeKey && (
                <div className="flex items-center gap-2 pt-3 border-t border-current/10">
                  <p className="text-xs font-bold text-slate-500 mr-2">Mode:</p>
                  {(["live", "test"] as const).map(m => (
                    <button key={m} onClick={() => gw.modeKey && f(gw.modeKey)(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all
                        ${cfg[gw.modeKey as keyof typeof cfg] === m
                          ? m === "live" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                        : "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
                      {m === "live" ? "🟢 Live" : "🧪 Test"}
                    </button>
                  ))}
                  {cfg[gw.modeKey as keyof typeof cfg] === "test" && (
                    <span className="text-xs text-amber-600 font-bold ml-2">
                      ⚠️ Test mode — no real transactions
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </SetSectionCard>

      {/* API Keys info */}
      <SetSectionCard title="API Keys & Webhooks"
        subtitle="Sensitive credentials — shown partially for security" danger>
        <div className="space-y-3">
          {[
            { label: "Razorpay Key ID",    value: "rzp_live_••••••••••••XXXX" },
            { label: "Razorpay Key Secret",value: "••••••••••••••••••••••••••" },
            { label: "MSG91 Auth Key",     value: "••••••••••••••••••••••••••" },
            { label: "SendGrid API Key",   value: "SG.••••••••••••••••••••••" },
            { label: "Webhook Secret",     value: "whsec_••••••••••••••••••••" },
          ].map(k => (
            <div key={k.label} className="flex items-start justify-between gap-2 py-2.5 border-b border-slate-50 last:border-0 flex-wrap">
              <p className="text-sm font-bold text-slate-700 flex-shrink-0">{k.label}</p>
              <div className="flex items-center gap-2 min-w-0">
                <code className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg truncate max-w-[160px] sm:max-w-none">
                  {k.value}
                </code>
                <button className="text-xs font-bold text-sky-600 hover:text-sky-700 flex-shrink-0">Rotate</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          ⚠️ Never share API keys. Rotating a key will require updating all integrations.
        </div>
      </SetSectionCard>
    </div>
  );
}
