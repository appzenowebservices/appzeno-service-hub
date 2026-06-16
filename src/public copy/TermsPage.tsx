// src/pages/public/TermsPage.tsx
// Place at:  src/pages/public/TermsPage.tsx
// App.tsx:   <Route path="/terms" element={<TermsPage />} />

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import { ChevronDown, ChevronRight, Shield, Users, Store, UserCheck, Lock, Scale } from "lucide-react";

const EFFECTIVE    = "1 March 2026";
const COMPANY      = "APPZENO WEB SERVICES PRIVATE LIMITED";
const PLATFORM     = "ADDies ServiceHub";
const EMAIL        = "contact@appzenowebservices.com";
const JURISDICTION = "Lucknow, Uttar Pradesh, India";

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
    <div className={`rounded-2xl border overflow-hidden transition-all mb-3 ${open ? "border-sky-200 shadow-sm" : "border-slate-100 hover:border-slate-200 bg-white"}`}>
      <button onClick={() => setOpen(o => !o)} className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left ${open ? "bg-sky-50" : "bg-white hover:bg-slate-50"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-black px-2.5 py-1 rounded-lg flex-shrink-0 ${open ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>{num}</span>
          <span className={`font-black text-sm leading-snug ${open ? "text-sky-800" : "text-slate-700"}`}>{title}</span>
        </div>
        <ChevronDown size={15} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-3 bg-white border-t border-slate-50"><div className="space-y-3 text-sm text-slate-600 leading-relaxed">{children}</div></div>}
    </div>
  );
}

const Li = ({ c }: { c: React.ReactNode }) => <li className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed"><ChevronRight size={13} className="text-sky-500 flex-shrink-0 mt-0.5" /><span>{c}</span></li>;
const Ul = ({ children }: { children: React.ReactNode }) => <ul className="space-y-2 ml-1">{children}</ul>;
const Box = ({ children, color = "sky" }: { children: React.ReactNode; color?: "sky" | "red" | "amber" | "green" }) => {
  const m = { sky: "bg-sky-50 border-l-4 border-sky-500 text-sky-900", red: "bg-red-50 border-l-4 border-red-500 text-red-900", amber: "bg-amber-50 border-l-4 border-amber-500 text-amber-900", green: "bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900" };
  return <div className={`rounded-r-xl px-4 py-3 text-xs font-bold leading-relaxed ${m[color]}`}>{children}</div>;
};

type RF = "all" | "customer" | "vendor" | "agent";
const TABS = [
  { key: "all" as RF, label: "All Roles", icon: Shield },
  { key: "customer" as RF, label: "Customers", icon: Users },
  { key: "vendor" as RF, label: "Vendors", icon: Store },
  { key: "agent" as RF, label: "City Agents", icon: UserCheck },
];

