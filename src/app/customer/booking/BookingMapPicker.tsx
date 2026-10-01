"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, Loader2, MapPin, Navigation } from "lucide-react";

export interface MapAddress {
  lat: number;
  lng: number;
  area: string;
  pincode: string;
  city: string;
  state: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<Partial<MapAddress>> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "ADDies-App/1.0" } },
    );
    if (res.status === 429) return { lat, lng };
    const d = (await res.json()) as { address?: Record<string, string> };
    const a = d.address ?? {};
    return {
      lat, lng,
      area: a.suburb ?? a.neighbourhood ?? a.road ?? a.town ?? "",
      pincode: a.postcode ?? "",
      city: a.city ?? a.town ?? a.village ?? a.county ?? "",
      state: a.state ?? "",
    };
  } catch {
    return { lat, lng };
  }
}

export default function BookingMapPicker({ onChange }: { onChange: (addr: MapAddress) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (!elRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el: any = elRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    let cancelled = false;

    const push = async (lat: number, lng: number, move = false) => {
      if (cancelled || !mapRef.current) return;
      if (move) {
        mapRef.current.setView([lat, lng], 16);
        markerRef.current?.setLatLng([lat, lng]);
      }
      setGeocoding(true);
      const geo = await reverseGeocode(lat, lng);
      setGeocoding(false);
      if (geo.lat && geo.lng) onChange({ ...geo, lat, lng } as MapAddress);
    };

    const load = () => {
      if (cancelled || mapRef.current || !elRef.current || el._leaflet_id) return;
      const L = w.L;
      if (!L) return;
      const map = L.map(elRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([20.5937, 78.9629], 5);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map);
      const marker = L.marker([20.5937, 78.9629], { draggable: true }).addTo(map);
      markerRef.current = marker;
      marker.bindTooltip("Drag me to set exact location", { permanent: false, direction: "top" });
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        void push(p.lat, p.lng);
      });
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng]);
        void push(e.latlng.lat, e.latlng.lng);
      });
      setTimeout(() => {
        if (mapRef.current) map.invalidateSize();
        setReady(true);
      }, 200);
    };

    if (w.L) load();
    else {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }
      let script = document.getElementById("leaflet-js") as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
        document.head.appendChild(script);
      }
      if (w.L) load();
      else script.addEventListener("load", load, { once: true });
    }

    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
      mapRef.current = null;
      markerRef.current = null;
      if (el) delete el._leaflet_id;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void (async () => {
          const { latitude, longitude } = pos.coords;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const map: any = mapRef.current;
          map?.setView([latitude, longitude], 16);
          markerRef.current?.setLatLng([latitude, longitude]);
          setGeocoding(true);
          const geo = await reverseGeocode(latitude, longitude);
          setGeocoding(false);
          if (geo.lat && geo.lng) onChange({ ...geo, lat: latitude, lng: longitude } as MapAddress);
          setLocating(false);
        })();
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  return (
    <div>
      <div className="relative mb-2 overflow-hidden rounded-2xl border border-line" style={{ height: 240 }}>
        <div ref={elRef} style={{ height: "100%", width: "100%", zIndex: 0 }} />
        {!ready ? (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-surface">
            <span className="flex items-center gap-2 text-sm font-bold text-muted"><Loader2 size={16} className="animate-spin" /> Loading map…</span>
          </div>
        ) : null}
        {geocoding ? (
          <div className="absolute inset-x-0 top-3 z-[500] flex justify-center">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary-700 shadow-card"><Loader2 size={12} className="mr-1 inline animate-spin" /> Fetching address…</span>
          </div>
        ) : null}
        <button
          type="button"
          onClick={useMyLocation}
          className="absolute bottom-3 right-3 z-[500] flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-primary-700 shadow-card ring-1 ring-line hover:bg-primary-50"
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <Navigation size={12} className="text-primary-600" /> We auto-detect your location — tap the map or drag the pin to correct it precisely.
      </p>
      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted">
        <MapPin size={11} className="text-accent-500" /> Address fields below auto-fill from this map.
      </p>
    </div>
  );
}