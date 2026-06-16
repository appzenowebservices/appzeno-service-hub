import { useState, useMemo, useRef } from "react";
import { useNavigate, Link }          from "react-router-dom";
import {
  Building2, ArrowLeft, CheckCircle2, Loader2, Copy,
  ArrowRight, Download, AlertCircle, FileWarning,
} from "lucide-react";
import FormField             from "../components/auth/FormField";
import PasswordField         from "../components/auth/PasswordField";
import LanguageCheckboxGroup from "../components/auth/LanguageCheckboxGroup";
import MapAddressPicker, { type AddressData } from "../components/auth/MapAddressPicker";
import IFSCField, { type BankDetails, EMPTY_BANK } from "../components/auth/IFSCField";
import AccountNumberField    from "../components/auth/AccountNumberField";
import ReferencePersonForm, { type ReferencePerson, EMPTY_REFERENCE } from "../components/auth/ReferencePersonForm";
import { generateRegistrationId } from "../../../utils/generateRegistrationId";
import { useScrollToError }   from "../../../hooks/useScrollToError";
import { useDocumentZip }     from "../../../hooks/useDocumentZip";
import PublicLayout from "../components/layout/PublicLayout";

// ─── jsPDF for agreement PDF generation ──────────────────────────────────────
declare global { interface Window { jspdf: { jsPDF: unknown } } }

const EMPTY_ADDRESS: AddressData = {
  houseFlat: "", street: "", landmark: "", city: "", state: "",
  pincode: "", fullAddress: "", lat: 0, lng: 0,
};

interface AgentForm {
  fullName:        string;
  mobile:          string;
  email:           string;
  password:        string;
  confirmPassword: string;
  commissionShare: string; // read-only 5%
  gst:             string;
  languages:       string[];
  accountNumber:   string;
  confirmAccount:  string;
  agreementFile:   File | null;
  termsAccepted:   boolean;
}

const EMPTY: AgentForm = {
  fullName: "", mobile: "", email: "", password: "", confirmPassword: "",
  commissionShare: "5", gst: "", languages: [],
  accountNumber: "", confirmAccount: "", agreementFile: null, termsAccepted: false,
};

// Required fields for agreement download — in display order
const REQUIRED_FOR_AGREEMENT = [
  { key: "fullName",       label: "Full Name" },
  { key: "mobile",         label: "Mobile Number" },
  { key: "email",          label: "Email Address" },
  { key: "address",        label: "Office Address (map pin + house no.)" },
  { key: "ifsc",           label: "IFSC Code (verified)" },
  { key: "accountNumber",  label: "Account Number" },
];

type PageStep = "form" | "preview" | "otp" | "success";