export default function TermsPage() {
  const [role, setRole] = useState<RF>("all");
  const navigate = useNavigate();
  const show = (r: RF) => role === "all" || role === r;
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 25% 60%, #0ea5e9 0%, transparent 55%)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/30 rounded-full px-4 py-1.5 mb-6">
            <Scale size={12} className="text-sky-400" />
            <span className="text-sky-300 text-xs font-bold tracking-widest uppercase">Legal Agreement · {EFFECTIVE}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-2px" }}>
            Terms & <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">Conditions</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-3">These Terms govern your use of <strong className="text-white">{PLATFORM}</strong>, owned and operated by <strong className="text-white">{COMPANY}</strong>. By using the Platform, you unconditionally accept these Terms.</p>
          <p className="text-sky-400 text-xs font-bold">Effective: {EFFECTIVE} · Jurisdiction: {JURISDICTION}</p>
        </div>
      </section>

      {/* ROLE FILTER */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex-shrink-0 mr-2">View for:</span>
          {TABS.map(t => { const Icon = t.icon; const active = role === t.key; return (
            <button key={t.key} onClick={() => setRole(t.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 border transition-all ${active ? "bg-sky-600 text-white border-transparent shadow" : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"}`}>
              <Icon size={12} />{t.label}
            </button>
          ); })}
        </div>
      </div>

      {/* CONTENT */}
      <section className="py-12 px-4 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-20">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contents</p>
                <nav className="space-y-0.5">
                  {["Definitions","Acceptance","Platform Role","Account Security","Customer Terms","Vendor Terms","Agent Terms","Payments & Fees","Cancellations & Refunds","Dispute Resolution","Liability Limit","Intellectual Property","Data & Privacy","Prohibited Conduct","Indemnification","Termination","Governing Law","General"].map((item, i) => (
                    <a key={item} href={`#tc${i+1}`} className="flex items-center gap-2 py-1 px-2 rounded-lg text-xs text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition-colors">
                      <span className="text-slate-300 font-bold w-5 flex-shrink-0">{String(i+1).padStart(2,"0")}</span>{item}
                    </a>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <button onClick={() => navigate("/privacy")} className="block text-xs text-sky-600 font-bold hover:underline w-full text-left">→ Privacy Policy</button>
                  <button onClick={() => navigate("/contact")} className="block text-xs text-slate-500 font-bold hover:underline w-full text-left">→ Contact ADDies</button>
                </div>
              </div>
            </aside>

            {/* Sections */}
            <div className="lg:col-span-3">

              <div id="tc1"><Accord num="01" title="Definitions & Parties" open>
                <Ul>
                  <Li c={<><strong>"Company" / "ADDies" / "We"</strong> — {COMPANY}, sole owner and operator of {PLATFORM}.</>} />
                  <Li c={<><strong>"Platform"</strong> — The {PLATFORM} website, mobile app, APIs, and all related services.</>} />
                  <Li c={<><strong>"Customer"</strong> — A registered user who books home services through the Platform.</>} />
                  <Li c={<><strong>"Vendor" / "Service Professional"</strong> — An independent professional or business offering home services on the Platform.</>} />
                  <Li c={<><strong>"City Agent" / "Agent"</strong> — An authorised city-level representative responsible for vendor onboarding and city operations.</>} />
                  <Li c={<><strong>"Service"</strong> — Any home service on the Platform: AC servicing, cleaning, plumbing, electrical, pest control, painting, carpentry, appliance repair.</>} />
                  <Li c={<><strong>"Booking"</strong> — A confirmed service appointment created by a Customer via the Platform.</>} />
                  <Li c={<><strong>"Platform Fee"</strong> — Commission charged by ADDies to Vendors on each completed Booking.</>} />
                  <Li c={<><strong>"Subscription"</strong> — Recurring plan purchased by Vendors to access leads and Platform features.</>} />
                  <Li c={<><strong>"KYC"</strong> — Identity verification: Aadhaar, PAN, and address proof.</>} />
                  <Li c={<><strong>"Payout"</strong> — Earnings transferred by ADDies to a Vendor's bank account.</>} />
                </Ul>
              </Accord></div>

              <div id="tc2"><Accord num="02" title="Acceptance & Binding Effect">
                <p>By registering on, accessing, or using the Platform in any capacity, you confirm that you have read, understood, and unconditionally agreed to be bound by these Terms, our Privacy Policy, and all ADDies policies.</p>
                <Ul>
                  <Li c="You are at least 18 years of age and legally competent to enter binding contracts under the Indian Contract Act, 1872." />
                  <Li c="If registering for an entity, you warrant that you have authority to bind that entity." />
                  <Li c="Mere access to the Platform, even without registration, constitutes acceptance of these Terms for browsing-level use." />
                </Ul>
                <Box color="red">IF YOU DO NOT AGREE TO THESE TERMS, STOP USING THE PLATFORM IMMEDIATELY. CONTINUED USE AFTER ANY UPDATE CONSTITUTES FULL ACCEPTANCE OF REVISED TERMS. ADDIES RESERVES THE RIGHT TO MODIFY THESE TERMS AT ANY TIME WITHOUT PRIOR NOTICE.</Box>
              </Accord></div>

              <div id="tc3"><Accord num="03" title="Platform as Intermediary — Disclaimer">
                <Box color="amber">ADDies operates solely as a technology intermediary under the Information Technology Act, 2000. ADDies is NOT a service provider, employer, franchisor, or principal of any Vendor.</Box>
                <Ul>
                  <Li c="The contractual relationship for each booking exists exclusively between the Customer and Vendor. ADDies is not a party to that contract." />
                  <Li c="ADDies does not guarantee quality, safety, legality, timeliness, or outcome of any service performed by any Vendor." />
                  <Li c="Vendors are independent contractors — not employees, agents, or partners of ADDies." />
                  <Li c="ADDies bears zero liability for property damage, personal injury, financial loss, or any other harm arising from Vendor services." />
                  <Li c="ADDies may at its sole discretion assist in dispute mediation, but such assistance does not create liability or obligation on ADDies." />
                  <Li c="Any reliance on Vendor profiles, ratings, or descriptions is entirely at the User's own risk." />
                </Ul>
              </Accord></div>

              <div id="tc4"><Accord num="04" title="Account Registration & Security">
                <Ul>
                  <Li c="Registration requires accurate, complete, and current information. You are solely responsible for all activity under your account." />
                  <Li c="You must not share credentials. ADDies is not liable for any loss from unauthorised access caused by your failure to maintain security." />
                  <Li c="One active account per individual or entity. Duplicates will be permanently deactivated without notice." />
                  <Li c="ADDies may require re-verification of identity at any time at its sole discretion." />
                  <Li c="ADDies reserves the absolute right to suspend or permanently delete any account without prior notice for any reason it deems appropriate." />
                  <Li c="ADDies has no obligation to restore deleted accounts or return associated data, earnings, or credits." />
                </Ul>
                <Box color="red">Account suspension or termination by ADDies is final. No compensation, notice period, or explanation is owed unless required by applicable Indian law.</Box>
              </Accord></div>

              {show("customer") && <div id="tc5">
                <div className="flex items-center gap-2 mt-6 mb-2"><span className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-xs font-black text-violet-700 uppercase tracking-widest">Customer Terms</span></div>
                <Accord num="05" title="Customer Obligations & Platform Rights">
                  <Ul>
                    <Li c="You will provide accurate address, contact, and service details. Errors from inaccurate information are solely your responsibility." />
                    <Li c="An adult (18+) must be present at the service location for the entire duration of the service." />
                    <Li c="You must NOT engage a Vendor met through the Platform for services outside the Platform. This constitutes circumvention of ADDies' Platform Fee and will result in permanent ban and legal action for damages." />
                    <Li c="Abusive, threatening, or harassing behaviour towards Vendors will result in immediate account suspension and may be reported to law enforcement." />
                    <Li c="False, fabricated, or exaggerated complaints are grounds for permanent ban. ADDies reserves the right to pursue civil and criminal remedies against fraudulent complainants." />
                    <Li c="Reviews must be based on genuine bookings only. False reviews may be removed without notice and may lead to account termination." />
                    <Li c="Non-payment after service completion is treated as fraud. ADDies may pursue recovery through debt collection and legal proceedings." />
                    <Li c="ADDies may alter, suspend, or discontinue any service category, pricing, or promotional offer at any time without notice or liability to Customers." />
                    <Li c="Promotional credits, cashback, and wallet balances are granted at ADDies' sole discretion and may be withdrawn or modified at any time without notice." />
                  </Ul>
                  <Box color="sky">ADDies' sole obligation to a Customer is facilitating the booking of a service. Any dispute regarding service quality is between the Customer and the Vendor only.</Box>
                </Accord>
              </div>}

              {show("vendor") && <div id="tc6">
                <div className="flex items-center gap-2 mt-6 mb-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Vendor Terms</span></div>
                <Accord num="06" title="Vendor Obligations, Rights & Restrictions">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Independent Contractor</p>
                      <Ul>
                        <Li c="You are an independent contractor. Nothing in this Agreement creates employment, agency, partnership, franchise, or joint-venture with ADDies." />
                        <Li c="ADDies does not provide tools, equipment, or insurance. You are responsible for your own resources and professional liability." />
                        <Li c="ADDies does not set your working hours, but acceptance and completion rates directly affect platform ranking and lead allocation." />
                      </Ul>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">KYC & Verification</p>
                      <Ul>
                        <Li c="Mandatory KYC must be completed before account activation. Submission of false or forged documents is a criminal offence and will result in permanent deactivation and reporting to law enforcement." />
                        <Li c="ADDies may conduct re-KYC at any time. Non-compliance within 7 days results in account suspension." />
                        <Li c="ADDies does not guarantee activation of any vendor account. Rejection is at ADDies' sole discretion with no reasons owed." />
                      </Ul>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Job Performance</p>
                      <Ul>
                        <Li c="Accepted bookings must be completed as scheduled. Abandonment or no-show attracts a penalty deducted from the next payout and may result in account suspension." />
                        <Li c="You are solely responsible for quality, safety, workmanship, and outcome of all services delivered. Any damage, injury, or legal claim is entirely your liability." />
                        <Li c="Demanding additional payment beyond the agreed booking amount is grounds for immediate permanent deactivation." />
                        <Li c="You must carry valid photo ID to every booking. Refusal to present ID on Customer request may be treated as a security incident." />
                      </Ul>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Platform Compliance</p>
                      <Ul>
                        <Li c="You must not solicit or serve Customers met through the Platform outside the Platform for 24 months post their first booking with you. Violation entitles ADDies to claim liquidated damages of ₹50,000 per incident." />
                        <Li c="ADDies may deactivate your account for ratings below 3.5★, dispute rate above 5%, complaints, subscription lapse, KYC non-compliance, or any conduct harmful to ADDies." />
                        <Li c="Platform Fee and commission rates are set solely by ADDies and may be modified with 15 days' notice. Continued use constitutes acceptance." />
                        <Li c="Profile visibility, lead allocation, and ranking are determined entirely by ADDies' algorithms. ADDies has no obligation to guarantee any minimum leads, bookings, or earnings." />
                        <Li c="You grant ADDies a perpetual, irrevocable, royalty-free worldwide licence to use your profile photo, name, service description, and reviews for marketing in any medium." />
                      </Ul>
                    </div>
                  </div>
                  <Box color="red">Vendors who commit fraud, falsify documents, harm customers, or violate Platform policies will be permanently deactivated. Outstanding payout may be withheld and forfeited. ADDies will report such Vendors to police and regulatory authorities.</Box>
                  <Box color="sky">ADDies' decision on all vendor matters — suspension, deactivation, payout disputes, lead allocation — is final, conclusive, and not subject to appeal.</Box>
                </Accord>
              </div>}

              {show("agent") && <div id="tc7">
                <div className="flex items-center gap-2 mt-6 mb-2"><span className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-xs font-black text-orange-700 uppercase tracking-widest">City Agent Terms</span></div>
                <Accord num="07" title="City Agent Obligations, Duties & Restrictions">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Appointment & Status</p>
                      <Ul>
                        <Li c="You are appointed as a non-exclusive, revocable city-level agent. This does not constitute employment, franchise, or partnership with ADDies." />
                        <Li c="ADDies may appoint additional agents in your city at its sole discretion without notice or compensation to you." />
                        <Li c="You may not sub-appoint or transfer agency rights to any third party without prior written approval from ADDies." />
                      </Ul>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">KYC Responsibility</p>
                      <Ul>
                        <Li c="You are fully responsible for accurate KYC of every vendor you onboard. Any fraudulent vendor registered under your account is your direct liability." />
                        <Li c="ADDies may recover all financial losses caused by fraudulent vendors onboarded by you — from pending commissions or via legal proceedings." />
                        <Li c="You must maintain physical copies of all vendor KYC documents for 3 years and produce them within 48 hours of ADDies' request." />
                      </Ul>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Conduct & Confidentiality</p>
                      <Ul>
                        <Li c="You must not represent yourself as an employee, officer, or director of ADDies or APPZENO WEB SERVICES PRIVATE LIMITED." />
                        <Li c="All Platform data, vendor data, and customer data are strictly confidential. Sharing or selling such data is a criminal offence. ADDies will pursue all available legal remedies." />
                        <Li c="You must not engage in any activity competing with ADDies in your city during the term and for 12 months after termination." />
                        <Li c="Any marketing using the ADDies brand requires prior written approval. Unauthorised use of ADDies trademarks violates IP law and these Terms." />
                      </Ul>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Commission & Termination</p>
                      <Ul>
                        <Li c="Commission is per your separate Agent Agreement. ADDies may revise rates at any time with 30 days' notice." />
                        <Li c="Commission is payable only on verified completed bookings. Disputed or refunded bookings result in commission clawback." />
                        <Li c="ADDies may terminate your agency at any time without notice. You are entitled only to earned commissions up to the termination date. No other compensation, goodwill, or severance is payable." />
                        <Li c="Upon termination, you must immediately cease use of ADDies branding, return all materials, and delete all confidential data." />
                      </Ul>
                    </div>
                  </div>
                  <Box color="red">ADDies' decisions on agent territory, commission, and termination are final. Agents who commit fraud, breach confidentiality, or engage in competitive activity will be terminated immediately with full civil and criminal remedies pursued.</Box>
                </Accord>
              </div>}

              <div id="tc8">
                <div className="flex items-center gap-2 mt-6 mb-2"><span className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Common Terms (All Roles)</span></div>
                <Accord num="08" title="Payments, Fees & Subscriptions">
                  <Ul>
                    <Li c="Payments are processed through third-party gateways (Razorpay or similar). ADDies does not store card or bank details." />
                    <Li c={<>Vendor Subscription fees are <strong>fully non-refundable</strong> once a billing cycle commences, regardless of usage, suspension, or city availability.</>} />
                    <Li c="ADDies reserves the absolute right to modify Platform Fees, subscription pricing, and commission structures at any time with effect from the notified date." />
                    <Li c="ADDies is not liable for losses caused by payment gateway failure, network error, or technical disruption." />
                    <Li c="ADDies may hold, delay, or withhold Vendor payouts during open disputes, fraud investigations, or compliance reviews. This decision is final." />
                    <Li c="Payout timelines are indicative only. ADDies is not liable for delays caused by banking systems or third parties." />
                    <Li c="GST and all applicable taxes on vendor-rendered services are solely the Vendor's responsibility." />
                  </Ul>
                  <Box color="sky">In any discrepancy between amounts displayed and amounts charged, ADDies' internal records shall be the definitive and final reference.</Box>
                </Accord>
              </div>

              <div id="tc9"><Accord num="09" title="Cancellations & Refund Policy">
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Customer Cancellations</p>
                    <Ul>
                      <Li c={<>Free cancellation permitted up to <strong>2 hours before</strong> the scheduled booking.</>} />
                      <Li c={<>Cancellations within 2 hours attract a fee of <strong>₹100 or 20% of booking value</strong> (whichever is higher) at ADDies' discretion.</>} />
                      <Li c={<>Customer no-shows (Vendor arrives on time, Customer absent) will be charged the <strong>full booking amount</strong>. No refund under any circumstance.</>} />
                      <Li c="ADDies may cancel any booking at any time for operational reasons. Full refund will be issued in 5–7 business days in such cases." />
                      <Li c="ADDies is not responsible for losses incurred by a Customer due to Platform or Vendor cancellation." />
                    </Ul>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Refund Policy</p>
                    <Ul>
                      <Li c={<>Refund requests must be raised within <strong>48 hours</strong> of service completion via the Platform's dispute system. Late requests will not be entertained.</>} />
                      <Li c={<>Refunds are issued <strong>solely at ADDies' discretion</strong> following investigation. ADDies' decision is final and binding.</>} />
                      <Li c={<>Approved refunds will be processed in <strong>5–7 business days</strong>. ADDies is not liable for bank-side delays.</>} />
                      <Li c={<>Subscription fees, Platform Fees, and convenience charges are <strong>strictly non-refundable</strong> under all circumstances.</>} />
                      <Li c="Cosmetic damage or missing item claims not reported before the Vendor leaves the premises will not be entertained." />
                      <Li c="Partial refunds may be issued at ADDies' sole discretion for partially completed services. The refund amount is determined solely by ADDies." />
                    </Ul>
                  </div>
                </div>
                <Box color="red">Repeated or fraudulent refund/cancellation claims will result in permanent account termination. ADDies reserves the right to pursue legal action for damages.</Box>
              </Accord></div>

              <div id="tc10"><Accord num="10" title="Dispute Resolution">
                <Ul>
                  <Li c="All disputes must first be raised through ADDies' Platform dispute mechanism. No external legal action may be initiated without exhausting this process." />
                  <Li c={<>ADDies' dispute team will review evidence and issue a verdict within <strong>72 hours</strong>. This verdict is <strong>final and binding</strong> on the Customer and Vendor.</>} />
                  <Li c="ADDies is not a party to any Customer-Vendor dispute. It is not liable for the outcome or losses incurred by either party." />
                  <Li c="ADDies' dispute decisions do not constitute admission of any liability on its part." />
                  <Li c="For disputes escalated beyond the Platform, exclusive jurisdiction lies with the courts at Lucknow, Uttar Pradesh, India." />
                </Ul>
                <Box color="amber">ADDies reserves the right to refuse to process a dispute deemed frivolous, fraudulent, or in bad faith. Such users may be permanently banned.</Box>
              </Accord></div>

              <div id="tc11"><Accord num="11" title="Limitation of Liability">
                <Box color="red">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE INDIAN LAW, {COMPANY.toUpperCase()} AND THE {PLATFORM.toUpperCase()} PLATFORM SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, CONSEQUENTIAL, OR EXEMPLARY DAMAGES OF ANY NATURE, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE PLATFORM OR ANY SERVICE.</Box>
                <p>This includes without limitation:</p>
                <Ul>
                  <Li c="Property damage, personal injury, or death caused by a Vendor's service." />
                  <Li c="Loss of revenue, profit, business, data, or goodwill by any Vendor, Agent, or Customer." />
                  <Li c="Platform downtime, technical errors, data loss, or security breaches." />
                  <Li c="Conduct or omissions of Vendors, Agents, payment processors, or logistics partners." />
                  <Li c="Force majeure events: acts of God, pandemics, floods, fires, government actions, internet outages, or civil unrest." />
                  <Li c="Unauthorised access to your account caused by your failure to maintain security." />
                  <Li c="Any outcome of ADDies' dispute resolution process." />
                </Ul>
                <Box color="sky">In all circumstances, ADDies' total aggregate liability shall not exceed the Platform Fee actually received from the specific booking giving rise to the claim. This cap applies even if ADDies has been advised of the possibility of such damages.</Box>
              </Accord></div>

              <div id="tc12"><Accord num="12" title="Intellectual Property">
                <Ul>
                  <Li c={<>All Platform content — name, logo, design, software, text, images, trademarks — is the exclusive property of {COMPANY} protected under Indian IP laws.</>} />
                  <Li c="No user may copy, reproduce, redistribute, modify, or create derivative works from any Platform content without prior written consent from ADDies." />
                  <Li c="'ADDies' and 'ADDies ServiceHub' trademarks may not be used in any communication without prior written approval from ADDies." />
                  <Li c="Vendors grant ADDies a perpetual, irrevocable, worldwide, royalty-free licence to use profile content, photos, and reviews for Platform and marketing purposes in any medium." />
                  <Li c="All feedback, ideas, and suggestions submitted by users become the exclusive property of ADDies without any obligation to compensate the submitter." />
                </Ul>
              </Accord></div>

              <div id="tc13"><Accord num="13" title="Data & Privacy">
                <Ul>
                  <Li c="By using the Platform, you consent to collection, processing, and use of your personal data as described in ADDies' Privacy Policy." />
                  <Li c="ADDies may share your data with Vendors (for booking fulfillment), payment processors, law enforcement, and regulatory authorities as required by law." />
                  <Li c="ADDies may use usage data and booking history for analytics, product improvement, and targeted marketing." />
                  <Li c="Data rights (access, correction, erasure) are as provided under the DPDPA 2023, subject to ADDies' legal retention obligations." />
                </Ul>
                <p>Full details are in our <button onClick={() => navigate("/privacy")} className="text-sky-600 font-bold hover:underline">Privacy Policy →</button></p>
              </Accord></div>

              <div id="tc14"><Accord num="14" title="Prohibited Conduct">
                <p>The following are strictly prohibited and grounds for immediate permanent termination and legal action:</p>
                <Ul>
                  <Li c="Using the Platform for illegal, fraudulent, or criminal activity." />
                  <Li c="Impersonating any person, entity, or ADDies representative." />
                  <Li c="Attempting to hack, reverse-engineer, scrape, or disrupt the Platform." />
                  <Li c="Posting false, defamatory, abusive, or misleading content." />
                  <Li c="Collecting or harvesting user data without authorisation." />
                  <Li c="Using automated bots or scripts to access the Platform." />
                  <Li c="Circumventing Platform Fees by arranging off-platform transactions." />
                  <Li c="Creating multiple accounts to exploit promotions, credits, or dispute outcomes." />
                </Ul>
              </Accord></div>

              <div id="tc15"><Accord num="15" title="Indemnification">
                <p>You agree to fully indemnify, defend, and hold harmless {COMPANY}, its directors, officers, employees, and agents from all claims, damages, losses, costs, and legal fees arising from:</p>
                <Ul>
                  <Li c="Your use of or access to the Platform." />
                  <Li c="Your violation of any provision of these Terms or any applicable law." />
                  <Li c="Any service you perform as a Vendor, including customer claims for damage, injury, or loss." />
                  <Li c="Any fraudulent, negligent, or wilful misconduct on your part." />
                  <Li c="Any content you submit, post, or transmit through the Platform." />
                </Ul>
                <Box color="sky">This indemnification obligation survives the termination of your account and these Terms.</Box>
              </Accord></div>

              <div id="tc16"><Accord num="16" title="Termination">
                <Ul>
                  <Li c="ADDies may suspend or permanently terminate any account at any time, without prior notice or liability, for any reason it deems appropriate." />
                  <Li c="Upon termination, your right to use the Platform and all licences terminate immediately." />
                  <Li c="ADDies has no obligation to retain data, profiles, reviews, or history beyond legally required retention periods." />
                  <Li c="No refund of subscription fees or advance payments is owed upon termination unless required by Indian law." />
                  <Li c="Vendors terminated for fraud or misconduct forfeit all pending commissions. ADDies may pursue financial recovery." />
                  <Li c="Account deletion requests will be processed within 30 days, subject to legal, financial, and compliance retention requirements." />
                </Ul>
                <Box color="red">ADDies' termination decision is final. No explanation, compensation, or notice period is owed beyond what is required by applicable Indian law.</Box>
              </Accord></div>

              <div id="tc17"><Accord num="17" title="Governing Law & Jurisdiction">
                <Ul>
                  <Li c="These Terms are governed exclusively by the laws of the Republic of India." />
                  <Li c={<>All disputes are subject to exclusive jurisdiction of the courts at <strong>Lucknow, Uttar Pradesh, India</strong>.</>} />
                  <Li c={<>Before any legal proceedings, the disputing party must serve written notice to ADDies at <strong>{EMAIL}</strong> and allow 30 days for resolution.</>} />
                  <Li c="These Terms comply with: IT Act 2000, IT Intermediary Guidelines 2021, Consumer Protection Act 2019, E-Commerce Rules 2020, DPDPA 2023, DPDP Rules 2025, Indian Contract Act 1872." />
                </Ul>
              </Accord></div>

              <div id="tc18"><Accord num="18" title="General Provisions">
                <Ul>
                  <Li c="Amendments: ADDies may revise Terms at any time. Continued use constitutes acceptance." />
                  <Li c="Severability: If any clause is invalid, remaining Terms continue in full force." />
                  <Li c="Waiver: ADDies' failure to enforce any provision is not a waiver of that right." />
                  <Li c="Entire Agreement: These Terms and Privacy Policy constitute the entire agreement, superseding all prior communications." />
                  <Li c="Assignment: You may not assign rights without ADDies' written consent. ADDies may assign at any time without notice." />
                  <Li c="Language: These Terms are in English. In case of conflict with any translation, English prevails." />
                  <Li c="Survival: IP, indemnification, liability limitation, and governing law clauses survive termination." />
                </Ul>
                <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                  <p className="text-xs text-slate-500 mb-1">Questions? Contact us at</p>
                  <a href={`mailto:${EMAIL}`} className="text-sm font-bold text-sky-600 hover:underline">{EMAIL}</a>
                  <p className="text-xs text-slate-400 mt-1">{COMPANY} · {JURISDICTION}</p>
                </div>
              </Accord></div>

            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <Lock size={28} className="text-sky-500 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-6">These Terms protect the integrity of the ADDies platform. Please also read our Privacy Policy.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate("/privacy")} className="px-6 py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500 transition-all shadow-md">Privacy Policy →</button>
              <button onClick={() => navigate("/contact")} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:border-sky-300 transition-all">Contact ADDies</button>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
}
