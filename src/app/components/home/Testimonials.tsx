import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "../../../../data/mockData";

export default function Testimonials() {
  return (
    <section className="section bg-primary-50">
      <div className="page-container">

        <div className="text-center mb-10">
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-2">Customer Love</p>
          <h2 className="text-3xl font-black text-neutral-900">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-cardHover transition-all duration-200 flex flex-col">

              {/* Quote icon */}
              <Quote size={24} className="text-primary-200 mb-3" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < t.rating ? "text-amber-400 fill-amber-400" : "text-neutral-200 fill-neutral-200"} />
                ))}
              </div>

              {/* Text */}
              <p className="text-neutral-600 text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">{t.name}</p>
                  <p className="text-xs text-neutral-400">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
