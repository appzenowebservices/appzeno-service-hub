// src/pages/admin/dashboard/components/SetSecurityTab.tsx

import { useState } from "react";
import { Key, Shield, Monitor, Smartphone, Globe, CheckCircle2,
         XCircle, AlertTriangle, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { LOGIN_HISTORY, IP_WHITELIST, type IPWhitelistEntry } from "../mockAdminData";
import SetSectionCard from "./SetSectionCard";
import SetIPModal     from "./SetIPModal";

const LOGIN_CFG = {
  success: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", icon: CheckCircle2, label: "Success" },
  failed:  { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400",     icon: XCircle,      label: "Failed"  },
  blocked: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   icon: AlertTriangle,label: "Blocked" },
};

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile")  return <Smartphone size={14} className="text-slate-400" />;
  if (device === "Desktop") return <Monitor    size={14} className="text-slate-400" />;
  return <Globe size={14} className="text-slate-400" />;
}

export default function SetSecurityTab() {
  // Password change
  const [pwd, setPwd]         = useState({ current: "", newPwd: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [pwdErr, setPwdErr]   = useState("");
  const [pwdSaved, setPwdSaved] = useState(false);

  // 2FA
  const [twoFA, setTwoFA]     = useState(true);
  const [twofaConf, setTwofaConf] = useState(false);

  // IP whitelist
  const [ipList, setIpList]   = useState<IPWhitelistEntry[]>([...IP_WHITELIST]);
  const [showIPModal, setShowIPModal] = useState(false);
  const [ipToDelete,  setIpToDelete]  = useState<string | null>(null);

  // Toast
  const [toast, setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2500);
  }

  // Password change handler
  function handlePasswordChange() {
    if (!pwd.current)              return setPwdErr("Enter your current password");
    if (pwd.newPwd.length < 8)     return setPwdErr("New password must be at least 8 characters");
    if (pwd.newPwd !== pwd.confirm) return setPwdErr("Passwords don't match");
    setPwdErr("");
    setPwdSaved(true);
    setPwd({ current: "", newPwd: "", confirm: "" });
    setTimeout(() => setPwdSaved(false), 3000);
    showToast("Password changed successfully");
  }

  // Add IP
  function addIP(ip: string, label: string) {
    const newEntry: IPWhitelistEntry = {
      id:        `IP${String(ipList.length + 1).padStart(3, "0")}`,
      ip, label,
      addedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      addedBy:   "Rajesh Gupta",
      active:    true,
    };
    setIpList(prev => [...prev, newEntry]);
    setShowIPModal(false);
    showToast(`IP ${ip} whitelisted`);
  }

  // Toggle IP active
  function toggleIP(id: string) {
    setIpList(prev => prev.map(ip => ip.id === id ? { ...ip, active: !ip.active } : ip));
  }

  // Delete IP
  function deleteIP(id: string) {
    const ip = ipList.find(x => x.id === id);
    setIpList(prev => prev.filter(x => x.id !== id));
    setIpToDelete(null);
    showToast(`${ip?.ip} removed from whitelist`, "error");
  }

  return (
    <div className="space-y-5">

      {/* Change Password */}
      <SetSectionCard title="Change Password" subtitle="Use a strong, unique password for your admin account">
        <div className="max-w-md space-y-4">
          {[
            { key: "current", label: "Current Password" },
            { key: "newPwd",  label: "New Password"     },
            { key: "confirm", label: "Confirm New Password" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPwd[key as keyof typeof showPwd] ? "text" : "password"}
                  value={pwd[key as keyof typeof pwd]}
                  onChange={e => { setPwd(p => ({ ...p, [key]: e.target.value })); setPwdErr(""); }}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl
                    focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
                <button
                  onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd[key as keyof typeof showPwd]
                    ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {pwdErr && (
            <p className="text-xs text-red-500 font-medium">{pwdErr}</p>
          )}

          <button onClick={handlePasswordChange}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white text-sm font-bold
              rounded-xl hover:bg-sky-700 transition-colors shadow-md shadow-sky-200">
            <Key size={14} />
            {pwdSaved ? "✓ Password Changed!" : "Change Password"}
          </button>

          {/* Password strength note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-600 mb-1">Password Requirements</p>
            <p>• Minimum 8 characters</p>
            <p>• Use uppercase, lowercase, numbers and symbols</p>
            <p>• Don't reuse last 5 passwords</p>
          </div>
        </div>
      </SetSectionCard>

      {/* 2FA */}
      <SetSectionCard title="Two-Factor Authentication (2FA)"
        subtitle="Add extra security layer — required for Super Admin actions">
        <div className="flex items-center justify-between max-w-lg gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-0.5">
              {twoFA ? "2FA is Enabled" : "2FA is Disabled"}
            </p>
            <p className="text-xs text-slate-400">
              {twoFA
                ? "Your account is protected. OTP sent to +91 98765 XXXXX on login."
                : "Enable 2FA to protect your Super Admin account."}
            </p>
          </div>
          {twofaConf ? (
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-red-600">Confirm?</p>
              <button onClick={() => { setTwoFA(!twoFA); setTwofaConf(false); showToast(twoFA ? "2FA disabled" : "2FA enabled"); }}
                className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700">Yes</button>
              <button onClick={() => setTwofaConf(false)}
                className="px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg text-slate-600">No</button>
            </div>
          ) : (
            <button
              onClick={() => setTwofaConf(true)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer
                ${twoFA ? "bg-sky-600" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
                ${twoFA ? "left-5" : "left-0.5"}`} />
            </button>
          )}
        </div>
      </SetSectionCard>

      {/* Login History */}
      <SetSectionCard title="Login History" subtitle="Recent admin portal access — last 30 days">
        <div className="space-y-2.5">
          {LOGIN_HISTORY.map(ev => {
            const cfg = LOGIN_CFG[ev.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={ev.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border flex-wrap sm:flex-nowrap
                  ${ev.status !== "success" ? `${cfg.bg} border-${ev.status === "failed" ? "red" : "amber"}-200` : "border-slate-100"}`}>
                <DeviceIcon device={ev.device} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-bold text-slate-700">{ev.date} · {ev.time}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      <StatusIcon size={10} /> {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {ev.location} · {ev.device} · {ev.browser}
                  </p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{ev.ip}</p>
                </div>
                {ev.status !== "success" && (
                  <AlertTriangle size={14} className={ev.status === "failed" ? "text-red-500" : "text-amber-500"} />
                )}
              </div>
            );
          })}
        </div>
      </SetSectionCard>

      {/* IP Whitelist */}
      <SetSectionCard title="IP Whitelist"
        subtitle="Only whitelisted IPs can access the admin portal"
        action={
          <button onClick={() => setShowIPModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold
              rounded-xl hover:bg-sky-700 shadow-md shadow-sky-200">
            <Plus size={13} /> Add IP
          </button>
        }>
        <div className="space-y-2.5">
          {ipList.map(ip => (
            <div key={ip.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all
                ${ip.active ? "border-slate-100 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
              <Shield size={14} className={ip.active ? "text-sky-600" : "text-slate-400"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono font-bold text-slate-800">{ip.ip}</p>
                  {!ip.active && (
                    <span className="text-xs text-slate-400">(disabled)</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{ip.label} · Added {ip.addedDate}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle */}
                <button onClick={() => toggleIP(ip.id)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer
                    ${ip.active ? "bg-sky-600" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200
                    ${ip.active ? "left-4" : "left-0.5"}`} />
                </button>
                {/* Delete */}
                <button onClick={() => setIpToDelete(ip.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SetSectionCard>

      {/* IP delete confirm */}
      {ipToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <p className="text-sm font-black text-slate-800 mb-2">
              Remove {ipList.find(x => x.id === ipToDelete)?.ip}?
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Admin access from this IP will be blocked immediately.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIpToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">Cancel</button>
              <button onClick={() => deleteIP(ipToDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* IP modal */}
      {showIPModal && <SetIPModal onSave={addIP} onClose={() => setShowIPModal(false)} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]
          text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl whitespace-nowrap
          ${toast.type === "success" ? "bg-emerald-700" : "bg-red-700"}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}
    </div>
  );
}
