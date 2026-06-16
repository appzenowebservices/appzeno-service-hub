// src/pages/customer/dashboard/pages/ProfilePage.tsx

import { useState } from "react";
import {
  User, Phone, Mail, MapPin, Shield, Camera, Edit3,
  Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Star,
  LogOut, ChevronRight, Smartphone
} from "lucide-react";
import { useAuthStore } from "../../../../../store/authStore";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [editing,   setEditing]   = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [activeSection, setActiveSection] = useState<"profile"|"security"|"preferences">("profile");

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    mobile:   user?.mobile   || "",
    email:    user?.email    || "",
    city:     user?.city     || "",
    address:  user?.address  || "",
  });

  const initials = (user?.fullName || "CU").split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className="mx-auto space-y-6">

      {/* ── Profile Hero Card ── */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-black border-2 border-white/30 shadow-xl">
              {user?.avatar || initials}
            </div>
            <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-cyan-50 transition-colors">
              <Camera size={14} className="text-cyan-600" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black">{user?.fullName}</h2>
            <p className="text-cyan-100 text-sm mt-0.5">Customer Account</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs bg-white/20 rounded-full px-2.5 py-1 font-mono">
                {user?.registrationId || "ADC-2026-001"}
              </span>
              <span className="flex items-center gap-1 text-xs bg-emerald-400/30 text-emerald-100 rounded-full px-2.5 py-1 font-semibold">
                <CheckCircle2 size={10} /> Verified
              </span>
            </div>
          </div>

          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white border border-white/30 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all flex-shrink-0">
            <Edit3 size={14} /> {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-5 pt-5 border-t border-white/20">
          {[
            { label:"Bookings",    value: user?.totalBookings || 8 },
            { label:"Completed",   value:6 },
            { label:"Rating Given",value:"4.7★" },
            { label:"Member Since",value:user?.createdAt?.slice(0,7) || "2026-01" },
          ].map(s => (
            <div key={s.label} className="flex-1 text-center">
              <p className="text-lg font-bold text-cyan-200">{s.value}</p>
              <p className="text-xs text-cyan-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section Tabs ── */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        {[
          { key:"profile",     label:"Personal Info" },
          { key:"security",    label:"Security" },
          { key:"preferences", label:"Preferences" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeSection === tab.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Personal Info ── */}
      {activeSection === "profile" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-slate-800">Personal Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label:"Full Name",  key:"fullName", icon:User,  type:"text" },
              { label:"Mobile",     key:"mobile",   icon:Phone, type:"tel" },
              { label:"Email",      key:"email",    icon:Mail,  type:"email" },
              { label:"City",       key:"city",     icon:MapPin,type:"text" },
            ].map(({ label, key, icon: Icon, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
                {editing ? (
                  <div className="relative">
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm
                                 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50 transition-all" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 rounded-xl">
                    <Icon size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{user?.[key as keyof typeof user] || "—"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Languages</label>
            <div className="flex flex-wrap gap-2">
              {(user?.languages || ["Hindi","English"]).map((l: string) => (
                <span key={l} className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-semibold">{l}</span>
              ))}
            </div>
          </div>

          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="w-full py-3 bg-cyan-500 text-white rounded-xl text-sm font-bold hover:bg-cyan-600 transition-colors">
              Save Changes
            </button>
          )}
        </div>
      )}

      {/* ── Security ── */}
      {activeSection === "security" && (
        <div className="space-y-4">
          {/* KYC Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">KYC & Verification</h3>
            <div className="space-y-3">
              {[
                { label:"Mobile Number", verified:true,  detail:user?.mobile || "+91 98765 43210" },
                { label:"Email Address", verified:true,  detail:user?.email  || "user@example.com" },
                { label:"Aadhaar/PAN",  verified:false,  detail:"Not submitted" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                    ${item.verified ? "bg-emerald-100" : "bg-slate-100"}`}>
                    {item.verified
                      ? <CheckCircle2 size={14} className="text-emerald-600" />
                      : <AlertCircle size={14} className="text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                  {!item.verified && (
                    <button className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 px-3 py-1 bg-cyan-50 rounded-lg">
                      Verify
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">Change Password</h3>
            {["Current Password","New Password","Confirm New Password"].map((lbl, i) => (
              <div key={lbl} className="mb-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lbl}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPw ? "text" : "password"} placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm
                               focus:outline-none focus:border-cyan-400 transition-all" />
                  {i === 1 && (
                    <button onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button className="w-full py-3 bg-cyan-500 text-white rounded-xl text-sm font-bold hover:bg-cyan-600 transition-colors mt-2">
              Update Password
            </button>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Smartphone size={16} className="text-slate-500" /> Active Sessions
            </h3>
            {[
              { device:"Chrome · Windows 11",        ip:"192.168.1.1",  time:"Now — Current",    current:true },
              { device:"Safari · iPhone 14",          ip:"192.168.1.2",  time:"Yesterday 9:42 AM",current:false },
            ].map(s => (
              <div key={s.device} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.device}</p>
                  <p className="text-xs text-slate-400">{s.ip} · {s.time}</p>
                </div>
                {s.current
                  ? <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  : <button className="text-xs text-red-500 font-semibold hover:text-red-600">Revoke</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Preferences ── */}
      {activeSection === "preferences" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">App Preferences</h3>
            <div className="space-y-4">
              {[
                { label:"SMS Notifications",   sub:"Get booking updates via SMS",    on:true },
                { label:"WhatsApp Alerts",      sub:"Vendor updates on WhatsApp",     on:true },
                { label:"Email Digest",         sub:"Weekly summary of bookings",     on:false },
                { label:"Promotional Offers",   sub:"Deals, coupons, and cashback",   on:true },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{pref.label}</p>
                    <p className="text-xs text-slate-400">{pref.sub}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer
                    ${pref.on ? "bg-cyan-500" : "bg-slate-200"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm mt-0.5 transition-transform
                      ${pref.on ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="font-bold text-red-700 mb-3">Danger Zone</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-800">Delete Account</p>
                  <p className="text-xs text-red-500">Permanently remove your data</p>
                </div>
                <button className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-800">Logout of all devices</p>
                  <p className="text-xs text-red-500">Revoke all active sessions</p>
                </div>
                <button onClick={() => logout()}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                  Logout All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
