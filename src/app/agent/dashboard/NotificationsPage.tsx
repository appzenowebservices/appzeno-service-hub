// src/pages/agent/dashboard/NotificationsPage.tsx
// Notifications — Agent Dashboard
// Action buttons pe inline detail panels show honge

import { useState, useMemo } from "react";
import {
  Bell, BellOff, CheckCheck, Search,
  ClipboardList, Scale, Users, IndianRupee,
  Settings, ChevronDown, ChevronUp, X,
  AlertTriangle, CheckCircle2, Clock, Zap,
  RefreshCw, Star, MapPin, Phone, ArrowRight,
  ToggleLeft, ToggleRight, Info, Shield,
  UserCheck, UserX, Ban, MessageSquare,
  TrendingUp, TrendingDown, Briefcase,
  Calendar, FileText, ArrowUpRight, CircleDot,
  ThumbsUp, ThumbsDown, CreditCard, Loader2,
  User,
} from "lucide-react";
import {
  MOCK_VENDORS, MOCK_LEADS, MOCK_DISPUTES, MOCK_PENDING_VENDORS,
  type VendorItem, type LeadItem, type DisputeItem, type PendingVendor,
} from "./mockAgentData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifCategory =
  | "lead" | "dispute" | "vendor" | "commission" | "approval" | "system";

export type NotifPriority = "urgent" | "normal" | "low";

export interface NotifAction {
  label:  string;
  tab?:   string;
  style:  "primary" | "secondary" | "danger";
  // Extra context for inline detail panel
  detail?: "lead" | "dispute" | "vendor" | "approval" | "commission_detail" | "suspend_confirm" | "reactivate_confirm";
  refId?: string;   // bookingId / vendorName / etc to match mock data
}

