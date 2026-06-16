/**
 * BookingPage.tsx
 * Location: src/pages/customer/BookingPage.tsx
 *
 * Route: /customer/book  (already exists in App.tsx — sirf import add karo)
 * App.tsx mein:
 *   import BookingPage from "./pages/customer/BookingPage";
 *   <Route path="/customer/book" element={<ProtectedRoute allowedRoles={["customer"]}><BookingPage /></ProtectedRoute>} />
 *
 * Dependencies (already in project):
 *   - react-router-dom
 *   - lucide-react
 *   - tailwindcss
 *   Leaflet CDN loaded dynamically (OpenStreetMap, free)
 *   Nominatim reverse geocoding (free, no API key)
 *   postalpincode.in API (free)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  MapPin, ChevronRight, ChevronLeft, Check, Zap, Clock,
  AlertTriangle, Camera, Video, X, Calendar, IndianRupee,
  Shield, CreditCard, Wallet, Smartphone, Banknote, Tag,
  CheckCircle2, Loader2, Star, Navigation, Building2,
  Home, Briefcase, ShoppingBag, Wrench, Package, Search,
  RotateCcw, Phone, Info, ArrowRight, Sparkles, Timer,
  BadgeCheck, Users, TrendingUp, ChevronDown,
} from "lucide-react";
import { MOCK_CATEGORIES, MOCK_CITIES, getCityBySlug, getCategoryBySlug, cityToSlug } from "../../../data/mockData";

// ─── Sub-service & Problem data per category ─────────────────────────────────
const CATEGORY_DATA: Record<string, {
  subServices: string[];
  problems:    string[];
  serviceTypes: string[];
  basePrice:   number;
  visitCharge: number;
  estDuration: number; // hours
}> = {
  "1": { // Home Cleaning
    subServices: ["Full Home Cleaning","Kitchen Deep Clean","Bathroom Cleaning","Balcony Cleaning","Post-construction Clean"],
    problems:    ["Regular Maintenance","Deep Cleaning Required","Post-Event Cleanup","Pre-Move In","Post-Move Out"],
    serviceTypes:["Standard Clean","Deep Clean","Inspection","Sanitization"],
    basePrice:999, visitCharge:0, estDuration:3,
  },
  "2": { // Plumbing
    subServices: ["Pipe Leak Fix","Tap/Faucet Repair","Toilet Repair","Water Tank Clean","Drain Unblocking","New Fitting"],
    problems:    ["Water Leakage","Pipe Blockage","Low Pressure","No Water Supply","Tap Dripping","Toilet Overflow"],
    serviceTypes:["Repair","Replacement","Installation","Inspection"],
    basePrice:300, visitCharge:100, estDuration:1.5,
  },
  "3": { // Electrical
    subServices: ["Switchboard Repair","Fan Install/Repair","Wiring Work","MCB/Fuse Issue","Light Fitting","Inverter Service"],
    problems:    ["No Power","Short Circuit","Frequent Tripping","Fan Not Working","Light Flickering","Sparking"],
    serviceTypes:["Repair","Installation","Replacement","Inspection"],
    basePrice:300, visitCharge:100, estDuration:1.5,
  },
  "4": { // AC Service
    subServices: ["AC Service & Cleaning","Gas Refill","AC Repair","AC Installation","AC Uninstall","PCB Repair"],
    problems:    ["Not Cooling","Gas Leakage","Water Dripping","Noise Issue","Not Starting","Remote Not Working"],
    serviceTypes:["Service","Repair","Installation","Gas Refill"],
    basePrice:799, visitCharge:150, estDuration:2,
  },
  "5": { // Painting
    subServices: ["Interior Wall Paint","Exterior Paint","Waterproofing","Wood Polish","Texture Painting","Whitewash"],
    problems:    ["Peeling Paint","Dampness/Seepage","Old Paint Removal","New Paint Required","Touch Up Work"],
    serviceTypes:["Full Paint","Touch Up","Waterproofing","Inspection"],
    basePrice:1500, visitCharge:0, estDuration:8,
  },
  "6": { // Carpentry
    subServices: ["Door Repair","Furniture Repair","Cabinet Install","False Ceiling","Window Work","Bed Assembly"],
    problems:    ["Broken Door","Loose Hinges","Furniture Damage","Cabinet Issue","Window Not Closing","Bed Squeaking"],
    serviceTypes:["Repair","Installation","Replacement","Custom Work"],
    basePrice:400, visitCharge:100, estDuration:2,
  },
  "7": { // Pest Control
    subServices: ["Cockroach Treatment","Termite Control","Rodent Control","Mosquito Treatment","Bed Bug Treatment","Full Home Treatment"],
    problems:    ["Cockroach Infestation","Termite Damage","Rodent Sighting","Mosquito Problem","Bed Bugs","General Pest Issue"],
    serviceTypes:["Spray Treatment","Gel Treatment","Fumigation","Annual Contract"],
    basePrice:999, visitCharge:0, estDuration:2,
  },
  "8": { // Appliance Repair
    subServices: ["Washing Machine","Refrigerator","Microwave","Geyser/Water Heater","Dishwasher","TV/LED Repair"],
    problems:    ["Not Working","Making Noise","Water Leaking","Not Heating/Cooling","Display Error","Door Issue"],
    serviceTypes:["Repair","Service","Replacement","Installation"],
    basePrice:350, visitCharge:150, estDuration:1.5,
  },
  "9": { // Water Purifier
    subServices: ["RO Service","Filter Change","UV Lamp Replace","Membrane Replace","New Installation","Repair"],
    problems:    ["Slow Output","Bad Taste","Not Purifying","Leaking","Error Light","Total Failure"],
    serviceTypes:["Service","Repair","Installation","Filter Change"],
    basePrice:299, visitCharge:100, estDuration:1,
  },
  "10": { // Sofa/Carpet Cleaning
    subServices: ["Sofa Cleaning","Carpet/Rug Cleaning","Mattress Cleaning","Chair Cleaning","Curtain Cleaning"],
    problems:    ["Stains","Bad Odor","General Dirt","Pest in Fabric","Pre-Event Clean","Post-Pet Clean"],
    serviceTypes:["Dry Clean","Wet Clean","Steam Clean","Deep Clean"],
    basePrice:599, visitCharge:0, estDuration:2,
  },
  "11": { // Packers & Movers
    subServices: ["Home Shifting","Office Shifting","Vehicle Transport","Bike Transport","Storage","Part Load"],
    problems:    ["Full Home Move","Single Room Move","Office Relocation","Item Transport","Temporary Storage"],
    serviceTypes:["Local Move","Intercity Move","Loading Only","Packing Only"],
    basePrice:3000, visitCharge:0, estDuration:6,
  },
  "12": { // CCTV
    subServices: ["CCTV Installation","DVR/NVR Setup","Camera Repair","Cable Routing","Remote Access Setup","Upgrade"],
    problems:    ["New Installation","Camera Not Working","Blurry Image","No Recording","Night Vision Issue","Coverage Gaps"],
    serviceTypes:["Installation","Repair","Upgrade","Inspection"],
    basePrice:2500, visitCharge:200, estDuration:3,
  },
};

// ─── Time Slots ───────────────────────────────────────────────────────────────
const ALL_TIME_SLOTS = [
  "7:00 AM – 9:00 AM","9:00 AM – 11:00 AM","11:00 AM – 1:00 PM",
  "1:00 PM – 3:00 PM","3:00 PM – 5:00 PM","5:00 PM – 7:00 PM",
];
// Mock unavailable slots for today
const UNAVAILABLE_TODAY = ["7:00 AM – 9:00 AM","1:00 PM – 3:00 PM"];

// ─── Coupons ──────────────────────────────────────────────────────────────────
const VALID_COUPONS: Record<string,{ type:"percent"|"flat"; value:number; desc:string }> = {
  "ADDIES10":  { type:"percent", value:10, desc:"10% off on total" },
  "FLAT50":    { type:"flat",    value:50, desc:"₹50 flat discount" },
  "NEWUSER":   { type:"percent", value:15, desc:"15% off for new users" },
  "WELCOME99": { type:"flat",    value:99, desc:"₹99 off on first booking" },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step1Data {
  cityId:        string;
  cityName:      string;
  categoryId:    string;
  subService:    string;
  propertyType:  "apartment"|"house"|"office"|"shop"|"";
  serviceType:   string;
}
interface Step2Data {
  problemType:   string;
  description:   string;
  images:        File[];
  video:         File | null;
  urgency:       "standard"|"priority"|"emergency";
}
interface Step3Data {
  houseFlat:     string;
  building:      string;
  floor:         string;
  landmark:      string;
  area:          string;
  pincode:       string;
  lat:           number;
  lng:           number;
  liftAvailable: boolean | null;
  parkingAvail:  boolean | null;
  gatedSociety:  boolean | null;
}
interface Step4Data {
  date:          string;   // ISO yyyy-mm-dd
  timeSlot:      string;
  flexibility:   "exact"|"flexible";
}
interface Step6Data {
  paymentMode:   "advance"|"full"|"cod"|"wallet";
  paymentMethod: "upi"|"card"|"netbanking"|"cash"|"wallet";
  couponCode:    string;
  couponApplied: boolean;
  couponDiscount:number;
  walletUsed:    number;
  upiId:         string;
  agreedPrice:   boolean;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { label:"Service",   short:"1" },
  { label:"Issue",     short:"2" },
  { label:"Location",  short:"3" },
  { label:"Schedule",  short:"4" },
  { label:"Pricing",   short:"5" },
  { label:"Payment",   short:"6" },
  { label:"Confirm",   short:"7" },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="w-full">
      {/* Mobile: compact pill */}
      <div className="flex sm:hidden items-center justify-between mb-1">
        <p className="text-xs font-black text-emerald-600">Step {current + 1} of 7</p>
        <p className="text-xs text-slate-400 font-medium">{STEPS[current].label}</p>
      </div>
      <div className="sm:hidden h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${((current + 1) / 7) * 100}%` }} />
      </div>

      {/* Desktop: full steps */}
      <div className="hidden sm:flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                  ${done   ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : active ? "bg-slate-900 text-white shadow-md ring-2 ring-emerald-400 ring-offset-1"
                           : "bg-slate-100 text-slate-400"}`}>
                  {done ? <Check size={13} /> : s.short}
                </div>
                <p className={`text-xs font-semibold whitespace-nowrap ${active ? "text-slate-800" : done ? "text-emerald-600" : "text-slate-300"}`}>
                  {s.label}
                </p>
              </div>
              {i < 6 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${i < current ? "bg-emerald-400" : "bg-slate-100"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Property Type Card ───────────────────────────────────────────────────────
function PropCard({ icon: Icon, label, value, selected, onClick }: {
  icon: React.ElementType; label: string; value: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 flex-1 min-w-[72px]
        ${selected ? "border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100" : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
        ${selected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
        <Icon size={18} />
      </div>
      <p className={`text-xs font-bold ${selected ? "text-emerald-700" : "text-slate-600"}`}>{label}</p>
      {selected && <Check size={12} className="text-emerald-500" />}
    </button>
  );
}

// ─── Urgency Card ─────────────────────────────────────────────────────────────
function UrgencyCard({ level, label, time, surge, selected, onClick }: {
  level: string; label: string; time: string; surge?: number;
  selected: boolean; onClick: () => void;
}) {
  const configs = {
    standard: { color:"text-blue-700",   bg:"bg-blue-50",   border:"border-blue-300",   icon:<Clock size={16} className="text-blue-500" />, selBg:"bg-blue-500" },
    priority: { color:"text-amber-700",  bg:"bg-amber-50",  border:"border-amber-300",  icon:<Zap size={16} className="text-amber-500" />,  selBg:"bg-amber-500" },
    emergency:{ color:"text-red-700",    bg:"bg-red-50",    border:"border-red-300",    icon:<AlertTriangle size={16} className="text-red-500" />, selBg:"bg-red-500" },
  };
  const c = configs[level as keyof typeof configs];
  return (
    <button type="button" onClick={onClick}
      className={`relative flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-200 flex-1
        ${selected ? `${c.border} ${c.bg} shadow-md` : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <div className="flex items-center justify-between">
        {c.icon}
        {selected && <Check size={13} className={c.color} />}
      </div>
      <p className={`text-sm font-black ${selected ? c.color : "text-slate-700"}`}>{label}</p>
      <p className={`text-xs ${selected ? c.color : "text-slate-400"}`}>{time}</p>
      {surge && (
        <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full w-fit">
          +{surge}% surge
        </span>
      )}
    </button>
  );
}

