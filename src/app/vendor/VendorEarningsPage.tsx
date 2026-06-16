/**
 * VendorEarningsPage.tsx
 * Location: src/pages/vendor/VendorEarningsPage.tsx
 */

import { useState } from "react";
import {
  IndianRupee, Clock, CheckCircle2, X, Info, ChevronRight,
  Receipt, Shield, Percent, Eye, Wrench, AlertCircle,
  Sparkles, QrCode, Copy, Lock, Ban,
  HeadphonesIcon, ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

// ─── Constants ────────────────────────────────────────────────────────────────
const UPI_ID        = "9250138532@icici";
const PLATFORM_NAME = "ADDies ServiceHub";
const GST_RATE      = 0.18;

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
type TxnStatus = "credited" | "pending" | "on_hold" | "refunded";

interface Transaction {
  id:            string;
  bookingId:     string;
  service:       string;
  category:      string;
  categoryIcon:  string;
  customerName:  string;
  jobDate:       string;
  jobAmount:     number;
  commissionPct: number;
  status:        TxnStatus;
  payoutDate:    string | null;
  upiRef:        string | null;
  onHoldReason?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "T001", bookingId: "BK-2602-0047", service: "Pipe Leak Fix",
    category: "Plumbing", categoryIcon: "🔧", customerName: "Ramesh Sharma",
    jobDate: "25 Feb 2026", jobAmount: 450, commissionPct: 0.18,
    status: "credited", payoutDate: "26 Feb 2026", upiRef: "UPI26022601",
  },
  {
    id: "T002", bookingId: "BK-2602-0031", service: "Switchboard Replace",
    category: "Electrical", categoryIcon: "⚡", customerName: "Pooja Mehta",
    jobDate: "24 Feb 2026", jobAmount: 600, commissionPct: 0.18,
    status: "credited", payoutDate: "25 Feb 2026", upiRef: "UPI25022602",
  },
  {
    id: "T003", bookingId: "BK-2602-0018", service: "AC Annual Service",
    category: "AC Service", categoryIcon: "❄️", customerName: "Amit Kumar",
    jobDate: "23 Feb 2026", jobAmount: 799, commissionPct: 0.20,
    status: "pending", payoutDate: null, upiRef: null,
  },
  {
    id: "T004", bookingId: "BK-2602-0009", service: "Geyser Repair",
    category: "Appliance Repair", categoryIcon: "🔌", customerName: "Sunita Verma",
    jobDate: "22 Feb 2026", jobAmount: 380, commissionPct: 0.18,
    status: "credited", payoutDate: "23 Feb 2026", upiRef: "UPI23022603",
  },
  {
    id: "T005", bookingId: "BK-2602-0003", service: "Bathroom Fitting",
    category: "Plumbing", categoryIcon: "🔧", customerName: "Mohan Lal",
    jobDate: "20 Feb 2026", jobAmount: 750, commissionPct: 0.18,
    status: "pending", payoutDate: null, upiRef: null,
  },
  {
    id: "T006", bookingId: "BK-2501-0087", service: "Ceiling Fan Install",
    category: "Electrical", categoryIcon: "⚡", customerName: "Rekha Singh",
    jobDate: "18 Feb 2026", jobAmount: 250, commissionPct: 0.18,
    status: "on_hold", payoutDate: null, upiRef: null,
    onHoldReason: "Customer ne service quality dispute raise kiya hai. ADDies team review kar rahi hai.",
  },
  {
    id: "T007", bookingId: "BK-2501-0062", service: "Sofa Deep Clean",
    category: "Home Cleaning", categoryIcon: "🧹", customerName: "Priya Agarwal",
    jobDate: "15 Feb 2026", jobAmount: 999, commissionPct: 0.15,
    status: "credited", payoutDate: "16 Feb 2026", upiRef: "UPI16022605",
  },
  {
    id: "T008", bookingId: "BK-2501-0044", service: "AC Gas Refill",
    category: "AC Service", categoryIcon: "❄️", customerName: "Deepak Shah",
    jobDate: "12 Feb 2026", jobAmount: 1200, commissionPct: 0.20,
    status: "refunded", payoutDate: null, upiRef: null,
    onHoldReason: "Customer ne booking cancel ki — full refund process ho gaya.",
  },
];

