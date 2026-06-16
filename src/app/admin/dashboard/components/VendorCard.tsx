// src/pages/admin/dashboard/components/VendorCard.tsx

import { Star, MapPin, Briefcase, IndianRupee, BadgeCheck, ChevronRight } from "lucide-react";
import type { VendorItem } from "../../../../agent/dashboard/mockAgentData";
import VendorAvatar      from "./VendorAvatar";
import VendorStatusBadge from "./VendorStatusBadge";
import VendorKycBadge   from "./VendorKycBadge";

interface Props {
  vendor:  VendorItem;
  onView:  () => void;
}

export default function VendorCard({ vendor: v, onView }: Props) {
  const kycOk = v.kycAadhaar && v.kycPan && v.kycPhoto && v.kycAddress;

  return (
    <div
      onClick={onView}
      className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md
        hover:border-sky-200 transition-all cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <VendorAvatar name={v.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-slate-800 truncate">{v.name}</p>
            {kycOk && <BadgeCheck size={13} className="text-blue-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {v.ownerName} · {v.category}
          </p>
        </div>
        <VendorStatusBadge status={v.status} />
      </div>

      {/* KYC compact */}
      <div className="mb-3">
        <VendorKycBadge
          aadhaar={v.kycAadhaar} pan={v.kycPan}
          photo={v.kycPhoto} address={v.kycAddress}
          compact
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center bg-amber-50 rounded-xl py-2">
          <p className="text-sm font-black text-amber-700 flex items-center justify-center gap-0.5">
            <Star size={11} className="fill-amber-400 text-amber-400" /> {v.rating}
          </p>
          <p className="text-xs text-slate-400">{v.totalReviews} reviews</p>
        </div>
        <div className="text-center bg-violet-50 rounded-xl py-2">
          <p className="text-sm font-black text-violet-700">{v.jobsDone}</p>
          <p className="text-xs text-slate-400">Jobs done</p>
        </div>
        <div className="text-center bg-emerald-50 rounded-xl py-2">
          <p className="text-sm font-black text-emerald-700">{v.completionRate}%</p>
          <p className="text-xs text-slate-400">Completion</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={10} /> {v.area}, {v.city}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee size={10} /> ₹{v.totalEarnings.toLocaleString("en-IN")}
          </span>
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-400 transition-colors" />
      </div>
    </div>
  );
}
