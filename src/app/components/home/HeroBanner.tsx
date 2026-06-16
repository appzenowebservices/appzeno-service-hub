import { useNavigate } from "react-router-dom";
import { Search, Zap, Shield, Star, MapPin, Loader2, LocateFixed } from "lucide-react";
import { useState } from "react";
import { useCurrentCity } from "../../../../hooks/useCurrentCity";
import { cityToSlug } from "../../../../data/mockData";
import Button from "../ui/Button";

const STATS = [
  { icon: Star,   value: "4.8★",   label: "Avg Rating" },
  { icon: Zap,    value: "30 min", label: "Avg Response" },
  { icon: Shield, value: "100%",   label: "Verified Vendors" },
];

// Label → exact category slug from MOCK_CATEGORIES
const POPULAR: { label: string; slug: string }[] = [
  { label: "AC Service",    slug: "ac-service"    },
  { label: "Home Cleaning", slug: "home-cleaning" },
  { label: "Plumber",       slug: "plumbing"      },
  { label: "Electrician",   slug: "electrical"    },
  { label: "Pest Control",  slug: "pest-control"  },
];

export default function HeroBanner() {
  const navigate = useNavigate();
  const { cityName, loading, error, refresh } = useCurrentCity();

  const [search, setSearch] = useState("");

  // City slug for routing — same fallback as Header & PopularCategories
  const cSlug = cityName ? cityToSlug(cityName) : "lucknow";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/${cSlug}/services?q=${encodeURIComponent(q)}`);
    else   navigate(`/${cSlug}/services`);
  }

  function handlePopular(slug: string) {
    navigate(`/${cSlug}/${slug}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-accent rounded-full opacity-50" />
      </div>

      <div className="relative page-container py-14 md:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            India's Fastest Growing Home Services Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            Book Trusted Home<br />
            <span className="text-accent">Services</span> Instantly
          </h1>

          <p className="text-primary-200 text-lg mb-10 leading-relaxed">
            AC repair, plumbing, cleaning & 50+ services — verified professionals at your doorstep in 30 minutes.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">

              {/* ── Auto-detected City (read-only, same as Header) ── */}
              <button
                type="button"
                onClick={refresh}
                title="Refresh location"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50
                           text-primary-700 font-medium text-sm w-full sm:w-44
                           hover:bg-primary-100 transition-colors flex-shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="text-primary-400 animate-spin flex-shrink-0" />
                    <span className="truncate text-primary-400">Detecting…</span>
                  </>
                ) : error ? (
                  <>
                    <LocateFixed size={14} className="text-danger flex-shrink-0" />
                    <span className="truncate text-danger text-xs">Allow location</span>
                  </>
                ) : (
                  <>
                    <MapPin size={14} className="text-primary-500 flex-shrink-0" />
                    <span className="truncate">{cityName ?? "Detecting…"}</span>
                  </>
                )}
              </button>

              {/* Search Input */}
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search size={18} className="text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search for AC repair, plumber, cleaning…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="rounded-xl flex-shrink-0">
                Search
              </Button>
            </div>
          </form>

          {/* ── Popular Searches → /:citySlug/:categorySlug ── */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-primary-300 text-xs">Popular:</span>
            {POPULAR.map(({ label, slug }) => (
              <button
                key={slug}
                onClick={() => handlePopular(slug)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20
                           rounded-full text-xs font-medium transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-accent font-black text-xl md:text-2xl mb-0.5">
                <Icon size={18} />
                {value}
              </div>
              <p className="text-primary-300 text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
