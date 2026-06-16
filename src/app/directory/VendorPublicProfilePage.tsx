// src/pages/directory/VendorPublicProfilePage.tsx
// PUBLIC PAGE — no login required  |  Route: /vendors/:slug
// Full JustDial-parity implementation

import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Star, MapPin, BadgeCheck, Clock, CheckCircle2, Crown, Sparkles, Shield,
  ChevronLeft, ArrowRight, Phone, MessageCircle, Share2, Heart, Zap,
  ChevronDown, Award, Briefcase, ThumbsUp, Camera, ChevronRight, AlertCircle,
  Navigation, Globe, Mail, Receipt, Facebook, Link, X, User, CalendarClock,
  CheckCheck, Eye, TrendingUp, CreditCard, Languages, Flag, HelpCircle, Send,
  BarChart2, ShieldCheck, CalendarCheck, Tag, Sparkle, ExternalLink,
} from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import {
  DIRECTORY_VENDORS, DIRECTORY_CATEGORIES,
  TIER_LABELS, type DirectoryVendor, type DirectorySubscriptionTier,
} from "../../../data/directoryData";
import { useAuthStore }   from "../../../store/authStore";
import { useCurrentCity } from "../../../hooks/useCurrentCity";
import { cityToSlug }     from "../../../data/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES (for optional extended vendor fields)
// ─────────────────────────────────────────────────────────────────────────────
type ExtendedVendor = DirectoryVendor & {
  phone?:          string;
  website?:        string;
  email?:          string;
  gstin?:          string;
  lat?:            number;
  lng?:            number;
  paymentMethods?: string[];
  languages?:      string[];
  viewsToday?:     number;
  responseRate?:   number;
  lastBooked?:     string;
  listedSince?:    string;
  profileScore?:   number;
  coverEmoji?:     string;
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────
function getTierGradient(tier: DirectorySubscriptionTier) {
  return tier === "platinum" ? "linear-gradient(135deg,#3b0764,#6d28d9 60%,#4c1d95)"
       : tier === "gold"     ? "linear-gradient(135deg,#78350f,#d97706 60%,#92400e)"
       : tier === "silver"   ? "linear-gradient(135deg,#1e293b,#475569 60%,#334155)"
       :                       "linear-gradient(135deg,#1e3a5f,#1e40af 60%,#1e3a8a)";
}
function getTierAccent(tier: DirectorySubscriptionTier) {
  return tier === "platinum" ? "#7c3aed"
       : tier === "gold"     ? "#d97706"
       : tier === "silver"   ? "#64748b"
       :                       "#1d4ed8";
}
const ev = (v: DirectoryVendor) => v as ExtendedVendor;

// ─────────────────────────────────────────────────────────────────────────────
// STAR ROW
// ─────────────────────────────────────────────────────────────────────────────
function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size}
          className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER BADGE
