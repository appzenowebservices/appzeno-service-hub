import Link from "next/link";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";

const CITIES = [
  { slug: "lucknow", name: "Lucknow", pincodes: "226001 • 226010" },
  { slug: "delhi", name: "Delhi", pincodes: "110001 • 110085" },
  { slug: "mumbai", name: "Mumbai", pincodes: "400001 • 400058" },
  { slug: "bangalore", name: "Bangalore", pincodes: "560001 • 560066" },
  { slug: "hyderabad", name: "Hyderabad", pincodes: "500001 • 500081" },
  { slug: "pune", name: "Pune", pincodes: "411001 • 411038" },
  { slug: "jaipur", name: "Jaipur", pincodes: "302001 • 302017" },
  { slug: "kanpur", name: "Kanpur", pincodes: "208001 • 208002" },
  { slug: "varanasi", name: "Varanasi", pincodes: "221001 • 221010" },
  { slug: "noida", name: "Noida", pincodes: "201301 • 201305" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Lucknow", rating: 5, text: "Bahut acha service mila! Plumber 30 minute mein aa gaya. ADDies ka system kaafi fast hai.", avatar: "PS" },
  { name: "Rahul Verma", city: "Delhi", rating: 5, text: "AC service ke liye book kiya, technician on time aaya aur kaam bhi sahi kiya. Highly recommended!", avatar: "RV" },
  { name: "Anjali Singh", city: "Mumbai", rating: 4, text: "Ghar ki cleaning ke liye best platform. Price bhi reasonable hai aur staff professional.", avatar: "AS" },
  { name: "Mohit Gupta", city: "Bangalore", rating: 5, text: "Electrical work kaafi quickly complete hua. Vendor ka rating system bahut helpful hai.", avatar: "MG" },
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

  let categories: { id: string; slug: string; name: string; icon: string; description?: string | null }[] = [];
  let vendors: { id: string; fullName: string; city: string; vendorProfile?: { businessName: string; rating: number; totalReviews: number; serviceCategories: string[] } | null }[] = [];
  try {
    const cats = await api.categories.getAll();
    categories = cats.slice(0, 18).map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon, description: c.description }));
  } catch {
    categories = [];
  }
  try {
    vendors = (await api.vendors.getApprovedVendors({ limit: 8 })) as typeof vendors;
  } catch {
    vendors = [];
  }

  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* ── Header: white, sticky, primary brand ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-lg font-extrabold text-white shadow-sm">A</span>
            <span className="leading-none">
              <span className="block text-[17px] font-extrabold tracking-tight text-ink">ADDies</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">Service Hub</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-body md:flex">
            <Link href="/services" className="transition-colors hover:text-primary-700">Services</Link>
            <Link href="/directory" className="transition-colors hover:text-primary-700">Vendors</Link>
            <Link href="/services" className="transition-colors hover:text-primary-700">Pricing</Link>
            <Link href="/how-it-works" className="transition-colors hover:text-primary-700">How It Works</Link>
          </nav>
          <div className="flex items-center gap-2">
            {session?.user ? (
              <Link href={dashForRole(role)} className="btn-primary !px-5 !py-2">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost !px-5 !py-2">Login</Link>
                <Link href="/auth/register" className="btn-primary !px-5 !py-2">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="page-container pb-16">
        {/* ── Hero: primary-900 ink, accent underline ── */}
        <section className="relative overflow-hidden rounded-[28px] bg-primary-900 px-6 py-12 md:px-12 md:py-16 mt-6">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-accent-400/25 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="eyebrow !bg-white/10 !text-accent-200">Trusted in 10+ cities • 4.8★ rated • 42 live bookings</p>
            <h1 className="h-display mt-4 !text-white text-balance">
              Ghar ka har kaam,{" "}
              <span className="relative inline-block">
                verified experts
                <span className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-accent-400" />
              </span>{" "}
              ke saath
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-primary-100">
              Plumbing, AC service, cleaning, beauty, tuition aur 50+ services — upfront pricing, on-time arrival, warranty ke saath.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/services" className="btn-accent !px-7 !py-3 !text-[15px]">Find Services →</Link>
              <Link href="/directory" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3 text-[15px] font-bold text-white backdrop-blur transition-all hover:bg-white/20">Top Vendors</Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-7 text-sm">
              {[
                ["54", "services"],
                ["20+", "verified vendors"],
                ["10", "cities live"],
              ].map(([v, l]) => (
                <span key={l} className="text-primary-100"><b className="mr-1 text-lg font-extrabold text-white">{v}</b>{l}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="mb-12 mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="h-section">Popular services</h2>
              <p className="sub mt-1">Fixed pricing • Trained pros • Up to 30-day warranty</p>
            </div>
            <Link href="/services" className="text-sm font-bold text-primary-600 hover:text-primary-700">View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {(categories.length ? categories : [
              { id: "1", slug: "plumbing", name: "Plumber", icon: "🔧" },
              { id: "2", slug: "electrical", name: "Electrician", icon: "⚡" },
              { id: "3", slug: "ac-service", name: "AC Service", icon: "❄️" },
              { id: "4", slug: "home-cleaning", name: "Home Cleaning", icon: "🧹" },
              { id: "5", slug: "painting", name: "Painter", icon: "🎨" },
              { id: "6", slug: "pest-control", name: "Pest Control", icon: "🐛" },
            ]).map((c) => (
              <Link key={c.id} href={`/services?cat=${c.slug}`} className="card card-hover text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-[26px]">{c.icon}</div>
                <p className="text-sm font-bold text-ink">{c.name}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-accent-600">from ₹299 →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Partner banners: secondary ink + primary ── */}
        <section className="mb-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-ink p-6 text-white md:p-7">
            <p className="chip chip-accent mb-3">For Vendors</p>
            <h3 className="text-lg font-extrabold">Become a vendor, grow daily</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">Free listing • Genuine leads • Weekly payouts • Silver / Gold / Platinum growth plans.</p>
            <Link href="/auth/register?role=vendor" className="btn-accent mt-4 !py-2.5">Join as Vendor</Link>
          </div>
          <div className="rounded-3xl bg-primary-600 p-6 text-white md:p-7">
            <p className="chip mb-3 bg-white/15 text-white">For Agents</p>
            <h3 className="text-lg font-extrabold">Serve your city as Agent</h3>
            <p className="mt-1 text-sm leading-relaxed text-primary-100">Onboard vendors, resolve disputes, earn 5% commission on every city booking.</p>
            <Link href="/auth/register?role=agent" className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-primary-700 transition-all hover:bg-primary-50">Join as Agent</Link>
          </div>
        </section>

        {/* ── Vendors ── */}
        <section className="mb-12">
          <h2 className="h-section mb-1">Top-rated vendors near you</h2>
          <p className="sub mb-4">KYC-verified • Background-checked • Rated after every job</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {vendors.slice(0, 8).map((v) => (
              <div key={v.id} className="card card-hover">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-extrabold text-ink">{v.vendorProfile?.businessName ?? v.fullName}</p>
                  <span className="chip chip-accent shrink-0">★ {v.vendorProfile?.rating?.toFixed(1) ?? "4.5"}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{v.fullName} • {v.city}</p>
                <p className="mt-2 text-xs font-semibold text-body">{(v.vendorProfile?.totalReviews ?? 0)} reviews • {(v.vendorProfile?.serviceCategories ?? []).slice(0, 2).join(", ")}</p>
              </div>
            ))}
            {!vendors.length && <p className="sub">Vendor directory syncing… visit /directory for full list.</p>}
          </div>
        </section>

        {/* ── Cities ── */}
        <section className="mb-12">
          <h2 className="h-section mb-4">We are live in</h2>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Link key={c.slug} href={`/services`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-body transition-all hover:border-primary-300 hover:text-primary-700">
                {c.name} <span className="ml-1 hidden font-medium text-muted sm:inline">{c.pincodes}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mb-12 rounded-3xl border border-line bg-white p-6 md:p-8">
          <h2 className="h-section">How it works</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { n: "01", t: "Pick service & slot", d: "Choose from 54 genuine services, upfront price, preferred date/time.", c: "bg-primary-50 text-primary-700" },
              { n: "02", t: "Verified vendor assigned", d: "Nearest high-rated vendor accepts in minutes. Track live status.", c: "bg-accent-100 text-accent-600" },
              { n: "03", t: "Pay after work + rate", d: "UPI, card, wallet ya COD. Warranty + review system for trust.", c: "bg-success-soft text-success" },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-surface p-5">
                <p className={`inline-block rounded-lg px-2.5 py-1 text-xs font-extrabold ${s.c}`}>{s.n}</p>
                <p className="mt-2 font-extrabold text-ink">{s.t}</p>
                <p className="sub mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section>
          <h2 className="h-section mb-4">Customers love ADDies</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card">
                <p className="mb-2 text-sm font-bold text-accent-500">{"★".repeat(t.rating)}<span className="text-line">{"★".repeat(5 - t.rating)}</span></p>
                <p className="text-sm leading-relaxed text-body">“{t.text}”</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-[11px] font-extrabold text-white">{t.avatar}</span>
                  <p className="text-xs font-extrabold text-ink">{t.name} <span className="block font-medium text-muted">{t.city}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="page-container flex flex-col justify-between gap-4 py-8 text-sm text-muted md:flex-row">
          <p><b className="text-ink">ADDies Service Hub</b> — Apni ghar ki dukaan for every home service.</p>
          <div className="flex gap-5 font-semibold">
            <Link href="/about-us" className="transition-colors hover:text-primary-700">About</Link>
            <Link href="/contact-us" className="transition-colors hover:text-primary-700">Contact</Link>
            <Link href="/terms" className="transition-colors hover:text-primary-700">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-primary-700">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
