// src/pages/public/ContactPage.tsx
// Place at:  src/pages/public/ContactPage.tsx
// App.tsx:   <Route path="/contact" element={<ContactPage />} />
//
// ─── EMAILJS SETUP (one-time, 5 minutes) ────────────────────────────────────
// 1. Go to https://www.emailjs.com → Sign up free
// 2. Dashboard → Email Services → Add Service → Gmail
//    Connect: contact@appzenowebservices.com
//    Copy the Service ID  →  paste as EMAILJS_SERVICE_ID below
// 3. Dashboard → Email Templates → Create Template
//    Subject:  "{{form_type}} — ADDies Contact Form"
//    Body:     paste this:
//    -------------------------------------------------------
//    Form Type:  {{form_type}}
//    From Name:  {{from_name}}
//    Email:      {{from_email}}
//    Phone:      {{phone}}
//    City:       {{city}}
//    Subject:    {{subject}}
//    Message:    {{message}}
//    Extra Data: {{extra}}
//    -------------------------------------------------------
//    To Email: contact@appzenowebservices.com
//    Copy the Template ID  →  paste as EMAILJS_TEMPLATE_ID below
// 4. Dashboard → Account → API Keys
//    Copy Public Key  →  paste as EMAILJS_PUBLIC_KEY below
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle2,
  MessageSquare, HelpCircle, UserPlus, Building2,
  Star, AlertCircle, ChevronDown,
} from "lucide-react";

// ── REPLACE THESE WITH YOUR EMAILJS CREDENTIALS ───────────────────────────────
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";    // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";   // e.g. "template_xyz789"
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";     // e.g. "user_AbCdEfGhIj"
// ─────────────────────────────────────────────────────────────────────────────

// ── Scroll Reveal ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type FormType = "general" | "feedback" | "query" | "registration" | "franchise" | "vendor" | "complaint";

interface FormState {
  name:     string;
  email:    string;
  phone:    string;
  city:     string;
  subject:  string;
  message:  string;
  // feedback
  rating:   number;
  // registration / vendor query
  role:     string;
  service:  string;
  // franchise
  invest:   string;
  experience: string;
  // complaint
  bookingId: string;
  priority:  string;
}

const EMPTY: FormState = {
  name: "", email: "", phone: "", city: "", subject: "", message: "",
  rating: 0, role: "", service: "", invest: "", experience: "",
  bookingId: "", priority: "normal",
};

const CITIES = ["Ghaziabad", "Delhi", "Noida", "Lucknow", "Kanpur", "Varanasi", "Other"];
const SERVICES = ["AC Service", "Deep Cleaning", "Plumbing", "Electrical", "Pest Control", "Painting", "Carpentry", "Appliance Repair", "Other"];
const INVEST_OPTIONS = ["₹1L – ₹3L", "₹3L – ₹5L", "₹5L – ₹10L", "₹10L+"];

// ── Form type configs ─────────────────────────────────────────────────────────
const FORM_TABS: { key: FormType; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { key: "general",      label: "General",       icon: MessageSquare, color: "sky",     desc: "Any general enquiry or message"            },
  { key: "feedback",     label: "Feedback",      icon: Star,          color: "amber",   desc: "Share your experience with ADDies"          },
  { key: "query",        label: "Query",         icon: HelpCircle,    color: "violet",  desc: "Questions about services or pricing"        },
  { key: "registration", label: "Registration",  icon: UserPlus,      color: "emerald", desc: "Customer / Vendor / Agent registration help"},
  { key: "vendor",       label: "Vendor Query",  icon: Building2,     color: "blue",    desc: "Questions about joining as a service vendor"},
  { key: "franchise",    label: "Franchise",     icon: Building2,     color: "orange",  desc: "Open ADDies franchise in your city"         },
  { key: "complaint",    label: "Complaint",     icon: AlertCircle,   color: "red",     desc: "Raise a complaint about a booking"          },
];

