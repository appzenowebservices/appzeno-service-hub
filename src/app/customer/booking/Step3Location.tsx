// src/pages/customer/booking/Step3Location.tsx
import { useRef, useEffect, useCallback, useState } from "react";
import { Navigation, Loader2, MapPin } from "lucide-react";
import type { Step3Data } from "./types";

interface Props {
  data:       Step3Data;
  errors:     Record<string,string>;
  mapCenter:  [number,number];
  onChange:   (d: Step3Data) => void;
}

// ── Draggable Map ──────────────────────────────────────────────────────────────
function DraggableMap({ lat, lng, onLocationChange }: {
  lat: number; lng: number;
  onLocationChange:(lat:number, lng:number, addr:Partial<Step3Data>) => void;
}) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const mapInst = useRef<unknown>(null);
  const marker  = useRef<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [ready,   setReady]   = useState(false);

  const reverseGeocode = useCallback(async (lt: number, ln: number) => {
    setLoading(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lt}&lon=${ln}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language":"en" } }
      );
      const d = await r.json();
      const a = d.address || {};
      onLocationChange(lt, ln, {
        area:    a.suburb || a.neighbourhood || a.village || a.town || "",
        pincode: a.postcode || "",
        lat:     lt,
        lng:     ln,
      });
    } catch { /* silent */ }
    finally  { setLoading(false); }
  }, [onLocationChange]);

  // Expose method to move marker externally (for GPS button)
  useEffect(() => {
    if (lat && lng && mapInst.current && marker.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (marker.current as any).setLatLng([lat, lng]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapInst.current as any).setView([lat, lng], 17);
    }
  }, [lat, lng]);

  useEffect(() => {
    if (mapInst.current || !mapRef.current) return;
    const initLat = lat || 28.6139;
    const initLng = lng || 77.2090;

    const loadLeaflet = async () => {
      if (!(window as Record<string,unknown>).L) {
        await Promise.all([
          new Promise<void>(res => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
            link.onload = () => res();
            document.head.appendChild(link);
          }),
          new Promise<void>(res => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
            s.onload = () => res();
            document.head.appendChild(s);
          }),
        ]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L   = (window as any).L;
      const map = L.map(mapRef.current!).setView([initLat, initLng], 15);
      mapInst.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:"© OpenStreetMap contributors",
      }).addTo(map);

      const pinIcon = L.divIcon({
        html:`<div style="width:36px;height:44px;position:relative;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
          <div style="width:36px;height:36px;background:#10b981;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);border:3px solid white;display:flex;align-items:center;justify-content:center;">
            <div style="transform:rotate(45deg);color:white;font-size:16px;">📍</div>
          </div>
        </div>`,
        iconSize:[36,44], iconAnchor:[18,44], className:"",
      });

      const mkr = L.marker([initLat, initLng], { icon:pinIcon, draggable:true }).addTo(map);
      marker.current = mkr;

      mkr.on("dragend", (e: { target:{ getLatLng:() => { lat:number;lng:number } } }) => {
        const { lat: lt, lng: ln } = e.target.getLatLng();
        reverseGeocode(lt, ln);
      });

      map.on("click", (e: { latlng:{ lat:number; lng:number } }) => {
        mkr.setLatLng([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      setReady(true);
      reverseGeocode(initLat, initLng);
    };

    loadLeaflet();
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200" style={{ height:280 }}>
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

// ── Yes/No Toggle ─────────────────────────────────────────────────────────────
function YesNo({ label, value, onChange }: {
  label:string; value:boolean|null; onChange:(v:boolean)=>void;
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

// ── Main Step3 ────────────────────────────────────────────────────────────────
export default function Step3Location({ data, errors, mapCenter, onChange }: Props) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError,   setGpsError]   = useState("");

  async function fetchCurrentLocation() {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language":"en" } }
          );
          const d = await r.json();
          const a = d.address || {};
          onChange({
            ...data,
            lat,
            lng,
            area:    a.suburb || a.neighbourhood || a.village || a.town || "",
            pincode: a.postcode || "",
            houseFlat: data.houseFlat || a.house_number || "",
            building:  data.building  || a.road || "",
          });
        } catch {
          setGpsError("Address fetch failed. Please fill manually.");
          onChange({ ...data, lat, lng });
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED)
          setGpsError("Location permission denied. Please allow location access in browser settings.");
        else if (err.code === err.POSITION_UNAVAILABLE)
          setGpsError("Location unavailable. Please fill address manually.");
        else
          setGpsError("Could not fetch location. Please try again.");
      },
      { enableHighAccuracy:true, timeout:10000, maximumAge:0 }
    );
  }

  const fields = [
    { key:"houseFlat", label:"House / Flat No.",   req:true },
    { key:"building",  label:"Building / Society", req:false },
    { key:"floor",     label:"Floor (optional)",   req:false },
    { key:"landmark",  label:"Landmark",           req:false },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">Service Location</h2>
        <p className="text-sm text-slate-400 mt-0.5">Pin your exact location for accurate dispatch</p>
      </div>

      {/* ── GPS Fetch Button ── */}
      <button
        type="button"
        onClick={fetchCurrentLocation}
        disabled={gpsLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed
          border-emerald-300 bg-emerald-50 text-emerald-700 font-bold text-sm
          hover:bg-emerald-100 hover:border-emerald-400 disabled:opacity-60 transition-all"
      >
        {gpsLoading
          ? <><Loader2 size={16} className="animate-spin" /> Fetching your location…</>
          : <><Navigation size={16} /> 📍 Use My Current Location</>
        }
      </button>
      {gpsError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
          <MapPin size={13} className="flex-shrink-0 mt-0.5" />
          {gpsError}
        </div>
      )}

      {/* ── Map ── */}
      <DraggableMap
        lat={data.lat || mapCenter[0]}
        lng={data.lng || mapCenter[1]}
        onLocationChange={(lat, lng, addr) => {
          onChange({
            ...data, lat, lng,
            area:    addr.area    || data.area,
            pincode: addr.pincode || data.pincode,
          });
        }}
      />

      {/* ── Address Fields ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, req }) => (
          <div key={key} data-field={key}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              {label}{req && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={data[key as keyof Step3Data] as string}
              onChange={e => onChange({ ...data, [key]: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-all
                focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
                ${errors[key] ? "border-red-300" : "border-slate-200"}`}
            />
            {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div data-field="area">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Area / Locality <span className="text-red-400">*</span>
          </label>
          <input type="text" value={data.area}
            onChange={e => onChange({ ...data, area: e.target.value })}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-all
              focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
              ${errors.area ? "border-red-300" : "border-slate-200"}`} />
          {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
        </div>
        <div data-field="pincode">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            PIN Code <span className="text-red-400">*</span>
          </label>
          <input type="text" value={data.pincode} maxLength={6}
            onChange={e => onChange({ ...data, pincode: e.target.value.replace(/\D/g,"") })}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-all
              focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
              ${errors.pincode ? "border-red-300" : "border-slate-200"}`} />
          {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
        </div>
      </div>

      {/* ── Accessibility ── */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-2">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2 pt-2">Accessibility Info</p>
        <YesNo label="🛗 Lift Available?"       value={data.liftAvailable} onChange={v => onChange({ ...data, liftAvailable:v })} />
        <YesNo label="🚗 Parking Available?"    value={data.parkingAvail}  onChange={v => onChange({ ...data, parkingAvail:v })} />
        <YesNo label="🏘️ Gated Society?"        value={data.gatedSociety}  onChange={v => onChange({ ...data, gatedSociety:v })} />
      </div>
    </div>
  );
}
