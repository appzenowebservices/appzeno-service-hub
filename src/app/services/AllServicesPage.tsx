// src/pages/services/AllServicesPage.tsx
// Route: /services
// Shows all 52+ services grouped by category tabs with live search.
// Click → /:citySlug/:categorySlug  (same as PopularCategories & HeroBanner)

import { useState, useMemo } from "react";
import { useNavigate }        from "react-router-dom";
import { Search, X, ArrowRight, MapPin, ChevronRight } from "lucide-react";
import PublicLayout            from "../components/layout/PublicLayout";
import { MOCK_CATEGORIES, cityToSlug } from "../../../data/mockData";
import { DIRECTORY_CITIES }           from "../../../data/directoryData";
import { useCurrentCity }             from "../../../hooks/useCurrentCity";

// ── Derive unique groups in order ─────────────────────────────────────────────
const GROUP_ORDER = [
  "Home & Cleaning",
  "Repairs & Appliances",
  "Plumbing & Civil",
  "Beauty & Wellness",
  "Healthcare",
  "Education",
  "Skilled Trades",
  "Events & Lifestyle",
  "Pet Care",
  "Home Staff",
  "Professional",
];

// Emoji icons for each group tab
const GROUP_ICONS: Record<string, string> = {
  "Home & Cleaning":     "🏠",
  "Repairs & Appliances":"🔧",
  "Plumbing & Civil":    "🚰",
  "Beauty & Wellness":   "💅",
  "Healthcare":          "🏥",
  "Education":           "📚",
  "Skilled Trades":      "🛠️",
  "Events & Lifestyle":  "🎉",
  "Pet Care":            "🐾",
  "Home Staff":          "👩‍🍳",
  "Professional":        "💼",
};

