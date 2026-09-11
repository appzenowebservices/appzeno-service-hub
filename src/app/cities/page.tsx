import Link from "next/link";
import { SiteHeader, SiteFooter, PageHero } from "../components/site/SiteChrome";

const CITIES = [
  { name: "Lucknow", state: "Uttar Pradesh", pin: "226001 • 226010 • 226016", vendors: "6+", top: "Plumbing, AC Service", agent: "Priya Sharma", live: true },
  { name: "Delhi", state: "Delhi", pin: "110001 • 110085 • 110092", vendors: "4+", top: "Painting, Beauty", agent: "Rohit Verma", live: true },
  { name: "Noida", state: "Uttar Pradesh", pin: "201301 • 201305", vendors: "2+", top: "CCTV, Cleaning", agent: "Karan Singh", live: true },
  { name: "Kanpur", state: "Uttar Pradesh", pin: "208001 • 208002", vendors: "2+", top: "Packers, Electrical", agent: "Amit Tiwari", live: true },
  { name: "Varanasi", state: "Uttar Pradesh", pin: "221001 • 221010", vendors: "1+", top: "Purohit, Astrology", agent: "Deepak Mishra", live: true },
  { name: "Jaipur", state: "Rajasthan", pin: "302001 • 302017", vendors: "1+", top: "Events, Decor", agent: "Sunita Verma", live: true },
  { name: "Mumbai", state: "Maharashtra", pin: "400001 • 400058", vendors: "1+", top: "Carpentry", agent: "On request", live: true },
  { name: "Bangalore", state: "Karnataka", pin: "560001 • 560066", vendors: "1+", top: "Appliance Repair", agent: "On request", live: true },
  { name: "Hyderabad", state: "Telangana", pin: "500001 • 500081", vendors: "2+", top: "Nursing, Fitness", agent: "On request", live: true },
  { name: "Pune", state: "Maharashtra", pin: "411001 • 411038", vendors: "1+", top: "Pet Grooming", agent: "On request", live: true },
  { name: "Ahmedabad", state: "Gujarat", pin: "380001 • 380015", vendors: "1+", top: "CA & Tax", agent: "Coming soon", live: false },
  { name: "Barabanki", state: "Uttar Pradesh", pin: "225001 – 225006", vendors: "Expanding", top: "On request", agent: "Coming soon", live: false },
];

export default function CitiesPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <SiteHeader />
      <main className="page-container space-y-6 py-6">
        <PageHero eyebrow="10 cities live" title={<>Apne sheher mein <span className="text-accent-300">verified pros</span></>} sub="Har city mein dedicated agent, local pincodes aur genuine pricing." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((c) => (
            <div key={c.name} className="card card-hover">
              <div className="flex items-start justify-between">
                <p className="text-lg font-extrabold text-ink">{c.name}</p>
                <span className={`chip ${c.live ? "chip-success" : "chip-neutral"}`}>{c.live ? "Live" : "Soon"}</span>
              </div>
              <p className="text-xs font-semibold text-muted">{c.state} • {c.pin}</p>
              <p className="sub mt-2 !text-[13px]">Top: {c.top} • Vendors: {c.vendors}</p>
              <p className="mt-1 text-xs font-bold text-primary-700">Agent: {c.agent}</p>
              <Link href="/services" className="btn-ghost mt-3 !py-2 !text-xs">Explore {c.name} →</Link>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
