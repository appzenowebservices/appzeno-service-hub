"use client";

import { useEffect, useRef } from "react";

interface AreaMarker {
  id: string;
  city: string;
  lat: number;
  lng: number;
  active: boolean;
}

export default function ServingAreasMap({
  areas,
  selectedId,
  onSelect,
  onPickCoords,
}: {
  areas: AreaMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPickCoords: (lat: number, lng: number) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const load = () => {
      const L = w.L;
      if (!L) return;
      const map = L.map(elRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([26.8467, 80.9462], 6);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map);
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => onPickCoords(e.latlng.lat, e.latlng.lng));
      setTimeout(() => map.invalidateSize(), 150);
    };
    if (w.L) return load();
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = load;
    document.head.appendChild(s);
    return () => {
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync markers with areas
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
      marker.on("click", () => onSelect(a.id));
      if (a.id === selectedId) map.setView([a.lat, a.lng], 9);
      return marker;
    });
  }, [areas, selectedId, onSelect]);

  return <div ref={elRef} style={{ height: "100%", width: "100%", zIndex: 0 }} />;
}