export interface NotificationItem {
  id:           string;
  category:     NotifCategory;
  priority:     NotifPriority;
  title:        string;
  subtitle:     string;
  body:         string;
  time:         string;
  timeRaw:      number;
  read:         boolean;
  icon:         string;
  meta?: {
    bookingId?:  string;
    vendorName?: string;
    amount?:     number;
    area?:       string;
    rating?:     number;
    phone?:      string;
  };
  actions: NotifAction[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const NOW  = Date.now();
const mins  = (n: number) => NOW - n * 60 * 1000;
const hours = (n: number) => NOW - n * 60 * 60 * 1000;
const days  = (n: number) => NOW - n * 24 * 60 * 60 * 1000;

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "N001", category: "lead", priority: "urgent", read: false,
    icon: "🚨",
    title: "Emergency Lead Expiring Soon!",
    subtitle: "BK-2602-0052 · Plumbing · Vaishali",
    body: "Pooja Mehta has a pipe leak emergency. The lead will expire in 5 minutes if not assigned. 2 vendors are available nearby — Kumar Home Services (0.8 km) and RapidFix Plumbing (3.5 km). Immediate action required.",
    time: "5 min ago", timeRaw: mins(5),
    meta: { bookingId: "BK-2602-0052", vendorName: "Kumar Home Services", area: "Vaishali", phone: "+91 87654 32109" },
    actions: [
      { label: "Assign Now",  tab: "leads", style: "primary",   detail: "lead",   refId: "BK-2602-0052" },
      { label: "View Lead",   tab: "leads", style: "secondary", detail: "lead",   refId: "BK-2602-0052" },
    ],
  },
  {
    id: "N002", category: "approval", priority: "urgent", read: false,
    icon: "📋",
    title: "3 Vendors Awaiting KYC Approval",
    subtitle: "Pending for 2+ hours",
    body: "Ramesh Plumbers, CoolBreeze AC Services, and SparkFix Electrical have submitted their KYC documents and are waiting for approval. All 3 vendors have their Aadhaar and PAN verified. Photo and address documents are under review.",
    time: "2 hr ago", timeRaw: hours(2),
    meta: {},
    actions: [
      { label: "Review Approvals", tab: "approvals", style: "primary",   detail: "approval" },
      { label: "Dismiss",                            style: "secondary" },
    ],
  },
  {
    id: "N003", category: "dispute", priority: "urgent", read: false,
    icon: "⚖️",
    title: "Dispute Escalated to You",
    subtitle: "BK-2602-0031 · Pooja Mehta vs Kumar Plumbers",
    body: "A dispute has been escalated to your attention. Customer Pooja Mehta claims incomplete work on a pipe repair job. Kumar Plumbers denies the claim. Refund requested: ₹500. Both parties have submitted their statements. Your verdict is awaited.",
    time: "4 hr ago", timeRaw: hours(4),
    meta: { bookingId: "BK-2602-0031", vendorName: "Kumar Plumbers", amount: 500, phone: "+91 87654 32109" },
    actions: [
      { label: "Resolve Dispute", tab: "disputes", style: "primary",   detail: "dispute", refId: "BK-2602-0031" },
      { label: "View Details",    tab: "disputes", style: "secondary", detail: "dispute", refId: "BK-2602-0031" },
    ],
  },
  {
    id: "N004", category: "lead", priority: "normal", read: false,
    icon: "📌",
    title: "New Priority Lead Assigned to Queue",
    subtitle: "BK-2602-0051 · AC Service · Indirapuram",
    body: "Amit Sharma has booked an AC Service & Cleaning for today 11:00 AM – 1:00 PM. Estimated value: ₹1,200. 3 vendors have been suggested based on proximity and rating. Lead expires in 22 minutes.",
    time: "8 min ago", timeRaw: mins(8),
    meta: { bookingId: "BK-2602-0051", area: "Indirapuram", amount: 1200 },
    actions: [
      { label: "Assign Vendor", tab: "leads", style: "primary", detail: "lead", refId: "BK-2602-0051" },
    ],
  },
  {
    id: "N005", category: "vendor", priority: "normal", read: false,
    icon: "⚠️",
    title: "Vendor Below Rating Threshold",
    subtitle: "QuickFix Services · Current Rating: 3.1★",
    body: "QuickFix Services (Manoj Tiwari) has dropped below the minimum rating threshold of 3.5★. Current rating is 3.1★ based on 42 reviews. They have 3 unresolved complaints in the last 30 days. Consider suspension or performance review.",
    time: "3 hr ago", timeRaw: hours(3),
    meta: { vendorName: "QuickFix Services", rating: 3.1, phone: "+91 54321 09876" },
    actions: [
      { label: "View Vendor", tab: "vendors",  style: "secondary", detail: "vendor",          refId: "QuickFix Services" },
      { label: "Suspend",                       style: "danger",    detail: "suspend_confirm",  refId: "QuickFix Services" },
    ],
  },
  {
    id: "N006", category: "commission", priority: "normal", read: true,
    icon: "💰",
    title: "Weekly Commission Credited",
    subtitle: "₹1,180 credited to your account",
    body: "Your commission for Feb 2026 (Week 3) has been successfully credited. 83 jobs were completed in your city this week. UPI Reference: UPI2602221180X. The payment was processed on 22 Feb 2026.",
    time: "6 hr ago", timeRaw: hours(6),
    meta: { amount: 1180 },
    actions: [
      { label: "View Commission", tab: "commission", style: "secondary", detail: "commission_detail" },
    ],
  },
  {
    id: "N007", category: "vendor", priority: "normal", read: true,
    icon: "🆕",
    title: "New Vendor Registration",
    subtitle: "SparkFix Electrical · KYC Pending",
    body: "A new vendor has registered on the platform. SparkFix Electrical (Vijay Singh) has completed their basic profile. KYC documents have been submitted and are pending your review. They specialize in Wiring, Switch Repair, and Fan Installation.",
    time: "5 hr ago", timeRaw: hours(5),
    meta: { vendorName: "SparkFix Electrical", phone: "+91 76543 21098", area: "Kaushambi" },
    actions: [
      { label: "Review KYC", tab: "approvals", style: "primary", detail: "approval" },
    ],
  },
  {
    id: "N008", category: "dispute", priority: "normal", read: true,
    icon: "🤝",
    title: "Dispute Resolved Successfully",
    subtitle: "BK-2602-0018 · Refund ₹800 issued",
    body: "The dispute for booking BK-2602-0018 has been successfully resolved. A partial refund of ₹800 has been issued to the customer. Vendor HandyMan Co. has been notified. Both parties confirmed the resolution. Case closed.",
    time: "Yesterday, 3:00 PM", timeRaw: days(1) + hours(3),
    meta: { bookingId: "BK-2602-0018", vendorName: "HandyMan Co.", amount: 800 },
    actions: [
      { label: "View Case", tab: "disputes", style: "secondary", detail: "dispute", refId: "BK-2602-0031" },
    ],
  },
  {
    id: "N009", category: "lead", priority: "normal", read: true,
    icon: "✅",
    title: "Lead Successfully Assigned",
    subtitle: "BK-2602-0049 · Cleaning → CleanPro Services",
    body: "Lead BK-2602-0049 (Deep Cleaning for Sunita Rao) has been successfully assigned to CleanPro Services. The vendor has accepted the job and will arrive on 01 Mar 2026, 9:00 AM. Customer has been notified.",
    time: "Yesterday, 1:15 PM", timeRaw: days(1) + hours(1),
    meta: { bookingId: "BK-2602-0049", vendorName: "CleanPro Services", area: "Kaushambi", amount: 3500 },
    actions: [],
  },
  {
    id: "N010", category: "vendor", priority: "urgent", read: true,
    icon: "🚫",
    title: "Vendor Suspended — Action Confirmed",
    subtitle: "QuickFix Services suspended",
    body: "QuickFix Services has been suspended from the platform due to 3 unresolved customer complaints and a rating below 3.5★. The suspension takes immediate effect. All their pending leads have been reassigned. You can reactivate them after a performance review.",
    time: "Yesterday, 11:30 AM", timeRaw: days(1),
    meta: { vendorName: "QuickFix Services", phone: "+91 54321 09876" },
    actions: [
      { label: "Reactivate", tab: "vendors", style: "secondary", detail: "reactivate_confirm", refId: "QuickFix Services" },
    ],
  },
  {
    id: "N011", category: "lead", priority: "normal", read: true,
    icon: "⏰",
    title: "Lead Expired — No Vendor Available",
    subtitle: "BK-2602-0046 · Carpentry · Loni",
    body: "Lead BK-2602-0046 for Geeta Yadav (Door Repair, Loni) has expired after 30 minutes without vendor assignment. No suitable vendor was available in the Loni area. Customer has been notified and offered a rebooking option.",
    time: "Yesterday, 10:00 AM", timeRaw: days(1) - hours(1),
    meta: { bookingId: "BK-2602-0046", area: "Loni" },
    actions: [
      { label: "Re-assign", tab: "leads", style: "primary", detail: "lead", refId: "BK-2602-0051" },
    ],
  },
  {
    id: "N012", category: "system", priority: "normal", read: true,
    icon: "📊",
    title: "Weekly Performance Report Ready",
    subtitle: "Feb 2026 — Week 3 Summary",
    body: "Your weekly performance report is now available. This week: 83 jobs completed, ₹138,000 gross revenue, 4.4 avg vendor rating, 2 open disputes (9 resolved). Lead assignment rate: 87%. City health score improved by 3 points to 78/100.",
    time: "Yesterday, 9:00 AM", timeRaw: days(1) - hours(2),
    meta: { amount: 138000 },
    actions: [
      { label: "View Analytics", tab: "analytics", style: "secondary" },
    ],
  },
  {
    id: "N013", category: "approval", priority: "normal", read: true,
    icon: "✅",
    title: "Vendor Approved — Kumar Home Services",
    subtitle: "All KYC documents verified",
    body: "Kumar Home Services (Ramesh Kumar) has been successfully approved after KYC verification. All 4 documents — Aadhaar, PAN, Photo, and Address — have been verified. The vendor is now active on the platform and can start receiving leads.",
    time: "2 days ago", timeRaw: days(2),
    meta: { vendorName: "Kumar Home Services", phone: "+91 98765 43210" },
    actions: [],
  },
  {
    id: "N014", category: "commission", priority: "normal", read: true,
    icon: "📈",
    title: "Commission Milestone — ₹5,000 This Month",
    subtitle: "You've crossed ₹4,980 in Feb 2026",
    body: "Congratulations! You've earned ₹4,980 in commission this month (Feb 2026), which is your best month so far. This is a 43% increase over January 2026 (₹3,380). Your city recorded 312 completed jobs this month.",
    time: "2 days ago", timeRaw: days(2) - hours(3),
    meta: { amount: 4980 },
    actions: [
      { label: "View Commission", tab: "commission", style: "secondary", detail: "commission_detail" },
    ],
  },
  {
    id: "N015", category: "vendor", priority: "low", read: true,
    icon: "💤",
    title: "5 Vendors Inactive for 7+ Days",
    subtitle: "Action may be required",
    body: "The following vendors have not accepted any leads in the past 7 days: HandyMan Co., RapidFix Plumbing, ColorCraft Painters, BrightWalls Co., and ArcticCool Pro. Consider reaching out to check on their availability or temporarily deactivating them.",
    time: "2 days ago", timeRaw: days(2) - hours(5),
    meta: {},
    actions: [
      { label: "View Vendors", tab: "vendors", style: "secondary", detail: "vendor", refId: "Kumar Home Services" },
    ],
  },
  {
    id: "N016", category: "system", priority: "low", read: true,
    icon: "🔔",
    title: "New Feature: Bulk Lead Assignment",
    subtitle: "Platform update — v2.4.0",
    body: "A new bulk lead assignment feature has been deployed. You can now assign multiple leads to vendors in a single action from the Lead Management page. Additionally, the dispute resolution workflow has been updated with faster escalation paths.",
    time: "3 days ago", timeRaw: days(3),
    meta: {},
    actions: [],
  },
  {
    id: "N017", category: "dispute", priority: "urgent", read: true,
    icon: "🔴",
    title: "High-Priority Dispute — Property Damage Claim",
    subtitle: "BK-2602-0035 · SparkFix Electrical · ₹45,000",
    body: "A high-priority dispute has been escalated to admin. Customer Amit Sharma claims SparkFix Electrical damaged their LED TV during wiring work. The claim amount of ₹45,000 exceeds your resolution authority of ₹10,000. Admin has been notified.",
    time: "3 days ago", timeRaw: days(3) - hours(2),
    meta: { bookingId: "BK-2602-0035", vendorName: "SparkFix Electrical", amount: 45000 },
    actions: [
      { label: "View Dispute", tab: "disputes", style: "secondary", detail: "dispute", refId: "BK-2602-0031" },
    ],
  },
  {
    id: "N018", category: "lead", priority: "normal", read: true,
    icon: "🎯",
    title: "Peak Demand Alert — AC Service",
    subtitle: "18 AC leads today — 3x usual volume",
    body: "AC Service bookings are unusually high today — 18 leads received compared to the daily average of 6. This may be due to the heatwave forecast. Consider reaching out to inactive AC vendors to temporarily increase capacity in your city.",
    time: "4 days ago", timeRaw: days(4),
    meta: { area: "Ghaziabad" },
    actions: [
      { label: "View Leads",   tab: "leads",   style: "primary",   detail: "lead",   refId: "BK-2602-0051" },
      { label: "View Vendors", tab: "vendors", style: "secondary", detail: "vendor", refId: "Kumar Home Services" },
    ],
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<NotifCategory, {
  label: string; icon: React.ElementType;
  color: string; bg: string; border: string; dot: string;
}> = {
  lead:       { label: "Leads",      icon: ClipboardList, color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200",  dot: "bg-violet-400"  },
  dispute:    { label: "Disputes",   icon: Scale,         color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",     dot: "bg-red-400"     },
  vendor:     { label: "Vendors",    icon: Users,         color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-400"    },
  commission: { label: "Commission", icon: IndianRupee,   color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-400" },
  approval:   { label: "Approvals",  icon: CheckCircle2,  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-400"   },
  system:     { label: "System",     icon: Info,          color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200",   dot: "bg-slate-400"   },
};

const PRIORITY_CONFIG: Record<NotifPriority, {
  label: string; color: string; bg: string; icon: React.ElementType;
}> = {
  urgent: { label: "Urgent", color: "text-red-600",   bg: "bg-red-100",   icon: Zap    },
  normal: { label: "Normal", color: "text-slate-600", bg: "bg-slate-100", icon: Bell   },
  low:    { label: "Low",    color: "text-slate-400", bg: "bg-slate-50",  icon: BellOff},
};

const CATEGORY_TABS: { key: NotifCategory | "all"; label: string; icon: React.ElementType }[] = [
  { key: "all",        label: "All",        icon: Bell          },
  { key: "lead",       label: "Leads",      icon: ClipboardList },
  { key: "dispute",    label: "Disputes",   icon: Scale         },
  { key: "vendor",     label: "Vendors",    icon: Users         },
  { key: "commission", label: "Commission", icon: IndianRupee   },
  { key: "approval",   label: "Approvals",  icon: CheckCircle2  },
  { key: "system",     label: "System",     icon: Info          },
];

// ─── Helper: group by time ────────────────────────────────────────────────────

function groupByTime(notifs: NotificationItem[]): { label: string; items: NotificationItem[] }[] {
  const now              = Date.now();
  const todayStart       = new Date(); todayStart.setHours(0,0,0,0);
  const yesterdayStart   = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate()-1);
  const weekStart        = new Date(todayStart); weekStart.setDate(weekStart.getDate()-7);
  const groups: Record<string, NotificationItem[]> = {
    "Today": [], "Yesterday": [], "This Week": [], "Earlier": [],
  };
  notifs.forEach(n => {
    const t = n.timeRaw;
    if      (t >= todayStart.getTime())     groups["Today"].push(n);
    else if (t >= yesterdayStart.getTime()) groups["Yesterday"].push(n);
    else if (t >= weekStart.getTime())      groups["This Week"].push(n);
    else                                    groups["Earlier"].push(n);
  });
  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

// ─── DETAIL PANELS ────────────────────────────────────────────────────────────

// ── Lead Detail Panel ──────────────────────────────────────────────────────────
function LeadDetailPanel({ refId, onNavigate, onClose }: {
  refId?: string; onNavigate: (tab: string) => void; onClose: () => void;
}) {
  const lead: LeadItem | undefined = refId
    ? MOCK_LEADS.find(l => l.bookingId === refId) || MOCK_LEADS[0]
    : MOCK_LEADS[0];

  const [assigning, setAssigning] = useState(false);
  const [assigned,  setAssigned]  = useState(false);
  const [chosenV,   setChosenV]   = useState<string | null>(null);

  if (!lead) return null;

  const expirePct = Math.max(0, Math.min(100,
    (lead.expiresInMins / lead.totalExpireMins) * 100
  ));

  function handleAssign(vendorId: string, vendorName: string) {
    setChosenV(vendorName);
    setAssigning(true);
    setTimeout(() => { setAssigning(false); setAssigned(true); }, 1400);
  }

  return (
    <div className="mt-3 rounded-2xl border-2 border-violet-200 bg-violet-50/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-violet-600 text-white">
        <div className="flex items-center gap-2">
          <span className="text-lg">{lead.categoryIcon}</span>
          <div>
            <p className="text-xs font-black">{lead.bookingId} · {lead.service}</p>
            <p className="text-xs text-violet-200">{lead.subService}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Expiry progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Expires in</span>
            <span className={`font-black ${lead.expiresInMins <= 10 ? "text-red-600" : "text-amber-600"}`}>
              {lead.expiresIn}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${lead.expiresInMins <= 10 ? "bg-red-500" : "bg-amber-400"}`}
              style={{ width: `${expirePct}%` }} />
          </div>
        </div>

        {/* Customer + Address */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Customer</p>
            <p className="text-sm font-black text-slate-800">{lead.customer.name}</p>
            <a href={`tel:${lead.customer.phone}`}
              className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
              <Phone size={10} /> {lead.customer.phone}
            </a>
            <p className="text-xs text-amber-600 font-bold mt-1">★ {lead.customer.rating} · {lead.customer.totalBookings} bookings</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Location</p>
            <p className="text-sm font-black text-slate-800">{lead.address.area}</p>
            <p className="text-xs text-slate-500 mt-0.5">{lead.address.city} · {lead.address.pincode}</p>
            <p className="text-xs text-slate-400 mt-1 leading-snug">{lead.address.fullAddress}</p>
          </div>
        </div>

        {/* Schedule + Amount */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white rounded-xl p-3 border border-slate-100 flex items-center gap-2">
            <Calendar size={14} className="text-violet-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Scheduled</p>
              <p className="text-xs font-black text-slate-800">{lead.scheduledDate}</p>
              <p className="text-xs text-slate-500">{lead.scheduledSlot}</p>
            </div>
          </div>
          <div className="flex-1 bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-center gap-2">
            <IndianRupee size={14} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Est. Value</p>
              <p className="text-sm font-black text-emerald-700">₹{lead.amount.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* Suggested Vendors */}
        {!assigned ? (
          <>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Suggested Vendors ({lead.suggestedVendors.length})</p>
            <div className="space-y-2">
              {lead.suggestedVendors.map(v => (
                <div key={v.id}
                  className={`bg-white rounded-xl p-3 border ${v.available ? "border-slate-200" : "border-slate-100 opacity-60"} flex items-center gap-3`}>
                  <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-black text-sm flex-shrink-0">
                    {v.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{v.name}</p>
                    <p className="text-xs text-slate-400">★ {v.rating} · {v.jobsDone} jobs · {v.distance}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${v.responseRate}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{v.responseRate}% resp.</span>
                    </div>
                  </div>
                  {v.available ? (
                    <button
                      onClick={() => handleAssign(v.id, v.name)}
                      disabled={assigning}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors flex-shrink-0">
                      {assigning ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={11} />}
                      Assign
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium flex-shrink-0">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
            <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-black text-emerald-800">Lead Assigned!</p>
            <p className="text-xs text-emerald-600 mt-1">{chosenV} has been notified.</p>
          </div>
        )}

        {/* Full page link */}
        <button onClick={() => { onNavigate("leads"); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-violet-300 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors">
          Open Lead Management <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Dispute Detail Panel ──────────────────────────────────────────────────────
function DisputeDetailPanel({ refId, onNavigate, onClose }: {
  refId?: string; onNavigate: (tab: string) => void; onClose: () => void;
}) {
  const dispute: DisputeItem | undefined = refId
    ? MOCK_DISPUTES.find(d => d.bookingId === refId) || MOCK_DISPUTES[0]
    : MOCK_DISPUTES[0];

  const [verdict, setVerdict]   = useState<"favor_customer" | "favor_vendor" | null>(null);
  const [note,    setNote]      = useState("");
  const [loading, setLoading]   = useState(false);
  const [resolved,setResolved]  = useState(false);

  if (!dispute) return null;

  const priorityColor = dispute.priority === "high" ? "bg-red-100 text-red-700 border-red-200"
    : dispute.priority === "medium" ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-slate-100 text-slate-600 border-slate-200";

  function submitVerdict() {
    if (!verdict) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setResolved(true); }, 1400);
  }

  return (
    <div className="mt-3 rounded-2xl border-2 border-red-200 bg-red-50/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-red-600 text-white">
        <div className="flex items-center gap-2">
          <Scale size={16} />
          <div>
            <p className="text-xs font-black">{dispute.bookingId} · {dispute.service}</p>
            <p className="text-xs text-red-200">{dispute.customer.name} vs {dispute.vendor.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status + Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${priorityColor}`}>
            {dispute.priority.toUpperCase()} PRIORITY
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 capitalize">
            {dispute.status.replace("_", " ")}
          </span>
          <span className="text-xs text-slate-400 ml-auto">Raised {dispute.raisedAt}</span>
        </div>

        {/* Customer vs Vendor */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={10} className="text-blue-600" />
              </div>
              <span className="text-xs font-black text-blue-700">Customer</span>
            </div>
            <p className="text-sm font-black text-slate-800">{dispute.customer.name}</p>
            <a href={`tel:${dispute.customer.phone}`}
              className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
              <Phone size={9} /> {dispute.customer.phone}
            </a>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                <Briefcase size={10} className="text-violet-600" />
              </div>
              <span className="text-xs font-black text-violet-700">Vendor</span>
            </div>
            <p className="text-sm font-black text-slate-800">{dispute.vendor.name}</p>
            <a href={`tel:${dispute.vendor.phone}`}
              className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
              <Phone size={9} /> {dispute.vendor.phone}
            </a>
          </div>
        </div>

        {/* Financial */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 text-center">
            <p className="text-xs text-slate-400">Job Amount</p>
            <p className="text-sm font-black text-slate-800">₹{dispute.jobAmount.toLocaleString("en-IN")}</p>
          </div>
          <div className="flex-1 bg-red-50 rounded-xl p-3 border border-red-200 text-center">
            <p className="text-xs text-slate-400">Refund Requested</p>
            <p className="text-sm font-black text-red-700">₹{dispute.refundAmount > 0 ? dispute.refundAmount.toLocaleString("en-IN") : "Pending"}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-500 mb-1.5">Complaint</p>
          <p className="text-xs text-slate-700 leading-relaxed">{dispute.description}</p>
        </div>

        {/* Timeline mini */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Progress</p>
          <div className="flex items-center gap-1">
            {dispute.timeline.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${step.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                  {step.done ? "✓" : i + 1}
                </div>
                <p className="text-2xs text-slate-400 text-center leading-tight" style={{ fontSize: "9px" }}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Verdict (only if not resolved) */}
        {!resolved && dispute.status !== "closed" ? (
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <p className="text-xs font-black text-slate-700">Quick Verdict</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setVerdict("favor_customer")}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all
                  ${verdict === "favor_customer" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                <ThumbsUp size={13} /> Favor Customer
              </button>
              <button
                onClick={() => setVerdict("favor_vendor")}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all
                  ${verdict === "favor_vendor" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-violet-300"}`}>
                <ThumbsDown size={13} /> Favor Vendor
              </button>
            </div>
            {verdict && (
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add verdict note (optional)..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-violet-400"
              />
            )}
            <div className="flex gap-2">
              <button onClick={() => { onNavigate("disputes"); onClose(); }}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                Full Details
              </button>
              <button
                onClick={submitVerdict}
                disabled={!verdict || loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-colors">
                {loading ? <Loader2 size={11} className="animate-spin" /> : <Scale size={11} />}
                Submit Verdict
              </button>
            </div>
          </div>
        ) : resolved ? (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
            <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-black text-emerald-800">Verdict Submitted!</p>
            <p className="text-xs text-emerald-600 mt-1">
              {verdict === "favor_customer" ? "Refund approved in favor of customer." : "Case closed in favor of vendor."}
            </p>
          </div>
        ) : (
          <button onClick={() => { onNavigate("disputes"); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-300 text-red-700 text-xs font-bold hover:bg-red-50 transition-colors">
            Open Dispute Resolution <ArrowUpRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Vendor Detail Panel ───────────────────────────────────────────────────────
function VendorDetailPanel({ refId, onNavigate, onClose }: {
  refId?: string; onNavigate: (tab: string) => void; onClose: () => void;
}) {
  const vendor: VendorItem | undefined = refId
    ? MOCK_VENDORS.find(v => v.name.toLowerCase().includes(refId.toLowerCase())) || MOCK_VENDORS[0]
    : MOCK_VENDORS[0];

  if (!vendor) return null;

  const statusColor = vendor.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-300"
    : vendor.status === "suspended" ? "bg-red-100 text-red-700 border-red-300"
    : "bg-amber-100 text-amber-700 border-amber-300";

  const kycItems = [
    { label: "Aadhaar", ok: vendor.kycAadhaar },
    { label: "PAN",     ok: vendor.kycPan     },
    { label: "Photo",   ok: vendor.kycPhoto   },
    { label: "Address", ok: vendor.kycAddress },
  ];

  return (
    <div className="mt-3 rounded-2xl border-2 border-blue-200 bg-blue-50/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
            {vendor.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-black">{vendor.name}</p>
            <p className="text-xs text-blue-200">{vendor.ownerName} · {vendor.category}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status + Contact */}
        <div className="flex items-center justify-between gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor}`}>
            {vendor.status.toUpperCase()}
          </span>
          <a href={`tel:${vendor.phone}`}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
            <Phone size={11} /> {vendor.phone}
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Rating",     value: `${vendor.rating}★`, color: "text-amber-600" },
            { label: "Jobs",       value: vendor.jobsDone,      color: "text-violet-600" },
            { label: "Completion", value: `${vendor.completionRate}%`, color: "text-emerald-600" },
            { label: "Response",   value: `${vendor.responseRate}%`,  color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-2.5 border border-slate-100 text-center">
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-2xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* KYC */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2">KYC Status</p>
          <div className="grid grid-cols-4 gap-2">
            {kycItems.map(k => (
              <div key={k.label}
                className={`rounded-xl p-2 border text-center ${k.ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                <p className={`text-base ${k.ok ? "text-emerald-500" : "text-red-400"}`}>{k.ok ? "✓" : "✗"}</p>
                <p className="text-2xs text-slate-500 font-medium mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-2">
          <MapPin size={13} className="text-slate-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-800">{vendor.area}, {vendor.city}</p>
            <p className="text-xs text-slate-400 mt-0.5">Last active: {vendor.lastActive}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-emerald-700 font-black">₹{vendor.totalEarnings.toLocaleString("en-IN")}</p>
            <p className="text-2xs text-slate-400">Total earnings</p>
          </div>
        </div>

        {/* Recent services */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Services</p>
          <div className="flex flex-wrap gap-1.5">
            {vendor.services.slice(0, 5).map(s => (
              <span key={s} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => { onNavigate("vendors"); onClose(); }}
            className="flex-1 py-2.5 rounded-xl border border-blue-300 text-blue-700 text-xs font-bold hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors">
            <ArrowUpRight size={12} /> Full Profile
          </button>
          {vendor.status === "active" ? (
            <button className="flex-1 py-2.5 rounded-xl bg-red-100 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-200 flex items-center justify-center gap-1.5 transition-colors">
              <Ban size={12} /> Suspend
            </button>
          ) : vendor.status === "suspended" ? (
            <button className="flex-1 py-2.5 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-200 flex items-center justify-center gap-1.5 transition-colors">
              <CheckCircle2 size={12} /> Reactivate
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Approval Panel ────────────────────────────────────────────────────────────
function ApprovalDetailPanel({ onNavigate, onClose }: {
  onNavigate: (tab: string) => void; onClose: () => void;
}) {
  const [approving, setApproving] = useState<string | null>(null);
  const [approved,  setApproved]  = useState<string[]>([]);
  const [rejected,  setRejected]  = useState<string[]>([]);

  const pending = MOCK_PENDING_VENDORS.slice(0, 3);

  function doApprove(id: string) {
    setApproving(id);
    setTimeout(() => { setApproving(null); setApproved(a => [...a, id]); }, 1200);
  }
  function doReject(id: string) {
    setRejected(r => [...r, id]);
  }

  const kycLabel = (status: string) =>
    status === "verified"  ? <span className="text-emerald-600 font-bold">✓ Verified</span>  :
    status === "submitted" ? <span className="text-amber-600 font-bold">⏳ Submitted</span>  :
    <span className="text-red-500 font-bold">✗ Missing</span>;

  return (
    <div className="mt-3 rounded-2xl border-2 border-amber-200 bg-amber-50/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-amber-600 text-white">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} />
          <p className="text-xs font-black">Pending KYC Approvals ({pending.length})</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {pending.map(v => {
          const isApproved = approved.includes(v.id);
          const isRejected = rejected.includes(v.id);
          const isLoading  = approving === v.id;
          const allDocs = Object.values(v.kyc).every(s => s !== "missing");

          return (
            <div key={v.id}
              className={`bg-white rounded-2xl border p-4 transition-all
                ${isApproved ? "border-emerald-300 opacity-70" : isRejected ? "border-red-200 opacity-50" : "border-slate-200"}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black text-lg flex-shrink-0">
                  {v.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">{v.name}</p>
                  <p className="text-xs text-slate-500">{v.ownerName} · {v.category}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={10} className="text-slate-400" />
                    <span className="text-xs text-slate-400">{v.area}, {v.city}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <Clock size={10} className="text-amber-500" />
                    <span className="text-xs text-amber-600 font-semibold">{v.appliedDate}</span>
                  </div>
                </div>
              </div>

              {/* KYC docs mini grid */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {(["aadhaar", "pan", "photo", "address"] as const).map(doc => (
                  <div key={doc}
                    className={`rounded-lg p-1.5 border text-center
                      ${v.kyc[doc] === "verified" ? "bg-emerald-50 border-emerald-200" :
                        v.kyc[doc] === "submitted" ? "bg-amber-50 border-amber-200" :
                        "bg-red-50 border-red-200"}`}>
                    <p className="text-xs" style={{ fontSize: "9px" }}>
                      {v.kyc[doc] === "verified" ? "✓" : v.kyc[doc] === "submitted" ? "⏳" : "✗"}
                    </p>
                    <p className="text-2xs text-slate-500 capitalize" style={{ fontSize: "9px" }}>{doc}</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              {isApproved ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                  <CheckCircle2 size={14} /> Approved! Vendor is now active.
                </div>
              ) : isRejected ? (
                <div className="flex items-center gap-2 text-xs text-red-600 font-bold">
                  <X size={14} /> Rejected. Vendor notified.
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => doReject(v.id)}
                    className="flex-1 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-1.5 transition-colors">
                    <X size={11} /> Reject
                  </button>
                  <button
                    onClick={() => doApprove(v.id)}
                    disabled={!allDocs || isLoading}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
                    {isLoading ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={11} />}
                    {allDocs ? "Approve" : "Docs Missing"}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={() => { onNavigate("approvals"); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">
          Open Full KYC Review <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Commission Detail Panel ───────────────────────────────────────────────────
function CommissionDetailPanel({ onNavigate, onClose }: {
  onNavigate: (tab: string) => void; onClose: () => void;
}) {
  const breakdown = [
    { week: "Week 3 (17–23 Feb)", jobs: 83, gross: 138000, agent: 1380, status: "credited", upi: "UPI2602221380X" },
    { week: "Week 2 (10–16 Feb)", jobs: 71, gross: 118500, agent: 1185, status: "credited", upi: "UPI2602161185X" },
    { week: "Week 1 (01–09 Feb)", jobs: 98, gross: 163000, agent: 1630, status: "credited", upi: "UPI2602091630X" },
    { week: "This Week",          jobs: 22, gross: 36700,  agent: 367,  status: "pending",  upi: null           },
  ];
  const total = breakdown.reduce((s, b) => s + b.agent, 0);
  const credited = breakdown.filter(b => b.status === "credited").reduce((s, b) => s + b.agent, 0);

  return (
    <div className="mt-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-700 text-white">
        <div className="flex items-center gap-2">
          <IndianRupee size={16} />
          <p className="text-xs font-black">Commission Summary — Feb 2026</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Total + credited */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
            <p className="text-xs text-slate-400">Month Total</p>
            <p className="text-xl font-black text-emerald-700">₹{total.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
            <p className="text-xs text-slate-400">Credited</p>
            <p className="text-xl font-black text-emerald-700">₹{credited.toLocaleString("en-IN")}</p>
            <div className="mt-1 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(credited/total)*100}%` }} />
            </div>
          </div>
        </div>

        {/* Weekly breakdown */}
        <div className="space-y-2">
          {breakdown.map((b, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{b.week}</p>
                <p className="text-xs text-slate-400">{b.jobs} jobs · ₹{b.gross.toLocaleString("en-IN")} gross</p>
                {b.upi && <p className="text-2xs text-slate-300 font-mono mt-0.5">{b.upi}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-emerald-700">+₹{b.agent.toLocaleString("en-IN")}</p>
                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full
                  ${b.status === "credited" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {b.status === "credited" ? "✓ Credited" : "⏳ Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { onNavigate("commission"); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-300 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
          Open Commission Page <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Suspend Confirm Panel ─────────────────────────────────────────────────────
function SuspendConfirmPanel({ refId, onClose }: {
  refId?: string; onClose: () => void;
}) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const REASONS = [
    "Rating below threshold (< 3.5★)",
    "3+ unresolved customer complaints",
    "Fraudulent activity reported",
    "Repeated no-shows",
    "Platform policy violation",
    "Customer harassment",
  ];

  function confirm() {
    if (!reason) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
  }

  return (
    <div className="mt-3 rounded-2xl border-2 border-red-300 bg-red-50/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-red-700 text-white">
        <div className="flex items-center gap-2">
          <Ban size={15} />
          <p className="text-xs font-black">Suspend Vendor — {refId || "QuickFix Services"}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {!done ? (
          <>
            <div className="bg-red-100 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-800">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5 text-red-600" />
              This will immediately remove the vendor from receiving new leads. All active leads will be reassigned.
            </div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-wide">Reason for Suspension</p>
            <div className="space-y-2">
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-all
                    ${reason === r ? "border-red-500 bg-red-100 text-red-800 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-red-300"}`}>
                  {reason === r ? "● " : "○ "}{r}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={confirm} disabled={!reason || loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {loading ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />}
                Confirm Suspend
              </button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Ban size={22} className="text-red-600" />
            </div>
            <p className="text-sm font-black text-slate-800">Vendor Suspended</p>
            <p className="text-xs text-slate-500 mt-1">{refId || "QuickFix Services"} has been suspended. All leads reassigned.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reactivate Confirm Panel ──────────────────────────────────────────────────
function ReactivateConfirmPanel({ refId, onClose }: {
  refId?: string; onClose: () => void;
}) {
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote]       = useState("");

  function confirm() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
  }

  return (
    <div className="mt-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-700 text-white">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} />
          <p className="text-xs font-black">Reactivate Vendor — {refId || "QuickFix Services"}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {!done ? (
          <>
            <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-800">
              <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5 text-emerald-600" />
              Reactivating will allow the vendor to receive new leads again. Ensure performance issues have been resolved.
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Note to Vendor (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Performance reviewed. Maintain rating above 3.5★..."
                rows={2}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button onClick={confirm} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1.5">
                {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                Reactivate
              </button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={22} className="text-emerald-600" />
            </div>
            <p className="text-sm font-black text-slate-800">Vendor Reactivated!</p>
            <p className="text-xs text-slate-500 mt-1">{refId || "QuickFix Services"} is now active again.</p>
            {note && <p className="text-xs text-emerald-700 mt-2 italic">"{note}"</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notification Settings Panel ──────────────────────────────────────────────
interface NotifSettings {
  lead: boolean; dispute: boolean; vendor: boolean;
  commission: boolean; approval: boolean; system: boolean;
  urgentOnly: boolean; sound: boolean;
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<NotifSettings>({
    lead: true, dispute: true, vendor: true,
    commission: true, approval: true, system: false,
    urgentOnly: false, sound: true,
  });

  const toggle = (key: keyof NotifSettings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

  const rows: { key: keyof NotifSettings; label: string; sub: string; icon: React.ElementType }[] = [
    { key: "lead",       label: "Lead Alerts",       sub: "New leads, assignments, expiry",   icon: ClipboardList },
    { key: "dispute",    label: "Dispute Updates",    sub: "Escalations, resolutions",         icon: Scale         },
    { key: "vendor",     label: "Vendor Alerts",      sub: "Registrations, suspensions",       icon: Users         },
    { key: "commission", label: "Commission Updates", sub: "Payouts, credits, milestones",     icon: IndianRupee   },
    { key: "approval",   label: "Approval Requests",  sub: "KYC reviews, documents",           icon: CheckCircle2  },
    { key: "system",     label: "System Alerts",      sub: "Platform updates, features",       icon: Info          },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
              <Settings size={16} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Notification Settings</p>
              <p className="text-xs text-slate-400">Control what you receive</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-4">
            {([
              { key: "urgentOnly" as keyof NotifSettings, label: "Urgent only mode", sub: "Only show critical notifications", icon: Zap  },
              { key: "sound"      as keyof NotifSettings, label: "Sound alerts",     sub: "Play sound for new notifications", icon: Bell },
            ] as { key: keyof NotifSettings; label: string; sub: string; icon: React.ElementType }[]).map(r => (
              <div key={r.key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <r.icon size={15} className="text-violet-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{r.label}</p>
                    <p className="text-xs text-slate-400">{r.sub}</p>
                  </div>
                </div>
                <button onClick={() => toggle(r.key)} className="flex-shrink-0">
                  {settings[r.key] ? <ToggleRight size={28} className="text-violet-600" /> : <ToggleLeft size={28} className="text-slate-300" />}
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Categories</p>

          {rows.map(r => {
            const cfg = CATEGORY_CONFIG[r.key as NotifCategory];
            return (
              <div key={r.key}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 transition-all
                  ${settings[r.key] ? `${cfg.bg} ${cfg.border}` : "bg-slate-50 border-slate-100"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${settings[r.key] ? cfg.bg : "bg-white"} border ${settings[r.key] ? cfg.border : "border-slate-200"}`}>
                    <r.icon size={15} className={settings[r.key] ? cfg.color : "text-slate-400"} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${settings[r.key] ? "text-slate-800" : "text-slate-400"}`}>{r.label}</p>
                    <p className="text-xs text-slate-400 truncate">{r.sub}</p>
                  </div>
                </div>
                <button onClick={() => toggle(r.key)} className="flex-shrink-0">
                  {settings[r.key] ? <ToggleRight size={28} className={cfg.color} /> : <ToggleLeft size={28} className="text-slate-300" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="w-full py-3 rounded-2xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({
  notif, expanded, onToggle, onRead, onDismiss, onAction,
}: {
  notif:     NotificationItem;
  expanded:  boolean;
  onToggle:  () => void;
  onRead:    (id: string, read: boolean) => void;
  onDismiss: (id: string) => void;
  onAction:  (action: NotifAction) => void;
}) {
  const catCfg  = CATEGORY_CONFIG[notif.category];
  const priCfg  = PRIORITY_CONFIG[notif.priority];
  const CatIcon = catCfg.icon;
  const PriIcon = priCfg.icon;

  // Which inline panel is open for THIS card
  const [openPanel, setOpenPanel] = useState<NotifAction | null>(null);

  function handleAction(action: NotifAction) {
    // If action has a detail panel → show inline
    if (action.detail) {
      setOpenPanel(prev => prev?.label === action.label ? null : action);
      if (!notif.read) onRead(notif.id, true);
    } else {
      // No detail → just call parent (navigate or dismiss)
      onAction(action);
      if (!notif.read) onRead(notif.id, true);
    }
  }

  function renderPanel(action: NotifAction, navigate: (tab: string) => void) {
    const close = () => setOpenPanel(null);
    switch (action.detail) {
      case "lead":               return <LeadDetailPanel        refId={action.refId}  onNavigate={navigate} onClose={close} />;
      case "dispute":            return <DisputeDetailPanel     refId={action.refId}  onNavigate={navigate} onClose={close} />;
      case "vendor":             return <VendorDetailPanel      refId={action.refId}  onNavigate={navigate} onClose={close} />;
      case "approval":           return <ApprovalDetailPanel                          onNavigate={navigate} onClose={close} />;
      case "commission_detail":  return <CommissionDetailPanel                        onNavigate={navigate} onClose={close} />;
      case "suspend_confirm":    return <SuspendConfirmPanel    refId={action.refId}                        onClose={close} />;
      case "reactivate_confirm": return <ReactivateConfirmPanel refId={action.refId}                        onClose={close} />;
      default:                   return null;
    }
  }

  return (
    <div className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden
      ${!notif.read ? `${catCfg.border} bg-white shadow-sm` : "border-slate-100 bg-white/70"}
      ${notif.priority === "urgent" && !notif.read ? "" : ""}`}>

      {/* Urgent ribbon */}
      {notif.priority === "urgent" && !notif.read && (
        <div className="bg-red-500 px-4 py-1 flex items-center gap-1.5">
          <Zap size={11} className="text-white" />
          <span className="text-xs font-black text-white uppercase tracking-wider">Urgent — Action Required</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${catCfg.bg} border ${catCfg.border}`}>
            {notif.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${catCfg.bg} ${catCfg.color}`}>
                    <CatIcon size={9} /> {catCfg.label}
                  </span>
                  {notif.priority !== "normal" && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${priCfg.bg} ${priCfg.color}`}>
                      <PriIcon size={9} /> {priCfg.label}
                    </span>
                  )}
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />}
                </div>
                <p className={`text-sm font-black leading-snug ${notif.read ? "text-slate-500" : "text-slate-800"}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{notif.subtitle}</p>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => onRead(notif.id, !notif.read)} title={notif.read ? "Mark unread" : "Mark read"}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <CheckCheck size={13} className={notif.read ? "text-violet-400" : ""} />
                  </button>
                  <button onClick={() => onDismiss(notif.id)} title="Dismiss"
                    className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Meta chips */}
            {notif.meta && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {notif.meta.bookingId  && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{notif.meta.bookingId}</span>}
                {notif.meta.vendorName && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{notif.meta.vendorName}</span>}
                {notif.meta.amount     && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">₹{notif.meta.amount.toLocaleString("en-IN")}</span>}
                {notif.meta.area       && <span className="flex items-center gap-0.5 text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded"><MapPin size={8} /> {notif.meta.area}</span>}
                {notif.meta.rating     && <span className="flex items-center gap-0.5 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold"><Star size={8} /> {notif.meta.rating}</span>}
              </div>
            )}

            {/* Expand toggle */}
            <button onClick={onToggle}
              className="flex items-center gap-1 text-xs text-violet-500 font-bold mt-2 hover:text-violet-700 transition-colors">
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        </div>

        {/* Expanded body + action buttons */}
        {expanded && (
          <div className="mt-3 pl-4 border-l-2 border-slate-200" style={{ marginLeft: "3.25rem" }}>
            <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>

            {notif.meta?.phone && (
              <a href={`tel:${notif.meta.phone}`}
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 hover:text-blue-700">
                <Phone size={11} /> {notif.meta.phone}
              </a>
            )}

            {/* Action buttons */}
            {notif.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {notif.actions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                      ${openPanel?.label === action.label
                        ? "ring-2 ring-offset-1 " + (
                            action.style === "primary"   ? "ring-violet-400 bg-violet-700 text-white" :
                            action.style === "danger"    ? "ring-red-400 bg-red-700 text-white" :
                            "ring-slate-300 bg-slate-200 text-slate-800"
                          )
                        : action.style === "primary"
                          ? "bg-violet-600 text-white hover:bg-violet-700"
                          : action.style === "danger"
                          ? "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                      }`}
                  >
                    {action.label}
                    {action.detail
                      ? (openPanel?.label === action.label ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
                      : action.style === "primary" ? <ArrowRight size={11} /> : null
                    }
                  </button>
                ))}
              </div>
            )}

            {/* Inline detail panel */}
            {openPanel && renderPanel(openPanel, (tab) => {
              // This needs the parent's onNavigate — passed via onAction
              onAction({ ...openPanel, tab });
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface Props {
  onNavigate?: (tab: string) => void;
}

export default function NotificationsPage({ onNavigate }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<NotifCategory | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [search,         setSearch]         = useState("");
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [showSettings,   setShowSettings]   = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === "urgent" && !n.read).length;

  const filtered = useMemo(() => notifications.filter(n => {
    const matchCat    = activeCategory === "all" || n.category === activeCategory;
    const matchUnread = !showUnreadOnly || !n.read;
    const matchUrgent = !showUrgentOnly || n.priority === "urgent";
    const q           = search.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q);
    return matchCat && matchUnread && matchUrgent && matchSearch;
  }), [notifications, activeCategory, showUnreadOnly, showUrgentOnly, search]);

  const grouped = useMemo(() => groupByTime(filtered), [filtered]);

  function markRead(id: string, read: boolean) {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read } : n));
  }

  function dismiss(id: string) {
    setNotifications(ns => ns.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]); setExpandedId(null);
  }

  // Called when action button fires navigate
  function handleAction(action: NotifAction) {
    if (action.tab && onNavigate) {
      onNavigate(action.tab);
    }
  }

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.filter(n => !n.read).length };
    CATEGORY_TABS.slice(1).forEach(t => {
      counts[t.key] = notifications.filter(n => n.category === t.key && !n.read).length;
    });
    return counts;
  }, [notifications]);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center relative">
              <Bell size={18} className="text-violet-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-black">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-800">Notifications</h2>
            {urgentCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                <Zap size={10} /> {urgentCount} urgent
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium ml-11">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors border border-violet-200">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <Settings size={13} /> Settings
          </button>
        </div>
      </div>

      {/* ── Urgent Banner ── */}
      {urgentCount > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-red-700">
              {urgentCount} urgent notification{urgentCount > 1 ? "s" : ""} need your attention
            </p>
            <p className="text-xs text-red-500 mt-0.5 truncate">
              {notifications.filter(n => n.priority === "urgent" && !n.read).map(n => n.title.split("—")[0].trim()).join(" · ")}
            </p>
          </div>
          <button onClick={() => setShowUrgentOnly(true)}
            className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-100 rounded-xl transition-colors">
            View <ArrowRight size={11} />
          </button>
        </div>
      )}

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search notifications..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUnreadOnly(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border
              ${showUnreadOnly ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
            <Bell size={12} /> Unread only
          </button>
          <button onClick={() => setShowUrgentOnly(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border
              ${showUrgentOnly ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
            <Zap size={12} /> Urgent
          </button>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORY_TABS.map(({ key, label, icon: Icon }) => {
          const count = catCounts[key] ?? 0;
          return (
            <button key={key} onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0
                ${activeCategory === key ? "bg-violet-600 text-white shadow-md" : "text-slate-500 bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600"}`}>
              <Icon size={13} />
              {label}
              {count > 0 && (
                <span className={`text-xs font-black px-1.5 py-0.5 rounded-full
                  ${activeCategory === key ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {CATEGORY_TABS.slice(1).map(({ key, label, icon: Icon }) => {
          const cfg    = CATEGORY_CONFIG[key as NotifCategory];
          const total  = notifications.filter(n => n.category === key).length;
          const unread = notifications.filter(n => n.category === key && !n.read).length;
          return (
            <button key={key} onClick={() => setActiveCategory(key)}
              className={`rounded-2xl border-2 p-3 text-center transition-all hover:shadow-sm
                ${activeCategory === key ? `${cfg.bg} ${cfg.border}` : "bg-white border-slate-100"}`}>
              <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon size={13} className={cfg.color} />
              </div>
              <p className={`text-lg font-black ${cfg.color}`}>{total}</p>
              <p className="text-xs text-slate-500 font-medium leading-none">{label}</p>
              {unread > 0 && <p className="text-xs font-black text-red-500 mt-0.5">{unread} new</p>}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            {notifications.length === 0
              ? <CheckCircle2 size={28} className="text-emerald-400" />
              : <BellOff size={28} className="text-slate-300" />}
          </div>
          <h3 className="text-base font-bold text-slate-600 mb-1">
            {notifications.length === 0 ? "All clear!" : "No notifications match"}
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            {notifications.length === 0
              ? "You've handled everything. Great work!"
              : "Try adjusting your filters or search query."}
          </p>
          {(showUnreadOnly || showUrgentOnly || search || activeCategory !== "all") && (
            <button
              onClick={() => { setShowUnreadOnly(false); setShowUrgentOnly(false); setSearch(""); setActiveCategory("all"); }}
              className="mt-4 flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700">
              <RefreshCw size={13} /> Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ label, items }) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="space-y-3">
                {items.map(notif => (
                  <NotifCard
                    key={notif.id}
                    notif={notif}
                    expanded={expandedId === notif.id}
                    onToggle={() => {
                      setExpandedId(id => id === notif.id ? null : notif.id);
                      if (!notif.read) markRead(notif.id, true);
                    }}
                    onRead={markRead}
                    onDismiss={dismiss}
                    onAction={handleAction}
                  />
                ))}
              </div>
            </div>
          ))}

          {notifications.length > 0 && (
            <div className="flex justify-center pt-2">
              <button onClick={clearAll}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-4 py-2 rounded-xl hover:bg-red-50">
                <X size={13} /> Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}


