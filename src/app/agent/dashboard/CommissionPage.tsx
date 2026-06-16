// src/pages/agent/dashboard/CommissionPage.tsx

import { useState } from "react";
import {
  IndianRupee, TrendingUp, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Download, Copy, Users,
  Calendar, Briefcase, BarChart2, AlertCircle,
  CreditCard, ArrowUpRight, Wallet, Info,
} from "lucide-react";
import {
  MOCK_PAYOUTS, MONTHLY_COMMISSION,
  getCommission, getStats,
} from "./mockAgentData";
import PeriodSelector, { type Period } from "./components/PeriodSelector";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYOUT_STATUS = {
  credited:   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", label: "Credited"   },
  processing: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400",    label: "Processing" },
  on_hold:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   label: "On Hold"    },
};

function fmt(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: typeof MONTHLY_COMMISSION }) {
  const max = Math.max(...data.map(d => d.agentShare));
  return (
    <div className="flex items-end gap-2 h-24 px-1">
      {[...data].reverse().map((d, i) => {
        const pct = max > 0 ? (d.agentShare / max) * 100 : 0;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex flex-col justify-end" style={{ height: "80px" }}>
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex
                bg-slate-800 text-white text-2xs font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                {fmt(d.agentShare)}
              </div>
              <div
                className={`w-full rounded-t-lg transition-all ${i === data.length - 1 ? "bg-violet-500" : "bg-violet-200"}`}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
            </div>
            <p className="text-2xs text-slate-400 truncate w-full text-center"
              style={{ fontSize: "9px" }}>{d.month.split(" ")[0]}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Payout Row ───────────────────────────────────────────────────────────────
function PayoutRow({ payout, expanded, onToggle }: {
  payout:   typeof MOCK_PAYOUTS[0];
  expanded: boolean;
  onToggle: () => void;
}) {
  const st = PAYOUT_STATUS[payout.status];
  const [copied, setCopied] = useState(false);

  function copyRef() {
    if (!payout.upiRef) return;
    navigator.clipboard.writeText(payout.upiRef).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${payout.status === "processing" ? "border-blue-200" : "border-slate-100"}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors rounded-2xl">
        {/* Status dot */}
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${st.dot}`} />

        {/* Period */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{payout.period}</p>
          <p className="text-xs text-slate-400 mt-0.5">{payout.date}</p>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-black text-slate-800">{fmt(payout.amount)}</p>
          <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
            {st.label}
          </span>
        </div>

        {expanded
          ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0 ml-1" />
          : <ChevronDown size={14} className="text-slate-400 flex-shrink-0 ml-1" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Jobs",          value: payout.jobs.toString() },
              { label: "Gross Revenue", value: fmt(payout.grossRevenue) },
              { label: "Your Share",    value: fmt(payout.amount) },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xs text-slate-400 mb-0.5">{item.label}</p>
                <p className="text-xs font-black text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>

          {/* UPI ref */}
          {payout.upiRef && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <CreditCard size={13} className="text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-2xs text-emerald-500">UPI Reference</p>
                <p className="text-xs font-bold text-emerald-800 truncate">{payout.upiRef}</p>
              </div>
              <button onClick={copyRef}
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-2xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                <Copy size={10} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {payout.status === "processing" && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
              <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">Weekly settlement is being processed. Usually credited within 24–48 hours.</p>
            </div>
          )}

          {payout.status === "on_hold" && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Payout on hold. Contact support for details.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommissionPage() {
  const [period,        setPeriod]        = useState<Period>("month");
  const [expandedPayout,setExpandedPayout]= useState<string | null>("PY001");
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "payouts" | "history">("overview");

  const commission = getCommission(period);
  const stats      = getStats(period);

  const creditedPct = commission.agentShare > 0
    ? Math.round((commission.creditedAmount / commission.agentShare) * 100)
    : 0;

  const displayedMonths = showAllMonths ? MONTHLY_COMMISSION : MONTHLY_COMMISSION.slice(0, 3);

  const totalCredited = MOCK_PAYOUTS.filter(p => p.status === "credited").reduce((s, p) => s + p.amount, 0);
  const totalPending  = MOCK_PAYOUTS.filter(p => p.status !== "credited").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">Commission & Earnings</h2>
          <p className="text-sm text-slate-400 mt-0.5">Your 5% share of platform earnings from your city</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* ── Hero Commission Card ── */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl overflow-hidden text-white">
        <div className="p-6">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Your Commission</p>
              <p className="text-4xl font-black text-amber-400 tracking-tight">
                {fmt(commission.agentShare)}
              </p>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                5% of ₹{commission.platformTotal.toLocaleString("en-IN")} platform fee
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp size={16} />
                <span className="text-lg font-black">+{creditedPct}%</span>
              </div>
              <p className="text-xs text-slate-400">credited so far</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Credited  {fmt(commission.creditedAmount)}</span>
              <span className="text-slate-400">Pending  {fmt(commission.pendingAmount)}</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${creditedPct}%` }}
              />
            </div>
          </div>

          {/* 3 pills */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/8 rounded-xl p-3 text-center">
              <p className="text-2xs text-slate-400 mb-1">Gross Revenue</p>
              <p className="text-sm font-black">{fmt(commission.totalGross)}</p>
            </div>
            <div className="bg-emerald-500/20 rounded-xl p-3 text-center border border-emerald-400/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 size={10} className="text-emerald-400" />
                <p className="text-2xs text-emerald-300">Credited</p>
              </div>
              <p className="text-sm font-black text-emerald-400">{fmt(commission.creditedAmount)}</p>
            </div>
            <div className="bg-amber-500/20 rounded-xl p-3 text-center border border-amber-400/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock size={10} className="text-amber-400" />
                <p className="text-2xs text-amber-300">Pending</p>
              </div>
              <p className="text-sm font-black text-amber-400">{fmt(commission.pendingAmount)}</p>
            </div>
          </div>
        </div>

        {/* Vendor breakdown toggle */}
        <div className="border-t border-white/10">
          <div className="px-5 py-3">
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-300">Top Vendors by Contribution</span>
            </div>
            <div className="space-y-2">
              {commission.vendors.map((v, i) => {
                const pct = commission.totalGross > 0
                  ? Math.round((v.gross / commission.totalGross) * 100) : 0;
                return (
                  <div key={v.name} className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-500 w-4 flex-shrink-0">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-slate-300 truncate">{v.name}</p>
                        <span className="text-xs font-black text-amber-400 flex-shrink-0 ml-2">+{fmt(v.agentEarned)}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-2xs text-slate-500 mt-0.5">{v.jobs} jobs · {fmt(v.gross)} gross · {pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Tabs ── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: "overview", label: "Overview"       },
          { key: "payouts",  label: "Payouts"        },
          { key: "history",  label: "Month History"  },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveSection(t.key as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
              ${activeSection === t.key
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          OVERVIEW SECTION
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === "overview" && (
        <div className="space-y-4">

          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label:  "Total Jobs",
                value:  stats.completedJobs,
                sub:    "Completed this period",
                icon:   Briefcase,
                color:  "text-violet-600",
                bg:     "bg-violet-50",
                border: "border-violet-200",
              },
              {
                label:  "Active Vendors",
                value:  stats.activeVendors,
                sub:    `of ${stats.totalVendors} total vendors`,
                icon:   Users,
                color:  "text-blue-600",
                bg:     "bg-blue-50",
                border: "border-blue-200",
              },
              {
                label:  "Platform Revenue",
                value:  fmt(stats.platformRevenue),
                sub:    `${fmt(stats.totalRevenue)} gross revenue`,
                icon:   BarChart2,
                color:  "text-emerald-600",
                bg:     "bg-emerald-50",
                border: "border-emerald-200",
              },
              {
                label:  "All-Time Credited",
                value:  fmt(totalCredited),
                sub:    `${fmt(totalPending)} awaiting`,
                icon:   Wallet,
                color:  "text-amber-600",
                bg:     "bg-amber-50",
                border: "border-amber-200",
              },
            ].map(({ label, value, sub, icon: Icon, color, bg, border }) => (
              <div key={label} className={`bg-white rounded-2xl border-2 ${border} p-4 hover:shadow-md transition-shadow`}>
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{sub}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">Monthly Commission Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                <TrendingUp size={14} />
                Growing 📈
              </div>
            </div>
            <MiniBarChart data={MONTHLY_COMMISSION} />
          </div>

          {/* Commission formula explainer */}
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
            <h3 className="text-sm font-black text-violet-800 mb-3 flex items-center gap-2">
              <Info size={15} /> How Your Commission is Calculated
            </h3>
            <div className="space-y-2">
              {[
                { step: "1", label: "Customer pays for service",        example: `e.g. ₹1,000` },
                { step: "2", label: "Platform takes 20% as fee",        example: `→ ₹200` },
                { step: "3", label: "You earn 5% of platform fee",       example: `→ ₹10` },
                { step: "4", label: "Credited weekly every Saturday",    example: `UPI transfer` },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-200 text-violet-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </div>
                  <p className="text-xs text-violet-800 flex-1">{s.label}</p>
                  <p className="text-xs font-bold text-violet-600 flex-shrink-0">{s.example}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
          PAYOUTS SECTION
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === "payouts" && (
        <div className="space-y-4">

          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Credited",  value: fmt(totalCredited), color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
              { label: "Processing",      value: fmt(MOCK_PAYOUTS.filter(p => p.status === "processing").reduce((s, p) => s + p.amount, 0)), color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
              { label: "On Hold",         value: fmt(MOCK_PAYOUTS.filter(p => p.status === "on_hold").reduce((s, p) => s + p.amount, 0)),    color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
            ].map(c => (
              <div key={c.label} className={`${c.bg} border-2 ${c.border} rounded-2xl p-4 text-center`}>
                <p className="text-2xs text-slate-500 mb-1">{c.label}</p>
                <p className={`text-lg font-black ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Payout info banner */}
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Calendar size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Payouts are processed every <strong>Saturday</strong> at 6:00 PM.
              Minimum threshold: <strong>₹200</strong>. Directly credited to your registered UPI ID.
            </p>
          </div>

          {/* Payout list */}
          <div className="space-y-3">
            {MOCK_PAYOUTS.map(p => (
              <PayoutRow
                key={p.id}
                payout={p}
                expanded={expandedPayout === p.id}
                onToggle={() => setExpandedPayout(expandedPayout === p.id ? null : p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
          MONTH HISTORY SECTION
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === "history" && (
        <div className="space-y-4">

          {/* Table header */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-6 gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100">
              {["Month", "Jobs", "Gross Revenue", "Platform Fee", "Your Share", "Status"].map(h => (
                <p key={h} className="text-2xs font-black text-slate-400 uppercase tracking-wide">{h}</p>
              ))}
            </div>

            {/* Data rows */}
            <div className="divide-y divide-slate-50">
              {displayedMonths.map((m, i) => (
                <div key={m.month}
                  className={`grid grid-cols-6 gap-2 px-5 py-4 items-center hover:bg-slate-50 transition-colors
                    ${i === 0 ? "bg-violet-50/50" : ""}`}>
                  <p className={`text-xs font-bold ${i === 0 ? "text-violet-700" : "text-slate-800"}`}>
                    {m.month}
                    {i === 0 && <span className="ml-1.5 text-2xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">Current</span>}
                  </p>
                  <p className="text-xs font-semibold text-slate-600">{m.jobs}</p>
                  <p className="text-xs font-semibold text-slate-600">{fmt(m.grossRevenue)}</p>
                  <p className="text-xs font-semibold text-slate-600">{fmt(m.platformFee)}</p>
                  <p className={`text-xs font-black ${i === 0 ? "text-amber-600" : "text-emerald-700"}`}>
                    {fmt(m.agentShare)}
                  </p>
                  <div>
                    {m.pending > 0 ? (
                      <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        ₹{m.pending.toLocaleString("en-IN")} pending
                      </span>
                    ) : (
                      <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Settled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Show more */}
            {MONTHLY_COMMISSION.length > 3 && (
              <div className="px-5 py-3 border-t border-slate-100">
                <button onClick={() => setShowAllMonths(s => !s)}
                  className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                  {showAllMonths
                    ? <><ChevronUp size={13} /> Show Less</>
                    : <><ChevronDown size={13} /> Show All {MONTHLY_COMMISSION.length} Months</>}
                </button>
              </div>
            )}
          </div>

          {/* Summary stats */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-black text-slate-800 mb-4">6-Month Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Jobs",
                  value: MONTHLY_COMMISSION.reduce((s, m) => s + m.jobs, 0).toLocaleString("en-IN"),
                  icon: Briefcase,
                  color: "text-violet-600",
                },
                {
                  label: "Total Gross Revenue",
                  value: fmt(MONTHLY_COMMISSION.reduce((s, m) => s + m.grossRevenue, 0)),
                  icon: BarChart2,
                  color: "text-blue-600",
                },
                {
                  label: "Total Platform Fee",
                  value: fmt(MONTHLY_COMMISSION.reduce((s, m) => s + m.platformFee, 0)),
                  icon: ArrowUpRight,
                  color: "text-emerald-600",
                },
                {
                  label: "Total Commission Earned",
                  value: fmt(MONTHLY_COMMISSION.reduce((s, m) => s + m.agentShare, 0)),
                  icon: IndianRupee,
                  color: "text-amber-600",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center">
                  <Icon size={18} className={`${color} mx-auto mb-2`} />
                  <p className={`text-lg font-black ${color}`}>{value}</p>
                  <p className="text-2xs text-slate-400 mt-0.5 leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
