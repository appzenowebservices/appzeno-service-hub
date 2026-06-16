// src/pages/customer/booking/Step7Confirm.tsx
import { Sparkles, Zap, Users, Timer, RotateCcw, TrendingUp, Info } from "lucide-react";
import type { BookingFormData } from "./types";
import { MOCK_CATEGORIES } from "../../../../data/mockData";

interface Props {
  formData:      BookingFormData;
  errors:        Record<string,string>;
  agreedTerms:   boolean;
  onToggleTerms: (v:boolean) => void;
  totalPayable:  number;
  payNowAmount:  number;
  paymentMode:   string;
}

export default function Step7Confirm({
  formData, errors, agreedTerms, onToggleTerms, totalPayable, payNowAmount, paymentMode
}: Props) {
  const { s1, s2, s3, s4, s6 } = formData;

  const categories = s1.categoryIds.map(id => MOCK_CATEGORIES.find(c => c.id === id)).filter(Boolean);

  const paymentLabel =
    paymentMode === "cod"     ? "Pay After Service (Cash/UPI)"
    : paymentMode === "partial" ? `₹${payNowAmount} now + ₹${totalPayable - payNowAmount} after`
    : `Full ₹${totalPayable} — ${s6.paymentMethod.toUpperCase()}`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">Review & Confirm</h2>
        <p className="text-sm text-slate-400 mt-0.5">Verify all details before dispatching</p>
      </div>

      {/* Dark summary card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-amber-400" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Booking Summary</p>
        </div>

        <div className="space-y-3">
          {/* Services */}
          <div className="flex items-start gap-3">
            <span className="text-xs text-slate-400 w-24 flex-shrink-0 pt-0.5">Services</span>
            <div className="flex-1 space-y-1">
              {categories.map(cat => {
                if (!cat) return null;
                const slot = s4.vendorSlots.find(v => v.categoryId === cat.id);
                return (
                  <div key={cat.id} className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{cat.name}</p>
                      {slot && <p className="text-xs text-slate-400">{slot.date} · {slot.timeSlot}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {s1.subServices.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-slate-400 w-24 flex-shrink-0 pt-0.5">Sub-services</span>
              <span className="text-xs text-white font-semibold">{s1.subServices.join(", ")}</span>
            </div>
          )}

          {s2.problemTypes.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-slate-400 w-24 flex-shrink-0 pt-0.5">Problems</span>
              <span className="text-xs text-white font-semibold">{s2.problemTypes.join(", ")}</span>
            </div>
          )}

          {[
            { label:"Urgency",  value: s2.urgency === "standard" ? "Standard (24 hrs)" : s2.urgency === "priority" ? "⚡ Priority (4 hrs)" : "🚨 Emergency (1 hr)" },
            { label:"Location", value: `${s3.houseFlat}, ${s3.building ? s3.building+", " : ""}${s3.area}, ${s3.pincode}` },
            { label:"Property", value: s1.propertyType.charAt(0).toUpperCase() + s1.propertyType.slice(1) },
            { label:"Payment",  value: paymentLabel },
            { label:"Total",    value: `₹${totalPayable.toLocaleString("en-IN")}`, highlight:true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`flex items-start gap-3 ${highlight ? "pt-3 border-t border-white/20" : ""}`}>
              <span className="text-xs text-slate-400 w-24 flex-shrink-0 pt-0.5">{label}</span>
              <span className={`text-xs font-semibold flex-1 ${highlight ? "text-emerald-400 font-black text-base" : "text-white"}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Dispatch info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Zap size={13} className="text-amber-500" /> ADDies Smart Dispatch
        </p>
        <div className="space-y-2.5">
          {[
            { icon:TrendingUp, c:"text-emerald-500", t:"Distance + Rating + Reliability score calculate hoga" },
            { icon:Users,      c:"text-blue-500",    t:"Top 3 verified vendors ko notification jaayegi" },
            { icon:Timer,      c:"text-amber-500",   t:"5-minute accept window — fastest vendor assigned" },
            { icon:RotateCcw,  c:"text-violet-500",  t:"No accept → auto-escalation to next batch" },
          ].map(({ icon:Icon, c, t }) => (
            <div key={t} className="flex items-start gap-2.5 text-xs text-slate-600">
              <Icon size={13} className={`${c} flex-shrink-0 mt-0.5`} />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1.5">
        <p className="font-black text-amber-700 flex items-center gap-1.5">
          <Info size={13} /> Cancellation Policy
        </p>
        <p>• Cancel before vendor dispatch: <strong>Full refund</strong></p>
        <p>• Cancel after vendor assigned: <strong>₹50 cancellation fee</strong></p>
        <p>• Cancel after vendor arrives: <strong>Visiting charge deducted</strong></p>
        <p>• Free reschedule up to <strong>4 hours before</strong> scheduled time</p>
      </div>

      {/* Terms */}
      <div data-field="terms">
        <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
          ${errors.terms ? "border-red-300 bg-red-50"
          : agreedTerms  ? "border-emerald-300 bg-emerald-50"
                         : "border-slate-200 bg-white hover:border-slate-300"}`}>
          <input type="checkbox" checked={agreedTerms}
            onChange={e => onToggleTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-emerald-600" />
          <span className="text-sm text-slate-600">
            I agree to ADDies' <strong>cancellation & rescheduling terms</strong>, and confirm all details are correct.
          </span>
        </label>
        {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
      </div>
    </div>
  );
}
