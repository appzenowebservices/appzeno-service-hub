// src/pages/admin/dashboard/components/SetNotifTab.tsx

import { useState } from "react";
import { Save, Mail, MessageSquare, Smartphone, Bell } from "lucide-react";
import { NOTIF_PREFERENCES, type NotifPreference } from "../mockAdminData";
import SetSectionCard from "./SetSectionCard";

type Channel = "email" | "sms" | "push" | "inApp";

const CHANNELS: { key: Channel; label: string; icon: React.ElementType; color: string }[] = [
  { key: "email", label: "Email",  icon: Mail,          color: "text-sky-600"     },
  { key: "sms",   label: "SMS",    icon: MessageSquare, color: "text-amber-600"   },
  { key: "push",  label: "Push",   icon: Smartphone,    color: "text-violet-600"  },
  { key: "inApp", label: "In-App", icon: Bell,          color: "text-emerald-600" },
];

function SmallToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0
        ${value ? "bg-sky-600" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200
        ${value ? "left-4" : "left-0.5"}`} />
    </button>
  );
}

export default function SetNotifTab() {
  const [prefs,  setPrefs]  = useState<NotifPreference[]>([...NOTIF_PREFERENCES]);
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = [...new Set(prefs.map(p => p.category))];

  function toggle(id: string, channel: Channel) {
    setPrefs(prev => prev.map(p =>
      p.id === id ? { ...p, [channel]: !p[channel] } : p
    ));
  }

  function toggleAll(cat: string, channel: Channel) {
    const catPrefs = prefs.filter(p => p.category === cat);
    const allOn    = catPrefs.every(p => p[channel]);
    setPrefs(prev => prev.map(p =>
      p.category === cat ? { ...p, [channel]: !allOn } : p
    ));
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 700);
  }

  return (
    <div className="space-y-5">

      {/* Save bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4
        bg-white/95 backdrop-blur border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
        <p className="text-xs text-slate-500">
          Configure when and how admin receives platform notifications
        </p>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold
            rounded-xl hover:bg-sky-700 transition-colors shadow-md shadow-sky-200 disabled:opacity-60">
          {saving
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            : saved ? <><span>✓</span> Saved!</> : <><Save size={13} /> Save Preferences</>}
        </button>
      </div>

      {/* Channel legend */}
      <div className="flex items-center gap-4 flex-wrap px-1">
        {CHANNELS.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.key} className="flex items-center gap-1.5 text-xs text-slate-500">
              <Icon size={13} className={c.color} /> {c.label}
            </div>
          );
        })}
      </div>

      {/* Category sections */}
      {categories.map(cat => {
        const catPrefs = prefs.filter(p => p.category === cat);
        return (
          <SetSectionCard key={cat} title={`${cat} Notifications`}
            subtitle={`${catPrefs.length} event types`}>

          <div className="overflow-x-auto -mx-1">
            <div className="min-w-[340px] px-1">
            {/* Column headers */}
            <div className="flex items-center mb-3 pb-2 border-b border-slate-100">
              <p className="flex-1 text-xs font-bold text-slate-400">Event</p>
              {CHANNELS.map(c => {
                const Icon = c.icon;
                const allOn = catPrefs.every(p => p[c.key]);
                return (
                  <div key={c.key} className="w-14 text-center">
                    <button
                      onClick={() => toggleAll(cat, c.key)}
                      className={`flex flex-col items-center gap-0.5 mx-auto
                        transition-opacity ${allOn ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
                      title={`Toggle all ${c.label}`}>
                      <Icon size={13} className={c.color} />
                      <span className="text-xs font-bold text-slate-400">{c.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            <div className="space-y-0">
              {catPrefs.map(p => (
                <div key={p.id}
                  className="flex items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 -mx-1 px-1 rounded-xl transition-colors">
                  <p className="flex-1 text-sm text-slate-700 pr-2 text-xs sm:text-sm">{p.label}</p>
                  {CHANNELS.map(c => (
                    <div key={c.key} className="w-14 flex justify-center">
                      <SmallToggle value={p[c.key]} onChange={() => toggle(p.id, c.key)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            </div>
          </div>
          </SetSectionCard>
        );
      })}
    </div>
  );
}