const COLOR_MAP: Record<string, { btn: string; badge: string; ring: string; text: string }> = {
  sky:     { btn: "bg-sky-600 hover:bg-sky-500",     badge: "bg-sky-100 text-sky-700",     ring: "focus:ring-sky-300",     text: "text-sky-600"     },
  amber:   { btn: "bg-amber-500 hover:bg-amber-400", badge: "bg-amber-100 text-amber-700", ring: "focus:ring-amber-300",   text: "text-amber-600"   },
  violet:  { btn: "bg-violet-600 hover:bg-violet-500",badge:"bg-violet-100 text-violet-700",ring:"focus:ring-violet-300", text: "text-violet-600"  },
  emerald: { btn: "bg-emerald-600 hover:bg-emerald-500",badge:"bg-emerald-100 text-emerald-700",ring:"focus:ring-emerald-300",text:"text-emerald-600"},
  blue:    { btn: "bg-blue-600 hover:bg-blue-500",   badge: "bg-blue-100 text-blue-700",   ring: "focus:ring-blue-300",    text: "text-blue-600"    },
  orange:  { btn: "bg-orange-500 hover:bg-orange-400",badge:"bg-orange-100 text-orange-700",ring:"focus:ring-orange-300", text: "text-orange-600"  },
  red:     { btn: "bg-red-600 hover:bg-red-500",     badge: "bg-red-100 text-red-700",     ring: "focus:ring-red-300",     text: "text-red-600"     },
};

// ── Shared input classes ──────────────────────────────────────────────────────
const INPUT = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all";
const LABEL = "block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5";

// ── Select component ──────────────────────────────────────────────────────────
function Select({ value, onChange, options, placeholder, ring }: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; ring: string;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`${INPUT} ${ring} appearance-none pr-10 cursor-pointer`}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="text-3xl transition-transform hover:scale-125">
            {n <= (hovered || value) ? "⭐" : "☆"}
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="text-sm font-bold text-amber-600 ml-1">
            {labels[hovered || value]}
          </span>
        )}
      </div>
    </div>
  );
}

