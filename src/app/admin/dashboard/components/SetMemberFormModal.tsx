// src/pages/admin/dashboard/components/SetMemberFormModal.tsx

import { useState, useEffect } from "react";
import { X, Save, UserPlus } from "lucide-react";
import { ADMIN_ROLES, type AdminMember } from "../mockAdminData";

interface Props {
  mode:     "invite" | "edit";
  member?:  AdminMember | null;
  onSave:   (data: Partial<AdminMember>) => void;
  onClose:  () => void;
}

export default function SetMemberFormModal({ mode, member, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name:       "", email:      "", phone:  "",
    roleId:     "ROLE004", department: "Support",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && member) {
      setForm({
        name:       member.name,
        email:      member.email,
        phone:      member.phone,
        roleId:     member.roleId,
        department: member.department,
      });
    }
    setErrors({});
  }, [mode, member]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.email.includes("@")) e.email = "Enter valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const role = ADMIN_ROLES.find(r => r.id === form.roleId);
    setTimeout(() => {
      onSave({
        name:       form.name.trim(),
        email:      form.email.trim(),
        phone:      form.phone.trim(),
        roleId:     form.roleId,
        roleName:   role?.name ?? "",
        department: form.department,
        status:     mode === "invite" ? "invited" : member?.status ?? "active",
      });
      setSaving(false);
    }, 600);
  }

  const DEPARTMENTS = ["Management","Operations","Finance","Support","Analytics","Engineering"];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">

          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                <UserPlus size={14} className="text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">
                  {mode === "invite" ? "Invite Team Member" : `Edit — ${member?.name}`}
                </p>
                <p className="text-xs text-slate-400">
                  {mode === "invite" ? "Send access invite to a new admin" : "Update role and details"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Priya Sharma"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all
                  focus:outline-none focus:ring-2
                  ${errors.name ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Email Address *</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                type="email" placeholder="name@addies.in"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all
                  focus:outline-none focus:ring-2
                  ${errors.email ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"}`} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Phone Number</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 9XXXXXXXXX"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200
                  focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
            </div>
            {/* Role */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Role *</label>
                <select value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200
                    focus:outline-none focus:border-sky-400 appearance-none cursor-pointer bg-white text-slate-700">
                  {ADMIN_ROLES.filter(r => !r.isSystem).map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Department</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200
                    focus:outline-none focus:border-sky-400 appearance-none cursor-pointer bg-white text-slate-700">
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Role preview */}
            {(() => {
              const role = ADMIN_ROLES.find(r => r.id === form.roleId);
              return role ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                  <p className="font-bold text-slate-700 mb-1">{role.name}</p>
                  <p className="text-slate-400">{role.description}</p>
                  <p className="mt-1.5 text-slate-500">{role.permissions.length} permissions granted</p>
                </div>
              ) : null;
            })()}
          </div>

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
                : <><UserPlus size={14} /> {mode === "invite" ? "Send Invite" : "Save Changes"}</>}
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
