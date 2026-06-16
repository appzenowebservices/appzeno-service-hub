// src/pages/admin/dashboard/CitiesPage.tsx

import { useState, useMemo } from "react";
import { MapPin, CheckCircle2, XCircle, Plus } from "lucide-react";
import { CITY_DATA, type CityData } from "./mockAdminData";

import CityStatsCards  from "./components/CityStatsCards";
import CitySearchBar   from "./components/CitySearchBar";
import CityFilterPanel from "./components/CityFilterPanel";
import CityStatusTabs  from "./components/CityStatusTabs";
import CityCard        from "./components/CityCard";
import CityDrawer      from "./components/CityDrawer";
import CityFormModal   from "./components/CityFormModal";

type TabKey    = "all" | "active" | "inactive";
type ModalMode = "add" | "edit";

function nextId(cities: CityData[]): string {
  const nums = cities.map(c => parseInt(c.id.replace("C", ""), 10)).filter(Boolean);
  const next  = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `C${String(next).padStart(3, "0")}`;
}

export default function CitiesPage() {
  const [cities,      setCities]      = useState<CityData[]>(CITY_DATA);
  const [search,      setSearch]      = useState("");
  const [statusTab,   setStatusTab]   = useState<TabKey>("all");
  const [sortBy,      setSortBy]      = useState("revenue");
  const [showFilter,  setShowFilter]  = useState(false);
  const [selected,    setSelected]    = useState<CityData | null>(null);
  const [modalMode,   setModalMode]   = useState<ModalMode>("add");
  const [editTarget,  setEditTarget]  = useState<CityData | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [toast,       setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  function handleAdd() {
    setModalMode("add");
    setEditTarget(null);
    setShowModal(true);
  }

  function handleEdit(city?: CityData) {
    const target = city ?? selected;
    if (!target) return;
    setModalMode("edit");
    setEditTarget(target);
    setSelected(null); // close drawer
    setShowModal(true);
  }

  function handleSave(data: Omit<CityData, "id" | "vendors" | "customers" | "bookings" | "revenue" | "growth" | "topCategory">) {
    if (modalMode === "add") {
      const newCity: CityData = {
        id:          nextId(cities),
        vendors:     0,
        customers:   0,
        bookings:    0,
        revenue:     0,
        growth:      0,
        topCategory: "—",
        ...data,
      };
      setCities(prev => [...prev, newCity]);
      showToast(`"${data.name}" added successfully! 🎉`);
    } else if (editTarget) {
      setCities(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...data } : c));
      showToast(`"${data.name}" updated successfully.`);
    }
    setShowModal(false);
  }

  function handleToggle(id: string) {
    const city = cities.find(c => c.id === id);
    setCities(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    setSelected(prev => prev?.id === id ? { ...prev, active: !prev.active } : prev);
    showToast(
      city?.active ? `"${city.name}" deactivated.` : `"${city?.name}" activated.`,
      city?.active ? "error" : "success"
    );
  }

  function handleDelete(id: string) {
    const city = cities.find(c => c.id === id);
    setCities(prev => prev.filter(c => c.id !== id));
    setSelected(null);
    showToast(`"${city?.name}" deleted permanently.`, "error");
  }

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cities
      .filter(c => {
        const matchSearch = !search ||
          c.name.toLowerCase().includes(q)     ||
          c.state.toLowerCase().includes(q)    ||
          c.district.toLowerCase().includes(q) ||
          c.pincode.includes(q);
        const matchStatus =
          statusTab === "all"      ? true :
          statusTab === "active"   ? c.active : !c.active;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "revenue")   return b.revenue   - a.revenue;
        if (sortBy === "bookings")  return b.bookings  - a.bookings;
        if (sortBy === "vendors")   return b.vendors   - a.vendors;
        if (sortBy === "customers") return b.customers - a.customers;
        if (sortBy === "growth")    return b.growth    - a.growth;
        return a.name.localeCompare(b.name);
      });
  }, [cities, search, statusTab, sortBy]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    cities.length,
    active:   cities.filter(c =>  c.active).length,
    inactive: cities.filter(c => !c.active).length,
    totalRev: cities.filter(c => c.active).reduce((s, c) => s + c.revenue, 0),
  }), [cities]);

  const maxRevenue    = Math.max(...cities.map(c => c.revenue), 1);
  const filtersActive = statusTab !== "all";

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">City Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Add cities via pincode — details auto-fill instantly
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl
            text-sm font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-200 flex-shrink-0">
          <Plus size={16} /> Add City
        </button>
      </div>

      {/* Stats */}
      <CityStatsCards
        total={stats.total}
        active={stats.active}
        inactive={stats.inactive}
        totalRev={stats.totalRev}
      />

      {/* Search + sort + filter toggle */}
      <CitySearchBar
        search={search}          onSearch={setSearch}
        sortBy={sortBy}          onSort={setSortBy}
        showFilter={showFilter}  onToggleFilter={() => setShowFilter(s => !s)}
        filtersActive={filtersActive}
      />

      {/* Filter panel */}
      {showFilter && (
        <CityFilterPanel
          statusFilter={statusTab}
          onStatusChange={v => setStatusTab(v as TabKey)}
          filtersActive={filtersActive}
          onClear={() => setStatusTab("all")}
        />
      )}

      {/* Status tabs + count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <CityStatusTabs
          cities={cities}
          activeTab={statusTab}
          onChange={setStatusTab}
        />
        <p className="text-xs text-slate-400 flex-shrink-0">
          Showing <strong className="text-slate-700">{filtered.length}</strong> cities
        </p>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <MapPin size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-500">No cities found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search or{" "}
            <button onClick={handleAdd} className="text-sky-600 font-bold hover:underline">
              add a new city
            </button>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <CityCard
              key={c.id}
              city={c}
              maxRevenue={maxRevenue}
              onView={() => setSelected(c)}
              onEdit={() => handleEdit(c)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <CityDrawer
          city={selected}
          onClose={() => setSelected(null)}
          onEdit={() => handleEdit(selected)}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <CityFormModal
          mode={modalMode}
          initial={editTarget}
          existing={cities}
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
            : <XCircle      size={15} className="text-red-300"     />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
