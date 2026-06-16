import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, LocateFixed } from "lucide-react";

export interface AddressData {
  houseFlat:       string;   // user editable
  street:          string;   // user editable
  landmark:        string;   // user editable
  city:            string;   // auto-filled
  state:           string;   // auto-filled
  pincode:         string;   // auto-filled
  fullAddress:     string;   // computed display
  lat:             number;
  lng:             number;
}

interface Props {
  value:    AddressData;
  onChange: (addr: AddressData) => void;
  label?:   string;
}

const DEFAULT_LAT = 26.8467;
const DEFAULT_LNG = 80.9462; // Lucknow center

async function reverseGeocode(lat: number, lng: number): Promise<Partial<AddressData>> {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const a    = data.address ?? {};

    const city    = a.city || a.town || a.village || a.county || "";
    const state   = a.state || "";
    const pincode = a.postcode || "";
    const road    = a.road || a.neighbourhood || "";
    const suburb  = a.suburb || a.quarter || "";
    const street  = [road, suburb].filter(Boolean).join(", ");

    return { city, state, pincode, street, lat, lng };
  } catch {
    return { lat, lng };
  }
}

export default function MapAddressPicker({ value, onChange, label }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafletMap  = useRef<unknown>(null);
  const markerRef   = useRef<unknown>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [locating,  setLocating]  = useState(false);

  // Dynamically load Leaflet CSS + JS
  useEffect(() => {
    if (document.getElementById("leaflet-css")) {
      initMap();
      return;
    }
    const link  = document.createElement("link");
    link.id     = "leaflet-css";
    link.rel    = "stylesheet";
    link.href   = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src   = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => initMap();
    document.head.appendChild(script);

    return () => {
      // cleanup map on unmount
      if (leafletMap.current) {
        (leafletMap.current as { remove: () => void }).remove();
        leafletMap.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initMap() {
    if (!mapRef.current || leafletMap.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    const lat = value.lat || DEFAULT_LAT;
    const lng = value.lng || DEFAULT_LNG;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 15);
    leafletMap.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="
        width:36px;height:36px;
        background:linear-gradient(135deg,#2E86C1,#1A5276);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      className: "",
      iconAnchor: [18, 36],
      iconSize:   [36, 36],
    });

    const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", async () => {
      const pos = marker.getLatLng();
      setGeocoding(true);
      const geo = await reverseGeocode(pos.lat, pos.lng);
      setGeocoding(false);
      onChange({
        ...value,
        ...geo,
        houseFlat: value.houseFlat,
        landmark:  value.landmark,
        fullAddress: buildFullAddress({ ...value, ...geo }),
      });
    });

    map.on("click", async (e: { latlng: { lat: number; lng: number } }) => {
      marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      setGeocoding(true);
      const geo = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      setGeocoding(false);
      onChange({
        ...value,
        ...geo,
        houseFlat: value.houseFlat,
        landmark:  value.landmark,
        fullAddress: buildFullAddress({ ...value, ...geo }),
      });
    });
  }

  function buildFullAddress(data: Partial<AddressData>): string {
    return [data.houseFlat, data.street, data.landmark, data.city, data.state, data.pincode]
      .filter(Boolean)
      .join(", ");
  }

  function handleLocateMe() {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      async ({ coords }) => {
        setLocating(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L;
        const map = leafletMap.current as { setView: (c: number[], z: number) => void } | null;
        const marker = markerRef.current as { setLatLng: (c: number[]) => void } | null;
        if (map && marker && L) {
          map.setView([coords.latitude, coords.longitude], 17);
          marker.setLatLng([coords.latitude, coords.longitude]);
        }
        setGeocoding(true);
        const geo = await reverseGeocode(coords.latitude, coords.longitude);
        setGeocoding(false);
        onChange({
          ...value,
          ...geo,
          houseFlat: value.houseFlat,
          landmark:  value.landmark,
          fullAddress: buildFullAddress({ ...value, ...geo }),
        });
      },
      () => setLocating(false)
    );
  }

  function handleManualChange(field: keyof AddressData, val: string) {
    const updated = { ...value, [field]: val };
    updated.fullAddress = buildFullAddress(updated);
    onChange(updated);
  }

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide flex items-center gap-1">
          <MapPin size={12} /> {label}
        </label>
      )}

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-sm" style={{ height: 280 }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />

        {/* Locate Me button */}
        <button
          type="button"
          onClick={handleLocateMe}
          className="absolute top-3 right-3 z-[999] flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                     bg-white border border-primary-200 text-primary-700 text-xs font-semibold shadow-md
                     hover:bg-primary-50 transition-colors"
        >
          {locating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
          {locating ? "Locating…" : "Locate Me"}
        </button>

        {/* Geocoding overlay */}
        {geocoding && (
          <div className="absolute inset-0 z-[998] bg-white/60 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow text-sm text-primary-700 font-medium">
              <Loader2 size={14} className="animate-spin" /> Fetching address…
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-400 -mt-1">
        📍 Click on map or drag the pin to set your location
      </p>

      {/* Address Form below map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1">
            House / Flat / Building No. <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={value.houseFlat}
            onChange={(e) => handleManualChange("houseFlat", e.target.value)}
            placeholder="e.g. Flat 4B, Tower C, Green Valley Apartments"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white
                       focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1">
            Street / Area
          </label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => handleManualChange("street", e.target.value)}
            placeholder="Auto-filled from map"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                       focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1">
            Landmark (optional)
          </label>
          <input
            type="text"
            value={value.landmark}
            onChange={(e) => handleManualChange("landmark", e.target.value)}
            placeholder="e.g. Near Big Bazaar, Opposite Metro Station"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white
                       focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1">
            City
          </label>
          <input
            type="text"
            value={value.city}
            readOnly
            placeholder="Auto-detected from pin"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-100 bg-neutral-100 text-neutral-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1">
            State
          </label>
          <input
            type="text"
            value={value.state}
            readOnly
            placeholder="Auto-detected from pin"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-100 bg-neutral-100 text-neutral-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1">
            Pincode
          </label>
          <input
            type="text"
            value={value.pincode}
            readOnly
            placeholder="Auto-detected from pin"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-100 bg-neutral-100 text-neutral-500 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
