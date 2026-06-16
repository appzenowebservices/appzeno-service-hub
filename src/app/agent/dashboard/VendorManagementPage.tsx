// src/pages/agent/dashboard/VendorManagementPage.tsx

import { useState, useMemo } from "react";
import {
  Users, Search, Star, Phone, MapPin, CheckCircle2,
  XCircle, Clock, AlertTriangle, X,
  Shield, Briefcase, TrendingUp, Activity, Filter,
  ArrowUpRight, Ban, RefreshCw, BadgeCheck,
} from "lucide-react";
import { MOCK_VENDORS, type VendorItem } from "./mockAgentData";

type VendorStatus = VendorItem["status"];

const STATUS_CONFIG: Record<VendorStatus, {
  label: string; bg: string; text: string; border: string; dot: string;
}> = {
  active:    { label: "Active",    bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  inactive:  { label: "Inactive",  bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-300",   dot: "bg-slate-400"   },
  suspended: { label: "Suspended", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400"     },
  pending:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
};

const STATUS_TABS: { key: VendorStatus | "all"; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "inactive",  label: "Inactive" },
  { key: "suspended", label: "Suspended" },
  { key: "pending",   label: "Pending" },
];

const CATEGORIES = ["All", "Plumbing", "Electrical", "AC Service", "Cleaning", "Pest Control", "Carpentry", "Appliance Repair"];

function KycBadge({ ok }: { ok: boolean }) {
  return ok
    ? <span className="text-2xs font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">✓</span>
    : <span className="text-2xs font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded">✗</span>;
}

function VendorCard({ vendor, onClick }: { vendor: VendorItem; onClick: () => void }) {
  const cfg = STATUS_CONFIG[vendor.status];
  const kycComplete = vendor.kycAadhaar && vendor.kycPan && vendor.kycPhoto && vendor.kycAddress;

  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:border-violet-200 transition-all cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-black text-lg flex-shrink-0">
          {vendor.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-slate-800 truncate">{vendor.name}</p>
            {kycComplete && <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-slate-500">{vendor.ownerName} · {vendor.category}</p>
        </div>
        <span className={`text-2xs font-bold px-2 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} flex-shrink-0`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`} />
          {cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <p className="text-base font-black text-slate-800">{vendor.rating}★</p>
          <p className="text-2xs text-slate-400">{vendor.totalReviews} reviews</p>
        </div>
        <div className="text-center">
          <p className="text-base font-black text-slate-800">{vendor.jobsDone}</p>
          <p className="text-2xs text-slate-400">Jobs done</p>
        </div>
        <div className="text-center">
          <p className="text-base font-black text-slate-800">{vendor.completionRate}%</p>
          <p className="text-2xs text-slate-400">Completion</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={11} /> {vendor.area}, {vendor.city}
        </div>
        <div className="flex items-center gap-1 text-xs text-violet-600 font-bold">
          View Details <ArrowUpRight size={12} />
        </div>
      </div>
    </div>
  );
}

function VendorDetail({ vendor, onClose, onAction }: {
  vendor: VendorItem;
  onClose: () => void;
  onAction: (msg: string) => void;
}) {
  const [tab, setTab] = useState<"overview" | "jobs" | "reviews">("overview");
  const cfg = STATUS_CONFIG[vendor.status];
  const kycComplete = vendor.kycAadhaar && vendor.kycPan && vendor.kycPhoto && vendor.kycAddress;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 font-black text-xl">
              {vendor.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-black text-slate-800">{vendor.name}</p>
                {kycComplete && <BadgeCheck size={15} className="text-blue-500" />}
              </div>
              <p className="text-xs text-slate-500">{vendor.vendorId} · {vendor.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot} mr-1.5`} />
              {cfg.label} · Last seen {vendor.lastActive}
            </span>
            <div className="flex gap-2">
              {vendor.status !== "suspended" ? (
                <button onClick={() => onAction(`${vendor.name} suspended`)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                  <Ban size={12} /> Suspend
                </button>
              ) : (
                <button onClick={() => onAction(`${vendor.name} reactivated`)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                  <RefreshCw size={12} /> Reactivate
                </button>
              )}
              <button onClick={() => onAction(`Calling ${vendor.phone}`)}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                <Phone size={12} /> Call
              </button>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-100 flex-shrink-0 px-5">
          {(["overview", "jobs", "reviews"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 mr-6 text-xs font-bold border-b-2 transition-colors
                ${tab === t ? "border-violet-600 text-violet-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {t === "jobs" ? `Jobs (${vendor.recentJobs.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Rating",        value: `${vendor.rating}★`,  icon: Star,         color: "text-yellow-600", bg: "bg-yellow-50" },
                  { label: "Jobs Done",     value: vendor.jobsDone,       icon: Briefcase,    color: "text-blue-600",   bg: "bg-blue-50"   },
                  { label: "Completion",    value: `${vendor.completionRate}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Response Rate", value: `${vendor.responseRate}%`,  icon: Activity,  color: "text-violet-600", bg: "bg-violet-50" },
                  { label: "Active Jobs",   value: vendor.activeJobs,     icon: TrendingUp,   color: "text-cyan-600",   bg: "bg-cyan-50"   },
                  { label: "Total Earnings",value: `₹${vendor.totalEarnings.toLocaleString("en-IN")}`, icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 flex items-center gap-3`}>
                    <Icon size={16} className={color} />
                    <div>
                      <p className={`text-sm font-black ${color}`}>{value}</p>
                      <p className="text-2xs text-slate-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-slate-700 mb-3">Vendor Info</p>
                {[
                  { label: "Owner",    value: vendor.ownerName },
                  { label: "Phone",    value: vendor.phone },
                  { label: "Location", value: `${vendor.area}, ${vendor.city}` },
                  { label: "Joined",   value: vendor.joinedDate },
                  { label: "Services", value: vendor.services.join(", ") },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-xs font-bold text-slate-500 w-20 flex-shrink-0">{label}</span>
                    <span className="text-xs text-slate-700">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-black text-slate-700 mb-3">KYC Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Aadhaar", ok: vendor.kycAadhaar },
                    { label: "PAN",     ok: vendor.kycPan     },
                    { label: "Photo",   ok: vendor.kycPhoto   },
                    { label: "Address", ok: vendor.kycAddress },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                      <span className="text-xs font-bold text-slate-600">{label}</span>
                      <KycBadge ok={ok} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "jobs" && (
            <div className="p-5 space-y-3">
              {vendor.recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Briefcase size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No recent jobs</p>
                </div>
              ) : vendor.recentJobs.map(job => (
                <div key={job.id} className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{job.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{job.service}</p>
                    <p className="text-xs text-slate-500">{job.customer} · {job.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-800">₹{job.amount.toLocaleString("en-IN")}</p>
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full
                      ${job.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        job.status === "ongoing"   ? "bg-blue-100 text-blue-700" :
                                                     "bg-red-100 text-red-600"}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "reviews" && (
            <div className="p-5 space-y-3">
              {vendor.reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Star size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No reviews yet</p>
                </div>
              ) : vendor.reviews.map(r => (
                <div key={r.id} className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-800">{r.customer}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-xs font-black text-slate-700 ml-1">{r.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                  <p className="text-2xs text-slate-400 mt-2">{r.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorManagementPage() {
  const [vendors,    setVendors]    = useState<VendorItem[]>(MOCK_VENDORS);
  const [search,     setSearch]     = useState("");
  const [statusTab,  setStatusTab]  = useState<VendorStatus | "all">("all");
  const [catFilter,  setCatFilter]  = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [selected,   setSelected]   = useState<VendorItem | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const stats = useMemo(() => ({
    total:     vendors.length,
    active:    vendors.filter(v => v.status === "active").length,
    inactive:  vendors.filter(v => v.status === "inactive").length,
    suspended: vendors.filter(v => v.status === "suspended").length,
  }), [vendors]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() => {
    return vendors.filter(v => {
      const matchSearch = !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        v.vendorId.toLowerCase().includes(search.toLowerCase()) ||
        v.area.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusTab === "all" || v.status === statusTab;
      const matchCat    = catFilter === "All"  || v.category === catFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [vendors, search, statusTab, catFilter]);

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">Vendor Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {stats.total} vendors · {stats.active} active · {stats.suspended} suspended
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total",        value: stats.total,        bg: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",   icon: Users },
          { label: "Active",         value: stats.active,         bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: CheckCircle2 },
          { label: "Inactive", value: stats.inactive, bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: Clock },
          { label: "Suspended",    value: stats.suspended,    bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: XCircle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
            <Icon size={20} className={color} />
            <div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vendor name, ID, area..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
        </div>
        <button onClick={() => setShowFilter(s => !s)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors
            ${showFilter ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
          <Filter size={15} /> Filters
        </button>
      </div>

      {showFilter && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all
                  ${catFilter === c ? "bg-violet-600 text-white border-violet-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map(({ key, label }) => {
          const count = key === "all" ? vendors.length : vendors.filter(v => v.status === key).length;
          return (
            <button key={key} onClick={() => setStatusTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                ${statusTab === key
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-violet-300"}`}>
              {label}
              <span className={`text-2xs font-black px-1.5 py-0.5 rounded-full
                ${statusTab === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users size={40} className="text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-500">No vendors found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(v => (
            <VendorCard key={v.id} vendor={v} onClick={() => setSelected(v)} />
          ))}
        </div>
      )}

      {selected && (
        <VendorDetail
          vendor={selected}
          onClose={() => setSelected(null)}
          onAction={(msg) => { showToast(msg); setSelected(null); }}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3
          rounded-2xl shadow-2xl text-white text-sm font-bold
          ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
