// src/pages/public/HowItWorksPage.tsx
// Place at:  src/pages/public/HowItWorksPage.tsx
// App.tsx mein:  <Route path="/how-it-works" element={<HowItWorksPage />} />

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";

// ── Scroll Reveal ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CUSTOMER_STEPS = [
  {
    num: "01", icon: "📍", title: "Select Your City",
    body: "Open ADDies and choose your city from our growing list — Ghaziabad, Delhi, Noida, Lucknow, Kanpur, and Varanasi. More cities being added every month.",
    tip: "City se hi relevant vendors aur pricing dikhti hai.",
  },
  {
    num: "02", icon: "🔍", title: "Choose a Service",
    body: "Browse from 8+ home service categories — AC Service, Deep Cleaning, Plumbing, Electrical, Pest Control, Painting, Carpentry, and Appliance Repair.",
    tip: "Har category mein transparent pricing listed hai — koi hidden charges nahi.",
  },
  {
    num: "03", icon: "📋", title: "Book in 2 Minutes",
    body: "Select a time slot that works for you. Add your address. Confirm the booking. That's it — the whole process takes under 2 minutes.",
    tip: "Same-day booking available for most services in your area.",
  },
  {
    num: "04", icon: "✅", title: "Verified Pro Arrives",
    body: "A KYC-verified, background-checked service professional arrives at your doorstep at the scheduled time. You'll receive their name, photo, and contact before arrival.",
    tip: "Saare vendors ADDies ke KYC process se verified hain.",
  },
  {
    num: "05", icon: "⭐", title: "Pay After & Rate",
    body: "Pay only after the job is completed to your satisfaction. Rate the vendor and leave a review. Your feedback directly affects vendor ranking on the platform.",
    tip: "UPI, Cash, and Card — all payment modes accepted.",
  },
];

const VENDOR_STEPS = [
  {
    num: "01", icon: "📝", title: "Register Online",
    body: "Fill out the vendor registration form with your basic details — name, service category, city, and contact. Takes less than 5 minutes.",
  },
  {
    num: "02", icon: "🪪", title: "Complete KYC",
    body: "Submit your Aadhaar, PAN, and address proof. Our agent verifies your documents within 24–48 hours. This keeps the platform trusted for customers.",
  },
  {
    num: "03", icon: "📦", title: "Choose a Plan",
    body: "Pick a subscription plan that fits your business size. Plans start at an affordable monthly fee — and include lead access, booking management, and support.",
  },
  {
    num: "04", icon: "📲", title: "Receive Job Leads",
    body: "Start receiving real job leads from customers in your city and service area. Accept jobs you want, skip ones that don't work for your schedule.",
  },
  {
    num: "05", icon: "💰", title: "Complete & Get Paid",
    body: "Complete the job, collect payment, and your earnings are settled directly to your bank account on a weekly/fortnightly payout cycle.",
  },
];

const FAQS = [
  {
    q: "Are all vendors on ADDies verified?",
    a: "Yes. Every vendor on ADDies goes through a mandatory KYC verification process — Aadhaar, PAN, and address proof are checked before they're allowed on the platform. Verified badge dikhta hai har approved vendor ke profile par.",
  },
  {
    q: "What if the vendor doesn't show up or does poor work?",
    a: "We have a dedicated dispute resolution system. If a vendor doesn't show up or the work quality is unsatisfactory, you can raise a dispute from your dashboard. Our team reviews it within 24 hours and refunds are processed within 48 hours when the complaint is valid.",
  },
  {
    q: "Is there a cancellation fee?",
    a: "You can cancel a booking for free up to 2 hours before the scheduled time. Late cancellations (under 2 hours) may incur a small fee to compensate the vendor for their travel time.",
  },
  {
    q: "How is the pricing decided?",
    a: "All service prices are standardised and displayed upfront before booking. Prices are set per category and city — so you always know what you'll pay. No hidden charges, no surprise add-ons.",
  },
  {
    q: "In which cities is ADDies available?",
    a: "Currently live in Ghaziabad, Delhi, Noida, Lucknow, Kanpur, and Varanasi. We're expanding to more cities — if your city isn't listed, register your interest and we'll notify you when we launch.",
  },
  {
    q: "Can vendors choose which jobs to accept?",
    a: "Yes. Vendors receive job leads and can choose to accept or pass on any booking. This flexibility allows vendors to manage their schedule while keeping the platform's response rates high.",
  },
  {
    q: "How does payment work for vendors?",
    a: "Customers pay for the service (cash, UPI, or card). ADDies collects the platform fee and releases vendor payouts on a weekly or fortnightly cycle directly to their registered bank account.",
  },
  {
    q: "What is ADDies ServiceHub and who operates it?",
    a: "ADDies ServiceHub is a home-services booking platform owned and operated by APPZENO WEB SERVICES PRIVATE LIMITED — a registered Indian private limited company. It is an independent platform not affiliated with any other brand unless stated.",
  },
];

