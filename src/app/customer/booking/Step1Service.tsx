// src/pages/customer/booking/Step1Service.tsx
import { useState } from "react";
import {
  MapPin, Search, Check, ChevronDown,
  Home, Briefcase, Building2, ShoppingBag,
} from "lucide-react";
import type { Step1Data } from "./types";
import { CATEGORY_DATA } from "./data";
import { MOCK_CATEGORIES, MOCK_CITIES } from "../../../../data/mockData";

interface Props {
  data:   Step1Data;
  errors: Record<string,string>;
  onChange: (d: Step1Data) => void;
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export default function Step1Service({ data, errors, onChange }: Props) {
  const [citySearch,  setCitySearch]  = useState("");
  const [showCities,  setShowCities]  = useState(false);

  // All sub-services, problems, serviceTypes for selected categories combined (deduped)
  const selectedCatData = data.categoryIds.map(id => CATEGORY_DATA[id]).filter(Boolean);
  const allSubServices  = [...new Set(selectedCatData.flatMap(d => d.subServices))];
  const allServiceTypes = [...new Set(selectedCatData.flatMap(d => d.serviceTypes))];

  return (
    <div className="space-y-5 py-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">What service do you need?</h2>
        <p className="text-sm text-slate-400 mt-0.5">You can select multiple services — each will get a separate vendor</p>
      </div>

      {/* ── City ── */}
      <div data-field="city">
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Your City <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div
            className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 bg-white cursor-pointer
              hover:border-emerald-300 transition-all ${errors.city ? "border-red-300" : "border-slate-200"}`}
            onClick={() => setShowCities(!showCities)}
          >
            <MapPin size={15} className="text-emerald-500 flex-shrink-0" />
            <span className={`flex-1 text-sm ${data.cityName ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
              {data.cityName || "Select city..."}
            </span>
            <ChevronDown size={15} className={`text-slate-400 transition-transform ${showCities ? "rotate-180" : ""}`} />
          </div>

          {showCities && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                  <Search size={13} className="text-slate-400" />
                  <input autoFocus type="text" placeholder="Search city..."
                    value={citySearch} onChange={e => setCitySearch(e.target.value)}
                    className="bg-transparent text-sm flex-1 outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto">
                {MOCK_CITIES
                  .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
                  .map(city => (
                    <button key={city.id} type="button"
                      onClick={() => {
                        onChange({ ...data, cityId: city.id, cityName: city.name });
                        setShowCities(false);
                        setCitySearch("");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-left transition-colors">
                      <MapPin size={13} className="text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{city.name}</p>
                        <p className="text-xs text-slate-400">{city.state}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
      </div>

      {/* ── Service Category (MULTIPLE) ── */}
      <div data-field="categoryIds">
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Service Category <span className="text-red-400">*</span>
          <span className="ml-2 text-slate-400 font-normal normal-case text-xs">(Select multiple if needed)</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-8 gap-2">
          {MOCK_CATEGORIES.map(cat => {
            const selected = data.categoryIds.includes(cat.id);
            return (
              <button key={cat.id} type="button"
                onClick={() => onChange({
                  ...data,
                  categoryIds:  toggle(data.categoryIds, cat.id),
                  subServices:  [],
                  serviceTypes: [],
                })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-bold transition-all relative
                  ${selected
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"}`}>
                {selected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </div>
                )}
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-center leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
        {data.categoryIds.length > 1 && (
          <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <span className="font-bold">ℹ️ {data.categoryIds.length} categories selected</span>
            — each category will be assigned a separate vendor. You'll choose time slots for each.
          </div>
        )}
        {errors.categoryIds && <p className="text-xs text-red-500 mt-1">{errors.categoryIds}</p>}
      </div>

      {/* ── What exactly do you need? (Sub-Services, MULTIPLE) ── */}
      {allSubServices.length > 0 && (
        <div data-field="subServices">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
            What Exactly Do You Need? <span className="text-red-400">*</span>
            <span className="ml-2 text-slate-400 font-normal normal-case text-xs">(Select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allSubServices.map(sub => {
              const selected = data.subServices.includes(sub);
              return (
                <button key={sub} type="button"
                  onClick={() => onChange({ ...data, subServices: toggle(data.subServices, sub) })}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all
                    ${selected
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>
                  {selected && <Check size={11} />}
                  {sub}
                </button>
              );
            })}
          </div>
          {errors.subServices && <p className="text-xs text-red-500 mt-1">{errors.subServices}</p>}
        </div>
      )}

      {/* ── Property Type ── */}
      <div data-field="propertyType">
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Property Type <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-3">
          {[
            { icon:Building2,  label:"Apartment",  value:"apartment" },
            { icon:Home,       label:"House",       value:"house" },
            { icon:Briefcase,  label:"Office",      value:"office" },
            { icon:ShoppingBag,label:"Shop",        value:"shop" },
          ].map(({ icon: Icon, label, value }) => {
            const selected = data.propertyType === value;
            return (
              <button key={value} type="button"
                onClick={() => onChange({ ...data, propertyType: value as Step1Data["propertyType"] })}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all flex-1 min-w-[72px]
                  ${selected
                    ? "border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100"
                    : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${selected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <Icon size={18} />
                </div>
                <p className={`text-xs font-bold ${selected ? "text-emerald-700" : "text-slate-600"}`}>{label}</p>
                {selected && <Check size={12} className="text-emerald-500" />}
              </button>
            );
          })}
        </div>
        {errors.propertyType && <p className="text-xs text-red-500 mt-1">{errors.propertyType}</p>}
      </div>

      {/* ── Service Type (MULTIPLE) ── */}
      {allServiceTypes.length > 0 && (
        <div data-field="serviceTypes">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
            Service Type <span className="text-red-400">*</span>
            <span className="ml-2 text-slate-400 font-normal normal-case text-xs">(Select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allServiceTypes.map(st => {
              const selected = data.serviceTypes.includes(st);
              return (
                <button key={st} type="button"
                  onClick={() => onChange({ ...data, serviceTypes: toggle(data.serviceTypes, st) })}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all
                    ${selected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>
                  {selected && <Check size={11} />}
                  {st}
                </button>
              );
            })}
          </div>
          {errors.serviceTypes && <p className="text-xs text-red-500 mt-1">{errors.serviceTypes}</p>}
        </div>
      )}
    </div>
  );
}
