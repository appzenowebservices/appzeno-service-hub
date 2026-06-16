/**
 * VendorProfileKYCPage.tsx
 * Location: src/pages/vendor/VendorProfileKYCPage.tsx
 *
 * Registration ke saare fields editable hain:
 * Step 1 — Basic Info (name, mobile, email, city/address, categories, languages)
 * Step 2 — Business (businessName, experience, servicePincodes, workingDays, availability/timeSlots)
 * Step 3 — KYC (aadhaar, pan, bank/ifsc, account, docs)
 * Step 4 — Pricing (per-category base/emergency/visiting charges)
 */

import { useState } from "react";
import {
  User, Edit3, Save, X, CheckCircle2, ShieldCheck, AlertTriangle,
  Camera, Copy, BadgeCheck, Phone, Mail, MapPin, Briefcase,
  IndianRupee, Star, Clock, FileText, Shield, Lock, Eye, EyeOff,
  Check, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import LanguageCheckboxGroup from "../components/auth/LanguageCheckboxGroup";
import IFSCField, { type BankDetails, EMPTY_BANK } from "../components/auth/IFSCField";
import { MOCK_CATEGORIES } from "../../../data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VendorProfile {
  // Basic
  fullName:    string;
  mobile:      string;
  email:       string;
  city:        string;
  state:       string;
  houseFlat:   string;
  street:      string;
  landmark:    string;
  pincode:     string;
  categories:  string[];
  languages:   string[];
  // Business
  businessName:         string;
  experience:           string;
  servicePincodes:      string[];   // just pin strings for display
  workingAvailability:  "full" | "part";
  workingDays:          string[];
  timeSlots:            string[];
  // KYC
  aadhaar:     string;
  pan:         string;
  gst:         string;
  // Bank
  accountNumber: string;
  // Pricing (per category)
  categoryPricing: { categoryId: string; basePrice: string; emergencyCharges: string; visitingCharges: string }[];
  // Meta
  registrationId: string;
  kycStatus:      "pending" | "approved" | "rejected";
  profilePhoto:   string | null;
}

const WORKING_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TIME_SLOTS   = [
  "6:00 AM – 9:00 AM","9:00 AM – 12:00 PM","12:00 PM – 3:00 PM",
  "3:00 PM – 6:00 PM","6:00 PM – 9:00 PM",
];

