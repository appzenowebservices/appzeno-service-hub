// src/pages/customer/booking/Step5Pricing.tsx
import { Check, Info } from "lucide-react";
import type { Step1Data, Step2Data, Step6Data } from "./types";
import { CATEGORY_DATA } from "./data";
import { MOCK_CATEGORIES } from "../../../../data/mockData";

interface Props {
  step1:   Step1Data;
  step2:   Step2Data;
  step6:   Step6Data;
  errors:  Record<string,string>;
  onChange:(d: Step6Data) => void;
  // Computed totals passed in from parent
  subtotal:      number;
  gst:           number;
  totalPayable:  number;
  preDiscount:   number;
  couponDiscount:number;
  walletDiscount:number;
}

function PricingRow({ label, amount, note, highlight, red }: {
  label:string; amount:string; note?:string; highlight?:boolean; red?:boolean;
}) {
  return (
    <div className={`flex items-start justify-between py-2.5 ${highlight ? "bg-emerald-50 px-3 -mx-3 rounded-xl" : ""} border-b border-slate-50 last:border-0`}>
      <div>
        <p className={`text-sm ${highlight ? "font-black text-slate-800" : "text-slate-600"}`}>{label}</p>
        {note && <p className="text-xs text-slate-400 mt-0.5">{note}</p>}
      </div>
      <p className={`text-sm font-bold flex-shrink-0 ml-4 ${red ? "text-red-500" : highlight ? "text-emerald-700 font-black text-base" : "text-slate-700"}`}>
        {amount}
      </p>
    </div>
  );
}

export default function Step5Pricing({ step1, step2, step6, errors, onChange, subtotal, gst, totalPayable, preDiscount, couponDiscount, walletDiscount }: Props) {
  const categories = step1.categoryIds.map(id => MOCK_CATEGORIES.find(c => c.id === id)).filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">Pricing Estimate</h2>
        <p className="text-sm text-slate-400 mt-0.5">Transparent pricing — no hidden charges</p>
      </div>

      {/* Per-category breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Service-wise Breakdown</p>
        </div>
        <div className="divide-y divide-slate-50">
          {categories.map(cat => {
            if (!cat) return null;
            const catData = CATEGORY_DATA[cat.id];
            if (!catData) return null;
            const urgencySurge = step2.urgency === "emergency" ? 0.30 : step2.urgency === "priority" ? 0.15 : 0;
            const urgencyExtra = Math.round(catData.basePrice * urgencySurge);
            return (
              <div key={cat.id} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{cat.icon}</span>
                  <p className="text-sm font-black text-slate-800">{cat.name}</p>
                  {step1.subServices.length > 0 && (
                    <span className="text-xs text-slate-400">({step1.subServices.slice(0,2).join(", ")}{step1.subServices.length > 2 ? "..." : ""})</span>
                  )}
                </div>
                <div className="pl-7 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base charge</span>
                    <span className="font-semibold">₹{catData.basePrice}</span>
                  </div>
                  {catData.visitCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Visit charge</span>
                      <span className="font-semibold">₹{catData.visitCharge}</span>
                    </div>
                  )}
                  {urgencyExtra > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>{step2.urgency === "emergency" ? "Emergency" : "Priority"} surge (+{step2.urgency === "emergency" ? 30 : 15}%)</span>
                      <span className="font-semibold">₹{urgencyExtra}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Parts estimate (if needed)</span>
                    <span>₹{Math.round(catData.basePrice * 0.1)} – ₹{Math.round(catData.basePrice * 0.5)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform fee (5%)</span>
                    <span>₹{Math.round(catData.basePrice * 0.05)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price variation disclaimer */}
      <div data-field="agreedPrice">
        <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
          ${errors.agreedPrice ? "border-red-300 bg-red-50"
          : step6.agreedPrice  ? "border-emerald-300 bg-emerald-50"
                               : "border-slate-200 bg-white hover:border-slate-300"}`}>
          <input type="checkbox" checked={step6.agreedPrice}
            onChange={e => onChange({ ...step6, agreedPrice: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              I understand the pricing may vary based on actual work scope
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Vendor will confirm final price after inspecting the job. Parts cost extra.
            </p>
          </div>
        </label>
        {errors.agreedPrice && <p className="text-xs text-red-500 mt-1">{errors.agreedPrice}</p>}
      </div>

      {/* Total Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Total Estimate</p>
        </div>
        <div className="px-5 py-3">
          <PricingRow label="Subtotal"    amount={`₹${subtotal}`} />
          <PricingRow label="GST (18%)"   amount={`₹${gst}`} />
          {couponDiscount > 0 && <PricingRow label={`Coupon (${step6.couponCode})`} amount={`−₹${couponDiscount}`} red />}
          {walletDiscount > 0 && <PricingRow label="Wallet Credit" amount={`−₹${walletDiscount}`} red />}
          <div className="h-px bg-slate-200 my-1" />
          <PricingRow label="Total Payable" amount={`₹${totalPayable}`} highlight />
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
        <Info size={13} className="flex-shrink-0 mt-0.5" />
        <p>This is an <strong>estimate</strong>. Final invoice will be generated by the vendor after service completion. Additional parts or labour may be charged separately.</p>
      </div>
    </div>
  );
}
