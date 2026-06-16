import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Briefcase, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Copy, Check, Info,
} from "lucide-react";
import FormField             from "../components/auth/FormField";
import PasswordField         from "../components/auth/PasswordField";
import LanguageCheckboxGroup from "../components/auth/LanguageCheckboxGroup";
import MapAddressPicker, { type AddressData } from "../components/auth/MapAddressPicker";
import IFSCField, { type BankDetails, EMPTY_BANK } from "../components/auth/IFSCField";
import AccountNumberField    from "../components/auth/AccountNumberField";
import FileUploadField       from "../components/auth/FileUploadField";
import PincodeField, { type PincodeInfo } from "../components/auth/PincodeField";
import StepIndicator         from "../components/auth/StepIndicator";
import ReferencePersonForm, { type ReferencePerson, EMPTY_REFERENCE } from "../components/auth/ReferencePersonForm";
import { MOCK_CATEGORIES }   from "../../../data/mockData";
import { generateRegistrationId } from "../../../utils/generateRegistrationId";
import { useScrollToError }  from "../../../hooks/useScrollToError";
import { useDocumentZip }    from "../../../hooks/useDocumentZip";
import PublicLayout from "../components/layout/PublicLayout";

const STEPS = [
  { label: "Basic Info" },
  { label: "Business" },
  { label: "KYC" },
  { label: "Pricing" },
];

const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_SLOTS = [
  "6:00 AM – 9:00 AM",
  "9:00 AM – 12:00 PM",
  "12:00 PM – 3:00 PM",
  "3:00 PM – 6:00 PM",
  "6:00 PM – 9:00 PM",
];

const EMPTY_ADDRESS: AddressData = {
  houseFlat: "", street: "", landmark: "", city: "", state: "",
  pincode: "", fullAddress: "", lat: 0, lng: 0,
};

interface CategoryPricing {
  categoryId:       string;
  basePrice:        string;
  emergencyCharges: string;
  visitingCharges:  string;
}

interface Step1 {
  fullName: string; mobile: string; email: string;
  password: string; confirmPassword: string;
  categories: string[]; languages: string[];
}
interface Step2 {
  businessName: string; experience: string;
  servicePincodes: PincodeInfo[];
  workingAvailability: "full" | "part";
  workingDays: string[];
  timeSlots: string[];
}
interface Step3 {
  aadhaar: string; pan: string;
  accountNumber: string; confirmAccount: string;
  aadhaarFile: File | null; panFile: File | null; profilePhoto: File | null;
}
interface Step4 {
  categoryPricing: CategoryPricing[];
  termsAccepted: boolean;
}

const E1: Step1 = { fullName: "", mobile: "", email: "", password: "", confirmPassword: "", categories: [], languages: [] };
const E2: Step2 = { businessName: "", experience: "", servicePincodes: [], workingAvailability: "full", workingDays: [], timeSlots: [] };
const E3: Step3 = { aadhaar: "", pan: "", accountNumber: "", confirmAccount: "", aadhaarFile: null, panFile: null, profilePhoto: null };
const E4: Step4 = { categoryPricing: [], termsAccepted: false };

type PageStep = 0 | 1 | 2 | 3 | "preview" | "success";

