// src/pages/customer/dashboard/pages/MyBookingsPage.tsx

import { useState } from "react";
import {
  Search, Filter, Star, Clock, MapPin, Phone, MessageCircle,
  CheckCircle2, XCircle, Calendar, Wrench, ChevronDown,
  RefreshCcw, ReceiptText, Navigation, AlertCircle
} from "lucide-react";

const ALL_BOOKINGS = [
  {
    id:"BK-2502-0023", service:"Home Cleaning",   icon:"🧹", vendor:"CleanPro Services",   vendorPhone:"+91 98765 43210",
    date:"25 Feb 2026",  time:"10:00 AM", status:"completed",  amount:499,  rating:5,    review:"Excellent work! Very thorough.",
    address:"Sector 15, Lucknow", duration:"3 hrs", category:"Cleaning",
  },
  {
    id:"BK-2702-0087", service:"Plumbing Repair",  icon:"🔧", vendor:"Kumar Plumbers",      vendorPhone:"+91 97654 32109",
    date:"27 Feb 2026",  time:"2:00 PM",  status:"assigned",   amount:350,  rating:null, review:null,
    address:"Gomti Nagar, Lucknow", duration:"1.5 hrs", category:"Plumbing",
  },
  {
    id:"BK-0103-0041", service:"AC Service",        icon:"❄️", vendor:"CoolBreeze AC",        vendorPhone:"+91 96543 21098",
    date:"1 Mar 2026",   time:"11:00 AM", status:"pending",    amount:699,  rating:null, review:null,
    address:"Aliganj, Lucknow", duration:"2 hrs", category:"AC Service",
  },
  {
    id:"BK-1802-0015", service:"Electrical Work",   icon:"⚡", vendor:"Power Fix",            vendorPhone:"+91 95432 10987",
    date:"18 Feb 2026",  time:"9:00 AM",  status:"completed",  amount:420,  rating:4,    review:"Good service, came on time.",
    address:"Hazratganj, Lucknow", duration:"2 hrs", category:"Electrical",
  },
  {
    id:"BK-1002-0009", service:"Pest Control",      icon:"🐛", vendor:"PestAway Solutions",   vendorPhone:"+91 94321 09876",
    date:"10 Feb 2026",  time:"4:00 PM",  status:"cancelled",  amount:999,  rating:null, review:null,
    address:"Indira Nagar, Lucknow", duration:"2 hrs", category:"Pest Control",
  },
  {
    id:"BK-0502-0003", service:"Sofa Cleaning",     icon:"🛋️", vendor:"FabriClean",          vendorPhone:"+91 93210 98765",
    date:"5 Feb 2026",   time:"3:00 PM",  status:"completed",  amount:799,  rating:5,    review:"Sofa looks brand new!",
    address:"Gomti Nagar, Lucknow", duration:"2.5 hrs", category:"Cleaning",
  },
];

const STATUS_CONFIG: Record<string, {
  label:string; bg:string; text:string; dot:string; borderColor:string;
  description:string; icon:React.ElementType;
}> = {
  completed:   { label:"Completed",   bg:"bg-emerald-50", text:"text-emerald-700", dot:"bg-emerald-500", borderColor:"border-emerald-200", description:"Service delivered successfully", icon:CheckCircle2 },
  assigned:    { label:"Assigned",    bg:"bg-blue-50",    text:"text-blue-700",    dot:"bg-blue-500",    borderColor:"border-blue-200",    description:"Vendor confirmed, arriving on time", icon:Navigation },
  pending:     { label:"Pending",     bg:"bg-amber-50",   text:"text-amber-700",   dot:"bg-amber-400",   borderColor:"border-amber-200",   description:"Finding best vendor for you", icon:Clock },
  cancelled:   { label:"Cancelled",  bg:"bg-red-50",     text:"text-red-700",     dot:"bg-red-500",     borderColor:"border-red-200",     description:"Booking was cancelled", icon:XCircle },
  in_progress: { label:"In Progress",bg:"bg-violet-50",  text:"text-violet-700",  dot:"bg-violet-500",  borderColor:"border-violet-200",  description:"Vendor is working at your location", icon:Wrench },
};

const TABS = ["All", "Upcoming", "Completed", "Cancelled"];

