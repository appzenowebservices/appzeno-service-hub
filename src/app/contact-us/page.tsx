import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader />
      <main className="page-container space-y-6 py-6">
        <PageHero
          eyebrow="Contact us"
          title={<>Baat karein — <span className="text-accent-300">hum sun rahe hain</span></>}
          sub="Booking help, vendor onboarding ya dispute — Hindi ya English mein. Avg reply 2 hrs (9AM–8PM)."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card">
            <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Customer support</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">1800-xxx-xxxx</p>
            <p className="sub mt-1">Toll-free • Mon–Sat 9AM–8PM</p>
            <p className="mt-3 text-sm font-bold text-primary-700">support@addies.in</p>
          </div>
          <div className="card">
            <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Vendor helpdesk</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">Leads & payouts</p>
            <p className="sub mt-1">KYC, subscription (Silver/Gold/Platinum), weekly settlements</p>
            <p className="mt-3 text-sm font-bold text-primary-700">vendors@addies.in</p>
          </div>
          <div className="card !border-accent-200 !bg-accent-50">
            <p className="text-xs font-extrabold uppercase tracking-wider text-accent-600">HQ — Lucknow</p>
            <p className="mt-2 font-extrabold text-ink">ADDies Service Hub, Gomti Nagar, Lucknow 226010</p>
            <p className="sub mt-1">Walk-in: Mon–Fri 10AM–6PM with appointment</p>
            <p className="mt-3 text-sm font-bold text-accent-600">Uttar Pradesh, India</p>
          </div>
        </div>

        <div className="card">
          <h2 className="h-section">Quick help by topic</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Booking track karni hai", "My bookings → status live dekhein", "/customer/dashboard"],
              ["Refund / dispute", "DISPUTED mark karein, 48 hrs resolution", "/faq"],
              ["Vendor banna hai", "Free listing, 2-min KYC start", "/become-vendor"],
              ["City agent", "Apne sheher ka network grow karein", "/auth/register?role=agent"],
            ].map(([t, d, h]) => (
              <a key={t} href={h} className="rounded-2xl bg-surface p-4 transition-all hover:border-primary-200 hover:bg-primary-50">
                <p className="font-extrabold text-ink">{t}</p>
                <p className="mt-1 text-sm text-body">{d}</p>
              </a>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
