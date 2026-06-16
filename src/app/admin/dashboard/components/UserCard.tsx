// src/pages/admin/dashboard/components/UserCard.tsx

import { Phone, Mail, MapPin, Star, ShoppingBag, IndianRupee, ChevronRight } from "lucide-react";
import type { CustomerRecord } from "../mockAdminData";
import UserAvatar      from "./UserAvatar";
import UserStatusBadge from "./UserStatusBadge";

interface Props {
  customer: CustomerRecord;
  onView:   () => void;
}

export default function UserCard({ customer: c, onView }: Props) {
  return (
    <div
      onClick={onView}
      className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md
        hover:border-sky-200 transition-all cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <UserAvatar name={c.name} size="md" shape="circle" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-slate-800 truncate">{c.name}</p>
            <UserStatusBadge status={c.status} />
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{c.customerId}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-600">{c.rating}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Phone size={11} className="flex-shrink-0 text-slate-400" />
          <span>{c.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Mail size={11} className="flex-shrink-0 text-slate-400" />
          <span className="truncate">{c.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin size={11} className="flex-shrink-0 text-slate-400" />
          <span>{c.city}</span>
          <span className="text-slate-300">·</span>
          <span>Joined {c.joinedDate}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5 flex-1">
          <ShoppingBag size={12} className="text-violet-500" />
          <span className="text-xs font-black text-slate-800">{c.totalBookings}</span>
          <span className="text-xs text-slate-400">bookings</span>
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <IndianRupee size={12} className="text-emerald-500" />
          <span className="text-xs font-black text-slate-800">
            ₹{c.totalSpend.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-400">spent</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${
            c.lastActive === "Today" ? "bg-emerald-400" :
            c.lastActive === "Yesterday" ? "bg-amber-400" : "bg-slate-300"
          }`} />
          {c.lastActive}
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-400 transition-colors flex-shrink-0" />
      </div>
    </div>
  );
}
