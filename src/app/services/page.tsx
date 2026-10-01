import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/server";

type Cat = {
  id: string; slug: string; name: string; icon: string; image?: string | null; description?: string | null;
  rating: number; totalBookings: number; commissionPercent: number;
  subCategories: { id: string; name: string; basePrice: number; unit: string }[];
};

export default async function ServicesPage({ searchParams }: { searchParams?: Promise<{ cat?: string }> }) {
  const sp = searchParams ? await searchParams : undefined;
  let cats: Cat[] = [];
  try {
    cats = await api.categories.getAll();
  } catch {
    cats = [];
  }
  const active = sp?.cat ? cats.find((c) => c.slug === sp.cat) : undefined;
  const list = active ? [active] : cats;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fmtCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`);

  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-extrabold text-ink">← <b>ADDies</b> <span className="chip chip-primary ml-1">{cats.length} services live</span></Link>
          <Link href="/customer/booking" className="btn-primary !py-2">Book now</Link>
        </div>
      </header>

      <main className="page-container py-6">
        <p className="eyebrow">Fixed pricing • No hidden charges</p>
        <h1 className="h-section mt-2 !text-2xl">{active ? active.name : "Home services, all in one place"}</h1>
        <p className="sub mb-5 mt-1">Upfront menu pricing • KYC-verified pros • Up to 30-day warranty</p>

        {list.length === 0 ? (
          <div className="card flex flex-col items-center gap-1.5 py-12 text-center">
            <p className="font-extrabold text-ink">Service menu coming soon</p>
            <p className="max-w-sm text-sm text-muted">Our team is finalizing services and fixed pricing for your city. Please check back shortly.</p>
            <Link href="/" className="btn-ghost mt-2 !py-2 text-[13px]">Back to home</Link>
          </div>
        ) : null}

        {/* category filter chips */}
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
          <Link href="/services" className={`tab-pill shrink-0 !px-4 !py-1.5 !text-xs ${!active ? "tab-pill-active" : "tab-pill-idle"}`}>All</Link>
          {cats.map((c) => (
            <Link key={c.slug} href={`/services?cat=${c.slug}`} className={`tab-pill shrink-0 !px-4 !py-1.5 !text-xs ${active?.slug === c.slug ? "tab-pill-active" : "tab-pill-idle"}`}>
              {c.icon === "" ? "" : c.icon} {c.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const min = c.subCategories.length ? Math.min(...c.subCategories.map((s) => s.basePrice)) : 0;
            return (
              <article key={c.id} className="group card card-hover flex flex-col overflow-hidden !p-0">
                {/* banner */}
                <div className="relative h-32 shrink-0 overflow-hidden bg-gradient-to-br from-primary-800 via-primary-900 to-ink">
                  {c.image ? (
                    <Image src={c.image} alt={c.name} fill sizes="(max-width:768px) 100vw, 400px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-6xl">{c.icon === "" ? "✨" : c.icon}</span>
                  )}
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/10" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                    <h2 className="text-lg font-extrabold text-white drop-shadow">{c.name}</h2>
                    <span className="chip chip-accent shrink-0">★ {c.rating > 0 ? c.rating.toFixed(1) : "New"}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="sub !text-[13px]">{c.description ?? `${c.subCategories.length} options with fixed pricing`}</p>
                  <div className="mt-3 flex-1 space-y-1.5">
                    {c.subCategories.slice(0, 4).map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-body">{s.name} <span className="text-muted">• {s.unit}</span></span>
                        <span className="shrink-0 font-extrabold text-ink">{fmt(s.basePrice)}</span>
                      </div>
                    ))}
                    {c.subCategories.length > 4 ? <p className="text-xs font-semibold text-muted">+{c.subCategories.length - 4} more options</p> : null}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs font-bold text-muted">
                      {min > 0 ? <>from <b className="text-lg text-ink">{fmt(min)}</b></> : "Pricing on quote"}
                      {c.totalBookings > 0 ? <span className="block">{fmtCount(c.totalBookings)} booked</span> : null}
                    </p>
                    <Link href="/customer/booking" className="btn-primary !px-4 !py-2 !text-xs">Book now →</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}