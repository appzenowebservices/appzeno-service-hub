// src/pages/admin/dashboard/UserManagementPage.tsx

import { useState, useMemo } from "react";
import { Users, CheckCircle2, XCircle } from "lucide-react";
import { MOCK_CUSTOMERS, type CustomerRecord } from "./mockAdminData";
import UserStatsCards  from "./components/UserStatsCards";
import UserSearchBar   from "./components/UserSearchBar";
import UserFilterPanel from "./components/UserFilterPanel";
import UserCard        from "./components/UserCard";
import UserDrawer      from "./components/UserDrawer";

export default function UserManagementPage() {
  const [customers,    setCustomers]    = useState<CustomerRecord[]>(MOCK_CUSTOMERS);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [cityFilter,   setCityFilter]   = useState("All");
  const [sortBy,       setSortBy]       = useState("bookings");
  const [showFilter,   setShowFilter]   = useState(false);
  const [selected,     setSelected]     = useState<CustomerRecord | null>(null);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Actions ────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function handleBlock(id: string) {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: "blocked" as const } : c));
    setSelected(prev  => prev?.id === id ? { ...prev, status: "blocked" as const } : prev);
    showToast("User blocked successfully.", "error");
  }

  function handleUnblock(id: string) {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: "active" as const } : c));
    setSelected(prev  => prev?.id === id ? { ...prev, status: "active" as const } : prev);
    showToast("User unblocked. Access restored.");
  }

  function handleDelete(id: string) {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setSelected(null);
    showToast("Account deleted permanently.", "error");
  }

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers
      .filter(c => {
        const matchSearch = !search ||
          c.name.toLowerCase().includes(q)         ||
          c.customerId.toLowerCase().includes(q)   ||
          c.phone.includes(q)                      ||
          c.email.toLowerCase().includes(q);
        const matchStatus = statusFilter === "all" || c.status === statusFilter;
        const matchCity   = cityFilter   === "All" || c.city   === cityFilter;
        return matchSearch && matchStatus && matchCity;
      })
      .sort((a, b) => {
        if (sortBy === "name")     return a.name.localeCompare(b.name);
        if (sortBy === "bookings") return b.totalBookings - a.totalBookings;
        if (sortBy === "spend")    return b.totalSpend    - a.totalSpend;
        return 0;
      });
  }, [customers, search, statusFilter, cityFilter, sortBy]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = {
    total:   customers.length,
    active:  customers.filter(c => c.status === "active").length,
    blocked: customers.filter(c => c.status === "blocked").length,
    today:   customers.filter(c => c.lastActive === "Today").length,
  };

  const filtersActive = statusFilter !== "all" || cityFilter !== "All";

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-black text-slate-800">User Management</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage all registered customers across the platform
        </p>
      </div>

      {/* Stats */}
      <UserStatsCards
        total={stats.total}   active={stats.active}
        blocked={stats.blocked} today={stats.today}
      />

      {/* Search + sort + filter toggle */}
      <UserSearchBar
        search={search}          onSearch={setSearch}
        sortBy={sortBy}          onSort={setSortBy}
        showFilter={showFilter}  onToggleFilter={() => setShowFilter(s => !s)}
        filtersActive={filtersActive}
      />

      {/* Expandable filter panel */}
      {showFilter && (
        <UserFilterPanel
          statusFilter={statusFilter}  onStatusChange={v => setStatusFilter(v as any)}
          cityFilter={cityFilter}      onCityChange={setCityFilter}
          filtersActive={filtersActive}
          onClear={() => { setStatusFilter("all"); setCityFilter("All"); }}
        />
      )}

      {/* Status tabs + result count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { key: "all",     label: "All",     count: customers.length },
            { key: "active",  label: "Active",  count: stats.active     },
            { key: "blocked", label: "Blocked", count: stats.blocked    },
          ].map(t => (
            <button key={t.key}
              onClick={() => setStatusFilter(t.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                ${statusFilter === t.key
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"}`}>
              {t.label}
              <span className={`text-xs font-black px-1.5 py-0.5 rounded-full
                ${statusFilter === t.key ? "bg-sky-100 text-sky-700" : "bg-white text-slate-500"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Showing <strong className="text-slate-700">{filtered.length}</strong> users
        </p>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <Users size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-500">No users found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {filtered.map(c => (
            <UserCard key={c.id} customer={c} onView={() => setSelected(c)} />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <UserDrawer
          customer={selected}
          onClose={()  => setSelected(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
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
