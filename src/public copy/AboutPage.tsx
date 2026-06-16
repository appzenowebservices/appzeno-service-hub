// src/pages/public/AboutPage.tsx
// Place this file at: src/pages/public/AboutPage.tsx
// Register in App.tsx:  <Route path="/about" element={<AboutPage />} />

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(to / 60);
      const timer = setInterval(() => {
        start += step;
        if (start >= to) { setVal(to); clearInterval(timer); }
        else setVal(start);
      }, 24);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

// ── Reveal on scroll ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 300,   suffix: "+",  label: "Active Vendors",       icon: "🏪" },
  { value: 12000, suffix: "+",  label: "Bookings Completed",   icon: "📋" },
  { value: 6,     suffix: "",   label: "Cities & Growing",     icon: "🏙️" },
  { value: 98,    suffix: "%",  label: "Satisfaction Rate",    icon: "⭐" },
];

const TIMELINE = [
  {
    year: "2024",
    icon: "🌱",
    title: "The Idea",
    body: "Founders of APPZENO WEB SERVICES PRIVATE LIMITED noticed a clear gap — skilled home-service workers had no trusted digital platform in Tier-2 & Tier-3 cities. The concept of ADDies ServiceHub was born.",
  },
  {
    year: "2025",
    icon: "⚙️",
    title: "Building the Platform",
    body: "Platform development began. Categories like AC Service, Cleaning, Plumbing, Electrical, Pest Control, and Painting were mapped. Ghaziabad and Delhi were chosen as launch cities.",
  },
  {
    year: "2026",
    icon: "🚀",
    title: "Live & Scaling",
    body: "ADDies ServiceHub went live. 300+ verified vendors onboarded. 6 cities operational. Thousands of customers booking trusted home services every month — and growing fast.",
  },
  {
    year: "Future",
    icon: "🌏",
    title: "Vision: 50 Cities",
    body: "Expanding across all of Uttar Pradesh, then pan-India. The goal is to become the most trusted home-services platform for every Indian household.",
  },
];

const VALUES = [
  { icon: "🇮🇳", title: "Bharat First",        body: "Every feature is built for the real India — Tier-2 and Tier-3 cities, regional languages, and the way Indians actually book services." },
  { icon: "🔒", title: "Verified & Trusted",   body: "Every vendor goes through KYC verification before they appear on our platform. Your home, your safety — non-negotiable." },
  { icon: "💸", title: "Zero Hidden Charges",  body: "The price you see is the price you pay. No surprise fees, no last-minute add-ons. Full transparency at every step." },
  { icon: "⚡", title: "Speed & Reliability",  body: "Book in under 2 minutes. Our dispatch system ensures vendors arrive on time, every time. We measure and improve relentlessly." },
  { icon: "🤝", title: "Fair to Vendors",      body: "We believe vendors are partners, not resources. Fair payouts, transparent commissions, and growth opportunities for every service professional." },
  { icon: "🛡️", title: "Dispute Protection",   body: "Dedicated dispute resolution team. Refunds processed within 48 hours when a vendor doesn't deliver. Customer money is always safe." },
];

const SERVICES = [
  { icon: "❄️", name: "AC Service"      },
  { icon: "🧹", name: "Deep Cleaning"   },
  { icon: "🔧", name: "Plumbing"        },
  { icon: "⚡", name: "Electrical"      },
  { icon: "🐛", name: "Pest Control"    },
  { icon: "🎨", name: "Painting"        },
  { icon: "🪚", name: "Carpentry"       },
  { icon: "🔌", name: "Appliance Repair"},
];

const TEAM = [
  { initials: "VG", name: "Vikas Gupta",        role: "Founder & CEO",         color: "from-sky-500 to-blue-700"      },
  { initials: "PG", name: "Priyanka Gupta",     role: "Managing Director",     color: "from-violet-500 to-purple-700" },
  { initials: "PY", name: "Prince Yadav",       role: "Director & Operations", color: "from-emerald-500 to-teal-700"  },
  { initials: "NG", name: "Nischal Gupta",      role: "Director & Technology", color: "from-orange-500 to-red-600"    },
  { initials: "PT", name: "Priyanshu Tripathi", role: "Tech Lead",             color: "from-pink-500 to-rose-700"     },
];

