// src/pages/admin/dashboard/components/AdminWelcomeBanner.tsx

import { Sparkles, ShieldCheck } from "lucide-react";
import { getPlatformStats } from "../mockAdminData";

interface Props {
  name: string;
}

function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function AdminWelcomeBanner({ name }: Props) {
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const stats    = getPlatformStats("month");

  return (
    <div className="relative bg-gradient-to-br from-sky-600 via-sky-700 to-sky-900
      rounded-2xl p-6 overflow-hidden text-white">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-sky-300" />
              <span className="text-sky-300 text-xs font-semibold">{greeting}!</span>
            </div>
            <h2 className="text-2xl text-sky-100 mb-1">{name.split(" ")[0] || "Admin"} 👋</h2>
            <p className="text-sky-300 text-sm flex items-center gap-1.5">
              <ShieldCheck size={13} /> Super Admin · ADDies Platform
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-sky-300 mb-0.5">Revenue (Month)</p>
              <p className="text-xl font-black text-white">{fmt(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-sky-300 mb-0.5">Platform Fee</p>
              <p className="text-xl font-black text-emerald-300">{fmt(stats.platformFee)}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-sky-300 mb-0.5">Active Cities</p>
              <p className="text-xl font-black text-white">{stats.activeCities}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-sky-300 mb-0.5">Growth</p>
              <p className="text-xl font-black text-emerald-300">+{stats.platformGrowth}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
