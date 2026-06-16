import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Google Tag Manager ────────────────────────────────────────────────────────
const GTM_ID = "GTM-T35N8KH6";

function useGTM() {
  useEffect(() => {
    if (document.getElementById("gtm-script")) return; // already injected

    // dataLayer init
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

    // <script> in <head>
    const script = document.createElement("script");
    script.id    = "gtm-script";
    script.async = true;
    script.src   = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.insertBefore(script, document.head.firstChild);

    // <noscript> fallback in <body>
    if (!document.getElementById("gtm-noscript")) {
      const ns     = document.createElement("noscript");
      ns.id        = "gtm-noscript";
      const iframe = document.createElement("iframe");
      iframe.src   = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
      iframe.height = "0";
      iframe.width  = "0";
      iframe.style.cssText = "display:none;visibility:hidden";
      ns.appendChild(iframe);
      document.body.insertBefore(ns, document.body.firstChild);
    }
  }, []);
}
// ─────────────────────────────────────────────────────────────────────────────


import {
  Menu, X, MapPin, ChevronDown, Search, Bell, User, LogIn,
  Loader2, LocateFixed, CalendarPlus, ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import { useCurrentCity } from "../../../../hooks/useCurrentCity";
import { MOCK_CATEGORIES, cityToSlug } from "../../../../data/mockData";
import { cn } from "../../../../utils/cn";
import Button from "../ui/Button";

const NAV_LINKS = [
  { label: "Services",       href: "/services"      },
  { label: "How It Works",   href: "/how-it-works"  },
  { label: "Become Partner", href: "/register" },
  { label: "About Us",          href: "/about-us"         },
];

// ── Search Dropdown ────────────────────────────────────────────────────────────
interface SearchBoxProps {
  citySlug:    string;
  placeholder: string;
  className?:  string;
  onNavigate?: () => void;   // close mobile menu if needed
}

function SearchBox({ citySlug, placeholder, className, onNavigate }: SearchBoxProps) {
  const navigate                    = useNavigate();
  const [val,      setVal]          = useState("");
  const [open,     setOpen]         = useState(false);
  const [cursor,   setCursor]       = useState(-1);
  const inputRef                    = useRef<HTMLInputElement>(null);
  const wrapRef                     = useRef<HTMLDivElement>(null);

  // Filter categories by name OR description — case-insensitive
  const results = val.trim().length === 0
    ? MOCK_CATEGORIES                        // empty → show all 12
    : MOCK_CATEGORIES.filter((c) => {
        const q = val.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        );
      });

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCursor(-1);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function goTo(slug: string) {
    navigate(`/${citySlug}/${slug}`);
    setVal("");
    setOpen(false);
    setCursor(-1);
    inputRef.current?.blur();
    onNavigate?.();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = cursor >= 0 ? results[cursor] : results[0];
      if (target) goTo(target.slug);
    } else if (e.key === "Escape") {
      setOpen(false);
      setCursor(-1);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* Input */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={val}
          placeholder={placeholder}
          onChange={(e) => { setVal(e.target.value); setOpen(true); setCursor(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                     focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2
                     focus:ring-primary-100 transition-all placeholder:text-neutral-400"
        />
        {/* Clear button */}
        {val && (
          <button
            type="button"
            onClick={() => { setVal(""); setOpen(true); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400
                       hover:text-neutral-600 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl
                        shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-primary-100
                        z-[60] overflow-hidden animate-slide-down">

          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 bg-primary-50/60">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
              {val.trim() ? `${results.length} result${results.length !== 1 ? "s" : ""}` : "All Services"}
            </span>
            <span className="text-xs text-neutral-400">↑↓ navigate · Enter select</span>
          </div>

          {/* Results list */}
          <div className="max-h-[336px] overflow-y-auto py-1">
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm font-semibold text-neutral-500">No services found</p>
                <p className="text-xs text-neutral-400 mt-1">Try "cleaning", "repair", "plumber"…</p>
              </div>
            ) : (
              results.map((cat, i) => (
                <button
                  key={cat.slug}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                  onClick={() => goTo(cat.slug)}
                  onMouseEnter={() => setCursor(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    cursor === i
                      ? "bg-primary-50"
                      : "hover:bg-neutral-50"
                  )}
                >
                  {/* Icon */}
                  <span className="text-xl flex-shrink-0 w-8 text-center">{cat.icon}</span>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-800 leading-tight">
                      {/* Highlight matched portion */}
                      <Highlight text={cat.name} query={val} />
                    </p>
                    {cat.description && (
                      <p className="text-xs text-neutral-400 mt-0.5 leading-snug line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow on hover */}
                  <ArrowRight
                    size={14}
                    className={cn(
                      "flex-shrink-0 transition-all",
                      cursor === i ? "text-primary-500 opacity-100" : "text-neutral-300 opacity-0"
                    )}
                  />
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-4 py-2 bg-neutral-50/80">
            <p className="text-xs text-neutral-400 text-center">
              📍 Showing services in <span className="font-bold text-primary-600">{citySlug.replace(/-/g, " ")}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Highlight matched text with bold + color
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-primary-700 rounded px-0.5 font-black not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Main Header ────────────────────────────────────────────────────────────────
export default function Header() {
  useGTM(); // ← GTM initialisation
  const navigate                          = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cityName, loading, error, refresh } = useCurrentCity();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cSlug = cityName ? cityToSlug(cityName) : "lucknow";

  function getDashboardPath() {
    if (!user) return "/login";
    const map: Record<string, string> = {
      customer: "/customer",
      vendor:   "/vendor",
      agent:    "/agent",
      admin:    "/admin",
    };
    return map[user.role] ?? "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary-100 shadow-nav">
      <div className="page-container">
        <div className="flex items-center h-16 gap-3">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-black"
              style={{ background: "linear-gradient(135deg, #2E86C1, #1A5276)" }}
            >
              A
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black text-primary-800 leading-none">ADDies</span>
              <span className="block text-2xs font-semibold text-primary-400 leading-none tracking-wide">ServiceHub</span>
            </div>
          </Link>

          {/* ── AUTO-DETECT LOCATION ── */}
          <div className="flex-shrink-0">
            <button
              onClick={refresh}
              title="Refresh location"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-50 hover:bg-primary-100
                         transition-colors text-sm font-medium text-primary-700 border border-primary-200"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="text-primary-500 animate-spin" />
                  <span className="max-w-[90px] truncate text-primary-400">Detecting…</span>
                </>
              ) : error ? (
                <>
                  <LocateFixed size={14} className="text-danger" />
                  <span className="max-w-[90px] truncate text-danger text-xs">Allow location</span>
                </>
              ) : (
                <>
                  <MapPin size={14} className="text-primary-500" />
                  <span className="max-w-[110px] truncate">{cityName}</span>
                </>
              )}
            </button>
          </div>

          {/* ── SEARCH BAR (desktop) ── */}
          <SearchBox
            citySlug={cSlug}
            placeholder="Search services, e.g. plumber, AC repair…"
            className="hidden md:block flex-1 max-w-md"
          />

          {/* ── NAV LINKS (desktop) ── */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── AUTH SECTION ── */}
          <div className="flex items-center gap-2 ml-auto lg:ml-2">
            {isAuthenticated && user ? (
              <>
                {/* Book Now — customer only (desktop) */}
                {user.role === "customer" && (
                  <Link
                    to={`/${cSlug}/book`}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl
                               bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                               text-sm font-bold hover:from-emerald-600 hover:to-emerald-700
                               transition-all shadow-sm shadow-emerald-200 flex-shrink-0"
                  >
                    <CalendarPlus size={15} /> Book Now
                  </Link>
                )}

                {/* Notifications */}
                <button
                  onClick={() => navigate(`/${user.role}/notifications`)}
                  className="relative p-2 rounded-xl hover:bg-primary-50 text-neutral-500 hover:text-primary-600 transition-colors"
                >
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[80px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} className={cn("text-neutral-400 transition-transform", userMenuOpen && "rotate-180")} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-float border border-primary-100 overflow-hidden z-50 animate-slide-down">
                      <div className="p-3 border-b border-neutral-100">
                        <p className="text-sm font-semibold text-neutral-800">{user.fullName}</p>
                        <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                          <User size={15} /> Dashboard
                        </Link>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); navigate("/"); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
                        >
                          <LogIn size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-primary-50 text-neutral-600 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE SEARCH ── */}
        <div className="md:hidden pb-3">
          <SearchBox
            citySlug={cSlug}
            placeholder="Search services…"
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-primary-100 bg-white animate-slide-down">
          <nav className="page-container py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === "customer" && (
              <Link
                to={`/${cSlug}/book`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl mt-1
                           bg-gradient-to-r from-emerald-500 to-emerald-600
                           text-white text-sm font-bold"
              >
                <CalendarPlus size={16} /> Book a Service
              </Link>
            )}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2 pb-1">
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" fullWidth>Register</Button>
                </Link>
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" fullWidth>Login</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Backdrop */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
}
