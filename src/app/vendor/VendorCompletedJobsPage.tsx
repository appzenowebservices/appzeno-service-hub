/**
 * VendorCompletedJobsPage.tsx
 * Location: src/pages/vendor/VendorCompletedJobsPage.tsx
 *
 * VendorDashboard.tsx mein add karo:
 *   import VendorCompletedJobsPage from "./VendorCompletedJobsPage";
 *   case "completed": return <VendorCompletedJobsPage />;
 */

import { useState, useMemo } from "react";
import {
  CheckCircle2, Star, MapPin, Phone, IndianRupee,
  Calendar, User, X, BadgeCheck, Timer, Info,
  Search, Receipt, Sparkles, TrendingUp, Award,
  Package, ChevronDown, ChevronUp, Filter,
  Clock, Banknote, ThumbsUp, RotateCcw, Download,
  ArrowUpRight, Shield, Percent, Wallet,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const GST_RATE = 0.18;
const COMMISSION_MAP: Record<string, number> = {
  "Home Cleaning":        0.15,
  "Plumbing":             0.18,
  "Electrical":           0.18,
  "AC Service":           0.20,
  "Painting":             0.15,
  "Carpentry":            0.15,
  "Pest Control":         0.20,
  "Appliance Repair":     0.18,
  "Water Purifier":       0.18,
  "Sofa/Carpet Cleaning": 0.15,
  "Packers & Movers":     0.12,
  "CCTV Installation":    0.20,
  "default":              0.18,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentStatus = "credited" | "processing" | "on_hold";
type RatingGiven   = 1 | 2 | 3 | 4 | 5 | null;

interface CompletedJob {
  id:              string;
  bookingId:       string;
  service:         string;
  category:        string;
  categoryIcon:    string;
  customer: {
    name:          string;
    mobile:        string;
    rating:        number;      // customer's own rating on platform
    totalBookings: number;
    verified:      boolean;
  };
  address:         string;
  city:            string;
  pincode:         string;
  scheduledDate:   string;
  completedDate:   string;
  completedTime:   string;
  duration:        string;      // "1h 20m"
  jobAmount:       number;
  commissionPct:   number;
  paymentStatus:   PaymentStatus;
  payoutDate:      string | null;
  upiRef:          string | null;
  customerRating:  number | null;   // rating customer gave vendor
  vendorRating:    RatingGiven;     // rating vendor gave customer
  vendorNote:      string;          // vendor's internal note
  repeatCustomer:  boolean;
  timeline: {
    label: string;
    time:  string;
    done:  boolean;
  }[];
}

// ─── Calc ─────────────────────────────────────────────────────────────────────
function calc(amount: number, commPct: number) {
  const commission    = Math.round(amount * commPct);
  const gstOnComm     = Math.round(commission * GST_RATE);
  const totalDeducted = commission + gstOnComm;
  const netEarning    = amount - totalDeducted;
  return { commission, gstOnComm, totalDeducted, netEarning };
}

// ─── Mock Completed Jobs ──────────────────────────────────────────────────────
const MOCK_JOBS: CompletedJob[] = [
  {
    id: "CJ001", bookingId: "BK-2602-0047",
    service: "Pipe Leak Fix — Kitchen", category: "Plumbing", categoryIcon: "🔧",
    customer: { name: "Ramesh Sharma", mobile: "98765 43210", rating: 4.8, totalBookings: 12, verified: true },
    address: "12-A, Green Park Colony", city: "Delhi", pincode: "110016",
    scheduledDate: "25 Feb 2026", completedDate: "25 Feb 2026", completedTime: "3:40 PM", duration: "1h 40m",
    jobAmount: 450, commissionPct: 0.18, paymentStatus: "credited",
    payoutDate: "26 Feb 2026", upiRef: "UPI26022601",
    customerRating: 5, vendorRating: 5, vendorNote: "Bahut cooperative customer tha.",
    repeatCustomer: true,
    timeline: [
      { label: "Booking Accepted",  time: "11:45 AM", done: true },
      { label: "Arrived at Site",   time: "2:00 PM",  done: true },
      { label: "Job Started (OTP)", time: "2:05 PM",  done: true },
      { label: "Job Completed",     time: "3:40 PM",  done: true },
      { label: "Payment Received",  time: "3:45 PM",  done: true },
    ],
  },
  {
    id: "CJ002", bookingId: "BK-2602-0031",
    service: "Switchboard Replacement", category: "Electrical", categoryIcon: "⚡",
    customer: { name: "Pooja Mehta", mobile: "91234 56789", rating: 4.5, totalBookings: 5, verified: true },
    address: "Flat 302, Sunrise Apartments", city: "Delhi", pincode: "110024",
    scheduledDate: "24 Feb 2026", completedDate: "24 Feb 2026", completedTime: "5:50 PM", duration: "1h 20m",
    jobAmount: 600, commissionPct: 0.18, paymentStatus: "credited",
    payoutDate: "25 Feb 2026", upiRef: "UPI25022602",
    customerRating: 4, vendorRating: null, vendorNote: "",
    repeatCustomer: false,
    timeline: [
      { label: "Booking Accepted",  time: "10:20 AM", done: true },
      { label: "Arrived at Site",   time: "4:30 PM",  done: true },
      { label: "Job Started (OTP)", time: "4:35 PM",  done: true },
      { label: "Job Completed",     time: "5:50 PM",  done: true },
      { label: "Payment Received",  time: "5:55 PM",  done: true },
    ],
  },
  {
    id: "CJ003", bookingId: "BK-2602-0018",
    service: "AC Annual Service", category: "AC Service", categoryIcon: "❄️",
    customer: { name: "Amit Kumar", mobile: "99001 12233", rating: 4.2, totalBookings: 8, verified: false },
    address: "Villa 7, DLF Phase 2", city: "Delhi", pincode: "110028",
    scheduledDate: "23 Feb 2026", completedDate: "23 Feb 2026", completedTime: "1:10 PM", duration: "2h 10m",
    jobAmount: 799, commissionPct: 0.20, paymentStatus: "processing",
    payoutDate: null, upiRef: null,
    customerRating: null, vendorRating: null, vendorNote: "",
    repeatCustomer: false,
    timeline: [
      { label: "Booking Accepted",  time: "Yesterday 3:00 PM", done: true },
      { label: "Arrived at Site",   time: "11:00 AM", done: true },
      { label: "Job Started (OTP)", time: "11:05 AM", done: true },
      { label: "Job Completed",     time: "1:10 PM",  done: true },
      { label: "Payment Processing",time: "1:15 PM",  done: false },
    ],
  },
  {
    id: "CJ004", bookingId: "BK-2602-0009",
    service: "Geyser Repair", category: "Appliance Repair", categoryIcon: "🔌",
    customer: { name: "Sunita Verma", mobile: "88001 44556", rating: 4.7, totalBookings: 20, verified: true },
    address: "B-12, Vasant Vihar", city: "Delhi", pincode: "110057",
    scheduledDate: "22 Feb 2026", completedDate: "22 Feb 2026", completedTime: "4:30 PM", duration: "0h 55m",
    jobAmount: 380, commissionPct: 0.18, paymentStatus: "credited",
    payoutDate: "23 Feb 2026", upiRef: "UPI23022603",
    customerRating: 5, vendorRating: 5, vendorNote: "Regular customer — 3rd time aa rahi hain.",
    repeatCustomer: true,
    timeline: [
      { label: "Booking Accepted",  time: "9:00 AM",  done: true },
      { label: "Arrived at Site",   time: "3:30 PM",  done: true },
      { label: "Job Started (OTP)", time: "3:35 PM",  done: true },
      { label: "Job Completed",     time: "4:30 PM",  done: true },
      { label: "Payment Received",  time: "4:35 PM",  done: true },
    ],
  },
  {
    id: "CJ005", bookingId: "BK-2602-0003",
    service: "Bathroom Fitting", category: "Plumbing", categoryIcon: "🔧",
    customer: { name: "Mohan Lal", mobile: "77001 33445", rating: 3.9, totalBookings: 3, verified: false },
    address: "C-4, Model Town", city: "Delhi", pincode: "110009",
    scheduledDate: "20 Feb 2026", completedDate: "20 Feb 2026", completedTime: "6:15 PM", duration: "3h 45m",
    jobAmount: 750, commissionPct: 0.18, paymentStatus: "processing",
    payoutDate: null, upiRef: null,
    customerRating: 3, vendorRating: null, vendorNote: "Thoda negotiate kiya — price kum karna pada.",
    repeatCustomer: false,
    timeline: [
      { label: "Booking Accepted",  time: "8:00 AM",  done: true },
      { label: "Arrived at Site",   time: "2:30 PM",  done: true },
      { label: "Job Started (OTP)", time: "2:35 PM",  done: true },
      { label: "Job Completed",     time: "6:15 PM",  done: true },
      { label: "Payment Processing",time: "6:20 PM",  done: false },
    ],
  },
  {
    id: "CJ006", bookingId: "BK-2501-0087",
    service: "Ceiling Fan Install", category: "Electrical", categoryIcon: "⚡",
    customer: { name: "Rekha Singh", mobile: "66001 22334", rating: 4.0, totalBookings: 7, verified: true },
    address: "D-8, Pitampura", city: "Delhi", pincode: "110034",
    scheduledDate: "18 Feb 2026", completedDate: "18 Feb 2026", completedTime: "12:40 PM", duration: "1h 10m",
    jobAmount: 250, commissionPct: 0.18, paymentStatus: "on_hold",
    payoutDate: null, upiRef: null,
    customerRating: 2, vendorRating: 2, vendorNote: "Customer ne dispute kiya — incorrect fitting claim.",
    repeatCustomer: false,
    timeline: [
      { label: "Booking Accepted",  time: "9:30 AM",  done: true },
      { label: "Arrived at Site",   time: "11:30 AM", done: true },
      { label: "Job Started (OTP)", time: "11:35 AM", done: true },
      { label: "Job Completed",     time: "12:40 PM", done: true },
      { label: "Payment — On Hold", time: "—",        done: false },
    ],
  },
  {
    id: "CJ007", bookingId: "BK-2501-0062",
    service: "Sofa Deep Cleaning", category: "Home Cleaning", categoryIcon: "🧹",
    customer: { name: "Priya Agarwal", mobile: "55001 11223", rating: 4.9, totalBookings: 30, verified: true },
    address: "E-3, Safdarjung Enclave", city: "Delhi", pincode: "110029",
    scheduledDate: "15 Feb 2026", completedDate: "15 Feb 2026", completedTime: "3:20 PM", duration: "2h 20m",
    jobAmount: 999, commissionPct: 0.15, paymentStatus: "credited",
    payoutDate: "16 Feb 2026", upiRef: "UPI16022605",
    customerRating: 5, vendorRating: 5, vendorNote: "Premium customer — par kaam bhi best dena pada.",
    repeatCustomer: true,
    timeline: [
      { label: "Booking Accepted",  time: "8:00 AM",  done: true },
      { label: "Arrived at Site",   time: "1:00 PM",  done: true },
      { label: "Job Started (OTP)", time: "1:05 PM",  done: true },
      { label: "Job Completed",     time: "3:20 PM",  done: true },
      { label: "Payment Received",  time: "3:25 PM",  done: true },
    ],
  },
  {
    id: "CJ008", bookingId: "BK-2501-0044",
    service: "AC Gas Refill", category: "AC Service", categoryIcon: "❄️",
    customer: { name: "Deepak Shah", mobile: "44001 00112", rating: 4.3, totalBookings: 15, verified: true },
    address: "F-9, Greater Kailash", city: "Delhi", pincode: "110048",
    scheduledDate: "12 Feb 2026", completedDate: "12 Feb 2026", completedTime: "2:00 PM", duration: "1h 30m",
    jobAmount: 1200, commissionPct: 0.20, paymentStatus: "credited",
    payoutDate: "13 Feb 2026", upiRef: "UPI13022606",
    customerRating: 4, vendorRating: 4, vendorNote: "Gas refill + minor servicing dono kiya.",
    repeatCustomer: false,
    timeline: [
      { label: "Booking Accepted",  time: "9:00 AM",  done: true },
      { label: "Arrived at Site",   time: "12:30 PM", done: true },
      { label: "Job Started (OTP)", time: "12:35 PM", done: true },
      { label: "Job Completed",     time: "2:00 PM",  done: true },
      { label: "Payment Received",  time: "2:05 PM",  done: true },
    ],
  },
  {
    id: "CJ009", bookingId: "BK-2501-0021",
    service: "Pest Control — Full Home", category: "Pest Control", categoryIcon: "🪲",
    customer: { name: "Kavita Joshi", mobile: "33001 99887", rating: 4.6, totalBookings: 9, verified: true },
    address: "G-15, Lajpat Nagar", city: "Delhi", pincode: "110024",
    scheduledDate: "10 Feb 2026", completedDate: "10 Feb 2026", completedTime: "11:30 AM", duration: "2h 0m",
    jobAmount: 850, commissionPct: 0.20, paymentStatus: "credited",
    payoutDate: "11 Feb 2026", upiRef: "UPI11022607",
    customerRating: 5, vendorRating: 4, vendorNote: "3BHK flat — full treatment diya.",
    repeatCustomer: true,
    timeline: [
      { label: "Booking Accepted",  time: "8:30 AM",  done: true },
      { label: "Arrived at Site",   time: "9:30 AM",  done: true },
      { label: "Job Started (OTP)", time: "9:35 AM",  done: true },
      { label: "Job Completed",     time: "11:30 AM", done: true },
      { label: "Payment Received",  time: "11:35 AM", done: true },
    ],
  },
  {
    id: "CJ010", bookingId: "BK-2501-0008",
    service: "Wall Painting — 2 Rooms", category: "Painting", categoryIcon: "🎨",
    customer: { name: "Arvind Tiwari", mobile: "22001 88776", rating: 4.1, totalBookings: 4, verified: false },
    address: "H-21, Rohini Sector 11", city: "Delhi", pincode: "110085",
    scheduledDate: "5 Feb 2026", completedDate: "6 Feb 2026", completedTime: "5:00 PM", duration: "2 days",
    jobAmount: 3200, commissionPct: 0.15, paymentStatus: "credited",
    payoutDate: "7 Feb 2026", upiRef: "UPI07022608",
    customerRating: 4, vendorRating: 4, vendorNote: "2 din ka kaam — 2 coats + putty.",
    repeatCustomer: false,
    timeline: [
      { label: "Booking Accepted",  time: "4 Feb, 10 AM", done: true },
      { label: "Arrived at Site",   time: "5 Feb, 9 AM",  done: true },
      { label: "Job Started (OTP)", time: "5 Feb, 9:10 AM",done: true },
      { label: "Job Completed",     time: "6 Feb, 5 PM",  done: true },
      { label: "Payment Received",  time: "6 Feb, 5:10 PM",done: true },
    ],
  },
];

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({
  value, onChange, size = 20, readonly = false,
}: {
  value: RatingGiven; onChange?: (v: RatingGiven) => void;
  size?: number; readonly?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          disabled={readonly}
          onClick={() => onChange?.(n as RatingGiven)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(null)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              (hover ?? value ?? 0) >= n ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Payment Status Badge ─────────────────────────────────────────────────────
function PayBadge({ status }: { status: PaymentStatus }) {
  const map = {
    credited:   { label: "Credited ✅", cls: "bg-green-100 text-green-700" },
    processing: { label: "Processing ⏳", cls: "bg-amber-100 text-amber-700" },
    on_hold:    { label: "On Hold 🔴", cls: "bg-red-100 text-red-600" },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${cls}`}>{label}</span>;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({
  job, onClose, onRateCustomer,
}: {
  job: CompletedJob;
  onClose: () => void;
  onRateCustomer: (id: string, rating: RatingGiven) => void;
}) {
  const bd = calc(job.jobAmount, job.commissionPct);
  const [rating,   setRating]   = useState<RatingGiven>(job.vendorRating);
  const [rated,    setRated]    = useState(job.vendorRating !== null);
  const [note,     setNote]     = useState(job.vendorNote);
  const [noteEdit, setNoteEdit] = useState(false);
  const [noteSaved,setNoteSaved]= useState(false);

  function submitRating(r: RatingGiven) {
    setRating(r); setRated(true); onRateCustomer(job.id, r);
  }

  function saveNote() {
    setNoteEdit(false); setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{job.categoryIcon}</span>
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">{job.category}</span>
                {job.repeatCustomer && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 font-bold flex items-center gap-1">
                    <RotateCcw size={9} /> Repeat
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white">{job.service}</h2>
              <p className="text-emerald-300 text-xs mt-1">#{job.bookingId} · {job.completedDate}</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PayBadge status={job.paymentStatus} />
            {job.customerRating && (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <Star size={10} className="fill-yellow-500 text-yellow-500" /> {job.customerRating}/5 received
              </span>
            )}
          </div>
        </div>

        {/* ── Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-5">

          {/* ── Earnings Summary */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Earnings Breakdown</p>
            <div className="space-y-1.5 mb-3">
              {[
                { lbl: "Job Amount (Customer Paid)", val: `₹${job.jobAmount}`,         vc: "text-white",       bold: false },
                { lbl: `Platform Commission (${(job.commissionPct*100).toFixed(0)}%) — Auto`, val:`−₹${bd.commission}`, vc:"text-red-400", bold:false },
                { lbl: "GST on Commission (18%) — Auto",val: `−₹${bd.gstOnComm}`,      vc: "text-red-300",     bold: false },
                { lbl: "Total Platform Deducted",    val: `−₹${bd.totalDeducted}`,     vc: "text-red-400",     bold: true, sep: true },
                { lbl: "Your Net Earning",           val: `₹${bd.netEarning}`,         vc: "text-emerald-400", bold: true, hl: true },
              ].map((r, i) => (
                <div key={i}>
                  {(r as any).sep && <div className="h-px bg-white/10 my-2" />}
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-xs ${(r as any).hl ? "text-emerald-300 font-black" : r.bold ? "text-slate-200 font-bold" : "text-slate-400"}`}>{r.lbl}</span>
                    <span className={`text-sm flex-shrink-0 ${r.bold ? "font-black" : "font-semibold"} ${r.vc}`}>{r.val}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-0.5">Job Amount</p>
                <p className="font-black text-lg">₹{job.jobAmount}</p>
              </div>
              <div className="bg-red-500/20 rounded-xl p-3 text-center">
                <p className="text-xs text-red-300 mb-0.5">Deducted</p>
                <p className="font-black text-lg text-red-300">−₹{bd.totalDeducted}</p>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-400/20 rounded-xl p-3 text-center">
                <p className="text-xs text-emerald-300 mb-0.5">Net Earning</p>
                <p className="font-black text-lg text-emerald-400">₹{bd.netEarning}</p>
              </div>
            </div>
            {job.paymentStatus === "credited" && job.payoutDate && (
              <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400">Credited on {job.payoutDate}</span>
                <span className="text-xs font-bold text-emerald-400">Ref: {job.upiRef}</span>
              </div>
            )}
          </div>

          {/* ── Customer Info */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl font-black text-emerald-700 flex-shrink-0">
              {job.customer.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-slate-800">{job.customer.name}</p>
                {job.customer.verified && <BadgeCheck size={14} className="text-blue-500" />}
                {job.repeatCustomer && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                    Repeat Customer
                  </span>
                )}
              </div>
              <div className="flex gap-3 mt-0.5 flex-wrap">
                <span className="text-xs text-yellow-600 font-semibold flex items-center gap-1">
                  <Star size={9} className="fill-yellow-400 text-yellow-400" /> {job.customer.rating}
                </span>
                <span className="text-xs text-slate-400">{job.customer.totalBookings} bookings</span>
                <span className="text-xs text-slate-400">{job.city}</span>
              </div>
            </div>
            <a href={`tel:${job.customer.mobile}`}
              className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors flex-shrink-0">
              <Phone size={16} />
            </a>
          </div>

          {/* ── Job Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin,     label: "Address",    value: `${job.address}, ${job.city}` },
              { icon: Calendar,   label: "Date",       value: job.completedDate },
              { icon: Clock,      label: "Completed",  value: job.completedTime },
              { icon: Timer,      label: "Duration",   value: job.duration },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
                <Icon size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-2xs text-slate-400 font-bold uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Job Timeline */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock size={12} /> Job Timeline
            </h4>
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100" />
              <div className="space-y-3">
                {job.timeline.map((step, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2
                      ${step.done ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-200"}`}>
                      {step.done
                        ? <CheckCircle2 size={11} className="text-white" />
                        : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-bold ${step.done ? "text-slate-700" : "text-slate-400"}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-slate-400 font-medium flex-shrink-0">{step.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Customer Rating (received) */}
          <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
            <p className="text-xs font-black text-yellow-800 uppercase tracking-wide mb-2">Customer ne aapko rate kiya</p>
            {job.customerRating ? (
              <div className="flex items-center gap-3">
                <StarRating value={job.customerRating as RatingGiven} readonly size={20} />
                <span className="text-lg font-black text-yellow-700">{job.customerRating}/5</span>
                <span className="text-xs text-yellow-600 font-semibold">
                  {job.customerRating >= 5 ? "Excellent! 🌟"
                   : job.customerRating >= 4 ? "Very Good 👍"
                   : job.customerRating >= 3 ? "Average"
                   : "Needs Improvement"}
                </span>
              </div>
            ) : (
              <p className="text-xs text-yellow-600 flex items-center gap-1.5">
                <Clock size={11} /> Rating abhi pending hai
              </p>
            )}
          </div>

          {/* ── Rate Customer (vendor → customer) */}
          <div className={`p-4 rounded-2xl border-2 transition-all
            ${rated ? "border-green-200 bg-green-50" : "border-emerald-200 bg-emerald-50"}`}>
            <p className="text-xs font-black text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <ThumbsUp size={12} className="text-emerald-500" />
              {rated ? "Aapne Customer ko Rate Kiya" : "Customer ko Rate Karo"}
            </p>
            {rated ? (
              <div className="flex items-center gap-3">
                <StarRating value={rating} readonly size={20} />
                <span className="text-sm font-black text-green-700">{rating}/5 ✓</span>
                <span className="text-xs text-green-600">Saved</span>
              </div>
            ) : (
              <div className="space-y-2">
                <StarRating value={rating} onChange={submitRating} size={24} />
                <p className="text-xs text-slate-400">Star pe tap karo — rating save ho jayegi</p>
              </div>
            )}
          </div>

          {/* ── Vendor Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Shield size={11} /> Aapka Private Note
              </p>
              <button onClick={() => setNoteEdit(e => !e)}
                className="text-xs text-emerald-600 font-bold hover:text-emerald-700">
                {noteEdit ? "Cancel" : note ? "Edit" : "+ Add Note"}
              </button>
            </div>
            {noteEdit ? (
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Is job ke baare mein kuch note karo…"
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
                <button onClick={saveNote}
                  className="w-full py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all">
                  Save Note
                </button>
              </div>
            ) : (
              <p className={`text-xs leading-relaxed ${note ? "text-slate-600" : "text-slate-400 italic"}`}>
                {note || "Koi note nahi — '+Add Note' se add karo"}
              </p>
            )}
            {noteSaved && <p className="text-xs text-green-600 font-bold mt-1">✓ Note saved</p>}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onView }: { job: CompletedJob; onView: (j: CompletedJob) => void }) {
  const bd = calc(job.jobAmount, job.commissionPct);

  const payColor = {
    credited:   "border-green-200",
    processing: "border-amber-200",
    on_hold:    "border-red-200",
  }[job.paymentStatus];

  return (
    <div className={`bg-white rounded-2xl border-2 ${payColor} overflow-hidden hover:shadow-lg transition-all duration-200`}>
      {/* Top strip */}
      <div className={`h-1.5 ${
        job.paymentStatus === "credited"   ? "bg-green-400"
        : job.paymentStatus === "on_hold"  ? "bg-red-400"
        :                                    "bg-amber-400"}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
            {job.categoryIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5 flex-wrap">
              <p className="font-black text-slate-800 text-sm leading-snug">{job.service}</p>
              {job.repeatCustomer && (
                <span className="text-2xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold flex items-center gap-0.5 flex-shrink-0">
                  <RotateCcw size={8} /> Repeat
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{job.category} · {job.completedDate}</p>
          </div>
          <PayBadge status={job.paymentStatus} />
        </div>

        {/* Customer + rating row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <User size={10} className="text-slate-400" />
            <span className="font-medium">{job.customer.name}</span>
            {job.customer.verified && <BadgeCheck size={10} className="text-blue-500" />}
          </div>
          {job.customerRating && (
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={11}
                  className={n <= job.customerRating! ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"} />
              ))}
              <span className="text-xs font-bold text-slate-600 ml-0.5">{job.customerRating}</span>
            </div>
          )}
        </div>

        {/* Amount grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-2xs text-slate-400 mb-0.5">Job Amt</p>
            <p className="text-sm font-black text-slate-700">₹{job.jobAmount}</p>
          </div>
          <div className="p-2 rounded-xl bg-red-50 border border-red-100 text-center">
            <p className="text-2xs text-red-400 mb-0.5">Deducted</p>
            <p className="text-sm font-black text-red-500">−₹{bd.totalDeducted}</p>
          </div>
          <div className={`p-2 rounded-xl text-center border
            ${job.paymentStatus === "credited" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
            <p className="text-2xs text-slate-400 mb-0.5">Net</p>
            <p className={`text-sm font-black ${job.paymentStatus === "credited" ? "text-emerald-600" : "text-slate-500"}`}>
              ₹{bd.netEarning}
            </p>
          </div>
        </div>

        {/* Duration + vendor rating pending */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Timer size={10} /> {job.duration}
          </span>
          {job.vendorRating === null && (
            <span className="text-xs text-amber-600 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
              <Star size={9} /> Rate customer
            </span>
          )}
        </div>

        {/* CTA */}
        <button onClick={() => onView(job)}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold
            hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all
            flex items-center justify-center gap-1.5">
          <Receipt size={13} /> View Details & Breakdown
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorCompletedJobsPage() {
  const [jobs,          setJobs]          = useState<CompletedJob[]>(MOCK_JOBS);
  const [selectedJob,   setSelectedJob]   = useState<CompletedJob | null>(null);
  const [search,        setSearch]        = useState("");
  const [payFilter,     setPayFilter]     = useState<"all" | PaymentStatus>("all");
  const [categoryFilter,setCategoryFilter]= useState("all");
  const [sortBy,        setSortBy]        = useState<"date" | "amount" | "rating">("date");
  const [showFilters,   setShowFilters]   = useState(false);

  // Unique categories from data
  const categories = useMemo(() =>
    ["all", ...Array.from(new Set(jobs.map(j => j.category)))], [jobs]);

  // Stats
  const creditedJobs  = jobs.filter(j => j.paymentStatus === "credited");
  const totalEarned   = creditedJobs.reduce((s, j) => s + calc(j.jobAmount, j.commissionPct).netEarning, 0);
  const totalJobAmt   = jobs.reduce((s, j) => s + j.jobAmount, 0);
  const ratedJobs     = jobs.filter(j => j.customerRating !== null);
  const avgRating     = ratedJobs.length
    ? (ratedJobs.reduce((s, j) => s + (j.customerRating ?? 0), 0) / ratedJobs.length).toFixed(1)
    : "—";
  const pendingRatings = jobs.filter(j => j.vendorRating === null).length;
  const thisMonth      = jobs.filter(j => j.completedDate.includes("Feb 2026")).length;

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...jobs];
    if (payFilter !== "all") list = list.filter(j => j.paymentStatus === payFilter);
    if (categoryFilter !== "all") list = list.filter(j => j.category === categoryFilter);
    if (search) list = list.filter(j =>
      j.service.toLowerCase().includes(search.toLowerCase()) ||
      j.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      j.city.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === "amount")  list.sort((a, b) => b.jobAmount - a.jobAmount);
    if (sortBy === "rating")  list.sort((a, b) => (b.customerRating ?? 0) - (a.customerRating ?? 0));
    // default: date (already newest first in mock)
    return list;
  }, [jobs, payFilter, categoryFilter, search, sortBy]);

  function handleRateCustomer(id: string, rating: RatingGiven) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, vendorRating: rating } : j));
  }

  return (
    <div className="space-y-6">

      {/* ── Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Package size={22} className="text-emerald-500" /> Completed Jobs
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Poori history — har job ka breakdown, timeline, rating aur payment status
        </p>
      </div>

      {/* ── Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Jobs Done",
            value: String(jobs.length),
            sub:   `${thisMonth} this month`,
            icon:  Package, c: "text-emerald-600", bg: "bg-emerald-50", b: "border-emerald-200",
          },
          {
            label: "Net Earned (Credited)",
            value: `₹${totalEarned.toLocaleString("en-IN")}`,
            sub:   `from ₹${totalJobAmt.toLocaleString("en-IN")} gross`,
            icon:  Wallet, c: "text-green-600", bg: "bg-green-50", b: "border-green-200",
          },
          {
            label: "Avg Customer Rating",
            value: avgRating,
            sub:   `from ${ratedJobs.length} rated jobs`,
            icon:  Star, c: "text-yellow-600", bg: "bg-yellow-50", b: "border-yellow-200",
          },
          {
            label: "Ratings Pending",
            value: String(pendingRatings),
            sub:   "Rate karo — helps ranking",
            icon:  ThumbsUp,
            c:  pendingRatings > 0 ? "text-amber-600" : "text-slate-500",
            bg: pendingRatings > 0 ? "bg-amber-50"   : "bg-slate-50",
            b:  pendingRatings > 0 ? "border-amber-300" : "border-slate-200",
          },
        ].map(({ label, value, sub, icon: Icon, c, bg, b }) => (
          <div key={label} className={`rounded-2xl border-2 ${b} ${bg} p-4`}>
            <Icon size={16} className={`${c} mb-2`} />
            <p className={`text-2xl font-black ${c}`}>{value}</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Performance Banner */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-amber-400" />
          <h3 className="text-slate-100 text-sm">Performance Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { lbl: "Jobs Completed",  val: String(jobs.length),                             sub: "All time",                 color: "bg-slate-700" },
            { lbl: "Net Earnings",    val: `₹${totalEarned.toLocaleString("en-IN")}`,       sub: "After deductions",          color: "bg-emerald-800" },
            { lbl: "Avg Rating",      val: avgRating === "—" ? "N/A" : `${avgRating} ⭐`,  sub: "By customers",             color: "bg-yellow-800/60" },
            { lbl: "Repeat Customers",val: String(jobs.filter(j => j.repeatCustomer).length), sub: "Wapas aaye",             color: "bg-blue-900/60" },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-xl p-3 text-center`}>
              <p className="text-xl font-black">{s.val}</p>
              <p className="text-xs font-bold text-slate-300 mt-0.5">{s.lbl}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pending Ratings Alert */}
      {pendingRatings > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300">
          <Star size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-amber-800 text-sm">
              {pendingRatings} customer{pendingRatings > 1 ? "s" : ""} ko rate karna baaki hai
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Customer rating se aapki profile ranking improve hoti hai. Neeche cards mein
              <strong> "Rate customer"</strong> badge wale jobs pe click karo.
            </p>
          </div>
        </div>
      )}

      {/* ── Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search service, customer, city…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
          </div>
          {/* Sort */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {([
                { key: "date",   label: "Latest" },
                { key: "amount", label: "Amount" },
                { key: "rating", label: "Rating" },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setSortBy(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                    ${sortBy === key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                ${showFilters ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600"}`}>
              <Filter size={12} /> Filters {showFilters ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {/* Payment filter */}
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Payment Status</p>
              <div className="flex gap-1.5 flex-wrap">
                {([
                  { key: "all",        label: "All",        cls: "bg-emerald-600 text-white" },
                  { key: "credited",   label: "Credited ✅", cls: "bg-green-500 text-white" },
                  { key: "processing", label: "Processing ⏳",cls: "bg-amber-400 text-amber-900" },
                  { key: "on_hold",    label: "On Hold 🔴",  cls: "bg-red-500 text-white" },
                ] as const).map(({ key, label, cls }) => (
                  <button key={key} onClick={() => setPayFilter(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                      ${payFilter === key ? cls : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Category filter */}
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Category</p>
              <div className="flex gap-1.5 flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all
                      ${categoryFilter === cat
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-semibold">
          {filtered.length} job{filtered.length !== 1 ? "s" : ""} {search || payFilter !== "all" || categoryFilter !== "all" ? "filtered" : "total"}
        </p>
        {(search || payFilter !== "all" || categoryFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setPayFilter("all"); setCategoryFilter("all"); }}
            className="text-xs text-emerald-600 font-bold hover:text-emerald-700">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Jobs Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold text-slate-700 text-lg">Koi job nahi mili</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Filter change karo ya search clear karo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} onView={setSelectedJob} />
          ))}
        </div>
      )}

      {/* ── Detail Modal */}
      {selectedJob && (
        <DetailModal
          job={jobs.find(j => j.id === selectedJob.id) ?? selectedJob}
          onClose={() => setSelectedJob(null)}
          onRateCustomer={handleRateCustomer}
        />
      )}
    </div>
  );
}
