import Link from "next/link";
import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

const PLANS = [
  { id: "free", name: "Free", fee: 0, leads: "5 leads / month", discount: "Standard commission", badge: false, features: ["5 leads per month", "Standard listing", "Basic profile", "Standard commission"], cta: "Start free" },
  { id: "silver", name: "Silver", fee: 499, leads: "20 leads / month", discount: "2% commission off", badge: true, features: ["20 leads per month", "Silver badge", "Priority over Free", "2% commission off", "WhatsApp alerts"], cta: "Choose Silver" },
  { id: "gold", name: "Gold", fee: 999, leads: "60 leads / month", discount: "5% commission off", badge: true, popular: true, features: ["60 leads per month", "Gold badge", "Priority over Silver", "5% commission off", "Analytics dashboard", "Featured in category"], cta: "Choose Gold" },
  { id: "platinum", name: "Platinum", fee: 1999, leads: "Unlimited leads", discount: "10% commission off", badge: true, features: ["Unlimited leads", "Platinum badge", "Top priority", "10% commission off", "Full analytics + insights", "Homepage feature", "Dedicated support"], cta: "Go Platinum" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader active="/pricing" />
      <main className="page-container space-y-6 py-6">
        <PageHero eyebrow="Vendor plans" title={<>Seedha pricing, <span className="text-accent-300">no hidden cut</span></>} sub="Customers ke liye booking free — vendors ke liye leads + commission discount. Cancel anytime." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => (
            <div key={p.id} className={`card card-hover flex flex-col ${p.popular ? "!border-accent-300 !bg-accent-50" : ""}`}>
              {p.popular && <span className="chip chip-accent mb-2 self-start">Most popular</span>}
              <p className="text-lg font-extrabold text-ink">{p.name}</p>
              <p className="mt-1"><span className="text-3xl font-extrabold text-ink">₹{p.fee}</span><span className="text-sm text-muted">/month</span></p>
              <p className="mt-1 text-xs font-bold text-primary-700">{p.leads} • {p.discount}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-body">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="font-bold text-success">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/auth/register?role=vendor" className={p.popular ? "btn-accent mt-5" : "btn-primary mt-5"}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <div className="card">
          <h2 className="h-section">Customer pricing kaise kaam karti hai?</h2>
          <p className="sub mt-2">Base price (sub-service) + ₹99 visiting + emergency surge (if any) = total. Pay after work via UPI/card/wallet/COD. 30-day support included.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
