"use client";

import { useEffect, useRef, useState } from "react";

interface AreaMarker {
  id: string;
  city: string;
  lat: number;
  lng: number;
  active: boolean;
}

export interface AreaPin {
  pincode: string;
  lat: number;
  lng: number;
}

// Module-level cache so re-selecting a city doesn't re-hit Nominatim.
const pinCache = new Map<string, AreaPin>();

export async function geocodePincode(pincode: string): Promise<AreaPin | null> {
  const cached = pinCache.get(pincode);
  if (cached) return cached;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&countrycodes=in&format=json&limit=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "ADDies-Admin/1.0" } },
    );
    if (res.status === 429) return null; // rate-limited — skip, don't hammer
    const arr = (await res.json()) as { lat: string; lon: string }[];
    const hit = arr[0];
    if (!hit) return null;
    const pin: AreaPin = { pincode, lat: Number(hit.lat), lng: Number(hit.lon) };
    pinCache.set(pincode, pin);
    return pin;
  } catch {
    return null;
  }
}

export default function ServingAreasMap({
  areas,
  pins = [],
  onSelect,
  onPickCoords,
}: {
  areas: AreaMarker[];
  pins?: AreaPin[];
  onSelect: (id: string) => void;
  onPickCoords: (lat: number, lng: number) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pinMarkersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!elRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el: any = elRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    let cancelled = false;

    const load = () => {
      if (cancelled || mapRef.current || !elRef.current || el._leaflet_id) return;
      const L = w.L;
      if (!L) return;
      const map = L.map(elRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([26.8467, 80.9462], 6);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map);
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => onPickCoords(e.latlng.lat, e.latlng.lng));
      // invalidate after the container has real layout, then mark ready —
      // circleMarkers crash if added while the map has zero size.
      setTimeout(() => {
        if (mapRef.current) map.invalidateSize();
        setReady(true);
      }, 250);
    };

    if (w.L) {
      load();
    } else {
      // ensure the Leaflet CSS/JS are injected exactly once (StrictMode remounts effects)
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
      if (w.L) {
        load();
      } else {
        script.addEventListener("load", load, { once: true });
      }
    }

    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
      mapRef.current = null;
      // allow the container to be re-initialized on a later remount
      if (el) delete el._leaflet_id;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync city markers with areas
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    markersRef.current.forEach((m) => m?.remove?.());
    markersRef.current = areas.map((a) => {
      const marker = L.marker([a.lat, a.lng], {
        icon: L.divIcon({
          html: `<div style="width:26px;height:26px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);background:${a.active ? "#059669" : "#94a3b8"};color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;">${a.active ? "✓" : "—"}</div>`,
          className: "",
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        }),
      }).addTo(map);
      marker.bindTooltip(a.city, { permanent: false });
      marker.on("click", () => onSelect(a.id));
      return marker;
    });
  }, [areas, onSelect]);

  // sync pincode pins for the selected area
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    pinMarkersRef.current.forEach((m) => m?.remove?.());
    pinMarkersRef.current = [];
    if (pins.length === 0) return;
    // force a size re-measure so circleMarker projection never hits a zero-size map
    map.invalidateSize();
    pinMarkersRef.current = pins.map((pin) => {
      const m = L.circleMarker([pin.lat, pin.lng], {
        radius: 7,
        color: "#ffffff",
        weight: 1.5,
        fillColor: "#f59e0b",
        fillOpacity: 0.95,
      }).addTo(map);
      m.bindTooltip(pin.pincode, { permanent: false, direction: "top" });
      return m;
    });
    const all = pins;
    if (all.length > 0) {
      map.fitBounds(L.latLngBounds(all.map((p) => [p.lat, p.lng])), { padding: [30, 30] });
    }
  }, [pins, ready]);

  return <div ref={elRef} style={{ height: "100%", width: "100%", zIndex: 0 }} />;
}