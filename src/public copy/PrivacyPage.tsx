// src/pages/public/PrivacyPage.tsx
// Place at:  src/pages/public/PrivacyPage.tsx
// App.tsx:   <Route path="/privacy" element={<PrivacyPage />} />

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import { ChevronDown, ChevronRight, Shield, Users, Store, UserCheck, Lock, Eye } from "lucide-react";

const EFFECTIVE    = "1 March 2026";
const COMPANY      = "APPZENO WEB SERVICES PRIVATE LIMITED";
const PLATFORM     = "ADDies ServiceHub";
const EMAIL        = "contact@appzenowebservices.com";
const JURISDICTION = "Lucknow, Uttar Pradesh, India";
const GRIEVANCE_EMAIL = "contact@appzenowebservices.com";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(18px)", transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms` }}>{children}</div>;
}

function Accord({ num, title, children, open: init = false }: { num: string; title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(init);
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all mb-3 ${open ? "border-violet-200 shadow-sm" : "border-slate-100 hover:border-slate-200 bg-white"}`}>
      <button onClick={() => setOpen(o => !o)} className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left ${open ? "bg-violet-50" : "bg-white hover:bg-slate-50"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-black px-2.5 py-1 rounded-lg flex-shrink-0 ${open ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>{num}</span>
          <span className={`font-black text-sm leading-snug ${open ? "text-violet-800" : "text-slate-700"}`}>{title}</span>
        </div>
        <ChevronDown size={15} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-3 bg-white border-t border-slate-50"><div className="space-y-3 text-sm text-slate-600 leading-relaxed">{children}</div></div>}
    </div>
  );
}

const Li = ({ c }: { c: React.ReactNode }) => <li className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed"><ChevronRight size={13} className="text-violet-500 flex-shrink-0 mt-0.5" /><span>{c}</span></li>;
const Ul = ({ children }: { children: React.ReactNode }) => <ul className="space-y-2 ml-1">{children}</ul>;
const Box = ({ children, color = "violet" }: { children: React.ReactNode; color?: "violet" | "red" | "amber" | "sky" | "green" }) => {
  const m: Record<string, string> = { violet: "bg-violet-50 border-l-4 border-violet-500 text-violet-900", red: "bg-red-50 border-l-4 border-red-500 text-red-900", amber: "bg-amber-50 border-l-4 border-amber-500 text-amber-900", sky: "bg-sky-50 border-l-4 border-sky-500 text-sky-900", green: "bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900" };
  return <div className={`rounded-r-xl px-4 py-3 text-xs font-bold leading-relaxed ${m[color]}`}>{children}</div>;
};

const Table = ({ rows }: { rows: [string, string, string][] }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-100">
    <table className="w-full text-xs">
      <thead><tr className="bg-slate-50 border-b border-slate-100">
        <th className="text-left px-4 py-2.5 font-black text-slate-600">Data Type</th>
        <th className="text-left px-4 py-2.5 font-black text-slate-600">Purpose</th>
        <th className="text-left px-4 py-2.5 font-black text-slate-600">Retention</th>
      </tr></thead>
      <tbody>{rows.map(([d, p, r], i) => (
        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-violet-50 transition-colors">
          <td className="px-4 py-2.5 font-bold text-slate-700">{d}</td>
          <td className="px-4 py-2.5 text-slate-600">{p}</td>
          <td className="px-4 py-2.5 text-slate-500">{r}</td>
        </tr>
      ))}</tbody>
    </table>
  </div>
);

type RF = "all" | "customer" | "vendor" | "agent";
const TABS = [
  { key: "all" as RF, label: "All Roles", icon: Shield },
  { key: "customer" as RF, label: "Customers", icon: Users },
  { key: "vendor" as RF, label: "Vendors", icon: Store },
  { key: "agent" as RF, label: "City Agents", icon: UserCheck },
];

const TOC = [
  "Who We Are", "Data We Collect", "How We Use Data", "Legal Basis",
  "Data Sharing", "Customer-Specific Privacy", "Vendor-Specific Privacy",
  "Agent-Specific Privacy", "Data Retention", "Your Rights",
  "Cookies & Tracking", "Data Security", "Children's Data",
  "Third-Party Links", "Changes to Policy", "Grievance Officer",
];

export default function PrivacyPage() {
  const [role, setRole] = useState<RF>("all");
  const navigate = useNavigate();
  const show = (r: RF) => role === "all" || role === r;

  return (
    <PublicLayout>

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 60%, #7c3aed 0%, transparent 55%), radial-gradient(circle at 80% 20%, #0ea5e9 0%, transparent 45%)" }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "42px 42px" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-400/30 rounded-full px-4 py-1.5 mb-6">
            <Eye size={12} className="text-violet-400" />
            <span className="text-violet-300 text-xs font-bold tracking-widest uppercase">
              DPDPA 2023 Compliant · {EFFECTIVE}
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-2px" }}>
            Privacy{" "}
            <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-3">
            This Privacy Policy explains how <strong className="text-white">{COMPANY}</strong> collects, uses, stores, and protects personal data of all users of the <strong className="text-white">{PLATFORM}</strong> platform.
          </p>
          <p className="text-violet-400 text-xs font-bold">Effective: {EFFECTIVE} · Jurisdiction: {JURISDICTION}</p>
        </div>
      </section>

      {/* ROLE FILTER */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex-shrink-0 mr-2">View for:</span>
          {TABS.map(t => { const Icon = t.icon; const active = role === t.key; return (
            <button key={t.key} onClick={() => setRole(t.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 border transition-all ${active ? "bg-violet-600 text-white border-transparent shadow" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
              <Icon size={12} />{t.label}
            </button>
          ); })}
        </div>
      </div>

      {/* CONTENT */}
      <section className="py-12 px-4 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* TOC Sidebar */}
            <aside className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-20">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contents</p>
                <nav className="space-y-0.5">
                  {TOC.map((item, i) => (
                    <a key={item} href={`#pp${i + 1}`} className="flex items-center gap-2 py-1 px-2 rounded-lg text-xs text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      <span className="text-slate-300 font-bold w-5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>{item}
                    </a>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <button onClick={() => navigate("/terms")} className="block text-xs text-violet-600 font-bold hover:underline w-full text-left">→ Terms & Conditions</button>
                  <button onClick={() => navigate("/contact")} className="block text-xs text-slate-500 font-bold hover:underline w-full text-left">→ Contact ADDies</button>
                </div>
              </div>
            </aside>

            {/* Sections */}
            <div className="lg:col-span-3">

              {/* 1 */}
              <div id="pp1"><Accord num="01" title="Who We Are — Data Fiduciary" open>
                <p><strong>{COMPANY}</strong> ("ADDies", "we", "us") is the Data Fiduciary under the Digital Personal Data Protection Act, 2023 (DPDPA) for all personal data collected through the {PLATFORM} platform.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {[
                    { label: "Company", value: COMPANY },
                    { label: "Platform", value: PLATFORM },
                    { label: "Registered Office", value: `Lucknow, Uttar Pradesh, India` },
                    { label: "Privacy Contact", value: EMAIL },
                  ].map(r => (
                    <div key={r.label} className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{r.label}</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{r.value}</p>
                    </div>
                  ))}
                </div>
                <Box color="violet">ADDies is committed to full compliance with the DPDPA 2023, DPDP Rules 2025, and the IT (Reasonable Security Practices) Rules 2011. This Policy was last reviewed on {EFFECTIVE}.</Box>
              </Accord></div>

              {/* 2 */}
              <div id="pp2"><Accord num="02" title="Personal Data We Collect">
                <p>ADDies collects personal data that is necessary for the operation of the Platform. We practice data minimisation — we collect only what is required.</p>
                <Table rows={[
                  ["Name, Email, Phone", "Account creation, booking, communication", "Active account + 5 years"],
                  ["Address & Location", "Service fulfillment, city routing", "Active account + 3 years"],
                  ["Aadhaar / PAN (Vendors & Agents)", "KYC verification, legal compliance", "7 years (legal requirement)"],
                  ["Bank Account Details (Vendors)", "Payout processing", "7 years (financial records)"],
                  ["Booking History", "Service delivery, dispute resolution, analytics", "5 years"],
                  ["Payment Transaction Data", "Payment processing, fraud prevention", "7 years (financial records)"],
                  ["Device Info, IP Address", "Security, fraud prevention, analytics", "2 years"],
                  ["Usage & Clickstream Data", "Platform improvement, personalisation", "2 years"],
                  ["Reviews & Ratings", "Platform integrity, vendor accountability", "Duration of Platform operation"],
                  ["Support & Dispute Messages", "Dispute resolution, legal compliance", "5 years"],
                  ["Photos (Vendor profile)", "Platform listing, marketing", "Active account + 3 years"],
                ]} />
                <Box color="amber">ADDies does NOT collect: biometric data beyond Aadhaar-based KYC, health/medical data, caste or religion, or financial data beyond what is required for payments and KYC. You must not provide sensitive data beyond what is requested.</Box>
              </Accord></div>

              {/* 3 */}
              <div id="pp3"><Accord num="03" title="How We Use Your Data">
                <p>ADDies uses personal data for the following purposes:</p>
                <Ul>
                  <Li c="Service Delivery: Processing bookings, connecting Customers with Vendors, sending booking confirmations and reminders." />
                  <Li c="Account Management: Creating, verifying, and maintaining user accounts; conducting KYC for Vendors and Agents." />
                  <Li c="Payments: Processing transactions, managing payouts to Vendors, handling refunds and dispute settlements." />
                  <Li c="Platform Safety & Fraud Prevention: Monitoring for fraudulent activity, verifying identities, detecting policy violations, maintaining platform integrity." />
                  <Li c="Dispute Resolution: Reviewing evidence submitted by Customers and Vendors, issuing verdicts, maintaining records of disputes." />
                  <Li c="Analytics & Improvement: Understanding how users interact with the Platform to improve features, performance, and user experience." />
                  <Li c="Marketing & Communication: Sending service updates, promotional offers, and platform notifications. You may opt out of marketing communications at any time." />
                  <Li c="Legal Compliance: Retaining records as required by Indian law; complying with court orders, regulatory requirements, and law enforcement requests." />
                  <Li c="Personalisation: Customising your Platform experience based on your location, service history, and preferences." />
                </Ul>
                <Box color="violet">ADDies will not use your personal data for any purpose not described in this Policy without obtaining fresh consent, except where required by law.</Box>
              </Accord></div>

              {/* 4 */}
              <div id="pp4"><Accord num="04" title="Legal Basis for Processing">
                <p>Under the DPDPA 2023, ADDies processes personal data on the following legal bases:</p>
                <Ul>
                  <Li c={<><strong>Consent:</strong> You provide explicit consent at the time of registration for account creation, marketing communications, and data processing as described in this Policy.</>} />
                  <Li c={<><strong>Contractual Necessity:</strong> Processing required to deliver services you have booked, process payments, and manage your account.</>} />
                  <Li c={<><strong>Legitimate Interest:</strong> Fraud prevention, platform security, analytics, and improving the Platform — balanced against your rights.</>} />
                  <Li c={<><strong>Legal Obligation:</strong> Compliance with Indian tax laws, KYC norms, court orders, and regulatory requirements mandating data retention and disclosure.</>} />
                </Ul>
                <Box color="violet">You may withdraw consent for marketing communications at any time through your account settings or by emailing us. Withdrawal of consent for core service processing may result in inability to use certain Platform features.</Box>
              </Accord></div>

              {/* 5 */}
              <div id="pp5"><Accord num="05" title="Data Sharing — Who We Share With">
                <p>ADDies does not sell your personal data to third parties. We share data only as necessary and as described below:</p>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Within the Platform</p>
                    <Ul>
                      <Li c="Customer name, address, phone, and booking details are shared with the assigned Vendor for service fulfillment — limited to what is necessary." />
                      <Li c="Vendor name, photo, service details, and ratings are displayed publicly on the Platform to Customers." />
                      <Li c="Agent access to vendor data is limited to their assigned city and required for their onboarding role only." />
                    </Ul>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Third-Party Service Providers</p>
                    <Ul>
                      <Li c="Payment gateways (Razorpay or similar): Transaction data shared for payment processing. These processors have their own privacy policies and security standards." />
                      <Li c="SMS / OTP providers: Phone number shared for OTP-based authentication." />
                      <Li c="Cloud hosting providers: Data stored on secure, compliant cloud infrastructure in India." />
                      <Li c="Analytics tools: Anonymised or aggregated usage data shared with analytics providers." />
                    </Ul>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Legal & Regulatory Disclosure</p>
                    <Ul>
                      <Li c="ADDies will disclose personal data to law enforcement, regulatory authorities, courts, or government agencies when required by law or valid legal process — without prior notice to the user where legally permitted." />
                      <Li c="ADDies may disclose data to enforce these Terms, prevent fraud, protect the safety of users, or protect ADDies' legal rights." />
                    </Ul>
                  </div>
                </div>
                <Box color="red">ADDies does NOT sell, rent, or trade personal data with advertisers, data brokers, or any commercial third party for their own marketing purposes.</Box>
              </Accord></div>

              {/* 6 — CUSTOMER */}
              {show("customer") && <div id="pp6">
                <div className="flex items-center gap-2 mt-6 mb-2"><span className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-xs font-black text-violet-700 uppercase tracking-widest">Customer-Specific Privacy</span></div>
                <Accord num="06" title="Customer Data — What We Collect & How">
                  <Ul>
                    <Li c="Registration: Name, email, phone, password (hashed). Used for account creation and login." />
                    <Li c="Booking: Full address, service type, preferred time slot. Shared with assigned Vendor only for service fulfillment." />
                    <Li c="Location: City and approximate location for displaying relevant vendors. We do not track real-time GPS continuously." />
                    <Li c="Payment: Transaction data processed by third-party payment gateway. ADDies does not store full card details." />
                    <Li c="Reviews: Reviews you submit are associated with your account but displayed under your name on the Platform." />
                    <Li c="Customer Support: Conversations with our support team or dispute resolution messages are retained for quality and legal compliance." />
                  </Ul>
                  <Box color="violet">Customer data is never shared with Vendors beyond what is necessary for booking fulfillment. Your full payment details are never visible to Vendors.</Box>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 mt-3">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">What Customers CAN control</p>
                    <Ul>
                      <Li c="Opt out of marketing SMS/email from account settings." />
                      <Li c="Request correction of inaccurate profile data." />
                      <Li c="Request account deletion (subject to legal retention requirements)." />
                      <Li c="Download a copy of your booking history — available from your Customer Dashboard." />
                    </Ul>
                  </div>
                  <Box color="amber">ADDies may retain booking and transaction data for up to 5–7 years even after account deletion for legal, tax, and dispute resolution compliance.</Box>
                </Accord>
              </div>}

              {/* 7 — VENDOR */}
              {show("vendor") && <div id="pp7">
                <div className="flex items-center gap-2 mt-6 mb-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Vendor-Specific Privacy</span></div>
                <Accord num="07" title="Vendor Data — What We Collect & How">
                  <Ul>
                    <Li c="KYC Documents: Aadhaar number (last 4 digits displayed), PAN, address proof — collected for identity verification and legal compliance. Stored securely with restricted access." />
                    <Li c="Bank Details: Account number and IFSC code for payout processing. Stored encrypted. Never shared with Customers or other Vendors." />
                    <Li c="Profile Data: Name, photo, service categories, city, experience description. Publicly displayed on the Platform to Customers." />
                    <Li c="Job Records: Completed bookings, earnings, ratings, and dispute history maintained in your Vendor account." />
                    <Li c="Location: City and service area for lead routing. Real-time location is not tracked continuously." />
                    <Li c="Device & Login Data: Device information and login history maintained for security and fraud prevention." />
                  </Ul>
                  <Box color="red">Vendor KYC documents are retained for a minimum of 7 years as required by Indian law, even after account deletion. This is a legal obligation and ADDies cannot delete these records earlier.</Box>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 mt-3">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Vendor Data Rights (Subject to Legal Limits)</p>
                    <Ul>
                      <Li c="Request correction of profile data or banking details." />
                      <Li c="Opt out of marketing communications." />
                      <Li c="Request account deletion — KYC and financial records will be retained per legal requirements." />
                      <Li c="Request a summary of your earnings and booking history." />
                    </Ul>
                  </div>
                  <Box color="violet">Vendor profile photos, names, and reviews may continue to appear in cached search results and ADDies marketing materials for a reasonable period after account deactivation. ADDies is not responsible for third-party caching.</Box>
                </Accord>
              </div>}

              {/* 8 — AGENT */}
              {show("agent") && <div id="pp8">
                <div className="flex items-center gap-2 mt-6 mb-2"><span className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-xs font-black text-orange-700 uppercase tracking-widest">City Agent-Specific Privacy</span></div>
                <Accord num="08" title="City Agent Data — What We Collect & How">
                  <Ul>
                    <Li c="Identity: Name, email, phone, government ID, address — collected for appointment, KYC, and commission management." />
                    <Li c="Bank Details: Account number and IFSC for commission payouts. Stored encrypted." />
                    <Li c="Performance Data: Vendor onboarding records, dispute resolution records, commission history — maintained for performance evaluation." />
                    <Li c="City Operations Data: All vendor KYC documents, service records, and customer data accessed in the course of your role are governed by strict confidentiality obligations." />
                    <Li c="Communications: All official communications with ADDies are retained for compliance and accountability." />
                  </Ul>
                  <Box color="red">City Agents must not store, copy, or share any customer or vendor personal data accessed through the Platform outside of the Platform's official systems. Breach of this obligation is a criminal offence under the DPDPA 2023 and IT Act 2000.</Box>
                  <Box color="amber">Agent identity and financial records are retained for 7 years post contract termination for legal and tax compliance. Performance records are retained for 5 years.</Box>
                </Accord>
              </div>}

              {/* 9 */}
              <div id="pp9">
                <div className="flex items-center gap-2 mt-6 mb-2"><span className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Common Privacy Sections</span></div>
                <Accord num="09" title="Data Retention Policy">
                  <p>ADDies retains personal data only as long as necessary for the stated purpose or as required by applicable Indian law. The following retention schedule applies:</p>
                  <Table rows={[
                    ["Customer Account Data", "Account + 5 years post deletion", "Tax, dispute, legal compliance"],
                    ["Booking & Transaction Records", "7 years", "GST, tax, legal compliance"],
                    ["Vendor KYC Documents", "7 years minimum", "Legal, regulatory mandate"],
                    ["Bank / Payout Records", "7 years", "Financial records compliance"],
                    ["Dispute & Support Records", "5 years", "Legal proceedings"],
                    ["Usage & Analytics Data", "2 years (anonymised)", "Platform improvement"],
                    ["Marketing Consent Records", "3 years after withdrawal", "Consent audit trail"],
                    ["Agent Records", "7 years post termination", "Tax, legal, compliance"],
                  ]} />
                  <Box color="violet">ADDies may retain data beyond the periods above if required by a court order, regulatory direction, active legal proceeding, or fraud investigation.</Box>
                </Accord>
              </div>

              {/* 10 */}
              <div id="pp10"><Accord num="10" title="Your Rights Under DPDPA 2023">
                <p>As a Data Principal under the Digital Personal Data Protection Act, 2023, you have the following rights regarding your personal data processed by ADDies:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: "📋", right: "Right to Access", desc: "Request a summary of your personal data held by ADDies and details of how it is being processed." },
                    { icon: "✏️", right: "Right to Correction", desc: "Request correction of inaccurate, incomplete, or outdated personal data in your account." },
                    { icon: "🗑️", right: "Right to Erasure", desc: "Request deletion of your personal data, subject to ADDies' legal retention obligations." },
                    { icon: "🚫", right: "Right to Grievance", desc: "Raise a privacy grievance with our Grievance Officer. Response within 30 days as required by law." },
                    { icon: "👶", right: "Right re: Nominee", desc: "Nominate a person to exercise your data rights in case of incapacity or death, as provided under DPDPA." },
                    { icon: "📤", right: "Right to Withdraw Consent", desc: "Withdraw consent for marketing or non-essential processing at any time. This does not affect lawfulness of prior processing." },
                  ].map(r => (
                    <div key={r.right} className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                      <p className="text-base mb-1">{r.icon}</p>
                      <p className="text-xs font-black text-slate-700 mb-1">{r.right}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
                <Box color="amber">ADDies will process data rights requests within 30 days. ADDies may decline requests where: (a) it would conflict with legal retention obligations; (b) the request is frivolous or repetitive; (c) it would adversely affect the rights of other users; or (d) it would impair ADDies' ability to comply with legal obligations. ADDies' decision on such requests is final subject to escalation to the Data Protection Board.</Box>
                <p>To exercise any right, email: <a href={`mailto:${EMAIL}`} className="text-violet-600 font-bold hover:underline">{EMAIL}</a></p>
              </Accord></div>

              {/* 11 */}
              <div id="pp11"><Accord num="11" title="Cookies & Tracking Technologies">
                <Ul>
                  <Li c={<><strong>Essential Cookies:</strong> Required for Platform functionality — login sessions, security tokens, booking state. Cannot be disabled.</>} />
                  <Li c={<><strong>Analytical Cookies:</strong> Used to understand Platform usage patterns (page views, session duration, feature usage). Anonymised and aggregated.</>} />
                  <Li c={<><strong>Marketing Cookies:</strong> Used to personalise content and show relevant promotions. You may opt out from your browser settings or account preferences.</>} />
                  <Li c="ADDies uses standard web technologies including cookies, local storage, and session storage to maintain Platform state and improve user experience." />
                  <Li c="Third-party tools (e.g., Google Analytics, Firebase) may set their own cookies subject to their respective privacy policies." />
                </Ul>
                <Box color="violet">Disabling essential cookies will prevent you from using core Platform features including login and booking. ADDies is not responsible for Platform malfunction caused by cookie blocking.</Box>
              </Accord></div>

              {/* 12 */}
              <div id="pp12"><Accord num="12" title="Data Security">
                <Ul>
                  <Li c="ADDies implements industry-standard technical and organisational security measures to protect personal data against unauthorised access, disclosure, alteration, or destruction." />
                  <Li c="Sensitive data (KYC documents, bank details) is stored with encryption at rest and in transit using TLS/SSL protocols." />
                  <Li c="Access to personal data within ADDies is restricted on a need-to-know basis and subject to strict internal policies." />
                  <Li c="ADDies conducts periodic security reviews and vulnerability assessments of the Platform." />
                  <Li c="In the event of a personal data breach that poses risk to data principals, ADDies will notify affected users and the Data Protection Board as required by DPDPA 2023 and DPDP Rules 2025 — without undue delay and within legally prescribed timelines." />
                </Ul>
                <Box color="red">Despite best efforts, no online platform can guarantee 100% security. ADDies is not liable for unauthorised access resulting from: (a) your failure to maintain account security; (b) attacks beyond reasonable mitigation measures; or (c) third-party breaches beyond ADDies' control. You use the Platform at your own risk.</Box>
              </Accord></div>

              {/* 13 */}
              <div id="pp13"><Accord num="13" title="Children's Data">
                <Ul>
                  <Li c="The Platform is intended for users who are 18 years of age or older. ADDies does not knowingly collect personal data from minors." />
                  <Li c="If we discover that personal data has been collected from a minor without verifiable parental consent, we will delete such data promptly." />
                  <Li c="Parents or guardians who believe their child's data has been collected should contact us immediately at the email below." />
                </Ul>
              </Accord></div>

              {/* 14 */}
              <div id="pp14"><Accord num="14" title="Third-Party Links & Services">
                <Ul>
                  <Li c="The Platform may contain links to third-party websites or services (payment gateways, social media, etc.). ADDies is not responsible for the privacy practices of these third parties." />
                  <Li c="Once you leave the Platform via a third-party link, this Privacy Policy no longer applies. You are subject to the privacy policy of the third party." />
                  <Li c="ADDies does not endorse or make representations about third-party privacy practices." />
                </Ul>
              </Accord></div>

              {/* 15 */}
              <div id="pp15"><Accord num="15" title="Changes to This Privacy Policy">
                <Ul>
                  <Li c="ADDies reserves the right to update this Privacy Policy at any time. The updated Policy will be published on the Platform with the revised effective date." />
                  <Li c="For material changes that significantly affect your rights, ADDies will notify you via email or in-app notification where practicable." />
                  <Li c="Continued use of the Platform after the effective date of any revised Policy constitutes your acceptance of the changes." />
                  <Li c="ADDies recommends that you review this Policy periodically." />
                </Ul>
                <Box color="violet">If you do not agree to any revised Privacy Policy, you must stop using the Platform and may request account deletion.</Box>
              </Accord></div>

              {/* 16 */}
              <div id="pp16"><Accord num="16" title="Grievance Officer — Contact for Privacy Concerns">
                <p>In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, ADDies has designated a Grievance Officer for data-related complaints:</p>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Grievance Officer</p>
                      <p className="text-sm font-bold text-slate-700">{COMPANY}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✉️</span>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Email</p>
                      <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-sm font-bold text-violet-600 hover:underline">{GRIEVANCE_EMAIL}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Address</p>
                      <p className="text-sm font-bold text-slate-700">{JURISDICTION}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Response Time</p>
                      <p className="text-sm font-bold text-slate-700">Within 30 days of receipt of complaint</p>
                    </div>
                  </div>
                </div>
                <Box color="violet">If you are not satisfied with our response, you have the right to escalate the matter to the <strong>Data Protection Board of India</strong> as established under the DPDPA 2023.</Box>
              </Accord></div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-12 px-4 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <Lock size={28} className="text-violet-500 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-2">
              Your data is protected under India's DPDPA 2023 framework.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              For privacy concerns: <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-violet-600 font-bold hover:underline">{GRIEVANCE_EMAIL}</a>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate("/terms")} className="px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-all shadow-md">Terms & Conditions →</button>
              <button onClick={() => navigate("/contact-us")} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:border-violet-300 transition-all">Contact ADDies</button>
            </div>
          </Reveal>
        </div>
      </section>

    </PublicLayout>
  );
}
