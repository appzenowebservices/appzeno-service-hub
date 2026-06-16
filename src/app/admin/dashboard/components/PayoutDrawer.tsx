// src/pages/admin/dashboard/components/PayoutDrawer.tsx

import { useState } from "react";
import {
  X, MapPin, Briefcase, Calendar, Smartphone, Copy,
  CheckCheck, CheckCircle2, ShieldCheck, PauseCircle,
  Loader2, AlertTriangle,
} from "lucide-react";
import type { PendingPayout } from "../mockAdminData";
import PayoutStatusBadge, { PAYOUT_STATUS_CFG } from "./PayoutStatusBadge";
import type { PayoutStatus } from "./PayoutStatusBadge";

interface Props {
  payout:     PendingPayout;
  onClose:    () => void;
  onApprove:  (id: string) => void;
  onRelease:  (id: string) => void;
  onHold:     (id: string) => void;
}

function fmt(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const CAT_COLOR: Record<string, string> = {
  "Cleaning":       "bg-sky-500",
  "AC Service":     "bg-cyan-500",
  "Plumbing":       "bg-blue-500",
  "Painting":       "bg-violet-500",
  "Pest Control":   "bg-green-500",
  "Electrical":     "bg-amber-500",
  "Carpentry":      "bg-orange-500",
  "Appliance Repair":"bg-rose-500",
};

// Timeline steps per status
const STATUS_STEPS: Record<PayoutStatus, number> = {
  pending:  1,
  approved: 2,
  on_hold:  1, // special case
  released: 3,
};

const TIMELINE = [
  { label: "Requested",  desc: "Vendor submitted payout request" },
  { label: "Approved",   desc: "Admin reviewed and approved"     },
  { label: "Released",   desc: "Amount transferred to vendor UPI" },
];

export default function PayoutDrawer({ payout: p, onClose, onApprove, onRelease, onHold }: Props) {
  const [loading,     setLoading]     = useState<string | null>(null);
  const [success,     setSuccess]     = useState<string | null>(null);
  const [copiedUpi,   setCopiedUpi]   = useState(false);
  const [showConfirm, setShowConfirm] = useState<"approve" | "release" | "hold" | null>(null);

  const avatarColor = CAT_COLOR[p.category] ?? "bg-slate-500";
  const currentStep = STATUS_STEPS[p.status];
  const isOnHold    = p.status === "on_hold";

  function copyUpi() {
    navigator.clipboard.writeText(p.upiId).catch(() => {});
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 1800);
  }

  function doAction(type: "approve" | "release" | "hold") {
    setLoading(type);
    setShowConfirm(null);
    setTimeout(() => {
      setLoading(null);
      setSuccess(type);
      if (type === "approve") onApprove(p.id);
      if (type === "release") onRelease(p.id);
      if (type === "hold")    onHold(p.id);
      setTimeout(() => setSuccess(null), 2000);
    }, 1200);
  }

  // ── Platform fee breakdown (20% fee assumption) ──────────────────────────
  const platformFeeRate = 0.20;
  const grossAmount     = Math.round(p.amount / (1 - platformFeeRate));
  const platformFee     = grossAmount - p.amount;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50
        shadow-2xl flex flex-col overflow-hidden animate-slide-in">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-sm font-black text-slate-800">Payout Details</p>
            <p className="text-xs text-slate-400">Review & process vendor payment</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Vendor hero ─────────────────────────────────────────────── */}
        <div className="px-5 py-5 bg-gradient-to-br from-sky-50 to-slate-50 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl ${avatarColor}
              flex items-center justify-center text-white font-black text-2xl flex-shrink-0`}>
              {p.vendorName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-slate-800 truncate">{p.vendorName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{p.vendorId} · {p.category}</p>
              <div className="mt-2">
                <PayoutStatusBadge status={p.status} pulse />
              </div>
            </div>
          </div>

          {/* Amount breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">Gross Job Value</span>
              <span className="text-sm font-black text-slate-800">₹{grossAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">Platform Fee (20%)</span>
              <span className="text-sm font-black text-red-500">− ₹{platformFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-px bg-slate-100 mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-700">Vendor Payout</span>
              <span className="text-2xl font-black text-emerald-600">₹{p.amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* ── Scrollable content ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Payment Timeline</p>
            <div className="space-y-3">
              {TIMELINE.map((step, i) => {
                const stepNum = i + 1;
                const done    = !isOnHold && currentStep >= stepNum;
                const current = !isOnHold && currentStep === stepNum;
                return (
                  <div key={step.label} className="flex items-start gap-3">
                    {/* Circle */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black
                      ${done
                        ? "bg-emerald-500 text-white"
                        : current
                          ? "bg-sky-500 text-white ring-4 ring-sky-100"
                          : "bg-slate-100 text-slate-400"}`}>
                      {done && !current ? "✓" : stepNum}
                    </div>
                    {/* Connector */}
                    {i < TIMELINE.length - 1 && (
                      <div className={`absolute mt-8 ml-3 w-0.5 h-3
                        ${done ? "bg-emerald-300" : "bg-slate-100"}`}
                        style={{ position: "absolute", marginLeft: "calc(1.25rem - 1px)", marginTop: "2rem" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${done ? "text-slate-800" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}

              {/* On hold special indicator */}
              {isOnHold && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mt-2">
                  <PauseCircle size={14} className="text-orange-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-orange-700">Payout is currently on hold pending review</p>
                </div>
              )}
            </div>
          </div>

          {/* Job & payment details */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Details</p>

            {[
              { icon: Briefcase, label: "Jobs Completed", value: `${p.jobs} jobs` },
              { icon: Calendar,  label: "Settlement Period", value: p.period },
              { icon: MapPin,    label: "City", value: p.city },
              { icon: Calendar,  label: "Requested On", value: p.requestedAt },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100
                  flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-slate-700">{value}</p>
                </div>
              </div>
            ))}

            {/* UPI with copy */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100
                flex items-center justify-center flex-shrink-0">
                <Smartphone size={13} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">UPI ID</p>
                <button onClick={copyUpi}
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors">
                  <span className="font-mono">{p.upiId}</span>
                  {copiedUpi
                    ? <CheckCheck size={13} className="text-emerald-500" />
                    : <Copy size={12} className="text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Success state */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-emerald-700">
                  {success === "approve" ? "Payout Approved!" :
                   success === "release" ? "Payment Released!" : "Put On Hold"}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">Status has been updated successfully.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-2 flex-shrink-0">

          {showConfirm ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-amber-600" />
                <p className="text-xs font-bold text-amber-700">
                  {showConfirm === "approve" ? "Approve this payout?" :
                   showConfirm === "release" ? "Release ₹" + p.amount.toLocaleString("en-IN") + " now?" :
                   "Put this payout on hold?"}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={() => doAction(showConfirm)}
                  disabled={!!loading}
                  className="flex-1 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 size={13} className="animate-spin" /> Processing…</>
                    : "Confirm"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {p.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => setShowConfirm("approve")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                      bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-200">
                    <ShieldCheck size={15} /> Approve Payout
                  </button>
                  <button onClick={() => setShowConfirm("hold")}
                    className="px-4 py-3 rounded-2xl border border-orange-200 bg-orange-50
                      text-orange-700 text-sm font-bold hover:bg-orange-100 transition-colors">
                    Hold
                  </button>
                </div>
              )}

              {p.status === "approved" && (
                <button onClick={() => setShowConfirm("release")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                    bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200">
                  <CheckCircle2 size={15} /> Release Payment
                </button>
              )}

              {p.status === "on_hold" && (
                <div className="flex gap-2">
                  <button onClick={() => setShowConfirm("approve")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                      bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 transition-colors">
                    <ShieldCheck size={15} /> Approve Now
                  </button>
                  <button onClick={onClose}
                    className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50
                      text-slate-600 text-sm font-bold hover:bg-slate-100 transition-colors">
                    Close
                  </button>
                </div>
              )}

              {p.status === "released" && (
                <div className="flex items-center justify-center gap-2 py-3 rounded-2xl
                  bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  Payment Already Released
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </>
  );
}