const TRUST_POINTS = [
  { icon: "🔒", title: "KYC Verified Vendors",    body: "Every vendor verified before listing. Aadhaar + PAN checked." },
  { icon: "💸", title: "Transparent Pricing",      body: "Full price shown before booking. Zero hidden charges." },
  { icon: "🛡️", title: "Dispute Protection",       body: "Raise a dispute anytime. Refunds in 48 hours." },
  { icon: "⭐", title: "Rated by Real Customers",  body: "All reviews from verified bookings — no fake ratings." },
  { icon: "📲", title: "Live Job Tracking",        body: "Know when your vendor is on the way." },
  { icon: "🤝", title: "Fair for Vendors Too",     body: "Fair payouts, transparent commissions, no exploitation." },
];

const SERVICES = [
  { icon: "❄️", name: "AC Service",      desc: "Gas refill, servicing, installation" },
  { icon: "🧹", name: "Deep Cleaning",   desc: "Home, kitchen, bathroom deep clean"  },
  { icon: "🔧", name: "Plumbing",        desc: "Leaks, pipework, fittings"           },
  { icon: "⚡", name: "Electrical",      desc: "Wiring, fitting, repair"             },
  { icon: "🐛", name: "Pest Control",    desc: "Cockroach, termite, rodent control"  },
  { icon: "🎨", name: "Painting",        desc: "Interior, exterior, texture paint"   },
  { icon: "🪚", name: "Carpentry",       desc: "Furniture repair & installation"     },
  { icon: "🔌", name: "Appliance Repair",desc: "TV, washing machine, fridge repair"  },
];

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all
      ${open ? "border-sky-200 bg-sky-50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
        <span className={`text-sm font-bold leading-snug transition-colors
          ${open ? "text-sky-700" : "text-slate-800"}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
          text-sm font-black transition-all
          ${open ? "bg-sky-600 text-white rotate-45" : "bg-slate-100 text-slate-500"}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"customer" | "vendor">("customer");

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 py-24 px-4">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 25% 60%, #0ea5e9 0%, transparent 50%), radial-gradient(circle at 75% 30%, #8b5cf6 0%, transparent 45%)" }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/30
            rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            <span className="text-sky-300 text-xs font-bold tracking-widest uppercase">Simple. Safe. Reliable.</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white leading-none mb-5"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "-2px" }}>
            How{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
              ADDies Works
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Book a trusted home-service professional in under 2 minutes.
            Verified vendors. Transparent pricing. Pay after the job is done.
          </p>

          {/* Tab switcher */}
          <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-2xl p-1.5 gap-1">
            <button onClick={() => setActiveTab("customer")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                ${activeTab === "customer"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                  : "text-white/70 hover:text-white"}`}>
              👤 For Customers
            </button>
            <button onClick={() => setActiveTab("vendor")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                ${activeTab === "vendor"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "text-white/70 hover:text-white"}`}>
              🏪 For Vendors
            </button>
          </div>
        </div>
      </section>

      {/* ── STEP BY STEP ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* Customer steps */}
          {activeTab === "customer" && (
            <div>
              <Reveal className="text-center mb-14">
                <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Customer Journey</span>
                <h2 className="text-4xl font-black text-slate-900 mt-2"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  Book a Service in 5 Easy Steps
                </h2>
              </Reveal>
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-8 md:left-10 top-10 bottom-10 w-0.5
                  bg-gradient-to-b from-sky-200 via-sky-300 to-sky-100 hidden md:block" />
                <div className="space-y-6">
                  {CUSTOMER_STEPS.map((step, i) => (
                    <Reveal key={step.num} delay={i * 80}>
                      <div className="flex gap-5 md:gap-8 items-start">
                        {/* Step circle */}
                        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl
                          bg-sky-600 text-white flex flex-col items-center justify-center
                          shadow-lg shadow-sky-200 relative z-10">
                          <span className="text-xl">{step.icon}</span>
                          <span className="text-xs font-black opacity-70 mt-0.5">{step.num}</span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 bg-slate-50 rounded-2xl p-5 border border-slate-100
                          hover:border-sky-200 hover:bg-sky-50 transition-all">
                          <h3 className="font-black text-slate-800 text-lg mb-2">{step.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed mb-3">{step.body}</p>
                          <div className="inline-flex items-center gap-2 bg-sky-100 rounded-full px-3 py-1">
                            <span className="text-sky-500 text-xs">💡</span>
                            <span className="text-xs font-bold text-sky-700">{step.tip}</span>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
              <Reveal delay={200} className="text-center mt-12">
                <button onClick={() => navigate("/register/customer")}
                  className="px-8 py-4 rounded-2xl bg-sky-600 text-white font-black text-sm
                    hover:bg-sky-500 transition-all shadow-xl shadow-sky-200 hover:scale-105">
                  📋 Book Your First Service — Free
                </button>
              </Reveal>
            </div>
          )}

          {/* Vendor steps */}
          {activeTab === "vendor" && (
            <div>
              <Reveal className="text-center mb-14">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Vendor Journey</span>
                <h2 className="text-4xl font-black text-slate-900 mt-2"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  Start Earning with ADDies in 5 Steps
                </h2>
              </Reveal>
              <div className="relative">
                <div className="absolute left-8 md:left-10 top-10 bottom-10 w-0.5
                  bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-100 hidden md:block" />
                <div className="space-y-6">
                  {VENDOR_STEPS.map((step, i) => (
                    <Reveal key={step.num} delay={i * 80}>
                      <div className="flex gap-5 md:gap-8 items-start">
                        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl
                          bg-emerald-600 text-white flex flex-col items-center justify-center
                          shadow-lg shadow-emerald-200 relative z-10">
                          <span className="text-xl">{step.icon}</span>
                          <span className="text-xs font-black opacity-70 mt-0.5">{step.num}</span>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-2xl p-5 border border-slate-100
                          hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                          <h3 className="font-black text-slate-800 text-lg mb-2">{step.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
              <Reveal delay={200} className="text-center mt-12">
                <button onClick={() => navigate("/register/vendor")}
                  className="px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm
                    hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-200 hover:scale-105">
                  🏪 Register as Vendor — It's Free
                </button>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      {/* ── SERVICES WE OFFER ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">What We Cover</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              8 Home Service Categories
            </h2>
            <p className="text-slate-500 mt-3 text-sm">All services available across our 6 operational cities</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICES.map((svc, i) => (
              <Reveal key={svc.name} delay={i * 50}>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center
                  hover:shadow-md hover:-translate-y-1 hover:border-sky-200 transition-all cursor-default">
                  <div className="text-3xl mb-3">{svc.icon}</div>
                  <p className="font-black text-slate-800 text-sm">{svc.name}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{svc.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TRUST ADDIES ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Why ADDies</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              Built on Trust
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRUST_POINTS.map((t, i) => (
              <Reveal key={t.title} delay={i * 60}>
                <div className="flex items-start gap-4 bg-slate-50 border border-slate-100
                  rounded-2xl p-5 hover:border-sky-200 hover:bg-sky-50 transition-all h-full">
                  <span className="text-2xl flex-shrink-0">{t.icon}</span>
                  <div>
                    <p className="font-black text-slate-800 mb-1">{t.title}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{t.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING NOTE ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-br from-sky-600 to-blue-800">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center">
            <div className="text-4xl mb-4">💸</div>
            <h2 className="text-3xl font-black text-white mb-4"
              style={{ fontFamily: "'Georgia', serif" }}>
              Transparent Pricing — Always
            </h2>
            <p className="text-sky-100 leading-relaxed mb-6 text-sm">
              Every service on ADDies has a clearly listed price before you book. What you see is what you pay —
              no surprise charges at the door, no negotiation headaches. Prices are standardised per city
              and category so every customer gets the same fair deal.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "No Booking Fee",    icon: "✅" },
                { label: "No Hidden Charges", icon: "✅" },
                { label: "Pay After Job",     icon: "✅" },
              ].map(b => (
                <div key={b.label}
                  className="bg-white/10 border border-white/20 rounded-2xl py-4 px-3 text-center">
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <p className="text-xs font-bold text-white">{b.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">FAQs</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              Frequently Asked Questions
            </h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 40}>
                <FAQItem q={faq.q} a={faq.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl font-black text-slate-900 mb-4"
              style={{ fontFamily: "'Georgia', serif" }}>
              Ready to Get Started?
            </h2>
            <p className="text-slate-500 mb-10 leading-relaxed">
              Join thousands of happy customers — or grow your business as an ADDies verified vendor.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate("/register/customer")}
                className="px-8 py-4 rounded-2xl bg-sky-600 text-white font-black text-sm
                  hover:bg-sky-500 transition-all shadow-xl shadow-sky-200 hover:scale-105">
                📋 Book a Service Now
              </button>
              <button onClick={() => navigate("/register/vendor")}
                className="px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-black text-sm
                  hover:border-sky-400 hover:text-sky-700 transition-all">
                🏪 Join as a Vendor
              </button>
            </div>
          </Reveal>
        </div>
      </section>

    </PublicLayout>
  );
}
