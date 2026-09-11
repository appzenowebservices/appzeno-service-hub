import Link from "next/link";
import { api } from "~/trpc/server";

export default async function DirectoryPage() {
  let vendors: { id: string; fullName: string; city: string; vendorProfile?: { businessName: string; rating: number; totalReviews: number; serviceCategories: string[]; subscriptionPlan: string } | null }[] = [];
  try {
    vendors = (await api.vendors.getApprovedVendors({ limit: 40 })) as typeof vendors;
  } catch {
    vendors = [];
  }
  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between">
          <Link href="/" className="text-[15px] font-extrabold text-ink">← ADDies</Link>
          <span className="chip chip-primary">{vendors.length} verified vendors</span>
        </div>
      </header>
      <main className="page-container py-6">
        <p className="eyebrow">KYC-verified only</p>
        <h1 className="h-section mt-2 !text-2xl">Vendor directory</h1>
        <p className="sub mb-5 mt-1">Background-checked pros • Rated after every job • Primary in blue, highlights in amber</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <div key={v.id} className="card card-hover">
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold text-ink">{v.vendorProfile?.businessName}</p>
                <span className="chip chip-accent shrink-0">★ {v.vendorProfile?.rating.toFixed(1)}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{v.fullName} • {v.city} • <span className="font-bold text-primary-700">{v.vendorProfile?.subscriptionPlan}</span></p>
              <p className="mt-2 text-xs font-semibold text-body">{v.vendorProfile?.totalReviews} reviews • {(v.vendorProfile?.serviceCategories ?? []).join(", ")}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
