/**
 * VendorAcceptedJobsPage.tsx
 * Location: src/pages/vendor/VendorAcceptedJobsPage.tsx
 */

import { useState, useEffect } from "react";
import {
  CheckCircle2, Clock, MapPin, Phone, IndianRupee,
  Calendar, User, Navigation, Wrench, X, Star,
  BadgeCheck, Timer, Shield, ClipboardCheck, Loader2,
  Info, Search, QrCode, Copy, Wallet,
  Receipt, AlertCircle, Sparkles,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const UPI_ID        = "9250138552@icici";
const PLATFORM_NAME = "ADDies ServiceHub";
const COMMISSION_MAP: Record<string, number> = {
  "Plumbing":         0.18,
  "Electrical":       0.18,
  "AC Service":       0.20,
  "Home Cleaning":    0.15,
  "Appliance Repair": 0.18,
  "Painting":         0.15,
  "default":          0.18,
};
const GST_RATE         = 0.18;
const QR_TIMER_SECONDS = 180;

// ─── Types ────────────────────────────────────────────────────────────────────
type JobStatus = "arriving" | "in_progress" | "otp_pending" | "awaiting_payment" | "payment_done";

interface AcceptedJob {
  id: string; bookingId: string; service: string;
  category: string; categoryIcon: string;
  customer: { name: string; mobile: string; rating: number; totalBookings: number; verified: boolean };
  address: string; city: string; pincode: string;
  scheduledDate: string; scheduledTime: string;
  amount: number; status: JobStatus; description: string;
  acceptedAt: string; distance: string;
  startOtp: string; endOtp: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_JOBS: AcceptedJob[] = [
  {
    id: "AJ001", bookingId: "BK-2602-0047",
    service: "Pipe Leak Fix — Kitchen", category: "Plumbing", categoryIcon: "🔧",
    customer: { name: "Ramesh Sharma", mobile: "98765 43210", rating: 4.8, totalBookings: 12, verified: true },
    address: "12-A, Green Park Colony, Near Bus Stand", city: "Delhi", pincode: "110016",
    scheduledDate: "Today, 27 Feb", scheduledTime: "2:00 PM – 4:00 PM",
    amount: 450, status: "arriving",
    description: "Kitchen sink pipe leaking under the cabinet. Water dripping continuously.",
    acceptedAt: "11:45 AM", distance: "1.8 km", startOtp: "4823", endOtp: "7391",
  },
  {
    id: "AJ002", bookingId: "BK-2602-0031",
    service: "Switchboard Replacement", category: "Electrical", categoryIcon: "⚡",
    customer: { name: "Pooja Mehta", mobile: "91234 56789", rating: 4.5, totalBookings: 5, verified: true },
    address: "Flat 302, Sunrise Apartments, Lajpat Nagar", city: "Delhi", pincode: "110024",
    scheduledDate: "Today, 27 Feb", scheduledTime: "4:30 PM – 6:00 PM",
    amount: 600, status: "in_progress",
    description: "Old switchboard in living room needs complete replacement. 4 switches + 2 sockets.",
    acceptedAt: "10:20 AM", distance: "3.2 km", startOtp: "2156", endOtp: "8847",
  },
  {
    id: "AJ003", bookingId: "BK-2602-0018",
    service: "Split AC Annual Service", category: "AC Service", categoryIcon: "❄️",
    customer: { name: "Amit Kumar", mobile: "99001 12233", rating: 4.2, totalBookings: 8, verified: false },
    address: "Villa 7, DLF Phase 2", city: "Delhi", pincode: "110028",
    scheduledDate: "Tomorrow, 28 Feb", scheduledTime: "11:00 AM – 1:00 PM",
    amount: 799, status: "otp_pending",
    description: "1.5 Ton Daikin split AC needs full servicing. Cooling efficiency reduced.",
    acceptedAt: "Yesterday 3:00 PM", distance: "5.6 km", startOtp: "6634", endOtp: "1029",
  },
];

// ─── Calc ─────────────────────────────────────────────────────────────────────
function calcBreakdown(amount: number, category: string) {
  const commPct       = COMMISSION_MAP[category] ?? COMMISSION_MAP["default"];
  const commission    = Math.round(amount * commPct);
  const gstOnComm     = Math.round(commission * GST_RATE);
  const totalDeducted = commission + gstOnComm;
  const netEarning    = amount - totalDeducted;
  return { amount, commPct, commission, gstOnComm, totalDeducted, netEarning };
}

// ─── Status Config — 5 steps total, payment_done = step 5 (last) ─────────────
const STATUS_CONFIG: Record<JobStatus, {
  label: string; color: string; bg: string; icon: React.ElementType; step: number; strip: string;
}> = {
  arriving:         { label: "On the Way",       color: "text-blue-700",   bg: "bg-blue-100",   icon: Navigation,   step: 1, strip: "bg-blue-400"   },
  in_progress:      { label: "In Progress",      color: "text-violet-700", bg: "bg-violet-100", icon: Wrench,       step: 2, strip: "bg-violet-500" },
  otp_pending:      { label: "OTP Pending",      color: "text-amber-700",  bg: "bg-amber-100",  icon: Timer,        step: 3, strip: "bg-amber-400"  },
  awaiting_payment: { label: "Awaiting Payment", color: "text-orange-700", bg: "bg-orange-100", icon: QrCode,       step: 4, strip: "bg-orange-400" },
  payment_done:     { label: "✅ Complete",       color: "text-green-700",  bg: "bg-green-100",  icon: CheckCircle2, step: 5, strip: "bg-green-500"  },
};

// 5 steps — maps to STATUS_CONFIG steps 1–5
const STEPS: { label: string; shortLabel: string }[] = [
  { label: "Accepted",   shortLabel: "Accepted"  },
  { label: "On Way",     shortLabel: "On Way"    },
  { label: "In Progress",shortLabel: "Working"   },
  { label: "Payment",    shortLabel: "Payment"   },
  { label: "Complete",   shortLabel: "Complete"  },
];

// ─── Stepper — vertical compact, no overflow ──────────────────────────────────
function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full">
      {/* Horizontal dots + lines */}
      <div className="flex items-center w-full mb-1">
        {STEPS.map((_, i) => {
          const stepNum = i + 1;
          const done    = currentStep > stepNum;
          const active  = currentStep === stepNum;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              {/* Dot */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all
                ${done   ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                : active ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                :          "bg-slate-100 text-slate-400"}`}>
                {done ? <CheckCircle2 size={13} /> : stepNum}
              </div>
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500
                  ${done ? "bg-emerald-500" : "bg-slate-100"}`} />
              )}
            </div>
          );
        })}
      </div>
      {/* Labels below — hidden on tiny screens, visible sm+ */}
      <div className="hidden sm:flex w-full">
        {STEPS.map((s, i) => {
          const stepNum = i + 1;
          const done    = currentStep > stepNum;
          const active  = currentStep === stepNum;
          const isLast  = i === STEPS.length - 1;
          return (
            <div key={i} className={`flex-1 ${isLast ? "flex-none" : ""}`}>
              <span className={`text-2xs font-semibold block
                ${isLast ? "text-right" : i === 0 ? "text-left" : "text-center"}
                ${done || active ? "text-emerald-600" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Mobile: show only current step name */}
      <div className="sm:hidden mt-1 text-center">
        <span className="text-xs font-bold text-emerald-600">
          Step {currentStep}/5 — {STEPS[currentStep - 1]?.label ?? "Complete"}
        </span>
      </div>
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({
  label, hint, correctOtp, onSuccess, color = "emerald",
}: {
  label: string; hint: string; correctOtp: string; onSuccess: () => void; color?: "emerald" | "blue";
}) {
  const [otp,     setOtp]     = useState(["", "", "", ""]);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next); setError("");
    if (val && i < 3) document.getElementById(`otp-${label}-${i + 1}`)?.focus();
  }
  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`otp-${label}-${i - 1}`)?.focus();
  }
  function verify() {
    const entered = otp.join("");
    if (entered.length < 4) { setError("4-digit OTP daalo"); return; }
    if (entered !== correctOtp) { setError(`Galat OTP. (Demo: ${correctOtp})`); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); onSuccess(); }, 800);
  }

  const ring = color === "emerald" ? "focus:border-emerald-400 focus:ring-emerald-100" : "focus:border-blue-400 focus:ring-blue-100";
  const btn  = color === "emerald" ? "from-emerald-500 to-emerald-600 shadow-emerald-200" : "from-blue-500 to-blue-600 shadow-blue-200";

  if (done) return (
    <div className="flex items-center gap-2 py-1 text-green-600 font-bold text-sm">
      <CheckCircle2 size={16} /> OTP Verified ✓
    </div>
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 leading-relaxed">{hint}</p>
      <div className="flex gap-2 items-center">
        {otp.map((d, i) => (
          <input key={i} id={`otp-${label}-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKey(i, e)}
            className={`w-12 h-13 text-center text-xl font-black border-2 rounded-xl bg-white
              focus:outline-none focus:ring-2 transition-all ${ring}
              ${error ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            style={{ height: "3rem" }}
          />
        ))}
        <button onClick={verify} disabled={loading || otp.join("").length < 4}
          className={`ml-1 flex-1 py-3 rounded-xl bg-gradient-to-r ${btn} text-white text-xs font-bold
            disabled:opacity-40 shadow-md transition-all flex items-center justify-center gap-1.5`}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
          {loading ? "Verifying…" : "Verify OTP"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}

// ─── QR Timer Hook ────────────────────────────────────────────────────────────
function useQrTimer(active: boolean) {
  const [seconds, setSeconds] = useState(QR_TIMER_SECONDS);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!active) return;
    setSeconds(QR_TIMER_SECONDS); setExpired(false);
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); setExpired(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [active]);

  return {
    seconds, expired,
    display: `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
    pct: (seconds / QR_TIMER_SECONDS) * 100,
  };
}

// ─── Payment QR Panel ─────────────────────────────────────────────────────────
function PaymentQrPanel({ job, onPaymentReceived }: { job: AcceptedJob; onPaymentReceived: () => void }) {
  const bd = calcBreakdown(job.amount, job.category);
  const [qrActive,    setQrActive]    = useState(true);
  const [copied,      setCopied]      = useState<"upi" | "note" | null>(null);
  const [confirming,  setConfirming]  = useState(false);
  const timer = useQrTimer(qrActive);

  const upiNote = `ADDies-${job.bookingId}-Payment`;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PLATFORM_NAME)}&am=${job.amount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;

  function copy(text: string, key: "upi" | "note") {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000);
  }

  function handleConfirm() {
    setConfirming(true);
    setTimeout(() => { setConfirming(false); onPaymentReceived(); }, 900);
  }

  return (
    <div className="space-y-4">

      {/* Breakdown — dark card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-white">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Payment Breakdown</p>
        <p className="text-xs text-emerald-300 mb-3 leading-relaxed">
          Customer poora ₹{bd.amount} pay karega. Platform apna hissa <strong>automatically</strong> kaat
          kar aapko ₹{bd.netEarning} credit karega.
        </p>
        <div className="space-y-1.5 mb-3">
          {[
            { lbl: "Customer Pays (Full Amount)",             val: `₹${bd.amount}`,         vc: "text-white",       bold: false },
            { lbl: `Platform Comm (${(bd.commPct*100).toFixed(0)}%) — Auto`,val:`−₹${bd.commission}`,vc:"text-red-400",bold:false },
            { lbl: "GST on Commission (18%) — Auto",          val: `−₹${bd.gstOnComm}`,     vc: "text-red-300",     bold: false },
            { lbl: "Total Auto-Deducted",                     val: `−₹${bd.totalDeducted}`, vc: "text-red-400",     bold: true, sep: true },
            { lbl: "Aapki Net Earning",                       val: `₹${bd.netEarning}`,     vc: "text-emerald-400", bold: true, hl: true },
          ].map((r, i) => (
            <div key={i}>
              {(r as any).sep && <div className="h-px bg-white/10 my-1.5" />}
              <div className="flex justify-between items-center gap-2">
                <span className={`text-xs ${(r as any).hl ? "text-emerald-300 font-black" : r.bold ? "text-slate-200 font-bold" : "text-slate-400"}`}>{r.lbl}</span>
                <span className={`text-sm flex-shrink-0 ${r.bold ? "font-black" : "font-semibold"} ${r.vc}`}>{r.val}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-3 rounded-xl bg-white/10 text-center">
            <p className="text-xs text-slate-400">Customer Pays</p>
            <p className="text-2xl font-black">₹{bd.amount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/20 text-center">
            <p className="text-xs text-emerald-300">Aapko Milega</p>
            <p className="text-2xl font-black text-emerald-400">₹{bd.netEarning}</p>
          </div>
        </div>
      </div>

      {/* QR Code Box */}
      <div className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-3
        ${timer.expired ? "border-red-300 bg-red-50" : "border-orange-200 bg-orange-50/30"}`}>

        {/* Timer */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Timer size={12} className={timer.expired ? "text-red-500" : "text-orange-500"} />
              {timer.expired ? "QR Expire Ho Gaya" : "QR Active — Customer ko dikhao"}
            </span>
            <span className={`text-sm font-black tabular-nums
              ${timer.expired ? "text-red-600" : timer.seconds < 60 ? "text-red-500" : "text-orange-600"}`}>
              {timer.display}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000
              ${timer.expired ? "w-0" : timer.seconds < 60 ? "bg-red-400" : "bg-orange-400"}`}
              style={{ width: `${timer.pct}%` }} />
          </div>
          <p className="text-2xs text-slate-400 mt-1">Security ke liye QR 3 min mein expire ho jaata hai</p>
        </div>

        {timer.expired ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <AlertCircle size={36} className="text-red-400" />
            <p className="font-bold text-red-600 text-sm">QR Expire Ho Gaya</p>
            <button onClick={() => { setQrActive(false); setTimeout(() => setQrActive(true), 50); }}
              className="px-5 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all flex items-center gap-2">
              <QrCode size={13} /> Naya QR Generate Karo
            </button>
          </div>
        ) : (
          <>
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100">
              <img src={qrUrl} alt="Payment QR" width={200} height={200} className="rounded-xl block"
                onError={e => ((e.target as HTMLImageElement).style.display = "none")} />
            </div>

            {/* UPI ID */}
            <div className="w-full flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
              <QrCode size={13} className="text-slate-400 flex-shrink-0" />
              <span className="font-black text-slate-800 text-sm flex-1 truncate">{UPI_ID}</span>
              <button onClick={() => copy(UPI_ID, "upi")}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 transition-all flex-shrink-0">
                {copied === "upi" ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} />}
                {copied === "upi" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* UPI Note */}
            <div className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700 font-bold mb-1.5 flex items-center gap-1">
                <Info size={11} /> UPI Remark (auto-fill hoga):
              </p>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-blue-100">
                <p className="text-xs font-mono text-blue-900 flex-1 truncate">{upiNote}</p>
                <button onClick={() => copy(upiNote, "note")}>
                  {copied === "note" ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} className="text-blue-400" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Received Button */}
      {!timer.expired && (
        <>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Customer ne QR scan karke payment kar di? Neeche button dabao — ₹{bd.netEarning} wallet mein add hoga.
            </p>
          </div>
          <button onClick={handleConfirm} disabled={confirming}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700
              text-white font-black text-sm shadow-lg shadow-emerald-200
              hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-60
              transition-all flex items-center justify-center gap-3">
            {confirming
              ? <><Loader2 size={18} className="animate-spin" /> Confirming…</>
              : <><CheckCircle2 size={20} /> Payment Received — ₹{bd.netEarning} Wallet Mein Jod Do</>}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Job Modal ────────────────────────────────────────────────────────────────
function JobModal({
  job, onClose, onStatusChange, onPaymentDone,
}: {
  job: AcceptedJob; onClose: () => void;
  onStatusChange: (id: string, s: JobStatus) => void;
  onPaymentDone: (job: AcceptedJob) => void;
}) {
  const cfg   = STATUS_CONFIG[job.status];
  const SIcon = cfg.icon;
  const bd    = calcBreakdown(job.amount, job.category);

  const [startVerified, setStartVerified] = useState(job.status !== "arriving");
  const [endVerified,   setEndVerified]   = useState(
    job.status === "awaiting_payment" || job.status === "payment_done"
  );
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function handleStartJob() {
    setStartVerified(true);
    onStatusChange(job.id, "in_progress");
    showToast("✅ Job shuru! Customer ko notification gayi.");
  }
  function handleEndOtp() {
    setEndVerified(true);
    onStatusChange(job.id, "awaiting_payment");
    showToast("✅ Job complete! Ab customer se payment lo.");
  }
  function handlePaymentReceived() {
    onStatusChange(job.id, "payment_done");
    onPaymentDone(job);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl
          overflow-hidden max-h-[96vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{job.categoryIcon}</span>
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">{job.category}</span>
              </div>
              <h2 className="text-xl font-black text-white leading-tight">{job.service}</h2>
              <p className="text-emerald-300 text-xs mt-1">#{job.bookingId} · {job.customer.name}</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.bg} ${cfg.color}`}>
            <SIcon size={11} /> {cfg.label}
          </span>
        </div>

        {/* ── Toast */}
        {toast && (
          <div className="mx-5 mt-3 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 size={13} /> {toast}
          </div>
        )}

        {/* ── Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-5">

          {/* ── STEPPER — no horizontal scroll */}
          <Stepper currentStep={cfg.step} />

          {/* ── Customer card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl font-black text-emerald-700 flex-shrink-0">
              {job.customer.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-slate-800">{job.customer.name}</p>
                {job.customer.verified && <BadgeCheck size={14} className="text-blue-500" />}
              </div>
              <div className="flex gap-3 mt-0.5">
                <span className="text-xs text-yellow-600 font-semibold flex items-center gap-1">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" /> {job.customer.rating}
                </span>
                <span className="text-xs text-slate-400">{job.customer.totalBookings} bookings</span>
              </div>
            </div>
            <a href={`tel:${job.customer.mobile}`}
              className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors flex-shrink-0">
              <Phone size={16} />
            </a>
          </div>

          {/* ── Job info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin,      label: "Address",  value: `${job.address}, ${job.city}` },
              { icon: IndianRupee, label: "Amount",   value: `₹${job.amount}` },
              { icon: Calendar,    label: "Date",     value: job.scheduledDate },
              { icon: Clock,       label: "Time",     value: job.scheduledTime },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
                <Icon size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-2xs text-slate-400 font-bold uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 leading-snug break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Customer Note */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1.5">
              <Info size={12} /> Customer Note
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">"{job.description}"</p>
          </div>

          {/* ── OTP Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Shield size={12} /> OTP Verification
            </h4>

            {/* Step 1 — Start OTP */}
            <div className={`p-4 rounded-2xl border-2 transition-all
              ${startVerified ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                  ${startVerified ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>
                  {startVerified ? <CheckCircle2 size={12} /> : "1"}
                </div>
                <p className="text-sm font-bold text-slate-700">Start Job OTP</p>
                {startVerified && <span className="ml-auto text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">✓ Verified</span>}
              </div>
              {startVerified
                ? <p className="text-xs text-green-700 font-semibold">Job started — customer ko notification gayi</p>
                : <OtpInput label="start" hint={`Pahunchne par customer se Start OTP maango. (Demo: ${job.startOtp})`}
                    correctOtp={job.startOtp} onSuccess={handleStartJob} color="blue" />}
            </div>

            {/* Step 2 — End OTP */}
            <div className={`p-4 rounded-2xl border-2 transition-all
              ${!startVerified ? "opacity-40 pointer-events-none border-slate-100 bg-slate-50"
              : endVerified    ? "border-green-200 bg-green-50"
              :                  "border-emerald-200 bg-emerald-50"}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                  ${endVerified ? "bg-green-500 text-white" : startVerified ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                  {endVerified ? <CheckCircle2 size={12} /> : "2"}
                </div>
                <p className="text-sm font-bold text-slate-700">Complete Job OTP</p>
                {endVerified && <span className="ml-auto text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">✓ Verified</span>}
              </div>
              {endVerified
                ? <p className="text-xs text-green-700 font-semibold">Job complete — ab payment lo</p>
                : startVerified
                ? <OtpInput label="end" hint={`Kaam khatam par customer se Completion OTP maango. (Demo: ${job.endOtp})`}
                    correctOtp={job.endOtp} onSuccess={handleEndOtp} color="emerald" />
                : <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Shield size={11} /> Pehle Start OTP verify karo</p>}
            </div>
          </div>

          {/* ── Payment Section — step 3, only after End OTP */}
          {endVerified && job.status !== "payment_done" && (
            <div className="rounded-2xl border-2 border-orange-300 bg-orange-50/40 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center">3</div>
                <p className="text-sm font-bold text-slate-700">Customer Payment</p>
                <span className="ml-auto text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full animate-pulse">● Action Required</span>
              </div>
              <PaymentQrPanel job={job} onPaymentReceived={handlePaymentReceived} />
            </div>
          )}

          {/* ── Completion Card — payment_done */}
          {job.status === "payment_done" && (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={24} className="text-yellow-300" />
                <div>
                  <p className="text-lg font-black">Job & Payment Complete! 🎉</p>
                  <p className="text-emerald-200 text-xs mt-0.5">Earnings page mein full breakdown dekho</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { lbl: "Job Amount",  val: `₹${bd.amount}`,         vc: "text-white" },
                  { lbl: "Deducted",    val: `−₹${bd.totalDeducted}`, vc: "text-red-300" },
                  { lbl: "Net Earning", val: `₹${bd.netEarning}`,     vc: "text-yellow-300" },
                ].map(r => (
                  <div key={r.lbl} className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-emerald-200 mb-1">{r.lbl}</p>
                    <p className={`font-black text-base ${r.vc}`}>{r.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onView }: { job: AcceptedJob; onView: (j: AcceptedJob) => void }) {
  const cfg   = STATUS_CONFIG[job.status];
  const SIcon = cfg.icon;
  const bd    = calcBreakdown(job.amount, job.category);

  const barPct: Record<JobStatus, string> = {
    arriving: "20%", in_progress: "40%", otp_pending: "60%",
    awaiting_payment: "80%", payment_done: "100%",
  };
  const barColor: Record<JobStatus, string> = {
    arriving: "bg-blue-400", in_progress: "bg-violet-500", otp_pending: "bg-amber-400",
    awaiting_payment: "bg-orange-400", payment_done: "bg-emerald-500",
  };

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
      ${job.status === "in_progress"      ? "border-violet-200"
      : job.status === "otp_pending"      ? "border-amber-200"
      : job.status === "awaiting_payment" ? "border-orange-300"
      : job.status === "payment_done"     ? "border-green-200 opacity-80"
      :                                     "border-slate-100"}`}>
      <div className={`h-1.5 ${cfg.strip}`} />
      <div className="p-4">
        {/* Top */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-xl flex-shrink-0">
            {job.categoryIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-slate-800 text-sm truncate">{job.service}</p>
            <p className="text-xs text-slate-400 mt-0.5">{job.category} · #{job.bookingId}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
            <SIcon size={10} /> {cfg.label}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1 mb-3">
          {[
            { icon: User,   val: <>{job.customer.name} {job.customer.verified && <BadgeCheck size={10} className="text-blue-500 inline" />}</> },
            { icon: MapPin, val: `${job.city} · ${job.distance}` },
            { icon: Clock,  val: `${job.scheduledDate} · ${job.scheduledTime}` },
          ].map(({ icon: Icon, val }, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
              <Icon size={10} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{val}</span>
            </div>
          ))}
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-2xs text-slate-400 mb-0.5">Job Amt</p>
            <p className="text-sm font-black text-slate-700">₹{bd.amount}</p>
          </div>
          <div className="p-2 rounded-xl bg-red-50 border border-red-100 text-center">
            <p className="text-2xs text-red-400 mb-0.5">Deducted</p>
            <p className="text-sm font-black text-red-600">−₹{bd.totalDeducted}</p>
          </div>
          <div className={`p-2 rounded-xl text-center border
            ${job.status === "payment_done" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
            <p className="text-2xs text-slate-400 mb-0.5">You Get</p>
            <p className={`text-sm font-black ${job.status === "payment_done" ? "text-emerald-600" : "text-slate-500"}`}>
              ₹{bd.netEarning}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor[job.status]}`}
            style={{ width: barPct[job.status] }} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a href={`tel:${job.customer.mobile}`}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition-all">
            <Phone size={14} />
          </a>
          <button onClick={() => onView(job)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all
              ${job.status === "awaiting_payment"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-200 hover:from-orange-600 hover:to-orange-700"
                : job.status === "payment_done"
                ? "border border-green-200 text-green-700 bg-green-50"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-700"}`}>
            {job.status === "awaiting_payment" ? <><QrCode size={13} /> Payment Lo</>
            : job.status === "payment_done"    ? <><CheckCircle2 size={13} /> Complete ✓</>
            :                                    <><ClipboardCheck size={13} /> Manage Job</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "wallet" }) {
  return (
    <div className={`fixed top-20 right-4 z-[200] px-4 py-3 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2
      ${type === "wallet" ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white" : "bg-emerald-600 text-white"}`}>
      {type === "wallet" ? <Wallet size={16} /> : <CheckCircle2 size={16} />}
      {msg}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorAcceptedJobsPage() {
  const [jobs,         setJobs]         = useState<AcceptedJob[]>(INITIAL_JOBS);
  const [selectedJob,  setSelectedJob]  = useState<AcceptedJob | null>(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [walletBal,    setWalletBal]    = useState(0);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "wallet" } | null>(null);

  function showToast(msg: string, type: "success" | "wallet" = "success") {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  }

  function handleStatusChange(id: string, status: JobStatus) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  }

  function handlePaymentDone(job: AcceptedJob) {
    const bd = calcBreakdown(job.amount, job.category);
    setWalletBal(prev => prev + bd.netEarning);
    showToast(`🎉 ₹${bd.netEarning} wallet mein add! (₹${job.amount} − ₹${bd.totalDeducted})`, "wallet");
  }

  const filtered = jobs.filter(j => {
    if (statusFilter !== "all" && j.status !== statusFilter) return false;
    if (search && !j.service.toLowerCase().includes(search.toLowerCase()) &&
        !j.customer.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: jobs.length,
    arriving: jobs.filter(j => j.status === "arriving").length,
    in_progress: jobs.filter(j => j.status === "in_progress").length,
    otp_pending: jobs.filter(j => j.status === "otp_pending").length,
    awaiting_payment: jobs.filter(j => j.status === "awaiting_payment").length,
    payment_done: jobs.filter(j => j.status === "payment_done").length,
  };

  return (
    <div className="space-y-6">

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ClipboardCheck size={22} className="text-emerald-500" /> Accepted Jobs
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">OTP verify → kaam karo → payment lo → complete</p>
        </div>
        {walletBal > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg">
            <Wallet size={16} />
            <div>
              <p className="text-xs text-emerald-200">Wallet Balance</p>
              <p className="font-black">₹{walletBal.toLocaleString("en-IN")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "On the Way",      count: counts.arriving,         color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",     icon: Navigation },
          { label: "In Progress",     count: counts.in_progress,      color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: Wrench },
          { label: "OTP Pending",     count: counts.otp_pending,      color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",   icon: Timer },
          { label: "Payment Pending", count: counts.awaiting_payment, color: "text-orange-600", bg: "bg-orange-50 border-orange-300", icon: QrCode },
          { label: "Done ✅",          count: counts.payment_done,     color: "text-green-600",  bg: "bg-green-50 border-green-200",   icon: CheckCircle2 },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-2xl border p-3 flex items-center gap-2.5 ${bg}`}>
            <Icon size={16} className={color} />
            <div>
              <p className={`text-lg font-black ${color}`}>{count}</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search service ya customer…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
              focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0 flex-wrap">
          {([
            { key: "all",              label: `All (${counts.all})` },
            { key: "arriving",         label: "On Way" },
            { key: "in_progress",      label: "Active" },
            { key: "awaiting_payment", label: "Pay Now" },
            { key: "payment_done",     label: "Done" },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                ${statusFilter === key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment pending alert */}
      {counts.awaiting_payment > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50 border-2 border-orange-300">
          <QrCode size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-orange-800 text-sm">
              {counts.awaiting_payment} job mein payment pending — jaldi lo!
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              "Payment Lo" → Customer ko QR dikhao → Payment aane par "Payment Received" confirm karo.
            </p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Flow:</strong> Manage Job → <strong>Start OTP</strong> (arrive pe) → Kaam Karo →
          <strong> End OTP</strong> (complete pe) → <strong>Customer ko QR dikhao</strong> (3 min valid) →
          Payment milne par <strong>"Payment Received"</strong> → ₹ wallet mein add ✅
        </p>
      </div>

      {/* Jobs Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-bold text-slate-700 text-lg">Koi job nahi mili</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">Filter change karo ya New Leads se lead accept karo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filtered.map(job => <JobCard key={job.id} job={job} onView={setSelectedJob} />)}
        </div>
      )}

      {/* Modal */}
      {selectedJob && (
        <JobModal
          job={jobs.find(j => j.id === selectedJob.id) ?? selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
          onPaymentDone={handlePaymentDone}
        />
      )}
    </div>
  );
}
