import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

const SECTIONS = [
  ["1. Services", "ADDies ek marketplace hai — customers ko independent vendors/agents se jodta hai. Hum directly service provide nahi karte, lekin KYC, matching, payments aur dispute support dete hain. 54 categories ke base prices indicative hain; final quote site-visit par confirm hota hai."],
  ["2. Bookings & payments", "Booking par visiting charge ₹99 + applicable surge lagta hai. Payment UPI/card/wallet/COD se. COMPLETED ke baad PAID mark hota hai; CANCELLED par REFUNDED policy ke hisaab se 3–5 din mein. Emergency slots par ₹100–150 surge ho sakta hai."],
  ["3. Cancellations", "Slot se 4 hrs pehle tak free cancellation. Uske baad visiting charge applicable. Vendor no-show par full refund + priority re-assign. Repeat false bookings par account review ho sakta hai."],
  ["4. Vendors", "Vendors ko KYC APPROVED + active rehna mandatory hai. PENDING/UNDER_REVIEW vendors ko leads nahi milte. Fake reviews, off-platform payments ya misconduct par suspension + payout hold. Subscription: Free (5 leads), Silver ₹499 (20), Gold ₹999 (60), Platinum ₹1999 (unlimited)."],
  ["5. Disputes", "DISPUTED status par agent 48 hrs mein mediate karta hai. Super Admin ka verdict final. Damage claims ke liye before/after photos mandatory. ₹45,000 se upar ke claims par field verification."],
  ["6. Liability", "Platform fee ~15% + GST. ADDies ki liability booking amount tak limited hai. Personal safety ke liye verified badge check karein, OTP share na karein."],
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader />
      <main className="page-container space-y-6 py-6">
        <PageHero eyebrow="Terms of Service • Updated Jan 2026" title={<>Seedhe-shabdon mein <span className="text-accent-300">niyam</span></>} sub="Short, readable terms. Detail mein doubt ho to support@addies.in par likhein." />
        <div className="card space-y-5">
          {SECTIONS.map(([t, d]) => (
            <div key={t}>
              <p className="font-extrabold text-ink">{t}</p>
              <p className="sub mt-1">{d}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
