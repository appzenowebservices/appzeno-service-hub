// src/pages/admin/dashboard/FinancePage.tsx

import { useState } from "react";
import {
  LayoutDashboard, ArrowLeftRight, BarChart2, PieChart, FileText,
  Download, RefreshCw,
} from "lucide-react";
import type { Period } from "./mockAdminData";

import FinStatsBar        from "./components/FinStatsBar";
import FinOverviewTab     from "./components/FinOverviewTab";
import FinTransactionsTab from "./components/FinTransactionsTab";
import FinPLTab           from "./components/FinPLTab";
import FinBreakdownTab    from "./components/FinBreakdownTab";
import FinGSTTab          from "./components/FinGSTTab";

type TabKey = "overview" | "transactions" | "pl" | "breakdown" | "gst";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview",     label: "Overview",      icon: LayoutDashboard },
  { key: "transactions", label: "Transactions",  icon: ArrowLeftRight  },
  { key: "pl",           label: "P&L",           icon: BarChart2       },
  { key: "breakdown",    label: "Breakdown",      icon: PieChart        },
  { key: "gst",          label: "GST",            icon: FileText        },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: "day",   label: "Today"  },
  { value: "week",  label: "Week"   },
  { value: "month", label: "Month"  },
  { value: "year",  label: "Year"   },
];

export default function FinancePage() {
  const [tab,    setTab]    = useState<TabKey>("overview");
  const [period, setPeriod] = useState<Period>("month");
  const [syncing, setSyncing] = useState(false);

  function handleSync() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1400);
  }

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">Finance</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Revenue, payouts, P&L, GST and full transaction history
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${period === p.value
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"}`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Sync */}
          <button onClick={handleSync}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border
              border-slate-200 text-slate-500 text-xs font-bold hover:border-sky-400
              hover:text-sky-600 transition-all">
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Refresh"}
          </button>

          {/* Export */}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600
            text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-200">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* KPI strip — period-aware */}
      <FinStatsBar period={period} />

      {/* Main tab navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1 border-b border-slate-200">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap
                flex-shrink-0 border-b-2 transition-all -mb-px
                ${active
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300"}`}>
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[500px]">
        {tab === "overview"     && <FinOverviewTab     period={period} />}
        {tab === "transactions" && <FinTransactionsTab                />}
        {tab === "pl"           && <FinPLTab                          />}
        {tab === "breakdown"    && <FinBreakdownTab                   />}
        {tab === "gst"          && <FinGSTTab                         />}
      </div>
    </div>
  );
}
