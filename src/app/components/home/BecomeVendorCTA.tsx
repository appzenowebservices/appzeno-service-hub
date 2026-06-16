import { Link } from "react-router-dom";
import { TrendingUp, Users, BadgeCheck, Wallet } from "lucide-react";
import Button from "../ui/Button";

const PERKS = [
  { icon: TrendingUp, text: "Earn ₹30,000–₹80,000/month" },
  { icon: Users,      text: "Get leads from 3x more customers" },
  { icon: BadgeCheck, text: "Verified badge builds trust" },
  { icon: Wallet,     text: "Weekly payouts, zero delay" },
];

export default function BecomeVendorCTA() {
  return (
    <section className="section" style={{ background: "linear-gradient(135deg, #1A5276 0%, #2E86C1 60%, #5DADE2 100%)" }}>
      <div className="page-container">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <div className="text-white">
            <p className="text-primary-200 font-semibold text-sm uppercase tracking-wider mb-3">For Service Professionals</p>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              Grow Your Business<br />with ADDies
            </h2>
            <p className="text-primary-200 text-base leading-relaxed mb-8">
              Join thousands of plumbers, electricians, cleaners and more who are earning consistently through ADDies ServiceHub. No upfront cost, just results.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register/vendor">
                <Button variant="white" size="lg" className="font-bold">
                  Register as Vendor →
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 border border-white/30">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-white" />
                </div>
                <p className="text-white font-semibold text-sm leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
