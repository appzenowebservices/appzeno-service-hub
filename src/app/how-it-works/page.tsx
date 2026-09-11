import Link from "next/link";
import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

const STEPS = [
  { n: "01", t: "Service + slot choose karein", d: "54 services mein se chunein — har sub-service ka fixed base price, unit aur warranty clearly likha hai. Date + 9AM–12PM / 2PM–5PM slot select karein.", tag: "Customer", cls: "bg-primary-50 text-primary-700" },
  { n: "02", t: "Verified vendor assign hota hai", d: "System nearest high-rated, KYC-APPROVED vendor ko lead bhejta hai. Vendor ACCEPT karta hai → ASSIGNED → IN_PROGRESS. Aapko har step par notification milta hai.", tag: "Matching", cls: "bg-accent-100 text-accent-600" },
  { n: "03", t: "Kaam + transparent payment", d: "Kaam complete hone par UPI / card / wallet / COD se pay karein. Visiting charge ₹99 + surge (emergency) sab bill mein itemised.", tag: "Payment", cls: "bg-success-soft text-success" },
  { n: "04", t: "Rate karein, warranty paayein", d: "1–5★ review + comment. Low rating par agent intervene karta hai. 30-day service support aur DISPUTED bookings par 48-hr resolution.", tag: "Trust", cls: "bg-primary-50 text-primary-700" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader active="/how-it-works" />
      <main className="page-container space-y-6 py-6">
        <PageHero eyebrow="How it works" title={<>3 tap mein booking, <span className="text-accent-300">zero tension</span></>} sub="Customer, vendor aur agent — teeno ka flow transparent. Sab kuch app mein track hota hai." />
        <div className="grid gap-3 md:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.n} className="card card-hover">
              <p className={`inline-block rounded-lg px-2.5 py-1 text-xs font-extrabold ${s.cls}`}>{s.n} • {s.tag}</p>
              <h2 className="mt-2 text-lg font-extrabold text-ink">{s.t}</h2>
              <p className="sub mt-1">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="card flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="h-section">Try karo — pehli booking par wallet bonus</h2>
            <p className="sub mt-1">New customers ko ₹100 welcome bonus. Demo se login karke live bookings dekho.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/services" className="btn-accent">Browse services</Link>
            <Link href="/auth/login" className="btn-ghost">Demo login</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
