import { Shield, Zap, Star, MapPin, CreditCard, Headphones } from "lucide-react";

const FEATURES = [
  { icon: Shield,      title: "100% Verified",       desc: "Every vendor goes through KYC + background verification before onboarding.", color: "text-primary-600 bg-primary-100" },
  { icon: Zap,         title: "30-Min Response",      desc: "Our smart dispatch sends 3 vendors simultaneously — fastest one gets the job.", color: "text-amber-600 bg-amber-100" },
  { icon: Star,        title: "Reliability Score",    desc: "Vendors are ranked by completion rate, rating & response time — you always get the best.", color: "text-purple-600 bg-purple-100" },
  { icon: MapPin,      title: "PIN-Code Matching",    desc: "Services are matched by your exact area so your vendor is always nearby.", color: "text-green-600 bg-green-100" },
  { icon: CreditCard,  title: "Flexible Payments",    desc: "Pay via COD, UPI, card or ADDies Wallet. 100% secure transactions.", color: "text-blue-600 bg-blue-100" },
  { icon: Headphones,  title: "24/7 Support",         desc: "Our City Agents + support team is always available to resolve your issues.", color: "text-rose-600 bg-rose-100" },
];

export default function WhyChooseADDies() {
  return (
    <section className="section bg-white">
      <div className="page-container">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — Text */}
          <div>
            <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-2">Why ADDies?</p>
            <h2 className="text-3xl font-black text-neutral-900 mb-4 leading-tight">
              India's Smartest Way<br />to Book Home Services
            </h2>
            <p className="text-neutral-500 text-base leading-relaxed mb-8">
              Unlike other platforms, ADDies uses a competitive vendor model — 3 vendors race to serve you.
              Only the best, fastest, and nearest wins. This means better quality for you, every time.
            </p>

            {/* Counter stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "50,000+", label: "Happy Customers" },
                { value: "5,000+",  label: "Verified Vendors" },
                { value: "25+",     label: "Cities Active" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center p-4 rounded-2xl bg-primary-50 border border-primary-100">
                  <p className="text-2xl font-black text-primary-700">{value}</p>
                  <p className="text-xs font-medium text-neutral-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-2xl border border-neutral-100 hover:border-primary-200 hover:shadow-card transition-all duration-200 group"
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h4 className="font-bold text-neutral-900 mb-1.5 text-sm">{f.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
