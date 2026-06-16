// src/pages/admin/dashboard/CategoriesPage.tsx

import { useState, useMemo } from "react";
import { FolderOpen, CheckCircle2, XCircle, Plus } from "lucide-react";
import { CATEGORY_PERF, type CategoryPerf } from "./mockAdminData";

import CatStatsCards  from "./components/CatStatsCards";
import CatSearchBar   from "./components/CatSearchBar";
import CatFilterPanel from "./components/CatFilterPanel";
import CatStatusTabs  from "./components/CatStatusTabs";
import CatCard        from "./components/CatCard";
import CatDrawer      from "./components/CatDrawer";
import CatFormModal   from "./components/CatFormModal";

type TabKey    = "all" | "active" | "inactive";
type ModalMode = "add" | "edit";

// Generate next ID from existing list
function nextId(cats: CategoryPerf[]): string {
  const nums = cats.map(c => parseInt(c.id.replace("CAT", ""), 10)).filter(Boolean);
  const next  = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `CAT${String(next).padStart(3, "0")}`;
}

export default function CategoriesPage() {
  const [categories,  setCategories]  = useState<CategoryPerf[]>(CATEGORY_PERF);
  const [search,      setSearch]      = useState("");
  const [statusTab,   setStatusTab]   = useState<TabKey>("all");
  const [sortBy,      setSortBy]      = useState("revenue");
  const [showFilter,  setShowFilter]  = useState(false);
  const [selected,    setSelected]    = useState<CategoryPerf | null>(null);
  const [modalMode,   setModalMode]   = useState<ModalMode>("add");
  const [editTarget,  setEditTarget]  = useState<CategoryPerf | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [toast,       setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Toast helper ───────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  // ── CRUD actions ───────────────────────────────────────────────────────────
  function handleAdd() {
    setModalMode("add");
    setEditTarget(null);
    setShowModal(true);
  }

  function handleEdit(cat?: CategoryPerf) {
    const target = cat ?? selected;
    if (!target) return;
    setModalMode("edit");
    setEditTarget(target);
    setShowModal(true);
    if (selected) setSelected(null); // close drawer first
  }

  function handleSave(data: Omit<CategoryPerf, "id" | "vendors" | "bookings" | "revenue" | "growth">) {
    if (modalMode === "add") {
      const newCat: CategoryPerf = {
        id:       nextId(categories),
        vendors:  0,
        bookings: 0,
        revenue:  0,
        growth:   0,
        ...data,
      };
      setCategories(prev => [...prev, newCat]);
      showToast(`"${data.name}" category added successfully.`);
    } else if (editTarget) {
      setCategories(prev =>
        prev.map(c => c.id === editTarget.id ? { ...c, ...data } : c)
      );
      showToast(`"${data.name}" updated successfully.`);
    }
    setShowModal(false);
  }

  function handleToggle(id: string) {
    setCategories(prev =>
      prev.map(c => c.id === id ? { ...c, active: !c.active } : c)
    );
    setSelected(prev =>
      prev?.id === id ? { ...prev, active: !prev.active } : prev
    );
    const cat = categories.find(c => c.id === id);
    showToast(
      cat?.active ? `"${cat.name}" deactivated.` : `"${cat?.name}" activated.`,
      cat?.active ? "error" : "success"
    );
  }

  function handleDelete(id: string) {
    const cat = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    setSelected(null);
    showToast(`"${cat?.name}" deleted permanently.`, "error");
  }

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories
      .filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(q);
        const matchStatus =
          statusTab === "all"      ? true :
          statusTab === "active"   ? c.active :
                                     !c.active;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "revenue")  return b.revenue  - a.revenue;
        if (sortBy === "bookings") return b.bookings - a.bookings;
        if (sortBy === "vendors")  return b.vendors  - a.vendors;
        if (sortBy === "growth")   return b.growth   - a.growth;
        return a.name.localeCompare(b.name);
      });
  }, [categories, search, statusTab, sortBy]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      categories.length,
    active:     categories.filter(c =>  c.active).length,
    inactive:   categories.filter(c => !c.active).length,
    topRevenue: Math.max(...categories.map(c => c.revenue), 0),
  }), [categories]);

  const maxRevenue    = Math.max(...categories.map(c => c.revenue), 1);
  const filtersActive = statusTab !== "all";

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Categories</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage service categories — add, edit, activate or deactivate
          </p>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl
            text-sm font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-200 flex-shrink-0">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Stats */}
      <CatStatsCards
        total={stats.total}
        active={stats.active}
        inactive={stats.inactive}
        topRevenue={stats.topRevenue}
      />

      {/* Search + sort + filter toggle */}
      <CatSearchBar
        search={search}          onSearch={setSearch}
        sortBy={sortBy}          onSort={setSortBy}
        showFilter={showFilter}  onToggleFilter={() => setShowFilter(s => !s)}
        filtersActive={filtersActive}
      />

      {/* Filter panel */}
      {showFilter && (
        <CatFilterPanel
          statusFilter={statusTab}
          onStatusChange={v => setStatusTab(v as TabKey)}
          filtersActive={filtersActive}
          onClear={() => setStatusTab("all")}
        />
      )}

      {/* Status tabs + count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <CatStatusTabs
          categories={categories}
          activeTab={statusTab}
          onChange={setStatusTab}
        />
        <p className="text-xs text-slate-400 flex-shrink-0">
          Showing <strong className="text-slate-700">{filtered.length}</strong> categories
        </p>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <FolderOpen size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-500">No categories found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or add a new category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <CatCard
              key={c.id}
              category={c}
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
        <CatDrawer
          category={selected}
          onClose={()       => setSelected(null)}
          onEdit={() => handleEdit(selected)}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <CatFormModal
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
            : <XCircle      size={15} className="text-red-300"     />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
