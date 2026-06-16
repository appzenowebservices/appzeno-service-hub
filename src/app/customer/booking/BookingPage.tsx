/**
 * BookingPage.tsx
 * Location: src/pages/customer/booking/BookingPage.tsx
 *
 * Route: /:city/book  OR  /customer/book
 * Add in App.tsx:
 *   import BookingPage from "./pages/customer/booking/BookingPage";
 *   <Route path="/:city/book" element={<ProtectedRoute allowedRoles={["customer"]}><BookingPage /></ProtectedRoute>} />
 *   <Route path="/customer/book" element={<ProtectedRoute allowedRoles={["customer"]}><BookingPage /></ProtectedRoute>} />
 *
 * Folder structure:
 *   src/pages/customer/booking/
 *     ├── BookingPage.tsx   ← this file
 *     ├── types.ts
 *     ├── data.ts
 *     ├── Step1Service.tsx
 *     ├── Step2Issue.tsx
 *     ├── Step3Location.tsx
 *     ├── Step4Schedule.tsx
 *     ├── Step5Pricing.tsx
 *     ├── Step6Payment.tsx
 *     ├── Step7Confirm.tsx
 *     └── components/
 *         ├── StepBar.tsx
 *         ├── DispatchAnimation.tsx
 *         └── BookingSuccess.tsx
 */

import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2, Sparkles, ChevronRight } from "lucide-react";

import type { Step1Data, Step2Data, Step3Data, Step4Data, Step6Data, BookingFormData } from "./types";
import { CATEGORY_DATA, CITY_GEO, STEPS } from "./data";
import { getCityBySlug, getCategoryBySlug, cityToSlug, MOCK_CATEGORIES } from "../../../../data/mockData";
import { useAuthStore } from "../../../../store/authStore";

import StepBar          from "./components/StepBar";
import DispatchAnimation from "./components/DispatchAnimation";
import BookingSuccess    from "./components/BookingSuccess";
import Step1Service      from "./Step1Service";
import Step2Issue        from "./Step2Issue";
import Step3Location     from "./Step3Location";
import Step4Schedule     from "./Step4Schedule";
import Step5Pricing      from "./Step5Pricing";
import Step6Payment      from "./Step6Payment";
import Step7Confirm      from "./Step7Confirm";

// ── Initial state helpers ─────────────────────────────────────────────────────
const initS1 = (cityId="",cityName="",catId=""): Step1Data => ({
  cityId, cityName,
  categoryIds:   catId ? [catId] : [],
  subServices:   [],
  propertyType:  "",
  serviceTypes:  [],
});

const initS2 = (): Step2Data => ({
  problemTypes:[], description:"", images:[], video:null, urgency:"standard",
});

const initS3 = (): Step3Data => ({
  houseFlat:"", building:"", floor:"", landmark:"", area:"", pincode:"",
  lat:0, lng:0, liftAvailable:null, parkingAvail:null, gatedSociety:null, fetchingGps:false,
});

const initS4 = (): Step4Data => ({ vendorSlots:[] });

