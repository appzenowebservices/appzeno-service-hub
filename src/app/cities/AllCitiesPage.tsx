// src/pages/cities/AllCitiesPage.tsx
// Route: /cities
// All cities where ADDies operates — grouped by state, searchable.
// Exact same layout pattern as AllServicesPage.

import { useState, useMemo } from "react";
import { useNavigate }       from "react-router-dom";
import { Search, X, ChevronRight, ArrowRight, Navigation, MapPin } from "lucide-react";
import PublicLayout          from "../components/layout/PublicLayout";
import { DIRECTORY_CITIES } from "../../../data/directoryData";
import { useCurrentCity }   from "../../../hooks/useCurrentCity";
import { cityToSlug }       from "../../../data/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// STATE ORDER + ICONS
// ─────────────────────────────────────────────────────────────────────────────
const STATE_ORDER = [
  "Uttar Pradesh","Maharashtra","Karnataka","Tamil Nadu","Delhi NCR",
  "Telangana","Rajasthan","Gujarat","West Bengal","Bihar",
  "Madhya Pradesh","Punjab","Haryana","Odisha","Kerala","Other",
];

const STATE_ICONS: Record<string, string> = {
  "Uttar Pradesh":  "🏯",
  "Maharashtra":    "🌆",
  "Karnataka":      "🌿",
  "Tamil Nadu":     "🏛️",
  "Delhi NCR":      "🕌",
  "Telangana":      "💎",
  "Rajasthan":      "🐪",
  "Gujarat":        "🦁",
  "West Bengal":    "🎨",
  "Bihar":          "📿",
  "Madhya Pradesh": "🌳",
  "Punjab":         "🌾",
  "Haryana":        "🏟️",
  "Odisha":         "⛩️",
  "Kerala":         "🌴",
  "Other":          "📍",
};

// Slug → State lookup (used when directoryData has no .state field)
const SLUG_TO_STATE: Record<string, string> = {
  lucknow:"Uttar Pradesh", kanpur:"Uttar Pradesh", agra:"Uttar Pradesh",
  varanasi:"Uttar Pradesh", meerut:"Uttar Pradesh", noida:"Uttar Pradesh",
  ghaziabad:"Uttar Pradesh", gorakhpur:"Uttar Pradesh", allahabad:"Uttar Pradesh",
  prayagraj:"Uttar Pradesh", aligarh:"Uttar Pradesh", bareilly:"Uttar Pradesh",
  mumbai:"Maharashtra", pune:"Maharashtra", nagpur:"Maharashtra",
  nashik:"Maharashtra", thane:"Maharashtra", aurangabad:"Maharashtra",
  solapur:"Maharashtra",
  bangalore:"Karnataka", mysore:"Karnataka", hubli:"Karnataka",
  mangalore:"Karnataka", belgaum:"Karnataka",
  chennai:"Tamil Nadu", coimbatore:"Tamil Nadu", madurai:"Tamil Nadu",
  salem:"Tamil Nadu", trichy:"Tamil Nadu", tirunelveli:"Tamil Nadu",
  delhi:"Delhi NCR", "new-delhi":"Delhi NCR", gurgaon:"Delhi NCR",
  gurugram:"Delhi NCR", noida:"Delhi NCR", faridabad:"Delhi NCR",
  hyderabad:"Telangana", warangal:"Telangana", karimnagar:"Telangana",
  jaipur:"Rajasthan", jodhpur:"Rajasthan", udaipur:"Rajasthan",
  kota:"Rajasthan", ajmer:"Rajasthan", bikaner:"Rajasthan",
  ahmedabad:"Gujarat", surat:"Gujarat", vadodara:"Gujarat",
  rajkot:"Gujarat", gandhinagar:"Gujarat", bhavnagar:"Gujarat",
  kolkata:"West Bengal", howrah:"West Bengal", durgapur:"West Bengal",
  asansol:"West Bengal",
  patna:"Bihar", gaya:"Bihar", bhagalpur:"Bihar", muzaffarpur:"Bihar",
  bhopal:"Madhya Pradesh", indore:"Madhya Pradesh", jabalpur:"Madhya Pradesh",
  gwalior:"Madhya Pradesh",
  ludhiana:"Punjab", amritsar:"Punjab", jalandhar:"Punjab", patiala:"Punjab",
  chandigarh:"Haryana", faridabad:"Haryana", rohtak:"Haryana",
  bhubaneswar:"Odisha", cuttack:"Odisha", rourkela:"Odisha",
  kochi:"Kerala", thiruvananthapuram:"Kerala", kozhikode:"Kerala",
  thrissur:"Kerala",
};