// ── Highlight matched text ────────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-primary-700 rounded px-0.5 not-italic font-black">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Service Card ──────────────────────────────────────────────────────────────
function ServiceCard({
  icon, name, description, slug, citySlug, query,
}: {
  icon: string; name: string; description: string;
  slug: string; citySlug: string; query: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/${citySlug}/${slug}`)}
      className="group flex items-start gap-4 p-4 rounded-2xl bg-white
                 border-2 border-neutral-100 text-left w-full
                 hover:border-primary-300
                 hover:shadow-[0_4px_24px_rgba(46,134,193,0.12)]
                 transition-all duration-200 cursor-pointer"
    >
      {/* Icon bubble */}
      <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center
                      rounded-xl bg-primary-50 text-3xl
                      group-hover:bg-primary-100 group-hover:scale-105
                      transition-all duration-200">
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-extrabold text-neutral-800 leading-snug tracking-tight
                      group-hover:text-primary-700 transition-colors">
          <Highlight text={name} query={query} />
        </p>
        <p className="text-xs text-neutral-500 mt-1 leading-snug line-clamp-2">
          <Highlight text={description} query={query} />
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight
        size={16}
        className="flex-shrink-0 text-neutral-300 group-hover:text-primary-500
                   group-hover:translate-x-0.5 transition-all mt-1"
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cities data: sorted popular-first, then alphabetical. Max 42 inline.
// ─────────────────────────────────────────────────────────────────────────────
const MAX_CITIES = 42;

const POPULAR_CITY_ORDER = [
  "bangalore","mumbai","chennai","delhi","hyderabad","pune",
  "ahmedabad","lucknow","patna","kolkata","jaipur","surat",
  "noida","gurgaon","gurugram","chandigarh","indore","bhopal","nagpur",
];

function resolveCitySlug(c: typeof DIRECTORY_CITIES[0]): string {
  return (c as any).slug ?? cityToSlug(c.name);
}

const SORTED_CITIES = [...DIRECTORY_CITIES].sort((a, b) => {
  const ai = POPULAR_CITY_ORDER.indexOf(resolveCitySlug(a));
  const bi = POPULAR_CITY_ORDER.indexOf(resolveCitySlug(b));
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return  1;
  return a.name.localeCompare(b.name);
});

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AllServicesPage() {
  const navigate           = useNavigate();
  const { cityName }       = useCurrentCity();
  const cSlug              = cityName ? cityToSlug(cityName) : "lucknow";

  const [query,      setQuery]      = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("All");

  // Filtered services
  const filtered = useMemo(() => {
    let list = MOCK_CATEGORIES;
    if (activeGroup !== "All") list = list.filter((c) => c.group === activeGroup);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.group?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, activeGroup]);

  // Group filtered results for section display
  const grouped = useMemo(() => {
    const map: Record<string, typeof MOCK_CATEGORIES> = {};
    filtered.forEach((c) => {
      const g = c.group ?? "Other";
      if (!map[g]) map[g] = [];
      map[g].push(c);
    });
    // Sort groups in defined order
    return GROUP_ORDER.filter((g) => map[g]?.length > 0).map((g) => ({
      group: g,
      items: map[g],
    }));
  }, [filtered]);

  const totalCount = MOCK_CATEGORIES.length;

  return (
    <PublicLayout>
      {/* ── HERO STRIP ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="page-container py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-1.5 text-primary-300 text-xs mb-5">
              <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button>
              <ChevronRight size={12} />
              <span className="text-white font-semibold">All Services</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              All Services
            </h1>
            <p className="text-primary-200 text-base mb-2">
              {totalCount}+ trusted services available at your doorstep
            </p>

            {/* City chip */}
            {cityName && (
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20
                              rounded-full px-3 py-1 text-xs font-medium text-primary-100 mb-8">
                <MapPin size={11} /> Showing services in <strong className="text-white ml-1">{cityName}</strong>
              </div>
            )}

            {/* Search bar */}
            <div className="relative max-w-lg mx-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveGroup("All"); }}
                placeholder="Search any service — cleaning, AC, doctor…"
                className="w-full pl-11 pr-10 py-3.5 text-sm rounded-2xl border-0
                           bg-white text-neutral-800 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-white/60 shadow-xl"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400
                             hover:text-neutral-600 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ────────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-50 min-h-screen">
        <div className="page-container py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── LEFT SIDEBAR — Category Tabs ────────────────────────────── */}
            <aside className="lg:w-56 flex-shrink-0">
              {/* Mobile: horizontal scroll tabs */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {["All", ...GROUP_ORDER].map((g) => {
                  const count = g === "All"
                    ? MOCK_CATEGORIES.length
                    : MOCK_CATEGORIES.filter((c) => c.group === g).length;
                  return (
                    <button
                      key={g}
                      onClick={() => { setActiveGroup(g); setQuery(""); }}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                                  text-xs font-bold whitespace-nowrap transition-all
                                  ${activeGroup === g
                                    ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300"
                                  }`}
                    >
                      {g === "All" ? "✨" : GROUP_ICONS[g]} {g}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-black
                        ${activeGroup === g ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop: vertical sidebar */}
              <div className="hidden lg:block bg-white rounded-2xl border border-neutral-200 overflow-hidden sticky top-24">
                <div className="px-4 py-3 border-b border-neutral-100 bg-primary-50">
                  <p className="text-xs font-black text-primary-700 uppercase tracking-wider">Browse By Category</p>
                </div>
                <nav className="py-2">
                  {["All", ...GROUP_ORDER].map((g) => {
                    const count = g === "All"
                      ? MOCK_CATEGORIES.length
                      : MOCK_CATEGORIES.filter((c) => c.group === g).length;
                    return (
                      <button
                        key={g}
                        onClick={() => { setActiveGroup(g); setQuery(""); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left
                                    text-sm transition-all
                                    ${activeGroup === g
                                      ? "bg-primary-50 text-primary-700 font-black border-r-2 border-primary-600"
                                      : "text-neutral-600 hover:bg-neutral-50 font-medium"
                                    }`}
                      >
                        <span className="text-base w-5 text-center flex-shrink-0">
                          {g === "All" ? "✨" : GROUP_ICONS[g]}
                        </span>
                        <span className="flex-1 leading-snug">{g === "All" ? "All Services" : g}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0
                          ${activeGroup === g ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* ── RIGHT CONTENT — Service Grid ────────────────────────────── */}
            <main className="flex-1 min-w-0">

              {/* Results summary bar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-bold text-neutral-700">
                    {query
                      ? <><span className="text-primary-600">{filtered.length}</span> results for "<span className="italic">{query}</span>"</>
                      : activeGroup === "All"
                        ? <><span className="text-primary-600">{totalCount}</span> services available</>
                        : <><span className="text-primary-600">{filtered.length}</span> services in {activeGroup}</>
                    }
                  </p>
                </div>
                {(query || activeGroup !== "All") && (
                  <button
                    onClick={() => { setQuery(""); setActiveGroup("All"); }}
                    className="text-xs text-primary-600 hover:text-primary-800 font-semibold
                               flex items-center gap-1 transition-colors"
                  >
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="text-lg font-bold text-neutral-600">No services found</p>
                  <p className="text-sm text-neutral-400 mt-1">Try searching "cleaning", "repair", or "doctor"</p>
                  <button
                    onClick={() => { setQuery(""); setActiveGroup("All"); }}
                    className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                               bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors"
                  >
                    Show all services <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Service groups */}
              <div className="space-y-8">
                {grouped.map(({ group, items }) => (
                  <div key={group}>
                    {/* Group header — only when showing "All" or search */}
                    {(activeGroup === "All" || query) && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{GROUP_ICONS[group]}</span>
                          <h2 className="text-base font-black text-neutral-800">{group}</h2>
                        </div>
                        <div className="flex-1 h-px bg-neutral-200" />
                        <span className="text-xs font-bold text-neutral-400 bg-neutral-100
                                         px-2 py-0.5 rounded-full">
                          {items.length}
                        </span>
                      </div>
                    )}

                    {/* Cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
                      {items.map((cat) => (
                        <ServiceCard
                          key={cat.slug}
                          icon={cat.icon}
                          name={cat.name}
                          description={cat.description ?? ""}
                          slug={cat.slug}
                          citySlug={cSlug}
                          query={query}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA — only when no filter/search active */}
              {!query && activeGroup === "All" && (
                <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600
                                text-white p-6 text-center">
                  <p className="text-lg font-black mb-1">Can't find what you need?</p>
                  <p className="text-primary-200 text-sm mb-4">
                    We're adding new services every week. Let us know what you're looking for.
                  </p>
                  <button
                    onClick={() => navigate("/contact-us")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                               bg-white text-primary-700 text-sm font-bold
                               hover:bg-primary-50 transition-colors"
                  >
                    Request a Service <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* ── Popular Cities Strip ──────────────────────────────────────────── */}
        <div className="bg-neutral-100 border-t border-neutral-200">
          <div className="page-container py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <MapPin size={15} className="text-primary-600" />
                <h3 className="text-sm font-black text-neutral-700 uppercase tracking-wider">
                  Popular Cities
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full
                                 bg-primary-100 text-primary-700 border border-primary-200">
                  {SORTED_CITIES.length} cities
                </span>
              </div>
              <button
                onClick={() => navigate("/cities")}
                className="flex items-center gap-1 text-xs font-bold text-primary-600
                           hover:text-primary-800 transition-colors group">
                View all cities
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* City pills — pipe-separated, JustDial style */}
            <div className="flex flex-wrap gap-x-0 gap-y-2.5">
              {SORTED_CITIES.slice(0, MAX_CITIES).map((city, i) => (
                <span key={resolveCitySlug(city)} className="flex items-center">
                  <button
                    onClick={() => navigate(`/vendors?city=${resolveCitySlug(city)}`)}
                    className="text-sm text-neutral-500 hover:text-primary-700
                               transition-colors font-medium leading-snug">
                    {city.name}
                  </button>
                  {i < Math.min(SORTED_CITIES.length, MAX_CITIES) - 1 && (
                    <span className="mx-3 text-neutral-300 select-none leading-none">|</span>
                  )}
                </span>
              ))}
              {SORTED_CITIES.length > MAX_CITIES && (
                <span className="flex items-center">
                  <span className="mx-3 text-neutral-300 select-none">|</span>
                  <button
                    onClick={() => navigate("/cities")}
                    className="text-sm text-primary-600 hover:text-primary-800
                               transition-colors font-bold flex items-center gap-1">
                    +{SORTED_CITIES.length - MAX_CITIES} more
                    <ChevronRight size={12} />
                  </button>
                </span>
              )}
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
