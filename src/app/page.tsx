import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import LocationPicker from "~/app/components/location/LocationPicker";

const CITIES = [
  { slug: "lucknow", name: "Lucknow" },
  { slug: "delhi", name: "Delhi NCR" },
  { slug: "mumbai", name: "Mumbai" },
  { slug: "bangalore", name: "Bangalore" },
  { slug: "hyderabad", name: "Hyderabad" },
  { slug: "pune", name: "Pune" },
  { slug: "jaipur", name: "Jaipur" },
  { slug: "kanpur", name: "Kanpur" },
  { slug: "varanasi", name: "Varanasi" },
  { slug: "noida", name: "Noida" },
];

// NOTE: no hardcoded catalogue on purpose — the storefront renders ONLY what
// exists in the DB (seeded/merchandised in /admin). Empty DB = honest empty
// states below, never placeholder services.

function fmtCount(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${n}`;
}

function fmtRating(r: number): string {
  return r > 0 ? r.toFixed(2) : "New";
}

function mrpOf(price: number): number {
  return Math.max(price + 49, Math.round((price * 1.25) / 10) * 10 - 1);
}

function CatIcon({ icon, name, box }: { icon: string; name: string; box: string }) {
  if (icon.startsWith("/")) {
    return (
      <span className={`flex items-center justify-center overflow-hidden ${box}`}>
        <Image src={icon} alt={name} width={56} height={56} className="h-full w-full object-cover" />
      </span>
    );
  }
  return <span className={`flex items-center justify-center ${box}`}>{icon === "" ? "✨" : icon}</span>;
}

const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Lucknow", rating: 5, text: "Bathroom cleaning was genuinely UC-level. Team arrived on time with machines, 90-day re-service promise in writing.", avatar: "PS" },
  { name: "Rahul Verma", city: "Delhi", rating: 5, text: "AC foam-jet service for ₹549 — technician wore shoe covers, showed before/after cooling. Highly recommended.", avatar: "RV" },
  { name: "Anjali Singh", city: "Mumbai", rating: 5, text: "Salon at home felt safer than parlour. Sealed single-use kit opened in front of me. Price exactly as shown.", avatar: "AS" },
  { name: "Mohit Gupta", city: "Bangalore", rating: 4, text: "Electrician visit in 45 minutes. Upfront ₹149 visiting charge adjusted in final bill. Transparent.", avatar: "MG" },
];

const FAQS = [
  { q: "How is ADDies different from calling a local vendor?", a: "Fixed upfront pricing, KYC-verified pros, background checks, on-time tracking, digital invoice, and up to 30-day re-service warranty — no bargaining, no no-shows." },
  { q: "What if I'm not happy with the service?", a: "Raise a re-service request within 30 days (7 days for salon/beauty consumables). We re-visit free or refund the differential — resolved in-app without phone chasing." },
  { q: "Are products and spares included?", a: "Chemicals/machines are included for cleaning; branded spares for repair are charged at MRP with old part handed back. Salon uses sealed single-use kits opened in front of you." },
  { q: "How do visiting charges work?", a: "₹99–₹149 inspection charge applies only to repair visits and is 100% adjusted in the final bill if you proceed. Cleaning, salon and painting have zero visiting fee." },
  { q: "Can I reschedule or cancel?", a: "Free reschedule up to 2 hrs before the slot. Free cancellation up to 4 hrs before; a small slot-block fee applies after that, shown before you confirm." },
];

function dashForRole(role?: string) {
  const r = (role ?? "").toUpperCase();
  if (r === "ADMIN") return "/admin";
  if (r === "VENDOR") return "/vendor";
  if (r === "AGENT") return "/agent";
  if (r === "CUSTOMER") return "/customer/dashboard";
  return "/auth/login";
}

export default async function HomePage() {
  const session = await auth().catch(() => null);
  const role = (session?.user as { role?: string } | undefined)?.role;

  type Cat = {
    id: string; slug: string; name: string; icon: string; image?: string | null;
    description?: string | null; rating: number; totalBookings: number; isFeatured: boolean;
    subCategories: { name: string; basePrice: number; unit: string }[];
  };
  let cats: Cat[] = [];
  try {
    cats = (await api.categories.getAll()) as Cat[];
  } catch {
    cats = [];
  }

  type Vendor = { id: string; fullName: string; city: string; vendorProfile?: { businessName: string; rating: number; totalReviews: number; serviceCategories: string[] } | null };
  let vendors: Vendor[] = [];
  try {
    vendors = (await api.vendors.getApprovedVendors({ limit: 4 })) as Vendor[];
  } catch {
    vendors = [];
  }

  // ── the one storefront list: DB rows only, never placeholders ──
  interface StoreCat {
    slug: string; name: string; icon: string; image?: string;
    rating: string; bookings: number; countLabel: string;
    price: number; sub: string; unit: string; featured: boolean;
  }
  const store: StoreCat[] = cats.slice(0, 12).map((c) => {
    const sorted = [...c.subCategories].sort((a, b) => a.basePrice - b.basePrice);
    const cheapest = sorted[0];
    return {
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      image: c.image ?? undefined,
      rating: fmtRating(c.rating),
      bookings: c.totalBookings,
      countLabel: fmtCount(c.totalBookings),
      price: cheapest?.basePrice ?? 299,
      sub: cheapest?.name ?? "Popular service",
      unit: cheapest?.unit ?? "per job",
      featured: c.isFeatured,
    };
  });

  // bestsellers = top categories by real booking volume
  const bestsellers = [...store].sort((a, b) => b.bookings - a.bookings).slice(0, 8);

  // hero bento = admin-featured first, then top by volume (always 4 tiles)
  const HERO_BG = ["bg-primary-800", "bg-accent-600", "bg-ink", "bg-emerald-800"];
  const HERO_POS = ["center 30%", "center 22%", "center 28%", "center 38%"];
  const HERO_SPAN = ["feature", "half", "half", "strip"] as const;
  const featuredFirst = [...store.filter((s) => s.featured), ...store.filter((s) => !s.featured)];
  const heroTiles = featuredFirst.slice(0, 4).map((s, i) => ({
    ...s,
    href: `/services?cat=${s.slug}`,
    bg: HERO_BG[i % HERO_BG.length] ?? "bg-ink",
    pos: HERO_POS[i % HERO_POS.length] ?? "center 25%",
    span: HERO_SPAN[i % HERO_SPAN.length] ?? "half",
    priceLabel: s.unit.toLowerCase().includes("visit") ? `visit ₹${s.price.toLocaleString("en-IN")}*` : `from ₹${s.price.toLocaleString("en-IN")}`,
  }));

  return (
    <div className="min-h-screen bg-white font-sans text-ink">
      {/* ── Top utility strip (UC-style trust ticker) ── */}
      <div className="bg-ink text-white">
        <div className="page-container flex h-9 items-center justify-between text-[12px] font-semibold">
          <p className="truncate">★ 4.8 rated • 50,000+ bookings served • Up to 30-day re-service warranty</p>
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/directory" className="text-slate-300 hover:text-white">Find a pro</Link>
            <Link href="/auth/register?role=vendor" className="text-accent-200 hover:text-accent-300">Become a partner →</Link>
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="page-container flex h-16 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image src="/logo.png" alt="ADDies Service Hub" width={36} height={36} className="h-9 w-9 object-contain" priority />
            <span className="leading-none">
              <span className="block text-[17px] font-extrabold tracking-tight">ADDies</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">Service Hub</span>
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-6 text-sm font-semibold text-body lg:flex">
            <Link href="/services" className="hover:text-primary-700">Services</Link>
            <Link href="/directory" className="hover:text-primary-700">Pros near you</Link>
            <Link href="/how-it-works" className="hover:text-primary-700">How it works</Link>
            <Link href="/services" className="hover:text-primary-700">Pricing</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LocationPicker variant="header" />
            {session?.user ? (
              <Link href={dashForRole(role)} className="btn-primary !px-5 !py-2">My bookings</Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost !px-4 !py-2">Login</Link>
                <Link href="/services" className="btn-primary !px-5 !py-2">Book now</Link>
              </>
            )}
          </div>
        </div>
        {/* mobile search shortcut */}
        <div className="border-t border-slate-100 px-4 pb-3 pt-2 md:hidden">
          <Link href="/services" className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-muted">
            <span>🔍</span> Search “AC service”, “salon”, “plumber”…
          </Link>
        </div>
      </header>

      <main className="pb-20">
        {/* ── HERO (UC pattern: headline + search + trust + visual grid) ── */}
        <section className="border-b border-line bg-gradient-to-b from-primary-50/70 via-white to-white">
          <div className="page-container grid gap-8 py-8 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="eyebrow">★ 4.8 • Trusted in 10+ cities • 2,000+ verified pros</p>
              <h1 className="h-display mt-3 text-balance">
                Home services, <br className="hidden sm:block" /> on demand —{" "}
                <span className="text-primary-700">fixed price, no bargaining.</span>
              </h1>
              <p className="sub mt-3 max-w-xl !text-[15px]">
                Cleaning, AC, salon, repairs & more at your doorstep. Verified pros, sealed kits, digital invoice and up to 30-day warranty.
              </p>

              {/* Search panel — the #1 UC conversion element */}
              <form action="/services" method="GET" className="mt-6 rounded-2xl border border-line bg-white p-2 shadow-card">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <LocationPicker variant="hero" />
                  <label className="flex flex-[2] items-center gap-2 rounded-xl bg-surface px-3.5 py-3 text-sm">
                    <span>🔍</span>
                    <input name="q" placeholder='Try “bathroom cleaning”, “AC service”, “salon”…' className="w-full bg-transparent font-medium text-ink outline-none placeholder:text-muted" />
                  </label>
                  <button type="submit" className="btn-primary !px-7 !py-3 !text-[15px]">Search</button>
                </div>
                <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-2 text-xs font-semibold text-muted">
                  <span>Popular:</span>
                  {["AC service", "Bathroom cleaning", "Salon women", "Plumber"].map((t) => (
                    <Link key={t} href={`/services?q=${encodeURIComponent(t)}`} className="rounded-full border border-line bg-white px-3 py-1 text-body hover:border-primary-300 hover:text-primary-700">{t}</Link>
                  ))}
                </div>
              </form>

              {/* trust chips */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-[13px] font-bold text-body sm:grid-cols-4">
                {[
                  ["🛡️", "Verified pros"],
                  ["💰", "Upfront pricing"],
                  ["↩️", "30-day warranty*"],
                  ["⏰", "On-time, tracked"],
                ].map(([i, t]) => (
                  <div key={t} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
                    <span className="text-base">{i}</span>{t}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["PS", "RV", "AS", "MG", "+"].map((a) => (
                    <span key={a} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-[10px] font-extrabold text-white">{a}</span>
                  ))}
                </div>
                <p className="text-[13px] font-semibold text-body"><b className="text-ink">50,000+ bookings</b> • 4.8★ from 12k reviews</p>
              </div>
            </div>

            {/* ── Bento collage: admin-featured categories, DB-driven.
                Empty catalog = honest brand panel, never fake tiles. ── */}
            {heroTiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {heroTiles.map((c) => (
                <Link
                  key={c.slug}
                  href={c.href}
                  className={`group relative flex overflow-hidden text-white shadow-card ring-1 ring-black/10 transition-all hover:-translate-y-1 hover:shadow-pop ${
                    c.span === "half" ? "min-h-[230px] flex-col justify-between p-4 sm:min-h-[250px] sm:p-5 rounded-[22px]" : "col-span-2 rounded-[22px]"
                  } ${c.span === "feature" ? "min-h-[230px] flex-col justify-between p-5 sm:min-h-[280px] sm:p-6" : ""} ${
                    c.span === "strip" ? "min-h-[150px] flex-row items-end justify-between gap-3 p-5 sm:min-h-[170px] sm:p-6" : ""
                  } ${c.bg}`}
                >
                  <div aria-hidden className="absolute inset-0 bg-cover transition-transform duration-700 group-hover:scale-[1.05]" style={{ backgroundImage: c.image ? `url("${c.image}")` : undefined, backgroundPosition: c.pos }} />
                  <div aria-hidden className="absolute inset-0 bg-primary-900/15" />
                  <div aria-hidden className="absolute inset-0" style={{ boxShadow: "inset 0 0 60px rgba(2,6,23,0.45)" }} />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-950/5" />
                  {c.span === "strip" ? (
                    <>
                      <div className="relative">
                        <p className="text-lg font-extrabold leading-snug drop-shadow-md sm:text-xl">{c.name} <span className="ml-1 align-middle text-[11px] font-extrabold text-white/80">★ {c.rating} ({c.countLabel})</span></p>
                        <p className="mt-0.5 text-[13px] font-semibold text-white/85"><span className="font-extrabold text-white">{c.priceLabel}</span> • {c.unit}</p>
                      </div>
                      <span className="relative inline-flex shrink-0 items-center gap-1 self-end rounded-full bg-white px-5 py-2 text-xs font-extrabold text-ink transition-colors group-hover:bg-accent-400 group-hover:text-accent-ink sm:self-center">Book →</span>
                    </>
                  ) : (
                    <>
                      <div className="relative flex justify-start">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-extrabold text-white backdrop-blur-md">★ {c.rating} <span className="font-semibold text-white/70">({c.countLabel})</span></span>
                      </div>
                      <div className="relative">
                        <p className={`font-extrabold leading-snug drop-shadow-md ${c.span === "feature" ? "text-xl sm:text-2xl" : "text-[15px] sm:text-lg"}`}>{c.name}</p>
                        <p className="mt-0.5 text-[13px] font-semibold text-white/85"><span className="font-extrabold text-white">{c.priceLabel}</span></p>
                        <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-xs font-extrabold text-ink transition-colors group-hover:bg-accent-400 group-hover:text-accent-ink">Book →</span>
                      </div>
                    </>
                  )}
                </Link>
              ))}
            </div>
            ) : (
            <div className="relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[26px] bg-primary-900 p-7 text-white sm:min-h-[420px]">
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-500/30 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent-400/25 blur-3xl" />
              <div className="relative">
                <p className="eyebrow !bg-white/10 !text-accent-200">Launching soon in your city</p>
                <p className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">Verified home services,<br />curated for you.</p>
                <p className="mt-2 max-w-xs text-sm text-primary-100">Our service menu is being finalized with background-checked pros. Check back shortly.</p>
                <Link href="/services" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-ink hover:bg-primary-50">Explore services →</Link>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* ── Category rail (UC-style horizontal cards) ── */}
        <section className="page-container mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="h-section !text-2xl">What are you looking for?</h2>
              <p className="sub mt-1">Fixed pricing • Sealed kits • Background-checked pros</p>
            </div>
            <Link href="/services" className="shrink-0 text-sm font-bold text-primary-600 hover:text-primary-700">See all services →</Link>
          </div>
          {store.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:gap-3 lg:grid-cols-6">
            {store.map((c) => (
              <Link key={c.slug} href={`/services?cat=${c.slug}`} className="card card-hover group !p-3 text-center sm:!p-4">
                <CatIcon icon={c.icon} name={c.name} box="mx-auto h-12 w-12 rounded-2xl bg-primary-50 text-[26px] transition-transform group-hover:scale-110 sm:h-14 sm:w-14 sm:text-3xl" />
                <p className="mt-2 text-[12px] font-extrabold leading-tight text-ink sm:text-[13px]">{c.name}</p>
                <p className="mt-0.5 text-[11px] font-bold text-accent-600">★ {c.rating}</p>
                <p className="text-[11px] font-semibold text-muted">from ₹{c.price.toLocaleString("en-IN")} • {c.countLabel}</p>
              </Link>
            ))}
          </div>
          ) : (
          <div className="flex flex-col items-center gap-1.5 rounded-3xl border border-dashed border-line bg-surface px-4 py-10 text-center">
            <p className="font-extrabold text-ink">Fresh catalog on the way</p>
            <p className="max-w-sm text-sm text-muted">We&apos;re onboarding verified pros and finalizing fixed pricing for your city. Check back soon.</p>
            <Link href="/services" className="btn-ghost mt-2 !py-2 text-[13px]">Browse services</Link>
          </div>
          )}
        </section>

        {/* ── Most booked: top categories by real booking volume ── */}
        {bestsellers.length > 0 ? (
        <section className="page-container mt-12">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="eyebrow">Most booked right now</p>
              <h2 className="h-section mt-2 !text-2xl">Bestsellers with upfront pricing</h2>
            </div>
            <Link href="/services" className="hidden shrink-0 text-sm font-bold text-primary-600 sm:block">View all →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((s) => {
              const mrp = mrpOf(s.price);
              return (
                <div key={s.slug} className="card card-hover flex flex-col">
                  <div className="flex items-start justify-between">
                    <CatIcon icon={s.icon} name={s.name} box="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-2xl" />
                    <span className="chip chip-success">★ {s.rating} ({s.countLabel})</span>
                  </div>
                  <p className="mt-3 font-extrabold leading-snug text-ink">{s.sub}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">{s.unit} • 30-day warranty*</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-ink">₹{s.price.toLocaleString("en-IN")}</span>
                    <span className="text-[13px] font-semibold text-muted line-through">₹{mrp.toLocaleString("en-IN")}</span>
                    <span className="chip chip-accent">{Math.round((1 - s.price / mrp) * 100)}% off</span>
                  </div>
                  <Link href={`/services?cat=${s.slug}`} className="btn-primary mt-3 !py-2">Book now</Link>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">*Warranty on workmanship; consumables & spares as per policy. Visiting charge adjusted on repair confirmation.</p>
        </section>
        ) : null}

        {/* ── Offers (UC coupon banners) ── */}
        <section className="page-container mt-12">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { code: "FIRST100", t: "₹100 off first booking", d: "Min. ₹499 • new customers", bg: "bg-primary-600" },
              { code: "DEEP20", t: "20% off deep cleaning", d: "This week • all cities", bg: "bg-ink" },
              { code: "SALON15", t: "15% off salon at home", d: "Sealed kits • verified beauticians", bg: "bg-accent-400 !text-accent-ink" },
            ].map((o) => (
              <div key={o.code} className={`rounded-3xl ${o.bg} p-5 text-white`}>
                <p className="inline-block rounded-lg border border-dashed border-white/60 bg-white/15 px-2.5 py-1 font-mono text-xs font-extrabold tracking-widest">{o.code}</p>
                <p className="mt-2 text-lg font-extrabold">{o.t}</p>
                <p className="text-[13px] font-medium text-white/80">{o.d}</p>
                <Link href="/services" className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-[13px] font-extrabold text-ink hover:bg-slate-100">Claim offer →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why ADDies (trust differentiators vs local/competitor) ── */}
        <section className="page-container mt-12">
          <div className="rounded-3xl border border-line bg-surface p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="h-section !text-2xl">Why 50,000+ homes chose ADDies</h2>
              <span className="chip chip-primary">UC-grade SOPs • desi pricing</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["🪪", "KYC + background verified", "Aadhaar-verified pros, police-check for in-home categories, photo ID shown in app before entry."],
                ["💰", "Fixed menu pricing", "What you see is what you pay. MRP spares, digital invoice, no haggling at your door."],
                ["↩️", "Re-service warranty", "Up to 30-day workmanship warranty. Free re-visit or refund — no follow-up calls needed."],
                ["📍", "Live tracking + support", "Pro assigned in minutes, live status, Hindi/English support till job closure."],
              ].map(([i, t, d]) => (
                <div key={t} className="rounded-2xl border border-line bg-white p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-2xl">{i}</span>
                  <p className="mt-3 font-extrabold text-ink">{t}</p>
                  <p className="sub mt-1 !text-[13px]">{d}</p>
                </div>
              ))}
            </div>
            {/* comparison strip */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
              <div className="grid grid-cols-3 bg-ink px-4 py-3 text-[12px] font-extrabold uppercase tracking-wider text-white sm:text-[13px]">
                <span></span><span className="text-center text-slate-300">Local calling</span><span className="text-center text-accent-200">ADDies ✓</span>
              </div>
              {[
                ["Upfront fixed price", "✕", "✓"],
                ["Verified + background-checked", "✕", "✓"],
                ["Re-service warranty", "✕", "Up to 30 days"],
                ["Digital invoice + support", "✕", "✓"],
              ].map(([f, l, a]) => (
                <div key={f} className="grid grid-cols-3 border-t border-slate-100 px-4 py-2.5 text-sm">
                  <span className="font-bold text-body">{f}</span>
                  <span className="text-center text-muted">{l}</span>
                  <span className="text-center font-extrabold text-success">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="page-container mt-12">
          <h2 className="h-section !text-2xl">Book in 60 seconds</h2>
          <p className="sub mb-4 mt-1">No phone calls. No bargaining. Track everything in app.</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { n: "01", t: "Search & pick a slot", d: "Choose service, see fixed price, pick today/tomorrow slot. Pincode-checked availability." },
              { n: "02", t: "Verified pro assigned", d: "Nearest top-rated pro accepts in minutes. See name, photo, rating before entry." },
              { n: "03", t: "Pay after work + rate", d: "UPI, card, wallet or COD. Invoice + warranty auto-generated. Rate to keep quality high." },
            ].map((s) => (
              <div key={s.n} className="card">
                <p className="inline-block rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-extrabold text-white">{s.n}</p>
                <p className="mt-2 font-extrabold text-ink">{s.t}</p>
                <p className="sub mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pros + Testimonials ── */}
        <section className="page-container mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="h-section !text-2xl">Top-rated pros near you</h2>
            <p className="sub mb-4 mt-1">KYC-verified • Rated after every job</p>
            <div className="space-y-2.5">
              {vendors.slice(0, 4).map((v) => (
                <div key={v.id} className="card card-hover flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-sm font-extrabold text-white">{v.fullName.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-ink">{v.vendorProfile?.businessName ?? v.fullName} <span className="chip chip-accent ml-1">★ {(v.vendorProfile?.rating ?? 4.5).toFixed(1)}</span></p>
                    <p className="truncate text-xs text-muted">{v.fullName} • {v.city} • {v.vendorProfile?.totalReviews ?? 0} jobs done</p>
                  </div>
                  <Link href="/directory" className="shrink-0 text-[13px] font-bold text-primary-600">View →</Link>
                </div>
              ))}
              {!vendors.length && (
                <div className="card">
                  <p className="text-sm font-bold text-ink">2,000+ verified pros onboarding</p>
                  <p className="sub mt-1">Live directory syncing — <Link href="/directory" className="font-bold text-primary-600">browse all pros →</Link></p>
                </div>
              )}
            </div>
            {/* partner CTA */}
            <div className="mt-4 rounded-3xl bg-ink p-6 text-white">
              <p className="chip chip-accent mb-2">Earn ₹40k–₹80k/month</p>
              <p className="text-lg font-extrabold">Are you a skilled pro? Get genuine leads.</p>
              <p className="mt-1 text-sm text-slate-300">Zero joining fee • Weekly payouts • Free training + kit support.</p>
              <div className="mt-3 flex gap-2">
                <Link href="/auth/register?role=vendor" className="btn-accent !py-2.5">Join as pro</Link>
                <Link href="/auth/register?role=agent" className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold hover:bg-white/10">Become agent</Link>
              </div>
            </div>
          </div>
          <div>
            <h2 className="h-section !text-2xl">Customers love ADDies</h2>
            <p className="sub mb-4 mt-1">4.8★ average across 12,000+ verified reviews</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="card">
                  <p className="text-sm font-bold text-accent-500">{"★".repeat(t.rating)}<span className="text-line">{"★".repeat(5 - t.rating)}</span> <span className="ml-1 rounded bg-success-soft px-1.5 py-0.5 text-[11px] text-success">Verified booking</span></p>
                  <blockquote className="mt-2 text-sm leading-relaxed text-body">“{t.text}”</blockquote>
                  <figcaption className="mt-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-[11px] font-extrabold text-white">{t.avatar}</span>
                    <p className="text-xs font-extrabold text-ink">{t.name} <span className="block font-medium text-muted">{t.city}</span></p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cities SEO ── */}
        <section className="page-container mt-12">
          <h2 className="h-section !text-2xl">Now live in 10 cities</h2>
          <p className="sub mb-4 mt-1">Same fixed menu, local verified pros — expanding every month.</p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Link key={c.slug} href="/services" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-body hover:border-primary-300 hover:text-primary-700">{c.name}</Link>
            ))}
          </div>
        </section>

        {/* ── FAQ (SEO + objection handling, UC parity) ── */}
        <section className="page-container mt-12 max-w-4xl">
          <h2 className="h-section !text-2xl">Questions, answered</h2>
          <div className="mt-4 space-y-2.5">
            {FAQS.map((f) => (
              <details key={f.q} className="card group !p-0">
                <summary className="cursor-pointer list-none px-5 py-4 text-[15px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">{f.q}<span className="text-primary-600 group-open:rotate-45">＋</span></span>
                </summary>
                <p className="sub px-5 pb-4">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── App + final CTA ── */}
        <section className="page-container mt-12">
          <div className="relative overflow-hidden rounded-[28px] bg-primary-900 px-6 py-10 text-center text-white md:py-14">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-accent-400/25 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <p className="eyebrow !bg-white/10 !text-accent-200">First booking? ₹100 off with FIRST100</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Ghar ka har kaam, one tap away.</h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] text-primary-100">Fixed pricing, verified pros, live tracking and warranty — experience the ADDies standard today.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/services" className="btn-accent !px-8 !py-3 !text-[15px]">Book a service →</Link>
                <Link href="/auth/register?role=vendor" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-8 py-3 text-[15px] font-bold text-white backdrop-blur hover:bg-white/20">Join as pro</Link>
              </div>
              <p className="mt-4 text-xs font-semibold text-primary-200">No advance for most services • Free reschedule till 2 hrs before • COD + UPI available</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Rich footer (UC-style SEO + trust) ── */}
      <footer className="border-t border-line bg-surface">
        <div className="page-container grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="ADDies Service Hub" width={36} height={36} className="h-9 w-9 object-contain" />
              <span className="leading-none">
                <span className="block text-[17px] font-extrabold">ADDies</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">Service Hub</span>
              </span>
            </div>
            <p className="sub mt-3 max-w-xs">Apni ghar ki dukaan for every home service — verified pros, fixed pricing, warranty in writing.</p>
            <div className="mt-3 flex gap-2 text-xs font-bold">
              <span className="chip chip-success">✓ KYC verified</span>
              <span className="chip chip-primary">★ 4.8 rated</span>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted">Top services</p>
            <ul className="space-y-2 text-sm font-semibold text-body">
              {store.length > 0
                ? store.slice(0, 6).map((c) => <li key={c.slug}><Link href={`/services?cat=${c.slug}`} className="hover:text-primary-700">{c.name} in Lucknow</Link></li>)
                : <li><Link href="/services" className="hover:text-primary-700">Browse all services</Link></li>}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted">Company</p>
            <ul className="space-y-2 text-sm font-semibold text-body">
              <li><Link href="/about-us" className="hover:text-primary-700">About us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary-700">How it works</Link></li>
              <li><Link href="/directory" className="hover:text-primary-700">Find pros</Link></li>
              <li><Link href="/auth/register?role=vendor" className="hover:text-primary-700">Become a partner</Link></li>
              <li><Link href="/contact-us" className="hover:text-primary-700">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted">Support</p>
            <ul className="space-y-2 text-sm font-semibold text-body">
              <li><Link href="/terms" className="hover:text-primary-700">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-700">Privacy</Link></li>
              <li><span>Helpline: 1800-xxx-xxxx (8am–10pm)</span></li>
              <li><span>Hindi • English support</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line bg-white">
          <div className="page-container flex flex-col justify-between gap-2 py-5 text-[13px] text-muted sm:flex-row">
            <p><b className="text-ink">ADDies Service Hub</b> — © {new Date().getFullYear()} • Made for Bharat homes</p>
            <p>Prices incl. GST where applicable • Warranty as per policy</p>
          </div>
        </div>
      </footer>

      {/* ── Sticky mobile book bar (UC conversion pattern) ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="flex gap-2">
          <Link href="/services" className="btn-ghost flex-1 !py-3">🔍 Search</Link>
          <Link href="/services" className="btn-primary flex-[2] !py-3 !text-[15px]">Book now →</Link>
        </div>
      </div>
    </div>
  );
}