// ─── Calc ─────────────────────────────────────────────────────────────────────
function calc(jobAmount: number, commissionPct: number) {
  const commission     = Math.round(jobAmount * commissionPct);
  const gstOnComm      = Math.round(commission * GST_RATE);
  const totalDeducted  = commission + gstOnComm;
  const vendorReceives = jobAmount - totalDeducted;
  return { commission, gstOnComm, totalDeducted, vendorReceives };
}

// ─── Status Config ────────────────────────────────────────────────────────────
const S: Record<TxnStatus, {
  label: string; badge: string; border: string; bg: string;
  icon: React.ElementType; dot: string; strip: string;
}> = {
  credited: {
    label: "Settled ✅",      badge: "bg-green-100 text-green-700",
    border: "border-green-200", bg: "bg-green-50/20",
    icon: CheckCircle2,         dot: "bg-green-500", strip: "bg-green-400",
  },
  pending: {
    label: "Commission Due ⏳", badge: "bg-amber-100 text-amber-700",
    border: "border-amber-300",  bg: "bg-amber-50/30",
    icon: Clock,                 dot: "bg-amber-500", strip: "bg-amber-400",
  },
  on_hold: {
    label: "On Hold 🔴",       badge: "bg-red-100 text-red-600",
    border: "border-red-300",   bg: "bg-red-50/20",
    icon: AlertCircle,           dot: "bg-red-500",   strip: "bg-red-400",
  },
  refunded: {
    label: "Refunded ↩️",      badge: "bg-slate-100 text-slate-500",
    border: "border-slate-200", bg: "bg-slate-50/20",
    icon: Ban,                   dot: "bg-slate-400", strip: "bg-slate-300",
  },
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  const { commission, gstOnComm, totalDeducted, vendorReceives } = calc(txn.jobAmount, txn.commissionPct);
  const cfg    = S[txn.status];
  const SIcon  = cfg.icon;
  const [copied, setCopied] = useState<"upi" | null>(null);

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied("upi");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-950 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{txn.categoryIcon}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{txn.category}</span>
              </div>
              <h2 className="text-lg font-black text-white">{txn.service}</h2>
              <p className="text-slate-400 text-xs mt-0.5">{txn.customerName} · {txn.jobDate} · #{txn.bookingId}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.badge}`}>
            <SIcon size={11} /> {cfg.label}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">

          {/* ── BREAKDOWN TABLE (har status pe dikhega) */}
          <div className="p-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Receipt size={12} /> Payment Breakdown
            </h3>
            <div className="rounded-2xl border border-slate-100 overflow-hidden mb-4">
              {[
                {
                  label: "Job / Service Amount",
                  note:  "Customer ne ye amount pay kiya",
                  value: `₹${txn.jobAmount.toLocaleString("en-IN")}`,
                  vc: "text-slate-800", bold: false, bg: "bg-white",
                },
                {
                  label: `Platform Commission (${(txn.commissionPct * 100).toFixed(0)}%)`,
                  note:  `${(txn.commissionPct * 100).toFixed(0)}% of ₹${txn.jobAmount} — ADDies service fee`,
                  value: `− ₹${commission.toLocaleString("en-IN")}`,
                  vc: "text-red-600", bold: false, bg: "bg-slate-50/60",
                },
                {
                  label: "GST on Commission (18%)",
                  note:  `18% GST on ₹${commission} — Govt. of India tax`,
                  value: `− ₹${gstOnComm.toLocaleString("en-IN")}`,
                  vc: "text-red-500", bold: false, bg: "bg-white",
                },
                {
                  label: "Total Platform Deduction",
                  note:  "Commission + GST — platform customer ke payment se automatically kaat leta hai",
                  value: `− ₹${totalDeducted.toLocaleString("en-IN")}`,
                  vc: "text-red-700", bold: true, bg: "bg-red-50",
                  separator: true,
                },
                {
                  label: "Aapki Net Earning",
                  note:  txn.status === "credited"  ? `Credited on ${txn.payoutDate} · Ref: ${txn.upiRef}`
                       : txn.status === "pending"   ? "Customer ne pay kiya — platform 24–48hr mein credit karega"
                       : txn.status === "on_hold"   ? "Dispute resolve hone tak hold pe hai"
                       :                              "Booking cancel — applicable nahi",
                  value: `₹${vendorReceives.toLocaleString("en-IN")}`,
                  vc: txn.status === "credited" ? "text-emerald-600" : "text-slate-400",
                  bold: true, bg: txn.status === "credited" ? "bg-emerald-50" : "bg-slate-50",
                  highlight: true,
                },
              ].map((row, i) => (
                <div key={i}>
                  {(row as any).separator && <div className="h-px bg-slate-200" />}
                  <div className={`flex items-start justify-between gap-4 px-4 py-3 ${row.bg}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${row.bold ? "font-black" : "font-medium"} text-slate-700`}>{row.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{row.note}</p>
                    </div>
                    <p className={`text-sm flex-shrink-0 ${row.bold ? "font-black" : "font-semibold"} ${row.vc}`}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Net amount card */}
            <div className={`rounded-2xl p-4 flex items-center justify-between
              ${txn.status === "credited" ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white"
              : txn.status === "pending"  ? "bg-amber-50 border-2 border-amber-300"
              : "bg-slate-100 border border-slate-200"}`}>
              <div>
                <p className={`text-xs font-bold mb-0.5 ${txn.status === "credited" ? "text-emerald-200" : "text-slate-500"}`}>
                  Aapki Net Earning
                </p>
                <p className={`text-3xl font-black ${txn.status === "credited" ? "text-white" : txn.status === "pending" ? "text-amber-700" : "text-slate-400"}`}>
                  ₹{vendorReceives.toLocaleString("en-IN")}
                </p>
                <p className={`text-xs mt-1 ${txn.status === "credited" ? "text-emerald-200" : "text-slate-400"}`}>
                  {txn.status === "credited" && `Credited on ${txn.payoutDate}`}
                  {txn.status === "pending"  && "Customer ne pay kiya — platform processing mein hai"}
                  {txn.status === "on_hold"  && "Dispute resolve hone par milega"}
                  {txn.status === "refunded" && "Booking cancel — nahi milega"}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${txn.status === "credited" ? "text-emerald-200" : "text-slate-400"}`}>Aap rakhenge</p>
                <p className={`text-2xl font-black ${txn.status === "credited" ? "text-white" : "text-slate-500"}`}>
                  {(100 - (totalDeducted / txn.jobAmount * 100)).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              STATUS-SPECIFIC SECTION
          ══════════════════════════════════════════════════ */}

          {/* ── CREDITED: Receipt only, NO QR */}
          {txn.status === "credited" && (
            <div className="px-5 pb-5 space-y-3">
              <div className="h-px bg-slate-100" />
              <h3 className="text-xs font-black text-green-600 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={12} /> Settlement Receipt
              </h3>
              <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-green-100">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-green-800 text-sm">Paid & Fully Settled</p>
                    <p className="text-xs text-green-600">Is booking ka koi pending amount nahi hai</p>
                  </div>
                </div>
                {[
                  ["Payout Date",    txn.payoutDate ?? "—"],
                  ["UPI Reference",  txn.upiRef ?? "—"],
                  ["Platform UPI",   UPI_ID],
                  ["Commission Paid",`₹${commission}`],
                  ["GST Paid",       `₹${gstOnComm}`],
                  ["Total Deducted", `₹${totalDeducted}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-green-700 font-semibold">{label}</span>
                    <span className="text-xs font-black text-green-900">{value}</span>
                  </div>
                ))}
              </div>

              {/* Clear explanation: why no QR */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <Lock size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-slate-600 mb-0.5">Payment QR kyun nahi dikh raha?</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Is booking ka platform commission aur GST pehle se pay aur settle ho chuka hai
                    (Ref: {txn.upiRef})। Dobara payment ki koi zarurat nahi — yeh transaction close hai.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── PENDING: Processing — vendor kuch nahi deta */}
          {txn.status === "pending" && (
            <div className="px-5 pb-5 space-y-3">
              <div className="h-px bg-slate-100" />
              <h3 className="text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-2">
                <Clock size={12} /> Payment Processing
              </h3>

              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-amber-800 text-sm mb-1">Customer Payment Processing Mein Hai</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Customer ne payment ki hai. ADDies platform apna commission (₹{commission}) aur GST (₹{gstOnComm})
                      automatically deduct karke <strong>₹{vendorReceives}</strong> aapke wallet mein credit kar dega.
                      Aapko kuch alag se nahi dena.
                    </p>
                  </div>
                </div>
                {[
                  ["Customer Paid",       `₹${txn.jobAmount} (Full Amount)`],
                  ["Platform Deducting",  `₹${totalDeducted} (Auto)`],
                  ["Aapko Milega",        `₹${vendorReceives}`],
                  ["Expected Credit",     "24–48 hours mein"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-amber-100 last:border-0">
                    <span className="text-xs text-amber-700 font-semibold">{label}</span>
                    <span className="text-xs font-black text-amber-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <Lock size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-slate-600 mb-0.5">Payment QR kyun nahi dikh raha?</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Customer ne poora job amount (₹{txn.jobAmount}) ADDies platform ko pay kar diya hai.
                    Platform apna hissa auto-deduct karke aapka ₹{vendorReceives} process kar raha hai.
                    Aapko koi alag payment nahi karni — sab automatic hai.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── ON HOLD: Explain, no QR */}
          {txn.status === "on_hold" && (
            <div className="px-5 pb-5 space-y-3">
              <div className="h-px bg-slate-100" />
              <h3 className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={12} /> Hold Ka Kaaran
              </h3>
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-red-800 text-sm mb-1">Payment Temporarily Blocked</p>
                    <p className="text-xs text-red-700 leading-relaxed">{txn.onHoldReason}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-red-100">
                  <Lock size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Payment QR kyun nahi dikh raha?</strong> Kyunki is booking pe dispute active
                    hai. Jab tak dispute resolve nahi hota, commission payment block hai. Resolve hone
                    ke baad QR generate hoga.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800 text-white cursor-pointer hover:bg-slate-700 transition-colors">
                <HeadphonesIcon size={20} className="text-emerald-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold">Support se Baat Karo</p>
                  <p className="text-xs text-slate-400 mt-0.5">Dispute jaldi resolve karane ke liye</p>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </div>
            </div>
          )}

          {/* ── REFUNDED: Info only, no QR */}
          {txn.status === "refunded" && (
            <div className="px-5 pb-5 space-y-3">
              <div className="h-px bg-slate-100" />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Ban size={20} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="font-black text-slate-700 text-sm">Booking Cancelled / Refunded</p>
                    <p className="text-xs text-slate-500 mt-0.5">{txn.onHoldReason}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-100">
                  <Lock size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <strong>Payment QR nahi dikhaya ja raha</strong> kyunki yeh booking cancel ho gayi
                    thi. Koi commission nahi liya gaya aur na hi liya jayega. Transaction permanently closed hai.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Transaction Card ─────────────────────────────────────────────────────────
function TxnCard({ txn, onView }: { txn: Transaction; onView: (t: Transaction) => void }) {
  const { commission, gstOnComm, totalDeducted, vendorReceives } = calc(txn.jobAmount, txn.commissionPct);
  const cfg   = S[txn.status];
  const SIcon = cfg.icon;

  return (
    <div className={`bg-white rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden hover:shadow-lg transition-all duration-200`}>
      {/* Color strip top */}
      <div className={`h-1.5 ${cfg.strip}`} />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl flex-shrink-0">
            {txn.categoryIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-slate-800 text-sm truncate">{txn.service}</p>
            <p className="text-xs text-slate-400 mt-0.5">{txn.customerName} · {txn.jobDate}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0 ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* 3-column amount grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-2xs text-slate-400 font-bold uppercase mb-0.5">Job Amt</p>
            <p className="text-sm font-black text-slate-700">₹{txn.jobAmount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-center">
            <p className="text-2xs text-red-400 font-bold uppercase mb-0.5">Deducted</p>
            <p className="text-sm font-black text-red-600">−₹{totalDeducted}</p>
            <p className="text-2xs text-red-300">(Comm+GST)</p>
          </div>
          <div className={`p-2.5 rounded-xl text-center border
            ${txn.status === "credited" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
            <p className="text-2xs text-slate-400 font-bold uppercase mb-0.5">You Get</p>
            <p className={`text-sm font-black ${txn.status === "credited" ? "text-emerald-600" : "text-slate-400"}`}>
              ₹{vendorReceives}
            </p>
          </div>
        </div>

        {/* Status hint — clear one-liner */}
        <div className={`flex items-start gap-2 p-2.5 rounded-xl mb-3 text-xs leading-relaxed
          ${txn.status === "credited" ? "bg-green-50 border border-green-100 text-green-700"
          : txn.status === "pending"  ? "bg-amber-50 border border-amber-200 text-amber-700"
          : txn.status === "on_hold"  ? "bg-red-50 border border-red-100 text-red-600"
          : "bg-slate-50 border border-slate-100 text-slate-500"}`}>
          <SIcon size={12} className="flex-shrink-0 mt-0.5" />
          <span className="font-semibold">
            {txn.status === "credited" && `Platform ne commission auto-deduct kiya. ₹${vendorReceives} credited on ${txn.payoutDate}.`}
            {txn.status === "pending"  && `Customer ne ₹${txn.jobAmount} pay kiya. Platform processing — ₹${vendorReceives} aapko 24–48hr mein milega.`}
            {txn.status === "on_hold"  && "Dispute review chal raha hai. Payment roki gayi hai — resolve hone par milega."}
            {txn.status === "refunded" && "Booking cancel. Customer ko refund. Koi amount applicable nahi."}
          </span>
        </div>

        {/* CTA button — context-aware */}
        <button
          onClick={() => onView(txn)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all
            ${txn.status === "on_hold"
              ? "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
              : "border border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50"}`}
        >
          {txn.status === "pending"  && <><Clock size={13} /> Processing Status Dekho</>}
          {txn.status === "credited" && <><Receipt size={13} /> Receipt & Breakdown Dekho</>}
          {txn.status === "on_hold"  && <><AlertCircle size={13} /> Hold Ka Kaaran Dekho</>}
          {txn.status === "refunded" && <><Eye size={13} /> Details Dekho</>}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorEarningsPage() {
  const { user } = useAuthStore();
  const [selectedTxn,  setSelectedTxn]  = useState<Transaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | TxnStatus>("all");

  const vendorCats     = (user as any)?.categories as string[] | undefined;
  const defaultCommPct = COMMISSION_MAP[vendorCats?.[0] ?? "default"] ?? 0.18;

  const credited = MOCK_TRANSACTIONS.filter(t => t.status === "credited");
  const pending  = MOCK_TRANSACTIONS.filter(t => t.status === "pending");
  const onHold   = MOCK_TRANSACTIONS.filter(t => t.status === "on_hold");

  const totalGross     = credited.reduce((s, t) => s + t.jobAmount, 0);
  const totalDeducted  = credited.reduce((s, t) => s + calc(t.jobAmount, t.commissionPct).totalDeducted, 0);
  const totalNet       = credited.reduce((s, t) => s + calc(t.jobAmount, t.commissionPct).vendorReceives, 0);
  const pendingCommDue = pending.reduce((s, t)  => s + calc(t.jobAmount, t.commissionPct).totalDeducted, 0);

  const filtered = MOCK_TRANSACTIONS.filter(t => statusFilter === "all" || t.status === statusFilter);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <IndianRupee size={22} className="text-emerald-500" /> Earnings & Payouts
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Har job ka net amount — commission aur GST ke baad aapko jo milega
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Gross",      value: `₹${totalGross.toLocaleString("en-IN")}`,     sub: "Customer ne pay kiya",          icon: Wrench,       c: "text-slate-700", bg: "bg-white",       b: "border-slate-200" },
          { label: "Platform Deducted",value: `₹${totalDeducted.toLocaleString("en-IN")}`,  sub: "Comm + GST (settled jobs)",     icon: Percent,      c: "text-red-500",   bg: "bg-red-50",      b: "border-red-200" },
          { label: "Net Credited",     value: `₹${totalNet.toLocaleString("en-IN")}`,        sub: "Aapke account mein",            icon: CheckCircle2, c: "text-emerald-600",bg:"bg-emerald-50",  b: "border-emerald-200" },
          { label: "Processing",      value: `₹${pendingCommDue.toLocaleString("en-IN")}`,  sub: `${pending.length} jobs — credit pending`, icon: Clock, c: "text-amber-600", bg: "bg-amber-50", b: "border-amber-300" },
        ].map(({ label, value, sub, icon: Icon, c, bg, b }) => (
          <div key={label} className={`rounded-2xl border-2 ${b} ${bg} p-4`}>
            <Icon size={16} className={`${c} mb-2`} />
            <p className={`text-xl font-black ${c}`}>{value}</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} className="text-amber-400" />
          <h3 className="font-black text-sm">Payout Kaise Kaam Karta Hai?</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Customer <strong className="text-white">poora job amount</strong> pay karta hai ADDies ko.
          Platform apna commission + GST <strong className="text-white">automatically</strong> kaat kar
          baaki amount vendor ke wallet mein credit karta hai. Vendor ko alag se kuch nahi dena.
        </p>

        {/* Formula */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {[
            { val: "₹1,000", lbl: "Job Amount",          sub: "Customer pays",    bg: "bg-slate-700" },
            { val: `−${(defaultCommPct * 100).toFixed(0)}%`, lbl: "Platform Comm",sub: "ADDies fee",   bg: "bg-red-900/70" },
            { val: "−18% GST",lbl: "GST on Comm",        sub: "Govt. tax",        bg: "bg-red-900/50" },
            { val: "Net",     lbl: "Aapko Milega",        sub: "Credited to you",  bg: "bg-emerald-800" },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-xl p-3 text-center relative`}>
              {i < 3 && (
                <div className="hidden sm:flex absolute -right-1.5 top-1/2 -translate-y-1/2 z-10 w-3 h-3 rounded-full bg-slate-600 items-center justify-center">
                  <ChevronRight size={8} className="text-white" />
                </div>
              )}
              <p className="text-xl font-black">{item.val}</p>
              <p className="text-xs font-bold text-slate-300 mt-0.5">{item.lbl}</p>
              <p className="text-xs text-slate-400">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Status legend */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {[
            { icon: CheckCircle2, c: "text-green-400",  lbl: "Settled ✅",       desc: "Customer ne full payment ki. Platform ne commission auto-deduct kiya. Net amount aapke wallet mein credit ho gaya." },
            { icon: Clock,        c: "text-amber-400",  lbl: "Processing ⏳",    desc: "Customer ne full amount pay kiya. Platform commission auto-deduct karke aapka net amount 24–48hr mein credit karega. Aapko kuch nahi karna." },
            { icon: AlertCircle,  c: "text-red-400",    lbl: "On Hold 🔴",       desc: "Dispute active hai. Payment roki gayi hai. Resolve hone par automatically credit hoga." },
            { icon: Ban,          c: "text-slate-400",  lbl: "Refunded ↩️",      desc: "Booking cancel. Customer ko full refund. Koi commission applicable nahi." },
          ].map(({ icon: Icon, c, lbl, desc }) => (
            <div key={lbl} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Icon size={14} className={`${c} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="text-xs font-bold text-white">{lbl}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending alert */}
      {pending.length > 0 && (statusFilter === "all" || statusFilter === "pending") && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300">
          <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-amber-800 text-sm">
              {pending.length} job{pending.length > 1 ? "s" : ""} ka payment processing mein hai
            </p>
            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
              Customer ne full amount pay kar diya. ADDies platform commission + GST
              <strong> automatically</strong> deduct karke aapka net amount 24–48 ghante mein wallet mein
              credit kar dega. Aapko kuch nahi karna.
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: "all",      label: "Sabhi",       count: MOCK_TRANSACTIONS.length, active: "bg-emerald-600 text-white" },
          { key: "credited", label: "Settled",      count: credited.length,          active: "bg-green-500 text-white" },
          { key: "pending",  label: "Processing",   count: pending.length,           active: "bg-amber-400 text-amber-900" },
          { key: "on_hold",  label: "On Hold",       count: onHold.length,           active: "bg-red-500 text-white" },
        ] as const).map(({ key, label, count, active }) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
              ${statusFilter === key ? active : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-black
              ${statusFilter === key ? "bg-white/20" : "bg-white border border-slate-200 text-slate-600"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Transaction Cards */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <IndianRupee size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-bold text-slate-400">Koi transaction nahi mili</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filtered.map(txn => (
            <TxnCard key={txn.id} txn={txn} onView={setSelectedTxn} />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedTxn && (
        <DetailModal
          txn={MOCK_TRANSACTIONS.find(t => t.id === selectedTxn.id) ?? selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
}
