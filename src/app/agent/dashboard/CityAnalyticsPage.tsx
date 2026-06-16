// src/pages/agent/dashboard/CityAnalyticsPage.tsx
// City Analytics — Agent Dashboard
// Tabs: Overview | Bookings | Revenue | Vendors
// Charts: Pure CSS/Tailwind — no external chart library

import { useState, useMemo } from "react";
import {
  BarChart2, TrendingUp, TrendingDown, Minus,
  MapPin, Star, AlertTriangle, Users, Zap,
  IndianRupee, ShoppingBag, Clock, Activity,
  ChevronUp, ChevronDown, ArrowRight, Shield,
  CheckCircle2, XCircle, Award,
} from "lucide-react";
import {
  CITY_HEALTH,
  MOM_STATS,
  DAILY_BOOKINGS,
  WEEKLY_BOOKINGS,
  MONTHLY_BOOKINGS,
  CATEGORY_STATS,
  HEATMAP_DATA,
  HEATMAP_DAYS,
  HEATMAP_HOURS,
  AREA_STATS,
  DISPUTE_TREND,
  VENDOR_ANALYTICS,
  type AreaStat,
  type VendorAnalytics,
} from "./mockAgentData";

// ─── Types ────────────────────────────────────────────────────────────────────

type MainTab    = "overview" | "bookings" | "revenue" | "vendors";
type BookingView = "daily" | "weekly" | "monthly";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, unit = ""): string {
  if (unit === "₹") {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  }
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function pctBar(pct: number, color: string) {
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ─── CSS Bar Chart ────────────────────────────────────────────────────────────

function BarChartCSS({
  data,
  valueKey,
  labelKey,
  color = "bg-violet-500",
  secondKey,
  secondColor = "bg-emerald-400",
  height = 160,
  showValues = false,
  formatVal = (v: number) => String(v),
}: {
  data: Record<string, any>[];
  valueKey: string;
  labelKey: string;
  color?: string;
  secondKey?: string;
  secondColor?: string;
  height?: number;
  showValues?: boolean;
  formatVal?: (v: number) => string;
}) {
  const max = Math.max(...data.map(d => Math.max(d[valueKey], secondKey ? (d[secondKey] ?? 0) : 0)));

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-1 min-w-0" style={{ height }}>
        {data.map((d, i) => {
          const pct1 = max > 0 ? (d[valueKey] / max) * 100 : 0;
          const pct2 = secondKey && max > 0 ? ((d[secondKey] ?? 0) / max) * 100 : 0;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1 min-w-0 group">
              {showValues && (
                <span className="text-2xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatVal(d[valueKey])}
                </span>
              )}
              <div className="flex items-end gap-0.5 w-full">
                <div
                  className={`${color} rounded-t-sm flex-1 transition-all duration-500 hover:opacity-80 cursor-pointer`}
                  style={{ height: `${(pct1 / 100) * (height - 24)}px`, minHeight: 2 }}
                  title={`${d[labelKey]}: ${formatVal(d[valueKey])}`}
                />
                {secondKey && (
                  <div
                    className={`${secondColor} rounded-t-sm flex-1 transition-all duration-500 hover:opacity-80`}
                    style={{ height: `${(pct2 / 100) * (height - 24)}px`, minHeight: 2 }}
                    title={`${d[labelKey]}: ${formatVal(d[secondKey])}`}
                  />
                )}
              </div>
              <span className="text-2xs text-slate-400 truncate w-full text-center leading-none">
                {d[labelKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Line Chart CSS ───────────────────────────────────────────────────────────

function LineChartCSS({
  data,
  valueKey,
  color = "#7C3AED",
  height = 120,
  showDots = true,
}: {
  data: Record<string, any>[];
  valueKey: string;
  color?: string;
  height?: number;
  showDots?: boolean;
}) {
  const values = data.map(d => d[valueKey] as number);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const W = 100;
  const H = height;
  const pad = 4;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - 2 * pad);
    const y = pad + ((max - v) / range) * (H - 2 * pad);
    return { x, y, v };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `M ${points[0].x} ${H} L ${points.map(p => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length - 1].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${valueKey})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
      ))}
    </svg>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function PeakHeatmap() {
  const max = Math.max(...HEATMAP_DATA.map(c => c.value));

  function cellColor(val: number) {
    const pct = val / max;
    if (pct >= 0.85) return "bg-violet-600 text-white";
    if (pct >= 0.65) return "bg-violet-400 text-white";
    if (pct >= 0.45) return "bg-violet-200 text-violet-800";
    if (pct >= 0.25) return "bg-violet-100 text-violet-600";
    return "bg-slate-50 text-slate-400";
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 520 }}>
        {/* Hour headers */}
        <div className="flex mb-1">
          <div className="w-8 flex-shrink-0" />
          {HEATMAP_HOURS.map(h => (
            <div key={h} className="flex-1 text-center text-2xs text-slate-400 font-medium leading-none">
              {h}
            </div>
          ))}
        </div>
        {/* Rows */}
        {HEATMAP_DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center mb-1">
            <div className="w-8 text-2xs text-slate-400 font-bold flex-shrink-0">{day}</div>
            {HEATMAP_HOURS.map((_, hourOffset) => {
              const cell = HEATMAP_DATA.find(c => c.day === dayIdx && c.hour === 6 + hourOffset);
              const val = cell?.value ?? 0;
              return (
                <div
                  key={hourOffset}
                  className={`flex-1 h-6 rounded-sm mx-0.5 flex items-center justify-center
                    text-2xs font-bold transition-all cursor-default ${cellColor(val)}`}
                  title={`${day} ${6 + hourOffset}:00 — ${val} bookings`}
                >
                  {val >= 18 ? val : ""}
                </div>
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-2xs text-slate-400">Low</span>
          {["bg-slate-50", "bg-violet-100", "bg-violet-200", "bg-violet-400", "bg-violet-600"].map(c => (
            <div key={c} className={`w-4 h-4 rounded-sm ${c} border border-slate-100`} />
          ))}
          <span className="text-2xs text-slate-400">High</span>
        </div>
      </div>
    </div>
  );
}

// ─── Donut Chart CSS ──────────────────────────────────────────────────────────

function DonutChart() {
  const total = CATEGORY_STATS.reduce((s, c) => s + c.bookings, 0);
  let cumulativePct = 0;

  // Convert % to stroke-dasharray on a SVG circle
  const R = 40;
  const C = 2 * Math.PI * R;

  const slices = CATEGORY_STATS.map(cat => {
    const pct = cat.pct / 100;
    const offset = C * (1 - cumulativePct);
    const dash = C * pct;
    cumulativePct += pct;
    // Tailwind can't be used for SVG stroke colors — using inline style
    const COLORS = [
      "#7C3AED","#3B82F6","#06B6D4","#F59E0B",
      "#F43F5E","#10B981","#F97316","#64748B",
    ];
    return { ...cat, dash, offset, color: COLORS[CATEGORY_STATS.indexOf(cat) % COLORS.length] };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-40 h-40 -rotate-90">
          {slices.map((s, i) => (
            <circle
              key={i}
              cx="50" cy="50" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={-s.offset}
              className="transition-all duration-700 hover:opacity-80"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-black text-slate-800">{total}</p>
          <p className="text-2xs text-slate-400">bookings</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 flex-1 w-full">
        {slices.map(s => (
          <div key={s.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-slate-600 flex-1 truncate">{s.icon} {s.name}</span>
            <span className="text-xs font-black text-slate-700">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── City Health Score ────────────────────────────────────────────────────────

function HealthScore() {
  const h = CITY_HEALTH;
  const color =
    h.overall >= 80 ? "text-emerald-600" :
    h.overall >= 60 ? "text-amber-600"   :
    "text-red-600";
  const ringColor =
    h.overall >= 80 ? "#10B981" :
    h.overall >= 60 ? "#F59E0B" :
    "#EF4444";
  const C = 2 * Math.PI * 36;
  const dash = (h.overall / 100) * C;

  const metrics = [
    { label: "Completion Rate",  value: h.completionRate, unit: "%",   color: "bg-emerald-400" },
    { label: "Avg Vendor Rating",value: h.avgRating * 20, unit: "",    color: "bg-amber-400",  display: `${h.avgRating}★` },
    { label: "Vendor Activity",  value: h.vendorActivity, unit: "%",   color: "bg-violet-400" },
    { label: "Response Rate",    value: h.responseTime,   unit: "%",   color: "bg-blue-400"   },
    { label: "Dispute Rate (inv)",value: 100 - h.disputeRate * 10, unit: "", color: "bg-rose-400",  display: `${h.disputeRate}%` },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-violet-400" />
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">City Health Score</h3>
      </div>

      <div className="flex items-center gap-6 mb-5">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 88 88" className="w-24 h-24">
            <circle cx="44" cy="44" r="36" fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle cx="44" cy="44" r="36" fill="none"
              stroke={ringColor} strokeWidth="10"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={C * 0.25}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${color}`}>{h.overall}</span>
            <span className="text-2xs text-slate-400">/100</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            {h.trend === "up"
              ? <TrendingUp size={14} className="text-emerald-400" />
              : h.trend === "down"
              ? <TrendingDown size={14} className="text-red-400" />
              : <Minus size={14} className="text-slate-400" />}
            <span className={`text-sm font-black ${h.trend === "up" ? "text-emerald-400" : h.trend === "down" ? "text-red-400" : "text-slate-400"}`}>
              {h.trend === "up" ? "+" : h.trend === "down" ? "-" : ""}{h.trendValue} pts
            </span>
          </div>
          <p className="text-xs text-slate-400">vs last month</p>
          <p className={`text-sm font-bold mt-2 ${
            h.overall >= 80 ? "text-emerald-400" :
            h.overall >= 60 ? "text-amber-400" :
            "text-red-400"
          }`}>
            {h.overall >= 80 ? "🟢 Excellent" : h.overall >= 60 ? "🟡 Good" : "🔴 Needs Attention"}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="flex justify-between text-2xs mb-1">
              <span className="text-slate-400">{m.label}</span>
              <span className="text-slate-300 font-bold">{m.display ?? `${m.value}${m.unit}`}</span>
            </div>
            {pctBar(m.value, m.color)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MoM Cards ────────────────────────────────────────────────────────────────

function MoMCards() {
  return (
    <div>
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
        Month-over-Month Growth
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {MOM_STATS.map(s => {
          const isPositive = s.positive ? s.change >= 0 : s.change <= 0;
          const Icon = s.change >= 0 ? TrendingUp : TrendingDown;
          return (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base">{s.icon}</span>
                <div className={`flex items-center gap-0.5 text-xs font-black
                  ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                  <Icon size={11} />
                  {Math.abs(s.change)}%
                </div>
              </div>
              <p className="text-lg font-black text-slate-800">
                {s.unit === "₹" ? fmt(s.current as number, "₹") :
                 s.unit === "%" ? `${s.current}%` :
                 s.current.toLocaleString("en-IN")}
              </p>
              <p className="text-2xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Area Performance ─────────────────────────────────────────────────────────

function AreaPerformance() {
  const [sortKey, setSortKey] = useState<keyof AreaStat>("bookings");

  const sorted = [...AREA_STATS].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));

  const COVERAGE_CONFIG = {
    high:   { label: "High",   color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    medium: { label: "Medium", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   },
    low:    { label: "Low",    color: "text-red-600",      bg: "bg-red-50",     border: "border-red-200"     },
  };

  const maxBookings = Math.max(...AREA_STATS.map(a => a.bookings));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Area-wise Performance
        </h3>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
          {(["bookings", "revenue", "avgRating"] as const).map(k => (
            <button key={k} onClick={() => setSortKey(k)}
              className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all capitalize
                ${sortKey === k ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}>
              {k === "avgRating" ? "Rating" : k === "revenue" ? "Revenue" : "Bookings"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((area, i) => {
          const cfg = COVERAGE_CONFIG[area.coverage];
          return (
            <div key={area.area}
              className="bg-white border border-slate-100 rounded-2xl p-3 hover:border-violet-200 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-slate-300 w-5 text-right flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{area.area}</p>
                      <span className={`text-2xs font-bold px-1.5 py-0.5 rounded border
                        ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-black text-violet-600">{area.bookings} jobs</span>
                      <span className="text-xs text-slate-400">{fmt(area.revenue, "₹")}</span>
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                        <Star size={10} />{area.avgRating}
                      </span>
                    </div>
                  </div>
                  {/* Booking bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-400 rounded-full transition-all duration-700"
                      style={{ width: `${(area.bookings / maxBookings) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-3 mt-1.5 text-2xs text-slate-400">
                    <span>{area.activeVendors} vendors</span>
                    <span>PIN: {area.pincode}</span>
                    <span className={area.disputeRate > 5 ? "text-red-500 font-bold" : ""}>
                      {area.disputeRate}% disputes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dispute Trend ────────────────────────────────────────────────────────────

function DisputeTrendSection() {
  const latest = DISPUTE_TREND[DISPUTE_TREND.length - 1];
  const prev   = DISPUTE_TREND[DISPUTE_TREND.length - 2];
  const improving = latest.rate < prev.rate;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Dispute Rate Trend (8 Weeks)
        </h3>
        <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl
          ${improving ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
          {improving ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          {improving ? "Improving" : "Worsening"}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center">
          <p className={`text-xl font-black ${latest.rate <= 4 ? "text-emerald-600" : "text-red-600"}`}>
            {latest.rate}%
          </p>
          <p className="text-2xs text-slate-400 mt-0.5">Current Rate</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-slate-800">{latest.resolved}/{latest.disputes}</p>
          <p className="text-2xs text-slate-400 mt-0.5">Resolved This Week</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-blue-600">{latest.avgResolveDays}d</p>
          <p className="text-2xs text-slate-400 mt-0.5">Avg Resolve Time</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4">
        <div className="flex gap-2 mb-2">
          <div className="flex items-center gap-1 text-2xs text-slate-400">
            <div className="w-2 h-2 rounded-sm bg-rose-400" /> Dispute Rate %
          </div>
        </div>
        {/* Custom rate bar chart */}
        <div className="flex items-end gap-1.5" style={{ height: 100 }}>
          {DISPUTE_TREND.map((d, i) => {
            const maxRate = Math.max(...DISPUTE_TREND.map(x => x.rate));
            const pct = (d.rate / maxRate) * 100;
            const isLatest = i === DISPUTE_TREND.length - 1;
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className="text-2xs text-slate-400 mb-0.5">{d.rate}%</span>
                <div
                  className={`w-full rounded-t-sm transition-all duration-700 ${isLatest ? "bg-rose-500" : "bg-rose-300"}`}
                  style={{ height: `${(pct / 100) * 60}px`, minHeight: 4 }}
                  title={`${d.week}: ${d.rate}%`}
                />
                <span className="text-2xs text-slate-400 mt-1 text-center leading-none"
                  style={{ fontSize: "0.6rem" }}>{d.week}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Performance Table ─────────────────────────────────────────────────

function VendorPerformanceTable() {
  const [sortKey, setSortKey]   = useState<keyof VendorAnalytics>("totalJobs");
  const [sortAsc,  setSortAsc]  = useState(false);
  const [selected, setSelected] = useState<VendorAnalytics | null>(null);

  const sorted = useMemo(() => {
    return [...VENDOR_ANALYTICS].sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortAsc ? va - vb : vb - va;
    });
  }, [sortKey, sortAsc]);

  function handleSort(key: keyof VendorAnalytics) {
    if (sortKey === key) setSortAsc(s => !s);
    else { setSortKey(key); setSortAsc(false); }
  }

  const SortIcon = ({ k }: { k: keyof VendorAnalytics }) =>
    sortKey === k
      ? (sortAsc ? <ChevronUp size={10} className="text-violet-600" /> : <ChevronDown size={10} className="text-violet-600" />)
      : <ChevronDown size={10} className="text-slate-300" />;

  const headers: { key: keyof VendorAnalytics; label: string }[] = [
    { key: "totalJobs",       label: "Jobs"        },
    { key: "completionRate",  label: "Completion"  },
    { key: "avgRating",       label: "Rating"      },
    { key: "revenue",         label: "Revenue"     },
    { key: "responseRate",    label: "Response"    },
    { key: "disputeCount",    label: "Disputes"    },
    { key: "repeatCustomers", label: "Repeat Cust" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Vendor Performance — High Volume Data
        </h3>
        <span className="text-2xs text-slate-400">{VENDOR_ANALYTICS.length} vendors</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-black text-slate-600 whitespace-nowrap">Vendor</th>
              {headers.map(h => (
                <th key={h.key}
                  className="text-right px-3 py-3 font-black text-slate-500 whitespace-nowrap cursor-pointer hover:text-violet-600"
                  onClick={() => handleSort(h.key)}>
                  <span className="flex items-center justify-end gap-0.5">
                    {h.label} <SortIcon k={h.key} />
                  </span>
                </th>
              ))}
              <th className="text-center px-3 py-3 font-black text-slate-500">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v, i) => {
              const isTop    = v.completionRate >= 90 && v.avgRating >= 4.4;
              const isRisk   = v.completionRate < 80 || v.disputeCount >= 3;
              return (
                <tr key={v.id}
                  onClick={() => setSelected(v === selected ? null : v)}
                  className={`border-b border-slate-50 cursor-pointer transition-colors
                    ${selected?.id === v.id ? "bg-violet-50" : "hover:bg-slate-50"}
                    ${isRisk ? "border-l-4 border-l-red-300" : isTop ? "border-l-4 border-l-emerald-300" : ""}`}>

                  {/* Vendor name */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{v.icon}</span>
                      <div>
                        <p className="font-bold text-slate-800">{v.name}</p>
                        <p className="text-2xs text-slate-400">{v.category}</p>
                      </div>
                      {isTop  && <Award  size={12} className="text-amber-500 flex-shrink-0" title="Top performer" />}
                      {isRisk && <AlertTriangle size={12} className="text-red-500 flex-shrink-0" title="At risk" />}
                    </div>
                  </td>

                  <td className="px-3 py-3 text-right font-black text-slate-700">{v.totalJobs}</td>

                  <td className={`px-3 py-3 text-right font-bold
                    ${v.completionRate >= 90 ? "text-emerald-600" : v.completionRate >= 75 ? "text-amber-600" : "text-red-600"}`}>
                    {v.completionRate}%
                  </td>

                  <td className={`px-3 py-3 text-right font-bold
                    ${v.avgRating >= 4.5 ? "text-amber-500" : v.avgRating >= 4.0 ? "text-slate-700" : "text-red-500"}`}>
                    {v.avgRating}★
                  </td>

                  <td className="px-3 py-3 text-right font-bold text-emerald-600">
                    {fmt(v.revenue, "₹")}
                  </td>

                  <td className={`px-3 py-3 text-right font-bold
                    ${v.responseRate >= 85 ? "text-emerald-600" : v.responseRate >= 70 ? "text-amber-600" : "text-red-500"}`}>
                    {v.responseRate}%
                  </td>

                  <td className={`px-3 py-3 text-right font-bold
                    ${v.disputeCount === 0 ? "text-emerald-600" : v.disputeCount <= 2 ? "text-amber-600" : "text-red-600"}`}>
                    {v.disputeCount}
                  </td>

                  <td className="px-3 py-3 text-right font-bold text-violet-600">{v.repeatCustomers}%</td>

                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full
                      ${v.trend === "up"   ? "bg-emerald-100 text-emerald-700" :
                        v.trend === "down" ? "bg-red-100 text-red-600" :
                        "bg-slate-100 text-slate-500"}`}>
                      {v.trend === "up" ? <TrendingUp size={10} /> : v.trend === "down" ? <TrendingDown size={10} /> : <Minus size={10} />}
                      {v.trendJobs > 0 ? "+" : ""}{v.trendJobs}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded row detail */}
      {selected && (
        <div className="mt-3 bg-violet-50 border-2 border-violet-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <p className="font-black text-slate-800">{selected.name}</p>
              <p className="text-xs text-slate-500">{selected.category}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Avg Response",  value: `${selected.avgResponseMin} min`, icon: Clock },
              { label: "Repeat Customers", value: `${selected.repeatCustomers}%`, icon: Users },
              { label: "Total Revenue",  value: fmt(selected.revenue, "₹"),        icon: IndianRupee },
              { label: "Dispute Count",  value: String(selected.disputeCount),      icon: AlertTriangle },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl p-3 text-center border border-violet-100">
                <m.icon size={14} className="text-violet-400 mx-auto mb-1" />
                <p className="text-base font-black text-slate-800">{m.value}</p>
                <p className="text-2xs text-slate-400 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
          {/* Mini bar chart — completion vs response */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-slate-500">Completion Rate</span>
                <span className="font-bold text-slate-700">{selected.completionRate}%</span>
              </div>
              {pctBar(selected.completionRate, "bg-emerald-400")}
            </div>
            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-slate-500">Response Rate</span>
                <span className="font-bold text-slate-700">{selected.responseRate}%</span>
              </div>
              {pctBar(selected.responseRate, "bg-violet-400")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Revenue Section ──────────────────────────────────────────────────────────

function RevenueSection() {
  const monthly = MONTHLY_BOOKINGS;
  const maxRev  = Math.max(...monthly.map(m => m.revenue));

  const totalRev     = monthly.reduce((s, m) => s + m.revenue, 0);
  const avgMonthly   = Math.round(totalRev / monthly.length);
  const latestMonth  = monthly[monthly.length - 1];
  const prevMonth    = monthly[monthly.length - 2];
  const revGrowth    = (((latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1);

  const catRevTotal  = CATEGORY_STATS.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month Revenue", value: fmt(latestMonth.revenue, "₹"), sub: `+${revGrowth}% vs last month`, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: TrendingUp },
          { label: "Avg Monthly Revenue",value: fmt(avgMonthly, "₹"),            sub: "Last 6 months avg",           color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200",  icon: IndianRupee },
          { label: "Platform Share (20%)",value: fmt(Math.round(latestMonth.revenue * 0.2), "₹"), sub: "This month", color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",    icon: ShoppingBag },
          { label: "Agent Comm (1%)",     value: fmt(Math.round(latestMonth.revenue * 0.01), "₹"),sub: "This month", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   icon: Award },
        ].map(c => (
          <div key={c.label} className={`bg-white border-2 ${c.border} rounded-2xl p-4`}>
            <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon size={16} className={c.color} />
            </div>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-xs font-bold text-slate-700 mt-0.5">{c.label}</p>
            <p className="text-2xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-700">Monthly Revenue Trend</h3>
          <div className="flex gap-3 text-2xs text-slate-400">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-violet-500" /> Revenue</span>
          </div>
        </div>
        <BarChartCSS
          data={monthly}
          valueKey="revenue"
          labelKey="month"
          color="bg-violet-500"
          height={160}
          showValues
          formatVal={v => fmt(v, "₹")}
        />
      </div>

      {/* Revenue by category */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 className="text-sm font-black text-slate-700 mb-4">Revenue by Category</h3>
        <div className="space-y-3">
          {[...CATEGORY_STATS].sort((a, b) => b.revenue - a.revenue).map(c => {
            const pct = (c.revenue / catRevTotal) * 100;
            return (
              <div key={c.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700">{c.icon} {c.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{pct.toFixed(1)}%</span>
                    <span className="font-black text-emerald-600">{fmt(c.revenue, "₹")}</span>
                  </div>
                </div>
                {pctBar(pct, c.color)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Bookings Section ─────────────────────────────────────────────────────────

function BookingsSection() {
  const [view, setView] = useState<BookingView>("daily");

  const chartData = view === "daily"
    ? DAILY_BOOKINGS.slice(-14).map(d => ({ ...d, label: d.date.replace("Feb ", "") }))
    : view === "weekly"
    ? WEEKLY_BOOKINGS.map(d => ({ ...d, label: d.week }))
    : MONTHLY_BOOKINGS.map(d => ({ ...d, label: d.month }));

  const valueKey   = "bookings";
  const secondKey  = view === "daily" ? "completed" : undefined;
  const totalBookings = (view === "daily" ? DAILY_BOOKINGS : view === "weekly" ? WEEKLY_BOOKINGS : MONTHLY_BOOKINGS)
    .reduce((s: number, d: any) => s + d.bookings, 0);

  return (
    <div className="space-y-6">

      {/* View toggle */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["daily", "weekly", "monthly"] as BookingView[]).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize
              ${view === v ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {v}
          </button>
        ))}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Bookings",    value: totalBookings.toLocaleString("en-IN"),             color: "text-slate-700",    bg: "bg-slate-50",    border: "border-slate-200"   },
          { label: "Avg per Day",       value: Math.round(DAILY_BOOKINGS.reduce((s,d)=>s+d.bookings,0)/DAILY_BOOKINGS.length), color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
          { label: "Peak Day",          value: DAILY_BOOKINGS.reduce((a,b) => a.bookings > b.bookings ? a : b).date, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Cancellation Rate", value: `${((DAILY_BOOKINGS.reduce((s,d)=>s+d.cancelled,0)/DAILY_BOOKINGS.reduce((s,d)=>s+d.bookings,0))*100).toFixed(1)}%`, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} border-2 ${c.border} rounded-2xl px-4 py-3`}>
            <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-700">
            Booking Trend — {view === "daily" ? "Last 14 Days" : view === "weekly" ? "Last 12 Weeks" : "Last 6 Months"}
          </h3>
          {view === "daily" && (
            <div className="flex gap-3 text-2xs text-slate-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-violet-500" /> Bookings</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-400" /> Completed</span>
            </div>
          )}
        </div>
        <BarChartCSS
          data={chartData}
          valueKey={valueKey}
          labelKey="label"
          color="bg-violet-500"
          secondKey={secondKey}
          secondColor="bg-emerald-400"
          height={160}
          showValues
          formatVal={v => String(v)}
        />
      </div>

      {/* Revenue line chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 className="text-sm font-black text-slate-700 mb-1">Revenue Trend</h3>
        <p className="text-xs text-slate-400 mb-4">
          {view === "daily" ? "Last 28 days" : view === "weekly" ? "Last 12 weeks" : "Last 6 months"}
        </p>
        <LineChartCSS
          data={view === "daily" ? DAILY_BOOKINGS : view === "weekly" ? WEEKLY_BOOKINGS : MONTHLY_BOOKINGS}
          valueKey="revenue"
          color="#7C3AED"
          height={120}
        />
        <div className="flex justify-between text-2xs text-slate-400 mt-1 px-1">
          <span>{(view === "daily" ? DAILY_BOOKINGS : view === "weekly" ? WEEKLY_BOOKINGS : MONTHLY_BOOKINGS)[0].date ?? (view === "daily" ? DAILY_BOOKINGS[0].date : view === "weekly" ? WEEKLY_BOOKINGS[0].week : MONTHLY_BOOKINGS[0].month)}</span>
          <span>{(view === "daily" ? DAILY_BOOKINGS : view === "weekly" ? WEEKLY_BOOKINGS : MONTHLY_BOOKINGS).slice(-1)[0].date ?? (view === "daily" ? DAILY_BOOKINGS.slice(-1)[0].date : view === "weekly" ? WEEKLY_BOOKINGS.slice(-1)[0].week : MONTHLY_BOOKINGS.slice(-1)[0].month)}</span>
        </div>
      </div>

      {/* Peak hours heatmap */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-700">Peak Hours Heatmap</h3>
            <p className="text-xs text-slate-400 mt-0.5">Booking density by day & hour</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-violet-600">Sat 5–6 PM</p>
            <p className="text-2xs text-slate-400">Peak slot</p>
          </div>
        </div>
        <PeakHeatmap />
      </div>

      {/* Dispute trend */}
      <DisputeTrendSection />
    </div>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Health score — col-span-1 */}
        <div>
          <HealthScore />
        </div>

        {/* Donut — col-span-2 */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
            Category Breakdown
          </h3>
          <DonutChart />

          {/* Category bars */}
          <div className="mt-5 space-y-2">
            {CATEGORY_STATS.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-sm w-5 text-center">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-2xs mb-0.5">
                    <span className="text-slate-600 font-medium truncate">{c.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-bold ${c.trend === "up" ? "text-emerald-600" : c.trend === "down" ? "text-red-500" : "text-slate-400"}`}>
                        {c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "→"}{Math.abs(c.trendPct)}%
                      </span>
                      <span className="text-slate-500 font-bold">{c.bookings}</span>
                    </div>
                  </div>
                  {pctBar(c.pct, c.color)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MoMCards />
      <AreaPerformance />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { key: MainTab; label: string; icon: React.ElementType }[] = [
  { key: "overview",  label: "Overview",  icon: BarChart2    },
  { key: "bookings",  label: "Bookings",  icon: Activity     },
  { key: "revenue",   label: "Revenue",   icon: IndianRupee  },
  { key: "vendors",   label: "Vendors",   icon: Users        },
];

export default function CityAnalyticsPage() {
  const [tab, setTab] = useState<MainTab>("overview");

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <BarChart2 size={18} className="text-violet-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800">City Analytics</h2>
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              <MapPin size={10} /> Ghaziabad
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium ml-11">
            Performance insights, trends & vendor data for your city
          </p>
        </div>

        {/* Health score pill */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2
          ${CITY_HEALTH.overall >= 80 ? "bg-emerald-50 border-emerald-200" :
            CITY_HEALTH.overall >= 60 ? "bg-amber-50 border-amber-200" :
            "bg-red-50 border-red-200"}`}>
          <Shield size={16} className={
            CITY_HEALTH.overall >= 80 ? "text-emerald-600" :
            CITY_HEALTH.overall >= 60 ? "text-amber-600" : "text-red-600"} />
          <div>
            <p className={`text-sm font-black ${
              CITY_HEALTH.overall >= 80 ? "text-emerald-700" :
              CITY_HEALTH.overall >= 60 ? "text-amber-700" : "text-red-700"}`}>
              Health Score: {CITY_HEALTH.overall}/100
            </p>
            <p className="text-2xs text-slate-400">
              {CITY_HEALTH.trend === "up" ? "↑" : "↓"} {CITY_HEALTH.trendValue} pts vs last month
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold
              transition-all whitespace-nowrap flex-shrink-0
              ${tab === key
                ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                : "text-slate-500 bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600"}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {tab === "overview"  && <OverviewSection />}
      {tab === "bookings"  && <BookingsSection />}
      {tab === "revenue"   && <RevenueSection />}
      {tab === "vendors"   && (
        <div className="space-y-6">
          <VendorPerformanceTable />
        </div>
      )}
    </div>
  );
}
