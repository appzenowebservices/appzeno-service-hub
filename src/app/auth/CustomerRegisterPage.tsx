import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserCircle, ArrowLeft, CheckCircle2, Loader2, Copy, ArrowRight } from "lucide-react";
import FormField          from "../components/auth/FormField";
import PasswordField      from "../components/auth/PasswordField";
import LanguageCheckboxGroup from "../components/auth/LanguageCheckboxGroup";
import MapAddressPicker, { type AddressData } from "../components/auth/MapAddressPicker";
import { generateRegistrationId } from "../../../utils/generateRegistrationId";
import { useAuthStore } from "../../../store/authStore";
import PublicLayout from "../components/layout/PublicLayout";

const EMPTY_ADDRESS: AddressData = {
  houseFlat: "", street: "", landmark: "", city: "", state: "",
  pincode: "", fullAddress: "", lat: 0, lng: 0,
};

interface FormData {
  fullName:        string;
  mobile:          string;
  email:           string;
  password:        string;
  confirmPassword: string;
  languages:       string[];
  referral:        string;
  termsAccepted:   boolean;
}

const EMPTY: FormData = {
  fullName: "", mobile: "", email: "", password: "", confirmPassword: "",
  languages: [], referral: "", termsAccepted: false,
};

type PageStep = "form" | "preview" | "otp" | "success";

