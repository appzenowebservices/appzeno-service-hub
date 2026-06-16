// src/pages/customer/booking/Step4Schedule.tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Clock, Info } from "lucide-react";
import type { Step1Data, Step4Data, VendorSlot } from "./types";
import { ALL_TIME_SLOTS, UNAVAILABLE_TODAY } from "./data";
import { MOCK_CATEGORIES } from "../../../../data/mockData";

interface Props {
  step1:   Step1Data;
  data:    Step4Data;
  errors:  Record<string,string>;
  onChange:(d: Step4Data) => void;
}

// ── Booking Calendar ──────────────────────────────────────────────────────────
function BookingCalendar({ selectedDate, onSelect }: {
  selectedDate:string; onSelect:(d:string)=>void;
}) {
  const today     = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year,  setYear]  = useState(today.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const monthNames  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dayNames    = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  const cells: (number|null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length:daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <button onClick={() => {
          if (month === 0) { setMonth(11); setYear(y => y-1); }
          else setMonth(m => m-1);
        }} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-black text-slate-800">{monthNames[month]} {year}</p>
        <button onClick={() => {
          if (month === 11) { setMonth(0); setYear(y => y+1); }
          else setMonth(m => m+1);
        }} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-black text-slate-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateObj  = new Date(year, month, day);
            const dateStr  = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const isPast   = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isFuture = dateObj > maxDate;
            const disabled = isPast || isFuture;
            const isSelected = dateStr === selectedDate;
            const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            return (
              <button key={i} disabled={disabled} onClick={() => onSelect(dateStr)}
                className={`relative h-9 w-9 mx-auto rounded-xl text-xs font-bold transition-all duration-150
                  ${isSelected ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : disabled   ? "text-slate-200 cursor-not-allowed"
                  : isToday    ? "bg-slate-100 text-emerald-700 ring-1 ring-emerald-300"
                               : "hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"}`}>
                {day}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Time Slot Grid ────────────────────────────────────────────────────────────
function TimeSlotGrid({ selectedSlot, date, onSelect }: {
  selectedSlot:string; date:string; onSelect:(s:string)=>void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_TIME_SLOTS.map(slot => {
        const isUnavailable = date === todayStr && UNAVAILABLE_TODAY.includes(slot);
        const isSelected    = selectedSlot === slot;
        return (
          <button key={slot} type="button" disabled={isUnavailable}
            onClick={() => onSelect(slot)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
              ${isUnavailable ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
              : isSelected    ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100"
                              : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"}`}>
            <Clock size={13} className={isUnavailable ? "text-slate-300" : isSelected ? "text-emerald-500" : "text-slate-400"} />
            {slot}
            {isUnavailable && (
              <span className="absolute top-1 right-2 text-xs text-slate-300 font-normal">Full</span>
            )}
            {isSelected && <Check size={13} className="text-emerald-500 ml-auto" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Step4 ────────────────────────────────────────────────────────────────
export default function Step4Schedule({ step1, data, errors, onChange }: Props) {
  const categories = step1.categoryIds
    .map(id => MOCK_CATEGORIES.find(c => c.id === id))
    .filter(Boolean) as typeof MOCK_CATEGORIES;

  // Multi-category: track which tab is active
  const [activeIdx, setActiveIdx] = useState(0);

  function getSlot(catId: string): VendorSlot | undefined {
    return data.vendorSlots.find(s => s.categoryId === catId);
  }

  function updateSlot(catId: string, catName: string, catIcon: string, partial: Partial<VendorSlot>) {
    const existing = data.vendorSlots.find(s => s.categoryId === catId);
    const updated  = {
      categoryId:   catId,
      categoryName: catName,
      categoryIcon: catIcon,
      date:         "",
      timeSlot:     "",
      flexibility:  "flexible" as const,
      ...existing,
      ...partial,
    };
    const rest = data.vendorSlots.filter(s => s.categoryId !== catId);
    onChange({ ...data, vendorSlots: [...rest, updated] });
  }

  const activeCat = categories[activeIdx];
  const activeSlot = activeCat ? getSlot(activeCat.id) : undefined;
  const completedCount = data.vendorSlots.filter(s => s.date && s.timeSlot).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">When do you need it?</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {categories.length > 1
            ? `Set date & time for each of your ${categories.length} selected services separately`
            : "Pick a date and time that works for you"}
        </p>
      </div>

      {/* ── Multi-category tab indicator ── */}
      {categories.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-500 uppercase tracking-wide">Select service to schedule</span>
            <span className={`font-bold ${completedCount === categories.length ? "text-emerald-600" : "text-amber-600"}`}>
              {completedCount}/{categories.length} scheduled
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat, i) => {
              const slot    = getSlot(cat.id);
              const isDone  = !!(slot?.date && slot?.timeSlot);
              return (
                <button key={cat.id} onClick={() => setActiveIdx(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 whitespace-nowrap text-xs font-bold transition-all flex-shrink-0
                    ${activeIdx === i
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                  <span className="text-base">{cat.icon}</span>
                  {cat.name}
                  {isDone
                    ? <Check size={12} className="text-emerald-500" />
                    : <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </button>
              );
            })}
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            Each service will be assigned a separate vendor. You can schedule them at different times if needed.
          </div>
        </div>
      )}

      {/* ── Per-category scheduling ── */}
      {activeCat && (
        <div className="space-y-4">
          {categories.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xl">{activeCat.icon}</span>
              <div>
                <p className="text-sm font-black text-slate-800">{activeCat.name}</p>
                <p className="text-xs text-slate-500">Scheduling for this vendor separately</p>
              </div>
            </div>
          )}

          {/* Calendar */}
          <div data-field={`date_${activeCat.id}`}>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
              Select Date <span className="text-red-400">*</span>
            </label>
            <BookingCalendar
              selectedDate={activeSlot?.date || ""}
              onSelect={d => updateSlot(activeCat.id, activeCat.name, activeCat.icon, { date:d, timeSlot:"" })}
            />
            {errors[`date_${activeCat.id}`] && (
              <p className="text-xs text-red-500 mt-1">{errors[`date_${activeCat.id}`]}</p>
            )}
          </div>

          {/* Time Slots */}
          {activeSlot?.date && (
            <div data-field={`timeSlot_${activeCat.id}`}>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                Select Time Slot <span className="text-red-400">*</span>
              </label>
              <TimeSlotGrid
                selectedSlot={activeSlot?.timeSlot || ""}
                date={activeSlot.date}
                onSelect={s => updateSlot(activeCat.id, activeCat.name, activeCat.icon, { timeSlot:s })}
              />
              {errors[`timeSlot_${activeCat.id}`] && (
                <p className="text-xs text-red-500 mt-1">{errors[`timeSlot_${activeCat.id}`]}</p>
              )}
            </div>
          )}

          {/* Flexibility */}
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
              Timing Flexibility
            </label>
            <div className="flex gap-3">
              {[
                { val:"flexible", label:"Flexible ±3 hrs", sub:"Vendor may arrive within 3 hrs of slot" },
                { val:"exact",    label:"Exact Time",       sub:"Vendor must arrive exactly on time" },
              ].map(({ val, label, sub }) => {
                const selected = (activeSlot?.flexibility || "flexible") === val;
                return (
                  <button key={val} type="button"
                    onClick={() => updateSlot(activeCat.id, activeCat.name, activeCat.icon, { flexibility: val as VendorSlot["flexibility"] })}
                    className={`flex-1 p-3 rounded-xl border-2 text-left transition-all
                      ${selected ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <p className={`text-sm font-bold ${selected ? "text-emerald-700" : "text-slate-700"}`}>{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                    {selected && <Check size={12} className="text-emerald-500 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigate between categories */}
          {categories.length > 1 && (
            <div className="flex justify-between gap-3 pt-1">
              <button
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx(i => i - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all">
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={activeIdx === categories.length - 1}
                onClick={() => setActiveIdx(i => i + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold disabled:opacity-40 hover:bg-emerald-600 transition-all">
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary of all slots */}
      {categories.length > 1 && data.vendorSlots.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Schedule Summary</p>
          </div>
          <div className="divide-y divide-slate-50">
            {categories.map(cat => {
              const slot = getSlot(cat.id);
              const done = slot?.date && slot?.timeSlot;
              return (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-lg">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                    <p className="text-xs text-slate-500">
                      {done ? `${slot?.date} · ${slot?.timeSlot}` : "Not scheduled yet"}
                    </p>
                  </div>
                  {done
                    ? <Check size={15} className="text-emerald-500 flex-shrink-0" />
                    : <span className="text-xs text-amber-500 font-bold">Pending</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
