// src/pages/directory/VendorDirectoryPage.tsx
// PUBLIC PAGE — no login required
// Route: /vendors

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Star, X, ChevronDown, Crown,
  Shield, Clock, BadgeCheck, Sparkles, Zap, Loader2, LocateFixed,
} from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import {
  DIRECTORY_VENDORS, DIRECTORY_CATEGORIES, DIRECTORY_CITIES,
  TIER_LABELS, TIER_PRIORITY,
  type DirectoryVendor, type DirectorySubscriptionTier,
} from "../../../data/directoryData";
import { useCurrentCity } from "../../../hooks/useCurrentCity";
import { cityToSlug } from "../../../data/mockData";

// ─── Tier Badge ───────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: DirectorySubscriptionTier }) {
  const t = TIER_LABELS[tier];
  if (tier === "free") return null;
  const Icon = tier === "platinum" ? Crown : tier === "gold" ? Sparkles : Shield;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${t.bg} ${t.color} ${t.border}`}>
      <Icon size={10} /> {t.label}
    </span>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────
function VendorCard({ vendor, onClick }: { vendor: DirectoryVendor; onClick: () => void }) {
  const isFeatured = vendor.tier === "platinum" || vendor.tier === "gold";
  return (
    <div onClick={onClick}
      className={`relative bg-white rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden
        ${vendor.tier === "platinum" ? "border-violet-200 shadow-sm shadow-violet-100" :
          vendor.tier === "gold"     ? "border-yellow-200 shadow-sm" : "border-slate-100"}`}>

      {isFeatured && (
        <div className={`h-1 w-full ${vendor.tier === "platinum"
          ? "bg-gradient-to-r from-violet-400 to-violet-600"
          : "bg-gradient-to-r from-yellow-400 to-amber-500"}`} />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0
            ${vendor.tier === "platinum" ? "bg-gradient-to-br from-violet-500 to-violet-700" :
              vendor.tier === "gold"     ? "bg-gradient-to-br from-yellow-400 to-amber-500" :
              vendor.tier === "silver"   ? "bg-gradient-to-br from-slate-400 to-slate-600" :
                                           "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>
            {vendor.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-black text-slate-800 text-sm truncate">{vendor.businessName}</h3>
                <p className="text-xs text-slate-400">{vendor.ownerName} · {vendor.yearsExp}yr exp</p>
              </div>
              <TierBadge tier={vendor.tier} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            {DIRECTORY_CATEGORIES.find(c => c.slug === vendor.categorySlug)?.icon} {vendor.category}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span className="flex items-center gap-1"><MapPin size={10} /> {vendor.area}, {vendor.city}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {vendor.subServices.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500">{s}</span>
          ))}
          {vendor.subServices.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-400">+{vendor.subServices.length - 3} more</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-black text-slate-800">{vendor.rating}</span>
            <span className="text-xs text-slate-400">({vendor.totalReviews})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500"><Clock size={11} /> {vendor.responseTime}</div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Starting</span>
            <p className="text-sm font-black text-emerald-600">₹{vendor.startingPrice}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {vendor.isVerified && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><BadgeCheck size={12} /> Verified</span>
          )}
          {vendor.isAvailable
            ? <span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Available Now</span>
            : <span className="text-xs text-slate-400">Currently Unavailable</span>}
          {vendor.isFeatured && (
            <span className="ml-auto text-xs text-violet-600 font-bold flex items-center gap-1"><Zap size={10} /> Featured</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorDirectoryPage() {
  const navigate = useNavigate();
  const { cityName, loading: cityLoading, error: cityError, refresh: cityRefresh } = useCurrentCity();

  // Auto-detected slug — used as default
  const detectedCitySlug = cityName ? cityToSlug(cityName) : null;

  // Manual override — null means "use auto-detected"
  const [manualCity,    setManualCity]    = useState<string | null>(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [citySearch,    setCitySearch]    = useState("");

  // Active city: manual override takes priority, else auto-detected
  const activeCitySlug = manualCity ?? detectedCitySlug;
  const activeCityName = manualCity
    ? (DIRECTORY_CITIES.find(c => c.slug === manualCity)?.name ?? manualCity)
    : (cityName ?? null);

  // Filtered cities in modal
  const filteredCities = DIRECTORY_CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const [search,     setSearch]     = useState("");
  const [catFilter,  setCatFilter]  = useState("all");
  const [tierFilter, setTierFilter] = useState<DirectorySubscriptionTier | "all">("all");
  const [sortBy,     setSortBy]     = useState<"tier" | "rating" | "jobs" | "price">("tier");
  const [onlyAvail,  setOnlyAvail]  = useState(false);

  const filtered = useMemo(() => {
    let list = [...DIRECTORY_VENDORS];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.businessName.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.subServices.some(s => s.toLowerCase().includes(q)) ||
        v.area.toLowerCase().includes(q) ||
        v.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (activeCitySlug) list = list.filter(v => v.citySlug === activeCitySlug);
    if (catFilter  !== "all") list = list.filter(v => v.categorySlug === catFilter);
    if (tierFilter !== "all") list = list.filter(v => v.tier === tierFilter);
    if (onlyAvail)            list = list.filter(v => v.isAvailable);
    list.sort((a, b) => {
      if (sortBy === "tier")   return TIER_PRIORITY[b.tier] - TIER_PRIORITY[a.tier];
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "jobs")   return b.totalJobs - a.totalJobs;
      if (sortBy === "price")  return a.startingPrice - b.startingPrice;
      return 0;
    });
    return list;
  }, [search, activeCitySlug, catFilter, tierFilter, sortBy, onlyAvail]);

  const featuredVendors = DIRECTORY_VENDORS.filter(v => v.isFeatured).slice(0, 3);
  const showFeatured = search === "" && catFilter === "all" && tierFilter === "all";

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-50">

        {/* ── Hero — Light Navy Blue ────────────────────────────────────────── */}
        <section className="relative overflow-hidden text-white"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #1e3a8a 100%)" }}>
          {/* Bg circles — same pattern as HeroBanner */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/3 -translate-x-1/4" />
          </div>

          <div className="relative page-container py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                ADDies LocalPro — Verified Service Professionals
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                Apne Sheher Ke Best<br />
                <span className="text-blue-300">Service Professionals</span>
              </h1>
              <p className="text-blue-200 text-sm">Real reviews · Verified vendors · Instant booking</p>
            </div>

            {/* Search box */}
            <div className="mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <Search size={18} className="text-slate-400 flex-shrink-0" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Service dhundo — plumbing, AC, cleaning…"
                    className="flex-1 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500"><X size={15} /></button>
                  )}
                </div>
                {/* City Picker Button — opens modal */}
                <button
                  type="button"
                  onClick={() => { setCitySearch(""); setCityModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50
                             border border-slate-100 text-slate-600 font-semibold text-xs
                             flex-shrink-0 hover:bg-slate-100 transition-colors w-full sm:w-44"
                >
                  {cityLoading ? (
                    <>
                      <Loader2 size={13} className="text-slate-400 animate-spin flex-shrink-0" />
                      <span className="truncate text-slate-400 flex-1 text-left">Detecting…</span>
                    </>
                  ) : cityError && !manualCity ? (
                    <>
                      <LocateFixed size={13} className="text-red-400 flex-shrink-0" />
                      <span className="truncate text-red-400 text-xs flex-1 text-left">Allow location</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate flex-1 text-left">{activeCityName ?? "Select City"}</span>
                    </>
                  )}
                  <ChevronDown size={11} className="text-slate-400 flex-shrink-0" />
                </button>
                <button className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-black rounded-xl transition-colors flex-shrink-0">
                  Search
                </button>
              </div>

              {/* Category quick filters */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                <button onClick={() => setCatFilter("all")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                    ${catFilter === "all" ? "bg-white text-blue-700" : "bg-white/15 text-white hover:bg-white/25"}`}>
                  All Services
                </button>
                {DIRECTORY_CATEGORIES.slice(0, 8).map(c => (
                  <button key={c.slug} onClick={() => setCatFilter(catFilter === c.slug ? "all" : c.slug)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5
                      ${catFilter === c.slug ? "bg-white text-blue-700" : "bg-white/15 text-white hover:bg-white/25"}`}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="page-container pb-12">

          {/* ── Featured Vendors ───────────────────────────────────────────── */}
          {showFeatured && featuredVendors.length > 0 && (
            <div className="mt-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={16} className="text-violet-500" />
                <h2 className="text-sm font-black text-slate-700">Featured Professionals</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Premium Listed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredVendors.map(v => (
                  <VendorCard key={v.id} vendor={v} onClick={() => navigate(`/vendors/${v.slug}`)} />
                ))}
              </div>
            </div>
          )}

          {/* ── Filter + Sort Bar ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-3 mb-6 flex items-center justify-between gap-3 flex-wrap shadow-sm mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select value={tierFilter} onChange={e => setTierFilter(e.target.value as DirectorySubscriptionTier | "all")}
                  className="pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 appearance-none outline-none cursor-pointer">
                  <option value="all">All Tiers</option>
                  <option value="platinum">⭐ Platinum</option>
                  <option value="gold">🏅 Gold</option>
                  <option value="silver">🥈 Silver</option>
                  <option value="free">Basic</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button onClick={() => setOnlyAvail(s => !s)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all
                  ${onlyAvail ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${onlyAvail ? "bg-emerald-500" : "bg-slate-300"}`} />
                Available Now
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:block">Sort:</span>
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 appearance-none outline-none cursor-pointer">
                  <option value="tier">Best Match</option>
                  <option value="rating">Top Rated</option>
                  <option value="jobs">Most Experienced</option>
                  <option value="price">Lowest Price</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <span className="text-xs font-semibold text-slate-400">{filtered.length} found</span>
            </div>
          </div>

          {/* ── Results ────────────────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-bold text-slate-700 text-lg">Koi vendor nahi mila</p>
              <p className="text-sm text-slate-400 mt-1">Filter change karke dobara try karo</p>
              <button
                onClick={() => { setSearch(""); setManualCity(null); setCatFilter("all"); setTierFilter("all"); setOnlyAvail(false); }}
                className="mt-4 px-5 py-2 bg-blue-700 text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-colors">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map(v => (
                <VendorCard key={v.id} vendor={v} onClick={() => navigate(`/vendors/${v.slug}`)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── City Selector Modal ──────────────────────────────────────────────── */}
      {cityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setCityModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-800">Sheher Chuniye</h2>
                <p className="text-xs text-slate-400 mt-0.5">Apna ya kisi aur sheher ka vendor dekho</p>
              </div>
              <button
                onClick={() => setCityModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X size={15} className="text-slate-500" />
              </button>
            </div>

            {/* My Location Option */}
            <div className="px-6 pt-4">
              <button
                onClick={() => { setManualCity(null); cityRefresh(); setCityModalOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all mb-4
                  ${!manualCity
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/50"}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${!manualCity ? "bg-blue-500" : "bg-slate-200"}`}>
                  <LocateFixed size={16} className={!manualCity ? "text-white" : "text-slate-500"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black ${!manualCity ? "text-blue-700" : "text-slate-700"}`}>
                    My Current Location
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {cityLoading ? "Detecting…" : cityName ? `Auto-detected: ${cityName}` : "Location allow karein"}
                  </p>
                </div>
                {!manualCity && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>
                )}
              </button>

              {/* City Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                  placeholder="City search karein…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200
                             rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none
                             focus:border-blue-300 focus:bg-white transition-colors"
                />
                {citySearch && (
                  <button onClick={() => setCitySearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* City Grid */}
            <div className="px-6 pb-6 max-h-64 overflow-y-auto">
              {filteredCities.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">Koi city nahi mili</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredCities.map(c => (
                    <button
                      key={c.slug}
                      onClick={() => { setManualCity(c.slug); setCityModalOpen(false); }}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left transition-all
                        ${manualCity === c.slug
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/50"}`}
                    >
                      <MapPin size={13} className={manualCity === c.slug ? "text-blue-500" : "text-slate-300"} />
                      <span className={`text-sm font-bold truncate
                        ${manualCity === c.slug ? "text-blue-700" : "text-slate-600"}`}>
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
