// src/pages/admin/dashboard/components/NPSSatisfactionChart.tsx

import { NPS_TREND } from "../mockAdminData";

export default function NPSSatisfactionChart() {
  const latest = NPS_TREND[NPS_TREND.length - 1];
  const prev   = NPS_TREND[NPS_TREND.length - 2];
  const delta  = latest.nps - prev.nps;

  const W = 400; const H = 80; const PAD = 12;
  const plotW = W - PAD * 2;
  const maxNPS = 60;
  const pts = NPS_TREND.map((d, i) => ({
    x: PAD + (i / (NPS_TREND.length - 1)) * plotW,
    y: H - PAD - ((d.nps / maxNPS) * (H - PAD * 2)),
    nps: d.nps,
    month: d.month,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x},${H - PAD} L${pts[0].x},${H - PAD} Z`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-black text-slate-700 mb-1">NPS & Satisfaction</h3>
      <p className="text-xs text-slate-400 mb-4">Net Promoter Score — monthly trend</p>

      {/* Big NPS number */}
      <div className="flex items-center gap-6 mb-5">
        <div className="text-center">
          <p className="text-5xl font-black text-emerald-600">+{latest.nps}</p>
          <p className="text-xs text-slate-400 mt-1">NPS Score</p>
          <span className="text-xs font-bold text-emerald-600">
            {delta >= 0 ? `▲ +${delta}` : `▼ ${delta}`} pts MoM
          </span>
        </div>
        {/* Breakdown bars */}
        <div className="flex-1 space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-emerald-600 font-bold">😊 Promoters</span>
              <span className="font-black text-slate-700">{latest.promoters}%</span>
            </div>
            <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${latest.promoters}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-600 font-bold">😐 Passives</span>
              <span className="font-black text-slate-700">{latest.passives}%</span>
            </div>
            <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${latest.passives}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-500 font-bold">😞 Detractors</span>
              <span className="font-black text-slate-700">{latest.detractors}%</span>
            </div>
            <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-red-400 rounded-full" style={{ width: `${latest.detractors}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Trend line */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        <defs>
          <linearGradient id="nps-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#nps-grad)" />
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#10b981" />
            <text x={p.x} y={H - 1} fontSize="8" fill="#94a3b8" textAnchor="middle">{p.month.split(" ")[0]}</text>
          </g>
        ))}
      </svg>

      <p className="text-xs text-slate-400 mt-2 text-center">
        Based on {latest.responses.toLocaleString("en-IN")} survey responses in {latest.month}
      </p>
    </div>
  );
}