// ─── Draggable Map Component ──────────────────────────────────────────────────
function DraggableMap({ lat, lng, onLocationChange }: {
  lat: number; lng: number;
  onLocationChange: (lat: number, lng: number, address: Partial<Step3Data>) => void;
}) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const mapInst = useRef<unknown>(null);
  const marker  = useRef<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [ready,   setReady]   = useState(false);

  // Reverse geocode via Nominatim (free)
  const reverseGeocode = useCallback(async (lt: number, ln: number) => {
    setLoading(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lt}&lon=${ln}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const d = await r.json();
      const a = d.address || {};
      onLocationChange(lt, ln, {
        area:    a.suburb || a.neighbourhood || a.village || a.town || "",
        pincode: a.postcode || "",
        lat:     lt, lng: ln,
      });
    } catch { /* silent */ }
    finally  { setLoading(false); }
  }, [onLocationChange]);

  useEffect(() => {
    if (mapInst.current || !mapRef.current) return;

    const initLat = lat || 28.6139;
    const initLng = lng || 77.2090;

    const loadLeaflet = async () => {
      if (!(window as Record<string,unknown>).L) {
        await Promise.all([
          new Promise<void>(res => {
            const link  = document.createElement("link");
            link.rel    = "stylesheet";
            link.href   = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
            link.onload = () => res();
            document.head.appendChild(link);
          }),
          new Promise<void>(res => {
            const s    = document.createElement("script");
            s.src      = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
            s.onload   = () => res();
            document.head.appendChild(s);
          }),
        ]);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L   = (window as any).L;
      const map = L.map(mapRef.current!).setView([initLat, initLng], 15);
      mapInst.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Custom green pin icon
      const pinIcon = L.divIcon({
        html: `<div style="
          width:36px;height:44px;position:relative;
          filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));
        ">
          <div style="
            width:36px;height:36px;background:#10b981;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);border:3px solid white;
            display:flex;align-items:center;justify-content:center;
          ">
            <div style="transform:rotate(45deg);color:white;font-size:16px;">📍</div>
          </div>
        </div>`,
        iconSize:   [36, 44],
        iconAnchor: [18, 44],
        className:  "",
      });

      const mkr = L.marker([initLat, initLng], { icon: pinIcon, draggable: true }).addTo(map);
      marker.current = mkr;

      mkr.on("dragend", (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
        const { lat: lt, lng: ln } = e.target.getLatLng();
        reverseGeocode(lt, ln);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        mkr.setLatLng([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      setReady(true);
      reverseGeocode(initLat, initLng);
    };

    loadLeaflet();
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200" style={{ height: 280 }}>
      {!ready && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 size={24} className="animate-spin text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-0" />
      {loading && ready && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-emerald-700 z-[500]">
          <Loader2 size={12} className="animate-spin" /> Fetching address...
        </div>
      )}
      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 text-xs text-slate-600 font-medium z-[500] flex items-center gap-1.5">
        <Navigation size={11} className="text-emerald-500 flex-shrink-0" />
        Drag pin or tap map to set exact location
      </div>
    </div>
  );
}

// ─── Calendar Component ───────────────────────────────────────────────────────
function BookingCalendar({ selectedDate, onSelect }: {
  selectedDate: string;
  onSelect: (d: string) => void;
}) {
  const today  = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year,  setYear]  = useState(today.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const monthNames  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dayNames    = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  // Block past dates + more than 30 days ahead
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + 30);

  const cells: (number | null)[] = [...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }}
          className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-black text-slate-800">{monthNames[month]} {year}</p>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }}
          className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-black text-slate-400 py-1">{d}</div>
          ))}
        </div>
        {/* Date grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const date    = new Date(year, month, day);
            const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const isPast  = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isFuture= date > maxDate;
            const disabled= isPast || isFuture;
            const isSelected = dateStr === selectedDate;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            return (
              <button key={i} disabled={disabled} onClick={() => onSelect(dateStr)}
                className={`relative h-9 w-9 mx-auto rounded-xl text-xs font-bold transition-all duration-150
                  ${isSelected ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" :
                    disabled    ? "text-slate-200 cursor-not-allowed" :
                    isToday     ? "bg-slate-100 text-emerald-700 ring-1 ring-emerald-300" :
                                  "hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"}`}>
                {day}
                {isToday && !isSelected && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Yes/No ────────────────────────────────────────────────────────────
function YesNo({ label, value, onChange }: {
  label: string; value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <p className="text-sm text-slate-700 font-medium">{label}</p>
      <div className="flex gap-2">
        {([true, false] as const).map(v => (
          <button key={String(v)} type="button" onClick={() => onChange(v)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold border-2 transition-all
              ${value === v
                ? v ? "bg-emerald-500 border-emerald-500 text-white" : "bg-red-400 border-red-400 text-white"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
            {v ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUploader({ images, onChange }: {
  images: File[];
  onChange: (imgs: File[]) => void;
}) {
  function handleFiles(files: FileList | null) {
    if (!files) return;
    const valid = Array.from(files)
      .filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
      .slice(0, 5 - images.length);
    onChange([...images, ...valid]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 group">
            <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
            <button onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white rounded-xl">
              <X size={18} />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all gap-1">
            <Camera size={20} className="text-slate-400" />
            <p className="text-xs text-slate-400">Add</p>
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleFiles(e.target.files)} />
          </label>
        )}
      </div>
      <p className="text-xs text-slate-400">{images.length}/5 images · Max 5MB each</p>
    </div>
  );
}

// ─── Pricing Row ──────────────────────────────────────────────────────────────
function PricingRow({ label, amount, note, highlight, red }: {
  label:string; amount:string; note?:string; highlight?:boolean; red?:boolean;
}) {
  return (
    <div className={`flex items-start justify-between py-2.5 ${highlight ? "bg-emerald-50 px-3 -mx-3 rounded-xl" : ""} border-b border-slate-50 last:border-0`}>
      <div>
        <p className={`text-sm ${highlight ? "font-black text-slate-800" : "text-slate-600"}`}>{label}</p>
        {note && <p className="text-xs text-slate-400 mt-0.5">{note}</p>}
      </div>
      <p className={`text-sm font-bold flex-shrink-0 ml-4 ${red ? "text-red-500" : highlight ? "text-emerald-700 font-black text-base" : "text-slate-700"}`}>
        {amount}
      </p>
    </div>
  );
}

// ─── Dispatch Animation (Step 7 success) ─────────────────────────────────────
function DispatchAnimation({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
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
              : <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin" />}
          </div>
          {/* Orbiting dots */}
          {phase !== "confirmed" && [0,1,2].map(i => (
            <div key={i} className="absolute w-3 h-3 rounded-full bg-emerald-400"
              style={{
                top: "50%", left: "50%",
                transform: `rotate(${i * 120}deg) translateX(52px) translateY(-50%)`,
                animation: `spin 1.5s linear infinite`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.7,
              }} />
          ))}
        </div>

        {/* Phase messages */}
        <div className="space-y-3">
          {[
            { key:"calculating", icon:"🔢", title:"Calculating Best Match",  sub:"Distance · Rating · Availability · Load" },
            { key:"notifying",   icon:"📡", title:"Notifying Top 3 Vendors",  sub:"5-minute accept window started" },
            { key:"accepted",    icon:"🤝", title:"Vendor Accepted!",         sub:"Ravi Kumar (⭐ 4.9) is on the way" },
            { key:"confirmed",   icon:"✅", title:"Booking Confirmed!",       sub:`Booking ID: ${bookingId}` },
          ].map((p, i) => {
            const phases = ["calculating","notifying","accepted","confirmed"];
            const done   = phases.indexOf(phase) >= i;
            return (
              <div key={p.key} className={`flex items-center gap-3 transition-all duration-500
                ${done ? "opacity-100 translate-y-0" : "opacity-30"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                  ${done ? "bg-emerald-500" : "bg-white/10"}`}>
                  {done ? <Check size={14} className="text-white" /> : <span className="text-base">{p.icon}</span>}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${done ? "text-white" : "text-white/40"}`}>{p.title}</p>
                  {done && <p className="text-xs text-emerald-300">{p.sub}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Case 1 — Direct route: /:citySlug/book/:categorySlug
  const { citySlug: paramCity = "", categorySlug: paramCat = "" } =
    useParams<{ citySlug?: string; categorySlug?: string }>();

  // Case 2 — Inside CustomerDashboard tab OR after login-redirect
  // navigate("/login", { state: { citySlug, categorySlug } }) passes these
  const locState      = (location.state ?? {}) as { citySlug?: string; categorySlug?: string };
  const resolvedCity  = paramCity  || locState.citySlug  || "";
  const resolvedCat   = paramCat   || locState.categorySlug || "";

  const urlCity     = getCityBySlug(resolvedCity);
  const urlCategory = getCategoryBySlug(resolvedCat);

  const [step, setStep] = useState(0);

  const [s1, setS1] = useState<Step1Data>({
    cityId:       urlCity?.id    ?? "",
    cityName:     urlCity?.name  ?? "",
    categoryId:   urlCategory?.id ?? "",
    subService:   "",
    propertyType: "",
    serviceType:  "",
  });
  const [s2, setS2] = useState<Step2Data>({
    problemType:"", description:"", images:[], video:null, urgency:"standard",
  });
  const [s3, setS3] = useState<Step3Data>({
    houseFlat:"", building:"", floor:"", landmark:"", area:"", pincode:"",
    lat:0, lng:0, liftAvailable:null, parkingAvail:null, gatedSociety:null,
  });
  const [s4, setS4] = useState<Step4Data>({ date:"", timeSlot:"", flexibility:"flexible" });
  const [s6, setS6] = useState<Step6Data>({
    paymentMode:"advance", paymentMethod:"upi", couponCode:"", couponApplied:false,
    couponDiscount:0, walletUsed:0, upiId:"", agreedPrice:false,
  });
  const [agreedTerms, setAgreedTerms]   = useState(false);
  const [errors,      setErrors]        = useState<Record<string,string>>({});
  const [submitting,  setSubmitting]    = useState(false);
  const [bookingId,   setBookingId]     = useState("");
  const [showDispatch,setShowDispatch]  = useState(false);
  const [done,        setDone]          = useState(false);
  const [couponInput, setCouponInput]   = useState("");
  const [couponErr,   setCouponErr]     = useState("");
  const [citySearch,  setCitySearch]    = useState("");
  const [showCities,  setShowCities]    = useState(false);

  // Derived
  const catData    = CATEGORY_DATA[s1.categoryId] ?? null;
  const category   = MOCK_CATEGORIES.find(c => c.id === s1.categoryId);
  const urgencySurge = s2.urgency === "emergency" ? 0.30 : s2.urgency === "priority" ? 0.15 : 0;
  const baseCharge   = catData ? catData.basePrice : 0;
  const visitCharge  = catData ? catData.visitCharge : 0;
  const emergencyChg = s2.urgency !== "standard" ? Math.round(baseCharge * urgencySurge) : 0;
  const estParts     = catData ? [Math.round(baseCharge * 0.1), Math.round(baseCharge * 0.5)] : [0, 0];
  const platformFee  = Math.round(baseCharge * 0.05);
  const subtotal     = baseCharge + visitCharge + emergencyChg + platformFee;
  const gst          = Math.round(subtotal * 0.18);
  const preDiscount  = subtotal + gst;
  const couponDiscount = s6.couponApplied ? s6.couponDiscount : 0;
  const walletDiscount = s6.walletUsed;
  const totalPayable   = Math.max(0, preDiscount - couponDiscount - walletDiscount);
  const advanceAmt     = Math.round(totalPayable * 0.15); // 15% advance

  // City geo lookup for map center
  const cityGeo: Record<string,[number,number]> = {
    "lucknow":[26.8467,80.9462],"delhi":[28.6139,77.2090],"mumbai":[19.0760,72.8777],
    "bangalore":[12.9716,77.5946],"hyderabad":[17.3850,78.4867],"pune":[18.5204,73.8567],
    "jaipur":[26.9124,75.7873],"ahmedabad":[23.0225,72.5714],"kanpur":[26.4499,80.3319],
    "varanasi":[25.3176,82.9739],
  };
  const [mapCenter] = useState<[number,number]>(() =>
    cityGeo[resolvedCity] ?? cityGeo[cityToSlug(s1.cityName)] ?? [28.6139, 77.2090]
  );

  // Today date string
  const todayStr = new Date().toISOString().split("T")[0];

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate(stepIdx: number): boolean {
    const e: Record<string,string> = {};
    if (stepIdx === 0) {
      if (!s1.cityId)       e.city        = "City select karo";
      if (!s1.categoryId)   e.category    = "Category select karo";
      if (!s1.subService)   e.subService  = "Sub-service select karo";
      if (!s1.propertyType) e.propertyType= "Property type select karo";
      if (!s1.serviceType)  e.serviceType = "Service type select karo";
    }
    if (stepIdx === 1) {
      if (!s2.problemType)               e.problemType  = "Problem type select karo";
      if (s2.description.length < 30)    e.description  = `Min 30 characters (${s2.description.length}/30)`;
    }
    if (stepIdx === 2) {
      if (!s3.houseFlat.trim())          e.houseFlat = "House/Flat no. required";
      if (!s3.area.trim())               e.area      = "Area required";
      if (!/^\d{6}$/.test(s3.pincode))   e.pincode   = "Valid 6-digit PIN required";
    }
    if (stepIdx === 3) {
      if (!s4.date)      e.date     = "Date select karo";
      if (!s4.timeSlot)  e.timeSlot = "Time slot select karo";
    }
    if (stepIdx === 4) {
      if (!s6.agreedPrice) e.agreedPrice = "Price variation acknowledge karo";
    }
    if (stepIdx === 5) {
      if (s6.paymentMethod === "upi" && s6.paymentMode !== "cod" && !s6.upiId.includes("@"))
        e.upiId = "Valid UPI ID daalo";
    }
    if (stepIdx === 6) {
      if (!agreedTerms) e.terms = "Terms agree karo";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate(step)) {
      // Scroll to first error
      const firstKey = Object.keys(errors)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }
    if (step < 6) setStep(s => s + 1);
    else handleSubmit();
  }

  async function handleSubmit() {
    setSubmitting(true);
    const id = `BK-${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit"}).replace("/","")}-${String(Math.floor(1000 + Math.random()*9000))}`;
    setBookingId(id);
    await new Promise(r => setTimeout(r, 400));
    setSubmitting(false);
    setShowDispatch(true);
  }

  function applyCoupon() {
    setCouponErr("");
    const code  = couponInput.toUpperCase().trim();
    const valid = VALID_COUPONS[code];
    if (!valid) { setCouponErr("Invalid coupon code"); return; }
    const disc  = valid.type === "percent" ? Math.round(preDiscount * valid.value / 100) : valid.value;
    setS6(p => ({ ...p, couponCode:code, couponApplied:true, couponDiscount:disc }));
  }

  function removeCoupon() {
    setS6(p => ({ ...p, couponCode:"", couponApplied:false, couponDiscount:0 }));
    setCouponInput("");
    setCouponErr("");
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your service request has been dispatched. A vendor will contact you shortly.
          </p>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-6">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Booking ID</p>
            <p className="text-2xl font-black text-emerald-700">{bookingId}</p>
            <p className="text-xs text-emerald-600 mt-1">{category?.icon} {category?.name} · {s1.subService}</p>
            <p className="text-xs text-slate-500 mt-0.5">📅 {s4.date} · ⏰ {s4.timeSlot}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon:Star,     label:"Vendor Rating",   val:"4.9 ⭐" },
              { icon:Clock,    label:"ETA",              val:s2.urgency === "emergency" ? "~45 min" : "~2 hrs" },
              { icon:Phone,    label:"Support",          val:"1800-ADDies" },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <Icon size={16} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className="text-xs font-black text-slate-700">{val}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/customer")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2">
            Go to Dashboard <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate("/customer/bookings")}
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
            Track Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showDispatch && (
        <DispatchAnimation bookingId={bookingId} onDone={() => { setShowDispatch(false); setDone(true); }} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="space-y-6 mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition-all flex-shrink-0">
                <ChevronLeft size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">Book a Service</p>
                <p className="text-sm font-black text-slate-800 truncate">
                  {category ? `${category.icon} ${category.name}` : "ADDies ServiceHub"}
                  {s1.subService ? ` → ${s1.subService}` : ""}
                </p>
              </div>
              {s2.urgency !== "standard" && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0
                  ${s2.urgency === "emergency" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                  {s2.urgency === "emergency" ? "🚨 Emergency" : "⚡ Priority"}
                </span>
              )}
            </div>
            <StepBar current={step} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 mx-auto">

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 1: Smart Service Identification
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">What service do you need?</h2>
                <p className="text-sm text-slate-400 mt-0.5">Help us connect you to the right vendor</p>
              </div>

              {/* City */}
              <div data-field="city">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Your City <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 bg-white cursor-pointer
                    hover:border-emerald-300 transition-all"
                    onClick={() => setShowCities(!showCities)}>
                    <MapPin size={15} className="text-emerald-500 flex-shrink-0" />
                    <span className={`flex-1 text-sm ${s1.cityName ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
                      {s1.cityName || "Select city..."}
                    </span>
                    <ChevronDown size={15} className="text-slate-400" />
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
                        {MOCK_CITIES.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).map(city => (
                          <button key={city.id} type="button"
                            onClick={() => { setS1(p => ({...p, cityId:city.id, cityName:city.name})); setShowCities(false); setCitySearch(""); }}
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

              {/* Category */}
              <div data-field="category">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Service Category <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {MOCK_CATEGORIES.map(cat => (
                    <button key={cat.id} type="button"
                      onClick={() => setS1(p => ({...p, categoryId:cat.id, subService:"", serviceType:""}))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-bold transition-all
                        ${s1.categoryId === cat.id
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"}`}>
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-center leading-tight">{cat.name}</span>
                      {s1.categoryId === cat.id && <Check size={11} className="text-emerald-500" />}
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>

              {/* Sub-service */}
              {catData && (
                <div data-field="subService">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                    What exactly do you need? <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {catData.subServices.map(sub => (
                      <button key={sub} type="button"
                        onClick={() => setS1(p => ({...p, subService:sub}))}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all
                          ${s1.subService === sub
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"}`}>
                        {s1.subService === sub
                          ? <Check size={14} className="text-emerald-500 flex-shrink-0" />
                          : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0" />}
                        {sub}
                      </button>
                    ))}
                  </div>
                  {errors.subService && <p className="text-xs text-red-500 mt-1">{errors.subService}</p>}
                </div>
              )}

              {/* Property Type */}
              <div data-field="propertyType">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Property Type <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  <PropCard icon={Building2} label="Apartment"  value="apartment" selected={s1.propertyType==="apartment"} onClick={() => setS1(p=>({...p,propertyType:"apartment"}))} />
                  <PropCard icon={Home}      label="House"       value="house"      selected={s1.propertyType==="house"}     onClick={() => setS1(p=>({...p,propertyType:"house"}))} />
                  <PropCard icon={Briefcase} label="Office"      value="office"     selected={s1.propertyType==="office"}    onClick={() => setS1(p=>({...p,propertyType:"office"}))} />
                  <PropCard icon={ShoppingBag} label="Shop"     value="shop"       selected={s1.propertyType==="shop"}     onClick={() => setS1(p=>({...p,propertyType:"shop"}))} />
                </div>
                {errors.propertyType && <p className="text-xs text-red-500 mt-1">{errors.propertyType}</p>}
              </div>

              {/* Service Type */}
              {catData && (
                <div data-field="serviceType">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                    Service Type <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {catData.serviceTypes.map(st => (
                      <button key={st} type="button"
                        onClick={() => setS1(p=>({...p,serviceType:st}))}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all
                          ${s1.serviceType === st
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>
                        {s1.serviceType === st && <Check size={11} />} {st}
                      </button>
                    ))}
                  </div>
                  {errors.serviceType && <p className="text-xs text-red-500 mt-1">{errors.serviceType}</p>}
                </div>
              )}
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 2: Issue Classification
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 1 && catData && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Describe the Issue</h2>
                <p className="text-sm text-slate-400 mt-0.5">More details = faster & better service</p>
              </div>

              {/* Problem Type */}
              <div data-field="problemType">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Problem Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {catData.problems.map(prob => (
                    <button key={prob} type="button"
                      onClick={() => setS2(p => ({...p, problemType:prob}))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all
                        ${s2.problemType === prob
                          ? "border-red-400 bg-red-50 text-red-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-red-200"}`}>
                      {s2.problemType === prob
                        ? <Check size={13} className="text-red-500 flex-shrink-0" />
                        : <AlertTriangle size={13} className="text-slate-300 flex-shrink-0" />}
                      {prob}
                    </button>
                  ))}
                </div>
                {errors.problemType && <p className="text-xs text-red-500 mt-1">{errors.problemType}</p>}
              </div>

              {/* Description */}
              <div data-field="description">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Describe in detail <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={s2.description}
                  onChange={e => setS2(p => ({...p, description:e.target.value}))}
                  rows={4}
                  placeholder="Describe the problem clearly... e.g., 'AC is not cooling even after running for 2 hours. Ice forming on the coils...'"
                  className={`w-full px-4 py-3 text-sm rounded-xl border-2 resize-none bg-white
                    focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all
                    ${errors.description ? "border-red-300" : "border-slate-200 focus:border-emerald-400"}`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.description
                    ? <p className="text-xs text-red-500">{errors.description}</p>
                    : <p className="text-xs text-slate-400">Min 30 characters</p>}
                  <p className={`text-xs font-bold ${s2.description.length >= 30 ? "text-emerald-500" : "text-slate-400"}`}>
                    {s2.description.length}/30+
                  </p>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Upload Photos <span className="text-slate-400 font-normal normal-case">(optional, max 5)</span>
                </label>
                <ImageUploader images={s2.images} onChange={imgs => setS2(p => ({...p, images:imgs}))} />
              </div>

              {/* Video */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Upload Short Video <span className="text-slate-400 font-normal normal-case">(optional, max 30 sec)</span>
                </label>
                {s2.video ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <Video size={18} className="text-blue-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-blue-700 flex-1 truncate">{s2.video.name}</p>
                    <button onClick={() => setS2(p => ({...p, video:null}))}>
                      <X size={16} className="text-blue-400 hover:text-red-500" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                    <Video size={20} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Add a video</p>
                      <p className="text-xs text-slate-400">MP4, MOV · Max 30 seconds</p>
                    </div>
                    <input type="file" accept="video/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setS2(p => ({...p, video:f})); }} />
                  </label>
                )}
              </div>

              {/* Urgency */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Urgency Level
                </label>
                <div className="flex gap-3">
                  <UrgencyCard level="standard"  label="Standard"  time="Within 24 hours"  selected={s2.urgency==="standard"}  onClick={() => setS2(p=>({...p,urgency:"standard"}))} />
                  <UrgencyCard level="priority"  label="Priority"  time="Within 4 hours"   selected={s2.urgency==="priority"}  onClick={() => setS2(p=>({...p,urgency:"priority"}))}  surge={15} />
                  <UrgencyCard level="emergency" label="Emergency" time="Within 1 hour"    selected={s2.urgency==="emergency"} onClick={() => setS2(p=>({...p,urgency:"emergency"}))} surge={30} />
                </div>
                {s2.urgency !== "standard" && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                    <Info size={13} className="flex-shrink-0 mt-0.5" />
                    {s2.urgency === "emergency"
                      ? "Emergency booking mein 30% surge charge extra lagega. Vendor 1 hour mein pahunchega."
                      : "Priority booking mein 15% surge charge extra lagega. Vendor 4 hours mein pahunchega."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 3: Location Intelligence
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Service Location</h2>
                <p className="text-sm text-slate-400 mt-0.5">Pin your exact location for accurate dispatch</p>
              </div>

              {/* Map */}
              <DraggableMap
                lat={mapCenter[0]} lng={mapCenter[1]}
                onLocationChange={(lat, lng, addr) => {
                  setS3(p => ({
                    ...p, lat, lng,
                    area:    addr.area    || p.area,
                    pincode: addr.pincode || p.pincode,
                  }));
                }}
              />

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key:"houseFlat", label:"House / Flat No.",   req:true,  span:false },
                  { key:"building",  label:"Building / Society", req:false, span:false },
                  { key:"floor",     label:"Floor (optional)",   req:false, span:false },
                  { key:"landmark",  label:"Landmark",           req:false, span:false },
                ].map(({ key, label, req, span }) => (
                  <div key={key} data-field={key} className={span ? "sm:col-span-2" : ""}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      {label}{req && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input type="text"
                      value={s3[key as keyof Step3Data] as string}
                      onChange={e => setS3(p => ({...p, [key]: e.target.value}))}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-all
                        focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
                        ${errors[key] ? "border-red-300" : "border-slate-200"}`} />
                    {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div data-field="area">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Area / Locality <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={s3.area}
                    onChange={e => setS3(p=>({...p,area:e.target.value}))}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-all
                      focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
                      ${errors.area ? "border-red-300" : "border-slate-200"}`} />
                  {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
                </div>
                <div data-field="pincode">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    PIN Code <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={s3.pincode} maxLength={6}
                    onChange={e => setS3(p=>({...p,pincode:e.target.value.replace(/\D/g,"")}))}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-all
                      focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
                      ${errors.pincode ? "border-red-300" : "border-slate-200"}`} />
                  {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>

              {/* Accessibility */}
              <div className="bg-white rounded-2xl border border-slate-200 px-4 py-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2 pt-2">Accessibility Info</p>
                <YesNo label="🛗  Lift Available?" value={s3.liftAvailable} onChange={v => setS3(p=>({...p,liftAvailable:v}))} />
                <YesNo label="🚗  Parking Available?" value={s3.parkingAvail} onChange={v => setS3(p=>({...p,parkingAvail:v}))} />
                <YesNo label="🏘️  Gated Society?" value={s3.gatedSociety} onChange={v => setS3(p=>({...p,gatedSociety:v}))} />
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 4: Scheduling Engine
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">When do you need it?</h2>
                <p className="text-sm text-slate-400 mt-0.5">Pick a date and time that works for you</p>
              </div>

              {/* Calendar */}
              <div data-field="date">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  Select Date <span className="text-red-400">*</span>
                </label>
                <BookingCalendar selectedDate={s4.date} onSelect={d => setS4(p => ({...p, date:d, timeSlot:""}))} />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>

              {/* Time Slots */}
              {s4.date && (
                <div data-field="timeSlot">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                    Select Time Slot <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_TIME_SLOTS.map(slot => {
                      const isUnavailable = s4.date === todayStr && UNAVAILABLE_TODAY.includes(slot);
                      const isSelected    = s4.timeSlot === slot;
                      return (
                        <button key={slot} type="button" disabled={isUnavailable}
                          onClick={() => setS4(p => ({...p, timeSlot:slot}))}
                          className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                            ${isUnavailable ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                            : isSelected    ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"}`}>
                          <Clock size={14} className={isUnavailable ? "text-slate-300" : isSelected ? "text-emerald-500" : "text-slate-400"} />
                          {slot}
                          {isUnavailable && <span className="absolute top-1 right-2 text-xs text-slate-400">Full</span>}
                          {isSelected && <Check size={13} className="ml-auto text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.timeSlot && <p className="text-xs text-red-500 mt-1">{errors.timeSlot}</p>}
                </div>
              )}

              {/* Flexibility */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">Flexibility</label>
                <div className="flex gap-3">
                  {([
                    { val:"exact",    label:"Exact Time",           sub:"Vendor must arrive in this slot" },
                    { val:"flexible", label:"Flexible ±3 hrs",      sub:"Helps find vendor faster" },
                  ] as const).map(({ val, label, sub }) => (
                    <button key={val} type="button" onClick={() => setS4(p => ({...p, flexibility:val}))}
                      className={`flex-1 p-3 rounded-xl border-2 text-left transition-all
                        ${s4.flexibility === val ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <p className={`text-sm font-bold ${s4.flexibility === val ? "text-emerald-700" : "text-slate-700"}`}>{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated duration */}
              {catData && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
                  <Timer size={15} className="flex-shrink-0 text-blue-500" />
                  Estimated job duration: <strong>{catData.estDuration} hours</strong>. Please keep this time free.
                </div>
              )}
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 5: Pricing Transparency
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Pricing Breakdown</h2>
                <p className="text-sm text-slate-400 mt-0.5">Full transparency — no hidden charges</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Estimated Charges</p>
                </div>
                <div className="px-5 py-3">
                  <PricingRow
                    label="Base Service Charge"
                    amount={`₹${baseCharge.toLocaleString("en-IN")}`}
                    note={`${category?.name} — ${s1.subService}`}
                  />
                  {visitCharge > 0 && (
                    <PricingRow
                      label="Visiting / Inspection Charge"
                      amount={`₹${visitCharge}`}
                      note="Refundable if service done"
                    />
                  )}
                  {emergencyChg > 0 && (
                    <PricingRow
                      label={`${s2.urgency === "emergency" ? "Emergency" : "Priority"} Surge (${(urgencySurge*100).toFixed(0)}%)`}
                      amount={`₹${emergencyChg}`}
                      note="Applied due to urgency selection"
                      red
                    />
                  )}
                  <PricingRow
                    label="Estimated Parts Cost"
                    amount={`₹${estParts[0]}–₹${estParts[1]}`}
                    note="Actual cost may vary based on parts needed"
                  />
                  <PricingRow
                    label="Platform Fee"
                    amount={`₹${platformFee}`}
                    note="ADDies service facilitation fee"
                  />
                  <PricingRow label="GST (18%)" amount={`₹${gst}`} />
                  <div className="h-px bg-slate-200 my-1" />
                  <PricingRow
                    label="Total Estimated Payable"
                    amount={`₹${preDiscount.toLocaleString("en-IN")}`}
                    note="Final amount confirmed after inspection"
                    highlight
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                {[
                  { icon:"💡", text:"Final price may be ±20% based on actual inspection. Vendor will confirm before starting work." },
                  { icon:"🔄", text:"Visiting charge refunded if you book the service." },
                  { icon:"🛡️", text:"ADDies quality guarantee — free redo if work not satisfactory." },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span>{n.icon}</span>
                    {n.text}
                  </div>
                ))}
              </div>

              {/* Agree checkbox */}
              <div data-field="agreedPrice">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${errors.agreedPrice ? "border-red-300 bg-red-50" : s6.agreedPrice ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <input type="checkbox" checked={s6.agreedPrice}
                    onChange={e => setS6(p => ({...p, agreedPrice:e.target.checked}))}
                    className="mt-0.5 w-4 h-4 accent-emerald-600" />
                  <span className="text-sm text-slate-600">
                    I understand the <strong>final price may vary</strong> based on actual inspection and parts cost.
                    I agree to the pricing terms.
                  </span>
                </label>
                {errors.agreedPrice && <p className="text-xs text-red-500 mt-1">{errors.agreedPrice}</p>}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 6: Payment & Wallet
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Payment</h2>
                <p className="text-sm text-slate-400 mt-0.5">Choose how you'd like to pay</p>
              </div>

              {/* Pay Mode */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">Payment Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { val:"advance", label:"Pay Advance",       sub:`₹${advanceAmt} (15%)`,    icon:Zap,       color:"text-amber-600" },
                    { val:"full",    label:"Full Payment",       sub:`₹${totalPayable}`,         icon:BadgeCheck,color:"text-emerald-600" },
                    { val:"wallet",  label:"Wallet Payment",     sub:"Use wallet balance",        icon:Wallet,    color:"text-violet-600" },
                    { val:"cod",     label:"Pay After Service",  sub:"Cash on completion",        icon:Banknote,  color:"text-blue-600" },
                  ] as const).map(({ val, label, sub, icon: Icon, color }) => (
                    <button key={val} type="button" onClick={() => setS6(p => ({...p, paymentMode:val, paymentMethod: val === "cod" ? "cash" : val === "wallet" ? "wallet" : p.paymentMethod}))}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all
                        ${s6.paymentMode === val ? "border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <div className={`w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100`}>
                        <Icon size={17} className={color} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${s6.paymentMode === val ? "text-emerald-700" : "text-slate-700"}`}>{label}</p>
                        <p className="text-xs text-slate-400">{sub}</p>
                      </div>
                      {s6.paymentMode === val && <Check size={14} className="text-emerald-500 ml-auto flex-shrink-0 mt-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method (not COD / wallet) */}
              {s6.paymentMode !== "cod" && s6.paymentMode !== "wallet" && (
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">Payment Method</label>
                  <div className="flex gap-2">
                    {([
                      { val:"upi",        label:"UPI",         icon:Smartphone },
                      { val:"card",       label:"Card",        icon:CreditCard },
                      { val:"netbanking", label:"Net Banking",  icon:Shield },
                    ] as const).map(({ val, label, icon: Icon }) => (
                      <button key={val} type="button" onClick={() => setS6(p => ({...p, paymentMethod:val}))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all
                          ${s6.paymentMethod === val ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                        <Icon size={14} /> {label}
                      </button>
                    ))}
                  </div>
                  {s6.paymentMethod === "upi" && (
                    <div className="mt-3" data-field="upiId">
                      <input type="text" placeholder="Enter UPI ID (e.g. name@upi)"
                        value={s6.upiId} onChange={e => setS6(p => ({...p, upiId:e.target.value}))}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border-2 bg-white transition-all
                          focus:outline-none focus:ring-2 focus:ring-emerald-200
                          ${errors.upiId ? "border-red-300" : "border-slate-200 focus:border-emerald-400"}`} />
                      {errors.upiId && <p className="text-xs text-red-500 mt-1">{errors.upiId}</p>}
                    </div>
                  )}
                  {(s6.paymentMethod === "card" || s6.paymentMethod === "netbanking") && (
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      <Shield size={13} className="text-emerald-500 flex-shrink-0" />
                      Redirected to Razorpay secure gateway on confirmation
                    </div>
                  )}
                </div>
              )}

              {/* Coupon */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
                  <Tag size={12} className="inline mr-1" /> Apply Coupon
                </label>
                {s6.couponApplied ? (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 border-2 border-green-300">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-black text-green-700">{s6.couponCode}</p>
                      <p className="text-xs text-green-600">{VALID_COUPONS[s6.couponCode]?.desc} · Saved ₹{couponDiscount}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter coupon code"
                      value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(""); }}
                      onKeyDown={e => e.key === "Enter" && applyCoupon()}
                      className={`flex-1 px-4 py-2.5 text-sm rounded-xl border-2 bg-white uppercase tracking-widest
                        focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all
                        ${couponErr ? "border-red-300" : "border-slate-200"}`} />
                    <button onClick={applyCoupon}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all flex-shrink-0">
                      Apply
                    </button>
                  </div>
                )}
                {couponErr && <p className="text-xs text-red-500 mt-1">{couponErr}</p>}
                {!s6.couponApplied && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(VALID_COUPONS).map(([code, info]) => (
                      <button key={code} onClick={() => { setCouponInput(code); setCouponErr(""); }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100 transition-all">
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bill Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Bill Summary</p>
                </div>
                <div className="px-5 py-3">
                  <PricingRow label="Subtotal"           amount={`₹${subtotal}`} />
                  <PricingRow label="GST (18%)"          amount={`₹${gst}`} />
                  {couponDiscount > 0 && <PricingRow label={`Coupon (${s6.couponCode})`} amount={`−₹${couponDiscount}`} red />}
                  {walletDiscount > 0 && <PricingRow label="Wallet Credit"   amount={`−₹${walletDiscount}`} red />}
                  <div className="h-px bg-slate-200 my-1" />
                  <PricingRow
                    label={s6.paymentMode === "advance" ? "Pay Now (15% Advance)" : "Total Payable"}
                    amount={`₹${s6.paymentMode === "advance" ? advanceAmt : totalPayable}`}
                    highlight
                  />
                  {s6.paymentMode === "advance" && (
                    <p className="text-xs text-slate-400 mt-1">Remaining ₹{totalPayable - advanceAmt} payable after service</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 7: Confirmation & Dispatch
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">Review & Confirm</h2>
                <p className="text-sm text-slate-400 mt-0.5">Verify all details before dispatching</p>
              </div>

              {/* Full summary */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={15} className="text-amber-400" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Booking Summary</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label:"Service",     value:`${category?.icon} ${category?.name} — ${s1.subService}` },
                    { label:"Problem",     value:s2.problemType },
                    { label:"Urgency",     value:s2.urgency === "standard" ? "Standard (24 hrs)" : s2.urgency === "priority" ? "⚡ Priority (4 hrs)" : "🚨 Emergency (1 hr)" },
                    { label:"Location",   value:`${s3.houseFlat}, ${s3.building ? s3.building+", " : ""}${s3.area}, ${s3.pincode}` },
                    { label:"Date & Time", value:`${s4.date} · ${s4.timeSlot}` },
                    { label:"Flexibility", value:s4.flexibility === "flexible" ? "Flexible ±3 hrs" : "Exact time required" },
                    { label:"Payment",     value:`${s6.paymentMode === "cod" ? "Pay After Service" : s6.paymentMode === "advance" ? `Advance ₹${advanceAmt}` : `Full ₹${totalPayable}`} · ${s6.paymentMethod.toUpperCase()}` },
                    { label:"Total",       value:`₹${totalPayable.toLocaleString("en-IN")}`, highlight:true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className={`flex items-start gap-3 ${highlight ? "pt-3 border-t border-white/20" : ""}`}>
                      <span className="text-xs text-slate-400 w-24 flex-shrink-0 pt-0.5">{label}</span>
                      <span className={`text-xs font-semibold flex-1 ${highlight ? "text-emerald-400 font-black text-base" : "text-white"}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatch Logic Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Zap size={13} className="text-amber-500" /> ADDies Smart Dispatch
                </p>
                <div className="space-y-2.5">
                  {[
                    { icon:TrendingUp, c:"text-emerald-500", t:"Distance + Rating + Reliability score calculate hoga" },
                    { icon:Users,      c:"text-blue-500",    t:"Top 3 verified vendors ko notification jaayegi" },
                    { icon:Timer,      c:"text-amber-500",   t:"5-minute accept window — fastest vendor assigned" },
                    { icon:RotateCcw,  c:"text-violet-500",  t:"No accept → auto-escalation to next batch" },
                  ].map(({ icon: Icon, c, t }) => (
                    <div key={t} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <Icon size={13} className={`${c} flex-shrink-0 mt-0.5`} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1.5">
                <p className="font-black text-amber-700 flex items-center gap-1.5"><Info size={13} /> Cancellation Policy</p>
                <p>• Cancel before vendor dispatch: <strong>Full refund</strong></p>
                <p>• Cancel after vendor assigned: <strong>₹50 cancellation fee</strong></p>
                <p>• Cancel after vendor arrives: <strong>Visiting charge deducted</strong></p>
                <p>• Free reschedule up to <strong>4 hours before</strong> scheduled time</p>
              </div>

              {/* Terms */}
              <div data-field="terms">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${errors.terms ? "border-red-300 bg-red-50" : agreedTerms ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <input type="checkbox" checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600" />
                  <span className="text-sm text-slate-600">
                    I agree to ADDies' <strong>cancellation & rescheduling terms</strong>, and confirm all details are correct.
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
              </div>
            </div>
          )}

        </div>

        {/* ── Fixed Bottom CTA ────────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 z-40">
          <div className="space-y-6 mx-auto">
            {/* Amount reminder (steps 5-7) */}
            {step >= 4 && (
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-slate-500">
                  {category?.icon} {s1.subService}
                  {s2.urgency !== "standard" && <span className="ml-2 text-red-500 font-bold">+{s2.urgency}</span>}
                </span>
                <span className="font-black text-slate-800 text-base">₹{totalPayable.toLocaleString("en-IN")}</span>
              </div>
            )}

            <button onClick={handleNext} disabled={submitting}
              className="w-full py-4 rounded-2xl font-black text-base transition-all duration-200 flex items-center justify-center gap-3
                bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200
                hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-emerald-200
                active:scale-[0.98] disabled:opacity-60">
              {submitting
                ? <><Loader2 size={20} className="animate-spin" /> Processing...</>
                : step === 6
                ? <><Sparkles size={20} /> CONFIRM & REQUEST SERVICE</>
                : <>{STEPS[step + 1]?.label ?? "Next"} <ChevronRight size={20} /></>}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden backend data container (comment for devs) */}
      {/* HIDDEN_BACKEND_FIELDS:
        estimatedJobDuration: catData?.estDuration
        repeatCustomerFlag: false (check from user history)
        customerLifetimeValue: 0 (sum of past bookings)
        fraudRiskScore: 0 (calculate from: new account, unusual urgency, high value, etc.)
        vendorLoadToday: 0 (fetch from vendor API)
        areaDemandIndex: 0 (calculate from pincode booking density)
      */}
    </>
  );
}
