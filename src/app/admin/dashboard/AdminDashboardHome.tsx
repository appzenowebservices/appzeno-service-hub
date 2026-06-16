// src/pages/admin/dashboard/AdminDashboardHome.tsx

import { useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import {
  getPlatformStats, CITY_DATA, CATEGORY_PERF,
  TOP_VENDORS, ADMIN_ACTIVITY, ADMIN_ALERTS,
  type Period,
} from "./mockAdminData";

import AdminPeriodSelector  from "./components/AdminPeriodSelector";
import AdminWelcomeBanner   from "./components/AdminWelcomeBanner";
import AdminStatsGrid       from "./components/AdminStatsGrid";
import AdminRevenueChart    from "./components/AdminRevenueChart";
import AdminAlertsPanel     from "./components/AdminAlertsPanel";
import AdminActivityFeed    from "./components/AdminActivityFeed";
import AdminCityTable       from "./components/AdminCityTable";
import AdminCategoryList    from "./components/AdminCategoryList";
import AdminTopVendors      from "./components/AdminTopVendors";

interface Props {
  onNavigate: (tab: string) => void;
}

export default function AdminDashboardHome({ onNavigate }: Props) {
  const { user }            = useAuthStore();
  const [period, setPeriod] = useState<Period>("month");

  const stats        = getPlatformStats(period);
  const urgentAlerts = ADMIN_ALERTS.filter(a => a.urgent);

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <AdminWelcomeBanner name={user?.fullName || "Admin"} />

      {/* Urgent alerts banner */}
      {urgentAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-600" />
            <h3 className="text-sm font-black text-red-700">
              {urgentAlerts.length} Urgent Items Need Attention
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {urgentAlerts.map(alert => (
              <button key={alert.id}
                onClick={() => onNavigate(alert.tab)}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-white
                  border border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50
                  transition-all text-left group">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-800 truncate">{alert.title}</p>
                  <p className="text-xs text-red-500 truncate mt-0.5">{alert.subtitle}</p>
                </div>
                <ChevronRight size={14}
                  className="text-red-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Period selector + heading */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider">
          Platform Overview
        </h3>
        <AdminPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Stats grid */}
      <AdminStatsGrid stats={stats} period={period} />

      {/* Revenue chart */}
      <AdminRevenueChart period={period} />

      {/* 3-col: Cities | Categories | Top Vendors */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AdminCityTable    cities={CITY_DATA}     onNavigate={onNavigate} />
        <AdminCategoryList categories={CATEGORY_PERF} onNavigate={onNavigate} />
        <AdminTopVendors   vendors={TOP_VENDORS}  onNavigate={onNavigate} />
      </div>

      {/* Bottom 2-col: Alerts | Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdminAlertsPanel  alerts={ADMIN_ALERTS}       onNavigate={onNavigate} />
        <AdminActivityFeed activities={ADMIN_ACTIVITY} />
      </div>

    </div>
  );
}
