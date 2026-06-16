// src/pages/agent/dashboard/VendorApprovalsPage.tsx

import { useState } from "react";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Eye,
  FileText, User, Phone, MapPin, Calendar, ChevronDown,
  ChevronRight, Shield, X, CheckCheck, Briefcase,
  CreditCard, Camera, Home, Search, Filter, Bell,
} from "lucide-react";
import { MOCK_PENDING_VENDORS, type PendingVendor } from "./mockAgentData";

// ── Types ─────────────────────────────────────────────────────────────────────
type KYCDoc = "aadhaar" | "pan" | "photo" | "address";
type ReviewAction = "approve" | "reject";

const DOC_CONFIG: Record<KYCDoc, {
  label: string;
  icon: React.ElementType;
  desc: string;
}> = {
  aadhaar: { label: "Aadhaar Card",    icon: CreditCard, desc: "Government issued identity proof" },
  pan:     { label: "PAN Card",        icon: FileText,   desc: "Permanent Account Number" },
  photo:   { label: "Profile Photo",   icon: Camera,     desc: "Recent passport-size photo" },
  address: { label: "Address Proof",   icon: Home,       desc: "Utility bill / Rent agreement" },
};

const REJECT_REASONS = [
  "Aadhaar card image is blurry or unreadable",
  "PAN card details don't match application",
  "Profile photo is not clear",
  "Address proof is expired",
  "Documents are incomplete or missing",
  "Details mismatch across documents",
  "Suspicious/fake document detected",
  "Other (specify below)",
];

// ── KYC Status Badge ──────────────────────────────────────────────────────────
function KYCBadge({ status }: { status: "submitted" | "missing" | "verified" }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <CheckCircle2 size={10} /> Verified
      </span>
    );
  if (status === "submitted")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
        <Clock size={10} /> Submitted
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
      <XCircle size={10} /> Missing
    </span>
  );
}