// ── EmailJS send ──────────────────────────────────────────────────────────────
async function sendEmail(formType: string, data: FormState): Promise<void> {
  // Build extra fields string based on form type
  let extra = "";
  if (formType === "feedback")     extra = `Rating: ${data.rating}/5`;
  if (formType === "registration" || formType === "vendor") extra = `Role: ${data.role} | Service: ${data.service}`;
  if (formType === "franchise")    extra = `Investment: ${data.invest} | Experience: ${data.experience}`;
  if (formType === "complaint")    extra = `Booking ID: ${data.bookingId} | Priority: ${data.priority}`;

  const templateParams = {
    form_type:  FORM_TABS.find(f => f.key === formType)?.label ?? formType,
    from_name:  data.name,
    from_email: data.email,
    phone:      data.phone,
    city:       data.city,
    subject:    data.subject || formType,
    message:    data.message,
    extra,
    to_email:   "contact@appzenowebservices.com",
  };

  // Dynamic import of emailjs (loaded from CDN via script tag)
  // Using window.emailjs if available, otherwise import
  const emailjs = (window as any).emailjs;
  if (!emailjs) throw new Error("EmailJS not loaded");

  const result = await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY,
  );
  if (result.status !== 200) throw new Error("Send failed");
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [activeForm, setActiveForm] = useState<FormType>("general");
  const [form,       setForm]       = useState<FormState>(EMPTY);
  const [status,     setStatus]     = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg,   setErrorMsg]   = useState("");

  const currentTab = FORM_TABS.find(t => t.key === activeForm)!;
  const colors     = COLOR_MAP[currentTab.color];

  function setField(key: keyof FormState, val: string | number) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function resetForm() {
    setForm(EMPTY);
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg("Please fill in Name, Email and Message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (activeForm === "feedback" && form.rating === 0) {
      setErrorMsg("Please select a rating.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      await sendEmail(activeForm, form);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Failed to send. Please try emailing us directly at contact@appzenowebservices.com");
    }
  }

  // ── Load EmailJS from CDN ───────────────────────────────────────────────
  useEffect(() => {
    if ((window as any).emailjs) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 py-20 px-4">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0ea5e9 0%, transparent 50%), radial-gradient(circle at 80% 30%, #6366f1 0%, transparent 45%)" }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            <span className="text-sky-300 text-xs font-bold tracking-widest uppercase">We're here to help</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-none"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "-2px" }}>
            Contact{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
              ADDies
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto">
            Got a question, feedback, complaint or franchise enquiry?
            Choose the right form below — we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* ── CONTACT INFO STRIP ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: Mail,    label: "Email Us",      value: "contact@appzenowebservices.com", href: "mailto:contact@appzenowebservices.com", color: "sky"     },
            { icon: Phone,   label: "Call Us",        value: "+91 9511123564",                href: "tel:+919511123564",                    color: "emerald" },
            { icon: Clock,   label: "Working Hours",  value: "Mon–Sat, 9 AM – 7 PM",          href: null,                                   color: "violet"  },
          ].map(({ icon: Icon, label, value, href, color }) => (
            <Reveal key={label}>
              <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  bg-${color}-100`}>
                  <Icon size={18} className={`text-${color}-600`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-bold text-slate-800 hover:text-sky-600 transition-colors truncate block">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-slate-800">{value}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── MAIN FORM SECTION ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">

          <Reveal className="text-center mb-10">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Get in Touch</span>
            <h2 className="text-3xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              Choose Your Query Type
            </h2>
            <p className="text-slate-500 text-sm mt-2">Select the form that matches your need</p>
          </Reveal>

          {/* Form type tabs — scrollable */}
          <Reveal delay={80}>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1">
              {FORM_TABS.map(tab => {
                const Icon   = tab.icon;
                const active = activeForm === tab.key;
                const c      = COLOR_MAP[tab.color];
                return (
                  <button key={tab.key}
                    onClick={() => { setActiveForm(tab.key); resetForm(); }}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
                      text-xs font-bold border transition-all whitespace-nowrap
                      ${active
                        ? `${c.btn} text-white border-transparent shadow-md`
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                    <Icon size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── FORM CARD ────────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <Reveal delay={100}>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className={`px-6 py-5 border-b border-slate-100 flex items-center gap-3`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLOR_MAP[currentTab.color].badge}`}>
                      <currentTab.icon size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{currentTab.label} Form</p>
                      <p className="text-xs text-slate-500">{currentTab.desc}</p>
                    </div>
                  </div>

                  {/* ── SUCCESS STATE ─────────────────────────────────── */}
                  {status === "success" ? (
                    <div className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} className="text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 mb-2">Message Sent!</h3>
                      <p className="text-sm text-slate-500 mb-1">
                        Your {currentTab.label.toLowerCase()} has been sent to
                      </p>
                      <p className="text-sm font-bold text-sky-600 mb-6">contact@appzenowebservices.com</p>
                      <p className="text-xs text-slate-400 mb-8">We'll get back to you within 24 hours.</p>
                      <button onClick={resetForm}
                        className={`px-6 py-3 rounded-xl text-white font-bold text-sm ${colors.btn} transition-all`}>
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

                      {/* ── COMMON FIELDS ────────────────────────────── */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={LABEL}>Full Name *</label>
                          <input value={form.name} onChange={e => setField("name", e.target.value)}
                            placeholder="Your full name"
                            className={`${INPUT} ${colors.ring}`} />
                        </div>
                        <div>
                          <label className={LABEL}>Email Address *</label>
                          <input type="email" value={form.email} onChange={e => setField("email", e.target.value)}
                            placeholder="your@email.com"
                            className={`${INPUT} ${colors.ring}`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={LABEL}>Phone Number</label>
                          <input type="tel" value={form.phone} onChange={e => setField("phone", e.target.value)}
                            placeholder="+91 98765 43210"
                            className={`${INPUT} ${colors.ring}`} />
                        </div>
                        <div>
                          <label className={LABEL}>City</label>
                          <Select value={form.city} onChange={v => setField("city", v)}
                            options={CITIES} placeholder="Select your city" ring={colors.ring} />
                        </div>
                      </div>

                      {/* ── FEEDBACK: Star rating ─────────────────────── */}
                      {activeForm === "feedback" && (
                        <div>
                          <label className={LABEL}>Your Rating *</label>
                          <StarRating value={form.rating} onChange={v => setField("rating", v)} />
                        </div>
                      )}

                      {/* ── REGISTRATION / VENDOR: Role + Service ────── */}
                      {(activeForm === "registration" || activeForm === "vendor") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>
                              {activeForm === "vendor" ? "Business Type" : "Register As"}
                            </label>
                            <Select value={form.role} onChange={v => setField("role", v)}
                              options={activeForm === "vendor"
                                ? ["Individual Professional", "Small Business", "Agency/Company"]
                                : ["Customer", "Vendor / Service Professional", "City Agent"]}
                              placeholder="Select role" ring={colors.ring} />
                          </div>
                          <div>
                            <label className={LABEL}>Service Category</label>
                            <Select value={form.service} onChange={v => setField("service", v)}
                              options={SERVICES} placeholder="Select service" ring={colors.ring} />
                          </div>
                        </div>
                      )}

                      {/* ── FRANCHISE: Investment + Experience ───────── */}
                      {activeForm === "franchise" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Investment Capacity</label>
                            <Select value={form.invest} onChange={v => setField("invest", v)}
                              options={INVEST_OPTIONS} placeholder="Select range" ring={colors.ring} />
                          </div>
                          <div>
                            <label className={LABEL}>Business Experience</label>
                            <Select value={form.experience} onChange={v => setField("experience", v)}
                              options={["No experience", "1–2 years", "2–5 years", "5+ years"]}
                              placeholder="Select experience" ring={colors.ring} />
                          </div>
                        </div>
                      )}

                      {/* ── COMPLAINT: Booking ID + Priority ─────────── */}
                      {activeForm === "complaint" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Booking ID</label>
                            <input value={form.bookingId} onChange={e => setField("bookingId", e.target.value)}
                              placeholder="e.g. BK-2602-0035"
                              className={`${INPUT} ${colors.ring}`} />
                          </div>
                          <div>
                            <label className={LABEL}>Priority</label>
                            <Select value={form.priority} onChange={v => setField("priority", v)}
                              options={["Low — General feedback", "Normal — Need resolution", "High — Urgent issue", "Critical — Money at stake"]}
                              placeholder="Select priority" ring={colors.ring} />
                          </div>
                        </div>
                      )}

                      {/* Subject — for general / query / franchise */}
                      {["general", "query", "franchise"].includes(activeForm) && (
                        <div>
                          <label className={LABEL}>Subject</label>
                          <input value={form.subject} onChange={e => setField("subject", e.target.value)}
                            placeholder="Brief subject of your message"
                            className={`${INPUT} ${colors.ring}`} />
                        </div>
                      )}

                      {/* Message */}
                      <div>
                        <label className={LABEL}>
                          {activeForm === "feedback"   ? "Your Feedback *" :
                           activeForm === "complaint"  ? "Describe the Issue *" :
                           activeForm === "franchise"  ? "Tell Us About Yourself *" :
                           "Message *"}
                        </label>
                        <textarea value={form.message} onChange={e => setField("message", e.target.value)}
                          rows={5} placeholder={
                            activeForm === "feedback"   ? "Share your experience with ADDies — what went well, what can improve…" :
                            activeForm === "complaint"  ? "Describe your complaint in detail — what happened, when, which vendor…" :
                            activeForm === "franchise"  ? "Tell us about your background, target city, and why you want to partner with ADDies…" :
                            activeForm === "vendor"     ? "Tell us about your services, experience, and which areas you cover…" :
                            "Type your message here…"
                          }
                          className={`${INPUT} ${colors.ring} resize-none`} />
                      </div>

                      {/* Error */}
                      {errorMsg && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-red-700">{errorMsg}</p>
                        </div>
                      )}

                      {/* Submit */}
                      <button type="submit" disabled={status === "sending"}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl
                          text-white font-black text-sm transition-all shadow-lg
                          ${colors.btn}
                          ${status === "sending" ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.01]"}`}>
                        {status === "sending" ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            Send {currentTab.label} to ADDies
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-slate-400">
                        Sent to{" "}
                        <span className="font-bold text-slate-600">contact@appzenowebservices.com</span>
                        {" "}· We reply within 24 hours
                      </p>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>

            {/* ── SIDEBAR ──────────────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Quick links */}
              <Reveal delay={120}>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Other Forms</p>
                  <div className="space-y-2">
                    {FORM_TABS.filter(t => t.key !== activeForm).map(tab => {
                      const Icon = tab.icon;
                      const c    = COLOR_MAP[tab.color];
                      return (
                        <button key={tab.key}
                          onClick={() => { setActiveForm(tab.key); resetForm(); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-left hover:bg-slate-50 transition-colors group">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                            ${c.badge} flex-shrink-0`}>
                            <Icon size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 group-hover:text-sky-700 transition-colors">
                              {tab.label}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{tab.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Reveal>

              {/* Address */}
              <Reveal delay={150}>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Office</p>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-sky-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-600 leading-relaxed">
                      <p className="font-bold text-slate-800">APPZENO WEB SERVICES</p>
                      <p>PRIVATE LIMITED</p>
                      <p className="mt-1">Lucknow, Uttar Pradesh</p>
                      <p>India — 226001</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Response SLA */}
              <Reveal delay={180}>
                <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl p-5 text-white">
                  <p className="text-xs text-white uppercase tracking-widest opacity-70 mb-3">Response Time</p>
                  {[
                    { type: "General Query",  time: "< 24 hours" },
                    { type: "Complaint",      time: "< 12 hours" },
                    { type: "Franchise",      time: "< 48 hours" },
                    { type: "Vendor Query",   time: "< 24 hours" },
                  ].map(r => (
                    <div key={r.type} className="flex items-center justify-between py-1.5
                      border-b border-white/10 last:border-0">
                      <span className="text-xs text-sky-100">{r.type}</span>
                      <span className="text-xs font-black">{r.time}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Direct email note */}
              <Reveal delay={200}>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-amber-700 mb-1">Direct Email</p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    For urgent issues, email us directly at{" "}
                    <a href="mailto:contact@appzenowebservices.com"
                      className="font-bold underline break-all">
                      contact@appzenowebservices.com
                    </a>
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP / LOCATION SECTION ────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Where We Operate</span>
            <h2 className="text-3xl font-black text-slate-900 mt-2"
              style={{ fontFamily: "'Georgia', serif" }}>
              Our Service Cities
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { city: "Ghaziabad", status: "active",   vendors: "87 vendors"  },
                { city: "Delhi",     status: "active",   vendors: "124 vendors" },
                { city: "Noida",     status: "active",   vendors: "64 vendors"  },
                { city: "Lucknow",   status: "active",   vendors: "48 vendors"  },
                { city: "Kanpur",    status: "active",   vendors: "32 vendors"  },
                { city: "Varanasi",  status: "launching",vendors: "Coming soon" },
              ].map(c => (
                <div key={c.city}
                  className={`rounded-2xl border p-4 text-center transition-all hover:-translate-y-1
                    ${c.status === "active"
                      ? "bg-sky-50 border-sky-200 hover:shadow-md"
                      : "bg-slate-50 border-slate-200 opacity-70"}`}>
                  <div className="text-2xl mb-1">🏙️</div>
                  <p className="text-sm font-black text-slate-800">{c.city}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.vendors}</p>
                  <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full
                    ${c.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"}`}>
                    {c.status === "active" ? "Live" : "Soon"}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </PublicLayout>
  );
}
