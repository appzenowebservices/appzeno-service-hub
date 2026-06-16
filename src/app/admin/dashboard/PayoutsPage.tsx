// src/pages/admin/dashboard/PayoutsPage.tsx

import { useState, useMemo } from "react";
import { Wallet, CheckCircle2, XCircle } from "lucide-react";
import { PENDING_PAYOUTS, type PendingPayout } from "./mockAdminData";

import PayoutStatsCards  from "./components/PayoutStatsCards";
import PayoutSearchBar   from "./components/PayoutSearchBar";
import PayoutStatusTabs  from "./components/PayoutStatusTabs";
import PayoutCard        from "./components/PayoutCard";
import PayoutDrawer      from "./components/PayoutDrawer";
import type { PayoutStatus } from "./components/PayoutStatusBadge";

type TabKey = PayoutStatus | "all";

export default function PayoutsPage() {
  const [payouts,    setPayouts]    = useState<PendingPayout[]>(PENDING_PAYOUTS);
  const [search,     setSearch]     = useState("");
  const [statusTab,  setStatusTab]  = useState<TabKey>("all");
  const [sortBy,     setSortBy]     = useState("amount_desc");
  const [selected,   setSelected]   = useState<PendingPayout | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Actions ────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function updateStatus(id: string, status: PendingPayout["status"]) {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  }

  function handleApprove(id: string) {
    updateStatus(id, "approved");
    showToast("Payout approved. Ready to release.");
  }

  function handleRelease(id: string) {
    updateStatus(id, "released");
    showToast("Payment released to vendor UPI.");
  }

  function handleHold(id: string) {
    updateStatus(id, "on_hold");
    showToast("Payout put on hold for review.", "error");
  }

  // Quick actions from card
  function handleQuickAction(payout: PendingPayout) {
    if (payout.status === "pending")  handleApprove(payout.id);
    if (payout.status === "approved") handleRelease(payout.id);
  }

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payouts
      .filter(p => {
        const matchSearch = !search ||
          p.vendorName.toLowerCase().includes(q) ||
          p.vendorId.toLowerCase().includes(q)   ||
          p.city.toLowerCase().includes(q)       ||
          p.upiId.toLowerCase().includes(q)      ||
          p.category.toLowerCase().includes(q);
        const matchStatus = statusTab === "all" || p.status === statusTab;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "amount_desc") return b.amount - a.amount;
        if (sortBy === "amount_asc")  return a.amount - b.amount;
        if (sortBy === "name")        return a.vendorName.localeCompare(b.vendorName);
        if (sortBy === "date")        return a.requestedAt.localeCompare(b.requestedAt);
        return 0;
      });
  }, [payouts, search, statusTab, sortBy]);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const pendingCount  = payouts.filter(p => p.status === "pending").length;
  const approvedCount = payouts.filter(p => p.status === "approved").length;

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">Payouts</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Process vendor payments — approve, release & manage settlements
          </p>
        </div>

        {/* Urgent action prompt */}
        {(pendingCount > 0 || approvedCount > 0) && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200
            rounded-xl px-4 py-2.5 text-xs">
            <Wallet size={14} className="text-amber-600 flex-shrink-0" />
            <span className="font-bold text-amber-700">
              {pendingCount > 0 && `${pendingCount} pending`}
              {pendingCount > 0 && approvedCount > 0 && " · "}
              {approvedCount > 0 && `${approvedCount} ready to release`}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <PayoutStatsCards payouts={payouts} />

      {/* Batch action bar — shown when pending payouts exist */}
      {payouts.filter(p => p.status === "pending").length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl px-5 py-4
          flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-black text-sky-800">
              {payouts.filter(p => p.status === "pending").length} vendors waiting for approval
            </p>
            <p className="text-xs text-sky-600 mt-0.5">
              Total pending: ₹{payouts
                .filter(p => p.status === "pending")
                .reduce((s, p) => s + p.amount, 0)
                .toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={() => {
              const ids = payouts.filter(p => p.status === "pending").map(p => p.id);
              setPayouts(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: "approved" as const } : p));
              showToast(`${ids.length} payouts approved in batch.`);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white
              text-sm font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-200 flex-shrink-0">
            <CheckCircle2 size={15} /> Approve All Pending
          </button>
        </div>
      )}

      {/* Search + sort */}
      <PayoutSearchBar
        search={search}   onSearch={setSearch}
        sortBy={sortBy}   onSort={setSortBy}
      />

      {/* Status tabs + result count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PayoutStatusTabs
          payouts={payouts}
          activeTab={statusTab}
          onChange={setStatusTab}
        />
        <p className="text-xs text-slate-400 flex-shrink-0">
          Showing <strong className="text-slate-700">{filtered.length}</strong> payouts
        </p>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <Wallet size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-500">No payouts found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <PayoutCard
              key={p.id}
              payout={p}
              onView={() => setSelected(p)}
              onQuickApprove={() => handleQuickAction(p)}
            />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <PayoutDrawer
          payout={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onRelease={handleRelease}
          onHold={handleHold}
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
