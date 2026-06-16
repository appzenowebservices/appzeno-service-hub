// src/pages/admin/dashboard/components/UserBookingsTab.tsx

import { CheckCircle2, XCircle, Clock, AlertTriangle, ShoppingBag } from "lucide-react";
import type { CustomerRecord, CustomerBooking } from "../mockAdminData";
import { CUSTOMER_BOOKINGS } from "../mockAdminData";

const STATUS_CONFIG: Record<CustomerBooking["status"], {
  label:  string;
  icon:   React.ElementType;
  color:  string;
  bg:     string;
  border: string;
}> = {
  completed: { label: "Completed", icon: CheckCircle2,  color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200" },
  cancelled: { label: "Cancelled", icon: XCircle,       color: "text-red-600",     bg: "bg-red-50",      border: "border-red-200"     },
  ongoing:   { label: "Ongoing",   icon: Clock,         color: "text-blue-700",    bg: "bg-blue-50",     border: "border-blue-200"    },
  disputed:  { label: "Disputed",  icon: AlertTriangle, color: "text-orange-700",  bg: "bg-orange-50",   border: "border-orange-200"  },
};

interface Props {
  customer: CustomerRecord;
}

export default function UserBookingsTab({ customer: c }: Props) {
  const bookings = CUSTOMER_BOOKINGS[c.id] ?? [];

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <ShoppingBag size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">No bookings yet</p>
        <p className="text-xs text-slate-400 mt-1">This customer hasn't placed any orders.</p>
      </div>
    );
  }

  const totalBookingAmount = bookings.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Summary */}
      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
        <span className="text-xs text-slate-500 font-medium">{bookings.length} bookings total</span>
        <span className="text-xs font-black text-slate-800">
          ₹{totalBookingAmount.toLocaleString("en-IN")} total
        </span>
      </div>

      {/* Booking list */}
      <div className="space-y-2.5">
        {bookings.map(b => {
          const cfg  = STATUS_CONFIG[b.status];
          const Icon = cfg.icon;
          return (
            <div key={b.id}
              className={`bg-white rounded-2xl border ${cfg.border} p-4 flex items-start gap-3`}>

              {/* Emoji icon */}
              <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center
                text-lg flex-shrink-0 border ${cfg.border}`}>
                {b.icon}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{b.service}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {b.vendor} · {b.date}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-800">
                      ₹{b.amount.toLocaleString("en-IN")}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold
                      ${cfg.color} mt-0.5`}>
                      <Icon size={10} /> {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Booking ID */}
                <p className="text-xs font-mono text-slate-300 mt-1.5">{b.id}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
