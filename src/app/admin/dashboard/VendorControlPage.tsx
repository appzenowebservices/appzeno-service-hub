// src/pages/admin/dashboard/VendorControlPage.tsx

import { useState, useMemo } from "react";
import { Store, CheckCircle2, XCircle } from "lucide-react";
import { MOCK_VENDORS, type VendorItem } from "../../agent/dashboard/mockAgentData";

import VendorStatsCards  from "./components/VendorStatsCards";
import VendorSearchBar   from "./components/VendorSearchBar";
import VendorFilterPanel from "./components/VendorFilterPanel";
import VendorStatusTabs  from "./components/VendorStatusTabs";
import VendorCard        from "./components/VendorCard";
import VendorDrawer      from "./components/VendorDrawer";
import type { VendorStatus } from "./components/VendorStatusBadge";

type TabKey = VendorStatus | "all";

export default function VendorControlPage() {
  const [vendors,      setVendors]      = useState<VendorItem[]>(MOCK_VENDORS);
  const [search,       setSearch]       = useState("");
  const [statusTab,    setStatusTab]    = useState<TabKey>("all");
  const [sortBy,       setSortBy]       = useState("rating");
  const [catFilter,    setCatFilter]    = useState("All");
  const [cityFilter,   setCityFilter]   = useState("All");
  const [kycFilter,    setKycFilter]    = useState("all");
  const [showFilter,   setShowFilter]   = useState(false);
  const [selected,     setSelected]     = useState<VendorItem | null>(null);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Actions ────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function handleSuspend(id: string) {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: "suspended" as const } : v));
    setSelected(prev => prev?.id === id ? { ...prev, status: "suspended" as const } : prev);
    showToast("Vendor suspended. Access restricted.", "error");
  }

  function handleActivate(id: string) {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: "active" as const } : v));
    setSelected(prev => prev?.id === id ? { ...prev, status: "active" as const } : prev);
    showToast("Vendor reactivated. Access restored.");
  }

  function handleDelete(id: string) {
    setVendors(prev => prev.filter(v => v.id !== id));
    setSelected(null);
    showToast("Vendor deleted permanently.", "error");
  }

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors
      .filter(v => {
        const matchSearch = !search ||
          v.name.toLowerCase().includes(q)       ||
          v.ownerName.toLowerCase().includes(q)  ||
          v.vendorId.toLowerCase().includes(q)   ||
          v.area.toLowerCase().includes(q)       ||
          v.category.toLowerCase().includes(q);
        const matchStatus = statusTab === "all" || v.status === statusTab;
        const matchCat    = catFilter  === "All" || v.category === catFilter;
        const matchCity   = cityFilter === "All" || v.city === cityFilter;
        const kycOk       = v.kycAadhaar && v.kycPan && v.kycPhoto && v.kycAddress;
        const matchKyc    = kycFilter === "all"
          ? true
          : kycFilter === "complete" ? kycOk : !kycOk;
        return matchSearch && matchStatus && matchCat && matchCity && matchKyc;
      })
      .sort((a, b) => {
        if (sortBy === "rating")   return b.rating        - a.rating;
        if (sortBy === "jobs")     return b.jobsDone      - a.jobsDone;
        if (sortBy === "earnings") return b.totalEarnings - a.totalEarnings;
        if (sortBy === "name")     return a.name.localeCompare(b.name);
        return 0;
      });
  }, [vendors, search, statusTab, catFilter, cityFilter, kycFilter, sortBy]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     vendors.length,
    active:    vendors.filter(v => v.status === "active").length,
    inactive:  vendors.filter(v => v.status === "inactive").length,
    suspended: vendors.filter(v => v.status === "suspended").length,
  }), [vendors]);

  const filtersActive = statusTab !== "all" || catFilter !== "All" || cityFilter !== "All" || kycFilter !== "all";

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-black text-slate-800">Vendor Control</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage all vendors — approvals, suspensions, KYC & performance
        </p>
      </div>

      {/* Stats */}
      <VendorStatsCards
        total={stats.total}       active={stats.active}
        inactive={stats.inactive} suspended={stats.suspended}
      />

      {/* Search + sort + filter toggle */}
      <VendorSearchBar
        search={search}          onSearch={setSearch}
        sortBy={sortBy}          onSort={setSortBy}
        showFilter={showFilter}  onToggleFilter={() => setShowFilter(s => !s)}
        filtersActive={filtersActive}
      />

      {/* Expandable filter panel */}
      {showFilter && (
        <VendorFilterPanel
          statusFilter={statusTab}  onStatusChange={v => setStatusTab(v as TabKey)}
          catFilter={catFilter}     onCatChange={setCatFilter}
          cityFilter={cityFilter}   onCityChange={setCityFilter}
          kycFilter={kycFilter}     onKycChange={setKycFilter}
          filtersActive={filtersActive}
          onClear={() => {
            setStatusTab("all");
            setCatFilter("All");
            setCityFilter("All");
            setKycFilter("all");
          }}
        />
      )}

      {/* Status tabs + result count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <VendorStatusTabs
          vendors={vendors}
          activeTab={statusTab}
          onChange={setStatusTab}
        />
        <p className="text-xs text-slate-400 flex-shrink-0">
          Showing <strong className="text-slate-700">{filtered.length}</strong> vendors
        </p>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <Store size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-500">No vendors found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map(v => (
            <VendorCard key={v.id} vendor={v} onView={() => setSelected(v)} />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <VendorDrawer
          vendor={selected}
          onClose={()       => setSelected(null)}
          onSuspend={handleSuspend}
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
            : <XCircle      size={15} className="text-red-300" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
