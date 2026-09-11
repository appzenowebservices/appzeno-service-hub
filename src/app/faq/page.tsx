import Link from "next/link";
import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

const FAQS = [
  ["Booking kaise karein?", "Services → sub-service → date/slot → address → payment method. Customer dashboard mein live status dikhega: PENDING se COMPLETED tak."],
  ["Price final hai ya badhega?", "Base price + ₹99 visiting + surge (emergency only) = total, pehle se visible. Site par extra kaam nikle to vendor revised quote dega — accept karne par hi proceed hoga."],
  ["Vendor verified hai?", "Sirf KYC-APPROVED vendors ko leads milte hain. Profile par rating, total reviews, experience aur plan badge check karein."],
  ["Cancel / reschedule?", "Slot se 4 hrs pehle free. Uske baad visiting charge. My bookings se one-tap cancel."],
  ["Refund kitne din mein?", "CANCELLED → REFUNDED 3–5 working days source account mein. Wallet refunds instant."],
  ["Dispute ho to?", "Booking ko DISPUTED karein + photos add karein. City agent 48 hrs mein resolve karta hai, Super Admin verdict final."],
  ["Vendor kaise banein?", "Register → business + categories + pincodes → KYC upload. Approval ke baad leads start. Free mein 5 leads/month."],
  ["Login nahi ho raha?", "Mobile 10-digit + correct password. Demo: Customer 9876543210/Customer@123, Vendor 9123456789/Vendor@123, Admin 9000000001/Admin@123#."],
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader />
      <main className="page-container space-y-6 py-6">
        <PageHero eyebrow="FAQ & Support" title={<>Sawaal? <span className="text-accent-300">Jawaab ready</span></>} sub=" still stuck? support@addies.in — avg reply 2 hrs." />
        <div className="grid gap-3 md:grid-cols-2">
          {FAQS.map(([q, a]) => (
            <div key={q} className="card">
              <p className="font-extrabold text-ink">{q}</p>
              <p className="sub mt-1">{a}</p>
            </div>
          ))}
        </div>
        <div className="card flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <p className="font-extrabold text-ink">Human se baat karni hai? <span className="font-medium text-body">Mon–Sat 9AM–8PM</span></p>
          <div className="flex gap-2">
            <Link href="/contact-us" className="btn-primary">Contact support</Link>
            <Link href="/how-it-works" className="btn-ghost">How it works</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
