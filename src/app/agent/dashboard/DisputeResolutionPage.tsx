// src/pages/agent/dashboard/DisputeResolutionPage.tsx

import { useState, useMemo } from "react";
import {
  Scale, Search, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, X, Phone, Star, IndianRupee, Send,
  MessageSquare, Filter, ArrowUpRight, ShieldAlert,
  UserCheck, Ban, RefreshCw, Gavel, FileText,
  TrendingUp, XCircle, Info, ChevronDown, ChevronUp,
} from "lucide-react";
import { MOCK_DISPUTES, type DisputeItem, type DisputeStatus, type DisputeCategory, type DisputeVerdict } from "./mockAgentData";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DisputeStatus, {
  label: string; bg: string; text: string; border: string; dot: string;
}> = {
  open:         { label: "Open",         bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"  },
  under_review: { label: "Under Review", bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400"   },
  resolved:     { label: "Resolved",     bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400"},
  escalated:    { label: "Escalated",    bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400"    },
  closed:       { label: "Closed",       bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400"  },
};

const CATEGORY_CONFIG: Record<DisputeCategory, { label: string; icon: string }> = {
  incomplete_work: { label: "Incomplete Work",  icon: "🔧" },
  overcharging:    { label: "Overcharging",      icon: "💸" },
  no_show:         { label: "No Show",           icon: "🚫" },
  damage:          { label: "Property Damage",   icon: "💥" },
  behaviour:       { label: "Bad Behaviour",     icon: "😡" },
  refund:          { label: "Refund Request",    icon: "💰" },
  other:           { label: "Other",             icon: "❓" },
};

const PRIORITY_CONFIG = {
  high:   { bg: "bg-red-100",    text: "text-red-700",    label: "High"   },
  medium: { bg: "bg-amber-100",  text: "text-amber-700",  label: "Medium" },
  low:    { bg: "bg-slate-100",  text: "text-slate-600",  label: "Low"    },
};

const VERDICT_OPTIONS: { key: DisputeVerdict; label: string; desc: string; color: string }[] = [
  { key: "favour_customer", label: "In Favour of Customer", desc: "Issue refund, penalise vendor",   color: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  { key: "favour_vendor",   label: "In Favour of Vendor",   desc: "Dismiss claim, inform customer",  color: "border-blue-300 bg-blue-50 text-blue-800" },
  { key: "partial_refund",  label: "Partial Refund",        desc: "Split refund between parties",     color: "border-violet-300 bg-violet-50 text-violet-800" },
  { key: "no_action",       label: "No Action",             desc: "Mark as resolved without verdict", color: "border-slate-300 bg-slate-50 text-slate-700" },
];

const STATUS_TABS: { key: DisputeStatus | "all"; label: string }[] = [
  { key: "all",          label: "All"          },
  { key: "open",         label: "Open"         },
  { key: "under_review", label: "Under Review" },
  { key: "escalated",    label: "Escalated"    },
  { key: "resolved",     label: "Resolved"     },
  { key: "closed",       label: "Closed"       },
];

// ─── Dispute Card ─────────────────────────────────────────────────────────────
function DisputeCard({ dispute, onClick }: { dispute: DisputeItem; onClick: () => void }) {
  const st  = STATUS_CONFIG[dispute.status];
  const cat = CATEGORY_CONFIG[dispute.category];
  const pri = PRIORITY_CONFIG[dispute.priority];

  return (
    <div onClick={onClick}
      className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all cursor-pointer
        ${dispute.priority === "high" && dispute.status === "open" ? "border-red-200" :
          dispute.status === "escalated" ? "border-red-300" : "border-slate-100"}`}>

      {dispute.status === "escalated" && (
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-2xl" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl flex-shrink-0">{cat.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{cat.label}</p>
              <p className="text-xs text-slate-400">{dispute.bookingId} · {dispute.service}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
            </span>
            <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${pri.bg} ${pri.text}`}>
              {pri.label} Priority
            </span>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-2 bg-blue-50 rounded-xl">
            <UserCheck size={12} className="text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-2xs text-blue-400">Customer</p>
              <p className="text-xs font-bold text-blue-800 truncate">{dispute.customer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-2 bg-emerald-50 rounded-xl">
            <ShieldAlert size={12} className="text-emerald-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-2xs text-emerald-400">Vendor</p>
              <p className="text-xs font-bold text-emerald-800 truncate">{dispute.vendor.name}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
          {dispute.description}
        </p>

        {/* Amount + verdict */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <IndianRupee size={11} /> Job: <strong className="text-slate-800">₹{dispute.jobAmount.toLocaleString("en-IN")}</strong>
            </span>
            {dispute.refundAmount > 0 && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                Refund: ₹{dispute.refundAmount.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <span className="text-2xs text-slate-300">{dispute.updatedAt}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ steps }: { steps: DisputeItem["timeline"] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-slate-100" />
      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="relative flex items-start gap-3">
            <div className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${s.done ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}>
              {s.done && <CheckCircle2 size={10} className="text-white" />}
            </div>
            <div className="min-w-0 pt-0.5">
              <p className={`text-xs font-bold ${s.done ? "text-slate-800" : "text-slate-400"}`}>{s.label}</p>
              <p className="text-2xs text-slate-400 mt-0.5">{s.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dispute Detail Drawer ────────────────────────────────────────────────────
function DisputeDrawer({
  dispute,
  onClose,
  onUpdateStatus,
  onGiveVerdict,
  onEscalate,
}: {
  dispute:        DisputeItem;
  onClose:        () => void;
  onUpdateStatus: (id: string, status: DisputeStatus) => void;
  onGiveVerdict:  (id: string, verdict: DisputeVerdict, refund: number, note: string) => void;
  onEscalate:     (id: string) => void;
}) {
  const [tab,           setTab]          = useState<"chat" | "details" | "verdict">("chat");
  const [message,       setMessage]      = useState("");
  const [messages,      setMessages]     = useState(dispute.messages);
  const [selectedVerdict, setVerdict]    = useState<DisputeVerdict>(null);
  const [refundAmt,     setRefundAmt]    = useState(dispute.refundAmount.toString());
  const [verdictNote,   setVerdictNote]  = useState(dispute.verdictNote || "");
  const [submitting,    setSubmitting]   = useState(false);
  const [showTimeline,  setShowTimeline] = useState(false);

  const st  = STATUS_CONFIG[dispute.status];
  const cat = CATEGORY_CONFIG[dispute.category];

  function sendMessage() {
    if (!message.trim()) return;
    const newMsg = {
      id: `M${messages.length + 1}`,
      sender: "agent" as const,
      name: "You",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      text: message.trim(),
    };
    setMessages(p => [...p, newMsg]);
    setMessage("");
    if (dispute.status === "open") onUpdateStatus(dispute.id, "under_review");
  }

  function submitVerdict() {
    if (!selectedVerdict) return;
    setSubmitting(true);
    setTimeout(() => {
      onGiveVerdict(dispute.id, selectedVerdict, Number(refundAmt) || 0, verdictNote);
      setSubmitting(false);
    }, 900);
  }

  const SENDER_STYLE: Record<string, string> = {
    customer: "bg-blue-50 border-blue-100 text-blue-800",
    vendor:   "bg-emerald-50 border-emerald-100 text-emerald-800",
    agent:    "bg-violet-600 text-white ml-auto",
    system:   "bg-slate-100 border-slate-200 text-slate-500 text-center w-full",
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">{cat.icon}</span>
            <div className="min-w-0">
              <h3 className="font-black text-slate-800 text-sm truncate">{cat.label}</h3>
              <p className="text-xs text-slate-400">{dispute.bookingId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
              {st.label}
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Parties quick row */}
        <div className="grid grid-cols-2 gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200">
            <div>
              <p className="text-2xs text-slate-400">Customer</p>
              <p className="text-xs font-bold text-slate-800 truncate">{dispute.customer.name}</p>
            </div>
            <a href={`tel:${dispute.customer.phone}`} className="p-1.5 bg-blue-50 rounded-lg">
              <Phone size={12} className="text-blue-600" />
            </a>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200">
            <div>
              <p className="text-2xs text-slate-400">Vendor</p>
              <p className="text-xs font-bold text-slate-800 truncate">{dispute.vendor.name}</p>
            </div>
            <a href={`tel:${dispute.vendor.phone}`} className="p-1.5 bg-emerald-50 rounded-lg">
              <Phone size={12} className="text-emerald-600" />
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 flex-shrink-0">
          {[
            { key: "chat",    label: `Chat (${messages.length})` },
            { key: "details", label: "Details" },
            { key: "verdict", label: "Give Verdict" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 py-3 text-xs font-bold transition-all
                ${tab === t.key
                  ? "text-violet-700 border-b-2 border-violet-600"
                  : "text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Chat Tab ── */}
          {tab === "chat" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id}
                    className={`max-w-[85%] rounded-2xl border px-3.5 py-2.5 text-xs
                      ${SENDER_STYLE[msg.sender]}
                      ${msg.sender === "agent" ? "ml-auto border-transparent" : ""}
                      ${msg.sender === "system" ? "max-w-full text-center border-0" : ""}`}>
                    {msg.sender !== "system" && msg.sender !== "agent" && (
                      <p className="font-black text-2xs mb-1 opacity-70">{msg.name}</p>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-2xs mt-1 ${msg.sender === "agent" ? "text-white/60 text-right" : "opacity-50"}`}>
                      {msg.time}
                    </p>
                  </div>
                ))}
              </div>
              {dispute.status !== "resolved" && dispute.status !== "closed" && (
                <div className="p-4 border-t border-slate-100 flex gap-2 flex-shrink-0">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type your message…"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-400 transition-all"
                  />
                  <button onClick={sendMessage}
                    className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center hover:bg-violet-700 transition-colors flex-shrink-0">
                    <Send size={15} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Details Tab ── */}
          {tab === "details" && (
            <div className="p-5 space-y-5">

              {/* Job info */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wide mb-3">Job Info</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Service",   value: dispute.service },
                    { label: "Date",      value: dispute.serviceDate },
                    { label: "Job Amount",value: `₹${dispute.jobAmount.toLocaleString("en-IN")}` },
                    { label: "Raised By", value: dispute.raisedBy === "customer" ? "Customer" : "Vendor" },
                    { label: "Raised At", value: dispute.raisedAt },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-2xs text-slate-400 mb-0.5">{label}</p>
                      <p className="text-xs font-bold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-black text-amber-600 uppercase tracking-wide mb-2">Complaint Description</p>
                <p className="text-xs text-amber-900 leading-relaxed">{dispute.description}</p>
              </div>

              {/* Agent note */}
              {dispute.agentNote && (
                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-violet-600 uppercase tracking-wide mb-2">Your Note</p>
                  <p className="text-xs text-violet-900 leading-relaxed">{dispute.agentNote}</p>
                </div>
              )}

              {/* Verdict (if resolved) */}
              {dispute.verdict && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-wide mb-2">Verdict Given</p>
                  <p className="text-sm font-bold text-emerald-800">
                    {VERDICT_OPTIONS.find(v => v.key === dispute.verdict)?.label}
                  </p>
                  {dispute.refundAmount > 0 && (
                    <p className="text-xs text-emerald-700 mt-1">Refund: ₹{dispute.refundAmount.toLocaleString("en-IN")}</p>
                  )}
                  {dispute.verdictNote && (
                    <p className="text-xs text-emerald-700 mt-1 italic">"{dispute.verdictNote}"</p>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button onClick={() => setShowTimeline(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-black text-slate-700">Dispute Timeline</p>
                  {showTimeline ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>
                {showTimeline && (
                  <div className="px-4 pb-4">
                    <Timeline steps={dispute.timeline} />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {dispute.status !== "resolved" && dispute.status !== "closed" && dispute.status !== "escalated" && (
                <div className="space-y-2">
                  {dispute.status === "open" && (
                    <button onClick={() => onUpdateStatus(dispute.id, "under_review")}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <RefreshCw size={13} /> Mark Under Review
                    </button>
                  )}
                  <button onClick={() => onEscalate(dispute.id)}
                    className="w-full py-2.5 border-2 border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                    <ArrowUpRight size={13} /> Escalate to Admin
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Verdict Tab ── */}
          {tab === "verdict" && (
            <div className="p-5 space-y-4">
              {dispute.status === "resolved" || dispute.status === "closed" ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 size={36} className="text-emerald-400 mb-3" />
                  <p className="text-sm font-bold text-slate-600">Verdict Already Given</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {VERDICT_OPTIONS.find(v => v.key === dispute.verdict)?.label || "Dispute resolved."}
                  </p>
                </div>
              ) : dispute.status === "escalated" ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ArrowUpRight size={36} className="text-red-400 mb-3" />
                  <p className="text-sm font-bold text-slate-600">Escalated to Admin</p>
                  <p className="text-xs text-slate-400 mt-1">This dispute is now with admin for resolution.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400">Select verdict and enter refund amount if applicable.</p>

                  {/* Verdict options */}
                  <div className="space-y-2">
                    {VERDICT_OPTIONS.map(v => (
                      <label key={v.key}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all
                          ${selectedVerdict === v.key ? v.color : "border-slate-200 bg-white hover:border-slate-300"}`}>
                        <input type="radio" name="verdict" value={v.key ?? ""}
                          checked={selectedVerdict === v.key}
                          onChange={() => setVerdict(v.key)}
                          className="mt-0.5 accent-violet-600" />
                        <div>
                          <p className="text-xs font-bold">{v.label}</p>
                          <p className="text-2xs opacity-70 mt-0.5">{v.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Refund amount */}
                  {(selectedVerdict === "favour_customer" || selectedVerdict === "partial_refund") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Refund Amount (₹)</label>
                      <div className="relative">
                        <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          value={refundAmt}
                          onChange={e => setRefundAmt(e.target.value)}
                          placeholder="0"
                          max={dispute.jobAmount}
                          className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm
                            focus:outline-none focus:border-violet-400 transition-all"
                        />
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">Max: ₹{dispute.jobAmount.toLocaleString("en-IN")}</p>
                    </div>
                  )}

                  {/* Note */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Verdict Note</label>
                    <textarea
                      value={verdictNote}
                      onChange={e => setVerdictNote(e.target.value)}
                      rows={3}
                      placeholder="Explain your decision clearly…"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs
                        focus:outline-none focus:border-violet-400 resize-none transition-all"
                    />
                  </div>

                  <button
                    onClick={submitVerdict}
                    disabled={!selectedVerdict || submitting}
                    className="w-full py-3 bg-violet-600 text-white rounded-xl text-sm font-bold
                      hover:bg-violet-700 transition-colors disabled:opacity-50
                      flex items-center justify-center gap-2">
                    {submitting
                      ? <><RefreshCw size={14} className="animate-spin" /> Processing…</>
                      : <><Gavel size={14} /> Submit Verdict</>}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DisputeResolutionPage() {
  const [disputes,   setDisputes]   = useState<DisputeItem[]>(MOCK_DISPUTES);
  const [search,     setSearch]     = useState("");
  const [statusTab,  setStatusTab]  = useState<DisputeStatus | "all">("all");
  const [catFilter,  setCatFilter]  = useState<DisputeCategory | "all">("all");
  const [priFilter,  setPriFilter]  = useState<"all" | "high" | "medium" | "low">("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selected,   setSelected]   = useState<DisputeItem | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleUpdateStatus(id: string, status: DisputeStatus) {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    showToast(`Dispute marked as ${STATUS_CONFIG[status].label}.`);
  }

  function handleGiveVerdict(id: string, verdict: DisputeVerdict, refund: number, note: string) {
    setDisputes(prev => prev.map(d =>
      d.id === id ? { ...d, status: "resolved", verdict, refundAmount: refund, verdictNote: note } : d
    ));
    setSelected(prev => prev?.id === id
      ? { ...prev, status: "resolved", verdict, refundAmount: refund, verdictNote: note }
      : prev
    );
    showToast("Verdict submitted! Dispute marked as Resolved. ✓");
  }

  function handleEscalate(id: string) {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: "escalated" } : d));
    setSelected(prev => prev?.id === id ? { ...prev, status: "escalated" } : prev);
    showToast("Dispute escalated to Admin.", "error");
  }

  const filtered = useMemo(() => disputes.filter(d => {
    const matchSearch = !search ||
      d.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      d.vendor.name.toLowerCase().includes(search.toLowerCase()) ||
      d.bookingId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusTab === "all" || d.status === statusTab;
    const matchCat    = catFilter === "all" || d.category === catFilter;
    const matchPri    = priFilter === "all" || d.priority === priFilter;
    return matchSearch && matchStatus && matchCat && matchPri;
  }), [disputes, search, statusTab, catFilter, priFilter]);

  const stats = {
    total:       disputes.length,
    open:        disputes.filter(d => d.status === "open").length,
    under_review:disputes.filter(d => d.status === "under_review").length,
    escalated:   disputes.filter(d => d.status === "escalated").length,
    resolved:    disputes.filter(d => d.status === "resolved").length,
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">Dispute Resolution</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage and resolve customer-vendor disputes</p>
        </div>
        {stats.open > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={14} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700">
              {stats.open} open dispute{stats.open > 1 ? "s" : ""} need attention
            </span>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total",        value: stats.total,        bg: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",   icon: Scale },
          { label: "Open",         value: stats.open,         bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: AlertTriangle },
          { label: "Under Review", value: stats.under_review, bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: RefreshCw },
          { label: "Escalated",    value: stats.escalated,    bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: ArrowUpRight },
          { label: "Resolved",     value: stats.resolved,     bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} border-2 ${card.border} rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={card.text} />
                <p className="text-xs font-bold text-slate-500">{card.label}</p>
              </div>
              <p className={`text-2xl font-black ${card.text}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search customer, vendor, booking ID…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm
              focus:outline-none focus:border-violet-400 transition-all placeholder:text-slate-300" />
        </div>
        <button onClick={() => setShowFilter(s => !s)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all
            ${showFilter ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
          <Filter size={13} /> Filters
          {(catFilter !== "all" || priFilter !== "all") && <span className="w-2 h-2 bg-violet-500 rounded-full" />}
        </button>
      </div>

      {showFilter && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {([["all", "All"], ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => [k, v.label])] as [string, string][]).map(([k, label]) => (
                <button key={k} onClick={() => setCatFilter(k as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                    ${catFilter === k ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Priority</p>
            <div className="flex gap-1.5">
              {[["all", "All"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]].map(([k, label]) => (
                <button key={k} onClick={() => setPriFilter(k as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                    ${priFilter === k ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {(catFilter !== "all" || priFilter !== "all") && (
            <button onClick={() => { setCatFilter("all"); setPriFilter("all"); }}
              className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
              <X size={11} /> Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Status Tabs ── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {STATUS_TABS.map(t => {
          const count = t.key === "all" ? disputes.length : disputes.filter(d => d.status === t.key).length;
          return (
            <button key={t.key} onClick={() => setStatusTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5
                ${statusTab === t.key ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t.label}
              {count > 0 && (
                <span className={`text-2xs font-black px-1.5 py-0.5 rounded-full
                  ${statusTab === t.key ? "bg-violet-100 text-violet-700" : "bg-white text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Cards Grid ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-600">No disputes found</p>
          <p className="text-sm text-slate-400 mt-1">Great job! All disputes are handled.</p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold text-slate-400">
            Showing <span className="text-slate-700 font-bold">{filtered.length}</span> disputes
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filtered.map(d => (
              <DisputeCard key={d.id} dispute={d} onClick={() => setSelected(d)} />
            ))}
          </div>
        </>
      )}

      {selected && (
        <DisputeDrawer
          dispute={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
          onGiveVerdict={handleGiveVerdict}
          onEscalate={handleEscalate}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]
          text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 whitespace-nowrap
          ${toast.type === "success" ? "bg-emerald-700" : "bg-red-700"}`}>
          {toast.type === "success"
            ? <CheckCircle2 size={15} className="text-emerald-300" />
            : <XCircle size={15} className="text-red-300" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
