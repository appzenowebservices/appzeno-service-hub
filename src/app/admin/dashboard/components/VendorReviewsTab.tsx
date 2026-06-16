// src/pages/admin/dashboard/components/VendorReviewsTab.tsx

import { Star } from "lucide-react";
import type { VendorItem } from "../../../../agent/dashboard/mockAgentData";

interface Props {
  vendor: VendorItem;
}

export default function VendorReviewsTab({ vendor: v }: Props) {
  if (v.reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Star size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">No reviews yet</p>
        <p className="text-xs text-slate-400 mt-1">This vendor hasn't received any ratings.</p>
      </div>
    );
  }

  const avgRating = (v.reviews.reduce((s, r) => s + r.rating, 0) / v.reviews.length).toFixed(1);

  // Distribution count
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  v.reviews.forEach(r => { dist[r.rating] = (dist[r.rating] ?? 0) + 1; });

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Rating summary */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-5">
        <div className="text-center flex-shrink-0">
          <p className="text-4xl font-black text-amber-600">{avgRating}</p>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12}
                className={i < Math.round(Number(avgRating))
                  ? "fill-amber-400 text-amber-400"
                  : "text-amber-200"} />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{v.totalReviews} total</p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = dist[star] ?? 0;
            const pct   = v.reviews.length > 0 ? (count / v.reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-3 text-right flex-shrink-0">{star}</span>
                <Star size={9} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-3 flex-shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-2.5">
        {v.reviews.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-black text-slate-800">{r.customer}</p>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11}
                    className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                ))}
                <span className="text-xs font-black text-slate-600 ml-1">{r.rating}.0</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
            <p className="text-xs text-slate-400 mt-2">{r.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