const initS6 = (): Step6Data => ({
  paymentMode:"partial", paymentMethod:"upi",
  partialAmount:0,
  couponCode:"", couponApplied:false, couponDiscount:0,
  walletUsed:0, upiId:"", agreedPrice:false,
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function BookingPage() {
  const navigate   = useNavigate();
  const { city: paramCity, category: paramCat } = useParams<{ city?:string; category?:string }>();
  const location   = useLocation();
  const { user }   = useAuthStore();

  const locState     = (location.state ?? {}) as { citySlug?:string; categorySlug?:string };
  const resolvedCity = paramCity || locState.citySlug || "";
  const resolvedCat  = paramCat  || locState.categorySlug || "";

  const urlCity      = getCityBySlug(resolvedCity);
  const urlCategory  = getCategoryBySlug(resolvedCat);

  const [step,         setStep]         = useState(0);
  const [s1,           setS1]           = useState<Step1Data>(initS1(urlCity?.id ?? "", urlCity?.name ?? "", urlCategory?.id ?? ""));
  const [s2,           setS2]           = useState<Step2Data>(initS2());
  const [s3,           setS3]           = useState<Step3Data>(initS3());
  const [s4,           setS4]           = useState<Step4Data>(initS4());
  const [s6,           setS6]           = useState<Step6Data>(initS6());
  const [agreedTerms,  setAgreedTerms]  = useState(false);
  const [errors,       setErrors]       = useState<Record<string,string>>({});
  const [submitting,   setSubmitting]   = useState(false);
  const [bookingId,    setBookingId]    = useState("");
  const [showDispatch, setShowDispatch] = useState(false);
  const [done,         setDone]         = useState(false);

  // ── Derived pricing ──────────────────────────────────────────────────────
  const allCatData = s1.categoryIds.map(id => CATEGORY_DATA[id]).filter(Boolean);
  const urgencySurge = s2.urgency === "emergency" ? 0.30 : s2.urgency === "priority" ? 0.15 : 0;
  const baseCharge   = allCatData.reduce((sum, d) => sum + d.basePrice, 0);
  const visitCharge  = allCatData.reduce((sum, d) => sum + d.visitCharge, 0);
  const emergencyChg = Math.round(baseCharge * urgencySurge);
  const platformFee  = Math.round(baseCharge * 0.05);
  const subtotal     = baseCharge + visitCharge + emergencyChg + platformFee;
  const gst          = Math.round(subtotal * 0.18);
  const preDiscount  = subtotal + gst;
  const couponDiscount = s6.couponApplied ? s6.couponDiscount : 0;
  const walletDiscount = s6.walletUsed;
  const totalPayable   = Math.max(0, preDiscount - couponDiscount - walletDiscount);
  const partialAmt     = Math.min(Math.max(s6.partialAmount || Math.round(totalPayable * 0.3), 1), totalPayable);

  const payNowAmount = s6.paymentMode === "partial" ? partialAmt : s6.paymentMode === "full" ? totalPayable : 0;

  const mapCenter: [number,number] = CITY_GEO[resolvedCity] ?? CITY_GEO[cityToSlug(s1.cityName)] ?? [28.6139, 77.2090];

  const categories = s1.categoryIds.map(id => MOCK_CATEGORIES.find(c => c.id === id)).filter(Boolean);
  const category   = categories[0];

  // ── Validation ───────────────────────────────────────────────────────────
  function validate(stepIdx: number): boolean {
    const e: Record<string,string> = {};

    if (stepIdx === 0) {
      if (!s1.cityId)               e.city         = "City select karo";
      if (s1.categoryIds.length === 0) e.categoryIds = "At least 1 category select karo";
      if (s1.subServices.length === 0) e.subServices = "Kya chahiye yeh select karo";
      if (!s1.propertyType)         e.propertyType = "Property type select karo";
      if (s1.serviceTypes.length === 0) e.serviceTypes = "Service type select karo";
    }
    if (stepIdx === 1) {
      if (s2.problemTypes.length === 0) e.problemTypes = "Problem type select karo";
      if (s2.description.length < 30)   e.description  = `Min 30 characters (${s2.description.length}/30)`;
    }
    if (stepIdx === 2) {
      if (!s3.houseFlat.trim())     e.houseFlat = "House/Flat no. required";
      if (!s3.area.trim())          e.area      = "Area required";
      if (!/^\d{6}$/.test(s3.pincode)) e.pincode = "Valid 6-digit PIN required";
    }
    if (stepIdx === 3) {
      // Each selected category needs a date + timeSlot
      s1.categoryIds.forEach(catId => {
        const cat  = MOCK_CATEGORIES.find(c => c.id === catId);
        const slot = s4.vendorSlots.find(v => v.categoryId === catId);
        if (!slot?.date)     e[`date_${catId}`]     = `Date select karo for ${cat?.name}`;
        if (!slot?.timeSlot) e[`timeSlot_${catId}`] = `Time slot select karo for ${cat?.name}`;
      });
    }
    if (stepIdx === 4) {
      if (!s6.agreedPrice) e.agreedPrice = "Price variation acknowledge karo";
    }
    if (stepIdx === 5) {
      if (s6.paymentMethod === "upi" && s6.paymentMode !== "cod" && !s6.upiId.includes("@"))
        e.upiId = "Valid UPI ID daalo";
    }
    if (stepIdx === 6) {
      if (!agreedTerms) e.terms = "Terms agree karo";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate(step)) {
      const firstKey = Object.keys(errors)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }
    if (step < 6) {
      setStep(s => s + 1);
      window.scrollTo({ top:0, behavior:"smooth" });
    } else {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    const id = `BK-${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit"}).replace("/","")}-${String(Math.floor(1000 + Math.random()*9000))}`;
    setBookingId(id);
    await new Promise(r => setTimeout(r, 400));
    setSubmitting(false);
    setShowDispatch(true);
  }

  const formData: BookingFormData = { s1, s2, s3, s4, s6 };

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    return <BookingSuccess bookingId={bookingId} data={formData} />;
  }

  // ── CTA label ────────────────────────────────────────────────────────────
  const ctaLabel = step === 6
    ? "CONFIRM & REQUEST SERVICE"
    : STEPS[step + 1]?.label ?? "Next";

  return (
    <>
      {showDispatch && (
        <DispatchAnimation
          bookingId={bookingId}
          onDone={() => { setShowDispatch(false); setDone(true); }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100">

        {/* ── Sticky Header ── */}
        <div className="bg-white border-b border-slate-200">
          <div className="space-y-6 mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => step > 0 ? (setStep(s => s - 1), window.scrollTo({top:0})) : navigate(-1)}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500
                           hover:border-emerald-300 hover:text-emerald-600 transition-all flex-shrink-0">
                <ChevronLeft size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">Book a Service</p>
                <p className="text-sm font-black text-slate-800 truncate">
                  {categories.length > 0
                    ? categories.map(c => `${c?.icon} ${c?.name}`).join(" + ")
                    : "ADDies ServiceHub"}
                </p>
              </div>
              {s2.urgency !== "standard" && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0
                  ${s2.urgency === "emergency" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                  {s2.urgency === "emergency" ? "🚨 Emergency" : "⚡ Priority"}
                </span>
              )}
            </div>
            <StepBar current={step} />
          </div>
        </div>

        {/* ── Step Content + Inline CTA ── */}
        <div className="mx-auto px-4 py-6 space-y-6">
          {step === 0 && (
            <Step1Service data={s1} errors={errors} onChange={setS1} />
          )}
          {step === 1 && (
            <Step2Issue step1={s1} data={s2} errors={errors} onChange={setS2} />
          )}
          {step === 2 && (
            <Step3Location data={s3} errors={errors} mapCenter={mapCenter} onChange={setS3} />
          )}
          {step === 3 && (
            <Step4Schedule step1={s1} data={s4} errors={errors} onChange={setS4} />
          )}
          {step === 4 && (
            <Step5Pricing
              step1={s1} step2={s2} step6={s6} errors={errors} onChange={setS6}
              subtotal={subtotal} gst={gst} totalPayable={totalPayable}
              preDiscount={preDiscount} couponDiscount={couponDiscount} walletDiscount={walletDiscount}
            />
          )}
          {step === 5 && (
            <Step6Payment
              data={s6} errors={errors} onChange={setS6}
              totalPayable={totalPayable} preDiscount={preDiscount}
              couponDiscount={couponDiscount} walletDiscount={walletDiscount}
              subtotal={subtotal} gst={gst}
              walletBalance={(user as Record<string,unknown>)?.walletBalance as number ?? 250}
            />
          )}
          {step === 6 && (
            <Step7Confirm
              formData={formData} errors={errors}
              agreedTerms={agreedTerms} onToggleTerms={setAgreedTerms}
              totalPayable={totalPayable} payNowAmount={payNowAmount}
              paymentMode={s6.paymentMode}
            />
          )}

          {/* ── Inline CTA Button (form ke baad, koi content hide nahi hoga) ── */}
          <div className="pt-2 pb-6">
            {/* Amount reminder (steps 4+) */}
            {step >= 4 && (
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-sm text-slate-500 truncate">
                  {categories.map(c => c?.name).join(" + ")}
                  {s2.urgency !== "standard" && (
                    <span className="ml-2 text-red-500 font-bold">+{s2.urgency}</span>
                  )}
                </span>
                <span className="font-black text-slate-800 text-base flex-shrink-0 ml-2">
                  ₹{totalPayable.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-black text-base transition-all duration-200 flex items-center justify-center gap-3
                bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200
                hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-emerald-200
                active:scale-[0.98] disabled:opacity-60"
            >
              {submitting
                ? <><Loader2 size={20} className="animate-spin" /> Processing...</>
                : step === 6
                ? <><Sparkles size={20} /> {ctaLabel}</>
                : <>{ctaLabel} <ChevronRight size={20} /></>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
