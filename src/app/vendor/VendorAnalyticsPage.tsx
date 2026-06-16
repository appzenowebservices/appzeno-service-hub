/**
 * VendorAnalyticsPage.tsx
 * Location: src/pages/vendor/VendorAnalyticsPage.tsx
 */

import { useState } from "react";
import {
  BarChart2, TrendingUp, TrendingDown, Star, IndianRupee,
  Users, Zap, CheckCircle2, Clock, Award, Target,
  Calendar, ChevronDown, Briefcase, Package,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MONTHLY_EARNINGS = [
  { month:"Sep",  gross:4200, net:3276, jobs:7  },
  { month:"Oct",  gross:5800, net:4524, jobs:9  },
  { month:"Nov",  gross:4900, net:3822, jobs:8  },
  { month:"Dec",  gross:7200, net:5616, jobs:12 },
  { month:"Jan",  gross:8900, net:6942, jobs:15 },
  { month:"Feb",  gross:9028, net:6839, jobs:10 },
];

const WEEKLY_LEADS = [
  { week:"W1 Feb", received:8, accepted:5, completed:5 },
  { week:"W2 Feb", received:11,accepted:7, completed:6 },
  { week:"W3 Feb", received:7, accepted:4, completed:4 },
  { week:"W4 Feb", received:9, accepted:6, completed:5 },
];

const CATEGORY_SHARE = [
  { name:"Plumbing",       value:35, color:"#10b981" },
  { name:"Electrical",     value:28, color:"#6366f1" },
  { name:"AC Service",     value:22, color:"#f59e0b" },
  { name:"Home Cleaning",  value:10, color:"#3b82f6" },
  { name:"Others",         value:5,  color:"#94a3b8" },
];

const RATING_TREND = [
  { month:"Sep", rating:4.2 },
  { month:"Oct", rating:4.4 },
  { month:"Nov", rating:4.3 },
  { month:"Dec", rating:4.6 },
  { month:"Jan", rating:4.7 },
  { month:"Feb", rating:4.8 },
];

const HOURLY_DEMAND = [
  { hour:"6AM",   jobs:1 }, { hour:"8AM",   jobs:3 }, { hour:"10AM", jobs:7 },
  { hour:"12PM",  jobs:9 }, { hour:"2PM",   jobs:8 }, { hour:"4PM",  jobs:6 },
  { hour:"6PM",   jobs:5 }, { hour:"8PM",   jobs:2 },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, c, bg, b, trend }:
  { label:string; value:string; sub:string; icon:React.ElementType; c:string; bg:string; b:string; trend?:number }) {
  return (
    <div className={`rounded-2xl border-2 ${b} ${bg} p-4`}>
      <Icon size={16} className={`${c} mb-2`} />
      <p className={`text-2xl font-black ${c}`}>{value}</p>
      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
        <p className="text-xs font-bold text-slate-600">{label}</p>
        {trend !== undefined && (
          trend >= 0
            ? <span className="flex items-center gap-0.5 text-xs text-green-600 font-bold"><TrendingUp size={10} />+{trend}%</span>
            : <span className="flex items-center gap-0.5 text-xs text-red-500 font-bold"><TrendingDown size={10} />{trend}%</span>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: Record<string,unknown>) {
  if (!(active as boolean) || !(payload as unknown[])?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5">{label as string}</p>
      {(payload as {name:string; value:number; color:string}[]).map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-800">
            {p.name.includes("gross") || p.name.includes("net") ? `₹${p.value}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorAnalyticsPage() {
  const [period, setPeriod] = useState<"6m"|"3m"|"1m">("6m");

  const currentMonth  = MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 1];
  const prevMonth     = MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 2];
  const earningTrend  = Math.round(((currentMonth.net - prevMonth.net) / prevMonth.net) * 100);
  const jobTrend      = Math.round(((currentMonth.jobs - prevMonth.jobs) / prevMonth.jobs) * 100);

  const displayData   = period === "1m" ? MONTHLY_EARNINGS.slice(-1)
                      : period === "3m" ? MONTHLY_EARNINGS.slice(-3)
                      : MONTHLY_EARNINGS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BarChart2 size={22} className="text-emerald-500" /> Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Apne business performance ko depth mein samjho</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(["1m","3m","6m"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                ${period === p ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {p === "1m" ? "1 Month" : p === "3m" ? "3 Months" : "6 Months"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net Earnings (Feb)"   value={`₹${currentMonth.net.toLocaleString("en-IN")}`} sub="After deductions"       icon={IndianRupee} c="text-emerald-600" bg="bg-emerald-50" b="border-emerald-200" trend={earningTrend} />
        <StatCard label="Jobs Completed (Feb)" value={String(currentMonth.jobs)}                       sub="This month"             icon={Package}     c="text-blue-600"    bg="bg-blue-50"    b="border-blue-200"    trend={jobTrend} />
        <StatCard label="Avg Rating"           value="4.8 ⭐"                                           sub="Last 30 days"          icon={Star}        c="text-yellow-600"  bg="bg-yellow-50"  b="border-yellow-200"  trend={5} />
        <StatCard label="Lead Accept Rate"     value="68%"                                             sub="Leads accepted vs received" icon={Target}  c="text-violet-600"  bg="bg-violet-50"  b="border-violet-200"  trend={3} />
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-slate-800">Earnings Overview</h3>
            <p className="text-xs text-slate-400 mt-0.5">Gross vs Net earnings per month</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-300" />Gross</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" />Net</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={displayData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="gross" stroke="#94a3b8" strokeWidth={2} fill="url(#grossGrad)" dot={false} />
            <Area type="monotone" dataKey="net"   stroke="#10b981" strokeWidth={2.5} fill="url(#netGrad)" dot={{ fill:"#10b981", r:4, strokeWidth:0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Leads Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-black text-slate-800 mb-1">Lead Funnel (Weekly)</h3>
          <p className="text-xs text-slate-400 mb-4">Received → Accepted → Completed</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_LEADS} margin={{ top: 0, right: 5, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="received"  name="Received"  fill="#e2e8f0" radius={[4,4,0,0]} />
              <Bar dataKey="accepted"  name="Accepted"  fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[["#e2e8f0","Received"],["#6366f1","Accepted"],["#10b981","Completed"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-black text-slate-800 mb-1">Category Distribution</h3>
          <p className="text-xs text-slate-400 mb-2">Jobs by service category</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={CATEGORY_SHARE} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  dataKey="value" paddingAngle={3}>
                  {CATEGORY_SHARE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {CATEGORY_SHARE.map(c => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-slate-600 flex-1">{c.name}</span>
                  <span className="font-black text-slate-800">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rating Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-black text-slate-800 mb-1">Rating Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Customer rating over time</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={RATING_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[3.5, 5]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2.5} fill="url(#ratingGrad)"
                dot={{ fill:"#f59e0b", r:4, strokeWidth:0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-black text-slate-800 mb-1">Peak Demand Hours</h3>
          <p className="text-xs text-slate-400 mb-4">Kin ghanton mein zyada jobs aati hain</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={HOURLY_DEMAND} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="jobs" name="Jobs" fill="#6366f1" radius={[4,4,0,0]}>
                {HOURLY_DEMAND.map((e, i) => (
                  <Cell key={i} fill={e.jobs >= 8 ? "#10b981" : e.jobs >= 5 ? "#6366f1" : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[["#10b981","Peak"],["#6366f1","High"],["#e2e8f0","Low"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon:TrendingUp,  c:"text-emerald-600", bg:"bg-emerald-50", title:"Earnings Growing",   desc:"Feb mein net earning ₹6,839 rahi — Jan se 9% zyada. Peak performance!" },
          { icon:Clock,       c:"text-blue-600",    bg:"bg-blue-50",    title:"Best Time Slot",     desc:"10 AM – 2 PM mein sabse zyada jobs book hoti hain. Is time available raho." },
          { icon:Award,       c:"text-yellow-600",  bg:"bg-yellow-50",  title:"Rating Improving",   desc:"Aapki rating 6 months mein 4.2 se 4.8 ho gayi. Keep it up!" },
        ].map(({ icon: Icon, c, bg, title, desc }) => (
          <div key={title} className={`flex items-start gap-3 p-4 rounded-2xl ${bg} border border-slate-100`}>
            <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0`}>
              <Icon size={16} className={c} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