type RawCity = typeof DIRECTORY_CITIES[0];
type EnrichedCity = RawCity & { _slug: string; _state: string };

function enrichCity(c: RawCity): EnrichedCity {
  const slug  = (c as any).slug  ?? cityToSlug(c.name);
  const state = (c as any).state ?? SLUG_TO_STATE[slug] ?? "Other";
  return { ...c, _slug: slug, _state: state };
}

// ─────────────────────────────────────────────────────────────────────────────
// CITY CARD
// ─────────────────────────────────────────────────────────────────────────────
function CityCard({
  city, isCurrentCity, onClick,
}: {
  city: EnrichedCity;
  isCurrentCity: boolean;
  onClick: () => void;
}) {
  const vendorCount = (city as any).vendorCount as number | undefined;
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 p-4 rounded-2xl border-2 text-left w-full
                  transition-all duration-200
                  ${isCurrentCity
                    ? "border-primary-400 bg-primary-50 shadow-md shadow-primary-100"
                    : "border-neutral-100 bg-white hover:border-primary-300 hover:shadow-[0_4px_24px_rgba(46,134,193,0.12)]"
                  }`}
    >
      {/* Icon */}
      <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-xl
                       transition-all duration-200
                       ${isCurrentCity
                         ? "bg-primary-100"
                         : "bg-primary-50 group-hover:bg-primary-100 group-hover:scale-105"}`}>
        📍
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-extrabold leading-snug tracking-tight transition-colors
                       ${isCurrentCity ? "text-primary-700" : "text-neutral-800 group-hover:text-primary-700"}`}>
          {city.name}
          {isCurrentCity && (
            <span className="ml-2 text-xs font-black bg-primary-600 text-white px-2 py-0.5 rounded-full">
              Your City
            </span>
          )}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">
          {vendorCount ? `${vendorCount}+ vendors` : "Service available"}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight size={16}
        className={`flex-shrink-0 transition-all
                    ${isCurrentCity
                      ? "text-primary-400"
                      : "text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-0.5"}`} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AllCitiesPage() {
  const navigate          = useNavigate();
  const { cityName }      = useCurrentCity();
  const currentSlug       = cityName ? cityToSlug(cityName) : "lucknow";

  const [query,        setQuery]        = useState("");
  const [activeState,  setActiveState]  = useState<string>("All");

  // Enrich cities with slug + state
  const cities = useMemo<EnrichedCity[]>(
    () => DIRECTORY_CITIES.map(enrichCity),
    []
  );

  // States that actually have cities in data
  const presentStates = useMemo(() => {
    const set = new Set(cities.map(c => c._state));
    return STATE_ORDER.filter(s => set.has(s));
  }, [cities]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = cities;
    if (activeState !== "All") list = list.filter(c => c._state === activeState);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c._state.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cities, activeState, query]);

  // Grouped by state for display
  const grouped = useMemo(() => {
    const map: Record<string, EnrichedCity[]> = {};
    filtered.forEach(c => {
      if (!map[c._state]) map[c._state] = [];
      map[c._state].push(c);
    });
    return STATE_ORDER
      .filter(s => map[s]?.length > 0)
      .map(s => ({ state: s, items: map[s] }));
  }, [filtered]);

  const totalCount = cities.length;

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="page-container py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-1.5 text-primary-300 text-xs mb-5">
              <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button>
              <ChevronRight size={12} />
              <span className="text-white font-semibold">All Cities</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              We Serve Across India
            </h1>
            <p className="text-primary-200 text-base mb-2">
              {totalCount}+ cities covered — trusted services at your doorstep
            </p>

            {/* Current city chip */}
            {cityName && (
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20
                              rounded-full px-3 py-1 text-xs font-medium text-primary-100 mb-8">
                <Navigation size={11} className="animate-pulse" />
                You're in <strong className="text-white ml-1">{cityName}</strong>
              </div>
            )}

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveState("All"); }}
                placeholder="Search your city — Lucknow, Pune, Bangalore…"
                className="w-full pl-11 pr-10 py-3.5 text-sm rounded-2xl border-0
                           bg-white text-neutral-800 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-white/60 shadow-xl"
              />
              {query && (
                <button onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="bg-neutral-50 min-h-screen">
        <div className="page-container py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── SIDEBAR — State filter ── */}
            <aside className="lg:w-56 flex-shrink-0">

              {/* Mobile: horizontal scroll */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {["All", ...presentStates].map(s => {
                  const cnt = s === "All"
                    ? totalCount
                    : cities.filter(c => c._state === s).length;
                  return (
                    <button key={s}
                      onClick={() => { setActiveState(s); setQuery(""); }}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                                  text-xs font-bold whitespace-nowrap transition-all
                                  ${activeState === s
                                    ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300"}`}>
                      {s === "All" ? "🗺️" : STATE_ICONS[s] ?? "📍"}{" "}{s === "All" ? "All States" : s}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-black
                        ${activeState === s ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                        {cnt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop: vertical sidebar */}
              <div className="hidden lg:block bg-white rounded-2xl border border-neutral-200 overflow-hidden sticky top-24">
                <div className="px-4 py-3 border-b border-neutral-100 bg-primary-50">
                  <p className="text-xs font-black text-primary-700 uppercase tracking-wider">Browse By State</p>
                </div>
                <nav className="py-2">
                  {["All", ...presentStates].map(s => {
                    const cnt = s === "All"
                      ? totalCount
                      : cities.filter(c => c._state === s).length;
                    return (
                      <button key={s}
                        onClick={() => { setActiveState(s); setQuery(""); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left
                                    text-sm transition-all
                                    ${activeState === s
                                      ? "bg-primary-50 text-primary-700 font-black border-r-2 border-primary-600"
                                      : "text-neutral-600 hover:bg-neutral-50 font-medium"}`}>
                        <span className="text-base w-5 text-center flex-shrink-0">
                          {s === "All" ? "🗺️" : STATE_ICONS[s] ?? "📍"}
                        </span>
                        <span className="flex-1 leading-snug">
                          {s === "All" ? "All States" : s}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0
                          ${activeState === s ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                          {cnt}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* ── MAIN — City grid ── */}
            <main className="flex-1 min-w-0">

              {/* Results bar */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-bold text-neutral-700">
                  {query
                    ? <><span className="text-primary-600">{filtered.length}</span> cities for "<span className="italic">{query}</span>"</>
                    : activeState === "All"
                      ? <><span className="text-primary-600">{totalCount}</span> cities across India</>
                      : <><span className="text-primary-600">{filtered.length}</span> cities in {activeState}</>
                  }
                </p>
                {(query || activeState !== "All") && (
                  <button onClick={() => { setQuery(""); setActiveState("All"); }}
                    className="text-xs text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1 transition-colors">
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">🏙️</p>
                  <p className="text-lg font-bold text-neutral-600">No cities found</p>
                  <p className="text-sm text-neutral-400 mt-1">Try "Lucknow", "Mumbai" or "Bangalore"</p>
                  <button onClick={() => { setQuery(""); setActiveState("All"); }}
                    className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                               bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors">
                    Show all cities <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* State-grouped city cards */}
              <div className="space-y-8">
                {grouped.map(({ state, items }) => (
                  <div key={state}>
                    {/* Section header */}
                    {(activeState === "All" || query) && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{STATE_ICONS[state] ?? "📍"}</span>
                          <h2 className="text-base font-black text-neutral-800">{state}</h2>
                        </div>
                        <div className="flex-1 h-px bg-neutral-200" />
                        <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                          {items.length} {items.length === 1 ? "city" : "cities"}
                        </span>
                      </div>
                    )}

                    {/* 3-col grid (same rhythm as services 2-col but cities are smaller) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {items.map(city => (
                        <CityCard
                          key={city._slug}
                          city={city}
                          isCurrentCity={city._slug === currentSlug}
                          onClick={() => navigate(`/vendors?city=${city._slug}`)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              {!query && activeState === "All" && (
                <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600
                                text-white p-6 text-center">
                  <p className="text-lg font-black mb-1">Your city not listed yet?</p>
                  <p className="text-primary-200 text-sm mb-4">
                    We're expanding every week. Let us know where you need services.
                  </p>
                  <button onClick={() => navigate("/contact-us")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                               bg-white text-primary-700 text-sm font-bold hover:bg-primary-50 transition-colors">
                    Request Your City <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
