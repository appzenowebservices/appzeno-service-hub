import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

const SECTIONS = [
  ["Kya collect karte hain", "Name, mobile, email, city/state, addresses (house no, area, pincode), booking details, reviews, device/session logs. Vendors: business name, KYC docs, service areas, bank/UPI for payouts. Agents: assigned city, office address."],
  ["Kyun collect karte hain", "Matching (nearest vendor), notifications, payments/refunds, fraud prevention, analytics. Marketing SMS/WhatsApp only opt-in par. Kabhi data sell nahi karte."],
  ["Sharing", "Booking confirm hone par hi vendor ko name/mobile/address milta hai. Payment processors (Razorpay/UPI) ko txn data. Legal request par authorities ko. Aggregated stats (city revenue) mein personal data nahi."],
  ["Cookies & tracking", "Login session (NextAuth JWT, 7-day), preferences, analytics. Browser se cookies block kar sakte ho — login kaam nahi karega. Firebase push only permission par."],
  ["Rights", "Access / correction / deletion: support@addies.in par mobile se likhein, 7 din mein action. Account delete par bookings anonymised (legal records 3 yrs). Marketing opt-out one-tap."],
  ["Security", "Passwords bcrypt-hashed, MongoDB Atlas encrypted, role-based tRPC (admin/vendor/agent guards). Phishing se bachein — hum OTP/password kabhi nahi maangte."],
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader />
      <main className="page-container space-y-6 py-6">
        <PageHero eyebrow="Privacy Policy • Updated Jan 2026" title={<>Aapka data, <span className="text-accent-300">aapka haq</span></>} sub="Minimum collection, maximum transparency. Hindi mein simple bhasha." />
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
