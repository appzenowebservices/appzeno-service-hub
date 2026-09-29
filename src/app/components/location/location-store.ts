import { slugify } from "./cities";

export interface SavedLocation {
  city: string;
  slug: string;
  state: string;
  pincode: string;
  area: string;
  lat: number;
  lng: number;
  updatedAt: number;
}

export const STORAGE_KEY = "addies:location";
export const LOCATION_EVENT = "addies:location-change";

export const DEFAULT_LOCATION: SavedLocation = {
  city: "Lucknow",
  slug: "lucknow",
  state: "Uttar Pradesh",
  pincode: "",
  area: "",
  lat: 26.8467,
  lng: 80.9462,
  updatedAt: 0,
};

export function loadLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedLocation>;
    if (!parsed.city) return null;
    return {
      city: parsed.city,
      slug: parsed.slug ?? slugify(parsed.city),
      state: parsed.state ?? "",
      pincode: parsed.pincode ?? "",
      area: parsed.area ?? "",
      lat: typeof parsed.lat === "number" ? parsed.lat : DEFAULT_LOCATION.lat,
      lng: typeof parsed.lng === "number" ? parsed.lng : DEFAULT_LOCATION.lng,
      updatedAt: parsed.updatedAt ?? 0,
    };
  } catch {
    return null;
  }
}

export function saveLocation(loc: SavedLocation): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // storage full / private mode — display still works for this session
  }
  window.dispatchEvent(new CustomEvent<SavedLocation>(LOCATION_EVENT, { detail: loc }));
}
