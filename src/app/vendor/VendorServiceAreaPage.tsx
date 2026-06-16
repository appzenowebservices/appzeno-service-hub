/**
 * VendorServiceAreaPage.tsx
 * Location: src/pages/vendor/VendorServiceAreaPage.tsx
 */

import { useState, useEffect, useRef } from "react";
import {
  MapPin, Plus, X, CheckCircle2, AlertCircle, Search,
  Info, Loader2, Navigation, Trash2, Edit3, Save,
  TrendingUp, Users, Zap, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PincodeZone {
  pincode:  string;
  district: string;
  state:    string;
  status:   "active" | "paused";
  leads:    number;      // mock leads from this zone
  earnings: number;      // mock earnings from this zone
}

// ─── Mock initial zones ───────────────────────────────────────────────────────
const INITIAL_ZONES: PincodeZone[] = [
  { pincode:"110016", district:"South Delhi",   state:"Delhi", status:"active", leads:18, earnings:6840 },
  { pincode:"110024", district:"South Delhi",   state:"Delhi", status:"active", leads:12, earnings:4200 },
  { pincode:"110028", district:"West Delhi",    state:"Delhi", status:"active", leads:9,  earnings:3150 },
  { pincode:"110029", district:"South Delhi",   state:"Delhi", status:"active", leads:14, earnings:5600 },
  { pincode:"110057", district:"South-West Delhi",state:"Delhi",status:"paused",leads:5,  earnings:1800 },
];

// ─── Pincode API fetch ────────────────────────────────────────────────────────
async function fetchPincodeInfo(pincode: string): Promise<{ district: string; state: string } | null> {
  try {
    const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (data[0]?.Status === "Success") {
      const po = data[0].PostOffice[0];
      return { district: po.District, state: po.State };
    }
    return null;
  } catch { return null; }
}

// ─── Map Component (Leaflet) ──────────────────────────────────────────────────
function ServiceMap({ zones }: { zones: PincodeZone[] }) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapInst   = useRef<unknown>(null);
  const [ready,   setReady] = useState(false);

  useEffect(() => {
    if (mapInst.current || !mapRef.current) return;

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
      const L    = (window as any).L;
      const map  = L.map(mapRef.current, { zoomControl: true }).setView([28.6139, 77.2090], 11);
      mapInst.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      // Add markers for each zone (approximate Delhi lat/lng per zone)
      const coords: Record<string, [number,number]> = {
        "110016": [28.5562, 77.2073],
        "110024": [28.5733, 77.2590],
        "110028": [28.6380, 77.1450],
        "110029": [28.5684, 77.1925],
        "110057": [28.5921, 77.1148],
      };

      zones.forEach(z => {
        const pos = coords[z.pincode] ?? [28.6139 + Math.random()*0.1 - 0.05, 77.2090 + Math.random()*0.1 - 0.05];
        const color = z.status === "active" ? "#10b981" : "#f59e0b";
        const icon  = L.divIcon({
          html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7],
        });
        L.marker(pos, { icon })
          .addTo(map)
          .bindPopup(`<b>${z.pincode}</b><br>${z.district}<br>Leads: ${z.leads}`);
      });

      setReady(true);
    };

    loadLeaflet();
    return () => {
      if (mapInst.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInst.current as any).remove();
        mapInst.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200" style={{ height: 320 }}>
      {!ready && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 size={24} className="animate-spin text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorServiceAreaPage() {
  const [zones,     setZones]     = useState<PincodeZone[]>(INITIAL_ZONES);
  const [newPin,    setNewPin]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [pinErr,    setPinErr]    = useState("");
  const [pinOk,     setPinOk]     = useState("");
  const [saved,     setSaved]     = useState(false);
  const [showStats, setShowStats] = useState<string | null>(null);

  const activeZones  = zones.filter(z => z.status === "active");
  const totalLeads   = zones.reduce((s, z) => s + z.leads, 0);
  const totalEarning = zones.reduce((s, z) => s + z.earnings, 0);

  async function handleAddPin() {
    setPinErr(""); setPinOk("");
    if (!/^\d{6}$/.test(newPin)) { setPinErr("6-digit pincode daalo"); return; }
    if (zones.find(z => z.pincode === newPin)) { setPinErr("Ye pincode already added hai"); return; }

    setLoading(true);
    const info = await fetchPincodeInfo(newPin);
    setLoading(false);

    if (!info) { setPinErr("Pincode nahi mila — dobara check karo"); return; }

    const zone: PincodeZone = {
      pincode:  newPin,
      district: info.district,
      state:    info.state,
      status:   "active",
      leads:    0,
      earnings: 0,
    };
    setZones(p => [...p, zone]);
    setPinOk(`${newPin} — ${info.district}, ${info.state} added!`);
    setNewPin("");
  }

  function toggleStatus(pin: string) {
    setZones(p => p.map(z => z.pincode === pin
      ? { ...z, status: z.status === "active" ? "paused" : "active" }
      : z));
  }

  function removeZone(pin: string) {
    setZones(p => p.filter(z => z.pincode !== pin));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <MapPin size={22} className="text-emerald-500" /> Service Area
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Apne service pincodes manage karo — jitne zyada zones, utne zyada leads</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
            ${saved ? "bg-green-100 text-green-700 border-2 border-green-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
          {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Active Zones",    value:String(activeZones.length), icon:MapPin,    c:"text-emerald-600", bg:"bg-emerald-50", b:"border-emerald-200" },
          { label:"Total Zones",     value:String(zones.length),       icon:Navigation,c:"text-blue-600",    bg:"bg-blue-50",    b:"border-blue-200"    },
          { label:"Leads from Area", value:String(totalLeads),         icon:Zap,       c:"text-amber-600",   bg:"bg-amber-50",   b:"border-amber-200"   },
          { label:"Area Earnings",   value:`₹${totalEarning.toLocaleString("en-IN")}`, icon:TrendingUp, c:"text-violet-600",bg:"bg-violet-50",b:"border-violet-200" },
        ].map(({ label, value, icon: Icon, c, bg, b }) => (
          <div key={label} className={`rounded-2xl border-2 ${b} ${bg} p-4`}>
            <Icon size={15} className={`${c} mb-2`} />
            <p className={`text-2xl font-black ${c}`}>{value}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <ServiceMap zones={zones} />

      {/* Add Pincode */}
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5">
        <p className="text-sm font-black text-emerald-800 mb-3 flex items-center gap-2">
          <Plus size={16} /> Naya Service Pincode Add Karo
        </p>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text" placeholder="6-digit pincode daalo..." value={newPin}
              onChange={e => { setNewPin(e.target.value.replace(/\D/g,"").slice(0,6)); setPinErr(""); setPinOk(""); }}
              onKeyDown={e => e.key === "Enter" && handleAddPin()}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all
                ${pinErr ? "border-red-300" : pinOk ? "border-green-400" : "border-slate-200 focus:border-emerald-400"}`}
            />
            {pinErr && <p className="text-xs text-red-500 font-medium mt-1">{pinErr}</p>}
            {pinOk  && <p className="text-xs text-green-600 font-bold mt-1">✓ {pinOk}</p>}
          </div>
          <button onClick={handleAddPin} disabled={loading || newPin.length < 6}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm
                       hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {loading ? "Searching..." : "Add Zone"}
          </button>
        </div>
        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
          <Info size={11} /> Pincode add karne se us area ke customers aapko lead receive kar sakte hain
        </p>
      </div>

      {/* Zone List */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Your Service Zones ({zones.length})</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Active
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" /> Paused
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {zones.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <MapPin size={32} className="mx-auto mb-3 text-slate-200" />
              <p className="font-bold">Koi zone add nahi kiya</p>
              <p className="text-xs mt-1">Upar pincode add karo</p>
            </div>
          ) : zones.map(z => (
            <div key={z.pincode}>
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${z.status === "active" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-slate-800 font-mono">{z.pincode}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                      ${z.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {z.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{z.district}, {z.state}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setShowStats(showStats === z.pincode ? null : z.pincode)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    {showStats === z.pincode ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button onClick={() => toggleStatus(z.pincode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                      ${z.status === "active"
                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"}`}>
                    {z.status === "active" ? "Pause" : "Activate"}
                  </button>
                  <button onClick={() => removeZone(z.pincode)}
                    className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Stats expand */}
              {showStats === z.pincode && (
                <div className="px-5 pb-4 grid grid-cols-3 gap-3 bg-slate-50 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-white border border-slate-100 text-center">
                    <p className="text-xs text-slate-400 mb-0.5">Leads</p>
                    <p className="text-lg font-black text-amber-600">{z.leads}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-100 text-center">
                    <p className="text-xs text-slate-400 mb-0.5">Earnings</p>
                    <p className="text-lg font-black text-emerald-600">₹{z.earnings.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-100 text-center">
                    <p className="text-xs text-slate-400 mb-0.5">Avg/Lead</p>
                    <p className="text-lg font-black text-violet-600">
                      ₹{z.leads > 0 ? Math.round(z.earnings / z.leads) : 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: MapPin,    title:"More Zones = More Leads", desc:"Har active pincode se alag leads aati hain. 5+ zones recommended hai." },
          { icon: Zap,       title:"High-demand Areas",       desc:"Central Delhi zones mein sabse zyada leads hoti hain. Expand karo." },
          { icon: TrendingUp,title:"Pause vs Delete",         desc:"Temporarily busy ho toh pause karo — zone ka data delete nahi hoga." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">{title}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