export default function AgentRegisterPage() {
  const navigate = useNavigate();

  const [step,    setStep]    = useState<PageStep>("form");
  const [form,    setForm]    = useState<AgentForm>(EMPTY);
  const [address, setAddress] = useState<AddressData>(EMPTY_ADDRESS);
  const [bank,    setBank]    = useState<BankDetails>(EMPTY_BANK);
  const [refs,    setRefs]    = useState<[ReferencePerson, ReferencePerson]>([
    { ...EMPTY_REFERENCE }, { ...EMPTY_REFERENCE },
  ]);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [otp,     setOtp]     = useState(["", "", "", "", "", ""]);
  const [otpErr,  setOtpErr]  = useState("");
  const [loading, setLoading] = useState(false);
  const [regId,   setRegId]   = useState("");
  const [copied,  setCopied]  = useState(false);

  const { scrollToFirstError } = useScrollToError();
  const { zipping, createAndUploadZip } = useDocumentZip();

  // Derived: expected agreement filename
  const agreementFilename = useMemo(() => {
    const name = form.fullName.trim().replace(/\s+/g, "_") || "Agent";
    return `ADDies_Agent_Agreement_${name}`;
  }, [form.fullName]);

  // Accepted agreement basenames (any of: .pdf .jpg .jpeg .png)
  const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

  // Check which required-for-agreement fields are still empty
  const missingForAgreement = useMemo(() => {
    const missing: string[] = [];
    if (!form.fullName.trim())            missing.push("Full Name");
    if (!/^\d{10}$/.test(form.mobile))    missing.push("Mobile Number");
    if (!/\S+@\S+\.\S+/.test(form.email)) missing.push("Email Address");
    if (!address.houseFlat.trim())        missing.push("Office Address (map pin + house no.)");
    if (!bank.bankName)                   missing.push("IFSC Code (verified)");
    if (!form.accountNumber.trim())       missing.push("Account Number");
    return missing;
  }, [form, address, bank]);

  const canDownload = missingForAgreement.length === 0;

  const set = (k: keyof AgentForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: (e.target as HTMLInputElement).value }));

  // ── Validate ─────────────────────────────────────────────────────────────
  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())              e.fullName        = "Required";
    if (!/^\d{10}$/.test(form.mobile))      e.mobile          = "Valid 10-digit mobile required";
    if (!/\S+@\S+\.\S+/.test(form.email))  e.email           = "Valid email required";
    if (form.password.length < 8)           e.password        = "Min 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!address.houseFlat.trim())          e.address         = "Pin your office on map and fill house/flat no.";
    if (form.languages.length === 0)        e.languages       = "Select at least one language";
    if (!bank.bankName)                     e.ifsc            = "Verify IFSC code first";
    if (!form.accountNumber.trim())         e.accountNumber   = "Required";
    if (form.accountNumber !== form.confirmAccount) e.confirmAccount = "Account numbers do not match";
    refs.forEach((r, i) => {
      if (!r.name.trim())                   e[`ref${i}_name`]     = "Required";
      if (!/^\d{10}$/.test(r.mobile))       e[`ref${i}_mobile`]   = "Valid mobile required";
      if (!r.relation)                      e[`ref${i}_relation`] = "Select relation";
      if (!r.address.trim())                e[`ref${i}_address`]  = "Required";
    });
    if (!form.agreementFile)                e.agreementFile   = "Upload signed agreement";
    if (!form.termsAccepted)                e.termsAccepted   = "Accept Terms & Conditions";
    return e;
  }

  function handleReview() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      scrollToFirstError(e);
      return;
    }
    setStep("preview");
  }

  // ── Agreement file validation ─────────────────────────────────────────────
  function handleAgreementUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const ext       = ACCEPTED_EXTENSIONS.find((x) => lowerName.endsWith(x));
    if (!ext) {
      setErrors((p) => ({ ...p, agreementFile: "Only PDF, JPG, JPEG, PNG formats accepted." }));
      return;
    }

    // Check base name matches expected
    const expectedBase = agreementFilename.toLowerCase();
    const uploadedBase = lowerName.replace(/\.[^.]+$/, "").toLowerCase();
    if (uploadedBase !== expectedBase.toLowerCase()) {
      setErrors((p) => ({
        ...p,
        agreementFile: `File name must be "${agreementFilename}" (with .pdf/.jpg/.jpeg/.png). Got: "${file.name}"`,
      }));
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrors((p) => ({ ...p, agreementFile: "File size must be under 4 MB." }));
      return;
    }

    setErrors((p) => ({ ...p, agreementFile: "" }));
    setForm((p) => ({ ...p, agreementFile: file }));
    if (e.target) e.target.value = "";
  }

  // ── Download Agreement as PDF ─────────────────────────────────────────────
  async function downloadAgreement() {
    if (!canDownload) return;

    // Load jsPDF
    if (!(window as unknown as { jspdf?: unknown }).jspdf) {
      await new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src   = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        s.onload = () => resolve();
        document.head.appendChild(s);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const addLine  = (text: string, x: number, y: number, opts?: object) => doc.text(text, x, y, opts);
    const lineGap  = 7;
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    addLine("CITY AGENT AGREEMENT", 105, y, { align: "center" }); y += 6;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    addLine("ADDies ServiceHub", 105, y, { align: "center" }); y += 4;

    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, 195, y); y += lineGap;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const rows: [string, string][] = [
      ["Date",            new Date().toLocaleDateString("en-IN")],
      ["Agent Name",      form.fullName],
      ["Mobile",          form.mobile],
      ["Email",           form.email],
      ["City",            address.city || "—"],
      ["State",           address.state || "—"],
      ["Office Address",  address.fullAddress || address.houseFlat],
      ["GST Number",      form.gst || "N/A"],
      ["Commission",      `${form.commissionShare}%`],
      ["Bank",            bank.bankName],
      ["Branch",          bank.bankBranch],
      ["IFSC",            bank.ifsc],
      ["Account No.",     `XXXXXXXX${form.accountNumber.slice(-4)}`],
    ];

    for (const [label, value] of rows) {
      doc.setFont("helvetica", "bold");
      addLine(`${label}:`, 15, y);
      doc.setFont("helvetica", "normal");
      addLine(value, 60, y);
      y += lineGap;
    }

    y += 4;
    doc.line(15, y, 195, y); y += lineGap;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    addLine("Terms & Conditions", 15, y); y += lineGap;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const clauses = [
      "1. The Agent agrees to manage vendor onboarding in the assigned city.",
      "2. Commission will be paid on each booking processed in the Agent's city.",
      "3. The Agent must not engage with competing platforms during the contract period.",
      "4. All customer and vendor data handled by the Agent must remain strictly confidential.",
      "5. The Company reserves the right to revoke this agreement with 30 days written notice.",
      "6. Any disputes shall be resolved through arbitration as per Indian Arbitration Act.",
      "7. The Agent is responsible for timely response to vendor and customer queries.",
    ];
    for (const clause of clauses) {
      const lines = doc.splitTextToSize(clause, 175) as string[];
      for (const line of lines) { addLine(line, 15, y); y += 5.5; }
      y += 1;
    }

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    addLine("Agent Signature:", 15, y);
    addLine("Date:", 130, y); y += 10;
    addLine("____________________________", 15, y);
    addLine("____________________", 130, y); y += 6;
    addLine(form.fullName, 15, y);

    doc.save(`${agreementFilename}.pdf`);
  }

  // ── OTP ──────────────────────────────────────────────────────────────────
  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) document.getElementById(`aotp-${i + 1}`)?.focus();
  }
  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`aotp-${i - 1}`)?.focus();
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  function handleSendOtp() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1000);
  }

  async function handleVerifyAndSubmit() {
    const entered = otp.join("");
    if (entered.length < 6) { setOtpErr("Enter the 6-digit OTP"); return; }
    if (entered !== "123456") { setOtpErr("Invalid OTP. (Demo: use 123456)"); return; }

    setLoading(true);
    const id = generateRegistrationId("AGEN");

    // Bundle documents into ZIP
    const entries = [];
    if (form.agreementFile) entries.push({ filename: form.agreementFile.name, file: form.agreementFile });

    await createAndUploadZip(entries, id, "agent");

    setRegId(id);
    setLoading(false);
    setStep("success");
  }

  function copyId() { navigator.clipboard.writeText(regId); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-slate-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">

        <button onClick={() => step === "preview" ? setStep("form") : step === "otp" ? setStep("preview") : navigate("/register")}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 to-violet-600" />
          <div className="p-6 sm:p-8">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                <Building2 size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-neutral-900">City Agent Registration</h1>
                <p className="text-xs text-neutral-400">
                  {step === "form"    && "Fill your details to become a city partner"}
                  {step === "preview" && "Review your details before submitting"}
                  {step === "otp"     && "Verify your mobile number"}
                  {step === "success" && "Application submitted!"}
                </p>
              </div>
            </div>

            {/* ─────────────────────────── FORM ─────────────────────────── */}
            {step === "form" && (
              <div className="flex flex-col gap-5">

                {/* Personal */}
                <SH>Personal Information</SH>
                <div data-field-id="fullName" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name" required placeholder="Your full name"
                    value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
                  <div data-field-id="mobile">
                    <FormField label="Mobile Number" required type="tel" placeholder="9876543210"
                      value={form.mobile} onChange={set("mobile")} error={errors.mobile} />
                  </div>
                </div>
                <div data-field-id="email">
                  <FormField label="Email Address" required type="email" placeholder="agent@email.com"
                    value={form.email} onChange={set("email")} error={errors.email} />
                </div>
                <div data-field-id="password">
                  <PasswordField required
                    value={form.password}
                    onChange={(v) => setForm((p) => ({ ...p, password: v }))}
                    error={errors.password}
                    showConfirm
                    confirmValue={form.confirmPassword}
                    onConfirmChange={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
                    confirmError={errors.confirmPassword}
                  />
                </div>

                {/* Office Location — city comes from map, no separate city field */}
                <SH>Office Location <span className="text-neutral-400 normal-case text-xs font-normal">(City auto-detected from map)</span></SH>
                <div data-field-id="address">
                  <MapAddressPicker value={address} onChange={setAddress} label="Pin your office on map" />
                  {errors.address && <p className="text-xs text-danger mt-1">{errors.address}</p>}
                </div>

                {/* Commission — read only */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Commission Sharing % <span className="text-neutral-400 font-normal text-xs normal-case">(Decided by Admin)</span>
                  </label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 cursor-not-allowed">
                    <span className="text-sm font-black text-neutral-700">{form.commissionShare}%</span>
                    <span className="text-xs text-neutral-400">This is set by ADDies Admin and cannot be changed.</span>
                  </div>
                </div>

                <FormField label="GST Number (optional)" placeholder="22AAAAA0000A1Z5"
                  value={form.gst} onChange={set("gst")} hint="Leave blank if not GST registered" />

                {/* Languages */}
                <SH>Preferred Languages</SH>
                <div data-field-id="languages">
                  <LanguageCheckboxGroup selected={form.languages}
                    onChange={(l) => setForm((p) => ({ ...p, languages: l }))}
                    error={errors.languages} />
                </div>

                {/* Bank */}
                <SH>Bank Details</SH>
                <div data-field-id="ifsc">
                  <IFSCField value={bank} onChange={setBank} error={errors.ifsc} />
                </div>
                <div data-field-id="accountNumber">
                  <AccountNumberField
                    value={form.accountNumber} confirmValue={form.confirmAccount}
                    onChange={(v) => setForm((p) => ({ ...p, accountNumber: v }))}
                    onConfirmChange={(v) => setForm((p) => ({ ...p, confirmAccount: v }))}
                    error={errors.accountNumber} confirmError={errors.confirmAccount}
                  />
                </div>

                {/* References */}
                <SH>Reference Persons <span className="text-neutral-400 normal-case text-xs font-normal">(for fraud prevention)</span></SH>
                <div data-field-id="ref0_name">
                  <ReferencePersonForm refs={refs}
                    onChange={(i, r) => { const n = [...refs] as typeof refs; n[i] = r; setRefs(n); }}
                    errors={errors} />
                </div>

                {/* Agreement */}
                <SH>Agreement Document</SH>

                {/* Download section */}
                <div className={`rounded-2xl border-2 p-4 transition-all
                  ${canDownload ? "border-violet-200 bg-violet-50" : "border-neutral-200 bg-neutral-50"}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-neutral-700">Download & Sign Agreement (PDF)</p>
                      <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                        📄 {agreementFilename}.pdf
                      </p>
                    </div>
                    <button type="button" onClick={downloadAgreement} disabled={!canDownload}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                        ${canDownload
                          ? "bg-violet-600 text-white hover:bg-violet-700"
                          : "bg-neutral-200 text-neutral-400 cursor-not-allowed"}`}>
                      <Download size={14} />
                      Download PDF
                    </button>
                  </div>

                  {/* Missing fields list */}
                  {!canDownload && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                        <AlertCircle size={12} /> Fill these required fields to enable download:
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {missingForAgreement.map((label) => (
                          <span key={label} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload section */}
                <div data-field-id="agreementFile" className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Upload Signed Agreement <span className="text-danger">*</span>
                  </label>

                  {/* Filename note */}
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 mb-1">
                    <FileWarning size={13} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Accepted filenames only:</p>
                      <p className="text-blue-600 font-mono mt-0.5">
                        {ACCEPTED_EXTENSIONS.map((ext) => `${agreementFilename}${ext}`).join("  |  ")}
                      </p>
                      <p className="text-blue-500 mt-0.5">Maximum file size: 4 MB</p>
                    </div>
                  </div>

                  {form.agreementFile ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-300 bg-green-50">
                      <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-green-700 flex-1 truncate">{form.agreementFile.name}</span>
                      <button type="button" onClick={() => setForm((p) => ({ ...p, agreementFile: null }))}
                        className="text-neutral-400 hover:text-danger transition-colors text-xs">Remove</button>
                    </div>
                  ) : (
                    <label className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all
                      ${errors.agreementFile ? "border-danger bg-red-50" : "border-neutral-200 bg-neutral-50 hover:border-violet-300 hover:bg-violet-50"}`}>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleAgreementUpload} />
                      <Download size={16} className="text-neutral-400 flex-shrink-0 rotate-180" />
                      <span className="text-xs text-neutral-500">Click to upload signed agreement</span>
                    </label>
                  )}
                  {errors.agreementFile && (
                    <p className="text-xs text-danger font-medium">{errors.agreementFile}</p>
                  )}
                </div>

                {/* Terms */}
                <div data-field-id="termsAccepted">
                  <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                    ${errors.termsAccepted ? "border-danger bg-red-50" : form.termsAccepted ? "border-green-300 bg-green-50" : "border-neutral-200 bg-neutral-50"}`}>
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
                  {errors.termsAccepted && <p className="text-xs text-danger mt-1">{errors.termsAccepted}</p>}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  ⏳ Application review takes 2–5 business days.
                </div>

                <button onClick={handleReview}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white
                             font-bold text-sm hover:from-violet-600 hover:to-violet-700 transition-all
                             flex items-center justify-center gap-2">
                  Review Details <ArrowRight size={15} />
                </button>

                <p className="text-center text-xs text-neutral-400">
                  Already registered?{" "}
                  <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login</Link>
                </p>
              </div>
            )}

            {/* ─────────────────────────── PREVIEW ──────────────────────── */}
            {step === "preview" && (
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-700 font-medium">
                  📋 Review carefully. Click Edit to make changes.
                </div>
                <PS title="Personal">
                  <PR label="Full Name"  val={form.fullName} />
                  <PR label="Mobile"     val={form.mobile} />
                  <PR label="Email"      val={form.email} />
                  <PR label="Password"   val="••••••••" />
                  <PR label="Languages"  val={form.languages.join(", ")} />
                </PS>
                <PS title="Office Location">
                  <PR label="House/Flat" val={address.houseFlat} />
                  <PR label="Street"     val={address.street} />
                  <PR label="Landmark"   val={address.landmark || "—"} />
                  <PR label="City"       val={address.city} />
                  <PR label="State"      val={address.state} />
                  <PR label="Pincode"    val={address.pincode} />
                </PS>
                <PS title="Assignment">
                  <PR label="Commission" val={`${form.commissionShare}%`} />
                  <PR label="GST"        val={form.gst || "—"} />
                </PS>
                <PS title="Bank">
                  <PR label="Bank"       val={bank.bankName} />
                  <PR label="Branch"     val={bank.bankBranch} />
                  <PR label="IFSC"       val={bank.ifsc} />
                  <PR label="Account"    val={`XXXXXXXX${form.accountNumber.slice(-4)}`} />
                </PS>
                <PS title="References">
                  {refs.map((r, i) => (
                    <div key={i}>
                      <PR label={`Ref ${i+1} Name`}     val={r.name} />
                      <PR label={`Ref ${i+1} Mobile`}   val={r.mobile} />
                      <PR label={`Ref ${i+1} Relation`} val={r.relation} />
                    </div>
                  ))}
                </PS>
                <PS title="Documents">
                  <PR label="Agreement" val={form.agreementFile?.name ?? "—"} />
                  <PR label="Terms"     val="Accepted ✓" />
                </PS>

                <div className="flex gap-3">
                  <button onClick={() => setStep("form")}
                    className="flex-1 py-2.5 rounded-xl border-2 border-neutral-200 text-sm font-semibold text-neutral-600">
                    Edit Details
                  </button>
                  <button onClick={handleSendOtp} disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white
                               font-bold text-sm hover:from-violet-600 hover:to-violet-700 disabled:opacity-60
                               flex items-center justify-center gap-2 transition-all">
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : "Send OTP & Verify"}
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────── OTP ──────────────────────────── */}
            {step === "otp" && (
              <div className="flex flex-col items-center gap-5">
                <div className="text-center">
                  <p className="text-sm text-neutral-600">OTP sent to <strong>+91 {form.mobile}</strong></p>
                  <p className="text-xs text-neutral-400 mt-1">Demo: use <strong>123456</strong></p>
                </div>
                <div className="flex gap-2">
                  {otp.map((digit, i) => (
                    <input key={i} id={`aotp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl
                                 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 transition-all" />
                  ))}
                </div>
                {otpErr && <p className="text-xs text-danger font-medium">{otpErr}</p>}
                <button onClick={handleVerifyAndSubmit} disabled={loading || zipping}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white
                             font-bold text-sm hover:from-violet-600 hover:to-violet-700 disabled:opacity-60
                             flex items-center justify-center gap-2 transition-all">
                  {loading || zipping
                    ? <><Loader2 size={15} className="animate-spin" /> {zipping ? "Bundling documents…" : "Verifying…"}</>
                    : "Verify & Submit Application"}
                </button>
              </div>
            )}

            {/* ─────────────────────────── SUCCESS ──────────────────────── */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-5 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral-900 mb-1">Application Submitted! 🎉</h2>
                  <p className="text-sm text-neutral-500">Verification takes 2–5 business days.</p>
                </div>
                <div className="w-full bg-violet-50 border border-violet-200 rounded-2xl p-4">
                  <p className="text-xs text-neutral-500 mb-1">Your Registration ID</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-black text-violet-700 tracking-wider">{regId}</span>
                    <button onClick={copyId} className="text-violet-400 hover:text-violet-700 transition-colors">
                      {copied ? <CheckCircle2 size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Documents stored as <span className="font-mono">{regId}.zip</span></p>
                  <p className="text-xs text-neutral-400">Use this ID to track your application</p>
                </div>
                <button onClick={() => navigate("/")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-bold text-sm">
                  Go to Home
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

// ── Helpers ──
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
      <span className="text-xs text-neutral-400 w-32 flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-neutral-800 flex-1">{val || "—"}</span>
    </div>
  );
}
