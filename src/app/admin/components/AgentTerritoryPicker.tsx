"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MapPin, Search } from "lucide-react";
import ServingAreasMap, { geocodePincode, type AreaPin } from "~/app/admin/components/ServingAreasMap";

export interface TerritoryArea {
  id: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  pincodes: string[];
}

/**
 * City + pincode territory picker for area managers/agents.
 * Cities and pincodes come from the Areas & Pincodes registry; the map shows
 * the selected pincode coverage (Nominatim, cached + serialized).
 */
export default function AgentTerritoryPicker({
  areas,
  areaId,
  onAreaChange,
  pincodes,
  onPincodesChange,
}: {
  areas: TerritoryArea[];
  areaId: string;
  onAreaChange: (id: string) => void;
  pincodes: string[];
  onPincodesChange: (next: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [pins, setPins] = useState<AreaPin[]>([]);
  const [geoBusy, setGeoBusy] = useState(false);

  const area = areas.find((a) => a.id === areaId) ?? null;
  const allPincodes = useMemo(() => (area?.pincodes ?? []).slice().sort(), [area]);
  const selectedSet = useMemo(() => new Set(pincodes), [pincodes]);
  const filtered = useMemo(() => {
    const q = search.trim();
    return q ? allPincodes.filter((p) => p.includes(q)) : allPincodes;
  }, [allPincodes, search]);

  const toggle = (pincode: string) => {
    if (selectedSet.has(pincode)) onPincodesChange(pincodes.filter((p) => p !== pincode));
    else onPincodesChange([...pincodes, pincode]);
  };

  const allSelected = allPincodes.length > 0 && pincodes.length === allPincodes.length;
  const toggleAll = () => onPincodesChange(allSelected ? [] : [...allPincodes]);

  // Map pins for the selected pincodes (capped to stay well inside Nominatim limits).
  useEffect(() => {
    let cancelled = false;
    const targets = pincodes.slice(0, 15);
    setGeoBusy(targets.length > 0);
    (async () => {
      const out: AreaPin[] = [];
      for (const p of targets) {
        if (cancelled) return;
        const pin = await geocodePincode(p);
        if (pin) out.push(pin);
        await new Promise((r) => setTimeout(r, 350));
      }
      if (!cancelled) {
        setPins(out);
        setGeoBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pincodes]);

  const mapAreas = useMemo(
    () => (area ? [{ id: area.id, city: area.city, lat: area.lat, lng: area.lng, active: true }] : []),
    [area],
  );

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted">
          <MapPin size={13} /> Territory
        </p>
        <span className="text-[11px] font-bold text-muted">
          {area ? `${pincodes.length}/${allPincodes.length} pincodes` : "select a city"}
        </span>
      </div>

      <select
        value={areaId}
        onChange={(e) => onAreaChange(e.target.value)}
        className="input !py-2.5"
      >
        <option value="">Select a city…</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>{a.city} • {a.state} • {a.pincodes.length} pincodes</option>
        ))}
      </select>

      {areas.length === 0 ? (
        <p className="mt-2 text-[11px] font-semibold text-danger">No cities configured — add them in Areas &amp; Pincodes first.</p>
      ) : null}

      {area ? (
        <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Left: pincode selection */}
          <div className="min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pincode…"
                  className="input !py-2 !pl-8 !text-xs"
                />
              </label>
              <button
                type="button"
                onClick={toggleAll}
                disabled={allPincodes.length === 0}
                className="shrink-0 rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-bold text-body hover:border-primary-300 hover:text-primary-700 disabled:opacity-40"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>

            <div className="mt-2 grid max-h-44 grid-cols-3 gap-1 overflow-y-auto pr-0.5">
              {filtered.map((p) => {
                const on = selectedSet.has(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggle(p)}
                    className={`flex items-center justify-between rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-colors ${on ? "border-primary-600 bg-primary-50 text-primary-700" : "border-line bg-white text-muted hover:border-primary-300 hover:text-body"}`}
                  >
                    {p}
                    {on ? <Check size={11} /> : null}
                  </button>
                );
              })}
              {filtered.length === 0 ? (
                <p className="col-span-full py-2 text-center text-[11px] font-medium text-muted">No pincode matches “{search}”.</p>
              ) : null}
            </div>
          </div>

          {/* Right: coverage map */}
          <div className="relative h-[210px] overflow-hidden rounded-xl border border-line bg-white lg:h-full lg:min-h-[210px]">
            <ServingAreasMap
              areas={mapAreas}
              pins={pins}
              onSelect={() => undefined}
              onPickCoords={() => undefined}
            />
            {geoBusy ? (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-primary-700 shadow-sm">
                Locating pincodes…
              </span>
            ) : null}
            {!geoBusy && pincodes.length > 15 ? (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-muted shadow-sm">
                map shows first 15
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
