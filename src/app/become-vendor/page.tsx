import Link from "next/link";
import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

export default function BecomeVendorPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader />
      <main className="page-container space-y-6 py-6">
        <PageHero eyebrow="For vendors & mistris" title={<>Roz ke genuine leads, <span className="text-accent-300">weekly payouts</span></>} sub="Free listing start karo. Kaam accha → rating high → Gold/Platinum par unlimited leads." />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["01 • Register (2 min)", "Mobile + business name + categories + pincodes. Customer/ Agent se alag vendor KYC track.", "bg-primary-50 text-primary-700"],
            ["02 • KYC approve", "Aadhaar + address + skill proof. APPROVED hote hi leads ON. PENDING par waitlist.", "bg-accent-100 text-accent-600"],
            ["03 • Earn & grow", "ACCEPT → COMPLETE → payout har Friday. Silver ₹499 se start, Platinum par top listing.", "bg-success-soft text-success"],
          ].map(([t, d, c]) => (
            <div key={t} className="card">
              <p className={`inline-block rounded-lg px-2.5 py-1 text-xs font-extrabold ${c}`}>{t}</p>
              <p className="sub mt-2">{d}</p>
            </div>
          ))}
        </div>
        <div className="card flex flex-col justify-between gap-3 md:flex-row md:items-center !border-accent-200 !bg-accent-50">
          <div>
            <h2 className="h-section">Ready? Aaj hi 5 free leads paayein</h2>
            <p className="sub mt-1">Demo vendor: 9123456789 / Vendor@123 — dashboard mein leads + earnings live dekho.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/register?role=vendor" className="btn-accent">Join as vendor</Link>
            <Link href="/pricing" className="btn-ghost">Compare plans</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
