// src/pages/admin/dashboard/components/SetFinanceTab.tsx

import { useState } from "react";
import { Edit2, Save, IndianRupee, Percent, RefreshCw, Shield } from "lucide-react";
import {
  PLATFORM_CONFIG, PAYOUT_CONFIG, COMMISSION_TIERS, COMMISSION_CONFIG,
  type CommissionTier,
} from "../mockAdminData";
import SetSectionCard    from "./SetSectionCard";
import SetCommissionModal from "./SetCommissionModal";

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

function NumInput({ value, onChange, suffix, min = 0 }:
  { value: number; onChange: (v: number) => void; suffix?: string; min?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="number" min={min} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-24 sm:w-28 px-3 py-2 text-sm border border-slate-200 rounded-xl
          focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-right transition-all" />
      {suffix && <span className="text-xs font-bold text-slate-400">{suffix}</span>}
    </div>
  );
}

const TIER_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  Starter: { bg: "bg-slate-100",   text: "text-slate-700",   border: "border-slate-200"   },
  Bronze:  { bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-200"  },
  Silver:  { bg: "bg-slate-100",   text: "text-slate-600",   border: "border-slate-300"   },
  Gold:    { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"   },
};

export default function SetFinanceTab() {
  const [feeRate,     setFeeRate]     = useState(PLATFORM_CONFIG.platformFeeRate);
  const [gstRate,     setGstRate]     = useState(PLATFORM_CONFIG.gstRate);
  const [payout,      setPayout]      = useState({ ...PAYOUT_CONFIG });
  const [commission,  setCommission]  = useState({ ...COMMISSION_CONFIG });
  const [tiers,       setTiers]       = useState<CommissionTier[]>([...COMMISSION_TIERS]);
  const [editTier,    setEditTier]    = useState<CommissionTier | null>(null);
  const [saved,       setSaved]       = useState<string | null>(null);

  function showSaved(key: string) {
    setSaved(key); setTimeout(() => setSaved(null), 2000);
  }

  function saveTier(updated: CommissionTier) {
    setTiers(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditTier(null);
    showSaved("tier-" + updated.id);
  }

  return (
    <div className="space-y-5">

      {/* Platform Revenue */}
      <SetSectionCard title="Platform Revenue Config"
        subtitle="Fee rates applied to all bookings and transactions"
        action={
          <button onClick={() => showSaved("revenue")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 shadow-md shadow-sky-200">
            {saved === "revenue" ? "✓ Saved" : <><Save size={12} /> Save</>}
          </button>
        }>
        <Field label="Platform Fee Rate" hint="Charged on every booking — deducted before vendor payout">
          <NumInput value={feeRate} onChange={setFeeRate} suffix="%" />
        </Field>
        <Field label="GST Rate" hint="Applied on platform fee amount">
          <NumInput value={gstRate} onChange={setGstRate} suffix="%" />
        </Field>
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-700 mt-2">
          On a ₹1,000 booking: Platform takes <strong>₹{feeRate * 10}</strong> ({feeRate}%) +
          GST <strong>₹{((feeRate * 10 * gstRate) / 100).toFixed(0)}</strong> →
          Vendor receives <strong>₹{1000 - feeRate * 10}</strong>
        </div>
      </SetSectionCard>

      {/* Payout Settings */}
      <SetSectionCard title="Vendor Payout Settings"
        subtitle="How and when vendors receive their earnings"
        action={
          <button onClick={() => showSaved("payout")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 shadow-md shadow-sky-200">
            {saved === "payout" ? "✓ Saved" : <><Save size={12} /> Save</>}
          </button>
        }>
        <Field label="Payout Cycle">
          <select value={payout.vendorCycle}
            onChange={e => setPayout(p => ({ ...p, vendorCycle: e.target.value as any }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none
              focus:border-sky-400 appearance-none cursor-pointer bg-white text-slate-700 w-28 sm:w-36">
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
        <Field label="Payout Day" hint="Day of week/month for scheduled releases">
          <select value={payout.vendorPayoutDay}
            onChange={e => setPayout(p => ({ ...p, vendorPayoutDay: e.target.value }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none
              focus:border-sky-400 appearance-none cursor-pointer bg-white text-slate-700 w-28 sm:w-36">
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d =>
              <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Minimum Payout Amount">
          <NumInput value={payout.minVendorPayout} onChange={v => setPayout(p => ({ ...p, minVendorPayout: v }))} suffix="₹" />
        </Field>
        <Field label="Max Payout per Transaction">
          <NumInput value={payout.maxPayoutPerTxn} onChange={v => setPayout(p => ({ ...p, maxPayoutPerTxn: v }))} suffix="₹" />
        </Field>
        <Field label="Hold After Booking Completion">
          <NumInput value={payout.holdAfterBooking} onChange={v => setPayout(p => ({ ...p, holdAfterBooking: v }))} suffix="hrs" />
        </Field>
        <Field label="Verification Threshold" hint="Manual review required above this amount">
          <NumInput value={payout.verificationThreshold} onChange={v => setPayout(p => ({ ...p, verificationThreshold: v }))} suffix="₹" />
        </Field>
        <Field label="Auto-Release Payouts" hint="Automatically disburse approved payouts">
          <Toggle value={payout.autoRelease} onChange={v => setPayout(p => ({ ...p, autoRelease: v }))} />
        </Field>
        <Field label="Require Verification">
          <Toggle value={payout.requireVerification} onChange={v => setPayout(p => ({ ...p, requireVerification: v }))} />
        </Field>
        <Field label="UPI Enabled">
          <Toggle value={payout.upiEnabled} onChange={v => setPayout(p => ({ ...p, upiEnabled: v }))} />
        </Field>
        <Field label="Bank Transfer Enabled">
          <Toggle value={payout.bankEnabled} onChange={v => setPayout(p => ({ ...p, bankEnabled: v }))} />
        </Field>
        <Field label="Wallet Payouts Enabled">
          <Toggle value={payout.walletEnabled} onChange={v => setPayout(p => ({ ...p, walletEnabled: v }))} />
        </Field>
      </SetSectionCard>

      {/* Commission config */}
      <SetSectionCard title="Agent Commission Config"
        subtitle="Base calculation method and payout settings for agents"
        action={
          <button onClick={() => showSaved("commission")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 shadow-md shadow-sky-200">
            {saved === "commission" ? "✓ Saved" : <><Save size={12} /> Save</>}
          </button>
        }>
        <Field label="Commission Base">
          <select value={commission.baseCalcOn}
            onChange={e => setCommission(c => ({ ...c, baseCalcOn: e.target.value as any }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none
              focus:border-sky-400 appearance-none cursor-pointer bg-white text-slate-700 w-36 sm:w-44">
            <option value="gross_revenue">Gross Revenue</option>
            <option value="net_revenue">Net Revenue</option>
            <option value="platform_fee">Platform Fee</option>
          </select>
        </Field>
        <Field label="Payout Cycle">
          <select value={commission.payoutCycle}
            onChange={e => setCommission(c => ({ ...c, payoutCycle: e.target.value as any }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none
              focus:border-sky-400 appearance-none cursor-pointer bg-white text-slate-700 w-36 sm:w-44">
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
        <Field label="Hold Period" hint="Days before commission is credited">
          <NumInput value={commission.holdPeriod} onChange={v => setCommission(c => ({ ...c, holdPeriod: v }))} suffix="days" />
        </Field>
        <Field label="Minimum Payout">
          <NumInput value={commission.minPayout} onChange={v => setCommission(c => ({ ...c, minPayout: v }))} suffix="₹" />
        </Field>
        <Field label="Penalty Rate" hint="% deducted for disputed/cancelled leads">
          <NumInput value={commission.penaltyRate} onChange={v => setCommission(c => ({ ...c, penaltyRate: v }))} suffix="%" />
        </Field>
        <Field label="Dispute Hold Days" hint="Commission frozen for X days on disputed bookings">
          <NumInput value={commission.disputeHoldDays} onChange={v => setCommission(c => ({ ...c, disputeHoldDays: v }))} suffix="days" />
        </Field>
      </SetSectionCard>

      {/* Commission Tiers */}
      <SetSectionCard title="Agent Commission Tiers"
        subtitle="Rate by monthly lead count — click a tier to edit">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tiers.map(t => {
            const col = TIER_COLOR[t.label] ?? TIER_COLOR.Starter;
            return (
              <div key={t.id} className={`${col.bg} border ${col.border} rounded-2xl p-4 relative`}>
                {saved === "tier-" + t.id && (
                  <span className="absolute top-3 right-3 text-xs font-bold text-emerald-600">✓ Saved</span>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${col.bg} ${col.text} border ${col.border}`}>
                    {t.label}
                  </span>
                  <button onClick={() => setEditTier(t)}
                    className="p-1.5 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-700 transition-colors">
                    <Edit2 size={13} />
                  </button>
                </div>
                <p className="text-2xl font-black text-slate-800">{t.rate}%</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.bonusRate > 0 && <span className="text-emerald-600 font-bold">+{t.bonusRate}% bonus · </span>}
                  {t.minLeads}–{t.maxLeads ?? "∞"} leads/mo
                </p>
                <p className="text-xs text-slate-400 mt-1.5">{t.description}</p>
              </div>
            );
          })}
        </div>
      </SetSectionCard>

      {/* Commission modal */}
      {editTier && (
        <SetCommissionModal
          tier={editTier}
          onSave={saveTier}
          onClose={() => setEditTier(null)}
        />
      )}
    </div>
  );
}
