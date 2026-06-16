// src/pages/customer/booking/components/DispatchAnimation.tsx
import { useState, useEffect } from "react";
import { Check, CheckCircle2 } from "lucide-react";

interface Props {
  bookingId: string;
  onDone:    () => void;
}

export default function DispatchAnimation({ bookingId, onDone }: Props) {
  const [phase, setPhase] = useState<"calculating"|"notifying"|"accepted"|"confirmed">("calculating");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("notifying"),  1800),
      setTimeout(() => setPhase("accepted"),   4000),
      setTimeout(() => setPhase("confirmed"),  5800),
      setTimeout(() => onDone(),               7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const phases = ["calculating","notifying","accepted","confirmed"];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
      <div className="text-center max-w-sm px-6">
        {/* Animated ring */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className={`absolute inset-0 rounded-full border-4 transition-all duration-700
            ${phase === "confirmed" ? "border-emerald-400" : "border-white/10 animate-ping"}`} />
          <div className={`absolute inset-2 rounded-full border-4 transition-all duration-700
            ${phase === "confirmed" ? "border-emerald-500" : "border-emerald-400/50"}`} />
          <div className="absolute inset-4 rounded-full bg-emerald-500 flex items-center justify-center">
            {phase === "confirmed"
              ? <CheckCircle2 size={36} className="text-white" />
              : <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin" />
            }
          </div>
          {phase !== "confirmed" && [0,1,2].map(i => (
            <div key={i} className="absolute w-3 h-3 rounded-full bg-emerald-400"
              style={{
                top:"50%", left:"50%",
                transform:`rotate(${i * 120}deg) translateX(52px) translateY(-50%)`,
                animation:"spin 1.5s linear infinite",
                animationDelay:`${i * 0.5}s`,
                opacity:0.7,
              }} />
          ))}
        </div>

        <div className="space-y-3">
          {[
            { key:"calculating", icon:"🔢", title:"Calculating Best Match",  sub:"Distance · Rating · Availability · Load" },
            { key:"notifying",   icon:"📡", title:"Notifying Top 3 Vendors",  sub:"5-minute accept window started" },
            { key:"accepted",    icon:"🤝", title:"Vendor Accepted!",         sub:"Ravi Kumar (⭐ 4.9) is on the way" },
            { key:"confirmed",   icon:"✅", title:"Booking Confirmed!",       sub:`Booking ID: ${bookingId}` },
          ].map((p, i) => {
            const done = phases.indexOf(phase) >= i;
            return (
              <div key={p.key} className={`flex items-center gap-3 transition-all duration-500
                ${done ? "opacity-100 translate-y-0" : "opacity-30"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                  ${done ? "bg-emerald-500" : "bg-white/10"}`}>
                  {done ? <Check size={14} className="text-white" /> : <span className="text-base">{p.icon}</span>}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${done ? "text-white" : "text-white/40"}`}>{p.title}</p>
                  <p className={`text-xs ${done ? "text-slate-400" : "text-white/20"}`}>{p.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
