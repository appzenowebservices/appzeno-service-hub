// src/pages/admin/dashboard/SettingsPage.tsx

import { useState } from "react";
import {
  Settings, Globe, IndianRupee, Users, Shield, Bell,
  Lock, FileText, Zap,
} from "lucide-react";

import SetGeneralTab  from "./components/SetGeneralTab";
import SetFinanceTab  from "./components/SetFinanceTab";
import SetTeamTab     from "./components/SetTeamTab";
import SetRolesTab    from "./components/SetRolesTab";
import SetNotifTab    from "./components/SetNotifTab";
import SetSecurityTab from "./components/SetSecurityTab";
import SetAuditTab    from "./components/SetAuditTab";
import SetGatewayTab  from "./components/SetGatewayTab";

type TabKey = "general" | "finance" | "team" | "roles" | "notifications" | "security" | "audit" | "gateways";

const TABS: { key: TabKey; label: string; icon: React.ElementType; desc: string; badge?: string }[] = [
  { key: "general",       label: "General",          icon: Globe,         desc: "Brand, rules & feature flags"       },
  { key: "finance",       label: "Finance & Payouts",icon: IndianRupee,   desc: "Fees, payouts & commissions"        },
  { key: "team",          label: "Team",             icon: Users,         desc: "Admin members & invites"            },
  { key: "roles",         label: "Roles",            icon: Shield,        desc: "Permissions & access control"       },
  { key: "notifications", label: "Notifications",    icon: Bell,          desc: "Alert preferences by channel"      },
  { key: "security",      label: "Security",         icon: Lock,          desc: "Password, 2FA & IP whitelist",      badge: "1" },
  { key: "audit",         label: "Audit Log",        icon: FileText,      desc: "All admin actions tracked"          },
  { key: "gateways",      label: "Gateways",         icon: Zap,           desc: "SMS, email & payment providers"     },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("general");

  const activeTab = TABS.find(t => t.key === tab)!;

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-black text-slate-800">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Super Admin controls — platform config, team, roles, security and gateways
        </p>
      </div>

      {/* Mobile: horizontal scrollable tab strip */}
      <div className="lg:hidden bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="flex overflow-x-auto gap-1 p-2 scrollbar-hide">
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap
                  flex-shrink-0 text-xs font-bold transition-all
                  ${active
                    ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                    : "text-slate-600 hover:bg-slate-100"}`}>
                <Icon size={13} className="flex-shrink-0" />
                {t.label}
                {t.badge && (
                  <span className={`text-xs font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                    ${active ? "bg-white/30 text-white" : "bg-red-100 text-red-600"}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout: sidebar tabs + content */}
      <div className="flex gap-5 items-start">

        {/* Tab sidebar — desktop only */}
        <div className="hidden lg:block w-56 flex-shrink-0 bg-white border border-slate-100 rounded-2xl overflow-hidden sticky top-4">
          <div className="px-3 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2">
              <Settings size={14} className="text-slate-400" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Configuration</p>
            </div>
          </div>
          <nav className="p-2 space-y-0.5">
            {TABS.map(t => {
              const Icon   = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                    transition-all group
                    ${active
                      ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                  <Icon size={15} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">{t.label}</span>
                      {t.badge && (
                        <span className={`text-xs font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                          ${active ? "bg-white/30 text-white" : "bg-red-100 text-red-600"}`}>
                          {t.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {/* Tab header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center flex-shrink-0">
              <activeTab.icon size={18} className="text-sky-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">{activeTab.label}</h3>
              <p className="text-xs text-slate-400">{activeTab.desc}</p>
            </div>
          </div>

          {/* Content */}
          {tab === "general"       && <SetGeneralTab  />}
          {tab === "finance"       && <SetFinanceTab  />}
          {tab === "team"          && <SetTeamTab     />}
          {tab === "roles"         && <SetRolesTab    />}
          {tab === "notifications" && <SetNotifTab    />}
          {tab === "security"      && <SetSecurityTab />}
          {tab === "audit"         && <SetAuditTab    />}
          {tab === "gateways"      && <SetGatewayTab  />}
        </div>
      </div>
    </div>
  );
}