export default function MyBookingsPage() {
  const [activeTab,    setActiveTab]    = useState("All");
  const [search,       setSearch]       = useState("");
  const [expandedId,   setExpandedId]   = useState<string|null>(null);
  const [ratingModal,  setRatingModal]  = useState<string|null>(null);
  const [tempRating,   setTempRating]   = useState(0);

  const filtered = ALL_BOOKINGS.filter(b => {
    const matchTab =
      activeTab === "All" ? true
      : activeTab === "Upcoming"  ? ["pending","assigned"].includes(b.status)
      : activeTab === "Completed" ? b.status === "completed"
      : b.status === "cancelled";
    const matchSearch = !search || b.service.toLowerCase().includes(search.toLowerCase()) || b.vendor.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    All:       ALL_BOOKINGS.length,
    Upcoming:  ALL_BOOKINGS.filter(b => ["pending","assigned"].includes(b.status)).length,
    Completed: ALL_BOOKINGS.filter(b => b.status === "completed").length,
    Cancelled: ALL_BOOKINGS.filter(b => b.status === "cancelled").length,
  };

  return (
    <div className="space-y-6 mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-800">My Bookings</h2>
          <p className="text-sm text-slate-400 mt-0.5">{ALL_BOOKINGS.length} total · {counts.Upcoming} upcoming</p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search service or vendor..."
            className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white w-full sm:w-60
                       focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Total",     value:ALL_BOOKINGS.length,          color:"text-slate-800",  bg:"bg-slate-100" },
          { label:"Upcoming",  value:counts.Upcoming,              color:"text-blue-700",   bg:"bg-blue-50" },
          { label:"Done",      value:counts.Completed,             color:"text-emerald-700",bg:"bg-emerald-50" },
          { label:"Cancelled", value:counts.Cancelled,             color:"text-red-700",    bg:"bg-red-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
              ${activeTab === tab
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"}`}>
            {tab}
            <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full
              ${activeTab === tab ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500"}`}>
              {counts[tab as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Booking List ── */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">No bookings found</p>
            <p className="text-sm text-slate-400 mt-1">Try changing the filter or search query.</p>
          </div>
        )}

        {filtered.map(b => {
          const st  = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
          const StIcon = st.icon;
          const isExpanded = expandedId === b.id;

          return (
            <div key={b.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${st.borderColor}`}>

              {/* ── Main Row ── */}
              <div className="flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : b.id)}>

                {/* Service Icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {b.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{b.service}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{b.vendor}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-slate-800">₹{b.amount}</p>
                      {b.rating && (
                        <div className="flex items-center gap-0.5 justify-end mt-0.5">
                          {[...Array(5)].map((_,i) => (
                            <Star key={i} size={10} className={i < b.rating! ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-3 mt-2">
                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={11} />
                      {b.date} · {b.time}
                    </div>
                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>
                </div>

                <ChevronDown size={16}
                  className={`text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              {/* ── Expanded Details ── */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50">

                  {/* Status banner */}
                  <div className={`mx-4 mt-4 flex items-center gap-3 p-3 rounded-xl border ${st.borderColor} ${st.bg}`}>
                    <StIcon size={16} className={st.text} />
                    <div>
                      <p className={`text-xs font-bold ${st.text}`}>{st.label}</p>
                      <p className={`text-xs ${st.text} opacity-75`}>{st.description}</p>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Booking details */}
                    <div className="space-y-2.5">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Booking Details</p>
                      {[
                        { label:"Booking ID",   value:b.id, mono:true },
                        { label:"Service",      value:b.service },
                        { label:"Duration",     value:b.duration },
                        { label:"Category",     value:b.category },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{row.label}</span>
                          <span className={`text-xs font-semibold text-slate-700 ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Vendor info */}
                    <div className="space-y-2.5">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Vendor Info</p>
                      <p className="text-sm font-bold text-slate-800">{b.vendor}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={11} /> {b.address}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={11} /> {b.vendorPhone}
                      </div>
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <div className="flex gap-2 mt-2">
                          <a href={`tel:${b.vendorPhone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors">
                            <Phone size={11} /> Call
                          </a>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                            <MessageCircle size={11} /> Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review section */}
                  {b.status === "completed" && (
                    <div className="px-4 pb-4">
                      {b.review ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                          <p className="text-xs font-black text-emerald-700 mb-1">Your Review</p>
                          <div className="flex gap-0.5 mb-1">
                            {[...Array(5)].map((_,i) => (
                              <Star key={i} size={12} className={i < (b.rating??0) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                            ))}
                          </div>
                          <p className="text-xs text-emerald-700">{b.review}</p>
                        </div>
                      ) : (
                        <button onClick={() => setRatingModal(b.id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors">
                          <Star size={14} /> Rate this Service
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 px-4 pb-4">
                    <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <ReceiptText size={12} /> Invoice
                    </button>
                    {["pending","assigned"].includes(b.status) && (
                      <>
                        <button className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors">
                          <RefreshCcw size={12} /> Reschedule
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                          <XCircle size={12} /> Cancel
                        </button>
                      </>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Rating Modal ── */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setRatingModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10">
            <h3 className="text-lg font-black text-slate-800 mb-1">Rate Your Experience</h3>
            <p className="text-sm text-slate-400 mb-5">How was the service?</p>
            <div className="flex justify-center gap-3 mb-5">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setTempRating(n)}
                  className="transition-transform hover:scale-110">
                  <Star size={36} className={n <= tempRating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                </button>
              ))}
            </div>
            <textarea rows={3} placeholder="Write a review (optional)..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none
                         focus:outline-none focus:border-blue-400 transition-all mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRatingModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Skip
              </button>
              <button onClick={() => setRatingModal(null)}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
                Submit ⭐
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