const CITIES = ["Ghaziabad", "Delhi", "Noida", "Lucknow", "Kanpur", "Varanasi"];

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 py-28 px-4">

        {/* Background mesh */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0ea5e9 0%, transparent 55%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 45%)" }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative max-w-5xl mx-auto text-center">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/30
            rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            <span className="text-sky-300 text-xs font-bold tracking-widest uppercase">
              Operated by APPZENO WEB SERVICES PRIVATE LIMITED
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-6"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "-2px" }}>
            About{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                ADDies
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-sky-400 rounded-full opacity-60" />
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-4">
            India's trusted home-services platform — connecting verified professionals
            with households across Bharat's fastest-growing cities.
          </p>
          <p className="text-sm text-slate-500 font-mono mb-12">
            A product of{" "}
            <a href="https://www.appzenowebservices.com" target="_blank" rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline transition-colors">
              APPZENO WEB SERVICES PRIVATE LIMITED
            </a>
          </p>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate("/register/vendor")}
              className="px-7 py-3.5 rounded-2xl bg-sky-500 text-white font-bold text-sm
                hover:bg-sky-400 transition-all shadow-xl shadow-sky-500/30 hover:scale-105">
              🏪 Join as Vendor
            </button>
            <button onClick={() => navigate("/register/customer")}
              className="px-7 py-3.5 rounded-2xl border border-white/20 text-white font-bold text-sm
                hover:bg-white/10 transition-all">
              📋 Book a Service
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 py-14 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <div className="text-4xl mb-2">{s.icon}</div>
              <p className="text-3xl font-black text-slate-900">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm text-slate-500 font-medium mt-1">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WHO WE ARE ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <Reveal>
              <div className="inline-flex items-center gap-2 bg-sky-100 rounded-full px-4 py-1.5 mb-6">
                <span className="text-sky-600 text-xs font-black tracking-widest uppercase">Who We Are</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight mb-6"
                style={{ fontFamily: "'Georgia', serif" }}>
                Making Home Services{" "}
                <span className="text-sky-600">Simple, Safe</span>{" "}
                & Affordable
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                <strong>ADDies ServiceHub</strong> is a home-services booking platform owned and operated
                by <strong>APPZENO WEB SERVICES PRIVATE LIMITED</strong>. We connect Indian households
                with verified local service professionals for everything from AC servicing to deep cleaning,
                plumbing, electrical repairs, pest control, and more.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                We started with a simple observation — finding a reliable, fairly-priced service professional
                in Indian cities is unnecessarily hard. There was no trusted platform that vetted workers,
                showed transparent pricing, and stood behind the quality of work done.
              </p>
              <p className="text-slate-600 leading-relaxed">
                ADDies was built to fix exactly that. Today we operate across <strong>6 cities</strong> with
                over <strong>300 verified vendors</strong> — and we're just getting started.
              </p>
            </Reveal>

            {/* Right: service grid */}
            <Reveal delay={150}>
              <div className="grid grid-cols-4 gap-3">
                {SERVICES.map((svc, i) => (
                  <div key={svc.name}
                    className="bg-white rounded-2xl border border-slate-100 p-3 text-center
                      hover:shadow-md hover:-translate-y-1 transition-all cursor-default"
                    style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="text-2xl mb-1">{svc.icon}</div>
                    <p className="text-xs font-bold text-slate-600 leading-tight">{svc.name}</p>
                  </div>
                ))}
              </div>

              {/* Cities */}
              <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cities We Serve</p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(c => (
                    <span key={c}
                      className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-full
                        text-xs font-bold text-sky-700">
                      🏙️ {c}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full
                    text-xs font-bold text-emerald-700">
                    + More Coming
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Our Purpose</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              Mission & Vision
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission */}
            <Reveal delay={0}>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-blue-800 p-8 text-white h-full">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-2xl font-black mb-3">Our Mission</h3>
                  <p className="text-sky-100 leading-relaxed text-sm">
                    To make high-quality home services accessible to every Indian household — with
                    transparent pricing, verified professionals, and a booking experience so simple
                    it takes under 2 minutes.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 bg-white/15 rounded-full
                    px-4 py-2 text-xs font-bold">
                    🚀 50 cities by 2027
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Vision */}
            <Reveal delay={120}>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white h-full">
                <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full -translate-y-12 translate-x-12" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-sky-500/10 rounded-full translate-y-8 -translate-x-8" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🌏</div>
                  <h3 className="text-2xl font-black mb-3">Our Vision</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    To become India's most trusted home-services marketplace — where every local
                    service professional can build a sustainable livelihood and every customer can
                    trust the person entering their home.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 bg-sky-500/20 rounded-full
                    px-4 py-2 text-xs font-bold text-sky-300">
                    🇮🇳 Har Ghar ADDies
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── OUR JOURNEY ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Timeline</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              Our Journey
            </h2>
          </Reveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-sky-200
              hidden sm:block md:-translate-x-0.5" />

            <div className="space-y-8">
              {TIMELINE.map((t, i) => (
                <Reveal key={t.year} delay={i * 100}>
                  <div className={`relative flex gap-6 items-start
                    ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>

                    {/* Icon bubble (center on desktop) */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2
                      w-12 h-12 rounded-full bg-sky-600 text-white text-xl
                      items-center justify-center shadow-lg shadow-sky-200 z-10">
                      {t.icon}
                    </div>

                    {/* Card */}
                    <div className={`flex-1 bg-white rounded-2xl border border-slate-100 p-6
                      shadow-sm hover:shadow-md transition-shadow
                      ${i % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl md:hidden">{t.icon}</span>
                        <span className="text-xs font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                          {t.year}
                        </span>
                        <h3 className="font-black text-slate-800">{t.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{t.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">What Drives Us</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              Our Core Values
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div className="group bg-slate-50 hover:bg-sky-50 border border-slate-100
                  hover:border-sky-200 rounded-2xl p-6 transition-all hover:shadow-md
                  hover:-translate-y-1 cursor-default h-full">
                  <div className="text-3xl mb-4">{v.icon}</div>
                  <h3 className="font-black text-slate-800 mb-2 group-hover:text-sky-700 transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-sky-950 to-slate-900">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl font-black text-white mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              How ADDies Works
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "1", icon: "🔍", title: "Browse",     body: "Search for the service you need — AC, cleaning, plumbing, and more."    },
              { step: "2", icon: "📋", title: "Book",        body: "Pick a time slot. See transparent pricing. Confirm in under 2 minutes." },
              { step: "3", icon: "✅", title: "Verified Pro", body: "A KYC-verified professional arrives at your home, on time."             },
              { step: "4", icon: "⭐", title: "Rate & Pay",  body: "Pay after the job is done. Rate the vendor. Simple and safe."           },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 80}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center
                  hover:bg-white/10 transition-all h-full">
                  <div className="w-8 h-8 rounded-full bg-sky-500 text-white text-xs font-black
                    flex items-center justify-center mx-auto mb-4">
                    {s.step}
                  </div>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-black text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE TEAM ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">The People</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              Meet the Team
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
              The team behind APPZENO WEB SERVICES PRIVATE LIMITED — building ADDies with passion
              for India's home-services market.
            </p>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-5">
            {TEAM.map((t, i) => (
              <Reveal key={t.name} delay={i * 70}>
                <div className="bg-white rounded-3xl border border-slate-100 p-6 text-center
                  hover:shadow-xl hover:-translate-y-2 transition-all w-44">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${t.color}
                    flex items-center justify-center text-white text-xl font-black
                    mx-auto mb-4 shadow-lg`}>
                    {t.initials}
                  </div>
                  <p className="font-black text-slate-800 text-sm leading-tight">{t.name}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-tight">{t.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEGAL / COMPANY NOTE ─────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Company Information</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                <strong>"ADDies ServiceHub"</strong> is owned and operated by{" "}
                <strong>APPZENO WEB SERVICES PRIVATE LIMITED</strong>, a registered private limited
                company incorporated in India. ADDies is an independent digital home-services platform
                and is not affiliated with, associated with, endorsed by, or connected to any other
                brand, company, or service unless explicitly stated.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <a href="mailto:contact@appzenowebservices.com"
                  className="flex items-center gap-2 text-sky-600 font-bold hover:underline">
                  ✉️ contact@appzenowebservices.com
                </a>
                <a href="https://www.apnidesidukaan.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sky-600 font-bold hover:underline">
                  🌐 apnidesidukaan.com
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-sky-600 to-blue-800">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl font-black text-white mb-4"
              style={{ fontFamily: "'Georgia', serif" }}>
              Ready to Experience ADDies?
            </h2>
            <p className="text-sky-100 mb-10 text-lg leading-relaxed">
              Join thousands of happy customers across 6 cities — or grow your business as a verified vendor.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate("/register/customer")}
                className="px-8 py-4 rounded-2xl bg-white text-sky-700 font-black text-sm
                  hover:bg-sky-50 transition-all shadow-xl hover:scale-105">
                📋 Book Your First Service
              </button>
              <button onClick={() => navigate("/register/vendor")}
                className="px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-black text-sm
                  hover:bg-white/10 transition-all">
                🏪 Register as Vendor
              </button>
              <button onClick={() => navigate("/register/agent")}
                className="px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-black text-sm
                  hover:bg-white/10 transition-all">
                👤 Become an Agent
              </button>
            </div>
          </Reveal>
        </div>
      </section>

    </PublicLayout>
  );
}
