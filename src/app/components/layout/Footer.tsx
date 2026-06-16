import { MOCK_CATEGORIES, cityToSlug } from "../../../../data/mockData";
import { useCurrentCity } from "../../../../hooks/useCurrentCity";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import FooterCitiesStrip from "./FooterCitiesStrip";

const SERVICES = [
  "Home Cleaning", "Plumbing", "Electrical", "AC Service",
  "Painting", "Carpentry", "Pest Control", "Appliance Repair",
];

const COMPANY = [
  { label: "About Us",         href: "/about-us" },
  { label: "How It Works",     href: "/how-it-works" },
  { label: "Become a Partner", href: "/register/vendor" },
  { label: "Contact Us",       href: "/contact-us" },
  { label: "Vendor's Directory", href: "/vendors" },
];

const LEGAL = [
  { label: "Privacy Policy",    href: "/privacy" },
  { label: "Terms & Conditions",href: "/terms" },
];

const SOCIALS = [
  { icon: Facebook,  href: "https://www.facebook.com/apnidesidukaan", label: "Facebook" },
  { icon: Twitter,   href: "https://x.com/apnidesidukaan", label: "Twitter" },
  { icon: Instagram, href: "https://www.instagram.com/apnidesidukaan", label: "Instagram" },
  // { icon: LinkedIn,   href: "https://www.linkedin.com/company/apni-desi-dukaan/", label: "LinkedIn" },
];

export default function Footer() {
  const navigate     = useNavigate();
  const { cityName } = useCurrentCity();
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    function onScroll() { setShowScroll(window.scrollY > 400); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }

  function handleServiceClick(slug: string) {
    const cSlug = cityName ? cityToSlug(cityName) : "lucknow";
    navigate(`/${cSlug}/${slug}`);
  }

  return (
    <footer className="bg-primary-900 text-white">

      {/* ── TOP BAND ── */}
      <div className="bg-primary-800">
        <div className="page-container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Become a Service Partner</h3>
              <p className="text-primary-300 text-sm mt-1">Join 5000+ vendors earning with ADDies ServiceHub</p>
            </div>
            <Link
              to="/register/vendor"
              className="flex-shrink-0 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-colors shadow-lg"
            >
              Register as Vendor →
            </Link>
          </div>
        </div>
      </div>
        <FooterCitiesStrip />

      {/* ── MAIN FOOTER ── */}
      <div className="page-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white text-xl font-black">
                A
              </div>
              <div>
                <span className="text-lg font-black text-white leading-none block">ADDies</span>
                <span className="text-xs font-semibold text-primary-300 leading-none tracking-wide">ServiceHub</span>
              </div>
            </div>
            <p className="text-primary-300 text-sm leading-relaxed mb-5">
              India's hyperlocal home services marketplace. Connecting trusted professionals with customers across cities.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-lg bg-primary-800 flex items-center justify-center text-primary-300 hover:bg-primary-500 hover:text-white transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

                    {/* Services */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-2.5">
              {MOCK_CATEGORIES.slice(0, 8).map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => handleServiceClick(cat.slug)}
                    className="text-primary-300 hover:text-white text-sm transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/services" className="text-accent hover:text-white text-sm font-semibold transition-colors">
                  View All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-primary-300 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-bold text-white mt-6 mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              {LEGAL.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-primary-300 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-300">
                <MapPin size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <span>ADDies ServiceHub Pvt. Ltd.<br />Lucknow, Uttar Pradesh, India</span>
              </li>
              <li>
                <a href="tel:+919511123564" className="flex items-center gap-3 text-sm text-primary-300 hover:text-white transition-colors">
                  <Phone size={16} className="text-primary-400 flex-shrink-0" />
                  +91 9511123564
                </a>
              </li>
              <li>
                <a href="mailto:contact@appzenowebservices.com" className="flex items-center gap-3 text-sm text-primary-300 hover:text-white transition-colors">
                  <Mail size={16} className="text-primary-400 flex-shrink-0" />
                  contact@appzenowebservices.com
                </a>
              </li>
            </ul>

            {/* App Badges */}
            <div className="mt-6">
              <p className="text-xs text-primary-400 mb-3 font-semibold uppercase tracking-wider">Download App</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="flex items-center gap-2 px-3 py-2 bg-primary-800 hover:bg-primary-700 rounded-xl transition-colors">
                  <span className="text-lg">🤖</span>
                  <div>
                    <p className="text-2xs text-primary-400 leading-none">Get it on</p>
                    <p className="text-sm font-semibold text-white leading-tight">Google Play</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 px-3 py-2 bg-primary-800 hover:bg-primary-700 rounded-xl transition-colors">
                  <span className="text-lg">🍎</span>
                  <div>
                    <p className="text-2xs text-primary-400 leading-none">Download on</p>
                    <p className="text-sm font-semibold text-white leading-tight">App Store</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-primary-800">
        <div className="page-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-primary-400">
            © {new Date().getFullYear()} ADDies ServiceHub Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-primary-500">
            Made with ❤️ in India 🇮🇳
          </p>
        </div>
      </div>

      {/* ── SCROLL TO TOP BUTTON ── */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full
            bg-sky-600 hover:bg-sky-500 text-white shadow-xl shadow-sky-900/40
            flex items-center justify-center transition-all duration-300
            hover:scale-110 hover:-translate-y-1"
        >
          <ChevronUp size={20} strokeWidth={2.5} />
        </button>
      )}
    </footer>
  );
}