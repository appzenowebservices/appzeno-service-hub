// src/components/footer/FooterCitiesStrip.tsx
//
// Drop inside your PublicLayout footer (dark background section).
// Shows service cities as pipe-separated links, popular cities first.
// Max MAX_VISIBLE cities inline, then "+N more cities" -> /cities.
//
// Usage in footer JSX:
//   import FooterCitiesStrip from "../footer/FooterCitiesStrip";
//   <FooterCitiesStrip />

import { useNavigate }         from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { DIRECTORY_CITIES }    from "../../../../data/directoryData";
import { cityToSlug }          from "../../../../data/mockData";

const MAX_VISIBLE = 42;

const POPULAR_FIRST = [
  "bangalore","mumbai","chennai","delhi","hyderabad","pune",
  "ahmedabad","lucknow","patna","kolkata","jaipur","surat",
  "noida","gurgaon","gurugram","chandigarh","indore","bhopal",
  "nagpur","varanasi","agra","kanpur",
];

function citySlug(c: typeof DIRECTORY_CITIES[0]): string {
  return (c as any).slug ?? cityToSlug(c.name);
}

const SORTED = [...DIRECTORY_CITIES].sort((a, b) => {
  const ai = POPULAR_FIRST.indexOf(citySlug(a));
  const bi = POPULAR_FIRST.indexOf(citySlug(b));
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return  1;
  return a.name.localeCompare(b.name);
});

const VISIBLE    = SORTED.slice(0, MAX_VISIBLE);
const EXTRA_CNT  = Math.max(0, SORTED.length - MAX_VISIBLE);

export default function FooterCitiesStrip() {
  const navigate = useNavigate();

  return (
    <section className="bg-white from-primary-50 to-white py-4">
      <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary-400 flex-shrink-0" />
          <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">
            Popular Cities
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-700 border border-white/10">
            {SORTED.length}
          </span>
        </div>
        <button
          onClick={() => navigate("/cities")}
          className="group flex items-center gap-1 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
          View all cities
          <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Pipe-separated links */}
      <div className="flex flex-wrap leading-loose">
        {VISIBLE.map((city, i) => (
          <span key={citySlug(city)} className="flex items-center">
            <button
              onClick={() => navigate(`/vendors?city=${citySlug(city)}`)}
              className="text-sm text-neutral-900 hover:text-primary-300 transition-colors font-medium py-0.5">
              {city.name}
            </button>
            {(i < VISIBLE.length - 1 || EXTRA_CNT > 0) && (
              <span className="mx-2.5 text-neutral-700 select-none">|</span>
            )}
          </span>
        ))}
        {EXTRA_CNT > 0 && (
          <button
            onClick={() => navigate("/cities")}
            className="text-sm text-primary-400 hover:text-primary-300 font-bold flex items-center gap-0.5 py-0.5 transition-colors">
            +{EXTRA_CNT} more cities <ChevronRight size={12} />
          </button>
        )}
      </div>
      </div>
    </section>
  );
}
