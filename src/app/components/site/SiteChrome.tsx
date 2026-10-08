import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export function SiteHeader({ active }: { active?: string }) {
  const links = [
    { href: "/services", label: "Services" },
    { href: "/directory", label: "Vendors" },
    { href: "/pricing", label: "Pricing" },
    { href: "/how-it-works", label: "How It Works" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="ADDies Service Hub" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="leading-none">
            <span className="block text-[17px] font-extrabold tracking-tight text-ink">ADDies</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">Service Hub</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-body md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={active === l.href ? "text-primary-700" : "transition-colors hover:text-primary-700"}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="btn-ghost !px-5 !py-2">Login</Link>
          <Link href="/auth/register" className="btn-primary !px-5 !py-2">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="page-container grid gap-8 py-10 md:grid-cols-4">
        <div>
          <p className="font-extrabold text-ink">ADDies Service Hub</p>
          <p className="sub mt-2 !text-[13px]">Ghar ka har kaam — verified experts, upfront pricing, warranty. Live in 10 cities.</p>
          <p className="mt-3 inline-flex items-center gap-2"><span className="chip chip-primary">54 services</span><span className="chip chip-accent">4.8★ rated</span></p>
          <NewsletterForm />
        </div>
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted">Company</p>
          <div className="flex flex-col gap-2 text-sm font-semibold text-body">
            <Link href="/about-us" className="hover:text-primary-700">About us</Link>
            <Link href="/contact-us" className="hover:text-primary-700">Contact</Link>
            <Link href="/become-vendor" className="hover:text-primary-700">Become a vendor</Link>
            <Link href="/pricing" className="hover:text-primary-700">Pricing</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted">Explore</p>
          <div className="flex flex-col gap-2 text-sm font-semibold text-body">
            <Link href="/services" className="hover:text-primary-700">All services</Link>
            <Link href="/directory" className="hover:text-primary-700">Vendor directory</Link>
            <Link href="/cities" className="hover:text-primary-700">Cities</Link>
            <Link href="/faq" className="hover:text-primary-700">FAQ & Support</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted">Legal</p>
          <div className="flex flex-col gap-2 text-sm font-semibold text-body">
            <Link href="/terms" className="hover:text-primary-700">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary-700">Privacy Policy</Link>
            <Link href="/how-it-works" className="hover:text-primary-700">How it works</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="page-container flex flex-col justify-between gap-2 py-4 text-xs text-muted md:flex-row">
          <p>© 2026 ADDies Service Hub • Lucknow, Uttar Pradesh</p>
          <p>Primary Blue • Secondary Slate • Accent Amber</p>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-primary-900 px-6 py-10 md:px-10 md:py-12">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />
      <div className="relative">
        <p className="eyebrow !bg-white/10 !text-accent-200">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">{title}</h1>
        {sub && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-primary-100">{sub}</p>}
      </div>
    </section>
  );
}