export default function VendorRegisterPage() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState<PageStep>(0);
  const [s1,      setS1]      = useState<Step1>(E1);
  const [s2,      setS2]      = useState<Step2>(E2);
  const [s3,      setS3]      = useState<Step3>(E3);
  const [s4,      setS4]      = useState<Step4>(E4);
  const [address, setAddress] = useState<AddressData>(EMPTY_ADDRESS);
  const [bank,    setBank]    = useState<BankDetails>(EMPTY_BANK);
  const [refs,    setRefs]    = useState<[ReferencePerson, ReferencePerson]>([
    { ...EMPTY_REFERENCE }, { ...EMPTY_REFERENCE },
  ]);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [regId,   setRegId]   = useState("");
  const [copied,  setCopied]  = useState(false);

  const { scrollToFirstError } = useScrollToError();
  const { zipping, createAndUploadZip } = useDocumentZip();

  function toggleCategory(id: string) {
    const selected = s1.categories.includes(id)
      ? s1.categories.filter((c) => c !== id)
      : [...s1.categories, id];
    setS1((p) => ({ ...p, categories: selected }));
    setS4((p) => ({
      ...p,
      categoryPricing: selected.map((cid) => {
        const ex = p.categoryPricing.find((cp) => cp.categoryId === cid);
        return ex ?? { categoryId: cid, basePrice: "", emergencyCharges: "", visitingCharges: "" };
      }),
    }));
  }

  function toggleDay(d: string)  { setS2((p) => ({ ...p, workingDays: p.workingDays.includes(d) ? p.workingDays.filter((x) => x !== d) : [...p.workingDays, d] })); }
  function toggleSlot(sl: string) { setS2((p) => ({ ...p, timeSlots: p.timeSlots.includes(sl) ? p.timeSlots.filter((x) => x !== sl) : [...p.timeSlots, sl] })); }

  function updatePricing(cid: string, field: keyof CategoryPricing, val: string) {
    setS4((p) => ({
      ...p,
      categoryPricing: p.categoryPricing.map((cp) => cp.categoryId === cid ? { ...cp, [field]: val } : cp),
    }));
  }

  // ── Validate per step ──────────────────────────────────────────────────────
  function validateStep(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!s1.fullName.trim())              e.fullName        = "Required";
      if (!/^\d{10}$/.test(s1.mobile))      e.mobile          = "Valid 10-digit mobile required";
      if (!/\S+@\S+\.\S+/.test(s1.email))  e.email           = "Valid email required";
      if (s1.password.length < 8)           e.password        = "Min 8 characters";
      if (s1.password !== s1.confirmPassword) e.confirmPassword = "Passwords do not match";
      if (!address.houseFlat.trim())        e.address         = "Pin your location and enter house/flat no.";
      if (s1.categories.length === 0)       e.categories      = "Select at least one service";
      if (s1.languages.length === 0)        e.languages       = "Select at least one language";
    }
    if (s === 1) {
      if (!s2.businessName.trim()) e.businessName = "Required";
      if (!s2.experience)          e.experience   = "Required";
      if (s2.workingDays.length === 0) e.workingDays = "Select at least one day";
      if (s2.workingAvailability === "part" && s2.timeSlots.length === 0) e.timeSlots = "Select at least one time slot";
    }
    if (s === 2) {
      if (!/^\d{12}$/.test(s3.aadhaar))         e.aadhaar       = "Valid 12-digit Aadhaar required";
      if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(s3.pan)) e.pan           = "Valid PAN required";
      if (!bank.bankName)                        e.ifsc          = "Verify IFSC code first";
      if (!s3.accountNumber.trim())              e.accountNumber = "Required";
      if (s3.accountNumber !== s3.confirmAccount) e.confirmAccount = "Account numbers do not match";
      if (!s3.aadhaarFile)  e.aadhaarFile  = "Upload Aadhaar";
      if (!s3.panFile)      e.panFile      = "Upload PAN";
      if (!s3.profilePhoto) e.profilePhoto = "Upload profile photo";
      refs.forEach((r, i) => {
        if (!r.name.trim())             e[`ref${i}_name`]     = "Required";
        if (!/^\d{10}$/.test(r.mobile)) e[`ref${i}_mobile`]   = "Valid mobile required";
        if (!r.relation)                e[`ref${i}_relation`] = "Select relation";
        if (!r.address.trim())          e[`ref${i}_address`]  = "Required";
      });
    }
    if (s === 3) {
      s4.categoryPricing.forEach((cp) => {
        if (!cp.basePrice)       e[`price_base_${cp.categoryId}`]  = "Required";
        if (!cp.visitingCharges) e[`price_visit_${cp.categoryId}`] = "Required";
      });
      if (!s4.termsAccepted) e.termsAccepted = "Accept Terms & Conditions";
    }
    return e;
  }

  function handleNext() {
    if (typeof step !== "number") return;
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      scrollToFirstError(e);
      return;
    }
    if (step === 3) setStep("preview");
    else setStep((step + 1) as PageStep);
  }

  async function handleSubmit() {
    setLoading(true);
    const id = generateRegistrationId("VEND");

    // Bundle docs
    const entries = [];
    if (s3.aadhaarFile)  entries.push({ filename: `aadhaar.${s3.aadhaarFile.name.split(".").pop()}`,      file: s3.aadhaarFile });
    if (s3.panFile)      entries.push({ filename: `pan.${s3.panFile.name.split(".").pop()}`,              file: s3.panFile });
    if (s3.profilePhoto) entries.push({ filename: `profile.${s3.profilePhoto.name.split(".").pop()}`,    file: s3.profilePhoto });

    await createAndUploadZip(entries, id, "vendor");

    setRegId(id);
    setLoading(false);
    setStep("success");
  }

  function copyId() { navigator.clipboard.writeText(regId); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  const selectedCats = MOCK_CATEGORIES.filter((c) => s1.categories.includes(c.id));

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">

        <button onClick={() => {
          if (step === "preview") setStep(3);
          else if (typeof step === "number" && step > 0) setStep((step - 1) as PageStep);
          else navigate("/register");
        }} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <div className="p-6 sm:p-8">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Briefcase size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-neutral-900">Vendor Registration</h1>
                <p className="text-xs text-neutral-400">
                  {step === "preview" ? "Review your details" :
                   step === "success" ? "Registration submitted!" :
                   `Step ${(step as number) + 1} of 4 — ${STEPS[step as number].label}`}
                </p>
              </div>
            </div>

            {typeof step === "number" && <StepIndicator steps={STEPS} currentStep={step} />}

            {/* ── STEP 1 ── */}
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-field-id="fullName">
                    <FormField label="Full Name" required placeholder="Your full name"
                      value={s1.fullName}
                      onChange={(e) => setS1((p) => ({ ...p, fullName: e.target.value }))}
                      error={errors.fullName} />
                  </div>
                  <div data-field-id="mobile">
                    <FormField label="Mobile Number" required type="tel" placeholder="9876543210"
                      value={s1.mobile}
                      onChange={(e) => setS1((p) => ({ ...p, mobile: e.target.value }))}
                      error={errors.mobile} />
                  </div>
                </div>
                <div data-field-id="email">
                  <FormField label="Email Address" required type="email" placeholder="you@email.com"
                    value={s1.email}
                    onChange={(e) => setS1((p) => ({ ...p, email: e.target.value }))}
                    error={errors.email} />
                </div>
                <div data-field-id="password">
                  <PasswordField required
                    value={s1.password}
                    onChange={(v) => setS1((p) => ({ ...p, password: v }))}
                    error={errors.password}
                    showConfirm
                    confirmValue={s1.confirmPassword}
                    onConfirmChange={(v) => setS1((p) => ({ ...p, confirmPassword: v }))}
                    confirmError={errors.confirmPassword}
                  />
                </div>
                <div data-field-id="address">
                  <MapAddressPicker value={address} onChange={setAddress} label="Your City / Base Location" />
                  {errors.address && <p className="text-xs text-danger mt-1">{errors.address}</p>}
                </div>
                <div data-field-id="categories">
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-2">
                    Service Categories <span className="text-danger">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_CATEGORIES.map((cat) => {
                      const sel = s1.categories.includes(cat.id);
                      return (
                        <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all
                            ${sel ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300"}`}>
                          {sel && <Check size={11} />} {cat.icon} {cat.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.categories && <p className="text-xs text-danger mt-1">{errors.categories}</p>}
                </div>
                <div data-field-id="languages">
                  <LanguageCheckboxGroup selected={s1.languages}
                    onChange={(l) => setS1((p) => ({ ...p, languages: l }))}
                    error={errors.languages} />
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-field-id="businessName">
                    <FormField label="Business Name" required placeholder="e.g. Kumar Plumbing"
                      value={s2.businessName}
                      onChange={(e) => setS2((p) => ({ ...p, businessName: e.target.value }))}
                      error={errors.businessName} />
                  </div>
                  <div data-field-id="experience">
                    <FormField label="Years of Experience" required type="number" placeholder="e.g. 5"
                      value={s2.experience}
                      onChange={(e) => setS2((p) => ({ ...p, experience: e.target.value }))}
                      error={errors.experience} />
                  </div>
                </div>

                <PincodeField value={s2.servicePincodes}
                  onChange={(pins) => setS2((p) => ({ ...p, servicePincodes: pins }))} />

                <div data-field-id="workingDays">
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-2">
                    Available Working Days <span className="text-danger">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WORKING_DAYS.map((d) => {
                      const sel = s2.workingDays.includes(d);
                      return (
                        <button key={d} type="button" onClick={() => toggleDay(d)}
                          className={`w-12 h-10 rounded-xl text-xs font-bold border-2 transition-all
                            ${sel ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300"}`}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                  {errors.workingDays && <p className="text-xs text-danger mt-1">{errors.workingDays}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-2">
                    Availability Type <span className="text-danger">*</span>
                  </label>
                  <div className="flex gap-3">
                    {(["full", "part"] as const).map((type) => (
                      <button key={type} type="button"
                        onClick={() => setS2((p) => ({ ...p, workingAvailability: type, timeSlots: [] }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all
                          ${s2.workingAvailability === type
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300"}`}>
                        {type === "full" ? "🕐 Full Time" : "⏱ Part Time"}
                      </button>
                    ))}
                  </div>
                </div>

                {s2.workingAvailability === "part" && (
                  <div data-field-id="timeSlots">
                    <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-2">
                      Available Time Slots <span className="text-danger">*</span>
                    </label>
                    <div className="flex flex-col gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const sel = s2.timeSlots.includes(slot);
                        return (
                          <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left
                              ${sel ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "bg-white border-neutral-200 text-neutral-600 hover:border-emerald-200"}`}>
                            {sel ? <Check size={14} className="text-emerald-600 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 flex-shrink-0" />}
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {errors.timeSlots && <p className="text-xs text-danger mt-1">{errors.timeSlots}</p>}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: KYC ── */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
                  🔒 KYC details are encrypted and used only for identity verification.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-field-id="aadhaar">
                    <FormField label="Aadhaar Number" required placeholder="12-digit Aadhaar"
                      value={s3.aadhaar}
                      onChange={(e) => setS3((p) => ({ ...p, aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12) }))}
                      error={errors.aadhaar} maxLength={12} />
                  </div>
                  <div data-field-id="pan">
                    <FormField label="PAN Number" required placeholder="ABCDE1234F"
                      value={s3.pan}
                      onChange={(e) => setS3((p) => ({ ...p, pan: e.target.value.toUpperCase().slice(0, 10) }))}
                      error={errors.pan} />
                  </div>
                </div>

                <SH>Bank Details</SH>
                <div data-field-id="ifsc"><IFSCField value={bank} onChange={setBank} error={errors.ifsc} /></div>
                <div data-field-id="accountNumber">
                  <AccountNumberField
                    value={s3.accountNumber} confirmValue={s3.confirmAccount}
                    onChange={(v) => setS3((p) => ({ ...p, accountNumber: v }))}
                    onConfirmChange={(v) => setS3((p) => ({ ...p, confirmAccount: v }))}
                    error={errors.accountNumber} confirmError={errors.confirmAccount}
                  />
                </div>

                <SH>Document Uploads</SH>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div data-field-id="aadhaarFile">
                    <FileUploadField label="Aadhaar Card" required
                      file={s3.aadhaarFile} onChange={(f) => setS3((p) => ({ ...p, aadhaarFile: f }))}
                      error={errors.aadhaarFile} />
                  </div>
                  <div data-field-id="panFile">
                    <FileUploadField label="PAN Card" required
                      file={s3.panFile} onChange={(f) => setS3((p) => ({ ...p, panFile: f }))}
                      error={errors.panFile} />
                  </div>
                  <div data-field-id="profilePhoto">
                    <FileUploadField label="Profile Photo" required
                      file={s3.profilePhoto} onChange={(f) => setS3((p) => ({ ...p, profilePhoto: f }))}
                      accept=".jpg,.jpeg,.png" error={errors.profilePhoto} />
                  </div>
                </div>

                <SH>Reference Persons <span className="text-neutral-400 normal-case text-xs font-normal">(fraud prevention)</span></SH>
                <div data-field-id="ref0_name">
                  <ReferencePersonForm refs={refs}
                    onChange={(i, r) => { const n = [...refs] as typeof refs; n[i] = r; setRefs(n); }}
                    errors={errors} />
                </div>
              </div>
            )}

            {/* ── STEP 4: PRICING ── */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
                  💡 Set pricing for each service. GST rates are configured by ADDies Admin and auto-applied at checkout.
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-500">
                  <Info size={13} className="flex-shrink-0 mt-0.5" />
                  Platform charges and GST per category are set in Admin panel. These will appear to customers on top of your listed prices.
                </div>

                {selectedCats.map((cat) => {
                  const pricing = s4.categoryPricing.find((cp) => cp.categoryId === cat.id);
                  if (!pricing) return null;
                  return (
                    <div key={cat.id} className="rounded-2xl border border-neutral-100 overflow-hidden">
                      <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100 flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <p className="text-xs font-black text-neutral-700">{cat.name}</p>
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { key: "basePrice", label: "Base Price (₹)", required: true, hint: "Min charge per visit" },
                          { key: "emergencyCharges", label: "Emergency (₹)", required: false, hint: "Extra for urgent calls" },
                          { key: "visitingCharges", label: "Visiting (₹)", required: true, hint: "Inspection fee" },
                        ].map(({ key, label, required, hint }) => (
                          <div key={key} data-field-id={`price_base_${cat.id}`} className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                              {label} {required && <span className="text-danger">*</span>}
                            </label>
                            <input type="number" placeholder="₹"
                              value={pricing[key as keyof CategoryPricing]}
                              onChange={(e) => updatePricing(cat.id, key as keyof CategoryPricing, e.target.value)}
                              className={`w-full px-3 py-2 text-sm rounded-xl border bg-white
                                focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all
                                ${errors[`price_base_${cat.id}`] && required ? "border-danger" : "border-neutral-200"}`}
                            />
                            <p className="text-xs text-neutral-400">{hint}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div data-field-id="termsAccepted">
                  <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                    ${errors.termsAccepted ? "border-danger bg-red-50" : s4.termsAccepted ? "border-green-300 bg-green-50" : "border-neutral-200 bg-neutral-50"}`}>
                    <input type="checkbox" checked={s4.termsAccepted}
                      onChange={(e) => setS4((p) => ({ ...p, termsAccepted: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 accent-primary-600" />
                    <span className="text-xs text-neutral-600">
                      I accept the{" "}
                      <Link to="/terms" target="_blank" className="text-primary-600 font-semibold hover:underline">Terms & Conditions</Link>
                      {" "}and{" "}
                      <Link to="/privacy" target="_blank" className="text-primary-600 font-semibold hover:underline">Privacy Policy</Link>
                      {" "}of ADDies ServiceHub.
                    </span>
                  </label>
                  {errors.termsAccepted && <p className="text-xs text-danger mt-1">{errors.termsAccepted}</p>}
                </div>
              </div>
            )}

            {/* ── PREVIEW ── */}
            {step === "preview" && (
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                  📋 Review all details carefully before final submission.
                </div>
                <PS title="Basic Info">
                  <PR label="Name"       val={s1.fullName} />
                  <PR label="Mobile"     val={s1.mobile} />
                  <PR label="Email"      val={s1.email} />
                  <PR label="City"       val={address.city} />
                  <PR label="Address"    val={address.houseFlat} />
                  <PR label="Categories" val={selectedCats.map((c) => c.name).join(", ")} />
                  <PR label="Languages"  val={s1.languages.join(", ")} />
                </PS>
                <PS title="Business">
                  <PR label="Business"   val={s2.businessName} />
                  <PR label="Experience" val={`${s2.experience} years`} />
                  <PR label="PIN Codes"  val={s2.servicePincodes.map((p) => `${p.pincode} (${p.district})`).join(", ") || "—"} />
                  <PR label="Work Days"  val={s2.workingDays.join(", ")} />
                  <PR label="Timing"     val={s2.workingAvailability === "full" ? "Full Time" : s2.timeSlots.join(" | ")} />
                </PS>
                <PS title="KYC">
                  <PR label="Aadhaar"    val={`XXXX XXXX ${s3.aadhaar.slice(-4)}`} />
                  <PR label="PAN"        val={s3.pan} />
                  <PR label="Bank"       val={`${bank.bankName} — ${bank.bankBranch}`} />
                  <PR label="IFSC"       val={bank.ifsc} />
                  <PR label="Account"    val={`XXXXXXXX${s3.accountNumber.slice(-4)}`} />
                  <PR label="Documents"  val="Aadhaar ✓  PAN ✓  Photo ✓" />
                </PS>
                <PS title="Pricing">
                  {s4.categoryPricing.map((cp) => {
                    const cat = MOCK_CATEGORIES.find((c) => c.id === cp.categoryId);
                    return (
                      <PR key={cp.categoryId}
                        label={cat?.name ?? cp.categoryId}
                        val={`Base ₹${cp.basePrice}  Visit ₹${cp.visitingCharges}${cp.emergencyCharges ? `  Emergency ₹${cp.emergencyCharges}` : ""}`}
                      />
                    );
                  })}
                </PS>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  ⏳ After submission your profile will be in <strong>Pending Approval</strong> state. Verification 24–48 hrs.
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-neutral-200 text-sm font-semibold text-neutral-600">
                    Edit
                  </button>
                  <button onClick={handleSubmit} disabled={loading || zipping}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                               font-bold text-sm hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60
                               flex items-center justify-center gap-2 transition-all">
                    {loading || zipping
                      ? <><Loader2 size={15} className="animate-spin" /> {zipping ? "Bundling docs…" : "Submitting…"}</>
                      : "Submit Registration"}
                  </button>
                </div>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-5 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral-900 mb-1">Application Submitted! 🎉</h2>
                  <p className="text-sm text-neutral-500">Verification takes 24–48 hours.</p>
                </div>
                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-xs text-neutral-500 mb-1">Your Registration ID</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-black text-emerald-700 tracking-wider">{regId}</span>
                    <button onClick={copyId} className="text-emerald-400 hover:text-emerald-700 transition-colors">
                      {copied ? <CheckCircle2 size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Documents stored as <span className="font-mono">{regId}.zip</span></p>
                  <p className="text-xs text-neutral-400">Use this ID to check application status</p>
                </div>
                <button onClick={() => navigate("/")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm">
                  Go to Home
                </button>
              </div>
            )}

            {/* Navigation */}
            {typeof step === "number" && (
              <div className="flex justify-between mt-6 pt-5 border-t border-neutral-100">
                <button onClick={() => step > 0 ? setStep((step - 1) as PageStep) : navigate("/register")}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border-2 border-neutral-200
                             text-sm font-semibold text-neutral-600 hover:border-neutral-300 transition-all">
                  <ArrowLeft size={15} /> {step === 0 ? "Back" : "Previous"}
                </button>
                <button onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl
                             bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                             text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all">
                  {step === 3 ? "Review & Preview" : "Next"} <ArrowRight size={15} />
                </button>
              </div>
            )}

            {step !== "success" && (
              <p className="text-center text-xs text-neutral-400 mt-4">
                Already registered?{" "}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}

function SH({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 -mb-1">
      <div className="h-px flex-1 bg-neutral-100" />
      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">{children}</p>
      <div className="h-px flex-1 bg-neutral-100" />
    </div>
  );
}
function PS({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-100">
        <p className="text-xs font-black text-neutral-500 uppercase tracking-wide">{title}</p>
      </div>
      <div className="divide-y divide-neutral-50">{children}</div>
    </div>
  );
}
function PR({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex gap-3 px-4 py-2">
      <span className="text-xs text-neutral-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-neutral-800 flex-1">{val || "—"}</span>
    </div>
  );
}
