// src/components/home/PopularCategories.tsx
// Category click → /:citySlug/:categorySlug (ServiceDetailPage)
// ServiceDetailPage handles: login check, package display, Book Now → CustomerDashboard
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MOCK_CATEGORIES, cityToSlug } from "../../../../data/mockData";
import { useCurrentCity } from "../../../../hooks/useCurrentCity";

export default function PopularCategories() {
  const navigate     = useNavigate();
  const { cityName } = useCurrentCity();

  function handleCategoryClick(categorySlug: string) {
    const cSlug = cityName ? cityToSlug(cityName) : "lucknow";
    navigate(`/${cSlug}/${categorySlug}`);
  }

  return (
    <section className="section bg-white">
      <div className="page-container">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-1">What We Offer</p>
            <h2 className="text-3xl font-black text-neutral-900">Popular Services</h2>
          </div>
          <button
            onClick={() => navigate("/services")}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {MOCK_CATEGORIES.slice(0, 18).map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              title={cat.description}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-primary-50
                         border-2 border-transparent
                         hover:border-primary-400
                         hover:shadow-[0_0_0_4px_rgba(99,102,241,0.12),0_4px_20px_rgba(99,102,241,0.15)]
                         transition-[border-color,box-shadow] duration-200
                         text-center cursor-pointer"
            >
              <div className="w-14 h-14 flex items-center justify-center
                              text-4xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </div>
              <span className="text-sm font-extrabold text-neutral-800 text-center leading-snug tracking-tight group-hover:text-primary-700 transition-colors">
                {cat.name}
              </span>
              {/* Description - with truncation for long text and accessibility */}
              {cat.description && (
                <span 
                  className="text-xs text-neutral-800 italic leading-snug line-clamp-2"
                  title={cat.description}
                >
                  {cat.description}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="sm:hidden mt-6 text-center">
          <button
            onClick={() => navigate("/services")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
          >
            View All Services <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
}