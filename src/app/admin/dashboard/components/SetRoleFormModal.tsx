// src/pages/admin/dashboard/components/SetRoleFormModal.tsx

import { useState, useEffect } from "react";
import { X, Save, Shield } from "lucide-react";
import { ALL_PERMISSIONS, type AdminRole, type Permission } from "../mockAdminData";

const COLOR_OPTS = [
  { val: "sky",     cls: "bg-sky-500"    },
  { val: "violet",  cls: "bg-violet-500" },
  { val: "emerald", cls: "bg-emerald-500"},
  { val: "amber",   cls: "bg-amber-500"  },
  { val: "rose",    cls: "bg-rose-500"   },
  { val: "slate",   cls: "bg-slate-500"  },
];

const PERM_CATEGORIES = [...new Set(ALL_PERMISSIONS.map(p => p.category))];

interface Props {
  mode:     "add" | "edit";
  role?:    AdminRole | null;
  onSave:   (data: Omit<AdminRole, "id" | "memberCount" | "isSystem" | "createdDate">) => void;
  onClose:  () => void;
}

export default function SetRoleFormModal({ mode, role, onSave, onClose }: Props) {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [color,       setColor]       = useState("slate");
  const [perms,       setPerms]       = useState<Set<Permission>>(new Set());
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && role) {
      setName(role.name); setDescription(role.description);
      setColor(role.color); setPerms(new Set(role.permissions));
    } else {
      setName(""); setDescription(""); setColor("slate"); setPerms(new Set());
    }
    setErrors({});
  }, [mode, role]);

  function togglePerm(p: Permission) {
    setPerms(prev => { const s = new Set(prev); s.has(p) ? s.delete(p) : s.add(p); return s; });
  }

  function toggleCategory(cat: string) {
    const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat).map(p => p.key);
    const allOn    = catPerms.every(p => perms.has(p));
    setPerms(prev => {
      const s = new Set(prev);
      if (allOn) catPerms.forEach(p => s.delete(p));
      else       catPerms.forEach(p => s.add(p));
      return s;
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())      e.name  = "Role name is required";
    if (perms.size === 0)  e.perms = "Select at least one permission";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ name: name.trim(), description: description.trim(), color, permissions: [...perms] });
      setSaving(false);
    }, 600);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-in">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                <Shield size={14} className="text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">
                  {mode === "add" ? "Create New Role" : `Edit — ${role?.name}`}
                </p>
                <p className="text-xs text-slate-400">
                  {mode === "add" ? "Define name, color and permissions" : "Update role permissions"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

            {/* Name + Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Role Name *</label>
                <input value={name} onChange={e => { setName(e.target.value); setErrors(e2 => ({...e2, name:""})); }}
                  placeholder="e.g. Finance Manager"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2
                    ${errors.name ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Color Tag</label>
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_OPTS.map(c => (
                    <button key={c.val} onClick={() => setColor(c.val)}
                      className={`w-7 h-7 rounded-full ${c.cls} transition-all
                        ${color === c.val ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "opacity-60 hover:opacity-100"}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Short description of what this role can do"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200
                  focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
            </div>

            {/* Permission matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500">
                  Permissions ({perms.size} selected) *
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setPerms(new Set(ALL_PERMISSIONS.map(p => p.key)))}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700">Select All</button>
                  <button onClick={() => setPerms(new Set())}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600">Clear</button>
                </div>
              </div>
              {errors.perms && <p className="text-xs text-red-500 mb-2">{errors.perms}</p>}

              <div className="space-y-3">
                {PERM_CATEGORIES.map(cat => {
                  const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);
                  const allOn    = catPerms.every(p => perms.has(p.key));
                  const someOn   = catPerms.some(p => perms.has(p.key));
                  return (
                    <div key={cat} className="border border-slate-100 rounded-xl overflow-hidden">
                      {/* Category header */}
                      <button onClick={() => toggleCategory(cat)}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <span className="text-xs font-black text-slate-600">{cat}</span>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                          ${allOn ? "bg-sky-600 border-sky-600" : someOn ? "bg-sky-200 border-sky-400" : "border-slate-300"}`}>
                          {(allOn || someOn) && <span className="text-white text-xs leading-none">{allOn ? "✓" : "–"}</span>}
                        </div>
                      </button>
                      {/* Individual perms */}
                      <div className="divide-y divide-slate-50">
                        {catPerms.map(p => (
                          <label key={p.key}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 cursor-pointer transition-colors">
                            <input type="checkbox" checked={perms.has(p.key)}
                              onChange={() => togglePerm(p.key)}
                              className="w-4 h-4 rounded accent-sky-600 cursor-pointer" />
                            <span className="text-xs text-slate-700">{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold
                hover:bg-sky-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-sky-200">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Save size={14} /> {mode === "add" ? "Create Role" : "Save Role"}</>}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modal-in { from { transform:scale(0.95) translateY(8px);opacity:0; } to { transform:scale(1) translateY(0);opacity:1; } }
        .animate-modal-in { animation: modal-in 0.2s cubic-bezier(0.22,1,0.36,1); }
      `}</style>
    </>
  );
}
