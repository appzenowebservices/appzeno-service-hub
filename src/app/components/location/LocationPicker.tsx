"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { MapPin, ChevronDown, LocateFixed, Loader2, X, Check } from "lucide-react";
import { trpc } from "~/trpc/react";
import { SERVED_CITIES, slugify } from "./cities";
import {
  DEFAULT_LOCATION,
  LOCATION_EVENT,
  loadLocation,
  saveLocation,
  type SavedLocation,
} from "./location-store";

type Variant = "header" | "hero";

interface Draft {
  lat: number;
  lng: number;
  city: string;
  state: string;
  pincode: string;
  area: string;
}

/** Minimal structural types for the Leaflet CDN global — avoids `any`. */
interface LeafletLatLng {
  lat: number;
  lng: number;
}
interface LeafletMap {
  setView: (center: [number, number], zoom: number) => void;
  invalidateSize: () => void;
  on: (event: string, cb: (e: { latlng: LeafletLatLng }) => void) => void;
}
interface LeafletMarker {
  setLatLng: (center: [number, number]) => void;
  getLatLng: () => LeafletLatLng;
  on: (event: string, cb: () => void) => void;
}
interface LeafletStatic {
  map: (el: HTMLElement, opts?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, opts?: Record<string, unknown>) => { addTo: (m: LeafletMap) => void };
  divIcon: (opts?: Record<string, unknown>) => unknown;
  marker: (center: [number, number], opts?: Record<string, unknown>) => LeafletMarker;
}

function getLeaflet(): LeafletStatic | null {
  const w = window as unknown as { L?: LeafletStatic };
  return w.L ?? null;
}

function toDraft(loc: SavedLocation): Draft {
  return { lat: loc.lat, lng: loc.lng, city: loc.city, state: loc.state, pincode: loc.pincode, area: loc.area };
}

interface GeoResult {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  pincode?: string;
  area?: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
  const fallback: GeoResult = { lat, lng };
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = (await res.json()) as {
      address?: Record<string, string>;
    };
    const a = data.address ?? {};
    const city = a.city ?? a.town ?? a.village ?? a.county ?? a.state_district;
    return {
      lat,
      lng,
      city: city !== "" ? city : undefined,
      state: a.state,
      pincode: a.postcode,
      area: a.suburb ?? a.neighbourhood ?? a.road,
    };
  } catch {
    return fallback;
  }
}

