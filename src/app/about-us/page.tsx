import Link from "next/link";
import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader active="/about-us" />
      <main className="page-container space-y-6 py-6">
        <PageHero
          eyebrow="About ADDies"
          title={<>Apni ghar ki dukaan — <span className="text-accent-300">har ghar tak</span> bharosa</>}
          sub="ADDies Service Hub 54 home services ko verified local vendors se jodta hai — upfront pricing, on-time arrival aur warranty ke saath. HQ Lucknow, live 10 cities mein."
        />

        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["54", "live services", "Plumbing se lekar CA tak"],
            ["20+", "verified vendors", "KYC + background-checked"],
            ["42+", "live bookings", "Har status transparent"],
            ["4.8★", "avg rating", "18 genuine reviews"],
          ].map(([v, l, s]) => (
            <div key={l} className="stat-card text-center">
              <p className="text-3xl font-extrabold text-primary-700">{v}</p>
              <p className="mt-1 text-sm font-extrabold text-ink">{l}</p>
              <p className="text-xs text-muted">{s}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card">
            <p className="eyebrow">Our promise</p>
            <h2 className="h-section mt-2">No jugad. Only genuine kaam.</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-body">
              <li><b className="text-ink">Upfront pricing:</b> har sub-service ka base price app par — visit ke baad koi hidden charge nahi.</li>
              <li><b className="text-ink">Verified pros:</b> Aadhaar + address + skill check. Pending/Under-review vendors ko leads nahi milte.</li>
              <li><b className="text-ink">Trackable jobs:</b> PENDING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED. Har step par notification.</li>
              <li><b className="text-ink">Warranty + reviews:</b> kaam ke baad rating, vendor reply aur 30-day service support.</li>
            </ul>
          </div>
          <div className="card !border-accent-200 !bg-accent-50">
            <p className="eyebrow !bg-accent-400 !text-accent-ink">For partners</p>
            <h2 className="h-section mt-2">Vendors aur Agents ke saath growth</h2>
            <p className="sub mt-2">Free listing se Platinum tak — leads, payouts aur analytics. Agents apne city ke vendors onboard karke 5% commission kamate hain.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/become-vendor" className="btn-accent">Become a vendor</Link>
              <Link href="/pricing" className="btn-ghost">See plans</Link>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="h-section">Leadership & support</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Super Admin", "Platform operations, Lucknow HQ", "9000000001"],
              ["City Agents (6)", "Jaipur • Lucknow • Delhi • Kanpur • Varanasi • Noida", "9988776655"],
              ["Support", "Mon–Sat, 9AM–8PM • Hindi + English", "support@addies.in"],
            ].map(([t, d, c]) => (
              <div key={t} className="rounded-2xl bg-surface p-4">
                <p className="font-extrabold text-ink">{t}</p>
                <p className="mt-1 text-sm text-body">{d}</p>
                <p className="mt-2 text-xs font-bold text-primary-700">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
