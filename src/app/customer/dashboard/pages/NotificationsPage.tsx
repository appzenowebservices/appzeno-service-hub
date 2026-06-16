// src/pages/customer/dashboard/pages/NotificationsPage.tsx

import { useState } from "react";
import {
  Bell, CheckCircle2, Package, Tag, AlertCircle,
  Star, Zap, MessageCircle, Check, X, Trash2
} from "lucide-react";

interface Notification {
  id:      string;
  type:    "booking"|"offer"|"system"|"review"|"payment";
  title:   string;
  message: string;
  time:    string;
  read:    boolean;
  icon:    string;
}

const INITIAL_NOTIFS: Notification[] = [
  { id:"n1", type:"booking", title:"Vendor Assigned!",          message:"Ravi Kumar (⭐4.9) assigned for your Plumbing booking on 27 Feb at 2:00 PM.", time:"10 min ago", read:false, icon:"🔧" },
  { id:"n2", type:"offer",   title:"New Offer Available",        message:"CLEAN20 — 20% off on Home Cleaning. Valid till 28 Feb 2026. Use code at checkout.", time:"2 hrs ago",  read:false, icon:"🏷️" },
  { id:"n3", type:"booking", title:"Booking Confirmed",          message:"Your AC Service booking (BK-0103-0041) for 1 Mar 11 AM is confirmed.", time:"1 day ago",  read:false, icon:"❄️" },
  { id:"n4", type:"payment", title:"Cashback Credited",          message:"₹50 cashback added to your wallet for Home Cleaning booking BK-2502-0023.", time:"3 days ago", read:true,  icon:"💰" },
  { id:"n5", type:"review",  title:"Rate Your Experience",       message:"How was the Electrical Work by Power Fix? Leave a review to help others.", time:"5 days ago", read:true,  icon:"⭐" },
  { id:"n6", type:"system",  title:"Profile Verification Done",  message:"Your KYC is complete. You can now access all ADDies features.", time:"1 week ago", read:true,  icon:"✅" },
  { id:"n7", type:"offer",   title:"Refer & Earn ₹100",          message:"Invite friends to ADDies and earn ₹100 wallet credit per successful referral.", time:"2 weeks ago",read:true,  icon:"🎁" },
];

const TYPE_CONFIG: Record<string, { label:string; bg:string; text:string; dotColor:string }> = {
  booking: { label:"Booking", bg:"bg-blue-50",   text:"text-blue-700",   dotColor:"bg-blue-500" },
  offer:   { label:"Offer",   bg:"bg-amber-50",  text:"text-amber-700",  dotColor:"bg-amber-500" },
  system:  { label:"System",  bg:"bg-slate-50",  text:"text-slate-700",  dotColor:"bg-slate-400" },
  review:  { label:"Review",  bg:"bg-violet-50", text:"text-violet-700", dotColor:"bg-violet-500" },
  payment: { label:"Payment", bg:"bg-emerald-50",text:"text-emerald-700",dotColor:"bg-emerald-500" },
};

const FILTER_TABS = ["All","Booking","Offer","Payment","System"];

export default function NotificationsPage() {
  const [notifs,    setNotifs]   = useState<Notification[]>(INITIAL_NOTIFS);
  const [activeTab, setActiveTab] = useState("All");

  const unread = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    if (activeTab === "All") return true;
    return n.type.toLowerCase() === activeTab.toLowerCase();
  });

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read:true } : n));
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read:true })));
  }

  function deleteNotif(id: string) {
    setNotifs(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div className="mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Notifications</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {unread > 0 ? <span className="text-blue-600 font-semibold">{unread} unread</span> : "All caught up"}
            {" · "}{notifs.length} total
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Check size={12} /> Mark All Read
          </button>
        )}
      </div>

      {/* ── Unread banner ── */}
      {unread > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Bell size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-800">You have {unread} unread notification{unread > 1 ? "s" : ""}</p>
            <p className="text-xs text-blue-600">Click on a notification to mark it as read.</p>
          </div>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map(tab => {
          const count = tab === "All" ? notifs.length : notifs.filter(n => n.type.toLowerCase() === tab.toLowerCase()).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${activeTab === tab ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"}`}>
              {tab}
              {count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                  ${activeTab === tab ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notification List ── */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <Bell size={28} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No notifications here</p>
          </div>
        )}

        {filtered.map(n => {
          const tc = TYPE_CONFIG[n.type];
          return (
            <div key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer group transition-all hover:shadow-sm
                ${n.read ? "bg-white border-slate-100" : "bg-blue-50/40 border-blue-200"}`}>

              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                {n.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-bold ${n.read ? "text-slate-700" : "text-slate-900"}`}>{n.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tc.bg} ${tc.text}`}>{tc.label}</span>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1.5">{n.time}</p>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Notification preferences ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">Notification Preferences</p>
        <div className="space-y-3">
          {[
            { label:"Booking updates",    sub:"Status changes, vendor assignment", on:true  },
            { label:"Offers & deals",     sub:"Coupons, discounts, referral",      on:true  },
            { label:"Payment & wallet",   sub:"Cashback, credits, invoices",       on:true  },
            { label:"Reviews & ratings",  sub:"Reminders to rate service",         on:false },
          ].map(pref => (
            <div key={pref.label} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-semibold text-slate-700">{pref.label}</p>
                <p className="text-xs text-slate-400">{pref.sub}</p>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0
                ${pref.on ? "bg-emerald-500" : "bg-slate-200"}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm mt-0.5 transition-transform
                  ${pref.on ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
