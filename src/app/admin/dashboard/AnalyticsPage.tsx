// src/pages/admin/dashboard/AnalyticsPage.tsx

import { useState } from "react";
import {
  TrendingUp, Users, Store, MapPin,
  Activity, Clock, BarChart2,
} from "lucide-react";

import AnalyticsKPIStrip       from "./components/AnalyticsKPIStrip";
import AnalyticsInsights       from "./components/AnalyticsInsights";
import RevenueTrendChart       from "./components/RevenueTrendChart";
import BookingFunnelChart      from "./components/BookingFunnelChart";
import BookingHeatmap          from "./components/BookingHeatmap";
import RetentionCohortTable    from "./components/RetentionCohortTable";
import CustomerSegmentsChart   from "./components/CustomerSegmentsChart";
import CategoryTrendChart      from "./components/CategoryTrendChart";
import VendorHealthChart       from "./components/VendorHealthChart";
import CityPerformanceTable    from "./components/CityPerformanceTable";
import DemandPatternCharts     from "./components/DemandPatternCharts";
import NPSSatisfactionChart    from "./components/NPSSatisfactionChart";

type Section =
  | "overview"
  | "revenue"
  | "customers"
  | "vendors"
  | "cities"
  | "demand"
  | "satisfaction";

interface NavItem {
  key:   Section;
  label: string;
  icon:  React.ElementType;
}

const SECTIONS: NavItem[] = [
  { key: "overview",     label: "Overview",      icon: BarChart2  },
  { key: "revenue",      label: "Revenue",        icon: TrendingUp },
  { key: "customers",    label: "Customers",      icon: Users      },
  { key: "vendors",      label: "Vendors",        icon: Store      },
  { key: "cities",       label: "Cities",         icon: MapPin     },
  { key: "demand",       label: "Demand",         icon: Clock      },
  { key: "satisfaction", label: "Satisfaction",   icon: Activity   },
];

export default function AnalyticsPage() {
  const [section, setSection] = useState<Section>("overview");

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-black text-slate-800">Analytics</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Full platform intelligence — revenue, customers, vendors, cities & demand
        </p>
      </div>

      {/* Section nav tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {SECTIONS.map(s => {
          const Icon   = s.icon;
          const active = section === s.key;
          return (
            <button key={s.key} onClick={() => setSection(s.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold
                whitespace-nowrap flex-shrink-0 transition-all
                ${active
                  ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-sky-300 hover:text-sky-600"}`}>
              <Icon size={13} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      {section === "overview" && (
        <div className="space-y-5">
          <AnalyticsKPIStrip />
          <AnalyticsInsights />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <RevenueTrendChart />
            <BookingFunnelChart />
          </div>
          <BookingHeatmap />
        </div>
      )}

      {/* ── REVENUE ───────────────────────────────────────────────────────── */}
      {section === "revenue" && (
        <div className="space-y-5">
          <RevenueTrendChart />
          <CategoryTrendChart />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <CityPerformanceTable />
            <BookingFunnelChart />
          </div>
        </div>
      )}

      {/* ── CUSTOMERS ─────────────────────────────────────────────────────── */}
      {section === "customers" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <CustomerSegmentsChart />
            <NPSSatisfactionChart />
          </div>
          <RetentionCohortTable />
        </div>
      )}

      {/* ── VENDORS ───────────────────────────────────────────────────────── */}
      {section === "vendors" && (
        <div className="space-y-5">
          <VendorHealthChart />
          <CategoryTrendChart />
        </div>
      )}

      {/* ── CITIES ────────────────────────────────────────────────────────── */}
      {section === "cities" && (
        <div className="space-y-5">
          <CityPerformanceTable />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <BookingHeatmap />
            <NPSSatisfactionChart />
          </div>
        </div>
      )}

      {/* ── DEMAND ────────────────────────────────────────────────────────── */}
      {section === "demand" && (
        <div className="space-y-5">
          <DemandPatternCharts />
          <BookingHeatmap />
          <BookingFunnelChart />
        </div>
      )}

      {/* ── SATISFACTION ──────────────────────────────────────────────────── */}
      {section === "satisfaction" && (
        <div className="space-y-5">
          <NPSSatisfactionChart />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <RetentionCohortTable />
            <CustomerSegmentsChart />
          </div>
        </div>
      )}
    </div>
  );
}
