// src/pages/admin/dashboard/AgentManagementPage.tsx

import { useState, useMemo } from "react";
import { UserCheck, CheckCircle2, XCircle } from "lucide-react";
import { MOCK_AGENTS, type AgentRecord } from "./mockAdminData";
import type { AgentStatus, AgentPerformance } from "./components/AgentStatusBadge";

import AgentStatsCards  from "./components/AgentStatsCards";
import AgentSearchBar   from "./components/AgentSearchBar";
import AgentFilterPanel from "./components/AgentFilterPanel";
import AgentStatusTabs  from "./components/AgentStatusTabs";
import AgentCard        from "./components/AgentCard";
import AgentDrawer      from "./components/AgentDrawer";

type TabKey = AgentStatus | "all";

// 1 city unassigned = Varanasi (agent inactive, vendors=0)
const UNASSIGNED_CITIES = 1;

export default function AgentManagementPage() {
  const [agents,       setAgents]       = useState<AgentRecord[]>(MOCK_AGENTS);
  const [search,       setSearch]       = useState("");
  const [statusTab,    setStatusTab]    = useState<TabKey>("all");
  const [sortBy,       setSortBy]       = useState("leads");
  const [perfFilter,   setPerfFilter]   = useState<AgentPerformance | "all">("all");
  const [cityFilter,   setCityFilter]   = useState("All");
  const [showFilter,   setShowFilter]   = useState(false);
  const [selected,     setSelected]     = useState<AgentRecord | null>(null);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Actions ────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function handleDeactivate(id: string) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: "inactive" as const } : a));
    setSelected(prev => prev?.id === id ? { ...prev, status: "inactive" as const } : prev);
    showToast("Agent deactivated. No new assignments.", "error");
  }

  function handleActivate(id: string) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: "active" as const } : a));
    setSelected(prev => prev?.id === id ? { ...prev, status: "active" as const } : prev);
    showToast("Agent activated. Assignments restored.");
  }

  function handleDelete(id: string) {
    setAgents(prev => prev.filter(a => a.id !== id));
    setSelected(null);
    showToast("Agent deleted permanently.", "error");
  }

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return agents
      .filter(a => {
        const matchSearch = !search ||
          a.name.toLowerCase().includes(q)    ||
          a.agentId.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)   ||
          a.city.toLowerCase().includes(q);
        const matchStatus = statusTab   === "all" || a.status      === statusTab;
        const matchPerf   = perfFilter  === "all" || a.performance === perfFilter;
        const matchCity   = cityFilter  === "All" || a.city        === cityFilter;
        return matchSearch && matchStatus && matchPerf && matchCity;
      })
      .sort((a, b) => {
        if (sortBy === "leads")      return b.totalLeads  - a.totalLeads;
        if (sortBy === "vendors")    return b.vendors     - a.vendors;
        if (sortBy === "commission") return b.commission  - a.commission;
        if (sortBy === "disputes")   return b.disputesHandled - a.disputesHandled;
        if (sortBy === "name")       return a.name.localeCompare(b.name);
        return 0;
      });
  }, [agents, search, statusTab, perfFilter, cityFilter, sortBy]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    agents.length,
    active:   agents.filter(a => a.status === "active").length,
    inactive: agents.filter(a => a.status === "inactive").length,
  }), [agents]);

  const filtersActive = statusTab !== "all" || perfFilter !== "all" || cityFilter !== "All";

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-black text-slate-800">Agent Management</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage field agents — performance, city assignments & commission
        </p>
      </div>

      {/* Stats */}
      <AgentStatsCards
        total={stats.total}
        active={stats.active}
        inactive={stats.inactive}
        unassigned={UNASSIGNED_CITIES}
      />

      {/* Search + sort + filter toggle */}
      <AgentSearchBar
        search={search}          onSearch={setSearch}
        sortBy={sortBy}          onSort={setSortBy}
        showFilter={showFilter}  onToggleFilter={() => setShowFilter(s => !s)}
        filtersActive={filtersActive}
      />

      {/* Expandable filter panel */}
      {showFilter && (
        <AgentFilterPanel
          statusFilter={statusTab}   onStatusChange={v => setStatusTab(v as TabKey)}
          perfFilter={perfFilter}    onPerfChange={v => setPerfFilter(v as AgentPerformance | "all")}
          cityFilter={cityFilter}    onCityChange={setCityFilter}
          filtersActive={filtersActive}
          onClear={() => {
            setStatusTab("all");
            setPerfFilter("all");
            setCityFilter("All");
          }}
        />
      )}

      {/* Status tabs + result count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <AgentStatusTabs
          agents={agents}
          activeTab={statusTab}
          onChange={setStatusTab}
        />
        <p className="text-xs text-slate-400 flex-shrink-0">
          Showing <strong className="text-slate-700">{filtered.length}</strong> agents
        </p>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <UserCheck size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-500">No agents found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map(a => (
            <AgentCard key={a.id} agent={a} onView={() => setSelected(a)} />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <AgentDrawer
          agent={selected}
          onClose={()           => setSelected(null)}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          onDelete={handleDelete}
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
            : <XCircle      size={15} className="text-red-300"     />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
