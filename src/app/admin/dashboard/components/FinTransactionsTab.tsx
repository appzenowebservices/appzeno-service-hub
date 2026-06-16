// src/pages/admin/dashboard/components/FinTransactionsTab.tsx

import { useState, useMemo } from "react";
import { Search, X, Filter, ChevronRight, ArrowUpDown } from "lucide-react";
import { TRANSACTIONS, type Transaction } from "../mockAdminData";
import FinTransactionDrawer from "./FinTransactionDrawer";

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  booking:      { bg: "bg-sky-100",     text: "text-sky-700",    label: "Booking"      },
  payout:       { bg: "bg-amber-100",   text: "text-amber-700",  label: "Payout"       },
  commission:   { bg: "bg-violet-100",  text: "text-violet-700", label: "Commission"   },
  refund:       { bg: "bg-red-100",     text: "text-red-700",    label: "Refund"       },
  subscription: { bg: "bg-emerald-100", text: "text-emerald-700",label: "Subscription" },
  penalty:      { bg: "bg-rose-100",    text: "text-rose-700",   label: "Penalty"      },
};

const STATUS_BADGE: Record<string, { dot: string; text: string; label: string }> = {
  completed: { dot: "bg-emerald-400", text: "text-emerald-700", label: "Completed" },
  pending:   { dot: "bg-amber-400",   text: "text-amber-700",   label: "Pending"   },
  failed:    { dot: "bg-red-400",     text: "text-red-700",     label: "Failed"    },
  refunded:  { dot: "bg-slate-400",   text: "text-slate-500",   label: "Refunded"  },
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.abs(n).toLocaleString()}`;
}

export default function FinTransactionsTab() {
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statFilter, setStatFilter] = useState("all");
  const [sortBy,     setSortBy]     = useState("date_desc");
  const [selected,   setSelected]   = useState<Transaction | null>(null);

  const TYPE_OPTS = ["all", "booking", "payout", "commission", "refund", "subscription", "penalty"];
  const STAT_OPTS = ["all", "completed", "pending", "failed", "refunded"];
  const SORT_OPTS = [
    { value: "date_desc",   label: "Newest First"    },
    { value: "date_asc",    label: "Oldest First"    },
    { value: "amount_desc", label: "Highest Amount"  },
    { value: "amount_asc",  label: "Lowest Amount"   },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TRANSACTIONS
      .filter(t =>
        (typeFilter === "all" || t.type === typeFilter) &&
        (statFilter === "all" || t.status === statFilter) &&
        (!search || t.txnId.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) ||
          t.vendor.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q) || t.city.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (sortBy === "date_desc")   return b.id.localeCompare(a.id);
        if (sortBy === "date_asc")    return a.id.localeCompare(b.id);
        if (sortBy === "amount_desc") return b.grossAmount - a.grossAmount;
        return a.grossAmount - b.grossAmount;
      });
  }, [search, typeFilter, statFilter, sortBy]);

  const totalAmt = filtered
    .filter(t => t.status === "completed")
    .reduce((s, t) => s + t.grossAmount, 0);

  return (
    <div className="space-y-4">

      {/* Filters bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
        {/* Search + Sort */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search TxnID, vendor, customer, city…"
              className="w-full pl-10 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl
                focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>
          <div className="relative">
            <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="pl-8 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl appearance-none
                cursor-pointer focus:outline-none focus:border-sky-400 font-medium text-slate-700 bg-white">
              {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Type filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <Filter size={13} className="text-slate-400 flex-shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_OPTS.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all
                  ${typeFilter === t
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-sky-300"}`}>
                {t === "all" ? "All Types" : TYPE_BADGE[t]?.label ?? t}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap ml-auto">
            {STAT_OPTS.map(s => (
              <button key={s} onClick={() => setStatFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all
                  ${statFilter === s
                    ? "bg-slate-700 text-white border-slate-700"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
                {s === "all" ? "All Status" : STATUS_BADGE[s]?.label ?? s}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{filtered.length} transactions</span>
          <span>Completed total: <strong className="text-emerald-700">{fmt(totalAmt)}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-400">
                <th className="px-4 py-3 font-bold">Txn ID</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Description</th>
                <th className="px-4 py-3 font-bold">Vendor</th>
                <th className="px-4 py-3 font-bold">City</th>
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 font-bold text-right">Gross</th>
                <th className="px-4 py-3 font-bold text-right">Fee</th>
                <th className="px-4 py-3 font-bold text-right">Net</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-16 text-slate-400 text-sm font-bold">
                    No transactions match your filters
                  </td>
                </tr>
              ) : filtered.map(t => {
                const type   = TYPE_BADGE[t.type] ?? TYPE_BADGE.booking;
                const status = STATUS_BADGE[t.status] ?? STATUS_BADGE.completed;
                return (
                  <tr key={t.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60
                      transition-colors cursor-pointer"
                    onClick={() => setSelected(t)}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">{t.txnId}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${type.bg} ${type.text}`}>
                        {type.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{t.description}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">
                      {t.vendor !== "—" ? t.vendor : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{t.city}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3 font-black text-slate-800 text-right whitespace-nowrap">
                      {fmt(t.grossAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-violet-600 font-bold whitespace-nowrap">
                      {t.platformFee > 0 ? fmt(t.platformFee) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                      {fmt(t.netAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 font-bold ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={14} className="text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <FinTransactionDrawer txn={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
