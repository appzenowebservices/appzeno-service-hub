// src/pages/admin/dashboard/components/SetTeamTab.tsx

import { useState } from "react";
import { UserPlus, Edit2, Ban, Trash2, Mail, Phone, Shield,
         CheckCircle2, Clock, XCircle } from "lucide-react";
import { ADMIN_MEMBERS, ADMIN_ROLES, type AdminMember } from "../mockAdminData";
import SetSectionCard from "./SetSectionCard";
import SetMemberFormModal from "./SetMemberFormModal";

const STATUS_CFG = {
  active:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Active",    icon: CheckCircle2 },
  suspended: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400",     label: "Suspended", icon: Ban          },
  invited:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Invited",   icon: Clock        },
};

const ROLE_COLOR: Record<string, string> = {
  sky: "bg-sky-100 text-sky-700", violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-600",
};

export default function SetTeamTab() {
  const [members, setMembers] = useState<AdminMember[]>([...ADMIN_MEMBERS]);
  const [showModal, setShowModal] = useState<"invite" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<AdminMember | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "suspend" | "activate" | "remove" } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  function handleSave(data: Partial<AdminMember>) {
    if (showModal === "invite") {
      const newMember: AdminMember = {
        id: `ADM${String(members.length + 1).padStart(3, "0")}`,
        avatar:     (data.name ?? "?").charAt(0).toUpperCase(),
        lastLogin:  "—",
        joinedDate: "—",
        twoFA:      false,
        status:     "invited",
        ...data,
      } as AdminMember;
      setMembers(prev => [...prev, newMember]);
      showToast(`Invite sent to ${data.name}`);
    } else if (editTarget) {
      setMembers(prev => prev.map(m => m.id === editTarget.id ? { ...m, ...data } : m));
      showToast(`${data.name} updated`);
    }
    setShowModal(null); setEditTarget(null);
  }

  function doAction() {
    if (!confirmAction) return;
    const { id, action } = confirmAction;
    const m = members.find(x => x.id === id);
    if (action === "suspend")   { setMembers(prev => prev.map(x => x.id === id ? { ...x, status: "suspended" } : x)); showToast(`${m?.name} suspended`); }
    if (action === "activate")  { setMembers(prev => prev.map(x => x.id === id ? { ...x, status: "active" }    : x)); showToast(`${m?.name} reactivated`); }
    if (action === "remove")    { setMembers(prev => prev.filter(x => x.id !== id)); showToast(`${m?.name} removed`); }
    setConfirmAction(null);
  }

  const byStatus = (s: AdminMember["status"]) => members.filter(m => m.status === s);
  const totalActive = byStatus("active").length;

  return (
    <div className="space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Members",  val: byStatus("active").length,    bg: "bg-emerald-50", color: "text-emerald-700" },
          { label: "Pending Invites", val: byStatus("invited").length,   bg: "bg-amber-50",   color: "text-amber-700"   },
          { label: "Suspended",       val: byStatus("suspended").length, bg: "bg-red-50",     color: "text-red-700"     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Team list */}
      <SetSectionCard title="Admin Team"
        subtitle={`${totalActive} active members across all roles`}
        action={
          <button onClick={() => { setShowModal("invite"); setEditTarget(null); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold
              rounded-xl hover:bg-sky-700 shadow-md shadow-sky-200">
            <UserPlus size={13} /> Invite Member
          </button>
        }>

        <div className="space-y-3">
          {members.map(m => {
            const role   = ADMIN_ROLES.find(r => r.id === m.roleId);
            const sCfg   = STATUS_CFG[m.status];
            const StatusIcon = sCfg.icon;
            const roleCls = ROLE_COLOR[role?.color ?? "slate"] ?? ROLE_COLOR.slate;
            const isSelf  = m.id === "ADM001"; // Super Admin can't be edited

            return (
              <div key={m.id}
                className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-colors flex-wrap sm:flex-nowrap">

                {/* Avatar */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                  text-white font-black text-base flex-shrink-0
                  ${m.status === "suspended" ? "bg-slate-400" : "bg-sky-600"}`}>
                  {m.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-black text-slate-800">{m.name}</p>
                    {isSelf && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">You</span>
                    )}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleCls}`}>
                      {m.roleName}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${sCfg.bg} ${sCfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                      {sCfg.label}
                    </span>
                    {m.twoFA && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                        <Shield size={9} /> 2FA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><Mail size={10}/> {m.email}</span>
                    <span className="flex items-center gap-1"><Phone size={10}/> {m.phone}</span>
                    <span>{m.department}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {m.status === "invited" ? "Invite pending" : `Last login: ${m.lastLogin}`}
                  </p>
                </div>

                {/* Actions */}
                {!isSelf && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => { setEditTarget(m); setShowModal("edit"); }}
                      className="p-2 rounded-xl hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                      title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmAction({ id: m.id, action: m.status === "active" ? "suspend" : "activate" })}
                      className={`p-2 rounded-xl transition-colors
                        ${m.status === "active"
                          ? "hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                          : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"}`}
                      title={m.status === "active" ? "Suspend" : "Activate"}>
                      {m.status === "active" ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                    </button>
                    <button
                      onClick={() => setConfirmAction({ id: m.id, action: "remove" })}
                      className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SetSectionCard>

      {/* Confirm dialog */}
      {confirmAction && (() => {
        const m = members.find(x => x.id === confirmAction.id);
        return (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <p className="text-sm font-black text-slate-800 mb-2">
                {confirmAction.action === "remove" ? `Remove ${m?.name}?` :
                 confirmAction.action === "suspend" ? `Suspend ${m?.name}?` : `Reactivate ${m?.name}?`}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                {confirmAction.action === "remove"   ? "This will permanently remove their admin access." :
                 confirmAction.action === "suspend"  ? "They won't be able to log in until reactivated." :
                 "They will regain full access based on their role."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">
                  Cancel
                </button>
                <button onClick={doAction}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                    ${confirmAction.action === "remove" ? "bg-red-600 hover:bg-red-700" :
                      confirmAction.action === "suspend" ? "bg-amber-600 hover:bg-amber-700" :
                      "bg-emerald-600 hover:bg-emerald-700"}`}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modals */}
      {showModal && (
        <SetMemberFormModal
          mode={showModal}
          member={editTarget}
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
