// src/pages/admin/dashboard/DisputesPage.tsx

import { useState, useMemo } from "react";
import { Scale, CheckCircle2, XCircle } from "lucide-react";
import {
  ADMIN_DISPUTES, type AdminDispute, type DisputeStatus, type DisputeVerdict,
} from "./mockAdminData";

import DisputeStatsCards  from "./components/DisputeStatsCards";
import DisputeSearchBar   from "./components/DisputeSearchBar";
import DisputeStatusTabs  from "./components/DisputeStatusTabs";
import DisputeCard        from "./components/DisputeCard";
import DisputeDrawer      from "./components/DisputeDrawer";

type TabKey = DisputeStatus | "all";

export default function DisputesPage() {
  const [disputes,  setDisputes]  = useState<AdminDispute[]>(ADMIN_DISPUTES);
  const [search,    setSearch]    = useState("");
  const [statusTab, setStatusTab] = useState<TabKey>("all");
  const [sortBy,    setSortBy]    = useState("date_desc");
  const [selected,  setSelected]  = useState<AdminDispute | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Actions ──────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function handleResolve(
    id: string,
    verdict: NonNullable<DisputeVerdict>,
    refund: number,
    note: string,
  ) {
    setDisputes(prev => prev.map(d =>
      d.id === id
        ? { ...d, status: "resolved" as const, verdict, refundIssued: refund, verdictNote: note }
        : d,
    ));
    setSelected(prev =>
      prev?.id === id
        ? { ...prev, status: "resolved" as const, verdict, refundIssued: refund, verdictNote: note }
        : prev,
    );
    showToast(
      verdict === "favor_customer" ? `Resolved — ₹${refund.toLocaleString("en-IN")} refund issued.` :
      verdict === "favor_vendor"   ? "Resolved — Vendor not at fault. No refund." :
      verdict === "partial_refund" ? `Resolved — ₹${refund.toLocaleString("en-IN")} partial refund issued.` :
      "Dispute closed — No action taken.",
    );
  }

  function handleEscalate(id: string) {
    setDisputes(prev => prev.map(d =>
      d.id === id ? { ...d, status: "escalated" as const } : d,
    ));
    setSelected(prev =>
      prev?.id === id ? { ...prev, status: "escalated" as const } : prev,
    );
    showToast("Dispute escalated to senior admin.", "error");
  }

  // ── Filter + Sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return disputes
      .filter(d => {
        const matchSearch = !search ||
          d.bookingId.toLowerCase().includes(q)    ||
          d.customerName.toLowerCase().includes(q) ||
          d.vendorName.toLowerCase().includes(q)   ||
          d.category.toLowerCase().includes(q)     ||
          d.city.toLowerCase().includes(q)         ||
          d.reason.toLowerCase().includes(q);
        const matchStatus = statusTab === "all" || d.status === statusTab;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        // Escalated always float to top within sort
        if (sortBy === "escalated") {
          if (a.status === "escalated" && b.status !== "escalated") return -1;
          if (b.status === "escalated" && a.status !== "escalated") return 1;
        }
        if (sortBy === "amount_desc") return b.jobAmount - a.jobAmount;
        if (sortBy === "date_asc")    return a.raisedOn.localeCompare(b.raisedOn);
        // default: date_desc — escalated first, then open, then under_review, then resolved
        const ORDER: Record<DisputeStatus, number> = {
          escalated: 0, open: 1, under_review: 2, resolved: 3,
        };
        return ORDER[a.status] - ORDER[b.status];
      });
  }, [disputes, search, statusTab, sortBy]);

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-black text-slate-800">Disputes</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Resolve customer–vendor disputes — review evidence, give verdicts & issue refunds
        </p>
      </div>

      {/* Stats */}
      <DisputeStatsCards disputes={disputes} />

      {/* Escalated alert banner */}
      {disputes.filter(d => d.status === "escalated").length > 0 && (
        <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl px-5 py-4
          flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-black text-violet-800">
              {disputes.filter(d => d.status === "escalated").length} Escalated Dispute{disputes.filter(d => d.status === "escalated").length > 1 ? "s" : ""} Need Your Attention
            </p>
            <p className="text-xs text-violet-600 mt-0.5">
              These require senior admin verdict immediately
            </p>
          </div>
          <button onClick={() => setStatusTab("escalated")}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold
              hover:bg-violet-700 transition-colors shadow-md shadow-violet-200 flex-shrink-0">
            View Escalated
          </button>
        </div>
      )}

      {/* Search + sort */}
      <DisputeSearchBar
        search={search}  onSearch={setSearch}
        sortBy={sortBy}  onSort={setSortBy}
      />

      {/* Status tabs + count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <DisputeStatusTabs
          disputes={disputes}
          activeTab={statusTab}
          onChange={setStatusTab}
        />
        <p className="text-xs text-slate-400 flex-shrink-0">
          Showing <strong className="text-slate-700">{filtered.length}</strong> disputes
        </p>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <Scale size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-500">No disputes found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {filtered.map(d => (
            <DisputeCard key={d.id} dispute={d} onView={() => setSelected(d)} />
          ))}
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <DisputeDrawer
          dispute={selected}
          onClose={() => setSelected(null)}
          onResolve={handleResolve}
          onEscalate={handleEscalate}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]
          text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl
          flex items-center gap-2 whitespace-nowrap
          ${toast.type === "success" ? "bg-emerald-700" : "bg-red-700"}`}>
          {toast.type === "success"
            ? <CheckCircle2 size={15} className="text-emerald-300" />
            : <XCircle      size={15} className="text-red-300" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
