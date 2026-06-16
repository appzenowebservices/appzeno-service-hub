// src/pages/customer/dashboard/pages/WalletPage.tsx

import { useState, useEffect, useRef } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Gift, Copy, CheckCircle2,
  TrendingUp, Clock, Shield, Zap, Tag, ChevronRight,
  ChevronDown, Download, Search, X, AlertCircle,
  Wallet, ReceiptText, RefreshCcw, Info,
  QrCode, ScanLine, ChevronLeft, CheckCheck
} from "lucide-react";
import { useAuthStore } from "../../../../../store/authStore";

// ── Transaction type ──────────────────────────────────────────────────────────
interface TxnItem {
  id:        number;
  txnId:     string;
  type:      "credit" | "debit";
  label:     string;
  category:  string;
  icon:      string;
  date:      string;
  time:      string;
  amount:    number;
  balance:   number;
  bookingId: string | null;
  vendor:    string | null;
  note:      string;
  status:    string;
}

// ── Transaction Data ──────────────────────────────────────────────────────────
const BASE_TRANSACTIONS: TxnItem[] = [
  {
    id:1, txnId:"TXN-2502-08431", type:"credit",
    label:"Cashback — Home Cleaning",
    category:"Cashback", icon:"🧹",
    date:"25 Feb 2026", time:"11:42 AM",
    amount:50,  balance:250,
    bookingId:"BK-2502-0023", vendor:"CleanPro Services",
    note:"5% cashback on ₹999 service",
    status:"completed",
  },
  {
    id:2, txnId:"TXN-2002-07215", type:"debit",
    label:"Wallet used — Plumbing Repair",
    category:"Payment", icon:"🔧",
    date:"20 Feb 2026", time:"2:15 PM",
    amount:-100, balance:200,
    bookingId:"BK-2702-0087", vendor:"Kumar Plumbers",
    note:"Partial wallet payment for booking",
    status:"completed",
  },
  {
    id:3, txnId:"TXN-1502-06004", type:"credit",
    label:"Referral Bonus — Priya Singh",
    category:"Referral", icon:"🎁",
    date:"15 Feb 2026", time:"9:05 AM",
    amount:100, balance:300,
    bookingId:null, vendor:null,
    note:"Friend signed up using your referral code REF-001234",
    status:"completed",
  },
  {
    id:4, txnId:"TXN-1002-05312", type:"credit",
    label:"Cashback — Electrical Work",
    category:"Cashback", icon:"⚡",
    date:"10 Feb 2026", time:"6:30 PM",
    amount:30,  balance:200,
    bookingId:"BK-1802-0015", vendor:"Power Fix",
    note:"5% cashback on ₹600 service",
    status:"completed",
  },
  {
    id:5, txnId:"TXN-0502-04108", type:"debit",
    label:"Wallet used — AC Service",
    category:"Payment", icon:"❄️",
    date:"5 Feb 2026", time:"3:50 PM",
    amount:-80,  balance:170,
    bookingId:"BK-0103-0041", vendor:"CoolBreeze AC",
    note:"Partial wallet payment for booking",
    status:"completed",
  },
  {
    id:6, txnId:"TXN-2801-03799", type:"credit",
    label:"Welcome Bonus",
    category:"Bonus", icon:"🎉",
    date:"28 Jan 2026", time:"10:00 AM",
    amount:50,  balance:250,
    bookingId:null, vendor:null,
    note:"Welcome bonus on account creation",
    status:"completed",
  },
  {
    id:7, txnId:"TXN-2001-02541", type:"credit",
    label:"Cashback — Pest Control",
    category:"Cashback", icon:"🐛",
    date:"20 Jan 2026", time:"5:15 PM",
    amount:50,  balance:200,
    bookingId:"BK-1002-0009", vendor:"PestAway Solutions",
    note:"5% cashback on ₹999 service",
    status:"completed",
  },
  {
    id:8, txnId:"TXN-1501-01300", type:"credit",
    label:"Add Money — UPI",
    category:"Topup", icon:"💳",
    date:"15 Jan 2026", time:"8:00 AM",
    amount:150, balance:150,
    bookingId:null, vendor:null,
    note:"Added via UPI · ref@upi",
    status:"completed",
  },
];

