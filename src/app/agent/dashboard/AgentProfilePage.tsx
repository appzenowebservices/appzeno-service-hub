// src/pages/agent/dashboard/AgentProfilePage.tsx
//
// AgentDashboard.tsx mein:
//   import AgentProfilePage from "./dashboard/AgentProfilePage";
//   case "profile": return <AgentProfilePage />;
//
// Registration ke same components reuse kiye hain — UI consistent rahegi.

import { useState } from "react";
import {
  Edit3, Save, X, Copy, CheckCircle2, Lock,
  Shield, User, MapPin, Building2, IndianRupee, Languages,
  CreditCard, Users, FileText, ChevronDown, ChevronUp,
  Camera, AlertTriangle, Award, Calendar,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

// ── Same components as AgentRegisterPage ─────────────────────────────────────
import FormField              from "../../components/auth/FormField";
import PasswordField          from "../../components/auth/PasswordField";
import LanguageCheckboxGroup  from "../../components/auth/LanguageCheckboxGroup";
import MapAddressPicker, { type AddressData } from "../../components/auth/MapAddressPicker";
import IFSCField, { type BankDetails, EMPTY_BANK } from "../../components/auth/IFSCField";
import AccountNumberField     from "../../components/auth/AccountNumberField";
import ReferencePersonForm, { type ReferencePerson, EMPTY_REFERENCE } from "../../components/auth/ReferencePersonForm";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProfileForm {
  fullName:        string;
  mobile:          string;
  email:           string;
  gst:             string;
  languages:       string[];
  commissionShare: string;   // read-only — admin sets this
  accountNumber:   string;
  confirmAccount:  string;
}

const EMPTY_ADDR: AddressData = {
  houseFlat:"", street:"", landmark:"", city:"", state:"",
  pincode:"", fullAddress:"", lat:0, lng:0,
};

// ── Mock stored data (swap with authStore / API later) ────────────────────────
const INITIAL_FORM: ProfileForm = {
  fullName: "Rahul Verma", mobile: "9876543210",
  email: "rahul.verma@email.com", gst: "09AAAAA0000A1Z5",
  languages: ["hindi", "english", "urdu"],
  commissionShare: "5",
  accountNumber: "000012343456", confirmAccount: "000012343456",
};
const INITIAL_ADDR: AddressData = {
  houseFlat: "Flat 204, Tower B, Green Valley Apartments",
  street: "Govindpuram, Main Road", landmark: "Near Big Bazaar",
  city: "Ghaziabad", state: "Uttar Pradesh", pincode: "201013",
  fullAddress: "Flat 204, Tower B, Green Valley Apartments, Govindpuram, Ghaziabad",
  lat: 28.6692, lng: 77.4538,
};
const INITIAL_BANK: BankDetails = {
  ifsc: "SBIN0012345", bankName: "State Bank of India",
  bankBranch: "Govindpuram Branch",
  bankAddress: "Govindpuram, Ghaziabad, Uttar Pradesh 201013",
  bankCity: "Ghaziabad", bankState: "Uttar Pradesh",
};
const INITIAL_REFS: [ReferencePerson, ReferencePerson] = [
  { name:"Suresh Sharma", mobile:"9812345678", relation:"colleague", address:"House 12, Sector 4, Vaishali, Ghaziabad" },
  { name:"Kavita Singh",  mobile:"9823456789", relation:"neighbor",  address:"Flat 8A, Raj Apartments, Kaushambi, Ghaziabad" },
];
const AGENT_META = {
  registrationId: "ADDIESAGEN260226001",
  joinedDate:     "26 Feb 2026",
  status:         "active" as "active" | "pending" | "suspended",
  assignedCity:   "Ghaziabad",
  agreementFile:  "ADDies_Agent_Agreement_Rahul_Verma.pdf",
};

const STATUS_CFG = {
  active:    { label:"Active",    bg:"bg-emerald-100", text:"text-emerald-700", dot:"bg-emerald-500" },
  pending:   { label:"Pending",   bg:"bg-amber-100",   text:"text-amber-700",   dot:"bg-amber-400" },
  suspended: { label:"Suspended", bg:"bg-red-100",     text:"text-red-600",     dot:"bg-red-500" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Section({
  icon: Icon, title, subtitle,
  iconColor="text-violet-600", iconBg="bg-violet-50",
  children, action,
}: {
  icon: React.ElementType; title: string; subtitle?: string;
  iconColor?: string; iconBg?: string;
  children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={17} className={iconColor} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Row({ label, value, mono=false }: { label:string; value:string; mono?:boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5 font-medium">{label}</span>
      <span className={`text-sm font-semibold text-slate-800 flex-1 break-all ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-slate-300 font-normal italic">—</span>}
      </span>
    </div>
  );
}

function Collapsible({
  icon: Icon, title, subtitle, iconColor, iconBg, children,
}: {
  icon: React.ElementType; title:string; subtitle?:string;
  iconColor:string; iconBg:string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={17} className={iconColor} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ── Password Modal ─────────────────────────────────────────────────────────────
function PasswordModal({ onClose }: { onClose: () => void }) {
  const [pwd,     setPwd]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");

  function save() {
    if (pwd.length < 8)  { setErr("Min 8 characters required"); return; }
    if (pwd !== confirm) { setErr("Passwords do not match"); return; }
    setDone(true);
    setTimeout(onClose, 1800);
  }
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                <Lock size={14} className="text-violet-600" />
              </div>
              <h3 className="font-black text-slate-800 text-sm">Change Password</h3>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X size={13} />
            </button>
          </div>
          <div className="p-5">
            {done ? (
              <div className="py-6 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <div>
                  <p className="font-black text-slate-800">Password Updated!</p>
                  <p className="text-xs text-slate-400 mt-1">Use your new password on next login.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <PasswordField
                  label="New Password" value={pwd} onChange={setPwd} required
                  showConfirm confirmValue={confirm} onConfirmChange={setConfirm}
                />
                {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}
                <div className="flex gap-3 pt-1">
                  <button onClick={onClose}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button onClick={save}
                    className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 shadow-md shadow-violet-100">
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AgentProfilePage() {
  const { user } = useAuthStore();

  // Saved state
  const [savedForm,    setSavedForm]    = useState<ProfileForm>({
    ...INITIAL_FORM,
    fullName: user?.fullName || INITIAL_FORM.fullName,
    email:    user?.email    || INITIAL_FORM.email,
  });
  const [savedAddr,    setSavedAddr]    = useState<AddressData>(INITIAL_ADDR);
  const [savedBank,    setSavedBank]    = useState<BankDetails>(INITIAL_BANK);
  const [savedRefs,    setSavedRefs]    = useState<[ReferencePerson,ReferencePerson]>(INITIAL_REFS);

  // Draft state (active while editing)
  const [form,    setForm]    = useState<ProfileForm>(savedForm);
  const [address, setAddress] = useState<AddressData>(savedAddr);
  const [bank,    setBank]    = useState<BankDetails>(savedBank);
  const [refs,    setRefs]    = useState<[ReferencePerson,ReferencePerson]>(savedRefs);

  const [editing, setEditing] = useState(false);
  const [errors,  setErrors]  = useState<Record<string,string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [toast,   setToast]   = useState<{msg:string;ok:boolean}|null>(null);

  const st = STATUS_CFG[AGENT_META.status];

  function showToast(msg:string, ok=true) {
    setToast({msg,ok});
    setTimeout(() => setToast(null), 3200);
  }

  function startEdit() {
    // Reset drafts to saved values
    setForm(savedForm); setAddress(savedAddr);
    setBank(savedBank); setRefs(savedRefs);
    setErrors({}); setEditing(true);
  }

  function cancelEdit() {
    setForm(savedForm); setAddress(savedAddr);
    setBank(savedBank); setRefs(savedRefs);
    setErrors({}); setEditing(false);
  }

  function validate(): Record<string,string> {
    const e: Record<string,string> = {};
    if (!form.fullName.trim())            e.fullName  = "Required";
    if (!/^\d{10}$/.test(form.mobile))    e.mobile    = "Valid 10-digit mobile required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email     = "Valid email required";
    if (!address.houseFlat.trim())        e.address   = "Please fill your house/flat number";
    if (form.languages.length === 0)      e.languages = "Select at least one language";
    refs.forEach((r,i) => {
      if (!r.name.trim())             e[`ref${i}_name`]     = "Required";
      if (!/^\d{10}$/.test(r.mobile)) e[`ref${i}_mobile`]   = "Valid mobile required";
      if (!r.relation)                e[`ref${i}_relation`] = "Select relation";
      if (!r.address.trim())          e[`ref${i}_address`]  = "Required";
    });
    return e;
  }

  function handleSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      showToast("Fix the errors before saving.", false);
      return;
    }
    setSavedForm(form); setSavedAddr(address);
    setSavedBank(bank); setSavedRefs(refs);
    setEditing(false);
    showToast("Profile updated successfully! ✓");
  }

  function copyRegId() {
    navigator.clipboard.writeText(AGENT_META.registrationId).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const set = (k: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: (e.target as HTMLInputElement).value }));

  const maskedAccount = savedForm.accountNumber
    ? `XXXXXXXX${savedForm.accountNumber.slice(-4)}` : "—";

  return (
    <div className="mx-auto space-y-6 pb-10">

      {/* ── HERO ── */}
      <div className="relative rounded-2xl overflow-hidden text-white shadow-xl shadow-indigo-200"
        style={{ background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 45%,#4c1d95 100%)" }}>
        {/* Ambient blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(167,139,250,0.25),transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(129,140,248,0.2),transparent 70%)" }} />

        <div className="relative z-10 p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl"
                style={{ background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.3)" }}>
                {savedForm.fullName.charAt(0).toUpperCase()}
              </div>
              {editing && (
                <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Camera size={13} className="text-violet-700" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-black text-white truncate">{savedForm.fullName}</h2>
                  <p className="text-violet-300 text-sm mt-0.5 flex items-center gap-1.5">
                    <MapPin size={12}/> {AGENT_META.assignedCity} City Agent
                  </p>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot} animate-pulse`}/>
                      {st.label}
                    </span>
                    <span className="text-xs text-violet-300 flex items-center gap-1">
                      <Calendar size={11}/> Joined {AGENT_META.joinedDate}
                    </span>
                  </div>
                </div>

                {!editing ? (
                  <button onClick={startEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
                    style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)" }}>
                    <Edit3 size={13}/> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)" }}>
                      <X size={12}/> Cancel
                    </button>
                    <button onClick={handleSave}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-violet-800 hover:bg-violet-50 transition-colors shadow-md">
                      <Save size={12}/> Save
                    </button>
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {[
                  { icon:IndianRupee, label:"Commission", value:`${savedForm.commissionShare}%` },
                  { icon:Languages,   label:"Languages",  value:`${savedForm.languages.length} selected` },
                  { icon:Building2,   label:"City",       value:AGENT_META.assignedCity },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.12)" }}>
                    <s.icon size={12} className="text-violet-300 flex-shrink-0"/>
                    <div>
                      <p className="text-violet-400 font-medium" style={{fontSize:"9px"}}>{s.label}</p>
                      <p className="text-white font-black text-xs">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── REGISTRATION ID ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Award size={18} className="text-amber-500"/>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Registration ID</p>
            <p className="text-base font-black text-violet-700 font-mono tracking-widest mt-0.5">
              {AGENT_META.registrationId}
            </p>
          </div>
        </div>
        <button onClick={copyRegId}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors">
          {copied ? <><CheckCircle2 size={12} className="text-emerald-500"/> Copied!</> : <><Copy size={12}/> Copy</>}
        </button>
      </div>

      {/* ── PERSONAL INFORMATION ── */}
      <Section icon={User} title="Personal Information" subtitle="Name, mobile, email, GST">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-field-id="fullName">
                <FormField label="Full Name" required placeholder="Your full name"
                  value={form.fullName} onChange={set("fullName")} error={errors.fullName}/>
              </div>
              <div data-field-id="mobile">
                <FormField label="Mobile Number" required type="tel" placeholder="9876543210"
                  value={form.mobile} onChange={set("mobile")} error={errors.mobile}/>
              </div>
            </div>
            <div data-field-id="email">
              <FormField label="Email Address" required type="email" placeholder="agent@email.com"
                value={form.email} onChange={set("email")} error={errors.email}/>
            </div>
            <FormField label="GST Number (optional)" placeholder="22AAAAA0000A1Z5"
              value={form.gst} onChange={set("gst")} hint="Leave blank if not GST registered"/>
          </div>
        ) : (
          <>
            <Row label="Full Name"  value={savedForm.fullName}/>
            <Row label="Mobile"     value={`+91 ${savedForm.mobile}`}/>
            <Row label="Email"      value={savedForm.email}/>
            <Row label="GST Number" value={savedForm.gst || "Not provided"} mono/>
          </>
        )}
        <button onClick={() => setShowPwd(true)}
          className="mt-4 flex items-center gap-2 text-xs font-bold text-violet-600 border border-violet-200 bg-violet-50 px-3 py-2 rounded-xl hover:bg-violet-100 transition-colors">
          <Lock size={12}/> Change Password
        </button>
      </Section>

      {/* ── OFFICE LOCATION ── */}
      <Section icon={MapPin} title="Office Location"
        subtitle="City auto-detected from map pin during registration"
        iconColor="text-blue-600" iconBg="bg-blue-50">
        {editing ? (
          <div data-field-id="address">
            <MapAddressPicker value={address} onChange={setAddress} label="Update your office on map"/>
            {errors.address && <p className="text-xs text-red-500 font-medium mt-1">{errors.address}</p>}
          </div>
        ) : (
          <>
            <Row label="House / Flat" value={savedAddr.houseFlat}/>
            <Row label="Street"       value={savedAddr.street}/>
            <Row label="Landmark"     value={savedAddr.landmark || "Not provided"}/>
            <Row label="City"         value={savedAddr.city}/>
            <Row label="State"        value={savedAddr.state}/>
            <Row label="Pincode"      value={savedAddr.pincode} mono/>
            <div className="mt-3 flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
              <MapPin size={11} className="text-slate-400 flex-shrink-0"/>
              Map pin: <span className="font-mono font-semibold text-slate-700 ml-1">{savedAddr.lat.toFixed(4)}, {savedAddr.lng.toFixed(4)}</span>
            </div>
          </>
        )}
      </Section>

      {/* ── ASSIGNMENT (always read-only) ── */}
      <Section icon={Building2} title="Assignment Details"
        subtitle="Set by ADDies Admin — cannot be self-edited"
        iconColor="text-amber-600" iconBg="bg-amber-50">
        <Row label="Assigned City"    value={AGENT_META.assignedCity}/>
        <Row label="Commission Share" value={`${savedForm.commissionShare}% of platform earnings`}/>
        <Row label="Agent Status"     value={st.label}/>
        <Row label="Joined On"        value={AGENT_META.joinedDate}/>
        <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5"/>
          Commission % and assigned city are set by ADDies Admin. Contact admin for changes.
        </div>
      </Section>

      {/* ── LANGUAGES ── */}
      <Section icon={Languages} title="Preferred Languages"
        subtitle="Languages you speak and operate in"
        iconColor="text-cyan-600" iconBg="bg-cyan-50">
        {editing ? (
          <div data-field-id="languages">
            <LanguageCheckboxGroup
              selected={form.languages}
              onChange={langs => setForm(p => ({...p, languages: langs}))}
              error={errors.languages}
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedForm.languages.length > 0
              ? savedForm.languages.map(lang => (
                  <span key={lang}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                    <CheckCircle2 size={11}/> {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </span>
                ))
              : <p className="text-sm text-slate-400 italic">No languages selected</p>
            }
          </div>
        )}
      </Section>

      {/* ── BANK (collapsible + locked) ── */}
      <Collapsible icon={CreditCard} title="Bank Details"
        subtitle="Commission payout account"
        iconColor="text-emerald-600" iconBg="bg-emerald-50">
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <Shield size={12} className="flex-shrink-0 mt-0.5"/>
            Bank details are locked for security. Contact ADDies Admin to update your account.
          </div>
          {editing ? (
            // Show IFSC + Account components but disabled in edit mode (bank is admin-locked)
            <div className="opacity-60 pointer-events-none select-none space-y-3">
              <IFSCField value={savedBank} onChange={() => {}}/>
              <AccountNumberField
                value={maskedAccount} confirmValue={maskedAccount}
                onChange={() => {}} onConfirmChange={() => {}}
              />
            </div>
          ) : (
            <>
              <Row label="IFSC Code"   value={savedBank.ifsc} mono/>
              <Row label="Bank"        value={savedBank.bankName}/>
              <Row label="Branch"      value={savedBank.bankBranch}/>
              <Row label="Branch City" value={savedBank.bankCity}/>
              <Row label="State"       value={savedBank.bankState}/>
              <Row label="Account No." value={maskedAccount} mono/>
              <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={12}/> Verified during registration via IFSC API
              </div>
            </>
          )}
        </div>
      </Collapsible>

      {/* ── REFERENCES (collapsible + editable) ── */}
      <Collapsible icon={Users} title="Reference Persons"
        subtitle="2 references submitted for fraud prevention"
        iconColor="text-rose-600" iconBg="bg-rose-50">
        <div className="mt-4">
          {editing ? (
            <div data-field-id="ref0_name">
              <ReferencePersonForm
                refs={refs}
                onChange={(i, r) => {
                  const n = [...refs] as [ReferencePerson, ReferencePerson];
                  n[i] = r; setRefs(n);
                }}
                errors={errors}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedRefs.map((ref, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-black text-violet-600 uppercase tracking-wide mb-3">
                    Reference {i + 1}
                  </p>
                  {[
                    { l:"Name",     v: ref.name },
                    { l:"Mobile",   v: `+91 ${ref.mobile}` },
                    { l:"Relation", v: ref.relation },
                    { l:"Address",  v: ref.address },
                  ].map(r => (
                    <div key={r.l} className="flex gap-2 py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-xs text-slate-400 w-16 flex-shrink-0">{r.l}</span>
                      <span className="text-xs font-semibold text-slate-700 flex-1">{r.v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </Collapsible>

      {/* ── DOCUMENTS ── */}
      <Section icon={FileText} title="Agreement & Documents"
        subtitle="Submitted during registration — contact admin to update"
        iconColor="text-indigo-600" iconBg="bg-indigo-50">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <FileText size={15} className="text-emerald-600"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{AGENT_META.agreementFile}</p>
              <p className="text-xs text-slate-400 mt-0.5">Signed City Agent Agreement · PDF</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200 flex-shrink-0">
              <CheckCircle2 size={11}/> Submitted
            </span>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0"/>
            <div>
              <p className="text-xs font-bold text-slate-800">Terms & Conditions Accepted</p>
              <p className="text-xs text-slate-400">ADDies ServiceHub Terms, Privacy Policy & Agent Agreement</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-4 mb-2">KYC Checklist</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:"Agreement Document", ok: true },
                { label:"Terms & Conditions", ok: true },
                { label:"Bank Verification",  ok: true },
                { label:"Identity Proof",      ok: false },
              ].map(d => (
                <div key={d.label}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border
                    ${d.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {d.ok
                    ? <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0"/>
                    : <AlertTriangle size={12} className="text-amber-500 flex-shrink-0"/>}
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── STICKY SAVE BANNER ── */}
      {editing && (
        <div className="sticky bottom-4 z-30">
          <div className="rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl"
            style={{ background:"linear-gradient(135deg,#312e81,#4c1d95)" }}>
            <div>
              <p className="text-sm font-black text-white">Unsaved changes</p>
              <p className="text-xs text-violet-300">Review all sections before saving</p>
            </div>
            <div className="flex gap-2">
              <button onClick={cancelEdit}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors"
                style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)" }}>
                Discard
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-white text-violet-800 text-xs font-bold hover:bg-violet-50 transition-colors shadow-md">
                <Save size={12} className="inline mr-1.5"/> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASSWORD MODAL ── */}
      {showPwd && <PasswordModal onClose={() => setShowPwd(false)}/>}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl
          shadow-xl flex items-center gap-2 text-sm font-semibold text-white whitespace-nowrap
          ${toast.ok ? "bg-emerald-700" : "bg-red-600"}`}>
          {toast.ok
            ? <CheckCircle2 size={15} className="text-emerald-300"/>
            : <AlertTriangle size={15} className="text-red-300"/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
