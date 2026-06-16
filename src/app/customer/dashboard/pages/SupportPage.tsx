// src/pages/customer/dashboard/pages/SupportPage.tsx

import { useState } from "react";
import {
  MessageCircle, Phone, Mail, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Search, Send, Package,
  RefreshCcw, CreditCard, Shield, Star
} from "lucide-react";

const FAQ_DATA = [
  {
    category:"Booking",
    icon:"📅",
    faqs:[
      { q:"How do I reschedule a booking?",              a:"Go to My Bookings → find your booking → click Reschedule. You can reschedule up to 4 hours before the scheduled time for free." },
      { q:"Can I cancel a booking for free?",            a:"Yes, cancellations before vendor dispatch are free. After vendor is assigned, a ₹50 fee applies. After vendor arrives, visiting charge is deducted." },
      { q:"How long does vendor matching take?",         a:"Our smart dispatch system assigns a vendor within 5–15 minutes of booking. You'll get a notification instantly on assignment." },
      { q:"Can I choose my own vendor?",                 a:"Currently, ADDies auto-assigns the best vendor based on rating, distance, and availability. Vendor preference feature is coming soon." },
    ],
  },
  {
    category:"Payment",
    icon:"💳",
    faqs:[
      { q:"When do I pay for the service?",              a:"You pay after the service is completed. We accept UPI, cash, credit/debit cards, and wallet balance. No advance payment required." },
      { q:"How does cashback work?",                     a:"5% cashback is credited to your ADDies Wallet within 24 hours of service completion. Wallet balance can be used in future bookings." },
      { q:"How do I apply a coupon code?",               a:"During booking in the Payment step, you'll find a 'Apply Coupon' field. Enter your code there and click Apply." },
      { q:"Is my payment information secure?",           a:"Yes, all payments are processed via RazorPay with 256-bit SSL encryption. ADDies never stores card details." },
    ],
  },
  {
    category:"Service Quality",
    icon:"⭐",
    faqs:[
      { q:"What if I'm not satisfied with the service?", a:"Contact us within 24 hours. We offer a free re-service guarantee. You can report via My Bookings → Report Issue." },
      { q:"Are vendors background-checked?",             a:"Yes. All ADDies professionals undergo police verification, skill certification, and a 15-day training program before onboarding." },
      { q:"What if the vendor doesn't show up?",         a:"You'll be notified immediately. We auto-reassign within 15 minutes or offer a full refund if no vendor is available." },
    ],
  },
];

const SUPPORT_TOPICS = [
  { icon:Package,    label:"Booking Issue",      color:"text-blue-600",    bg:"bg-blue-50"    },
  { icon:CreditCard, label:"Payment Problem",    color:"text-violet-600",  bg:"bg-violet-50"  },
  { icon:RefreshCcw, label:"Reschedule / Cancel",color:"text-amber-600",   bg:"bg-amber-50"   },
  { icon:Shield,     label:"Vendor Complaint",   color:"text-red-600",     bg:"bg-red-50"     },
  { icon:Star,       label:"Feedback",           color:"text-emerald-600", bg:"bg-emerald-50" },
  { icon:MessageCircle,label:"General Query",    color:"text-slate-600",   bg:"bg-slate-100"  },
];

export default function SupportPage() {
  const [openFaq,  setOpenFaq]  = useState<string|null>(null);
  const [search,   setSearch]   = useState("");
  const [message,  setMessage]  = useState("");
  const [sent,     setSent]     = useState(false);
  const [topic,    setTopic]    = useState<string|null>(null);

  const filteredFaqs = FAQ_DATA.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(f =>
      !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.faqs.length > 0);

  function handleSend() {
    if (!message.trim()) return;
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <div className="mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-black text-slate-800">Help & Support</h2>
        <p className="text-sm text-slate-400 mt-0.5">24/7 support · Average reply time: 5 minutes</p>
      </div>

      {/* ── Quick Contact ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:MessageCircle, label:"Live Chat", sub:"Instant reply",    color:"text-emerald-600", bg:"bg-emerald-50",  border:"border-emerald-200", action:"chat" },
          { icon:Phone,         label:"Call Us",   sub:"1800-ADDies",      color:"text-blue-600",    bg:"bg-blue-50",     border:"border-blue-200",    action:"call" },
          { icon:Mail,          label:"Email",     sub:"support@addies.in",color:"text-violet-600",  bg:"bg-violet-50",   border:"border-violet-200",  action:"email" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <button key={c.label}
              className={`flex flex-col items-center gap-2 p-4 ${c.bg} border ${c.border} rounded-2xl
                         hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0`}>
              <div className={`w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center`}>
                <Icon size={18} className={c.color} />
              </div>
              <p className={`text-sm font-bold ${c.color}`}>{c.label}</p>
              <p className="text-xs text-slate-500">{c.sub}</p>
            </button>
          );
        })}
      </div>

      {/* ── Current tickets ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Active Tickets</h3>
          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">1 Open</span>
        </div>
        <div className="flex items-center gap-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">Vendor delay — BK-2702-0087</p>
            <p className="text-xs text-slate-400">Opened 2 hrs ago · Ticket #T-20240027</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Clock size={12} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600">In Progress</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mt-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">Cashback not credited — BK-1802-0015</p>
            <p className="text-xs text-slate-400">Resolved 3 days ago · Ticket #T-20240018</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 flex-shrink-0">Resolved ✓</span>
        </div>
      </div>

      {/* ── Write to us ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 mb-4">Write to Us</h3>

        {/* Topic chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUPPORT_TOPICS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.label} onClick={() => setTopic(topic === t.label ? null : t.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                  ${topic === t.label ? `${t.bg} ${t.color} border-current` : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                <Icon size={12} /> {t.label}
              </button>
            );
          })}
        </div>

        {sent ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Message sent!</p>
              <p className="text-xs text-emerald-600">We'll respond within 5 minutes via chat.</p>
            </div>
          </div>
        ) : (
          <>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your issue in detail... We'll get back to you ASAP."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none
                         focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all mb-3"
            />
            <button onClick={handleSend}
              disabled={!message.trim()}
              className="w-full py-3 bg-purple-600 text-white rounded-xl text-sm font-bold
                         hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all
                         flex items-center justify-center gap-2">
              <Send size={15} /> Send Message
            </button>
          </>
        )}
      </div>

      {/* ── FAQ ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Frequently Asked Questions</h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                       focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all" />
        </div>

        {filteredFaqs.map(cat => (
          <div key={cat.category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-lg">{cat.icon}</span>
              <p className="text-sm font-bold text-slate-700">{cat.category}</p>
              <span className="text-xs text-slate-400 ml-auto">{cat.faqs.length} questions</span>
            </div>
            <div className="divide-y divide-slate-50">
              {cat.faqs.map((faq, i) => {
                const key = `${cat.category}-${i}`;
                const open = openFaq === key;
                return (
                  <div key={i}>
                    <button onClick={() => setOpenFaq(open ? null : key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-semibold text-slate-800 pr-4">{faq.q}</span>
                      {open
                        ? <ChevronUp size={15} className="text-purple-500 flex-shrink-0" />
                        : <ChevronDown size={15} className="text-slate-400 flex-shrink-0" />}
                    </button>
                    {open && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
