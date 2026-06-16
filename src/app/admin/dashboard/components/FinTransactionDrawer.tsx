// src/pages/admin/dashboard/components/FinTransactionDrawer.tsx

import { X, Copy, CheckCircle2, MapPin, Tag, CreditCard, User, Store,
         Calendar, Clock, IndianRupee } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "../mockAdminData";

const TYPE_CFG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  booking:      { bg: "bg-sky-50",     text: "text-sky-700",    border: "border-sky-200",    label: "Booking"      },
  payout:       { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  label: "Payout"       },
  commission:   { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200", label: "Commission"   },
  refund:       { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200",    label: "Refund"       },
  subscription: { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200",label: "Subscription" },
  penalty:      { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200",   label: "Penalty"      },
};

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Completed" },
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Pending"   },
  failed:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400",     label: "Failed"    },
  refunded:  { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400",   label: "Refunded"  },
};

const MODE_LABELS: Record<string, string> = {
  upi: "UPI", card: "Card", netbanking: "Net Banking", wallet: "Wallet", cash: "Cash",
};

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN")}`;
}

function Row({ icon: Icon, label, value, mono = false }: {
  icon: React.ElementType; label: string; value: string; mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className={`text-sm font-bold text-slate-700 ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

interface Props {
  txn:     Transaction;
  onClose: () => void;
}

export default function FinTransactionDrawer({ txn: t, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const type   = TYPE_CFG[t.type]   ?? TYPE_CFG.booking;
  const status = STATUS_CFG[t.status] ?? STATUS_CFG.completed;

  function copyTxnId() {
    navigator.clipboard.writeText(t.txnId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const feeRate = t.grossAmount > 0
    ? ((t.platformFee / t.grossAmount) * 100).toFixed(0)
    : "0";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50
        shadow-2xl flex flex-col overflow-hidden animate-slide-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-sm font-black text-slate-800">Transaction Detail</p>
            <p className="text-xs text-slate-400">Full breakdown & metadata</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Hero */}
        <div className="px-5 py-5 bg-gradient-to-br from-sky-50 to-slate-50 border-b border-slate-100 flex-shrink-0">
          {/* Type + Status badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${type.bg} ${type.text} ${type.border}`}>
              {type.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          {/* Amount hero */}
          <p className="text-3xl font-black text-slate-800 mb-1">{fmt(t.grossAmount)}</p>
          <p className="text-sm text-slate-500 mb-3">{t.description}</p>

          {/* TxnID copy */}
          <button onClick={copyTxnId}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl
              px-3 py-2 text-xs font-mono text-slate-600 hover:border-sky-400 hover:text-sky-700 transition-all">
            {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
            {t.txnId}
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Party info */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Parties</p>
            <Row icon={Store}    label="Vendor"   value={t.vendor   !== "—" ? t.vendor   : "Platform"} />
            <Row icon={User}     label="Customer" value={t.customer !== "—" ? t.customer : "Platform"} />
            <Row icon={MapPin}   label="City"     value={t.city} />
            <Row icon={Tag}      label="Category" value={t.category !== "—" ? t.category : "General"} />
          </div>

          {/* Timing */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Timing</p>
            <Row icon={Calendar}   label="Date"         value={t.date} />
            <Row icon={Clock}      label="Time"         value={t.time} />
            <Row icon={CreditCard} label="Payment Mode" value={MODE_LABELS[t.paymentMode] ?? t.paymentMode} />
          </div>

          {/* Financial breakdown */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Financial Breakdown</p>

            {/* Gross */}
            <div className="flex items-center justify-between text-sm py-2.5 border-b border-slate-50">
              <span className="text-slate-500">Gross Amount</span>
              <span className="font-black text-slate-800">{fmt(t.grossAmount)}</span>
            </div>

            {/* Platform fee */}
            <div className="flex items-center justify-between text-sm py-2.5 border-b border-slate-50">
              <span className="text-slate-500">Platform Fee ({feeRate}%)</span>
              <span className="font-bold text-violet-700">- {fmt(t.platformFee)}</span>
            </div>

            {/* GST */}
            {t.gst > 0 && (
              <div className="flex items-center justify-between text-sm py-2.5 border-b border-slate-50">
                <span className="text-slate-500">GST (18%)</span>
                <span className="font-bold text-amber-700">+ {fmt(t.gst)}</span>
              </div>
            )}

            {/* Net amount */}
            <div className="flex items-center justify-between text-sm pt-3">
              <span className="font-black text-slate-800">Net to Vendor</span>
              <span className="font-black text-emerald-700 text-base">{fmt(t.netAmount)}</span>
            </div>
          </div>

          {/* Visual split bar */}
          {t.grossAmount > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Revenue Split</p>
              <div className="flex items-center h-4 rounded-full overflow-hidden gap-0.5">
                <div className="bg-emerald-400 rounded-l-full h-full transition-all"
                  style={{ width: `${Math.round((t.netAmount / t.grossAmount) * 100)}%` }} />
                <div className="bg-violet-400 h-full transition-all"
                  style={{ width: `${Math.round((t.platformFee / t.grossAmount) * 100)}%` }} />
                {t.gst > 0 && (
                  <div className="bg-amber-400 rounded-r-full h-full transition-all"
                    style={{ width: `${Math.round((t.gst / t.grossAmount) * 100)}%` }} />
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {[
                  { color: "bg-emerald-400", label: "Vendor", pct: Math.round((t.netAmount    / t.grossAmount) * 100) },
                  { color: "bg-violet-400",  label: "Platform",pct: Math.round((t.platformFee / t.grossAmount) * 100) },
                  ...(t.gst > 0 ? [{ color: "bg-amber-400", label: "GST", pct: Math.round((t.gst / t.grossAmount) * 100) }] : []),
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    {s.label} ({s.pct}%)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.25s cubic-bezier(0.22,1,0.36,1); }
      `}</style>
    </>
  );
}