async function geocodePincode(pin: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pin)}&countrycodes=in&format=json&addressdetails=1&limit=1`,
      { headers: { "Accept-Language": "en" } },
    );
    const arr = (await res.json()) as {
      lat: string;
      lon: string;
      address?: Record<string, string>;
    }[];
    const hit = arr[0];
    if (!hit) return null;
    const a = hit.address ?? {};
    const city = a.city ?? a.town ?? a.village ?? a.county ?? a.state_district;
    return {
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      city: city !== "" ? city : undefined,
      state: a.state,
      pincode: pin,
      area: a.suburb ?? a.neighbourhood,
    };
  } catch {
    return null;
  }
}

function ensureLeaflet(onReady: () => void): void {
  if (getLeaflet()) {
    onReady();
    return;
  }
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
  }
  const existing = document.getElementById("leaflet-js");
  if (existing instanceof HTMLScriptElement) {
    existing.addEventListener("load", onReady, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = "leaflet-js";
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
  script.onload = onReady;
  document.head.appendChild(script);
}

export default function LocationPicker({ variant = "header" }: { variant?: Variant }) {
  const { data: session, status } = useSession();
  const sessionCity = (session?.user as { city?: string } | undefined)?.city;
  const sessionId = (session?.user)?.id;

  const [loc, setLoc] = useState<SavedLocation | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_LOCATION));
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  const saveMutation = trpc.users.update.useMutation();

  // ── hydrate from localStorage, keep header + hero in sync ──
  useEffect(() => {
    setLoc(loadLocation());
    const onChange = (e: Event) => setLoc((e as CustomEvent<SavedLocation>).detail);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "addies:location") setLoc(loadLocation());
    };
    window.addEventListener(LOCATION_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LOCATION_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // seed draft from saved location when popover opens
  useEffect(() => {
    if (open) {
      setDraft(toDraft(loc ?? DEFAULT_LOCATION));
      setError(null);
      setPinError(null);
    }
  }, [open, loc]);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayCity = loc?.city ?? sessionCity ?? "Lucknow";
  const displaySlug = loc?.slug ?? slugify(displayCity);
  // ||-chain (not ??): empty strings must fall through to the next label
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const displaySub = loc?.pincode || loc?.area || loc?.state || "Set location";

  // ── map ──
  const moveMap = useCallback((lat: number, lng: number, zoom = 15) => {
    mapRef.current?.setView([lat, lng], zoom);
    markerRef.current?.setLatLng([lat, lng]);
  }, []);

  const mergeGeo = useCallback((geo: GeoResult) => {
    setDraft((d) => ({
      lat: geo.lat,
      lng: geo.lng,
      city: geo.city ?? d.city,
      state: geo.state ?? d.state,
      pincode: geo.pincode ?? d.pincode,
      area: geo.area ?? d.area,
    }));
  }, []);

  useEffect(() => {
    if (!open || !mapEl.current) return;
    if (mapRef.current) {
      // recenter when reopening with fresh draft
      moveMap(draft.lat, draft.lng, 13);
      const m = mapRef.current;
      setTimeout(() => m.invalidateSize(), 150);
      return;
    }
    ensureLeaflet(() => {
      if (!mapEl.current || mapRef.current) return;
      const L = getLeaflet();
      if (!L) return;
      const map = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: false });
      map.setView([draft.lat, draft.lng], 13);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      const icon = L.divIcon({
        html: `<div style="width:34px;height:34px;background:linear-gradient(135deg,#0284c7,#082f49);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
        className: "",
        iconAnchor: [17, 34],
        iconSize: [34, 34],
      });
      const marker = L.marker([draft.lat, draft.lng], { draggable: true, icon });
      // add marker to map via tile-layer-style chaining is not typed; use direct call
      (marker as unknown as { addTo: (m: LeafletMap) => void }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setGeocoding(true);
        void reverseGeocode(pos.lat, pos.lng)
          .then((geo) => mergeGeo(geo))
          .finally(() => setGeocoding(false));
      });
      map.on("click", (e) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng]);
        setGeocoding(true);
        void reverseGeocode(e.latlng.lat, e.latlng.lng)
          .then((geo) => mergeGeo(geo))
          .finally(() => setGeocoding(false));
      });
      setTimeout(() => map.invalidateSize(), 150);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleDetect() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported on this device — pick a city below.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        moveMap(latitude, longitude, 16);
        setGeocoding(true);
        void reverseGeocode(latitude, longitude)
          .then((geo) => mergeGeo(geo))
          .finally(() => setGeocoding(false));
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === 1
            ? "Location permission denied — allow access or pick a city below."
            : "Could not detect location — pick a city below.",
        );
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  function handleCityPick(slug: string) {
    const c = SERVED_CITIES.find((x) => x.slug === slug);
    if (!c) return;
    setDraft({ lat: c.lat, lng: c.lng, city: c.name, state: c.state, pincode: "", area: "" });
    moveMap(c.lat, c.lng, 12);
    setError(null);
  }

  function handlePincodeGo() {
    const v = pin.trim();
    if (!/^\d{6}$/.test(v)) {
      setPinError("Enter a valid 6-digit pincode.");
      return;
    }
    setPinError(null);
    setGeocoding(true);
    void geocodePincode(v).then((hit) => {
      setGeocoding(false);
      if (!hit) {
        setPinError("Pincode not found — try a nearby one.");
        return;
      }
      setDraft({
        lat: hit.lat,
        lng: hit.lng,
        city: hit.city ?? draft.city,
        state: hit.state ?? draft.state,
        pincode: v,
        area: hit.area ?? draft.area,
      });
      moveMap(hit.lat, hit.lng, 14);
    });
  }

  function handleConfirm() {
    const trimmed = draft.city.trim();
    const city = trimmed !== "" ? trimmed : displayCity;
    const next: SavedLocation = {
      city,
      slug: slugify(city),
      state: draft.state,
      pincode: draft.pincode,
      area: draft.area,
      lat: draft.lat,
      lng: draft.lng,
      updatedAt: Date.now(),
    };
    saveLocation(next);
    setLoc(next);
    setOpen(false);
    // persist to profile when logged in so bookings/support see the same city
    if (status === "authenticated" && sessionId) {
      saveMutation.mutate({
        id: sessionId,
        data: { city: next.city, state: next.state !== "" ? next.state : undefined },
      });
    }
  }

  const areaPrefix = draft.area !== "" ? `${draft.area}, ` : "";
  const draftLabel = draft.city !== "" ? `${areaPrefix}${draft.city}` : "Move the pin to set location";

  return (
    <div ref={wrapRef} className={variant === "header" ? "relative hidden md:block" : "relative flex-1"}>
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          title={displaySub}
          className="flex max-w-[220px] items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-body shadow-sm transition-all hover:border-primary-300 hover:text-primary-700 hover:shadow-card"
        >
          <MapPin size={15} className="shrink-0 text-primary-600" />
          <span className="truncate">{displayCity}</span>
          <span className="hidden truncate font-medium text-muted lg:inline">· {displaySub}</span>
          <ChevronDown size={14} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 rounded-xl bg-surface px-3.5 py-3 text-left text-sm transition-colors hover:bg-primary-50"
        >
          <MapPin size={16} className="shrink-0 text-primary-600" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-extrabold text-ink">{displayCity}</span>
            <span className="block truncate text-[11px] font-semibold text-muted">{displaySub}</span>
          </span>
          <ChevronDown size={15} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
          <input type="hidden" name="city" value={displaySlug} />
        </button>
      )}

      {open && (
        <div
          className={`absolute z-50 w-[min(92vw,400px)] rounded-3xl border border-line bg-white p-4 shadow-pop ${
            variant === "header" ? "right-0 top-full mt-2" : "left-0 top-full mt-2"
          }`}
        >
          {/* head */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-extrabold text-ink">Choose your location</p>
              <p className="text-xs font-medium text-muted">Pros, pricing & slots depend on it</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close location picker"
              className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>

          {/* detect */}
          <button
            type="button"
            onClick={handleDetect}
            disabled={locating}
            className="btn-primary w-full !py-2.5 disabled:opacity-60"
          >
            {locating ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
            {locating ? "Detecting your location…" : "Use my current location"}
          </button>
          {error && <p className="mt-2 rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">{error}</p>}

          {/* map */}
          <div className="relative mt-3 overflow-hidden rounded-2xl border border-line" style={{ height: 200 }}>
            <div ref={mapEl} style={{ height: "100%", width: "100%", zIndex: 0 }} />
            {geocoding && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/60">
                <span className="flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-primary-700 shadow-card">
                  <Loader2 size={13} className="animate-spin" /> Fetching address…
                </span>
              </div>
            )}
          </div>
          <p className="mt-1.5 truncate text-xs font-semibold text-body">
            📍 <span className="text-ink">{draftLabel}</span>
            {draft.pincode ? <span className="text-muted"> • {draft.pincode}</span> : null}
          </p>

          {/* pincode */}
          <div className="mt-3 flex gap-2">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handlePincodeGo();
                }
              }}
              inputMode="numeric"
              placeholder="Or enter pincode — e.g. 226001"
              className="input !py-2.5"
            />
            <button type="button" onClick={handlePincodeGo} className="btn-ghost shrink-0 !py-2.5">
              Go
            </button>
          </div>
          {pinError && <p className="mt-1.5 text-xs font-semibold text-danger">{pinError}</p>}

          {/* served cities */}
          <p className="mb-1.5 mt-3 text-[11px] font-extrabold uppercase tracking-wider text-muted">
            We serve in
          </p>
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
            {SERVED_CITIES.map((c) => {
              const active = slugify(draft.city) === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => handleCityPick(c.slug)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                      : "border-line bg-white text-body hover:border-primary-300 hover:text-primary-700"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* confirm */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={geocoding}
            className="btn-accent mt-4 w-full !py-3 !text-[15px] disabled:opacity-60"
          >
            <Check size={16} /> Confirm • {draft.city !== "" ? draft.city : displayCity}
            {draft.pincode ? ` ${draft.pincode}` : ""}
          </button>
          <p className="mt-2 text-center text-[11px] font-medium text-muted">
            Saved on this device{status === "authenticated" ? " + your account" : ""} • OSM © OpenStreetMap
          </p>
        </div>
      )}
    </div>
  );
}
