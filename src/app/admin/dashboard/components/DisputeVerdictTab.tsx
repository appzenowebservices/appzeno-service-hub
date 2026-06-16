// src/pages/admin/dashboard/components/DisputeVerdictTab.tsx

import { useState } from "react";
import {
  CheckCircle2, XCircle, Scale, Minus,
  Loader2, AlertTriangle, Lock,
} from "lucide-react";
import type { AdminDispute, DisputeVerdict } from "../mockAdminData";

interface Props {
  dispute:     AdminDispute;
  onResolve:   (id: string, verdict: NonNullable<DisputeVerdict>, refund: number, note: string) => void;
  onEscalate:  (id: string) => void;
}

const VERDICT_OPTIONS: {
  value:    NonNullable<DisputeVerdict>;
  label:    string;
  desc:     string;
  icon:     React.ElementType;
  color:    string;
  bg:       string;
  border:   string;
  ring:     string;
}[] = [
  {
    value: "favor_customer", label: "Favor Customer",
    desc:  "Full refund issued to customer",
    icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", ring: "ring-emerald-400",
  },
  {
    value: "favor_vendor", label: "Favor Vendor",
    desc:  "No refund — vendor not at fault",
    icon: XCircle, color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-300", ring: "ring-sky-400",
  },
  {
    value: "partial_refund", label: "Partial Refund",
    desc:  "Split the refund amount",
    icon: Scale, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", ring: "ring-amber-400",
  },
  {
    value: "no_action", label: "No Action",
    desc:  "Dispute closed without refund",
    icon: Minus, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-300", ring: "ring-slate-400",
  },
];

export default function DisputeVerdictTab({ dispute: d, onResolve, onEscalate }: Props) {
  const [verdict,      setVerdict]      = useState<NonNullable<DisputeVerdict> | "">(d.verdict ?? "");
  const [refundAmount, setRefundAmount] = useState(d.refundIssued > 0 ? d.refundIssued : d.refundRequested);
  const [note,         setNote]         = useState(d.verdictNote);
  const [loading,      setLoading]      = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

  const isResolved = d.status === "resolved";

  function submit() {
    if (!verdict) return;
    setLoading("resolve");
    setTimeout(() => {
      setLoading(null);
      setSuccess(true);
      onResolve(d.id, verdict, verdict === "favor_vendor" || verdict === "no_action" ? 0 : refundAmount, note);
      setTimeout(() => setSuccess(false), 2000);
    }, 1200);
  }

  function escalate() {
    setLoading("escalate");
    setTimeout(() => {
      setLoading(null);
      onEscalate(d.id);
    }, 900);
  }

  // ── Already resolved — show read-only verdict ────────────────────────────
  if (isResolved && d.verdict) {
    const cfg = VERDICT_OPTIONS.find(o => o.value === d.verdict);
    const Icon = cfg?.icon ?? CheckCircle2;
    return (
      <div className="px-5 py-4 space-y-4">
        <div className={`rounded-2xl border-2 ${cfg?.border} ${cfg?.bg} p-4`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${cfg?.bg} border ${cfg?.border}
              flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={cfg?.color} />
            </div>
            <div>
              <p className={`text-sm font-black ${cfg?.color}`}>{cfg?.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">Final verdict</p>
            </div>
            <Lock size={13} className="text-slate-300 ml-auto" />
          </div>
          {d.refundIssued > 0 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 px-4 py-2.5 mb-3">
              <span className="text-xs font-bold text-slate-500">Refund Issued</span>
              <span className="text-base font-black text-emerald-600">₹{d.refundIssued.toLocaleString("en-IN")}</span>
            </div>
          )}
          {d.verdictNote && (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-3">
              <p className="text-xs font-bold text-slate-500 mb-1">Admin Note</p>
              <p className="text-xs text-slate-700 leading-relaxed">{d.verdictNote}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Active verdict form ───────────────────────────────────────────────────
  return (
    <div className="px-5 py-4 space-y-5">

      {/* Verdict options */}
      <div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Select Verdict</p>
        <div className="grid grid-cols-2 gap-2">
          {VERDICT_OPTIONS.map(opt => {
            const Icon     = opt.icon;
            const selected = verdict === opt.value;
            return (
              <button key={opt.value} onClick={() => setVerdict(opt.value)}
                className={`p-3 rounded-2xl border-2 text-left transition-all
                  ${selected
                    ? `${opt.bg} ${opt.border} ring-2 ${opt.ring} ring-offset-1`
                    : "bg-white border-slate-200 hover:border-slate-300"}`}>
                <Icon size={16} className={selected ? opt.color : "text-slate-400"} />
                <p className={`text-xs font-black mt-1.5 ${selected ? opt.color : "text-slate-700"}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Refund amount — only for customer / partial */}
      {(verdict === "favor_customer" || verdict === "partial_refund") && (
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Refund Amount</p>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
              <input
                type="number"
                value={refundAmount}
                onChange={e => setRefundAmount(Number(e.target.value))}
                min={0} max={d.jobAmount}
                className="w-full pl-8 pr-4 py-2.5 text-sm font-bold border border-slate-200 rounded-xl
                  focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-400">Requested</p>
              <p className="text-sm font-black text-red-500">₹{d.refundRequested.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin note */}
      <div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Admin Note</p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="Explain your verdict for record keeping…"
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl resize-none
            focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100
            transition-all placeholder:text-slate-300"
        />
      </div>

      {/* Success */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <p className="text-xs font-bold text-emerald-700">Dispute resolved successfully!</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={submit}
          disabled={!verdict || !!loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
            bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-sky-200">
          {loading === "resolve"
            ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
            : <><Scale size={15} /> Submit Verdict</>}
        </button>

        {d.status !== "escalated" && (
          <button
            onClick={escalate}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl
              border border-violet-200 bg-violet-50 text-violet-700
              text-sm font-bold hover:bg-violet-100 transition-colors disabled:opacity-40">
            {loading === "escalate"
              ? <><Loader2 size={15} className="animate-spin" /> Escalating…</>
              : <><AlertTriangle size={14} /> Escalate to Senior Admin</>}
          </button>
        )}
      </div>
    </div>
  );
}
