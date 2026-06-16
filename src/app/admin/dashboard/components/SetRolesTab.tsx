// src/pages/admin/dashboard/components/SetRolesTab.tsx

import { useState } from "react";
import { Plus, Edit2, Trash2, Lock, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { ADMIN_ROLES, ALL_PERMISSIONS, type AdminRole, type Permission } from "../mockAdminData";
import SetSectionCard   from "./SetSectionCard";
import SetRoleFormModal from "./SetRoleFormModal";

const ROLE_COLOR: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500"     },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-500"  },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500"    },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400"   },
};

const PERM_CATEGORIES = [...new Set(ALL_PERMISSIONS.map(p => p.category))];

let nextRoleNum = 6;

export default function SetRolesTab() {
  const [roles,       setRoles]       = useState<AdminRole[]>([...ADMIN_ROLES]);
  const [showModal,   setShowModal]   = useState<"add" | "edit" | null>(null);
  const [editTarget,  setEditTarget]  = useState<AdminRole | null>(null);
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [deleteConf,  setDeleteConf]  = useState<string | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  function handleSave(data: Omit<AdminRole, "id" | "memberCount" | "isSystem" | "createdDate">) {
    if (showModal === "add") {
      const newRole: AdminRole = {
        id:          `ROLE${String(nextRoleNum++).padStart(3, "0")}`,
        memberCount: 0,
        isSystem:    false,
        createdDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        ...data,
      };
      setRoles(prev => [...prev, newRole]);
      showToast(`Role "${data.name}" created`);
    } else if (editTarget) {
      setRoles(prev => prev.map(r => r.id === editTarget.id ? { ...r, ...data } : r));
      showToast(`Role "${data.name}" updated`);
    }
    setShowModal(null); setEditTarget(null);
  }

  function handleDelete(id: string) {
    const r = roles.find(x => x.id === id);
    setRoles(prev => prev.filter(x => x.id !== id));
    setDeleteConf(null);
    showToast(`Role "${r?.name}" deleted`);
  }

  return (
    <div className="space-y-5">

      {/* Info banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-sky-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-sky-800">Role-Based Access Control</p>
          <p className="text-xs text-sky-600 mt-0.5">
            System roles (Super Admin) cannot be edited or deleted. Custom roles can be fully configured.
          </p>
        </div>
      </div>

      {/* Roles list */}
      <SetSectionCard title="All Roles"
        subtitle={`${roles.length} roles defined`}
        action={
          <button onClick={() => { setShowModal("add"); setEditTarget(null); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold
              rounded-xl hover:bg-sky-700 shadow-md shadow-sky-200">
            <Plus size={13} /> New Role
          </button>
        }>

        <div className="space-y-3">
          {roles.map(r => {
            const col       = ROLE_COLOR[r.color] ?? ROLE_COLOR.slate;
            const isOpen    = expanded === r.id;
            const catGroups = PERM_CATEGORIES.map(cat => ({
              cat,
              granted: ALL_PERMISSIONS.filter(p => p.category === cat && r.permissions.includes(p.key)),
              all:     ALL_PERMISSIONS.filter(p => p.category === cat),
            }));

            return (
              <div key={r.id} className={`border ${col.border} rounded-2xl overflow-hidden`}>
                {/* Role header */}
                <div className={`flex items-center gap-3 px-4 py-3.5 ${col.bg}`}>
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${col.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-black ${col.text}`}>{r.name}</p>
                      {r.isSystem && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5
                          rounded-full bg-white/60 text-slate-500">
                          <Lock size={9} /> System
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{r.memberCount} members</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{r.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!r.isSystem && (
                      <>
                        <button onClick={() => { setEditTarget(r); setShowModal("edit"); }}
                          className="p-1.5 rounded-lg hover:bg-white/60 text-slate-500 hover:text-sky-600 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        {r.memberCount === 0 && (
                          <button onClick={() => setDeleteConf(r.id)}
                            className="p-1.5 rounded-lg hover:bg-white/60 text-slate-500 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </>
                    )}
                    <button onClick={() => setExpanded(prev => prev === r.id ? null : r.id)}
                      className="p-1.5 rounded-lg hover:bg-white/60 text-slate-400 transition-colors">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Permission matrix (expanded) */}
                {isOpen && (
                  <div className="px-4 py-4 bg-white border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {catGroups.map(({ cat, granted, all }) => (
                        <div key={cat} className="bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-black text-slate-600">{cat}</p>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                              ${granted.length === all.length
                                ? "bg-emerald-100 text-emerald-700"
                                : granted.length > 0
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-200 text-slate-500"}`}>
                              {granted.length}/{all.length}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {all.map(p => (
                              <div key={p.key} className="flex items-center gap-2">
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0
                                  ${granted.some(g => g.key === p.key)
                                    ? "bg-sky-600 text-white"
                                    : "bg-slate-200 text-slate-400"}`}>
                                  {granted.some(g => g.key === p.key) ? "✓" : ""}
                                </span>
                                <span className={`text-xs ${granted.some(g => g.key === p.key) ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                                  {p.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                      Created: {r.createdDate} · {r.permissions.length}/{ALL_PERMISSIONS.length} permissions
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SetSectionCard>

      {/* Delete confirm */}
      {deleteConf && (() => {
        const r = roles.find(x => x.id === deleteConf);
        return (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <p className="text-sm font-black text-slate-800 mb-2">Delete "{r?.name}"?</p>
              <p className="text-xs text-slate-500 mb-4">This role has no members and will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConf(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">Cancel</button>
                <button onClick={() => handleDelete(deleteConf)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Role modal */}
      {showModal && (
        <SetRoleFormModal
          mode={showModal}
          role={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(null); setEditTarget(null); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]
          bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl whitespace-nowrap">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