// ── KYC Tracker ──────────────────────────────────────────────────────────────
function KYCTracker({ vendor }: { vendor: PendingVendor }) {
  const steps: KYCDoc[] = ["aadhaar", "pan", "photo", "address"];
  const allDone = steps.every(s => vendor.kyc[s] === "submitted" || vendor.kyc[s] === "verified");

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">KYC Document Status</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
          ${allDone ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {steps.filter(s => vendor.kyc[s] !== "missing").length}/{steps.length} Uploaded
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
          style={{ width: `${(steps.filter(s => vendor.kyc[s] !== "missing").length / steps.length) * 100}%` }}
        />
      </div>

      {/* Step tracker */}
      <div className="flex items-center gap-1">
        {steps.map((doc, idx) => {
          const st = vendor.kyc[doc];
          const cfg = DOC_CONFIG[doc];
          const Icon = cfg.icon;
          return (
            <div key={doc} className="flex items-center flex-1">
              <div className={`flex-1 flex flex-col items-center gap-1`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                  ${st === "verified"  ? "bg-emerald-500 text-white"
                  : st === "submitted" ? "bg-amber-400 text-white"
                  : "bg-slate-200 text-slate-400"}`}>
                  <Icon size={14} />
                </div>
                <p className="text-2xs text-slate-500 text-center leading-tight font-medium" style={{ fontSize: "9px" }}>
                  {cfg.label.split(" ")[0]}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded transition-all
                  ${vendor.kyc[steps[idx + 1]] !== "missing" ? "bg-violet-300" : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({
  vendor,
  action,
  onConfirm,
  onClose,
}: {
  vendor: PendingVendor;
  action: ReviewAction;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customNote,     setCustomNote]     = useState("");

  const isApprove = action === "approve";
  const canConfirm = isApprove || selectedReason !== "";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]
        w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={`px-5 py-4 ${isApprove ? "bg-emerald-50 border-b border-emerald-100" : "bg-red-50 border-b border-red-100"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                ${isApprove ? "bg-emerald-500" : "bg-red-500"}`}>
                {isApprove ? <CheckCheck size={18} className="text-white" /> : <X size={18} className="text-white" />}
              </div>
              <div>
                <h3 className={`font-black text-base ${isApprove ? "text-emerald-800" : "text-red-800"}`}>
                  {isApprove ? "Approve Vendor KYC" : "Reject Application"}
                </h3>
                <p className={`text-xs mt-0.5 ${isApprove ? "text-emerald-600" : "text-red-600"}`}>
                  {vendor.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center hover:bg-white transition-colors">
              <X size={14} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {isApprove ? (
            <>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-sm text-emerald-700">
                <p className="font-bold">This will:</p>
                <ul className="space-y-1.5">
                  {[
                    "Mark vendor as Active in the system",
                    "Allow vendor to receive job leads",
                    "Send approval SMS + Email to vendor",
                    "Add to your city's active vendor pool",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Optional Note to Vendor</p>
                <textarea
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="Welcome message or special instructions…"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none
                    focus:outline-none focus:border-emerald-400 transition-all placeholder:text-slate-300"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Reason for Rejection <span className="text-red-500">*</span></p>
                <div className="space-y-2">
                  {REJECT_REASONS.map(reason => (
                    <button
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left text-xs font-medium transition-all
                        ${selectedReason === reason
                          ? "border-red-400 bg-red-50 text-red-800"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                        ${selectedReason === reason ? "border-red-500 bg-red-500" : "border-slate-300"}`}>
                        {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
              {selectedReason === "Other (specify below)" && (
                <textarea
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="Specify the reason…"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none
                    focus:outline-none focus:border-red-400 transition-all placeholder:text-slate-300"
                />
              )}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                Vendor will be notified with the rejection reason. They can reapply after fixing the issues.
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedReason || customNote)}
            disabled={!canConfirm}
            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed
              ${isApprove
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100"}`}
          >
            {isApprove ? "✓ Confirm Approval" : "✕ Reject Application"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Pending Vendor Card ───────────────────────────────────────────────────────
function PendingVendorCard({
  vendor,
  onApprove,
  onReject,
}: {
  vendor: PendingVendor;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const docs: KYCDoc[] = ["aadhaar", "pan", "photo", "address"];
  const docsReady = docs.filter(d => vendor.kyc[d] !== "missing").length;
  const allReady  = docsReady === docs.length;

  const urgencyDays = Math.floor((Date.now() - new Date(vendor.appliedAt).getTime()) / 86400000);

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all
      ${urgencyDays >= 3 ? "border-amber-300" : "border-slate-200"}`}>

      {/* Urgency banner */}
      {urgencyDays >= 3 && (
        <div className="flex items-center gap-2 px-5 py-2 bg-amber-50 border-b border-amber-200 text-xs font-bold text-amber-700">
          <AlertTriangle size={12} /> Waiting {urgencyDays} days — Action required
        </div>
      )}

      {/* Main card content */}
      <div className="p-5">
        <div className="flex items-start gap-4">

          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700
            flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg shadow-violet-200">
            {vendor.name.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-black text-slate-800 text-base">{vendor.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{vendor.ownerName}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200">
                    {vendor.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{vendor.vendorId}</span>
                </div>
              </div>

              {/* KYC summary pill */}
              <div className={`text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0
                ${allReady ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                {docsReady}/4 docs
              </div>
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Phone size={11} className="text-slate-400" /> {vendor.phone}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={11} className="text-slate-400" /> {vendor.area}, {vendor.city}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar size={11} className="text-slate-400" /> Applied {vendor.appliedDate}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Briefcase size={11} className="text-slate-400" /> {vendor.experience} exp.
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {vendor.services.map(s => (
            <span key={s} className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              {s}
            </span>
          ))}
        </div>

        {/* KYC Tracker */}
        <div className="mt-4">
          <KYCTracker vendor={vendor} />
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1 mt-3 py-2 rounded-xl
            text-xs font-bold text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
        >
          {expanded ? "Hide" : "View"} Document Details
          <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        {/* Document Details (expanded) */}
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {docs.map(doc => {
              const cfg = DOC_CONFIG[doc];
              const st  = vendor.kyc[doc];
              const Icon = cfg.icon;
              return (
                <div key={doc} className={`flex items-center gap-3 p-3 rounded-xl border
                  ${st === "submitted" ? "bg-amber-50 border-amber-200"
                  : st === "verified"  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${st === "submitted" ? "bg-amber-100 text-amber-600"
                    : st === "verified"  ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-500"}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{cfg.label}</p>
                    <p className="text-xs text-slate-400">{cfg.desc}</p>
                  </div>
                  <KYCBadge status={st} />
                  {st === "submitted" && (
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Eye size={11} /> View
                    </button>
                  )}
                </div>
              );
            })}

            {/* Agent notes area */}
            {vendor.agentNote && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-bold text-blue-700 mb-1">Previous Review Note</p>
                <p className="text-xs text-blue-600">{vendor.agentNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-red-50 border-2 border-red-200 text-red-600 text-sm font-bold
              hover:bg-red-100 hover:border-red-300 transition-all"
          >
            <XCircle size={15} /> Reject
          </button>
          <button
            onClick={onApprove}
            disabled={!allReady}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
              ${allReady
                ? "bg-emerald-600 text-white border-2 border-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                : "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"}`}
          >
            <Shield size={15} />
            {allReady ? "Approve KYC" : "Docs Pending"}
          </button>
        </div>
        {!allReady && (
          <p className="text-xs text-center text-red-500 mt-2 font-semibold">
            ⚠ All documents must be submitted before approval
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorApprovalsPage() {
  const [vendors,     setVendors]     = useState<PendingVendor[]>(MOCK_PENDING_VENDORS);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("All");
  const [modal,       setModal]       = useState<{ vendor: PendingVendor; action: ReviewAction } | null>(null);
  const [toast,       setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleConfirm(reason?: string) {
    if (!modal) return;
    const { vendor, action } = modal;

    if (action === "approve") {
      setVendors(vs => vs.filter(v => v.id !== vendor.id));
      showToast(`${vendor.name} approved and is now Active! ✓`, "success");
    } else {
      setVendors(vs => vs.filter(v => v.id !== vendor.id));
      showToast(`${vendor.name} application rejected. Vendor notified.`, "error");
    }
    setModal(null);
  }

  const categories = ["All", ...Array.from(new Set(vendors.map(v => v.category)))];

  const filtered = vendors.filter(v => {
    const matchSearch = !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      v.vendorId.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || v.category === catFilter;
    return matchSearch && matchCat;
  });

  const urgentCount  = vendors.filter(v =>
    Math.floor((Date.now() - new Date(v.appliedAt).getTime()) / 86400000) >= 3
  ).length;
  const allDocsReady = vendors.filter(v =>
    (["aadhaar", "pan", "photo", "address"] as KYCDoc[]).every(d => v.kyc[d] !== "missing")
  ).length;

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">Vendor Approvals</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Review KYC documents and approve new vendors
          </p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Review",   value: vendors.length,  icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
          { label: "Docs Complete",    value: allDocsReady,    icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Urgent (3+ days)", value: urgentCount,     icon: AlertTriangle, color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200" },
          { label: "Approved Today",   value: 2,               icon: Shield,        color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200" },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-2xl border-2 ${card.border} p-4`}>
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── KYC Progress Overview ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-800">KYC Completion Overview</h3>
          <span className="text-xs text-slate-400">{vendors.length} pending applications</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["aadhaar", "pan", "photo", "address"] as KYCDoc[]).map(doc => {
            const cfg      = DOC_CONFIG[doc];
            const Icon     = cfg.icon;
            const submitted = vendors.filter(v => v.kyc[doc] !== "missing").length;
            const pct       = vendors.length > 0 ? Math.round((submitted / vendors.length) * 100) : 0;
            return (
              <div key={doc} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className="text-slate-500" />
                  <p className="text-xs font-bold text-slate-700">{cfg.label}</p>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-400">
                  <span className="font-bold text-slate-700">{submitted}</span>/{vendors.length} submitted
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Search + Category ── */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vendor name, ID…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm
              focus:outline-none focus:border-violet-400 transition-all placeholder:text-slate-300"
          />
        </div>
        <div className="flex gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex-shrink-0 transition-all
                ${catFilter === cat
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Pending Vendor Cards ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-700">All Clear! 🎉</p>
          <p className="text-sm text-slate-400 mt-1">No pending vendor applications right now.</p>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-4">
            Showing <span className="text-slate-700 font-bold">{filtered.length}</span> pending applications
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filtered.map(vendor => (
              <PendingVendorCard
                key={vendor.id}
                vendor={vendor}
                onApprove={() => setModal({ vendor, action: "approve" })}
                onReject={() => setModal({ vendor, action: "reject" })}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {modal && (
        <ReviewModal
          vendor={modal.vendor}
          action={modal.action}
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]
          text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl
          flex items-center gap-2
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
