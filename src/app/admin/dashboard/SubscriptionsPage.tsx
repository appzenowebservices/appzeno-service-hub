// src/pages/admin/dashboard/SubscriptionsPage.tsx

import { useState, useMemo } from "react";
import { Plus, CheckCircle2, XCircle, IndianRupee, Users, RefreshCw, AlertTriangle } from "lucide-react";
import {
  SUBSCRIPTION_PLANS, PLAN_SUBSCRIBERS, EXPIRING_RENEWALS,
  type SubscriptionPlan,
} from "./mockAdminData";

import SubStatsCards    from "./components/SubStatsCards";
import SubRevenueChart  from "./components/SubRevenueChart";
import SubExpiringBanner from "./components/SubExpiringBanner";
import SubPlanCard      from "./components/SubPlanCard";
import SubDrawer        from "./components/SubDrawer";
import SubPlanFormModal from "./components/SubPlanFormModal";

function nextId(plans: SubscriptionPlan[]): string {
  const nums = plans.map(p => parseInt(p.id.replace("SP", ""), 10)).filter(Boolean);
  const next  = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `SP${String(next).padStart(3, "0")}`;
}

export default function SubscriptionsPage() {
  const [plans,      setPlans]      = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS);
  const [selected,   setSelected]   = useState<SubscriptionPlan | null>(null);
  const [modalMode,  setModalMode]  = useState<"add" | "edit">("add");
  const [editTarget, setEditTarget] = useState<SubscriptionPlan | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  function handleAdd() {
    setModalMode("add"); setEditTarget(null); setShowModal(true);
  }
  function handleEdit(plan?: SubscriptionPlan) {
    const target = plan ?? selected;
    if (!target) return;
    setModalMode("edit"); setEditTarget(target);
    setSelected(null); setShowModal(true);
  }
  function handleSave(data: Omit<SubscriptionPlan, "id" | "subscribers">) {
    if (modalMode === "add") {
      const newPlan: SubscriptionPlan = { id: nextId(plans), subscribers: 0, ...data };
      setPlans(prev => [...prev, newPlan]);
      showToast(`"${data.name}" plan created successfully! 🎉`);
    } else if (editTarget) {
      setPlans(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...data } : p));
      showToast(`"${data.name}" updated successfully.`);
    }
    setShowModal(false);
  }
  function handleToggle(id: string) {
    const plan = plans.find(p => p.id === id);
    setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    setSelected(prev => prev?.id === id ? { ...prev, active: !prev.active } : prev);
    showToast(
      plan?.active ? `"${plan.name}" deactivated.` : `"${plan?.name}" activated.`,
      plan?.active ? "error" : "success",
    );
  }
  function handleDelete(id: string) {
    const plan = plans.find(p => p.id === id);
    setPlans(prev => prev.filter(p => p.id !== id));
    setSelected(null);
    showToast(`"${plan?.name}" plan deleted.`, "error");
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalSubs = 0, mrr = 0, cancelled = 0;
    plans.forEach(p => {
      const subs = PLAN_SUBSCRIBERS[p.id] ?? [];
      const active = subs.filter(s => s.status === "active" || s.status === "expiring_soon");
      totalSubs += active.length;
      mrr       += active.length * p.price;
      cancelled += subs.filter(s => s.status === "cancelled").length;
    });
    const expiring = EXPIRING_RENEWALS.filter(r => !r.autoRenew && r.daysLeft <= 30).length;
    return { mrr, totalSubs, expiring, cancelled };
  }, [plans]);

  // Plan comparison data for overview table
  const comparisonRows = useMemo(() => plans.map(p => {
    const subs      = PLAN_SUBSCRIBERS[p.id] ?? [];
    const active    = subs.filter(s => s.status === "active" || s.status === "expiring_soon").length;
    const cancelled = subs.filter(s => s.status === "cancelled").length;
    const expiring  = subs.filter(s => s.status === "expiring_soon").length;
    return { plan: p, active, cancelled, expiring, mrr: active * p.price };
  }), [plans]);

  const maxMRR = Math.max(...comparisonRows.map(r => r.mrr), 1);

  const COLOR_DOT: Record<string, string> = {
    blue: "bg-sky-400", violet: "bg-violet-500", amber: "bg-amber-500",
    rose: "bg-rose-500", emerald: "bg-emerald-500",
  };

  function fmtRev(n: number) {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Subscriptions</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage vendor plans, track MRR and renewals
          </p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl
            text-sm font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-200 flex-shrink-0">
          <Plus size={16} /> New Plan
        </button>
      </div>

      {/* Expiring alert banner */}
      <SubExpiringBanner />

      {/* KPI cards */}
      <SubStatsCards
        mrr={stats.mrr}
        totalSubs={stats.totalSubs}
        expiringSoon={stats.expiring}
        cancelled={stats.cancelled}
      />

      {/* Revenue chart + Plan comparison — 2 cols on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Revenue chart */}
        <SubRevenueChart />

        {/* Plan comparison table */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="mb-5">
            <p className="text-sm font-black text-slate-800">Plan Comparison</p>
            <p className="text-xs text-slate-400 mt-0.5">Subscribers & MRR by plan</p>
          </div>

          <div className="space-y-4">
            {comparisonRows.map(({ plan: p, active, cancelled, expiring, mrr }) => (
              <div key={p.id}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLOR_DOT[p.color] ?? "bg-slate-400"}`} />
                    <span className="font-bold text-slate-700">{p.name}</span>
                    {!p.active && (
                      <span className="text-slate-400 font-normal">(inactive)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {active}
                    </span>
                    <span className="font-black text-slate-800">{fmtRev(mrr)}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${COLOR_DOT[p.color] ?? "bg-slate-400"}`}
                    style={{ width: `${Math.round((mrr / maxMRR) * 100)}%`, opacity: p.active ? 1 : 0.4 }}
                  />
                </div>
                {(expiring > 0 || cancelled > 0) && (
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    {expiring > 0 && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle size={10} /> {expiring} expiring
                      </span>
                    )}
                    {cancelled > 0 && (
                      <span className="flex items-center gap-1 text-slate-400">
                        {cancelled} cancelled
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total MRR footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total MRR</span>
            <span className="text-lg font-black text-emerald-600">{fmtRev(stats.mrr)}</span>
          </div>
        </div>
      </div>

      {/* All renewal alerts — small summary table */}
      {EXPIRING_RENEWALS.some(r => !r.autoRenew) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={16} className="text-slate-400" />
            <p className="text-sm font-black text-slate-800">Upcoming Renewals</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ml-auto">
              Next 30 days
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-bold pr-4">Vendor</th>
                  <th className="pb-2 font-bold pr-4">Plan</th>
                  <th className="pb-2 font-bold pr-4">City</th>
                  <th className="pb-2 font-bold pr-4">Renewal</th>
                  <th className="pb-2 font-bold pr-4">Amount</th>
                  <th className="pb-2 font-bold">Auto-Renew</th>
                </tr>
              </thead>
              <tbody>
                {EXPIRING_RENEWALS.map((r, i) => (
                  <tr key={i} className={`border-b border-slate-50 last:border-0
                    ${r.daysLeft === 0 ? "bg-red-50/40" : r.daysLeft <= 7 && !r.autoRenew ? "bg-amber-50/40" : ""}`}>
                    <td className="py-2.5 pr-4 font-bold text-slate-700">{r.vendorName}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{r.planName}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{r.city}</td>
                    <td className="py-2.5 pr-4">
                      <span className={r.daysLeft === 0 ? "text-red-600 font-bold" : r.daysLeft <= 7 ? "text-amber-600 font-bold" : "text-slate-500"}>
                        {r.renewalDate}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-black text-slate-700">₹{r.amount.toLocaleString()}</td>
                    <td className="py-2.5">
                      {r.autoRenew
                        ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <RefreshCw size={10} /> Yes
                          </span>
                        : <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                            <AlertTriangle size={10} /> No
                          </span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan cards grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-black text-slate-700">
            All Plans
            <span className="ml-2 text-xs font-bold text-slate-400">{plans.length} plans</span>
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map(p => (
            <SubPlanCard
              key={p.id}
              plan={p}
              onView={() => setSelected(p)}
              onEdit={() => handleEdit(p)}
              onToggle={handleToggle}
            />
          ))}
          {/* Add plan card */}
          <button onClick={handleAdd}
            className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8
              hover:border-sky-300 hover:bg-sky-50 transition-all group flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200
              group-hover:border-sky-300 flex items-center justify-center transition-colors">
              <Plus size={20} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
            </div>
            <p className="text-sm font-bold text-slate-400 group-hover:text-sky-600 transition-colors">
              Add New Plan
            </p>
          </button>
        </div>
      </div>

      {/* Drawer */}
      {selected && (
        <SubDrawer
          plan={selected}
          onClose={() => setSelected(null)}
          onEdit={() => handleEdit(selected)}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
      {showModal && (
        <SubPlanFormModal
          mode={modalMode}
          initial={editTarget}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
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
            : <XCircle size={15} className="text-red-300" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