const OFFERS = [
  { code:"ADDIES10",  desc:"10% off on total (max ₹100)", expiry:"28 Feb 2026", minOrder:500,  bg:"bg-emerald-50", border:"border-emerald-200", text:"text-emerald-700", icon:"💚", type:"percent", value:10 },
  { code:"FLAT50",    desc:"₹50 flat discount",           expiry:"10 Mar 2026", minOrder:300,  bg:"bg-blue-50",    border:"border-blue-200",    text:"text-blue-700",    icon:"💙", type:"flat",    value:50 },
  { code:"NEWUSER",   desc:"15% off for new users",       expiry:"31 Mar 2026", minOrder:200,  bg:"bg-violet-50",  border:"border-violet-200",  text:"text-violet-700",  icon:"💜", type:"percent", value:15 },
  { code:"WELCOME99", desc:"₹99 off on first booking",    expiry:"30 Apr 2026", minOrder:400,  bg:"bg-amber-50",   border:"border-amber-200",   text:"text-amber-700",   icon:"🧡", type:"flat",    value:99 },
];

const CATEGORY_FILTERS = ["All","Cashback","Payment","Referral","Bonus","Topup"];

const CAT_STYLE: Record<string, { bg:string; text:string }> = {
  Cashback: { bg:"bg-emerald-100", text:"text-emerald-700" },
  Payment:  { bg:"bg-red-100",     text:"text-red-700" },
  Referral: { bg:"bg-violet-100",  text:"text-violet-700" },
  Bonus:    { bg:"bg-amber-100",   text:"text-amber-700" },
  Topup:    { bg:"bg-blue-100",    text:"text-blue-700" },
};

