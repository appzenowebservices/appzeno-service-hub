/**
 * VendorWalletPage.tsx
 * Location: src/pages/vendor/VendorWalletPage.tsx
 */

import { useState, useMemo } from "react";
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2,
  AlertCircle, X, IndianRupee, Copy, QrCode, Shield,
  TrendingUp, Banknote, RefreshCw, Filter, Search,
  ChevronDown, ChevronUp, Send, Plus, Minus, Info,
  CreditCard, Smartphone, Ban, ArrowRight, Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TxType   = "credit" | "debit" | "hold" | "refund" | "withdrawal";
type TxStatus = "completed" | "pending" | "failed";

interface WalletTx {
  id:          string;
  type:        TxType;
  title:       string;
  subtitle:    string;
  amount:      number;
  status:      TxStatus;
  date:        string;
  time:        string;
  ref:         string;
  bookingId?:  string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const BALANCE          = 4820;
const PENDING_AMOUNT   = 1049;
const HELD_AMOUNT      = 250;
const TOTAL_WITHDRAWN  = 12400;

const MOCK_TXS: WalletTx[] = [
  { id:"W001", type:"credit",     title:"Geyser Repair",          subtitle:"Booking BK-2602-0009",  amount:311, status:"completed", date:"22 Feb 2026", time:"4:40 PM",  ref:"UPI23022603", bookingId:"BK-2602-0009" },
  { id:"W002", type:"credit",     title:"Pipe Leak Fix",          subtitle:"Booking BK-2602-0047",  amount:369, status:"completed", date:"25 Feb 2026", time:"3:45 PM",  ref:"UPI26022601", bookingId:"BK-2602-0047" },
  { id:"W003", type:"credit",     title:"Sofa Deep Clean",        subtitle:"Booking BK-2501-0062",  amount:849, status:"completed", date:"15 Feb 2026", time:"3:25 PM",  ref:"UPI16022605", bookingId:"BK-2501-0062" },
  { id:"W004", type:"withdrawal", title:"Withdrawal to UPI",      subtitle:"9250138532@icici",       amount:2000,status:"completed", date:"20 Feb 2026", time:"10:15 AM", ref:"WD20022601" },
  { id:"W005", type:"pending",    title:"AC Annual Service",      subtitle:"Booking BK-2602-0018",  amount:639, status:"pending",   date:"23 Feb 2026", time:"1:15 PM",  ref:"PEND-001",   bookingId:"BK-2602-0018" },
  { id:"W006", type:"hold",       title:"Ceiling Fan — Dispute",  subtitle:"Booking BK-2501-0087",  amount:205, status:"pending",   date:"18 Feb 2026", time:"12:45 PM", ref:"HOLD-001",   bookingId:"BK-2501-0087" },
  { id:"W007", type:"credit",     title:"AC Gas Refill",          subtitle:"Booking BK-2501-0044",  amount:960, status:"completed", date:"12 Feb 2026", time:"2:05 PM",  ref:"UPI13022606", bookingId:"BK-2501-0044" },
  { id:"W008", type:"withdrawal", title:"Withdrawal to UPI",      subtitle:"9250138532@icici",       amount:3000,status:"completed", date:"14 Feb 2026", time:"9:30 AM",  ref:"WD14022601" },
  { id:"W009", type:"refund",     title:"AC Gas Refill — Refund", subtitle:"Booking cancelled",      amount:0,  status:"completed", date:"12 Feb 2026", time:"3:00 PM",  ref:"REF-001" },
  { id:"W010", type:"pending",    title:"Bathroom Fitting",       subtitle:"Booking BK-2602-0003",  amount:410, status:"pending",   date:"20 Feb 2026", time:"6:25 PM",  ref:"PEND-002",   bookingId:"BK-2602-0003" },
];

// ─── Withdrawal Modal ─────────────────────────────────────────────────────────
function WithdrawModal({ balance, onClose }: { balance: number; onClose: () => void }) {
  const [amount,  setAmount]  = useState("");
  const [upi,     setUpi]     = useState("9250138532@icici");
  const [step,    setStep]    = useState<"form"|"confirm"|"processing"|"done">("form");
  const [err,     setErr]     = useState("");

  const amt     = parseFloat(amount) || 0;
  const gst     = Math.round(amt * 0.02); // 2% processing fee
  const netOut  = amt - gst;
  const canPay  = amt >= 100 && amt <= balance && upi.includes("@");

  function handleNext() {
    if (amt < 100)       { setErr("Minimum withdrawal ₹100 hai"); return; }
    if (amt > balance)   { setErr(`Balance ₹${balance} se zyada withdraw nahi kar sakte`); return; }
    if (!upi.includes("@")) { setErr("Valid UPI ID daalo"); return; }
    setErr(""); setStep("confirm");
  }
  function handleWithdraw() {
    setStep("processing");
    setTimeout(() => setStep("done"), 2500);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-800 to-slate-950 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Wallet Balance</p>
              <p className="text-3xl font-black text-white mt-0.5">₹{balance.toLocaleString("en-IN")}</p>
            </div>
            {step !== "processing" && (
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "form" && (<>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wide">Withdrawal Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input type="number" placeholder="Min ₹100" value={amount}
                  onChange={e => { setAmount(e.target.value); setErr(""); }}
                  className="w-full pl-7 pr-4 py-3 text-lg font-black border-2 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[500, 1000, 2000, balance].map(v => (
                  <button key={v} onClick={() => setAmount(String(v))}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                    {v === balance ? "All" : `₹${v}`}
                  </button>
                ))}
              </div>
              {err && <p className="text-xs text-red-500 font-medium">{err}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wide">UPI ID</label>
              <input type="text" value={upi} onChange={e => setUpi(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              <p className="text-xs text-slate-400">Yahi UPI pe payment aayegi</p>
            </div>

            {amt > 0 && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-100">
                {[
                  ["Withdrawal Amount", `₹${amt}`],
                  ["Processing Fee (2%)", `−₹${gst}`],
                  ["Net You Receive", `₹${netOut}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">{l}</span>
                    <span className="text-xs font-bold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleNext} disabled={!canPay}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm
                         hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all
                         flex items-center justify-center gap-2">
              Continue <ArrowRight size={15} />
            </button>
          </>)}

          {step === "confirm" && (<>
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-1">
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide">Confirm Withdrawal</p>
              <p className="text-4xl font-black text-emerald-700">₹{netOut}</p>
              <p className="text-xs text-emerald-600">to {upi}</p>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <Info size={13} className="flex-shrink-0 mt-0.5" />
              Processing fee ₹{gst} katega. Net ₹{netOut} 1-2 working days mein UPI pe aayega.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("form")} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600">Edit</button>
              <button onClick={handleWithdraw} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                <Send size={14} /> Confirm
              </button>
            </div>
          </>)}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
              <p className="font-bold text-slate-700">Processing withdrawal...</p>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-800">Withdrawal Initiated! 🎉</p>
                <p className="text-sm text-slate-500 mt-1">₹{netOut} — 1-2 working days mein milega</p>
              </div>
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TX Type Config ───────────────────────────────────────────────────────────
const TC: Record<TxType, { icon: React.ElementType; color: string; bg: string; sign: string; label: string }> = {
  credit:     { icon: ArrowDownLeft, color: "text-green-600",  bg: "bg-green-100",  sign: "+", label: "Credited"    },
  debit:      { icon: ArrowUpRight,  color: "text-red-500",    bg: "bg-red-100",    sign: "−", label: "Debited"     },
  hold:       { icon: Lock,          color: "text-amber-600",  bg: "bg-amber-100",  sign: "~", label: "On Hold"     },
  refund:     { icon: RefreshCw,     color: "text-slate-500",  bg: "bg-slate-100",  sign: "↩", label: "Refund"      },
  withdrawal: { icon: Send,          color: "text-violet-600", bg: "bg-violet-100", sign: "−", label: "Withdrawal"  },
  pending:    { icon: Clock,         color: "text-amber-500",  bg: "bg-amber-50",   sign: "~", label: "Pending"     },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorWalletPage() {
  const [showWithdraw, setShowWithdraw]  = useState(false);
  const [filter,       setFilter]        = useState<"all" | TxType>("all");
  const [search,       setSearch]        = useState("");
  const [showFilters,  setShowFilters]   = useState(false);
  const [balance,      setBalance]       = useState(BALANCE);

  const totalIn  = MOCK_TXS.filter(t => t.type === "credit" && t.status === "completed").reduce((s,t) => s+t.amount, 0);
  const totalOut = MOCK_TXS.filter(t => t.type === "withdrawal" && t.status === "completed").reduce((s,t) => s+t.amount, 0);

  const filtered = useMemo(() => {
    let list = [...MOCK_TXS];
    if (filter !== "all") list = list.filter(t => t.type === filter);
    if (search) list = list.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      t.ref.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [filter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Wallet size={22} className="text-emerald-500" /> Wallet
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Apni earnings track karo aur withdraw karo</p>
      </div>

      {/* Balance Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/10 -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-violet-500/10 translate-y-8 -translate-x-8" />
        <div className="relative z-10">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Available Balance</p>
          <p className="text-5xl font-black text-white mb-1">₹{balance.toLocaleString("en-IN")}</p>
          <p className="text-xs text-slate-400 mb-5">Instantly withdrawable</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="bg-white/10 rounded-2xl px-4 py-3 flex-1 min-w-[120px]">
              <p className="text-xs text-slate-400 mb-0.5">Pending Credit</p>
              <p className="text-xl font-black text-amber-300">₹{PENDING_AMOUNT.toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-500">Processing</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 flex-1 min-w-[120px]">
              <p className="text-xs text-slate-400 mb-0.5">On Hold</p>
              <p className="text-xl font-black text-red-300">₹{HELD_AMOUNT.toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-500">Dispute</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 flex-1 min-w-[120px]">
              <p className="text-xs text-slate-400 mb-0.5">Total Withdrawn</p>
              <p className="text-xl font-black text-emerald-300">₹{TOTAL_WITHDRAWN.toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-500">All time</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowWithdraw(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all">
              <ArrowUpRight size={16} /> Withdraw
            </button>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold">
              <Shield size={14} className="text-emerald-400" /> Razorpay Secured
            </div>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Total Credited",   value:`₹${totalIn.toLocaleString("en-IN")}`,           icon:ArrowDownLeft, c:"text-green-600",  bg:"bg-green-50",  b:"border-green-200"  },
          { label:"Total Withdrawn",  value:`₹${TOTAL_WITHDRAWN.toLocaleString("en-IN")}`,    icon:ArrowUpRight,  c:"text-violet-600", bg:"bg-violet-50", b:"border-violet-200" },
          { label:"Pending Credit",   value:`₹${PENDING_AMOUNT.toLocaleString("en-IN")}`,     icon:Clock,         c:"text-amber-600",  bg:"bg-amber-50",  b:"border-amber-200"  },
          { label:"On Hold (Dispute)",value:`₹${HELD_AMOUNT.toLocaleString("en-IN")}`,        icon:Lock,          c:"text-red-500",    bg:"bg-red-50",    b:"border-red-200"    },
        ].map(({ label, value, icon: Icon, c, bg, b }) => (
          <div key={label} className={`rounded-2xl border-2 ${b} ${bg} p-4`}>
            <Icon size={15} className={`${c} mb-2`} />
            <p className={`text-xl font-black ${c}`}>{value}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">Wallet kaise kaam karta hai?</p>
          Customer ADDies ko full amount deta hai. Platform commission + GST auto-deduct karke
          <strong> net earning</strong> aapke wallet mein credit karta hai.
          Minimum withdrawal ₹100 · Processing fee 2% · 1-2 working days.
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search transactions..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all
              ${showFilters ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
            <Filter size={13} /> Filter {showFilters ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
            {(["all","credit","withdrawal","pending","hold","refund"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all
                  ${filter === f ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                {f === "all" ? "All" : TC[f as TxType]?.label ?? f}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Transaction History</p>
            <p className="text-xs text-slate-400">{filtered.length} records</p>
          </div>
          <div className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Wallet size={32} className="mx-auto mb-3 text-slate-200" />
                <p className="font-bold">Koi transaction nahi mili</p>
              </div>
            ) : filtered.map(tx => {
              const cfg = TC[tx.type];
              const Icon = cfg.icon;
              const isCredit = tx.type === "credit";
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{tx.title}</p>
                    <p className="text-xs text-slate-400 truncate">{tx.subtitle} · {tx.date} {tx.time}</p>
                    {tx.status === "pending" && (
                      <span className="text-xs text-amber-600 font-semibold">Processing…</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {tx.amount > 0 ? (
                      <p className={`text-sm font-black ${isCredit ? "text-green-600" : tx.type === "withdrawal" ? "text-violet-600" : tx.type === "hold" || tx.type === "pending" ? "text-amber-600" : "text-slate-400"}`}>
                        {cfg.sign}₹{tx.amount}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 font-semibold">₹0</p>
                    )}
                    <p className="text-xs text-slate-400 font-mono">{tx.ref.slice(0, 12)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showWithdraw && <WithdrawModal balance={balance} onClose={() => setShowWithdraw(false)} />}
    </div>
  );
}
