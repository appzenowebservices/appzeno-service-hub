// src/pages/agent/dashboard/LeadManagementPage.tsx
// Lead Management — Agent Dashboard
// Fully responsive + PWA-friendly

import { useState, useMemo } from "react";
import {
  ClipboardList, Search, Clock, MapPin, Phone,
  User, Star, Zap, AlertCircle, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, ArrowRight, Timer, Package,
  TrendingUp, RefreshCw, Eye, UserCheck, X,
  CalendarDays, MessageSquare, Navigation, BadgeCheck,
} from "lucide-react";
import {
  MOCK_LEADS,
  getLeadStats,
  type LeadItem,
  type LeadStatus,
  type LeadUrgency,
} from "./mockAgentData";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LeadStatus, {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  dot:    string;
}> = {
  unassigned: { label: "Unassigned", color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200", dot: "bg-orange-400" },
  assigned:   { label: "Assigned",   color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-400" },
  accepted:   { label: "Accepted",   color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-200", dot: "bg-violet-400" },
  completed:  { label: "Completed",  color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-200",dot: "bg-emerald-400" },
  expired:    { label: "Expired",    color: "text-slate-500",  bg: "bg-slate-100",  border: "border-slate-200",  dot: "bg-slate-400" },
  cancelled:  { label: "Cancelled",  color: "text-red-600",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-400" },
};

const URGENCY_CONFIG: Record<LeadUrgency, {
  label:  string;
  color:  string;
  bg:     string;
  icon:   React.ElementType;
}> = {
  standard:  { label: "Standard",  color: "text-slate-500",  bg: "bg-slate-100",   icon: Package },
  priority:  { label: "Priority",  color: "text-amber-600",  bg: "bg-amber-50",    icon: TrendingUp },
  emergency: { label: "Emergency", color: "text-red-600",    bg: "bg-red-50",      icon: Zap },
};

const FILTER_TABS: { key: LeadStatus | "all"; label: string }[] = [
  { key: "all",        label: "All" },
  { key: "unassigned", label: "Unassigned" },
  { key: "assigned",   label: "Assigned" },
  { key: "accepted",   label: "Accepted" },
  { key: "completed",  label: "Completed" },
  { key: "expired",    label: "Expired" },
];

// ─── Expiry Progress Bar ───────────────────────────────────────────────────────

function ExpiryBar({ expiresInMins, totalExpireMins, expiresIn }: {
  expiresInMins: number;
  totalExpireMins: number;
  expiresIn: string;
}) {
  if (expiresInMins === 0) return null;
  const pct = Math.min(100, (expiresInMins / totalExpireMins) * 100);
  const isLow = pct <= 30;
  const isMid = pct <= 60;
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center gap-1 text-slate-400 font-medium">
          <Timer size={10} />
          Expires in
        </span>
        <span className={`font-bold text-xs ${isLow ? "text-red-500" : isMid ? "text-amber-500" : "text-emerald-500"}`}>
          {expiresIn}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500
            ${isLow ? "bg-red-400" : isMid ? "bg-amber-400" : "bg-emerald-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Lead Detail Modal / Bottom Sheet ─────────────────────────────────────────

function LeadDetail({
  lead,
  onClose,
  onAssign,
}: {
  lead: LeadItem;
  onClose: () => void;
  onAssign: (lead: LeadItem) => void;
}) {
  const [detailTab, setDetailTab] = useState<"overview" | "vendors">("overview");

  const statusCfg   = STATUS_CONFIG[lead.status];
  const urgencyCfg  = URGENCY_CONFIG[lead.urgency];
  const UrgencyIcon = urgencyCfg.icon;
  const isActionable = lead.status === "unassigned";

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex-shrink-0">

          {/* Urgency ribbon */}
          {lead.urgency !== "standard" && (
            <div className={`px-5 py-2 flex items-center gap-2
              ${lead.urgency === "emergency" ? "bg-red-500" : "bg-amber-400"}`}>
              <UrgencyIcon size={13} className="text-white" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {urgencyCfg.label}
              </span>
            </div>
          )}

          {/* Title row */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100
                flex items-center justify-center text-2xl flex-shrink-0">
                {lead.categoryIcon}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-800 leading-tight">{lead.service}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{lead.subService}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-mono text-slate-400">{lead.bookingId}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{lead.createdAt}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 ml-2"
            >
              <X size={18} />
            </button>
          </div>

          {/* Status + Amount bar */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border
              ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            <div className="text-right">
              <p className="text-2xs text-slate-400">Est. Value</p>
              <p className="text-lg font-black text-slate-800">
                ₹{lead.amount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-5">
            {(["overview", "vendors"] as const).map(t => (
              <button
                key={t}
                onClick={() => setDetailTab(t)}
                className={`py-3 mr-6 text-xs font-bold border-b-2 transition-colors
                  ${detailTab === t
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                {t === "overview"
                  ? "Overview"
                  : `Suggested Vendors (${lead.suggestedVendors.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* OVERVIEW TAB */}
          {detailTab === "overview" && (
            <div className="p-5 space-y-5">

              {/* Expiry bar */}
              {lead.status === "unassigned" && lead.expiresInMins > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <ExpiryBar
                    expiresInMins={lead.expiresInMins}
                    totalExpireMins={lead.totalExpireMins}
                    expiresIn={lead.expiresIn}
                  />
                </div>
              )}

              {/* Customer */}
              <div>
                <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-2">Customer</p>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center
                        text-violet-700 font-black text-base flex-shrink-0">
                        {lead.customer.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate">{lead.customer.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Star size={10} className="text-amber-400" />
                          <span className="text-xs text-slate-500">
                            {lead.customer.rating} · {lead.customer.totalBookings} total bookings
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={`tel:${lead.customer.phone}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-100 text-blue-700
                        text-xs font-bold hover:bg-blue-200 transition-colors flex-shrink-0"
                    >
                      <Phone size={12} /> Call
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={11} className="text-slate-400" />
                    <span>{lead.customer.phone}</span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-2">Schedule</p>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <CalendarDays size={18} className="text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{lead.scheduledDate}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{lead.scheduledSlot}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-2">Service Address</p>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 leading-snug">
                        {lead.address.fullAddress}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {lead.address.area}, {lead.address.city}
                      </p>
                      <p className="text-xs text-slate-400">PIN: {lead.address.pincode}</p>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(lead.address.fullAddress)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-violet-600
                        px-2.5 py-1.5 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors flex-shrink-0"
                    >
                      <Navigation size={11} /> Map
                    </a>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div>
                  <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-2">Customer Notes</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <MessageSquare size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">{lead.notes}</p>
                  </div>
                </div>
              )}

              {/* Assigned vendor */}
              {lead.assignedVendor && (
                <div>
                  <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Vendor</p>
                  <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center
                          text-white font-black text-base flex-shrink-0">
                          {lead.assignedVendor.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-black text-violet-800 truncate">{lead.assignedVendor.name}</p>
                            <BadgeCheck size={13} className="text-blue-500 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={10} className="text-amber-400" />
                            <span className="text-xs text-violet-600">{lead.assignedVendor.rating}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={`tel:${lead.assignedVendor.phone}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white
                          text-xs font-bold hover:bg-violet-700 transition-colors flex-shrink-0"
                      >
                        <Phone size={12} /> Call
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VENDORS TAB */}
          {detailTab === "vendors" && (
            <div className="p-5 space-y-3">
              {lead.suggestedVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                    <UserCheck size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">No suggested vendors</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {lead.status === "assigned" || lead.status === "accepted"
                      ? "A vendor is already assigned to this lead."
                      : "No vendors available for this area right now."}
                  </p>
                </div>
              ) : (
                lead.suggestedVendors.map((v, i) => (
                  <div
                    key={v.id}
                    className={`rounded-2xl border-2 p-4 transition-all
                      ${v.available
                        ? "border-slate-200 hover:border-violet-200 hover:bg-violet-50/30"
                        : "border-slate-100 bg-slate-50 opacity-60"}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Rank badge */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0
                        ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                        {i === 0 ? "⭐" : `#${i + 1}`}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{v.name}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-xs">
                                <Star size={10} className="text-amber-400" />
                                <span className="font-bold text-slate-700">{v.rating}</span>
                              </span>
                              <span className="text-xs text-slate-400">{v.jobsDone} jobs</span>
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Navigation size={10} /> {v.distance}
                              </span>
                            </div>
                          </div>
                          {v.available ? (
                            <span className="text-2xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
                              Available
                            </span>
                          ) : (
                            <span className="text-2xs font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500 flex-shrink-0">
                              Busy
                            </span>
                          )}
                        </div>

                        {/* Response rate bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-2xs mb-1">
                            <span className="text-slate-400">Response Rate</span>
                            <span className={`font-bold ${v.responseRate >= 85 ? "text-emerald-600" : v.responseRate >= 70 ? "text-amber-600" : "text-red-500"}`}>
                              {v.responseRate}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all
                                ${v.responseRate >= 85 ? "bg-emerald-400" : v.responseRate >= 70 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${v.responseRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Assign button */}
                        {v.available && isActionable && (
                          <button
                            onClick={() => {
                              onAssign({
                                ...lead,
                                assignedVendor: {
                                  id: v.id, name: v.name,
                                  rating: v.rating, phone: "",
                                },
                              });
                              onClose();
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                              bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors"
                          >
                            <UserCheck size={13} />
                            Assign {v.name.split(" ")[0]}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
          {lead.status === "unassigned" && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold
                  text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setDetailTab("vendors")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                  bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
              >
                <UserCheck size={15} />
                Assign Vendor
              </button>
            </div>
          )}
          {lead.status === "expired" && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold
                  text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                  bg-slate-700 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                <RefreshCw size={15} />
                Re-assign
              </button>
            </div>
          )}
          {(lead.status === "assigned" || lead.status === "accepted" || lead.status === "completed") && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold
                text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

function LeadCard({ lead, onAssign, onView }: {
  lead: LeadItem;
  onAssign: (lead: LeadItem) => void;
  onView: (lead: LeadItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg  = STATUS_CONFIG[lead.status];
  const urgencyCfg = URGENCY_CONFIG[lead.urgency];
  const UrgencyIcon = urgencyCfg.icon;

  const isActionable = lead.status === "unassigned";
  const isActive     = lead.status === "assigned" || lead.status === "accepted";

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-md overflow-hidden
      ${lead.urgency === "emergency" ? "border-red-200" : lead.urgency === "priority" ? "border-amber-200" : "border-slate-100"}`}>

      {/* Emergency / Priority ribbon */}
      {lead.urgency !== "standard" && (
        <div className={`px-4 py-1.5 flex items-center gap-2 ${lead.urgency === "emergency" ? "bg-red-500" : "bg-amber-400"}`}>
          <UrgencyIcon size={12} className="text-white" />
          <span className="text-xs font-black text-white uppercase tracking-wider">
            {urgencyCfg.label}
          </span>
          {lead.urgency === "emergency" && lead.notes && (
            <span className="text-xs text-white/80 ml-1 truncate">— {lead.notes}</span>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl flex-shrink-0">
              {lead.categoryIcon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-slate-800">{lead.service}</h4>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{lead.subService}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">{lead.bookingId}</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-400">{lead.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold
              ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            <span className="text-sm font-black text-slate-700">
              ₹{lead.amount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Customer + Schedule row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
            <User size={12} className="text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{lead.customer.name}</p>
              <div className="flex items-center gap-1.5">
                <Star size={9} className="text-amber-400" />
                <span className="text-2xs text-slate-400">
                  {lead.customer.rating} · {lead.customer.totalBookings} bookings
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
            <Clock size={12} className="text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700">{lead.scheduledDate}</p>
              <p className="text-2xs text-slate-400 truncate">{lead.scheduledSlot}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500 leading-snug">{lead.address.fullAddress}</p>
            <p className="text-2xs text-slate-400 mt-0.5">
              {lead.address.area}, {lead.address.city} — {lead.address.pincode}
            </p>
          </div>
        </div>

        {/* Expiry bar */}
        {lead.status === "unassigned" && (
          <ExpiryBar
            expiresInMins={lead.expiresInMins}
            totalExpireMins={lead.totalExpireMins}
            expiresIn={lead.expiresIn}
          />
        )}

        {/* Assigned vendor info */}
        {lead.assignedVendor && (
          <div className="mt-2 flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
            <UserCheck size={13} className="text-violet-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-violet-800 truncate">{lead.assignedVendor.name}</p>
              <div className="flex items-center gap-1.5">
                <Star size={9} className="text-amber-400" />
                <span className="text-2xs text-violet-500">{lead.assignedVendor.rating}</span>
              </div>
            </div>
            <a href={`tel:${lead.assignedVendor.phone}`}
              className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700">
              <Phone size={11} />
            </a>
          </div>
        )}

        {/* Expand: Suggested vendors quick view */}
        {lead.suggestedVendors.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl
                bg-slate-50 hover:bg-slate-100 transition-colors">
              <span className="text-xs font-bold text-slate-600">
                Suggested Vendors ({lead.suggestedVendors.length})
              </span>
              {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            </button>

            {expanded && (
              <div className="mt-2 space-y-2">
                {lead.suggestedVendors.map((v) => (
                  <div key={v.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors
                      ${v.available ? "border-slate-200 hover:border-violet-200 hover:bg-violet-50" : "border-slate-100 opacity-60 bg-slate-50"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{v.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-2xs text-slate-400">
                          <Star size={8} className="text-amber-400" /> {v.rating}
                        </span>
                        <span className="text-2xs text-slate-300">·</span>
                        <span className="text-2xs text-slate-400">{v.jobsDone} jobs</span>
                        <span className="text-2xs text-slate-300">·</span>
                        <span className="text-2xs text-slate-400">{v.distance}</span>
                        <span className="text-2xs text-slate-300">·</span>
                        <span className="text-2xs text-emerald-600 font-bold">{v.responseRate}% resp.</span>
                      </div>
                    </div>
                    {v.available ? (
                      <button
                        onClick={() => onAssign({ ...lead, assignedVendor: { id: v.id, name: v.name, rating: v.rating, phone: "" } })}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                          bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors">
                        Assign <ArrowRight size={10} />
                      </button>
                    ) : (
                      <span className="text-2xs text-slate-400 font-medium px-2 py-1 rounded-lg bg-slate-100">
                        Unavailable
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action footer */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
          <button
            onClick={() => onView(lead)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
              text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
            <Eye size={13} />
            View Details
          </button>
          {isActionable && (
            <button
              onClick={() => onAssign(lead)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
                text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors">
              <UserCheck size={13} />
              Assign Vendor
            </button>
          )}
          {isActive && (
            <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={13} />
              In Progress
            </span>
          )}
          {lead.status === "completed" && (
            <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={13} />
              Completed
            </span>
          )}
          {lead.status === "expired" && (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
              <RefreshCw size={13} />
              Re-assign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function LeadStatsBar() {
  const stats = getLeadStats();
  const cards = [
    { label: "Total Leads",  value: stats.total,      color: "text-slate-700",    bg: "bg-slate-50",    border: "border-slate-200"   },
    { label: "Unassigned",   value: stats.unassigned, color: "text-orange-600",   bg: "bg-orange-50",   border: "border-orange-200"  },
    { label: "In Progress",  value: stats.assigned,   color: "text-violet-600",   bg: "bg-violet-50",   border: "border-violet-200"  },
    { label: "Completed",    value: stats.completed,  color: "text-emerald-600",  bg: "bg-emerald-50",  border: "border-emerald-200" },
    { label: "Expired",      value: stats.expired,    color: "text-slate-500",    bg: "bg-slate-50",    border: "border-slate-200"   },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`rounded-2xl border-2 ${c.border} ${c.bg} px-4 py-3 text-center`}>
          <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Assign Toast ─────────────────────────────────────────────────────────────

function AssignToast({ lead, onClose }: { lead: LeadItem | null; onClose: () => void }) {
  if (!lead) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4">
      <div className="bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={20} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm">Vendor Assigned!</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {lead.assignedVendor?.name || "Vendor"} → {lead.bookingId}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors flex-shrink-0 mt-0.5">
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadManagementPage() {
  const [filterStatus,  setFilterStatus]  = useState<LeadStatus | "all">("all");
  const [search,        setSearch]        = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<LeadUrgency | "all">("all");
  const [toast,         setToast]         = useState<LeadItem | null>(null);
  const [selected,      setSelected]      = useState<LeadItem | null>(null); // ← detail panel

  const filtered = useMemo(() => {
    return MOCK_LEADS.filter(lead => {
      const matchStatus  = filterStatus === "all" || lead.status === filterStatus;
      const matchUrgency = urgencyFilter === "all" || lead.urgency === urgencyFilter;
      const q = search.toLowerCase();
      const matchSearch  = !q ||
        lead.service.toLowerCase().includes(q) ||
        lead.customer.name.toLowerCase().includes(q) ||
        lead.bookingId.toLowerCase().includes(q) ||
        lead.address.area.toLowerCase().includes(q) ||
        (lead.assignedVendor?.name.toLowerCase().includes(q) ?? false);
      return matchStatus && matchUrgency && matchSearch;
    });
  }, [filterStatus, urgencyFilter, search]);

  function handleAssign(lead: LeadItem) {
    setToast(lead);
    setTimeout(() => setToast(null), 3500);
  }

  const unassignedCount = MOCK_LEADS.filter(l => l.status === "unassigned").length;
  const emergencyCount  = MOCK_LEADS.filter(l => l.urgency === "emergency" && l.status === "unassigned").length;

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <ClipboardList size={18} className="text-violet-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Lead Management</h2>
            {unassignedCount > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                {unassignedCount} pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium ml-11">
            Assign incoming service requests to vendors in your city
          </p>
        </div>

        {emergencyCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-black text-red-700">{emergencyCount} Emergency Lead{emergencyCount > 1 ? "s" : ""}</p>
              <p className="text-2xs text-red-500">Requires immediate assignment</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats Bar ── */}
      <LeadStatsBar />

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by service, customer, booking ID, area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
              focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(["all", "emergency", "priority", "standard"] as const).map(u => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap capitalize
                ${urgencyFilter === u
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"}`}
            >
              {u === "all" ? "All Priority" : u.charAt(0).toUpperCase() + u.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Status Tab Filter ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_TABS.map(({ key, label }) => {
          const count = key === "all"
            ? MOCK_LEADS.length
            : MOCK_LEADS.filter(l => l.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0
                ${filterStatus === key
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700"}`}
            >
              {label}
              <span className={`text-2xs font-black px-1.5 py-0.5 rounded-full
                ${filterStatus === key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Lead Cards Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-slate-600 mb-1">No leads found</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onAssign={handleAssign}
              onView={setSelected}        // ← opens detail panel
            />
          ))}
        </div>
      )}

      {/* ── Lead Detail Panel ── */}
      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelected(null)}
          onAssign={(lead) => {
            handleAssign(lead);
            setSelected(null);
          }}
        />
      )}

      {/* ── Assign Toast ── */}
      <AssignToast lead={toast} onClose={() => setToast(null)} />
    </div>
  );
}
