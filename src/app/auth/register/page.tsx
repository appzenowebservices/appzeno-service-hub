"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye, EyeOff, UserRound, Briefcase, Building2, Loader2, AlertCircle,
  BadgeCheck, Wallet, ShieldCheck, Banknote, CheckCircle2, ArrowRight, MapPin,
} from "lucide-react";
import { trpc } from "~/trpc/react";
import LocationPicker from "~/app/components/location/LocationPicker";
import { LOCATION_EVENT, loadLocation } from "~/app/components/location/location-store";

type Role = "CUSTOMER" | "VENDOR" | "AGENT";

const ROLES: { key: Role; label: string; Icon: typeof UserRound; param: string }[] = [
  { key: "CUSTOMER", label: "Customer", Icon: UserRound, param: "customer" },
  { key: "VENDOR", label: "Vendor", Icon: Briefcase, param: "vendor" },
  { key: "AGENT", label: "Agent", Icon: Building2, param: "agent" },
];

const ROLE_COPY: Record<Role, { badge: string; title: string; accent: string; sub: string; points: { t: string; d: string }[]; foot: [string, string][] }> = {
  CUSTOMER: {
    badge: "₹100 wallet bonus on signup",
    title: "Book trusted pros",
    accent: "in 60 seconds.",
    sub: "Cleaning, AC, salon, repairs & more at your doorstep — fixed pricing, live tracking, warranty in writing.",
    points: [
      { t: "50+ services, one app", d: "Upfront menu pricing. No bargaining, ever" },
      { t: "Live tracking + support", d: "Know exactly when your pro arrives" },
      { t: "Pay your way", d: "UPI, cards, wallet or cash after work" },
    ],
    foot: [["50k+", "bookings"], ["4.8★", "rated"], ["10", "cities"]],
  },
  VENDOR: {
    badge: "Zero joining fee • Weekly payouts",
    title: "Get genuine leads",
    accent: "every single day.",
    sub: "Free listing, verified customers, transparent pricing — plus training and kit support to grow faster.",
    points: [
      { t: "Earn ₹40k–₹80k/month", d: "Steady demand across 10 live cities" },
      { t: "KYC approval in 24–48 hrs", d: "Upload once, get verified fast" },
      { t: "Growth plans that scale", d: "Silver / Gold / Platinum visibility" },
    ],
    foot: [["2k+", "active pros"], ["₹55k", "avg. earnings"], ["0", "joining fee"]],
  },
  AGENT: {
    badge: "5% commission on every city booking",
    title: "Own the services business",
    accent: "in your city.",
    sub: "Onboard vendors, resolve disputes, watch your city grow — with analytics and payouts handled for you.",
    points: [
      { t: "Recurring city income", d: "Commission on every completed booking" },
      { t: "Vendor network = your asset", d: "Onboard pros, build your territory" },
      { t: "Full ops support", d: "Disputes, payouts and training included" },
    ],
    foot: [["5%", "commission"], ["10", "cities"], ["24h", "payout help"]],
  },
};

const POINT_ICONS = [BadgeCheck, Wallet, ShieldCheck];

// OmniPost mailing lists — new signups are subscribed here on registration (see below).
const AGENT_LIST_ID = "bdeb0103-2a84-4f0d-91ac-2ad99cc3c8c8";
const VENDOR_LIST_ID = "33158e14-a7e2-4de8-a485-88271adac9f8";
const CUSTOMER_LIST_ID = "353d86bf-26a5-4a92-a8a4-37186e656ad1";
const AGENT_SUBSCRIBE_URL = "https://omnipost.appzenowebservices.com/subscription/form";

async function subscribeMailingList(email: string, name: string, listId: string): Promise<void> {
  const fd = new FormData();
  fd.append("email", email);
  fd.append("name", name);
  fd.append("l", listId);
  fd.append("nonce", "");
  // fire-and-forget: subscription must never block registration
  await fetch(AGENT_SUBSCRIBE_URL, { method: "POST", body: fd, mode: "no-cors" });
}

function RegisterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const preset = (sp.get("role") ?? "customer").toLowerCase();
  const initialRole: Role = preset === "vendor" ? "VENDOR" : preset === "agent" ? "AGENT" : "CUSTOMER";

  const [role, setRole] = useState<Role>(initialRole);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");

  // Prefill the mobile when arriving from the login OTP verification flow.
  useEffect(() => {
    const pre = sp.get("mobile") ?? "";
    if (/^\d{10}$/.test(pre)) setMobile((m) => (m === "" ? pre : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [city, setCity] = useState("Lucknow");
  const [stateName, setStateName] = useState("Uttar Pradesh");
  const [businessName, setBusinessName] = useState("");
  const [experience, setExperience] = useState("2");
  const [cats, setCats] = useState<string[]>([]);
  const [officeAddress, setOfficeAddress] = useState("");
  const [agentNews, setAgentNews] = useState(true);
  const [vendorNews, setVendorNews] = useState(true);
  const [customerNews, setCustomerNews] = useState(true);
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Role | null>(null);

  const reg = trpc.auth.register.useMutation();
  const catsQ = trpc.categories.getAll.useQuery(undefined, { staleTime: 60_000 });
  // live catalog only — never fake chips. Empty DB = honest notice, not placeholders.
  const liveCats = ((catsQ.data as { slug: string; name: string; icon: string }[] | undefined) ?? []).map((c) => ({
    slug: c.slug, name: c.name, icon: c.icon,
  }));
  const catalogLive = liveCats.length > 0;

  // keep city/state in sync with the shared location picker
  useEffect(() => {
    const apply = (l: { city: string; state: string } | null) => {
      if (!l) return;
      setCity(l.city);
      if (l.state !== "") setStateName(l.state);
    };
    apply(loadLocation());
    const handler = (e: Event) => apply((e as CustomEvent<{ city: string; state: string }>).detail);
    window.addEventListener(LOCATION_EVENT, handler);
    return () => window.removeEventListener(LOCATION_EVENT, handler);
  }, []);

  function switchRole(r: Role) {
    setRole(r);
    setErr("");
    setDone(null);
    const param = ROLES.find((x) => x.key === r)?.param ?? "customer";
    router.replace(`${pathname}?role=${param}`, { scroll: false });
  }

  function toggleCat(slug: string) {
    setCats((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (fullName.trim().length < 2) return setErr("Please enter your full name.");
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) return setErr("Enter a valid 10-digit mobile number starting with 6–9.");
    const em = email.trim();
    if (em !== "" && !/\S+@\S+\.\S+/.test(em)) return setErr("Enter a valid email address (or leave it blank).");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");
    if (city.trim().length < 2) return setErr("Please choose your city.");
    if (role === "VENDOR") {
      if (businessName.trim().length < 2) return setErr("Please enter your business / shop name.");
      if (catalogLive && cats.length === 0) return setErr("Select at least one service you provide.");
    }
    if (!terms) return setErr("Please accept the Terms & Privacy Policy to continue.");

    const exp = Number(experience);
    try {
      await reg.mutateAsync({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: em === "" ? undefined : em,
        password,
        role,
        city: city.trim(),
        state: stateName.trim() === "" ? "—" : stateName.trim(),
        businessName: role === "VENDOR" ? businessName.trim() : undefined,
        serviceCategories: role === "VENDOR" ? cats : undefined,
        yearsOfExperience: role === "VENDOR" && Number.isInteger(exp) && exp >= 0 && exp <= 60 ? exp : undefined,
        officeAddress: role === "AGENT" && officeAddress.trim() !== "" ? officeAddress.trim() : undefined,
      });
      // Mailing-list subscribes fire HERE — immediately after account creation,
      // never after login: new accounts are unverified so the auto-signIn below
      // is expected to fail, and must not gate the subscription.
      if (role === "AGENT" && em !== "" && agentNews) {
        subscribeMailingList(em, fullName.trim(), AGENT_LIST_ID).catch(() => undefined);
      }
      if (role === "VENDOR" && em !== "" && vendorNews) {
        subscribeMailingList(em, fullName.trim(), VENDOR_LIST_ID).catch(() => undefined);
      }
      if (role === "CUSTOMER" && em !== "" && customerNews) {
        subscribeMailingList(em, fullName.trim(), CUSTOMER_LIST_ID).catch(() => undefined);
      }
      const r = await signIn("credentials", { redirect: false, mobile: mobile.trim(), password });
      // NOTE: subscribes fire BEFORE the auto-login below on purpose — new
      // accounts are unverified, so signIn is expected to fail and must never
      // gate the mailing-list subscription.
      if (r?.error) {
        router.push("/auth/login");
        return;
      }
      if (role === "CUSTOMER") {
        router.push("/customer/dashboard");
        router.refresh();
        return;
      }
      setDone(role);
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Registration failed. Please try again.");
    }
  }

  const copy = ROLE_COPY[role];

  // ── post-registration success (vendor / agent need approval context) ──
  if (done) {
    const isVendor = done === "VENDOR";
    return (
      <div className="grid min-h-screen bg-white font-sans lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-primary-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
          <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-primary-500/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-accent-400/20 blur-3xl" />
          <Link href="/" className="relative flex items-center gap-3">
            <Image src="/logo.png" alt="ADDies" width={44} height={44} className="h-11 w-11 rounded-2xl bg-white object-contain p-0.5" priority />
            <span className="leading-none">
              <span className="block text-xl font-extrabold tracking-tight">ADDies</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-accent-200">Service Hub</span>
            </span>
          </Link>
          <div className="relative max-w-lg">
            <p className="eyebrow !bg-white/10 !text-accent-200">{isVendor ? "Application received" : "Welcome aboard"}</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl">
              {isVendor ? "Verification takes" : "Your city journey"} <span className="text-accent-300">{isVendor ? "24–48 hours." : "starts now."}</span>
            </h1>
          </div>
          <p className="relative text-sm text-primary-200">Track status anytime from your dashboard.</p>
        </aside>
        <main className="flex items-center justify-center bg-surface px-4 py-10 sm:px-8">
          <div className="w-full max-w-md text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft"><CheckCircle2 size={30} className="text-success" /></span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
              {isVendor ? "Application submitted! 🎉" : "Agent account created! 🎉"}
            </h2>
            <p className="sub mx-auto mt-2 max-w-sm">
              {isVendor
                ? "Your KYC is now in the approval queue. Complete your profile (services, pricing, availability) so approval is instant."
                : "Your territory is assigned. Head to your dashboard to start onboarding vendors in your city."}
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href={isVendor ? "/vendor" : "/agent"} className="btn-primary w-full !py-3.5 !text-[15px]">
                {isVendor ? "Complete vendor profile →" : "Open agent dashboard →"}
              </Link>
              <Link href="/" className="btn-ghost w-full !py-3">Back to home</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-white font-sans lg:grid-cols-[1.05fr_1fr]">
      {/* ── Left: role-aware brand panel ── */}
      <aside className="relative hidden overflow-hidden bg-primary-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-primary-500/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-accent-400/20 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "26px 26px" }}
        />

        <Link href="/" className="relative flex items-center gap-3">
          <Image src="/logo.png" alt="ADDies" width={44} height={44} className="h-11 w-11 rounded-2xl bg-white object-contain p-0.5" priority />
          <span className="leading-none">
            <span className="block text-xl font-extrabold tracking-tight">ADDies</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-accent-200">Service Hub</span>
          </span>
        </Link>

        <div className="relative max-w-lg" key={role}>
          <p className="eyebrow !bg-white/10 !text-accent-200">{copy.badge}</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl">
            {copy.title} <span className="text-accent-300">{copy.accent}</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-primary-100">{copy.sub}</p>
          <ul className="mt-7 space-y-3.5">
            {copy.points.map((pt, i) => {
              const Icon = POINT_ICONS[i % POINT_ICONS.length] ?? BadgeCheck;
              return (
                <li key={pt.t} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur"><Icon size={18} className="text-accent-300" /></span>
                  <span>
                    <span className="block text-[15px] font-extrabold">{pt.t}</span>
                    <span className="block text-[13px] text-primary-200">{pt.d}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative flex items-center gap-5 text-[13px] font-semibold text-primary-100">
          {copy.foot.map(([v, l]) => (
            <span key={l}><b className="mr-1 text-lg font-extrabold text-white">{v}</b>{l}</span>
          ))}
        </div>
      </aside>

      {/* ── Right: form panel ── */}
      <main className="flex justify-center bg-surface px-4 py-8 sm:px-8 lg:items-center lg:py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-5 flex items-center gap-2.5 lg:hidden">
            <Image src="/logo.png" alt="ADDies" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="leading-none">
              <span className="block text-[17px] font-extrabold tracking-tight text-ink">ADDies</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">Service Hub</span>
            </span>
          </Link>

          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Create your account</h2>
          <p className="sub mt-1.5">
            {role === "VENDOR" ? "Free listing • approval in 24–48 hrs • weekly payouts." : role === "AGENT" ? "5% commission • your city, your network." : "₹100 wallet bonus • book in 60 seconds."}
          </p>

          {/* role switch */}
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-white p-1.5">
            {ROLES.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchRole(key)}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[13px] font-extrabold transition-all ${role === key ? "bg-primary-600 text-white shadow-sm" : "text-body hover:bg-surface hover:text-primary-700"}`}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-3.5">
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-[13px] font-extrabold text-ink">Full name</label>
              <input id="reg-name" required placeholder="e.g. Rahul Verma" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input !py-3" autoComplete="name" />
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-mobile" className="mb-1.5 block text-[13px] font-extrabold text-ink">Mobile</label>
                <input id="reg-mobile" required inputMode="numeric" placeholder="10-digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} className="input !py-3 font-medium tracking-wide" autoComplete="tel" />
              </div>
              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-[13px] font-extrabold text-ink">Email <span className="font-semibold text-muted">(optional)</span></label>
                <input id="reg-email" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input !py-3" autoComplete="email" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-pass" className="mb-1.5 block text-[13px] font-extrabold text-ink">Password</label>
                <div className="relative">
                  <input id="reg-pass" required type={showPass ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="input !py-3 pr-11" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reg-confirm" className="mb-1.5 block text-[13px] font-extrabold text-ink">Confirm</label>
                <input id="reg-confirm" required type={showPass ? "text" : "password"} placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input !py-3" autoComplete="new-password" />
              </div>
            </div>

            {/* city via shared location picker */}
            <div>
              <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-extrabold text-ink"><MapPin size={14} className="text-primary-600" /> Your city</span>
              <LocationPicker variant="hero" />
              <p className="mt-1.5 text-xs font-medium text-muted">Selected: <b className="text-ink">{city}</b>{stateName !== "" ? `, ${stateName}` : ""} — pros & pricing depend on it.</p>
            </div>

            {/* ── vendor extras ── */}
            {role === "VENDOR" && (
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted">Vendor profile</p>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1.4fr_1fr]">
                  <div>
                    <label htmlFor="reg-biz" className="mb-1.5 block text-[13px] font-extrabold text-ink">Business name</label>
                    <input id="reg-biz" required placeholder="e.g. Kumar Plumbing Works" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input !py-3" />
                  </div>
                  <div>
                    <label htmlFor="reg-exp" className="mb-1.5 block text-[13px] font-extrabold text-ink">Experience (yrs)</label>
                    <input id="reg-exp" inputMode="numeric" placeholder="2" value={experience} onChange={(e) => setExperience(e.target.value.replace(/\D/g, "").slice(0, 2))} className="input !py-3" />
                  </div>
                </div>
                <p className="mb-2 mt-4 text-[13px] font-extrabold text-ink">Services you provide {catalogLive ? <span className="font-semibold text-muted">(min 1)</span> : null}</p>
                {catalogLive ? (
                <div className="flex flex-wrap gap-1.5">
                  {liveCats.map((c) => {
                    const active = cats.includes(c.slug);
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => toggleCat(c.slug)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${active ? "border-primary-600 bg-primary-600 text-white shadow-sm" : "border-line bg-surface text-body hover:border-primary-300 hover:text-primary-700"}`}
                      >
                        {c.icon !== "" ? `${c.icon} ` : ""}{c.name}
                      </button>
                    );
                  })}
                </div>
                ) : (
                <p className="rounded-xl bg-surface px-3.5 py-2.5 text-[13px] font-medium text-muted">Service catalog is being set up — register now, and our team will assign your services during KYC verification.</p>
                )}
                <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface px-3.5 py-2.5 text-[13px] font-medium text-body">
                  <input type="checkbox" checked={vendorNews} onChange={(e) => setVendorNews(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary-600" />
                  <span>Email me lead alerts, vendor offers & policy updates <span className="text-muted">(service.apnidesidukaan-vendors)</span></span>
                </label>
              </div>
            )}

            {/* ── agent extras ── */}
            {role === "AGENT" && (
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted">Agent details</p>
                <label htmlFor="reg-office" className="mb-1.5 block text-[13px] font-extrabold text-ink">Office address <span className="font-semibold text-muted">(optional)</span></label>
                <input id="reg-office" placeholder={`e.g. MG Road, ${city}`} value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} className="input !py-3" />
                <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-muted"><Banknote size={13} className="mt-0.5 shrink-0 text-success" /> Territory auto-assigned: <b className="text-ink">{city}</b> at 5% commission.</p>
                <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface px-3.5 py-2.5 text-[13px] font-medium text-body">
                  <input type="checkbox" checked={agentNews} onChange={(e) => setAgentNews(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary-600" />
                  <span>Email me agent updates, city launches & payout news <span className="text-muted">(service.apnidesidukaan-agents)</span></span>
                </label>
              </div>
            )}

            {role === "CUSTOMER" && (
              <>
              <p className="flex items-start gap-1.5 rounded-xl bg-success-soft px-3.5 py-2.5 text-[13px] font-semibold text-success">
                <Wallet size={15} className="mt-0.5 shrink-0" /> ₹100 welcome bonus lands in your wallet the moment you join.
              </p>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface px-3.5 py-2.5 text-[13px] font-medium text-body">
                <input type="checkbox" checked={customerNews} onChange={(e) => setCustomerNews(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary-600" />
                <span>Email me new services, offers & booking updates <span className="text-muted">(service.apnidesidukaan-customers)</span></span>
              </label>
              </>
            )}

            <label className="flex cursor-pointer items-start gap-2.5 text-[13px] font-medium text-body">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary-600" />
              <span>I agree to the <Link href="/terms" className="font-bold text-primary-600 hover:underline">Terms</Link> & <Link href="/privacy" className="font-bold text-primary-600 hover:underline">Privacy Policy</Link>{role === "VENDOR" ? " and understand my profile needs KYC approval before I receive leads." : "."}</span>
            </label>

            {err !== "" && (
              <p className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft p-3 text-[13px] font-semibold text-danger">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />{err}
              </p>
            )}

            <button type="submit" disabled={reg.isPending} className="btn-primary w-full !py-3.5 !text-[15px] disabled:opacity-60">
              {reg.isPending ? <><Loader2 size={17} className="animate-spin" /> Creating account…</> : <>Create {role === "CUSTOMER" ? "customer" : role === "VENDOR" ? "vendor" : "agent"} account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-5 flex items-center justify-center gap-4 text-[13px] font-semibold text-muted">
            <span>Already registered?</span>
            <Link href="/auth/login" className="inline-flex items-center gap-1 font-extrabold text-primary-600 hover:text-primary-700">Login →</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
