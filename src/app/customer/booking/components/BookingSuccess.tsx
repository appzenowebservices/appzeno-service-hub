// src/pages/customer/booking/components/BookingSuccess.tsx
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Star, Clock, Phone, ArrowRight } from "lucide-react";
import type { BookingFormData } from "../types";
import { MOCK_CATEGORIES } from "../../../../../data/mockData";

interface Props {
  bookingId: string;
  data:      BookingFormData;
}

export default function BookingSuccess({ bookingId, data }: Props) {
  const navigate = useNavigate();
  const { s1, s2, s4 } = data;

  const categories = s1.categoryIds.map(id => MOCK_CATEGORIES.find(c => c.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>

        <h1 className="text-2xl font-black text-slate-800 mb-2">Booking Confirmed! 🎉</h1>
        <p className="text-slate-500 text-sm mb-6">
          Your service request has been dispatched. Vendors will contact you shortly.
        </p>

        {/* Booking ID */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Booking ID</p>
          <p className="text-2xl font-black text-emerald-700">{bookingId}</p>
        </div>

        {/* Services booked */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-4 text-left space-y-2">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Services Booked</p>
          {s4.vendorSlots.map((slot, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-lg">{slot.categoryIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{slot.categoryName}</p>
                <p className="text-xs text-slate-400">📅 {slot.date} · ⏰ {slot.timeSlot}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon:Star,  label:"Avg Rating",   val:"4.9 ⭐" },
            { icon:Clock, label:"ETA",           val:s2.urgency === "emergency" ? "~45 min" : "~2 hrs" },
            { icon:Phone, label:"Support",       val:"1800-ADDies" },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <Icon size={16} className="text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-xs font-black text-slate-700">{val}</p>
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/customer")}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 mb-3">
          Go to Dashboard <ArrowRight size={16} />
        </button>
        <button onClick={() => navigate("/customer/bookings")}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
          Track Bookings
        </button>
      </div>
    </div>
  );
}