// ─────────────────────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: DirectorySubscriptionTier }) {
  const t = TIER_LABELS[tier];
  if (tier === "free") return null;
  const Icon = tier === "platinum" ? Crown : tier === "gold" ? Sparkles : Shield;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${t.bg} ${t.color} ${t.border}`}>
      <Icon size={11} /> {t.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREADCRUMB
// ─────────────────────────────────────────────────────────────────────────────
function Breadcrumb({ vendor, catInfo, onBack }: {
  vendor: DirectoryVendor;
  catInfo: ReturnType<typeof DIRECTORY_CATEGORIES.find>;
  onBack: () => void;
}) {
  return (
    <div className="bg-white border-b border-slate-100 px-4">
      <div className="page-container py-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <button onClick={() => {}} className="hover:text-blue-600 transition-colors">Home</button>
          <ChevronRight size={11} />
          <button onClick={() => {}} className="hover:text-blue-600 transition-colors capitalize">Lucknow</button>
          <ChevronRight size={11} />
          <button onClick={onBack} className="hover:text-blue-600 transition-colors">{catInfo?.name ?? vendor.category}</button>
          <ChevronRight size={11} />
          <span className="text-slate-600 font-semibold truncate max-w-[160px]">{vendor.businessName}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION (with cover banner + sponsored tag)
// ─────────────────────────────────────────────────────────────────────────────
function VendorHeroSection({
  vendor, catInfo, onBack, onSave, saved, onShare,
}: {
  vendor: DirectoryVendor; catInfo: ReturnType<typeof DIRECTORY_CATEGORIES.find>;
  onBack: () => void; onSave: () => void; saved: boolean; onShare: () => void;
}) {
  const gradient  = getTierGradient(vendor.tier);
  const ext       = ev(vendor);
  const isSponsored = vendor.tier === "platinum" || vendor.tier === "gold";

  return (
    <div style={{ background: gradient }} className="relative overflow-hidden">
      {/* Cover banner layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-white rounded-full opacity-30" />
      </div>

      {/* Sponsored ribbon */}
      {isSponsored && (
        <div className="relative z-10 bg-black/20 backdrop-blur-sm px-0 py-1">
          <div className="page-container flex items-center justify-end">
            <span className="flex items-center gap-1 text-white/70 text-xs font-semibold">
              <Tag size={10} /> Sponsored
            </span>
          </div>
        </div>
      )}

      <div className="relative page-container pt-4 pb-0">
        {/* Top actions row */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold transition-colors">
            <ChevronLeft size={16} /> Vendor Directory
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onSave}
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all
                ${saved ? "bg-red-500 border-red-500 text-white" : "bg-white/10 border-white/30 text-white/70 hover:bg-white/20"}`}>
              <Heart size={16} className={saved ? "fill-white" : ""} />
            </button>
            <button onClick={onShare}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/30 text-white/70 hover:bg-white/20 transition-all">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Vendor identity */}
        <div className="flex items-end gap-5 pb-5">
          <div className="relative flex-shrink-0">
            {/* Avatar with cover emoji background */}
            <div className="w-24 h-24 rounded-3xl bg-white/20 border-4 border-white/40 flex items-center justify-center text-white font-black text-4xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                {ext.coverEmoji ?? catInfo?.icon ?? "🏠"}
              </span>
              <span className="relative z-10">{vendor.avatar}</span>
            </div>
            {vendor.isAvailable && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{vendor.businessName}</h1>
              {vendor.isVerified && <BadgeCheck size={22} className="text-green-300 flex-shrink-0" />}
            </div>
            <p className="text-white/70 text-sm mb-2.5">
              by <span className="text-white font-semibold">{vendor.ownerName}</span>
              &nbsp;·&nbsp;{vendor.yearsExp} yrs experience
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <TierBadge tier={vendor.tier} />
              <span className="px-2.5 py-1 bg-white/15 rounded-full text-white/90 text-xs font-semibold">
                {catInfo?.icon} {vendor.category}
              </span>
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <MapPin size={11} /> {vendor.area}, {vendor.city}
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="bg-white/10 backdrop-blur-md border-t border-white/15 -mx-4 md:-mx-8 px-4 md:px-8">
          <div className="grid grid-cols-4 divide-x divide-white/15">
            {[
              { icon: Star,      val: vendor.rating,          sub: `${vendor.totalReviews} reviews` },
              { icon: Briefcase, val: `${vendor.totalJobs}+`, sub: "Jobs Done"      },
              { icon: Clock,     val: vendor.responseTime,    sub: "Response Time"  },
              { icon: Award,     val: `${vendor.yearsExp} yr`,sub: "Experience"     },
            ].map(({ icon: Icon, val, sub }) => (
              <div key={sub} className="text-center py-3">
                <div className="flex items-center justify-center gap-1 text-white font-black text-base md:text-lg">
                  <Icon size={13} className="opacity-70" /> {val}
                </div>
                <p className="text-white/50 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",  label: "Overview"   },
  { id: "catalogue", label: "Catalogue"  },
  { id: "quickinfo", label: "Quick Info" },
  { id: "services",  label: "Services"   },
  { id: "photos",    label: "Photos"     },
  { id: "reviews",   label: "Reviews"    },
  { id: "qa",        label: "Q & A"      },
];

function TabsNav({ active, onChange, accentColor }: {
  active: string; onChange: (t: string) => void; accentColor: string;
}) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
      <div className="page-container">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => onChange(tab.id)}
              className={`flex-shrink-0 px-4 py-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap
                ${active === tab.id ? "border-current" : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"}`}
              style={active === tab.id ? { color: accentColor, borderColor: accentColor } : {}}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUST STRIP (badges + social proof + profile completion)
// ─────────────────────────────────────────────────────────────────────────────
function TrustStrip({ vendor }: { vendor: DirectoryVendor }) {
  const ext = ev(vendor);
  const viewsToday   = ext.viewsToday   ?? Math.floor(50  + vendor.totalJobs * 0.03);
  const responseRate = ext.responseRate ?? Math.min(98, 80 + vendor.rating * 3);
  const lastBooked   = ext.lastBooked   ?? "2 hours ago";
  const listedSince  = ext.listedSince  ?? "2021";
  const profileScore = ext.profileScore ?? Math.min(100, 60 + vendor.totalReviews);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Trust badges */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-50">
        <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">Trust & Certifications</p>
        <div className="flex flex-wrap gap-2">
          {vendor.isVerified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
              <ShieldCheck size={12} /> ADDies Verified
            </span>
          )}
          {vendor.tier !== "free" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold rounded-full">
              <Award size={12} /> Premium Listed
            </span>
          )}
          {vendor.rating >= 4.5 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold rounded-full">
              <Star size={12} className="fill-yellow-500" /> Top Rated
            </span>
          )}
          {vendor.totalJobs >= 100 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full">
              <TrendingUp size={12} /> 100+ Jobs
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">
            <CalendarCheck size={12} /> Since {listedSince}
          </span>
        </div>
      </div>

      {/* Live signals */}
      <div className="grid grid-cols-3 divide-x divide-slate-50">
        {[
          { icon: Eye,       val: `${viewsToday}`,    sub: "Viewed today",   color: "text-blue-500"    },
          { icon: BarChart2, val: `${responseRate}%`, sub: "Response rate",  color: "text-emerald-500" },
          { icon: Clock,     val: lastBooked,          sub: "Last booked",    color: "text-orange-500"  },
        ].map(({ icon: Icon, val, sub, color }) => (
          <div key={sub} className="flex flex-col items-center py-3 gap-1">
            <Icon size={15} className={color} />
            <p className="text-sm font-black text-slate-800">{val}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Profile completion */}
      <div className="px-5 pb-4 pt-3 border-t border-slate-50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500">Profile Completeness</span>
          <span className="text-xs font-black text-emerald-600">{profileScore}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
            style={{ width: `${profileScore}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Overview
// ─────────────────────────────────────────────────────────────────────────────
function TabOverview({ vendor }: { vendor: DirectoryVendor }) {
  const [expanded, setExpanded] = useState(false);
  const text   = vendor.about ?? "";
  const isLong = text.length > 220;

  return (
    <div className="space-y-5">
      {/* About */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-black text-slate-800 mb-3">About the Business</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {isLong && !expanded ? text.slice(0, 220) + "…" : text}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(e => !e)}
            className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            {expanded ? "Show less" : "Read more"}
            <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
          {vendor.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full">#{tag}</span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { icon: BadgeCheck, label: vendor.isVerified ? "Verified Pro" : "Registered", color: "text-emerald-600 bg-emerald-50" },
            { icon: Briefcase,  label: `${vendor.totalJobs}+ Customers`,                  color: "text-blue-600 bg-blue-50"      },
            { icon: ThumbsUp,   label: "Top Rated",                                        color: "text-yellow-600 bg-yellow-50"  },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${color.split(" ")[1]} text-center`}>
              <Icon size={18} className={color.split(" ")[0]} />
              <span className={`text-xs font-bold ${color.split(" ")[0]}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <HowItWorksSection />

      {/* Payment + Languages */}
      <VendorMetaInfo vendor={vendor} />

      {/* FAQ */}
      <VendorFAQ />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { icon: "📱", step: "01", title: "Browse & Choose",   desc: "Find the right vendor from our verified directory. Compare ratings, reviews & prices."  },
    { icon: "📅", step: "02", title: "Book or Enquire",   desc: "Book instantly or send a quick enquiry. Callback available within your chosen time slot."  },
    { icon: "🚗", step: "03", title: "Professional Arrives", desc: "Verified pro arrives at your doorstep on time with all tools & equipment."           },
    { icon: "💳", step: "04", title: "Pay After Service", desc: "Satisfied with the work? Pay via Cash, UPI, or Card. No advance payment needed."          },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 className="font-black text-slate-800 mb-5">How It Works</h2>
      <div className="relative">
        <div className="absolute left-[22px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-emerald-200 hidden sm:block" />
        <div className="flex flex-col gap-4">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-start gap-4 sm:pl-12 relative">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0
                bg-gradient-to-br shadow-md sm:absolute sm:-left-0
                ${i===0?"from-blue-400 to-blue-500":i===1?"from-violet-400 to-violet-500":i===2?"from-orange-400 to-orange-500":"from-emerald-400 to-emerald-500"}`}>
                {s.icon}
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3.5 flex-1 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-slate-300">{s.step}</span>
                  <h3 className="text-sm font-black text-slate-800">{s.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT + LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────
function VendorMetaInfo({ vendor }: { vendor: DirectoryVendor }) {
  const ext      = ev(vendor);
  const payments  = ext.paymentMethods ?? ["Cash", "UPI", "Card", "Net Banking"];
  const languages = ext.languages      ?? ["Hindi", "English"];
  const PAY_ICONS: Record<string, string> = {
    "Cash": "💵", "UPI": "📱", "Card": "💳", "Net Banking": "🏦", "Cheque": "📄",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={15} className="text-blue-500" />
          <h3 className="font-black text-slate-700 text-sm">Payment Methods Accepted</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {payments.map(p => (
            <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl">
              {PAY_ICONS[p] ?? "💳"} {p}
            </span>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2 mb-3">
          <Languages size={15} className="text-blue-500" />
          <h3 className="font-black text-slate-700 text-sm">Languages Spoken</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map(l => (
            <span key={l} className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-xl">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Catalogue
// ─────────────────────────────────────────────────────────────────────────────
function TabCatalogue({ vendor, accentColor, onBook }: {
  vendor: DirectoryVendor; accentColor: string; onBook: () => void;
}) {
  const pkgs = [
    { name: "Basic",    desc: "Essential service for small requirements", price: vendor.startingPrice,                  tag: undefined,         features: vendor.subServices.slice(0, 3) },
    { name: "Standard", desc: "Most popular — covers most home needs",    price: Math.round(vendor.startingPrice * 1.8),tag: "⭐ Most Popular", features: vendor.subServices.slice(0, 5) },
    { name: "Premium",  desc: "Complete end-to-end service experience",   price: Math.round(vendor.startingPrice * 3),  tag: "Best Value",      features: vendor.subServices              },
  ];
  return (
    <div className="space-y-4">
      {pkgs.map((pkg, i) => (
        <div key={pkg.name}
          className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all
            ${pkg.tag === "⭐ Most Popular" ? "border-blue-300 shadow-blue-100/50" : "border-slate-100 hover:border-slate-200"}`}>
          {pkg.tag && (
            <div className="px-5 py-1.5 text-xs font-black text-white text-center" style={{ backgroundColor: accentColor }}>
              {pkg.tag}
            </div>
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-black text-slate-800 text-base">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{pkg.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-black text-emerald-600">₹{pkg.price.toLocaleString("en-IN")}</p>
                <p className="text-xs text-slate-400">onwards</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
              {pkg.features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 size={13} style={{ color: accentColor }} className="flex-shrink-0" />
                  <span className="text-xs text-slate-600 font-medium">{f}</span>
                </div>
              ))}
            </div>
            {/* Per-package Book button */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
              <button onClick={onBook}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-black transition-all hover:opacity-90"
                style={{ backgroundColor: accentColor }}>
                <Zap size={13} /> Book {pkg.name}
              </button>
              <button
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition-all hover:bg-slate-50"
                style={{ borderColor: accentColor, color: accentColor }}>
                Get Quote
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Quick Info
// ─────────────────────────────────────────────────────────────────────────────
function TabQuickInfo({ vendor }: { vendor: DirectoryVendor }) {
  const ext         = ev(vendor);
  const fullAddress = `${vendor.area}, ${vendor.city}`;

  function openDirections() {
    if (navigator.geolocation && ext.lat && ext.lng) {
      navigator.geolocation.getCurrentPosition(
        pos => window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${ext.lat},${ext.lng}`, "_blank"),
        ()  => window.open(`https://www.google.com/maps/search/${encodeURIComponent(`${vendor.businessName}, ${fullAddress}`)}`, "_blank")
      );
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(`${vendor.businessName}, ${fullAddress}`)}`, "_blank");
    }
  }

  function openWhatsApp() {
    const num = (ext.phone ?? "").replace(/\D/g, "");
    const msg = encodeURIComponent(`Hi, I found your profile on ADDies. I'm interested in your ${vendor.category} service.`);
    window.open(num ? `https://wa.me/91${num}?text=${msg}` : `https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <div className="space-y-4">
      {/* Address + Directions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" /> Location & Address
        </h2>
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-3">
          <MapPin size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">{vendor.businessName}</p>
            <p className="text-sm text-slate-600 mt-0.5">{fullAddress}</p>
            {ext.lat && ext.lng && <p className="text-xs text-slate-400 mt-1">📍 {ext.lat.toFixed(4)}, {ext.lng.toFixed(4)}</p>}
          </div>
        </div>
        <button onClick={openDirections}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-all shadow-sm">
          <Navigation size={16} /> Get Directions on Google Maps
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">Opens Google Maps — route from your current location</p>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <Phone size={16} className="text-blue-500" /> Contact Information
        </h2>
        <div className="space-y-3">
          {ext.phone && (
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0"><Phone size={15} className="text-green-600" /></div>
                <div><p className="text-xs text-slate-400">Phone</p><p className="text-sm font-bold text-slate-800">{ext.phone}</p></div>
              </div>
              <a href={`tel:${ext.phone}`} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors">Call</a>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0"><MessageCircle size={15} className="text-green-600" /></div>
              <div><p className="text-xs text-slate-400">WhatsApp</p><p className="text-sm font-bold text-slate-800">{ext.phone ?? "Chat with vendor"}</p></div>
            </div>
            <button onClick={openWhatsApp} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">Chat</button>
          </div>
          {ext.email && (
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"><Mail size={15} className="text-blue-600" /></div>
                <div><p className="text-xs text-slate-400">Email</p><p className="text-sm font-bold text-slate-800 truncate max-w-[160px]">{ext.email}</p></div>
              </div>
              <a href={`mailto:${ext.email}`} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">Mail</a>
            </div>
          )}
          {ext.website && (
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"><Globe size={15} className="text-purple-600" /></div>
                <div><p className="text-xs text-slate-400">Website</p><p className="text-sm font-bold text-slate-800 truncate max-w-[160px]">{ext.website}</p></div>
              </div>
              <a href={ext.website.startsWith("http") ? ext.website : `https://${ext.website}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1">
                <ExternalLink size={11} /> Visit
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <Receipt size={16} className="text-blue-500" /> Business Details
        </h2>
        <div className="space-y-0">
          {[
            { label: "Business Name",     val: vendor.businessName                            },
            { label: "Owner / Contact",   val: vendor.ownerName                               },
            { label: "Category",          val: vendor.category                                },
            { label: "Service Area",      val: fullAddress                                    },
            { label: "Years in Business", val: `${vendor.yearsExp} years`                     },
            { label: "Total Jobs",        val: `${vendor.totalJobs.toLocaleString("en-IN")}+` },
            ...(ext.gstin ? [{ label: "GSTIN", val: ext.gstin }] : []),
          ].map(({ label, val }) => (
            <div key={label} className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
              <span className="text-xs font-bold text-slate-700 text-right">{val}</span>
            </div>
          ))}
          {vendor.isVerified && (
            <div className="flex items-center gap-2 pt-3">
              <BadgeCheck size={15} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">Identity & Documents Verified by ADDies</span>
            </div>
          )}
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-black text-slate-800 mb-3 flex items-center gap-2">
          <Clock size={16} className="text-blue-500" /> Working Hours
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => (
            <div key={day}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs
                ${i < 6 ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-100"}`}>
              <span className={`font-bold ${i < 6 ? "text-emerald-700" : "text-slate-400"}`}>{day}</span>
              <span className={i < 6 ? "text-emerald-600 font-semibold" : "text-slate-400"}>{i < 6 ? "9 AM – 7 PM" : "10 AM – 4 PM"}</span>
            </div>
          ))}
        </div>
        <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl ${vendor.isAvailable ? "bg-green-50" : "bg-slate-50"}`}>
          <div className={`w-2 h-2 rounded-full ${vendor.isAvailable ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
          <span className={`text-xs font-bold ${vendor.isAvailable ? "text-green-700" : "text-slate-500"}`}>
            {vendor.isAvailable ? `Currently Available · Responds in ${vendor.responseTime}` : "Currently Unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Services
// ─────────────────────────────────────────────────────────────────────────────
function TabServices({ vendor, accentColor, onBook }: {
  vendor: DirectoryVendor; accentColor: string; onBook: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-slate-800">Services Offered</h2>
        <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">{vendor.subServices.length} services</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        {vendor.subServices.map(s => (
          <div key={s} className="group flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}15` }}>
              <CheckCircle2 size={15} style={{ color: accentColor }} />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{s}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div>
          <p className="text-xs text-slate-400">Starting Price</p>
          <p className="text-xl font-black text-emerald-600">₹{vendor.startingPrice}<span className="text-xs text-slate-400 font-normal ml-1">onwards</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBook}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-black transition-all hover:opacity-90"
            style={{ backgroundColor: accentColor }}>
            <Zap size={13} /> Book Now
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 text-xs font-black transition-all hover:bg-slate-50"
            style={{ borderColor: accentColor, color: accentColor }}>
            Get Quote
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Photos
// ─────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER_PHOTOS = ["🏠","🔧","⚡","🚿","🛠️","✨","🎨","🪴","🐾","💡","🔑","🌿"];

function TabPhotos() {
  const [activeIdx, setActiveIdx] = useState(0);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="font-black text-slate-800">Work Gallery</h2>
        <span className="text-xs text-slate-400 flex items-center gap-1"><Camera size={12} /> {PLACEHOLDER_PHOTOS.length} photos</span>
      </div>
      <div className="mx-5 mb-3 h-64 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-8xl border border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
        <span className="relative z-10">{PLACEHOLDER_PHOTOS[activeIdx]}</span>
        <button onClick={() => setActiveIdx(i => (i - 1 + PLACEHOLDER_PHOTOS.length) % PLACEHOLDER_PHOTOS.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-all">
          <ChevronLeft size={18} className="text-slate-600" />
        </button>
        <button onClick={() => setActiveIdx(i => (i + 1) % PLACEHOLDER_PHOTOS.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-all">
          <ChevronRight size={18} className="text-slate-600" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {PLACEHOLDER_PHOTOS.map((_, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={`h-1.5 rounded-full transition-all bg-white ${i === activeIdx ? "w-4 opacity-100" : "w-1.5 opacity-60"}`} />
          ))}
        </div>
      </div>
      <div className="flex gap-2 px-5 pb-5 overflow-x-auto">
        {PLACEHOLDER_PHOTOS.map((p, i) => (
          <button key={i} onClick={() => setActiveIdx(i)}
            className={`w-16 h-16 flex-shrink-0 rounded-xl flex items-center justify-center text-2xl border-2 transition-all
              ${activeIdx === i ? "border-blue-500 bg-blue-50 scale-105 shadow-md" : "border-slate-100 bg-slate-50 hover:border-blue-300"}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE A REVIEW FORM
// ─────────────────────────────────────────────────────────────────────────────
function WriteReviewForm({ vendor }: { vendor: DirectoryVendor }) {
  const [form, setForm]     = useState({ name: "", rating: 0, service: "", comment: "" });
  const [hover, setHover]   = useState(0);
  const [submitted, setDone] = useState(false);

  function handleSubmit() {
    if (!form.name.trim() || !form.rating || !form.comment.trim()) return;
    setDone(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <CheckCheck size={24} className="text-emerald-600" />
        </div>
        <p className="font-black text-slate-800">Review Submitted!</p>
        <p className="text-sm text-slate-500 mt-1">Thank you — your review helps others make informed choices.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">{vendor.avatar}</div>
        <div>
          <p className="text-sm font-black text-slate-800">Rate {vendor.businessName}</p>
          <p className="text-xs text-slate-400">Your honest review helps others decide</p>
        </div>
      </div>
      {/* Star picker */}
      <div>
        <p className="text-xs font-bold text-slate-600 mb-2">Your Rating *</p>
        <div className="flex gap-1 items-center">
          {[1,2,3,4,5].map(s => (
            <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
              onClick={() => setForm(f => ({ ...f, rating: s }))}
              className="transition-transform hover:scale-110">
              <Star size={30} className={s <= (hover || form.rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"} />
            </button>
          ))}
          {(hover || form.rating) > 0 && (
            <span className="ml-2 text-sm font-bold text-slate-600">
              {["","Poor","Fair","Good","Very Good","Excellent"][hover || form.rating]}
            </span>
          )}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-600 mb-1.5 block">Your Name *</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter your name"
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-600 mb-1.5 block">Service Taken</label>
        <input value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} placeholder="e.g. AC Service, Plumbing…"
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-600 mb-1.5 block">Your Review *</label>
        <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value.slice(0, 300) }))}
          placeholder="Share your experience…" rows={3}
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
        <p className="text-xs text-slate-400 mt-1 text-right">{form.comment.length}/300</p>
      </div>
      <button onClick={handleSubmit} disabled={!form.name.trim() || !form.rating || !form.comment.trim()}
        className="w-full py-3 rounded-xl text-white text-sm font-black transition-all bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        <Send size={14} /> Submit Review
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Reviews (with vendor reply + write review)
// ─────────────────────────────────────────────────────────────────────────────
function VendorRatingBreakdown({ vendor }: { vendor: DirectoryVendor }) {
  const r = vendor.rating;
  const breakdown = [
    { stars: 5, pct: r >= 4.5 ? 70 : r >= 4 ? 55 : 40 },
    { stars: 4, pct: r >= 4 ? 20 : 25 },
    { stars: 3, pct: r >= 3.5 ? 6 : 15 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 2 },
  ];
  return (
    <div className="flex gap-6 items-center p-4 bg-slate-50 rounded-2xl mb-5">
      <div className="text-center flex-shrink-0">
        <p className="text-5xl font-black text-slate-800 leading-none">{r}</p>
        <StarRow rating={r} size={16} />
        <p className="text-xs text-slate-400 mt-1">{vendor.totalReviews.toLocaleString("en-IN")} reviews</p>
      </div>
      <div className="flex-1 space-y-1.5">
        {breakdown.map(({ stars, pct }) => (
          <div key={stars} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-4 text-right font-semibold">{stars}</span>
            <Star size={10} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-400 w-7">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sample vendor replies for demo
const VENDOR_REPLIES: Record<number, string> = {
  0: "Thank you for your kind words! We're glad you had a great experience. Looking forward to serving you again!",
  1: "We appreciate your feedback and are continuously improving our service quality.",
};

function TabReviews({ vendor }: { vendor: DirectoryVendor }) {
  const [showAll, setShowAll] = useState(false);
  const reviews = vendor.reviews ?? [];
  const visible = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 className="font-black text-slate-800 mb-4">Customer Reviews</h2>
      <VendorRatingBreakdown vendor={vendor} />

      <div className="space-y-5">
        {visible.map((r, i) => (
          <div key={i} className={`pb-5 ${i < visible.length - 1 ? "border-b border-slate-50" : ""}`}>
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-black text-blue-700 flex-shrink-0">
                  {r.customerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.customerName}</p>
                  <p className="text-xs text-slate-400">{r.service}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <StarRow rating={r.rating} />
                <p className="text-xs text-slate-400 mt-1">{r.date}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>

            {/* Review "photos" (emoji placeholders) */}
            {i % 2 === 0 && (
              <div className="flex gap-2 mt-3">
                {["📸","🖼️","📷"].slice(0, 2).map((p, pi) => (
                  <div key={pi} className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xl">
                    {p}
                  </div>
                ))}
              </div>
            )}

            {/* Helpful button */}
            <button className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors">
              <ThumbsUp size={12} /> Helpful
            </button>

            {/* Vendor Reply (Owner replied) — JustDial style green box */}
            {VENDOR_REPLIES[i] && (
              <div className="mt-3 flex items-start gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-sm flex-shrink-0">
                  {vendor.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-black text-emerald-700">Owner Replied</p>
                    <BadgeCheck size={12} className="text-emerald-600" />
                    <span className="text-xs text-emerald-500">Verified Owner</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{VENDOR_REPLIES[i]}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button onClick={() => setShowAll(s => !s)}
          className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2">
          {showAll ? "Show fewer reviews" : `See all ${reviews.length} reviews`}
          <ChevronDown size={14} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Write a Review */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkle size={16} className="text-yellow-500" />
          <h3 className="font-black text-slate-800">Write a Review</h3>
        </div>
        <WriteReviewForm vendor={vendor} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Q&A
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_QA = [
  { q: "Do you provide service on weekends?",         asker: "Rahul S.",  date: "2 days ago",  a: "Yes, we are available on Saturdays and Sundays. You can book from 9 AM.", answered: true  },
  { q: "Kya aap Noida mein bhi service dete ho?",     asker: "Priya M.",  date: "1 week ago",  a: "Abhi hum sirf Lucknow aur Kanpur mein service dete hain. Noida jald hi.",  answered: true  },
  { q: "What is the minimum charge for a visit?",     asker: "Amit K.",   date: "3 days ago",  a: null,                                                                         answered: false },
  { q: "Do you bring your own tools and equipment?",  asker: "Sneha P.",  date: "5 days ago",  a: "Yes, all our professionals carry their full toolkit. You don't need anything.", answered: true },
];

function TabQA({ vendor }: { vendor: DirectoryVendor }) {
  const [showForm, setShowForm]   = useState(false);
  const [question, setQuestion]   = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitQuestion() {
    if (!question.trim()) return;
    setSubmitted(true);
    setQuestion("");
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2500);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-blue-500" />
          <h2 className="font-black text-slate-800">Questions & Answers</h2>
          <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{SAMPLE_QA.length}</span>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
          + Ask a Question
        </button>
      </div>

      {/* Ask form */}
      {showForm && (
        <div className="mb-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          {submitted ? (
            <div className="flex items-center gap-2 text-emerald-700 justify-center py-2">
              <CheckCheck size={18} /> <span className="text-sm font-bold">Question submitted! {vendor.businessName} will answer soon.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold text-blue-700">Ask {vendor.businessName} directly</p>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Type your question…" rows={2}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl bg-white focus:outline-none focus:border-blue-400 transition-all resize-none" />
              <div className="flex gap-2">
                <button onClick={submitQuestion} disabled={!question.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex items-center justify-center gap-1">
                  <Send size={12} /> Submit
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold text-slate-500 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-5">
        {SAMPLE_QA.map((qa, i) => (
          <div key={i} className={`pb-5 ${i < SAMPLE_QA.length - 1 ? "border-b border-slate-50" : ""}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 flex-shrink-0">
                {qa.asker.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold text-slate-700">{qa.asker}</span>
                  <span className="text-xs text-slate-400">{qa.date}</span>
                </div>
                <p className="text-sm text-slate-700 font-medium">Q: {qa.q}</p>
              </div>
            </div>
            {qa.answered && qa.a ? (
              <div className="ml-11 flex items-start gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-7 h-7 rounded-full bg-emerald-200 flex items-center justify-center text-sm flex-shrink-0">{vendor.avatar}</div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs font-black text-emerald-700">Vendor Reply</p>
                    <BadgeCheck size={11} className="text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{qa.a}</p>
                </div>
              </div>
            ) : (
              <div className="ml-11 flex items-center gap-1.5 text-xs text-slate-400 italic">
                <Clock size={11} /> Awaiting vendor response…
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────────────────
const GENERIC_FAQS = [
  { q: "Booking ke baad kya hota hai?",    a: "Vendor 30 min mein call karega aur appointment schedule karega." },
  { q: "Kya vendor apne tools laata hai?", a: "Haan, saare verified vendors apne tools laate hain." },
  { q: "Kya service guarantee milti hai?", a: "7-day service guarantee — issue hone par free revisit." },
  { q: "Payment kaise karna hoga?",        a: "Cash, UPI, ya card — sirf service complete hone ke baad." },
  { q: "Kya service cancel ho sakti hai?", a: "2 ghante pehle tak free cancellation available hai." },
];

function VendorFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={18} className="text-blue-500" />
        <h2 className="font-black text-slate-800">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-2">
        {GENERIC_FAQS.map((faq, i) => (
          <div key={i} className={`border rounded-xl overflow-hidden transition-all ${openIdx === i ? "border-blue-200 bg-blue-50/50" : "border-slate-100 bg-slate-50/50"}`}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left">
              <span className={`text-sm font-bold ${openIdx === i ? "text-blue-700" : "text-slate-700"}`}>{faq.q}</span>
              <ChevronDown size={16} className={`flex-shrink-0 transition-transform text-slate-400 ${openIdx === i ? "rotate-180 text-blue-500" : ""}`} />
            </button>
            {openIdx === i && <div className="px-4 pb-4"><p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMILAR VENDORS — full-width strip (below main content)
// ─────────────────────────────────────────────────────────────────────────────
function SimilarVendorsStrip({ vendor, accentColor }: { vendor: DirectoryVendor; accentColor: string }) {
  const similar = DIRECTORY_VENDORS
    .filter(v => v.categorySlug === vendor.categorySlug && v.id !== vendor.id)
    .slice(0, 6);
  if (similar.length === 0) return null;

  return (
    <div className="bg-white border-t border-slate-100 py-8 mt-2">
      <div className="page-container">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-slate-800 text-lg">Similar Vendors</h2>
            <p className="text-xs text-slate-400 mt-0.5">More {vendor.category} professionals in {vendor.city}</p>
          </div>
          <a href="/vendors" className="text-xs font-bold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: accentColor }}>
            View All <ChevronRight size={13} />
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {similar.map(v => (
            <a key={v.id} href={`/vendors/${v.slug}`}
              className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2
                ${v.tier === "platinum" ? "bg-violet-100" : v.tier === "gold" ? "bg-yellow-100" : "bg-slate-100"}`}>
                {v.avatar}
              </div>
              <p className="text-xs font-black text-slate-700 leading-tight truncate group-hover:text-blue-600 transition-colors">{v.businessName}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star size={9} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-slate-500 font-semibold">{v.rating}</span>
              </div>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">₹{v.startingPrice}+</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function EnquiryForm({ vendor, accentColor }: { vendor: DirectoryVendor; accentColor: string }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <CheckCheck size={20} className="text-emerald-600" />
        </div>
        <p className="text-sm font-black text-slate-800">Enquiry Sent!</p>
        <p className="text-xs text-slate-500 mt-1">{vendor.businessName} will contact you shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-50" style={{ backgroundColor: `${accentColor}12` }}>
        <p className="text-xs font-black text-slate-700">📩 Send Quick Enquiry</p>
        <p className="text-xs text-slate-400">Get a free quote in minutes</p>
      </div>
      <div className="p-4 space-y-2.5">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your Name *"
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 transition-all" />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">+91</span>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g,"").slice(0,10) }))}
            placeholder="Mobile Number *" type="tel"
            className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 transition-all" />
        </div>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="What service do you need?" rows={2}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 transition-all resize-none" />
        <button onClick={() => { if (form.name.trim() && form.phone.length >= 10) setSent(true); }}
          disabled={!form.name.trim() || form.phone.length < 10}
          className="w-full py-2.5 rounded-xl text-white text-xs font-black transition-all disabled:bg-slate-200 disabled:text-slate-400"
          style={{ backgroundColor: accentColor }}>
          Send Enquiry
        </button>
        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck size={10} className="text-emerald-400" /> Your info is safe & private
        </p>
      </div>
    </div>
  );
}

function VendorSidebar({
  vendor, accentColor, gradient, onBook, onCallback, onWhatsApp,
}: {
  vendor: DirectoryVendor; accentColor: string; gradient: string;
  onBook: () => void; onCallback: () => void; onWhatsApp: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Booking card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        <div style={{ background: gradient }} className="px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/70 text-xs font-semibold">Starting from</p>
            {vendor.isAvailable
              ? <span className="flex items-center gap-1.5 text-xs font-bold text-green-300"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Available Now</span>
              : <span className="text-xs text-white/50">Unavailable</span>}
          </div>
          <p className="text-3xl font-black text-white">₹{vendor.startingPrice}<span className="text-white/60 text-sm font-normal"> /service</span></p>
        </div>
        <div className="p-4 space-y-2.5">
          <button onClick={onBook}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-black shadow-md hover:opacity-90 transition-all"
            style={{ backgroundColor: accentColor }}>
            <Zap size={16} /> Book Instantly
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-black hover:opacity-90 transition-all bg-slate-700"
            style={{}}>
            <Tag size={14} /> Get Free Quote
          </button>
          <button onClick={onCallback}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-black transition-all hover:bg-slate-50"
            style={{ borderColor: accentColor, color: accentColor }}>
            <Phone size={15} /> Request Callback
          </button>
          <button onClick={onWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold hover:bg-green-100 transition-all">
            <MessageCircle size={15} /> Chat on WhatsApp
          </button>
        </div>
      </div>

      {/* Vendor info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <h3 className="font-black text-slate-700 text-sm">Vendor Details</h3>
        {[
          { icon: MapPin,    label: "Location",   val: `${vendor.area}, ${vendor.city}` },
          { icon: Clock,     label: "Response",   val: vendor.responseTime              },
          { icon: Briefcase, label: "Total Jobs", val: `${vendor.totalJobs}+`           },
          { icon: Award,     label: "Experience", val: `${vendor.yearsExp} years`       },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0"><Icon size={14} className="text-slate-400" /></div>
            <div><p className="text-xs text-slate-400">{label}</p><p className="text-xs font-bold text-slate-700">{val}</p></div>
          </div>
        ))}
        {vendor.isVerified && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
            <BadgeCheck size={16} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600">Identity & Documents Verified</span>
          </div>
        )}
      </div>

      {/* Enquiry Form */}
      <EnquiryForm vendor={vendor} accentColor={accentColor} />

      {/* Report / Claim */}
      <div className="flex items-center justify-center gap-4 py-1">
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors">
          <Flag size={11} /> Report Listing
        </button>
        <span className="text-slate-200 text-sm">|</span>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors">
          <ShieldCheck size={11} /> Claim this Listing
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALS: Callback + Share
// ─────────────────────────────────────────────────────────────────────────────
function CallbackModal({ vendor, onClose }: { vendor: DirectoryVendor; onClose: () => void }) {
  const TIME_SLOTS = ["9–10 AM","10–11 AM","11 AM–12 PM","12–1 PM","2–3 PM","3–4 PM","4–5 PM","5–6 PM","6–7 PM"];
  const [form, setForm]       = useState({ name: "", phone: "", slot: "", note: "" });
  const [submitted, setDone]  = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-800">Request a Callback</h2>
            <p className="text-xs text-slate-400 mt-0.5">{vendor.businessName} will call you back</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><CheckCheck size={28} className="text-emerald-600" /></div>
            <p className="text-lg font-black text-slate-800 mb-1">Callback Request Sent!</p>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{vendor.businessName}</span> will call you at{" "}
              <span className="font-semibold text-slate-700">{form.phone}</span><br />during <span className="font-semibold text-slate-700">{form.slot}</span>
            </p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">Done</button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Your Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Mobile Number *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">+91</span>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g,"").slice(0,10) }))}
                  placeholder="10-digit mobile" type="tel"
                  className="w-full pl-12 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1 block"><CalendarClock size={12} /> Preferred Time *</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} onClick={() => setForm(f => ({ ...f, slot }))}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center border transition-all
                      ${form.slot === slot ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-blue-300"}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Message (optional)</label>
              <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Describe what you need…" rows={2}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
            </div>
            <button onClick={() => { if (form.name.trim() && form.phone.length >= 10 && form.slot) setDone(true); }}
              disabled={!form.name.trim() || form.phone.length < 10 || !form.slot}
              className="w-full py-3 rounded-xl text-white text-sm font-black transition-all bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
              <Phone size={15} className="inline mr-2" /> Request Callback
            </button>
            <p className="text-center text-xs text-slate-400">Usually responds within {vendor.responseTime}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareModal({ vendor, onClose }: { vendor: DirectoryVendor; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const pageUrl   = typeof window !== "undefined" ? window.location.href : `https://addies.in/vendors/${vendor.slug}`;
  const shareText = `Check out ${vendor.businessName} on ADDies — ${vendor.category} in ${vendor.city}. Rating: ${vendor.rating}⭐`;

  const copyLink     = () => { navigator.clipboard.writeText(pageUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const shareWA      = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + pageUrl)}`, "_blank");
  const shareFB      = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank");
  const shareNative  = () => { if (navigator.share) navigator.share({ title: vendor.businessName, text: shareText, url: pageUrl }); };
  const hasNative    = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-800">Share this Profile</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">{vendor.avatar}</div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{vendor.businessName}</p>
              <p className="text-xs text-slate-400">{vendor.category} · {vendor.city}</p>
            </div>
          </div>
          <div className={`grid gap-3 mb-5 ${hasNative ? "grid-cols-4" : "grid-cols-3"}`}>
            {[
              { label: "WhatsApp", action: shareWA,  bg: "bg-green-50 border-green-200",   text: "text-green-700",  emoji: "💬"              },
              { label: "Facebook", action: shareFB,  bg: "bg-blue-50 border-blue-200",     text: "text-blue-700",   isF: true                },
              { label: "Copy",     action: copyLink, bg: "bg-slate-50 border-slate-200",   text: "text-slate-700",  emoji: copied ? "✅":"🔗" },
              ...(hasNative ? [{ label: "More", action: shareNative, bg: "bg-purple-50 border-purple-200", text: "text-purple-700", emoji: "⋯" }] : []),
            ].map(({ label, action, bg, text, emoji, isF }) => (
              <button key={label} onClick={action}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-center transition-all hover:scale-105 ${bg}`}>
                {isF ? <Facebook size={20} className={text} /> : <span className="text-xl leading-none">{emoji}</span>}
                <span className={`text-xs font-bold ${text}`}>{label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Link size={13} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-500 truncate flex-1">{pageUrl}</span>
            <button onClick={copyLink}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all
                ${copied ? "bg-emerald-100 text-emerald-700" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AVAILABILITY BANNER
// ─────────────────────────────────────────────────────────────────────────────
function VendorAvailabilityBanner({ vendor, onBook }: { vendor: DirectoryVendor; onBook: () => void }) {
  return (
    <div className={`flex items-center justify-between gap-3 flex-wrap px-5 py-4 rounded-2xl border
      ${vendor.isAvailable ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vendor.isAvailable ? "bg-emerald-100" : "bg-slate-100"}`}>
          <div className={`w-3 h-3 rounded-full ${vendor.isAvailable ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
        </div>
        <div>
          <p className={`text-sm font-black ${vendor.isAvailable ? "text-emerald-700" : "text-slate-600"}`}>
            {vendor.isAvailable ? "Available for Booking" : "Currently Unavailable"}
          </p>
          <p className="text-xs text-slate-500">
            {vendor.isAvailable ? `Responds in ${vendor.responseTime} · Starting ₹${vendor.startingPrice}` : "You can still send a booking request"}
          </p>
        </div>
      </div>
      <button onClick={onBook}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all
          ${vendor.isAvailable ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-700 hover:bg-slate-800 text-white"}`}>
        {vendor.isAvailable ? <><Zap size={15}/> Book Now</> : <><ArrowRight size={15}/> Request Booking</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE BOTTOM CTA
// ─────────────────────────────────────────────────────────────────────────────
function VendorBottomCTA({ vendor, accentColor, onBook, onCallback }: {
  vendor: DirectoryVendor; accentColor: string; onBook: () => void; onCallback: () => void;
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-2 shadow-2xl">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 truncate">{vendor.businessName}</p>
        <p className="text-base font-black text-slate-800">₹{vendor.startingPrice}<span className="text-xs text-slate-400 font-normal"> onwards</span></p>
      </div>
      <button onClick={onCallback}
        className="flex items-center gap-1.5 px-3 py-2.5 border-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
        style={{ borderColor: accentColor, color: accentColor }}>
        <Phone size={13} /> Callback
      </button>
      <button onClick={onBook}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-white shadow-md transition-all hover:opacity-90 flex-shrink-0"
        style={{ backgroundColor: accentColor }}>
        <Zap size={14} /> Book Now
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING WHATSAPP BUTTON (mobile)
// ─────────────────────────────────────────────────────────────────────────────
function FloatingWhatsApp({ onWhatsApp }: { onWhatsApp: () => void }) {
  return (
    <button onClick={onWhatsApp}
      className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      title="Chat on WhatsApp">
      <MessageCircle size={26} className="fill-white" />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function VendorPublicProfilePage() {
  const { slug }  = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const [saved,         setSaved]        = useState(false);
  const [activeTab,     setActiveTab]    = useState("overview");
  const [showCallback,  setShowCallback] = useState(false);
  const [showShare,     setShowShare]    = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const { cityName }              = useCurrentCity();
  const citySlug                  = cityName ? cityToSlug(cityName) : "lucknow";

  const vendor  = DIRECTORY_VENDORS.find(v => v.slug === slug);
  const catInfo = DIRECTORY_CATEGORIES.find(c => c.slug === vendor?.categorySlug);

  if (!vendor) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
          <p className="text-5xl">😕</p>
          <p className="font-black text-slate-700 text-xl">Vendor nahi mila</p>
          <button onClick={() => navigate("/vendors")}
            className="px-5 py-2.5 bg-blue-700 text-white font-bold rounded-xl text-sm hover:bg-blue-800">
            Directory Wapas Jao
          </button>
        </div>
      </PublicLayout>
    );
  }

  const gradient    = getTierGradient(vendor.tier);
  const accentColor = getTierAccent(vendor.tier);
  const phone       = ev(vendor).phone;

  function handleBookNow() {
    const state = { openTab: "book", categorySlug: vendor.categorySlug, citySlug };
    if (!isAuthenticated) navigate("/login", { state: { redirect: "/customer", ...state } });
    else if (user?.role === "customer") navigate("/customer", { state });
  }

  function handleWhatsApp() {
    const num = (phone ?? "").replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hi, I found your profile on ADDies. I'm interested in your ${vendor.category} service.`);
    window.open(num ? `https://wa.me/91${num}?text=${msg}` : `https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0">

        {/* Breadcrumb */}
        <Breadcrumb vendor={vendor} catInfo={catInfo} onBack={() => navigate("/vendors")} />

        {/* Hero */}
        <VendorHeroSection
          vendor={vendor} catInfo={catInfo}
          onBack={() => navigate("/vendors")}
          onSave={() => setSaved(s => !s)} saved={saved}
          onShare={() => setShowShare(true)}
        />

        {/* Tabs */}
        <TabsNav active={activeTab} onChange={setActiveTab} accentColor={accentColor} />

        {/* Main layout */}
        <div className="page-container py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* LEFT column */}
            <div className="flex-1 min-w-0 space-y-5">
              <VendorAvailabilityBanner vendor={vendor} onBook={handleBookNow} />
              <TrustStrip vendor={vendor} />

              {activeTab === "overview"  && <TabOverview  vendor={vendor} />}
              {activeTab === "catalogue" && <TabCatalogue vendor={vendor} accentColor={accentColor} onBook={handleBookNow} />}
              {activeTab === "quickinfo" && <TabQuickInfo vendor={vendor} />}
              {activeTab === "services"  && <TabServices  vendor={vendor} accentColor={accentColor} onBook={handleBookNow} />}
              {activeTab === "photos"    && <TabPhotos />}
              {activeTab === "reviews"   && <TabReviews   vendor={vendor} />}
              {activeTab === "qa"        && <TabQA        vendor={vendor} />}

              {/* Bottom gradient CTA */}
              <div style={{ background: gradient }} className="rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="text-white">
                  <p className="font-black text-lg leading-tight">{vendor.businessName}</p>
                  <p className="text-white/70 text-sm mt-0.5">Starting ₹{vendor.startingPrice} · {vendor.city}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleBookNow}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-800 text-sm font-black rounded-xl hover:bg-slate-100 transition-all">
                    Book Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT sticky sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-[52px]">
              <VendorSidebar
                vendor={vendor} accentColor={accentColor} gradient={gradient}
                onBook={handleBookNow}
                onCallback={() => setShowCallback(true)}
                onWhatsApp={handleWhatsApp}
              />
            </div>
          </div>
        </div>

        {/* Full-width similar vendors strip */}
        <SimilarVendorsStrip vendor={vendor} accentColor={accentColor} />

        {/* Mobile CTAs */}
        <VendorBottomCTA vendor={vendor} accentColor={accentColor} onBook={handleBookNow} onCallback={() => setShowCallback(true)} />
        <FloatingWhatsApp onWhatsApp={handleWhatsApp} />

        {/* Modals */}
        {showCallback && <CallbackModal vendor={vendor} onClose={() => setShowCallback(false)} />}
        {showShare    && <ShareModal    vendor={vendor} onClose={() => setShowShare(false)}    />}
      </div>
    </PublicLayout>
  );
}