// ── UPI QR Code (uses free qrserver.com API) ──────────────────────────────────
function UPIQRCode({ amount }: { amount: string }) {
  const upiString = `upi://pay?pa=addies@upi&pn=ADDies+ServiceHub&am=${amount}&cu=INR&tn=ADDies+Wallet+Topup`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}&bgcolor=f5f3ff&color=5b21b6&margin=12`;
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Frame with corner markers */}
      <div className="relative p-1">
        <div className="w-52 h-52 rounded-2xl border-4 border-violet-200 bg-violet-50 flex items-center justify-center overflow-hidden shadow-lg">
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-violet-50 rounded-xl">
              <RefreshCcw size={22} className="text-violet-400 animate-spin" />
              <p className="text-xs text-violet-400 font-semibold">Generating QR…</p>
            </div>
          )}
          <img
            src={qrUrl} alt="UPI QR Code"
            className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        </div>
        {/* Scanner corner decorators */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-violet-600 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-violet-600 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-violet-600 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-violet-600 rounded-br-xl" />
      </div>

      {/* Amount pill */}
      <div className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl shadow-md shadow-violet-200">
        <span className="text-violet-300 text-sm font-semibold">Pay exactly</span>
        <span className="text-white text-lg font-black">₹{amount}</span>
      </div>

      {/* Supported apps */}
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-2">Scan with any UPI app</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { name:"GPay",    cls:"bg-blue-100 text-blue-700" },
            { name:"PhonePe", cls:"bg-violet-100 text-violet-700" },
            { name:"Paytm",   cls:"bg-sky-100 text-sky-700" },
            { name:"BHIM",    cls:"bg-orange-100 text-orange-700" },
          ].map(a => (
            <span key={a.name} className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.cls}`}>{a.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Add Money Modal (5-step flow) ─────────────────────────────────────────────
type ModalStep = "amount" | "method" | "qr" | "processing" | "success";
type PayMethod = "qr" | "upi" | "card" | "netbanking";

function AddMoneyModal({
  currentBalance,
  onClose,
  onSuccess,
}: {
  currentBalance: number;
  onClose: () => void;
  onSuccess: (addedAmount: number, txn: TxnItem) => void;
}) {
  const [step,       setStep]       = useState<ModalStep>("amount");
  const [amount,     setAmount]     = useState("");
  const [method,     setMethod]     = useState<PayMethod>("qr");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [countdown,  setCountdown]  = useState(45);
  const [upiCopied,  setUpiCopied]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const numAmt  = parseInt(amount) || 0;
  const isValid = numAmt >= 10 && numAmt <= 50000;

  // Countdown auto-confirms payment (demo)
  useEffect(() => {
    if (step === "qr") {
      setCountdown(45);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setStep("processing");
            setTimeout(() => setStep("success"), 1800);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  function proceedNonQR() {
    setStep("processing");
    setTimeout(() => setStep("success"), 2000);
  }

  function confirmManually() {
    clearInterval(timerRef.current!);
    setStep("processing");
    setTimeout(() => setStep("success"), 1800);
  }

  function copyUPI() {
    navigator.clipboard.writeText("addies@upi").catch(() => {});
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
  }

  function handleDone() {
    const now  = new Date();
    const dd   = String(now.getDate()).padStart(2,"0");
    const mm   = String(now.getMonth()+1).padStart(2,"0");
    const rnd  = Math.floor(10000 + Math.random() * 90000);
    const txnId = `TXN-${dd}${mm}-${rnd}`;
    const methodLabel = method === "qr" ? "UPI QR" : method === "upi" ? "UPI" : method === "card" ? "Card" : "Net Banking";
    const newTxn: TxnItem = {
      id:        Date.now(),
      txnId,
      type:      "credit",
      label:     `Add Money — ${methodLabel}`,
      category:  "Topup",
      icon:      "💳",
      date:      now.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
      time:      now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true }),
      amount:    numAmt,
      balance:   currentBalance + numAmt,
      bookingId: null,
      vendor:    null,
      note:      `Wallet topup via ${methodLabel} · ${txnId}`,
      status:    "completed",
    };
    onSuccess(numAmt, newTxn);
  }

  const canGoBack = step === "method" || step === "qr";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
           onClick={step !== "processing" ? onClose : undefined} />

      <div className="relative bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl z-10 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {canGoBack && (
              <button onClick={() => setStep(step === "method" ? "amount" : "method")}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <ChevronLeft size={15} className="text-slate-600" />
              </button>
            )}
            <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
              <Wallet size={15} className="text-violet-600" />
            </div>
            <h3 className="text-base font-black text-slate-800">
              {step === "amount"      ? "Add Money"
               : step === "method"   ? "Payment Method"
               : step === "qr"       ? "Scan & Pay"
               : step === "processing" ? "Verifying…"
               : "Payment Successful! 🎉"}
            </h3>
          </div>
          {step !== "processing" && (
            <button onClick={step === "success" ? handleDone : onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X size={14} className="text-slate-500" />
            </button>
          )}
        </div>

        {/* Step indicator */}
        {step !== "processing" && step !== "success" && (
          <div className="flex items-center gap-1 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
            {(["amount","method","qr"] as ModalStep[]).map((s, i) => {
              const stepIdx  = ["amount","method","qr"].indexOf(step);
              const thisIdx  = i;
              const isDone   = thisIdx < stepIdx;
              const isCur    = thisIdx === stepIdx;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-all
                    ${isDone ? "bg-emerald-500 text-white" : isCur ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                    {isDone ? <CheckCheck size={10}/> : i+1}
                  </div>
                  <span className={`text-xs font-semibold capitalize hidden sm:block
                    ${isCur ? "text-violet-700" : isDone ? "text-emerald-600" : "text-slate-400"}`}>
                    {s === "qr" ? "QR Code" : s}
                  </span>
                  {i < 2 && <div className={`h-px flex-1 w-4 ${isDone ? "bg-emerald-300" : "bg-slate-200"}`} />}
                </div>
              );
            })}
          </div>
        )}

        <div className="px-5 py-5 max-h-[75vh] overflow-y-auto">

          {/* ── Step 1: Amount ── */}
          {step === "amount" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Quick Select</p>
                <div className="grid grid-cols-4 gap-2">
                  {["100","200","500","1000"].map(a => (
                    <button key={a} onClick={() => setAmount(a)}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all
                        ${amount === a ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50/30"}`}>
                      ₹{a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Custom Amount</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                  <input
                    type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="Min ₹10"
                    className="w-full pl-9 pr-4 py-3.5 border-2 border-slate-200 rounded-xl text-xl font-black
                               focus:outline-none focus:border-violet-400 transition-all text-slate-800 placeholder:text-slate-200"
                  />
                </div>
                {amount && !isValid && (
                  <p className="text-xs text-red-500 mt-1.5">Enter amount between ₹10 – ₹50,000</p>
                )}
              </div>
              {isValid && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 text-xs text-amber-700">
                  <Zap size={12} className="text-amber-500 flex-shrink-0" />
                  Adding ₹{numAmt} → earn <strong className="ml-1">{Math.floor(numAmt/20)} loyalty pts</strong>
                  <span className="text-amber-500 mx-1">·</span> new balance
                  <strong className="ml-1">₹{currentBalance + numAmt}</strong>
                </div>
              )}
              <button onClick={() => setStep("method")} disabled={!isValid}
                className="w-full py-3.5 bg-violet-600 text-white rounded-xl font-bold text-sm
                           hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed
                           shadow-lg shadow-violet-200 flex items-center justify-center gap-2">
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Step 2: Payment Method ── */}
          {step === "method" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-xl">
                <span className="text-sm text-violet-600 font-semibold">Amount to add</span>
                <span className="text-lg font-black text-violet-700">₹{numAmt}</span>
              </div>
              <div className="space-y-2">
                {([
                  { key:"qr",         label:"UPI QR Code",         sub:"Scan barcode — fastest option", icon:"📱", badge:"Recommended" },
                  { key:"upi",        label:"UPI ID / VPA",        sub:"Enter your UPI ID manually",    icon:"💸", badge:null },
                  { key:"card",       label:"Debit / Credit Card", sub:"Visa, Mastercard, RuPay",       icon:"💳", badge:null },
                  { key:"netbanking", label:"Net Banking",         sub:"All major Indian banks",        icon:"🏦", badge:null },
                ] as const).map(m => (
                  <button key={m.key} onClick={() => setMethod(m.key)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all
                      ${method === m.key ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-200"}`}>
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold ${method === m.key ? "text-violet-700" : "text-slate-700"}`}>{m.label}</p>
                        {m.badge && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">{m.badge}</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${method === m.key ? "border-violet-500 bg-violet-500" : "border-slate-300"}`}>
                      {method === m.key && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
              {method === "upi" && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Your UPI ID</p>
                  <input value={upiIdInput} onChange={e => setUpiIdInput(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-all" />
                </div>
              )}
              <button onClick={() => method === "qr" ? setStep("qr") : proceedNonQR()}
                className="w-full py-3.5 bg-violet-600 text-white rounded-xl font-bold text-sm
                           hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2">
                {method === "qr" ? <><QrCode size={16} /> Show QR Code</> : <><Zap size={16} /> Pay ₹{numAmt}</>}
              </button>
            </div>
          )}

          {/* ── Step 3: QR Code ── */}
          {step === "qr" && (
            <div className="space-y-4">
              <UPIQRCode amount={String(numAmt)} />

              {/* UPI ID manual copy */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400 font-semibold mb-2">Or pay to UPI ID directly</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-black font-mono text-slate-800 flex-1">addies@upi</p>
                  <button onClick={copyUPI}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors">
                    {upiCopied ? <><CheckCheck size={11}/> Copied!</> : <><Copy size={11}/> Copy</>}
                  </button>
                </div>
              </div>

              {/* Countdown ring */}
              <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="17" fill="none" stroke="#dbeafe" strokeWidth="3.5" />
                    <circle cx="20" cy="20" r="17" fill="none" stroke="#6d28d9" strokeWidth="3.5"
                      strokeDasharray={`${(countdown / 45) * 107} 107`} strokeLinecap="round"
                      style={{ transition:"stroke-dasharray 1s linear" }} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-violet-700">{countdown}s</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800">Waiting for payment…</p>
                  <p className="text-xs text-blue-500 mt-0.5">Demo: auto-confirms in {countdown}s</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield size={11} className="text-emerald-500 flex-shrink-0" />
                256-bit SSL secured · UPI payments are instant & safe
              </div>

              {/* Manual confirm */}
              <button onClick={confirmManually}
                className="w-full py-2.5 border-2 border-violet-300 text-violet-600 rounded-xl text-xs font-bold hover:bg-violet-50 transition-colors flex items-center justify-center gap-2">
                <CheckCheck size={13} /> I've paid — Confirm manually
              </button>
            </div>
          )}

          {/* ── Step 4: Processing ── */}
          {step === "processing" && (
            <div className="py-10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
                <RefreshCcw size={30} className="text-violet-600 animate-spin" />
              </div>
              <div>
                <p className="text-base font-black text-slate-800">Verifying Payment</p>
                <p className="text-sm text-slate-400 mt-1">Please wait a moment…</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay:`${i*0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 5: Success ── */}
          {step === "success" && (
            <div className="py-4 flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-100">
                  <CheckCircle2 size={42} className="text-emerald-500" />
                </div>
                <span className="absolute -top-1 -right-1 text-2xl animate-bounce">🎉</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">₹{numAmt} Added!</p>
                <p className="text-sm text-slate-400 mt-1">Wallet updated successfully</p>
              </div>

              {/* Balance breakdown */}
              <div className="w-full p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl text-left">
                <p className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Balance Updated</p>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">Previous balance</span>
                  <span className="font-bold text-slate-700">₹{currentBalance}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-emerald-600 font-semibold">+ Added now</span>
                  <span className="font-bold text-emerald-600">₹{numAmt}</span>
                </div>
                <div className="h-px bg-violet-200 mb-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-violet-700">New Balance</span>
                  <span className="text-2xl font-black text-violet-700">₹{currentBalance + numAmt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold">
                <Zap size={12} className="text-amber-500" />
                +{Math.floor(numAmt/20)} loyalty points earned! 🏆
              </div>
              <button onClick={handleDone}
                className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-sm
                           hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
                Done 🎊
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Detailed Transaction Row (expandable) ─────────────────────────────────────
function TransactionRow({ tx, copied, onCopy }: {
  tx: TxnItem; copied: string | null; onCopy: (s: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CAT_STYLE[tx.category] ?? { bg:"bg-slate-100", text:"text-slate-700" };

  return (
    <div className={`border-b border-slate-50 last:border-0 transition-colors ${expanded ? "bg-slate-50/60" : "hover:bg-slate-50/40"}`}>

      {/* Main Row */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left">

        <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
          {tx.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{tx.label}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-slate-400">{tx.date} · {tx.time}</span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>
              {tx.category}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{tx.txnId}</p>
        </div>

        <div className="text-right flex-shrink-0 mr-1">
          <p className={`text-base font-black ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
            {tx.type === "credit" ? "+" : "−"}₹{Math.abs(tx.amount)}
          </p>
          <p className="text-xs text-slate-400">Bal ₹{tx.balance}</p>
        </div>

        <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="px-5 pb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">

            {/* Transaction ID */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Transaction ID</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono font-semibold text-slate-800">{tx.txnId}</p>
                <button onClick={() => onCopy(tx.txnId)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-semibold text-slate-600">
                  {copied === tx.txnId ? <><CheckCircle2 size={10} className="text-emerald-500" /> Copied</> : <><Copy size={10} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Date & Time</p>
              <p className="text-xs font-semibold text-slate-800">{tx.date} at {tx.time}</p>
            </div>

            {/* Booking ID */}
            {tx.bookingId && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Booking ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono font-semibold text-slate-800">{tx.bookingId}</p>
                  <button onClick={() => onCopy(tx.bookingId!)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-semibold text-slate-600">
                    {copied === tx.bookingId ? <><CheckCircle2 size={10} className="text-emerald-500" /> Copied</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
              </div>
            )}

            {/* Vendor */}
            {tx.vendor && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Vendor / Service</p>
                <p className="text-xs font-semibold text-slate-800">{tx.vendor}</p>
              </div>
            )}

            {/* Type */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Transaction Type</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
                ${tx.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                {tx.type === "credit" ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                {tx.type === "credit" ? "Credit" : "Debit"}
              </span>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Status</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={10} /> Completed
              </span>
            </div>

            {/* Note */}
            {tx.note && (
              <div className="col-span-full">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Note</p>
                <p className="text-xs text-slate-600">{tx.note}</p>
              </div>
            )}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors">
            <ReceiptText size={12} /> Download Receipt
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main WalletPage ───────────────────────────────────────────────────────────
export default function WalletPage() {
  const { user } = useAuthStore();

  // Live state — updates when money is added
  const [liveBalance,  setLiveBalance]  = useState<number>(user?.walletBalance ?? 250);
  const [transactions, setTransactions] = useState<TxnItem[]>(BASE_TRANSACTIONS);

  const [copied,     setCopied]     = useState<string|null>(null);
  const [tab,        setTab]        = useState<"txn"|"offers">("txn");
  const [addFund,    setAddFund]    = useState(false);
  const [amount,     setAmount]     = useState("");
  const [catFilter,  setCatFilter]  = useState("All");
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<"all"|"credit"|"debit">("all");

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2500);
  }

  // Called when modal payment succeeds: update balance + prepend new transaction
  function handleAddSuccess(addedAmount: number, newTxn: TxnItem) {
    setLiveBalance(prev => prev + addedAmount);
    setTransactions(prev => [newTxn, ...prev]);
    setAddFund(false);
  }

  const filteredTxns = transactions.filter(tx => {
    const matchCat    = catFilter === "All" || tx.category === catFilter;
    const matchType   = typeFilter === "all" || tx.type === typeFilter;
    const matchSearch = !search
      || tx.label.toLowerCase().includes(search.toLowerCase())
      || tx.txnId.toLowerCase().includes(search.toLowerCase())
      || (tx.bookingId?.toLowerCase().includes(search.toLowerCase()) ?? false)
      || (tx.vendor?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchCat && matchType && matchSearch;
  });

  const totalCredit = transactions.filter(t => t.type === "credit").reduce((s,t) => s + t.amount, 0);
  const totalDebit  = transactions.filter(t => t.type === "debit").reduce((s,t) => s + Math.abs(t.amount), 0);

  return (
    <div className="mx-auto space-y-6">

      {/* ── Wallet Balance Card ── */}
      <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white overflow-hidden shadow-xl shadow-violet-200">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-32 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-violet-200 text-sm font-bold mb-1">ADDies Wallet</p>
              {/* Live balance — updates instantly after add money */}
              <p className="text-5xl text-violet-100 font-bold transition-all duration-500">₹{liveBalance}</p>
              <p className="text-violet-200 font-bold text-sm mt-1">Available Balance</p>
            </div>
            <div className="bg-white/15 rounded-xl p-2.5 border border-white/20">
              <Wallet size={22} className="text-white" />
            </div>
          </div>

          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/10">
              <ArrowDownLeft size={14} className="text-emerald-300" />
              <div>
                <p className="text-xs text-violet-100 font-bold">Total Earned</p>
                <p className="text-sm text-violet-100 font-bold">₹{totalCredit}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/10">
              <ArrowUpRight size={14} className="text-red-300" />
              <div>
                <p className="text-xs text-violet-200 font-bold">Total Used</p>
                <p className="text-sm text-violet-100 font-bold">₹{totalDebit}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/10">
              <Clock size={14} className="text-amber-300" />
              <div>
                <p className="text-xs text-violet-200 font-bold">Pending</p>
                <p className="text-sm text-violet-100 font-bold">₹50</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/10">
              <Tag size={14} className="text-cyan-300" />
              <div>
                <p className="text-xs text-violet-200 font-bold">Transactions</p>
                <p className="text-sm text-violet-100 font-bold">{transactions.length} total</p>
              </div>
            </div>
          </div>

          <button onClick={() => setAddFund(true)}
            className="mt-5 px-5 py-2.5 bg-white text-violet-700 rounded-xl text-sm font-bold
                       hover:bg-violet-50 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2">
            <Zap size={15} /> Add Money
          </button>
        </div>
      </div>

      {/* ── Loyalty Progress ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-500" />
            <p className="text-sm font-bold text-slate-800">Loyalty Tier — Silver 🥈</p>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">250 pts</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all" style={{ width:"50%" }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>🥈 Silver (0 pts)</span>
          <span className="text-amber-600 font-bold">250 / 500 pts</span>
          <span>🥇 Gold (500 pts)</span>
        </div>
        {/* Tier Benefits */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { tier:"Bronze", pts:"0-99",   benefit:"3% cashback", done:true  },
            { tier:"Silver", pts:"100-499",benefit:"5% cashback", done:true  },
            { tier:"Gold",   pts:"500+",   benefit:"8% cashback", done:false },
          ].map(t => (
            <div key={t.tier}
              className={`text-center p-2.5 rounded-xl border transition-all
                ${t.done ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100 opacity-50"}`}>
              <p className={`text-xs font-black ${t.done ? "text-amber-700" : "text-slate-500"}`}>{t.tier}</p>
              <p className="text-xs text-slate-400">{t.pts} pts</p>
              <p className={`text-xs font-semibold mt-0.5 ${t.done ? "text-amber-600" : "text-slate-400"}`}>{t.benefit}</p>
              {t.done && <CheckCircle2 size={12} className="text-amber-500 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          <Zap size={11} className="text-amber-400 flex-shrink-0" />
          250 more points to unlock Gold — 2x cashback on every booking!
        </p>
      </div>

      {/* ── Tabs: Transactions | Coupons ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {[
            { key:"txn",    label:"Transactions",     count: transactions.length },
            { key:"offers", label:"Coupons & Offers", count: OFFERS.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as "txn"|"offers")}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors flex items-center justify-center gap-2
                ${tab === t.key ? "text-violet-700 border-b-2 border-violet-500 bg-violet-50/30" : "text-slate-500 hover:text-slate-700"}`}>
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                ${tab === t.key ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-500"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Transactions Tab ── */}
        {tab === "txn" && (
          <div>
            {/* Filters */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, TXN ID, booking ID..."
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50
                             focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={12} className="text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
              {/* Type + Category filters */}
              <div className="flex gap-2 flex-wrap items-center">
                <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
                  {(["all","credit","debit"] as const).map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize
                        ${typeFilter === t
                          ? t === "credit" ? "bg-emerald-500 text-white"
                          : t === "debit"  ? "bg-red-500 text-white"
                          : "bg-white text-slate-700 shadow-sm"
                          : "text-slate-500"}`}>
                      {t === "all" ? "All" : t === "credit" ? "↓ Credit" : "↑ Debit"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 overflow-x-auto flex-1">
                  {CATEGORY_FILTERS.map(cat => (
                    <button key={cat} onClick={() => setCatFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex-shrink-0
                        ${catFilter === cat ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-500 border-slate-200 hover:border-violet-300"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {/* Result count + Export */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-bold text-slate-700">{filteredTxns.length}</span> of {transactions.length} transactions
                </p>
                <button className="flex items-center gap-1 text-xs text-violet-600 font-semibold hover:text-violet-700">
                  <Download size={11} /> Export CSV
                </button>
              </div>
            </div>

            {/* Transaction Rows */}
            {filteredTxns.length === 0 ? (
              <div className="py-12 text-center">
                <Search size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-semibold">No transactions found</p>
                <p className="text-xs text-slate-400 mt-1">Try changing filters or search query.</p>
              </div>
            ) : (
              <div>
                {filteredTxns.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} copied={copied} onCopy={copyCode} />
                ))}
              </div>
            )}

            {/* Summary footer */}
            {filteredTxns.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-emerald-600 font-bold">
                    + ₹{filteredTxns.filter(t => t.type === "credit").reduce((s,t) => s + t.amount, 0)} credited
                  </span>
                  <span className="text-red-500 font-bold">
                    − ₹{filteredTxns.filter(t => t.type === "debit").reduce((s,t) => s + Math.abs(t.amount), 0)} debited
                  </span>
                </div>
                <p className="text-xs text-slate-400">Current balance: <span className="font-bold text-slate-700">₹{liveBalance}</span></p>
              </div>
            )}
          </div>
        )}

        {/* ── Offers Tab ── */}
        {tab === "offers" && (
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
              <Info size={13} className="flex-shrink-0 mt-0.5" />
              Apply coupon code at checkout in the Payment step to avail discount.
            </div>

            {OFFERS.map(o => (
              <div key={o.code} className={`p-4 rounded-2xl border-2 border-dashed ${o.border} ${o.bg}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{o.icon}</span>
                    <div>
                      <p className={`text-base font-black font-mono ${o.text}`}>{o.code}</p>
                      <p className={`text-xs ${o.text} opacity-80 font-semibold`}>{o.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => copyCode(o.code)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${o.border} bg-white text-xs font-bold ${o.text}
                               hover:opacity-80 transition-all flex-shrink-0 shadow-sm`}>
                    {copied === o.code ? <><CheckCircle2 size={12} /> Copied!</> : <><Copy size={12} /> Copy Code</>}
                  </button>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-white/60 ${o.text}`}>
                    <Clock size={10} /> Expires {o.expiry}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg bg-white/60 ${o.text}`}>
                    Min order ₹{o.minOrder}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg bg-white/60 ${o.text}`}>
                    {o.type === "percent" ? `${o.value}% off` : `₹${o.value} off`}
                  </span>
                </div>
              </div>
            ))}

            {/* Referral Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-dashed border-rose-300">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-2xl">🎁</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-rose-800">Refer & Earn ₹100</p>
                <p className="text-xs text-rose-600 mt-0.5">Each friend you invite earns you ₹100 wallet credit</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs font-mono font-black text-rose-700 bg-rose-100 px-2 py-1 rounded-lg border border-rose-200">
                    REF-{user?.registrationId?.slice(-6) ?? "001234"}
                  </p>
                  <button onClick={() => copyCode(`REF-${user?.registrationId?.slice(-6) ?? "001234"}`)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors">
                    {copied === `REF-${user?.registrationId?.slice(-6) ?? "001234"}` ? "Copied!" : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Friends Invited", value:"2",    icon:"👥", color:"text-violet-600", bg:"bg-violet-50" },
                { label:"Bonus Earned",    value:"₹200", icon:"💰", color:"text-emerald-600",bg:"bg-emerald-50" },
                { label:"Friends Joined",  value:"2/2",  icon:"✅", color:"text-blue-600",   bg:"bg-blue-50" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-slate-100`}>
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 font-medium leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Add Money Modal ── */}
      {addFund && (
        <AddMoneyModal
          currentBalance={liveBalance}
          onClose={() => setAddFund(false)}
          onSuccess={handleAddSuccess}
        />
      )}

    </div>
  );
}
