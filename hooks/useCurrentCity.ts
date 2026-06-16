import { useState, useEffect, useCallback } from "react";

interface LocationState {
  citySlug: string;
  cityName: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;   // call this to re-detect location
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function detectCity(): Promise<{ cityName: string; citySlug: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();

          const raw: string =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Your City";

          resolve({ cityName: raw, citySlug: toSlug(raw) });
        } catch {
          reject(new Error("Geocoding failed"));
        }
      },
      (err) => reject(new Error(err.message)),
      { timeout: 8000 }
    );
  });
}

/**
 * Auto-detects user's city via Geolocation + OpenStreetMap Nominatim.
 * Returns cityName, citySlug, loading, error, and refresh() to re-detect.
 *
 * Usage:
 *   const { citySlug, cityName, loading, error, refresh } = useCurrentCity();
 *   navigate(`/${citySlug}/category/home-cleaning`);
 */
export function useCurrentCity(): LocationState {
  const [cityName, setCityName] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { cityName, citySlug } = await detectCity();
      setCityName(cityName);
      setCitySlug(citySlug);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Location unavailable";
      setError(msg);
      setCityName("Your City");
      setCitySlug("your-city");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  return { cityName, citySlug, loading, error, refresh: detect };
}
