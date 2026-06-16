/**
 * VendorLeadsPage.tsx
 * Drop-in replacement for the "leads" tab inside VendorDashboard.
 *
 * Usage inside VendorDashboard renderContent():
 *   case "leads": return <VendorLeadsPage />;
 *
 * Self-contained — no extra deps beyond what the project already has.
 */

import { useState, useEffect, useRef } from "react";
import {
  Zap, Clock, MapPin, IndianRupee, Phone, ChevronDown,
  CheckCircle2, X, Eye, Filter, Search, AlertTriangle,
  Flame, Star, Calendar, User, Wrench, MessageSquare,
  ThumbsDown, ThumbsUp, RefreshCw, ArrowUpRight, Info,
  ChevronRight, BadgeCheck, Timer, SlidersHorizontal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lead {
  id: string;
  service: string;
  category: string;
  categoryIcon: string;
  customer: {
    name: string;
    rating: number;
    totalBookings: number;
    verified: boolean;
  };
  address: string;
  city: string;
  pincode: string;
  scheduledDate: string;
  scheduledTime: string;
  budget: number;
  isNegotiable: boolean;
  urgency: "urgent" | "normal" | "flexible";
  description: string;
  postedAgo: string;        // "2 min ago"
  expiresInSeconds: number; // countdown timer
  distance: string;         // "2.4 km"
  competingVendors: number;
  status: "new" | "accepted" | "passed" | "expired";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_LEADS: Lead[] = [
  {
    id: "L001",
    service: "Pipe Leak — Kitchen Sink",
    category: "Plumbing",
    categoryIcon: "🔧",
    customer: { name: "Ramesh Sharma", rating: 4.8, totalBookings: 12, verified: true },
    address: "12-A, Green Park Colony",
    city: "Delhi",
    pincode: "110016",
    scheduledDate: "Today, 27 Feb",
    scheduledTime: "2:00 PM – 4:00 PM",
    budget: 450,
    isNegotiable: true,
    urgency: "urgent",
    description:
      "Kitchen sink pipe leaking under the cabinet. Water dripping continuously. Need immediate fix. Pipe seems to be cracked near the joint. Please bring required tools.",
    postedAgo: "2 min ago",
    expiresInSeconds: 540,   // 9 min
    distance: "1.8 km",
    competingVendors: 2,
    status: "new",
  },
  {
    id: "L002",
    service: "Switchboard Replacement",
    category: "Electrical",
    categoryIcon: "⚡",
    customer: { name: "Pooja Mehta", rating: 4.5, totalBookings: 5, verified: true },
    address: "Flat 302, Sunrise Apartments, Lajpat Nagar",
    city: "Delhi",
    pincode: "110024",
    scheduledDate: "Tomorrow, 28 Feb",
    scheduledTime: "10:00 AM – 12:00 PM",
    budget: 600,
    isNegotiable: false,
    urgency: "normal",
    description:
      "Old switchboard in living room needs complete replacement. 4 switches + 2 sockets. Circuit board looks worn out. Prefer ISI mark products.",
    postedAgo: "15 min ago",
    expiresInSeconds: 1620,  // 27 min
    distance: "3.2 km",
    competingVendors: 4,
    status: "new",
  },
  {
    id: "L003",
    service: "Split AC — Annual Service",
    category: "AC Service",
    categoryIcon: "❄️",
    customer: { name: "Amit Kumar", rating: 4.2, totalBookings: 8, verified: false },
    address: "Villa 7, DLF Phase 2",
    city: "Delhi",
    pincode: "110028",
    scheduledDate: "1 Mar 2026",
    scheduledTime: "11:00 AM – 1:00 PM",
    budget: 799,
    isNegotiable: true,
    urgency: "flexible",
    description:
      "1.5 Ton Daikin split AC needs full servicing. Last serviced 8 months ago. Cooling efficiency has reduced. Also check for gas refill if needed.",
    postedAgo: "32 min ago",
    expiresInSeconds: 2460,  // 41 min
    distance: "5.6 km",
    competingVendors: 6,
    status: "new",
  },
  {
    id: "L004",
    service: "Interior Wall Painting — 2 BHK",
    category: "Painting",
    categoryIcon: "🎨",
    customer: { name: "Sunita Verma", rating: 5.0, totalBookings: 20, verified: true },
    address: "B-45, Sector 21, Dwarka",
    city: "Delhi",
    pincode: "110075",
    scheduledDate: "3 Mar 2026",
    scheduledTime: "9:00 AM onwards",
    budget: 8500,
    isNegotiable: true,
    urgency: "normal",
    description:
      "Complete 2BHK interior painting. 850 sq ft approx. Asian Paints or similar brand preferred. Two coats + putty required. Furniture shifting help will be needed.",
    postedAgo: "1 hr ago",
    expiresInSeconds: 5400,  // 90 min
    distance: "8.1 km",
    competingVendors: 3,
    status: "new",
  },
  {
    id: "L005",
    service: "Refrigerator Not Cooling",
    category: "Appliance Repair",
    categoryIcon: "🔌",
    customer: { name: "Deepak Singh", rating: 3.9, totalBookings: 2, verified: true },
    address: "House 88, Vikas Nagar",
    city: "Delhi",
    pincode: "110018",
    scheduledDate: "Today, 27 Feb",
    scheduledTime: "5:00 PM – 7:00 PM",
    budget: 500,
    isNegotiable: false,
    urgency: "urgent",
    description:
      "Samsung double-door fridge (5 yr old) stopped cooling. Compressor may have issue. Food spoiling. Need urgent diagnosis and repair.",
    postedAgo: "5 min ago",
    expiresInSeconds: 420,   // 7 min
    distance: "2.0 km",
    competingVendors: 1,
    status: "new",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSeconds(sec: number): string {
  if (sec <= 0) return "Expired";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function urgencyConfig(u: Lead["urgency"]) {
  return {
    urgent:   { label: "Urgent",   color: "bg-red-500 text-white",          icon: Flame,  ring: "ring-2 ring-red-200" },
    normal:   { label: "Normal",   color: "bg-amber-400 text-amber-900",    icon: Clock,  ring: "" },
    flexible: { label: "Flexible", color: "bg-slate-200 text-slate-600",    icon: Calendar, ring: "" },
  }[u];
}

function timerColor(sec: number) {
  if (sec <= 300) return "text-red-500";
  if (sec <= 900) return "text-amber-500";
  return "text-emerald-600";
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────
function useCountdowns(leads: Lead[], setLeads: React.Dispatch<React.SetStateAction<Lead[]>>) {
  useEffect(() => {
    const interval = setInterval(() => {
      setLeads((prev) =>
        prev.map((l) =>
          l.status === "new" && l.expiresInSeconds > 0
            ? { ...l, expiresInSeconds: l.expiresInSeconds - 1 }
            : l.expiresInSeconds === 0 && l.status === "new"
            ? { ...l, status: "expired" }
            : l
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────
function LeadModal({
  lead,
  onClose,
  onAccept,
  onPass,
}: {
  lead: Lead;
  onClose: () => void;
  onAccept: (id: string) => void;
  onPass: (id: string) => void;
}) {
  const ucfg = urgencyConfig(lead.urgency);
  const UIcon = ucfg.icon;
  const expired = lead.expiresInSeconds <= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-2xl">{lead.categoryIcon}</span>
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">{lead.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ucfg.color} flex items-center gap-1`}>
                  <UIcon size={10} /> {ucfg.label}
                </span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">{lead.service}</h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 hover:bg-white/30 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Timer */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-black
            ${expired ? "bg-red-500/30 text-red-200" : "bg-white/20 text-white"}`}>
            <Timer size={14} />
            {expired ? "Lead Expired" : `Expires in ${formatSeconds(lead.expiresInSeconds)}`}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Customer */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-lg font-black text-emerald-700 flex-shrink-0">
              {lead.customer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-slate-800">{lead.customer.name}</p>
                {lead.customer.verified && (
                  <BadgeCheck size={15} className="text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-yellow-600 font-semibold">
                  <Star size={11} className="fill-yellow-400 text-yellow-400" /> {lead.customer.rating}
                </span>
                <span className="text-xs text-slate-400">{lead.customer.totalBookings} bookings on platform</span>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Job Details</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: MapPin,        label: "Location",  value: `${lead.address}` },
                { icon: IndianRupee,   label: "Budget",    value: `₹${lead.budget.toLocaleString("en-IN")}${lead.isNegotiable ? " (negotiable)" : ""}` },
                { icon: Calendar,      label: "Date",      value: lead.scheduledDate },
                { icon: Clock,         label: "Time",      value: lead.scheduledTime },
                { icon: ArrowUpRight,  label: "Distance",  value: lead.distance },
                { icon: User,          label: "Competing", value: `${lead.competingVendors} other vendor${lead.competingVendors > 1 ? "s" : ""}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                  <Icon size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5 leading-snug">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Customer Note</h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-amber-50 border border-amber-100 rounded-xl p-4">
              "{lead.description}"
            </p>
          </div>

          {/* Earning estimate */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">Estimated Earnings</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-emerald-700">₹{Math.round(lead.budget * 0.82).toLocaleString("en-IN")}</p>
                <p className="text-xs text-emerald-600">After 18% platform commission</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-700">Posted {lead.postedAgo}</p>
                <p className="text-xs text-emerald-600">{lead.city} · {lead.pincode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-100 bg-white">
          {expired || lead.status !== "new" ? (
            <div className="text-center py-3 text-sm text-slate-400 font-semibold">
              {lead.status === "accepted" ? "✅ You already accepted this lead" :
               lead.status === "passed"   ? "⏭️ You passed this lead" :
               "⏰ This lead has expired"}
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => { onPass(lead.id); onClose(); }}
                className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm
                           hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2">
                <ThumbsDown size={16} /> Pass
              </button>
              <button
                onClick={() => { onAccept(lead.id); onClose(); }}
                className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm
                           hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2">
                <ThumbsUp size={16} /> Accept Lead
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  onView,
  onAccept,
  onPass,
}: {
  lead: Lead;
  onView: (l: Lead) => void;
  onAccept: (id: string) => void;
  onPass: (id: string) => void;
}) {
  const ucfg = urgencyConfig(lead.urgency);
  const UIcon = ucfg.icon;
  const expired = lead.expiresInSeconds <= 0 || lead.status === "expired";
  const isNew = lead.status === "new" && !expired;
  const isAccepted = lead.status === "accepted";
  const isPassed = lead.status === "passed";

  return (
    <div className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200
      ${isNew      ? `hover:shadow-xl hover:-translate-y-0.5 ${ucfg.ring} border-slate-100 hover:border-emerald-200` : ""}
      ${isAccepted ? "border-emerald-300 bg-emerald-50/40 shadow-md" : ""}
      ${isPassed   ? "border-slate-100 opacity-60" : ""}
      ${expired && !isAccepted && !isPassed ? "border-slate-100 opacity-50" : ""}`}
    >
      {/* Urgency accent bar */}
      {isNew && lead.urgency === "urgent" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-400" />
      )}

      {/* Status ribbon */}
      {!isNew && (
        <div className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 z-10
          ${isAccepted ? "bg-emerald-100 text-emerald-700" : isPassed ? "bg-slate-100 text-slate-500" : "bg-red-50 text-red-400"}`}>
          {isAccepted ? <><CheckCircle2 size={11} /> Accepted</> :
           isPassed   ? <><X size={11} /> Passed</> :
           <><Timer size={11} /> Expired</>}
        </div>
      )}

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Category badge */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
            {lead.categoryIcon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-black text-slate-800 text-sm leading-snug truncate pr-1">{lead.service}</p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="text-slate-500 font-medium">{lead.category}</span>
                  <span>·</span>
                  <span>{lead.postedAgo}</span>
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 flex items-center gap-1 ${ucfg.color}`}>
                <UIcon size={9} /> {ucfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={11} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{lead.city} · {lead.distance}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar size={11} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{lead.scheduledDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={11} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{lead.scheduledTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User size={11} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{lead.customer.name.split(" ")[0]}</span>
            {lead.customer.verified && <BadgeCheck size={11} className="text-blue-500 flex-shrink-0" />}
          </div>
        </div>

        {/* Budget + Timer row */}
        <div className="flex items-center justify-between mb-4 p-2.5 rounded-xl bg-slate-50">
          <div>
            <p className="text-xs text-slate-400 font-medium">Budget</p>
            <p className="text-base font-black text-emerald-600">
              ₹{lead.budget.toLocaleString("en-IN")}
              {lead.isNegotiable && <span className="text-xs text-slate-400 font-normal ml-1">negotiable</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">
              {isNew ? "Expires in" : isAccepted ? "Accepted" : isPassed ? "Passed" : "Expired"}
            </p>
            {isNew ? (
              <p className={`text-base font-black tabular-nums ${timerColor(lead.expiresInSeconds)}`}>
                {formatSeconds(lead.expiresInSeconds)}
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-semibold">—</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Competing</p>
            <p className="text-sm font-bold text-slate-600">{lead.competingVendors} vendor{lead.competingVendors > 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Action buttons */}
        {isNew ? (
          <div className="flex gap-2">
            <button
              onClick={() => onView(lead)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600
                         hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5">
              <Eye size={13} /> View Details
            </button>
            <button
              onClick={() => onPass(lead.id)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-red-400
                         hover:border-red-200 hover:bg-red-50 transition-all">
              <X size={14} />
            </button>
            <button
              onClick={() => onAccept(lead.id)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold
                         hover:from-emerald-600 hover:to-emerald-700 shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-1.5">
              <CheckCircle2 size={13} /> Accept
            </button>
          </div>
        ) : (
          <button onClick={() => onView(lead)}
            className="w-full py-2.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-400 hover:bg-slate-50 transition-all">
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────
function FiltersBar({
  search, setSearch,
  urgencyFilter, setUrgencyFilter,
  categoryFilter, setCategoryFilter,
  sortBy, setSortBy,
}: {
  search: string; setSearch: (v: string) => void;
  urgencyFilter: string; setUrgencyFilter: (v: string) => void;
  categoryFilter: string; setCategoryFilter: (v: string) => void;
  sortBy: string; setSortBy: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by service, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                     focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal size={14} className="text-slate-400 flex-shrink-0" />

        {/* Urgency */}
        {["all", "urgent", "normal", "flexible"].map((u) => (
          <button key={u} onClick={() => setUrgencyFilter(u)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold capitalize transition-all
              ${urgencyFilter === u
                ? u === "urgent" ? "bg-red-500 text-white"
                : u === "normal" ? "bg-amber-400 text-amber-900"
                : u === "flexible" ? "bg-slate-600 text-white"
                : "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            {u === "all" ? "All Urgency" : u}
          </button>
        ))}

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-600
                     focus:outline-none focus:border-emerald-400 transition-all cursor-pointer">
          <option value="expiry">Sort: Expiring First</option>
          <option value="budget_high">Sort: Budget ↑</option>
          <option value="budget_low">Sort: Budget ↓</option>
          <option value="distance">Sort: Nearest</option>
          <option value="newest">Sort: Newest</option>
        </select>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VendorLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("expiry");
  const [activeSection, setActiveSection] = useState<"new" | "all">("new");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);

  // Live countdown
  useCountdowns(leads, setLeads);

  function showToast(msg: string, type: "success" | "info" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleAccept(id: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: "accepted" } : l));
    showToast("✅ Lead accepted! Customer will be notified.", "success");
  }

  function handlePass(id: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: "passed" } : l));
    showToast("Lead passed.", "info");
  }

  function handleRefresh() {
    setLeads(INITIAL_LEADS.map((l) => ({ ...l, status: "new", expiresInSeconds: l.expiresInSeconds + 300 })));
    showToast("Leads refreshed!", "info");
  }

  // Filtered + sorted
  const filtered = leads
    .filter((l) => {
      if (activeSection === "new" && l.status !== "new") return false;
      if (urgencyFilter !== "all" && l.urgency !== urgencyFilter) return false;
      if (search && !l.service.toLowerCase().includes(search.toLowerCase()) &&
          !l.city.toLowerCase().includes(search.toLowerCase()) &&
          !l.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "expiry")       return a.expiresInSeconds - b.expiresInSeconds;
      if (sortBy === "budget_high")  return b.budget - a.budget;
      if (sortBy === "budget_low")   return a.budget - b.budget;
      if (sortBy === "distance")     return parseFloat(a.distance) - parseFloat(b.distance);
      return 0;
    });

  const newCount      = leads.filter((l) => l.status === "new" && l.expiresInSeconds > 0).length;
  const acceptedCount = leads.filter((l) => l.status === "accepted").length;
  const passedCount   = leads.filter((l) => l.status === "passed").length;

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-[200] px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl
          transition-all animate-in slide-in-from-right
          ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Zap size={22} className="text-emerald-500" /> New Leads
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Accept leads before they expire. Fast response = more jobs.</p>
        </div>
        <button onClick={handleRefresh}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600
                     hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Available",   value: newCount,      color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: Zap },
          { label: "Accepted",    value: acceptedCount, color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",       icon: CheckCircle2 },
          { label: "Passed",      value: passedCount,   color: "text-slate-500",   bg: "bg-slate-50 border-slate-200",     icon: X },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-2xl border p-3.5 flex items-center gap-3 ${bg}`}>
            <Icon size={18} className={color} />
            <div>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {[
          { key: "new", label: `Active (${newCount})` },
          { key: "all", label: "All Leads" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveSection(key as any)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all
              ${activeSection === key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <FiltersBar
        search={search} setSearch={setSearch}
        urgencyFilter={urgencyFilter} setUrgencyFilter={setUrgencyFilter}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        sortBy={sortBy} setSortBy={setSortBy}
      />

      {/* Tip banner */}
      {newCount > 0 && activeSection === "new" && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
          <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            <strong>Pro tip:</strong> Leads with fewer competing vendors = higher chance of getting the job.
            Accept urgent leads first — they pay premium rates!
          </p>
        </div>
      )}

      {/* Leads Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-3xl">🔍</div>
          <p className="font-bold text-slate-700 text-lg mb-1">No leads found</p>
          <p className="text-sm text-slate-400 max-w-xs">
            {activeSection === "new"
              ? "No active leads right now. Check back soon or refresh."
              : "Try adjusting your filters."}
          </p>
          <button onClick={handleRefresh}
            className="mt-5 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2">
            <RefreshCw size={14} /> Refresh Leads
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onView={setSelectedLead}
              onAccept={handleAccept}
              onPass={handlePass}
            />
          ))}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadModal
          lead={leads.find((l) => l.id === selectedLead.id) ?? selectedLead}
          onClose={() => setSelectedLead(null)}
          onAccept={handleAccept}
          onPass={handlePass}
        />
      )}
    </div>
  );
}