// Mock initial profile (from authStore + registration data)
const MOCK_PROFILE: VendorProfile = {
  fullName:"Ravi Kumar Sharma", mobile:"9876543210",   email:"ravi.sharma@email.com",
  city:"Delhi", state:"Delhi", houseFlat:"12-A", street:"Green Park Colony",
  landmark:"Near Metro", pincode:"110016",
  categories:["plumbing","electrical"],
  languages:["Hindi","English"],
  businessName:"Kumar Services", experience:"8",
  servicePincodes:["110016","110024","110028"],
  workingAvailability:"full", workingDays:["Mon","Tue","Wed","Thu","Fri"],
  timeSlots:[],
  aadhaar:"XXXX XXXX 3456", pan:"ABCDE1234F", gst:"",
  accountNumber:"XXXXXXXX7890",
  categoryPricing:[
    { categoryId:"plumbing",   basePrice:"300", emergencyCharges:"150", visitingCharges:"100" },
    { categoryId:"electrical", basePrice:"350", emergencyCharges:"200", visitingCharges:"100" },
  ],
  registrationId:"ADDIESVEND2602260001", kycStatus:"approved", profilePhoto:null,
};

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({
  title, icon: Icon, editKey, activeEdit, onEdit, onSave, onCancel, saving, children,
}: {
  title: string; icon: React.ElementType;
  editKey: string; activeEdit: string | null;
  onEdit: () => void; onSave: () => void; onCancel: () => void;
  saving: boolean; children: React.ReactNode;
}) {
  const isEditing = activeEdit === editKey;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-emerald-500" />
          <p className="text-sm font-black text-slate-700">{title}</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">
              <X size={12} /> Cancel
            </button>
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-60 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button onClick={onEdit} disabled={!!activeEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-40 transition-all">
            <Edit3 size={12} /> Edit
          </button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Display Row ──────────────────────────────────────────────────────────────
function DR({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-xs font-semibold text-slate-800 flex-1 ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function FI({ label, value, onChange, type="text", placeholder="", disabled=false, hint="", required=false }:
  { label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string;
    disabled?:boolean; hint?:string; required?:boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-white transition-all
          focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
          ${disabled ? "bg-neutral-100 cursor-not-allowed text-slate-400" : "border-slate-200"}`} />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorProfileKYCPage() {
  const { user }     = useAuthStore();
  const [profile,    setProfile]    = useState<VendorProfile>(MOCK_PROFILE);
  const [draft,      setDraft]      = useState<VendorProfile>(MOCK_PROFILE);
  const [activeEdit, setActiveEdit] = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState<string | null>(null);
  const [bank,       setBank]       = useState<BankDetails>({ ...EMPTY_BANK, bankName:"ICICI Bank", bankBranch:"Green Park", bankAddress:"Green Park, Delhi", bankCity:"Delhi", bankState:"Delhi", ifsc:"ICIC0001234" });
  const [showAadhaar,setShowAadhaar]= useState(false);
  const [copied,     setCopied]     = useState(false);

  function startEdit(key: string) {
    setDraft({ ...profile });
    setActiveEdit(key);
  }

  function cancelEdit() {
    setDraft({ ...profile });
    setActiveEdit(null);
  }

  async function saveSection(key: string) {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setProfile({ ...draft });
    setSaving(false);
    setActiveEdit(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2500);
  }

  function copyRegId() {
    navigator.clipboard.writeText(profile.registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleCat(id: string) {
    const cats = draft.categories.includes(id)
      ? draft.categories.filter(c => c !== id)
      : [...draft.categories, id];
    setDraft(p => ({ ...p, categories: cats }));
  }

  function toggleDay(d: string) {
    const days = draft.workingDays.includes(d)
      ? draft.workingDays.filter(x => x !== d)
      : [...draft.workingDays, d];
    setDraft(p => ({ ...p, workingDays: days }));
  }

  function toggleSlot(sl: string) {
    const slots = draft.timeSlots.includes(sl)
      ? draft.timeSlots.filter(x => x !== sl)
      : [...draft.timeSlots, sl];
    setDraft(p => ({ ...p, timeSlots: slots }));
  }

  function updatePricing(cid: string, field: string, val: string) {
    setDraft(p => ({
      ...p,
      categoryPricing: p.categoryPricing.map(cp =>
        cp.categoryId === cid ? { ...cp, [field]: val } : cp
      ),
    }));
  }

  const kycBadge = profile.kycStatus === "approved"
    ? { cls:"bg-green-100 text-green-700 border-green-200",  icon:<ShieldCheck size={13} />, label:"KYC Verified" }
    : profile.kycStatus === "rejected"
    ? { cls:"bg-red-100 text-red-600 border-red-200",        icon:<AlertTriangle size={13} />, label:"KYC Rejected" }
    : { cls:"bg-amber-100 text-amber-700 border-amber-200",  icon:<Clock size={13} />, label:"KYC Pending" };

  const selectedCats = MOCK_CATEGORIES.filter(c => profile.categories.includes(c.id));
  const draftCats    = MOCK_CATEGORIES.filter(c => draft.categories.includes(c.id));

  const props = (key: string) => ({
    editKey: key, activeEdit, saving,
    onEdit:   () => startEdit(key),
    onSave:   () => saveSection(key),
    onCancel: cancelEdit,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <User size={22} className="text-emerald-500" /> Profile & KYC
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Apni poori profile manage karo — registration ke saare fields editable hain</p>
      </div>

      {/* Save success toast */}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 font-bold">
          <CheckCircle2 size={14} /> Section saved successfully!
        </div>
      )}

      {/* Profile Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center text-3xl font-black shadow-lg">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} className="w-full h-full rounded-2xl object-cover" alt="" />
              ) : (
                profile.fullName.charAt(0)
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-emerald-50 transition-colors border border-slate-200">
              <Camera size={12} className="text-slate-600" />
              <input type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) setProfile(p => ({ ...p, profilePhoto: URL.createObjectURL(f) }));
                }} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-black">{profile.fullName}</h2>
              {profile.kycStatus === "approved" && <BadgeCheck size={18} className="text-emerald-400" />}
            </div>
            <p className="text-emerald-300 text-sm font-semibold">{profile.businessName}</p>
            <p className="text-slate-400 text-xs mt-0.5">{selectedCats.map(c => c.name).join(" · ") || "—"}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="font-mono text-xs bg-white/10 px-2.5 py-1 rounded-full">{profile.registrationId}</span>
              <button onClick={copyRegId} className="text-slate-400 hover:text-white transition-colors">
                {copied ? <CheckCircle2 size={13} className="text-green-400" /> : <Copy size={13} />}
              </button>
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-bold ${kycBadge.cls}`}>
                {kycBadge.icon} {kycBadge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Basic Info ── */}
      <Section title="Basic Information" icon={User} {...props("basic")}>
        {activeEdit === "basic" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FI label="Full Name"    value={draft.fullName}  onChange={v => setDraft(p=>({...p,fullName:v}))}  required />
            <FI label="Mobile"       value={draft.mobile}    onChange={v => setDraft(p=>({...p,mobile:v}))}    type="tel" required />
            <FI label="Email"        value={draft.email}     onChange={v => setDraft(p=>({...p,email:v}))}     type="email" required />
            <FI label="City"         value={draft.city}      onChange={v => setDraft(p=>({...p,city:v}))}      required />
            <FI label="State"        value={draft.state}     onChange={v => setDraft(p=>({...p,state:v}))}     />
            <FI label="House / Flat" value={draft.houseFlat} onChange={v => setDraft(p=>({...p,houseFlat:v}))} />
            <FI label="Street"       value={draft.street}    onChange={v => setDraft(p=>({...p,street:v}))}    />
            <FI label="Landmark"     value={draft.landmark}  onChange={v => setDraft(p=>({...p,landmark:v}))}  />
            <FI label="Pincode"      value={draft.pincode}   onChange={v => setDraft(p=>({...p,pincode:v}))}   />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <DR label="Full Name" value={profile.fullName} />
            <DR label="Mobile"    value={`+91 ${profile.mobile}`} />
            <DR label="Email"     value={profile.email} />
            <DR label="City"      value={`${profile.city}, ${profile.state}`} />
            <DR label="Address"   value={`${profile.houseFlat}, ${profile.street}`} />
            <DR label="Landmark"  value={profile.landmark} />
            <DR label="Pincode"   value={profile.pincode} />
          </div>
        )}
      </Section>

      {/* ── SECTION 2: Categories & Languages ── */}
      <Section title="Services & Languages" icon={Briefcase} {...props("services")}>
        {activeEdit === "services" ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Service Categories *</p>
              <div className="flex flex-wrap gap-2">
                {MOCK_CATEGORIES.map(cat => {
                  const sel = draft.categories.includes(cat.id);
                  return (
                    <button key={cat.id} type="button" onClick={() => toggleCat(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all
                        ${sel ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
                      {sel && <Check size={11} />} {cat.icon} {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <LanguageCheckboxGroup selected={draft.languages}
              onChange={l => setDraft(p => ({ ...p, languages: l }))} />
          </div>
        ) : (
          <div>
            <DR label="Categories" value={selectedCats.map(c => `${c.icon} ${c.name}`).join("  ·  ")} />
            <DR label="Languages"  value={profile.languages.join(", ")} />
          </div>
        )}
      </Section>

      {/* ── SECTION 3: Business Details ── */}
      <Section title="Business Details" icon={Briefcase} {...props("business")}>
        {activeEdit === "business" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FI label="Business Name"       value={draft.businessName} onChange={v => setDraft(p=>({...p,businessName:v}))} required />
              <FI label="Years of Experience" value={draft.experience}   onChange={v => setDraft(p=>({...p,experience:v}))}   type="number" required />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Working Days *</p>
              <div className="flex flex-wrap gap-2">
                {WORKING_DAYS.map(d => {
                  const sel = draft.workingDays.includes(d);
                  return (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`w-12 h-10 rounded-xl text-xs font-bold border-2 transition-all
                        ${sel ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Availability Type *</p>
              <div className="flex gap-3">
                {(["full","part"] as const).map(type => (
                  <button key={type} type="button"
                    onClick={() => setDraft(p => ({ ...p, workingAvailability: type, timeSlots: [] }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all
                      ${draft.workingAvailability === type
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
                    {type === "full" ? "🕐 Full Time" : "⏱ Part Time"}
                  </button>
                ))}
              </div>
            </div>

            {draft.workingAvailability === "part" && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Time Slots *</p>
                <div className="flex flex-col gap-2">
                  {TIME_SLOTS.map(slot => {
                    const sel = draft.timeSlots.includes(slot);
                    return (
                      <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left
                          ${sel ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-200"}`}>
                        {sel ? <Check size={14} className="text-emerald-600 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0" />}
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <DR label="Business Name" value={profile.businessName} />
            <DR label="Experience"    value={`${profile.experience} years`} />
            <DR label="Working Days"  value={profile.workingDays.join(", ")} />
            <DR label="Availability"  value={profile.workingAvailability === "full" ? "Full Time" : `Part Time — ${profile.timeSlots.join(" | ")}`} />
            <DR label="Service PINs"  value={profile.servicePincodes.join(", ")} />
          </div>
        )}
      </Section>

      {/* ── SECTION 4: KYC Documents ── */}
      <Section title="KYC & Identity" icon={Shield} {...props("kyc")}>
        <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl border text-xs font-semibold ${kycBadge.cls}`}>
          {kycBadge.icon}
          <span>KYC Status: {kycBadge.label}</span>
          {profile.kycStatus === "approved" && <span className="ml-auto text-green-600">✓ Identity Verified by ADDies</span>}
        </div>

        {activeEdit === "kyc" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FI label="Aadhaar Number (last 4 visible)" value={draft.aadhaar}
                onChange={v => setDraft(p => ({ ...p, aadhaar: v }))}
                hint="Full Aadhaar only on re-verification" disabled />
              <FI label="PAN Number" value={draft.pan}
                onChange={v => setDraft(p => ({ ...p, pan: v.toUpperCase().slice(0,10) }))} />
              <FI label="GST Number (optional)" value={draft.gst}
                onChange={v => setDraft(p => ({ ...p, gst: v.toUpperCase() }))}
                placeholder="22AAAAA0000A1Z5" />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <Lock size={12} className="flex-shrink-0 mt-0.5" />
              Aadhaar field locked. KYC re-verification ke liye support se contact karo.
            </div>
          </div>
        ) : (
          <div>
            <DR label="Aadhaar"    value={profile.aadhaar} />
            <DR label="PAN"        value={profile.pan} mono />
            <DR label="GST"        value={profile.gst || "Not registered"} />
            <DR label="Reg ID"     value={profile.registrationId} mono />
          </div>
        )}
      </Section>

      {/* ── SECTION 5: Bank Details ── */}
      <Section title="Bank Account" icon={IndianRupee} {...props("bank")}>
        {activeEdit === "bank" ? (
          <div className="space-y-4">
            <IFSCField value={bank} onChange={setBank} />
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <Lock size={12} className="flex-shrink-0 mt-0.5" />
              Account number change karne ke liye admin approval required hai (1-2 business days).
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FI label="Account Number" value="••••••••7890" onChange={() => {}} disabled
                hint="Contact support to update" />
            </div>
          </div>
        ) : (
          <div>
            <DR label="Bank Name"   value={bank.bankName || "—"} />
            <DR label="Branch"      value={bank.bankBranch || "—"} />
            <DR label="IFSC"        value={bank.ifsc || "—"} mono />
            <DR label="Account"     value={profile.accountNumber} mono />
            <DR label="City"        value={bank.bankCity || "—"} />
          </div>
        )}
      </Section>

      {/* ── SECTION 6: Pricing ── */}
      <Section title="Service Pricing" icon={IndianRupee} {...props("pricing")}>
        {activeEdit === "pricing" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
              <Shield size={12} className="flex-shrink-0 mt-0.5" />
              GST rates and platform fee ADDies Admin set karta hai — customer ko automatically add hoga.
            </div>
            {draftCats.map(cat => {
              const pricing = draft.categoryPricing.find(cp => cp.categoryId === cat.id)
                ?? { categoryId: cat.id, basePrice:"", emergencyCharges:"", visitingCharges:"" };
              return (
                <div key={cat.id} className="rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <p className="text-xs font-black text-slate-700">{cat.name}</p>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key:"basePrice",        label:"Base Price (₹)",  hint:"Min charge",         required:true  },
                      { key:"emergencyCharges", label:"Emergency (₹)",   hint:"Urgent calls",        required:false },
                      { key:"visitingCharges",  label:"Visiting (₹)",    hint:"Inspection fee",      required:true  },
                    ].map(({ key, label, hint, required }) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {label}{required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        <input type="number" placeholder="₹"
                          value={pricing[key as keyof typeof pricing]}
                          onChange={e => updatePricing(cat.id, key, e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all" />
                        <p className="text-xs text-slate-400">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {selectedCats.map(cat => {
              const pricing = profile.categoryPricing.find(cp => cp.categoryId === cat.id);
              return (
                <div key={cat.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className="text-xs font-black text-slate-700 mb-1">{cat.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>Base: <strong className="text-slate-700">₹{pricing?.basePrice || "—"}</strong></span>
                      <span>Visit: <strong className="text-slate-700">₹{pricing?.visitingCharges || "—"}</strong></span>
                      {pricing?.emergencyCharges && <span>Emergency: <strong className="text-slate-700">₹{pricing.emergencyCharges}</strong></span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {selectedCats.length === 0 && <p className="text-xs text-slate-400">Koi pricing set nahi hai</p>}
          </div>
        )}
      </Section>

      {/* ── SECTION 7: Change Password ── */}
      <Section title="Change Password" icon={Lock} {...props("password")}>
        {activeEdit === "password" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FI label="Current Password" value=""      onChange={() => {}} type="password" placeholder="••••••••" />
            <FI label="New Password"     value=""      onChange={() => {}} type="password" placeholder="Min 8 characters" />
            <FI label="Confirm Password" value=""      onChange={() => {}} type="password" placeholder="Re-enter new password" />
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <div className="flex gap-1">{[...Array(8)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-slate-300" />)}</div>
            <span className="text-xs text-slate-400">Last changed: Never</span>
          </div>
        )}
      </Section>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
        <h3 className="text-sm font-black text-red-700 mb-1 flex items-center gap-2">
          <AlertTriangle size={15} /> Danger Zone
        </h3>
        <p className="text-xs text-red-500 mb-3">Ye actions permanent hain aur undo nahi ki ja sakti.</p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-xl border-2 border-red-300 text-red-600 text-xs font-bold hover:bg-red-100 transition-all">
            Pause Account
          </button>
          <button className="px-4 py-2 rounded-xl border-2 border-red-400 bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-all">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
