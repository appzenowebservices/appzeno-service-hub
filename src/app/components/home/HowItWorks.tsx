import { Search, UserCheck, Wrench, ThumbsUp } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Search & Select",
    description: "Choose your city, search for the service you need, and pick from verified categories.",
    color: "bg-blue-50 text-blue-600",
    border: "border-blue-200",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Get Matched Fast",
    description: "3 top-rated vendors near you are notified instantly. First to confirm + best rating wins your job.",
    color: "bg-primary-50 text-primary-600",
    border: "border-primary-200",
  },
  {
    step: "03",
    icon: Wrench,
    title: "Service at Door",
    description: "Your verified professional arrives on time. Track real-time status from your dashboard.",
    color: "bg-accent-light text-accent-dark",
    border: "border-amber-200",
  },
  {
    step: "04",
    icon: ThumbsUp,
    title: "Pay & Review",
    description: "Pay via COD, UPI, card or wallet. Rate your experience to help others choose better.",
    color: "bg-success-light text-success-dark",
    border: "border-green-200",
  },
];

export default function HowItWorks() {
  return (
    <section className="section bg-gradient-to-br from-primary-50 to-white">
      <div className="page-container">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-2">Simple Process</p>
          <h2 className="text-3xl font-black text-neutral-900 mb-3">How ADDies Works</h2>
          <p className="text-neutral-500 max-w-xl mx-auto text-base">
            From booking to doorstep service in just 4 simple steps. No calls, no hassle.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-primary-200 z-0" style={{ width: "calc(100% - 2rem)", left: "calc(50% + 2rem)" }} />
              )}

              <div className="relative z-10 flex flex-col items-center text-center group">
                {/* Step circle */}
                <div className={`w-16 h-16 rounded-2xl ${s.color} border-2 ${s.border} flex items-center justify-center mb-4 shadow-card group-hover:scale-110 transition-transform duration-200`}>
                  <s.icon size={28} />
                </div>

                {/* Step number */}
                <span className="text-xs font-black text-neutral-300 tracking-widest mb-2">STEP {s.step}</span>

                <h3 className="text-lg font-bold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