export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [step,      setStep]      = useState<PageStep>("form");
  const [form,      setForm]      = useState<FormData>(EMPTY);
  const [address,   setAddress]   = useState<AddressData>(EMPTY_ADDRESS);
  const [errors,    setErrors]    = useState<Partial<Record<keyof FormData | "address" | "languages", string>>>({});
  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [otpError,  setOtpError]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [regId,     setRegId]     = useState("");
  const [copied,    setCopied]    = useState(false);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.fullName.trim())              e.fullName        = "Full name is required";
    if (!/^\d{10}$/.test(form.mobile))      e.mobile          = "Valid 10-digit mobile required";
    if (!/\S+@\S+\.\S+/.test(form.email))  e.email           = "Valid email required";
    if (form.password.length < 8)           e.password        = "Minimum 8 characters required";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!address.houseFlat.trim())          e.address         = "Pin your city location and fill house/flat no.";
    if (form.languages.length === 0)        e.languages       = "Select at least one language";
    if (!form.termsAccepted)                e.termsAccepted   = "You must accept the Terms & Conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleReview() {
    if (validate()) setStep("preview");
  }

  function handleSendOtp() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1000);
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) document.getElementById(`cotp-${i + 1}`)?.focus();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      document.getElementById(`cotp-${i - 1}`)?.focus();
  }

  function handleVerify() {
    const entered = otp.join("");
    if (entered.length < 6) { setOtpError("Enter the 6-digit OTP"); return; }
    if (entered !== "123456") { setOtpError("Invalid OTP. (Demo: use 123456)"); return; }
    setLoading(true);
    setTimeout(() => {
      const newRegId = generateRegistrationId("CUST");
      setRegId(newRegId);

      // ─── Auto-login with full registration data ───────────────────────────
      const newUser = {
        id:             `C${Date.now()}`,
        fullName:       form.fullName,
        email:          form.email,
        mobile:         form.mobile,
        role:           "customer" as const,
        registrationId: newRegId,
        // Address fields from MapAddressPicker — prefilled in Profile
        city:           address.city,
        state:          address.state,
        address:        [address.houseFlat, address.street, address.landmark, address.city, address.pincode]
                          .filter(Boolean).join(", "),
        pincode:        address.pincode,
        houseFlat:      address.houseFlat,
        street:         address.street,
        landmark:       address.landmark,
        lat:            address.lat,
        lng:            address.lng,
        languages:      form.languages,
        referral:       form.referral,
        createdAt:      new Date().toISOString().split("T")[0],
        isActive:       true,
        walletBalance:  0,
        totalBookings:  0,
        avatar:         form.fullName.charAt(0).toUpperCase(),
      };
      login(newUser as any, `token-${newUser.id}`);
      // ─────────────────────────────────────────────────────────────────────

      setLoading(false);
      setStep("success");
    }, 1000);
  }

  function copyId() { navigator.clipboard.writeText(regId); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">

        <button onClick={() => step === "preview" ? setStep("form") : step === "otp" ? setStep("preview") : navigate("/register")}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <UserCircle size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-neutral-900">Customer Registration</h1>
                <p className="text-xs text-neutral-400">
                  {step === "form"    && "Fill your details below"}
                  {step === "preview" && "Review your details"}
                  {step === "otp"     && "Verify your mobile number"}
                  {step === "success" && "Welcome to ADDies!"}
                </p>
              </div>
            </div>

            {/* ── FORM ── */}
            {step === "form" && (
              <div className="flex flex-col gap-4">
                <FormField label="Full Name" required placeholder="Your full name"
                  value={form.fullName} onChange={set("fullName")} error={errors.fullName} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Mobile Number" required type="tel" placeholder="9876543210"
                    value={form.mobile} onChange={set("mobile")} error={errors.mobile}
                    hint="OTP will be sent here" />
                  <FormField label="Email Address" required type="email" placeholder="you@email.com"
                    value={form.email} onChange={set("email")} error={errors.email} />
                </div>

                <PasswordField
                  required
                  value={form.password}
                  onChange={(v) => setForm((p) => ({ ...p, password: v }))}
                  error={errors.password}
                  showConfirm
                  confirmValue={form.confirmPassword}
                  onConfirmChange={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
                  confirmError={errors.confirmPassword}
                />

                {/* City via Map */}
                <div>
                  <MapAddressPicker
                    value={address}
                    onChange={setAddress}
                    label="Your City / Address"
                  />
                  {errors.address && <p className="text-xs text-danger mt-1">{errors.address}</p>}
                </div>

                <LanguageCheckboxGroup
                  selected={form.languages}
                  onChange={(l) => setForm((p) => ({ ...p, languages: l }))}
                  error={errors.languages}
                />

                <FormField label="Referral Code (optional)" placeholder="Enter referral code if you have one"
                  value={form.referral} onChange={set("referral")} />

                {/* Terms */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${errors.termsAccepted ? "border-danger bg-red-50" : form.termsAccepted ? "border-green-300 bg-green-50" : "border-neutral-200 bg-neutral-50 hover:border-primary-200"}`}>
                  <input type="checkbox" checked={form.termsAccepted}
                    onChange={(e) => setForm((p) => ({ ...p, termsAccepted: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 accent-primary-600" />
                  <span className="text-xs text-neutral-600">
                    I accept the{" "}
                    <Link to="/terms" target="_blank" className="text-primary-600 font-semibold hover:underline">Terms & Conditions</Link>
                    {" "}and{" "}
                    <Link to="/privacy" target="_blank" className="text-primary-600 font-semibold hover:underline">Privacy Policy</Link>
                    {" "}of ADDies ServiceHub.
                  </span>
                </label>
                {errors.termsAccepted && <p className="text-xs text-danger -mt-2">{errors.termsAccepted}</p>}

                <button onClick={handleReview}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white
                             font-bold text-sm hover:from-blue-600 hover:to-blue-700 transition-all
                             flex items-center justify-center gap-2 mt-1">
                  Review & Continue <ArrowRight size={15} />
                </button>

                <p className="text-center text-xs text-neutral-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login</Link>
                </p>
              </div>
            )}

            {/* ── PREVIEW ── */}
            {step === "preview" && (
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium">
                  📋 Please review your details carefully before submitting.
                </div>

                <PreviewSection title="Personal Details">
                  <PreviewRow label="Full Name"  val={form.fullName} />
                  <PreviewRow label="Mobile"     val={form.mobile} />
                  <PreviewRow label="Email"      val={form.email} />
                  <PreviewRow label="Password"   val="••••••••" />
                </PreviewSection>

                <PreviewSection title="Location">
                  <PreviewRow label="House/Flat" val={address.houseFlat} />
                  <PreviewRow label="Street"     val={address.street} />
                  <PreviewRow label="Landmark"   val={address.landmark || "—"} />
                  <PreviewRow label="City"       val={address.city} />
                  <PreviewRow label="State"      val={address.state} />
                  <PreviewRow label="Pincode"    val={address.pincode} />
                </PreviewSection>

                <PreviewSection title="Preferences">
                  <PreviewRow label="Languages" val={form.languages.join(", ")} />
                  <PreviewRow label="Referral"  val={form.referral || "—"} />
                  <PreviewRow label="Terms"     val="Accepted ✓" />
                </PreviewSection>

                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep("form")}
                    className="flex-1 py-2.5 rounded-xl border-2 border-neutral-200 text-sm font-semibold text-neutral-600 hover:border-neutral-300 transition-all">
                    Edit Details
                  </button>
                  <button onClick={handleSendOtp} disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white
                               font-bold text-sm hover:from-blue-600 hover:to-blue-700 transition-all
                               disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : "Send OTP"}
                  </button>
                </div>
              </div>
            )}

            {/* ── OTP ── */}
            {step === "otp" && (
              <div className="flex flex-col items-center gap-5">
                <div className="text-center">
                  <p className="text-sm text-neutral-600">OTP sent to <strong>+91 {form.mobile}</strong></p>
                  <p className="text-xs text-neutral-400 mt-1">Demo: use <strong>123456</strong></p>
                </div>
                <div className="flex gap-2">
                  {otp.map((digit, i) => (
                    <input key={i} id={`cotp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl
                                 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all bg-neutral-50" />
                  ))}
                </div>
                {otpError && <p className="text-xs text-danger font-medium">{otpError}</p>}
                <button onClick={handleVerify} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white
                             font-bold text-sm hover:from-blue-600 hover:to-blue-700 transition-all
                             disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Verifying…</> : "Verify & Register"}
                </button>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-5 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral-900 mb-1">Welcome, {form.fullName.split(" ")[0]}! 🎉</h2>
                  <p className="text-sm text-neutral-500">Your customer account is ready. Ab apna dashboard dekho!</p>
                </div>
                <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-xs text-neutral-500 mb-1">Your Registration ID</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-black text-primary-700 tracking-wider">{regId}</span>
                    <button onClick={copyId} className="text-primary-400 hover:text-primary-700">
                      {copied ? <CheckCircle2 size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Save this ID — aapka account number hai</p>
                </div>
                {/* Prefill notice */}
                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-left">
                  <p className="text-xs text-emerald-700 font-semibold mb-1">✅ Profile Already Filled!</p>
                  <p className="text-xs text-emerald-600 leading-relaxed">
                    Registration ki saari details aapke Profile mein automatically save ho gayi hain —
                    naam, mobile, email, address, city, languages sab. Dashboard mein jaake Profile tab
                    mein dekh sakte ho.
                  </p>
                </div>
                <button onClick={() => navigate("/customer")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2">
                  <ArrowRight size={16} /> Go to My Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-100">
        <p className="text-xs font-black text-neutral-500 uppercase tracking-wide">{title}</p>
      </div>
      <div className="divide-y divide-neutral-50">{children}</div>
    </div>
  );
}
function PreviewRow({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex gap-3 px-4 py-2">
      <span className="text-xs text-neutral-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-neutral-800 flex-1">{val || "—"}</span>
    </div>
  );
}
