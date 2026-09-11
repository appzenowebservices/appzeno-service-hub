import Link from "next/link";
import { api } from "~/trpc/server";

export default async function ServicesPage({ searchParams }: { searchParams?: Promise<{ cat?: string }> }) {
  const sp = searchParams ? await searchParams : undefined;
  let cats: { id: string; slug: string; name: string; icon: string; description?: string | null; commissionPercent: number; subCategories: { id: string; name: string; basePrice: number; unit: string }[] }[] = [];
  try {
    cats = await api.categories.getAll();
  } catch {
    cats = [];
  }
  const active = sp?.cat ? cats.find((c) => c.slug === sp.cat) : undefined;
  const list = active ? [active] : cats;

  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-extrabold text-ink">← ADDies <span className="chip chip-primary ml-1">{cats.length} live</span></Link>
          <Link href="/customer/dashboard" className="btn-primary !py-2">Book now</Link>
        </div>
      </header>
      <main className="page-container py-6">
        <p className="eyebrow">Fixed pricing • No hidden charges</p>
        <h1 className="h-section mt-2 !text-2xl">All services ({cats.length})</h1>
        <p className="sub mb-5 mt-1">Genuine upfront pricing • Verified vendors • Warranty included</p>
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((c) => (
            <div key={c.id} className="card card-hover">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-2xl">{c.icon}</span>
                <div>
                  <p className="font-extrabold text-ink">{c.name}</p>
                  <p className="text-xs font-semibold text-accent-600">★ 4.6 avg • {c.subCategories.length} options</p>
                </div>
              </div>
              <p className="sub mt-2 !text-[13px]">{c.description}</p>
              {c.subCategories.slice(0, 4).map((s) => (
                <div key={s.id} className="row-line flex justify-between text-sm">
                  <span className="text-body">{s.name} <span className="text-muted">• {s.unit}</span></span>
                  <span className="font-extrabold text-ink">₹{s.basePrice.toLocaleString("en-IN")}</span>
                </div>
              ))}
              <Link href={`/customer/dashboard?cat=${c.slug}`} className="btn-primary mt-3 !py-2 !text-xs">Book {c.name} →</Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
