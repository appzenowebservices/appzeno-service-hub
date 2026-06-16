// src/pages/admin/dashboard/components/DisputeCard.tsx

import { User, Store, MapPin, Calendar, IndianRupee, MessageSquare, ChevronRight } from "lucide-react";
import type { AdminDispute } from "../mockAdminData";
import DisputeStatusBadge from "./DisputeStatusBadge";

interface Props {
  dispute: AdminDispute;
  onView:  () => void;
}

const VERDICT_LABEL: Record<string, { label: string; color: string }> = {
  favor_customer: { label: "Favored Customer",  color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  favor_vendor:   { label: "Favored Vendor",    color: "text-sky-700 bg-sky-50 border-sky-200"             },
  partial_refund: { label: "Partial Refund",    color: "text-amber-700 bg-amber-50 border-amber-200"       },
  no_action:      { label: "No Action",         color: "text-slate-600 bg-slate-50 border-slate-200"       },
};

export default function DisputeCard({ dispute: d, onView }: Props) {
  return (
    <div onClick={onView}
      className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-all cursor-pointer group
        ${d.status === "escalated" ? "border-violet-200 hover:border-violet-300" :
          d.status === "open"      ? "border-red-200 hover:border-red-300" :
          "border-slate-100 hover:border-sky-200"}`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0">{d.serviceIcon}</span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">{d.service}</p>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{d.bookingId}</p>
          </div>
        </div>
        <DisputeStatusBadge status={d.status} pulse />
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <User size={10} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Customer</span>
          </div>
          <p className="text-xs font-bold text-slate-800 truncate">{d.customerName}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Store size={10} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Vendor</span>
          </div>
          <p className="text-xs font-bold text-slate-800 truncate">{d.vendorName}</p>
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{d.description}</p>

      {/* Verdict (if resolved) */}
      {d.verdict && VERDICT_LABEL[d.verdict] && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold mb-3
          ${VERDICT_LABEL[d.verdict].color}`}>
          ⚖️ {VERDICT_LABEL[d.verdict].label}
          {d.refundIssued > 0 && ` · ₹${d.refundIssued.toLocaleString("en-IN")} refunded`}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1"><MapPin size={10} />{d.city}</span>
          <span className="flex items-center gap-1"><IndianRupee size={10} />₹{d.jobAmount.toLocaleString("en-IN")}</span>
          <span className="flex items-center gap-1"><MessageSquare size={10} />{d.messages.length}</span>
          <span className="flex items-center gap-1"><Calendar size={10} />{d.raisedOn}</span>
        </div>
        <ChevronRight size={14}
          className="text-slate-300 group-hover:text-sky-500 flex-shrink-0 transition-colors group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
