// src/pages/admin/dashboard/components/DisputeDrawerHeader.tsx

import { X, Phone, MapPin, User, Store, IndianRupee, Calendar } from "lucide-react";
import type { AdminDispute } from "../mockAdminData";
import DisputeStatusBadge from "./DisputeStatusBadge";

interface Props {
  dispute: AdminDispute;
  onClose: () => void;
}

export default function DisputeDrawerHeader({ dispute: d, onClose }: Props) {
  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-sm font-black text-slate-800">Dispute Details</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{d.bookingId}</p>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Service hero */}
      <div className={`px-5 py-5 border-b border-slate-100 flex-shrink-0
        ${d.status === "escalated" ? "bg-gradient-to-br from-violet-50 to-slate-50" :
          d.status === "open"      ? "bg-gradient-to-br from-red-50 to-slate-50" :
          "bg-gradient-to-br from-sky-50 to-slate-50"}`}>

        {/* Service + status */}
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{d.serviceIcon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-slate-800 truncate">{d.service}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{d.category} · {d.city}</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <DisputeStatusBadge status={d.status} pulse />
              {d.assignedTo !== "Unassigned" && (
                <span className="text-xs text-slate-500 font-medium">
                  Assigned to <strong>{d.assignedTo}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Parties side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <User size={12} className="text-sky-500" />
              <span className="text-xs font-black text-sky-700 uppercase tracking-wide">Customer</span>
            </div>
            <p className="text-sm font-black text-slate-800">{d.customerName}</p>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{d.customerId}</p>
            <a href={`tel:${d.customerPhone}`}
              className="flex items-center gap-1 text-xs text-sky-600 font-medium mt-2 hover:text-sky-700">
              <Phone size={10} /> {d.customerPhone}
            </a>
          </div>

          {/* Vendor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Store size={12} className="text-violet-500" />
              <span className="text-xs font-black text-violet-700 uppercase tracking-wide">Vendor</span>
            </div>
            <p className="text-sm font-black text-slate-800 truncate">{d.vendorName}</p>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{d.vendorId}</p>
            <a href={`tel:${d.vendorPhone}`}
              className="flex items-center gap-1 text-xs text-violet-600 font-medium mt-2 hover:text-violet-700">
              <Phone size={10} /> {d.vendorPhone}
            </a>
          </div>
        </div>

        {/* Financial summary */}
        <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-4">
          <div className="flex-1 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Job Amount</p>
            <p className="text-base font-black text-slate-800 flex items-center justify-center gap-0.5">
              <IndianRupee size={13} /> {d.jobAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex-1 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Refund Requested</p>
            <p className="text-base font-black text-red-600 flex items-center justify-center gap-0.5">
              <IndianRupee size={13} /> {d.refundRequested.toLocaleString("en-IN")}
            </p>
          </div>
          {d.refundIssued > 0 && (
            <>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex-1 text-center">
                <p className="text-xs text-slate-400 mb-0.5">Refund Issued</p>
                <p className="text-base font-black text-emerald-600 flex items-center justify-center gap-0.5">
                  <IndianRupee size={13} /> {d.refundIssued.toLocaleString("en-IN")}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Calendar size={10} /> Raised {d.raisedOn}</span>
          <span className="flex items-center gap-1"><MapPin size={10} /> {d.city}</span>
          <span>by <strong>{d.raisedBy === "customer" ? d.customerName : d.vendorName}</strong></span>
        </div>
      </div>
    </>
  );
}
