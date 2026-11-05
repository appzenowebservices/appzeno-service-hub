"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Store, LogOut, ShieldCheck, MapPin, ChevronRight,
  X, ArrowUpRight, Bell, Check, TrendingUp, Briefcase, IndianRupee, Search, UserCheck, MapPinned,
  ClipboardList, Clock, Loader2, Phone,
} from "lucide-react";
import { trpc } from "~/trpc/react";
import BrandedLoader from "~/app/components/common/BrandedLoader";
import { BookingTimeline } from "~/app/components/booking/BookingTimeline";
import { allowedNextStatuses } from "~/lib/booking-flow";

type Tab = "overview" | "vendors" | "bookings" | "area";

interface AreaVendor {
  id: string; fullName: string; mobile: string; city: string; isActive: boolean; isVerified: boolean;
  vendorProfile: { businessName: string | null; kycStatus: string; isApproved: boolean; rating: number; totalReviews: number; serviceAreaPincodes: string[]; totalJobs: number };
}

interface AgentBookingEvent {
  id: string; status: string; action?: string | null; actorRole: string; note?: string | null; createdAt: string | Date;
}
interface AgentBooking {
  id: string; status: string; description: string; totalAmount: number; pincode?: string | null; city?: string | null;
  vendorId?: string | null;
  address?: { area?: string; city?: string; pincode?: string; houseNo?: string } | null;
  createdAt?: string | Date;
  customer?: { fullName?: string; mobile?: string } | null;
  vendor?: { id: string; fullName: string; vendorProfile?: { businessName?: string } | null } | null;
  agent?: { fullName?: string } | null;
  events?: AgentBookingEvent[];
}
interface EligibleVendor {
  id: string; fullName: string; businessName: string; city: string; rating: number; totalReviews: number;
  pincodes: string[]; pincodeMatch: boolean; cityMatch: boolean;
}

const STATUS_CHIP: Record<string, string> = {
  PENDING: "chip chip-accent",
  ASSIGNED: "chip chip-primary",
  ACCEPTED: "chip chip-primary",
  IN_PROGRESS: "chip chip-primary",
  COMPLETED: "chip chip-success",
  CANCELLED: "chip chip-neutral",
  DISPUTED: "chip chip-danger",
};

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function AgentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sUser = session?.user;
  const role = (((sUser as { role?: string } | undefined)?.role) ?? "").toUpperCase();
  const agentId = sUser?.id ?? "";

  // Route-driven tabs: /agent, /agent/vendors, /agent/bookings, /agent/area.
  const params = useParams();
  const rawSection = params?.section;
  const sectionParam = Array.isArray(rawSection) ? rawSection[0] : rawSection;
  const TAB_KEYS: Tab[] = ["overview", "vendors", "bookings", "area"];
  const tab: Tab = sectionParam && TAB_KEYS.includes(sectionParam as Tab) ? (sectionParam as Tab) : "overview";
  const goTab = (t: Tab) => router.push(t === "overview" ? "/agent" : `/agent/${t}`);
  const [pinErr, setPinErr] = useState("");
  const [street, setStreet] = useState("");
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState<"confirm" | "signedout" | null>(null);
  const [bookingFilter, setBookingFilter] = useState<"all" | "unassigned" | "active" | "completed">("all");
  const [selectedBooking, setSelectedBooking] = useState<AgentBooking | null>(null);
  const [assignVendorId, setAssignVendorId] = useState("");
  const [agentNote, setAgentNote] = useState("");

  const areaQ = trpc.agents.area.useQuery(undefined, { enabled: !!agentId && status === "authenticated" });
  const statsQ = trpc.agents.areaStats.useQuery(undefined, { enabled: !!agentId && status === "authenticated" });
  const vendorsQ = trpc.agents.areaVendors.useQuery(undefined, { enabled: !!agentId && status === "authenticated" });
  const bookingsQ = trpc.bookings.getByAgent.useQuery({ limit: 50 }, { enabled: !!agentId && status === "authenticated" });
  const bookingDetailQ = trpc.bookings.getById.useQuery(
    { id: selectedBooking?.id ?? "" },
    { enabled: !!selectedBooking },
  );
  const eligibleQ = trpc.bookings.eligibleVendors.useQuery(
    { bookingId: selectedBooking?.id ?? "" },
    { enabled: !!selectedBooking },
  );
  const assignVendor = trpc.bookings.assignVendor.useMutation({
    onSuccess: () => {
      void bookingsQ.refetch();
      void bookingDetailQ.refetch();
      setAssignVendorId("");
      setAgentNote("");
    },
    onError: (e) => alert(e.message),
  });
  const updateStatus = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      void bookingsQ.refetch();
      setSelectedBooking(null);
    },
    onError: (e) => alert(e.message),
  });
  const setArea = trpc.agents.setServiceArea.useMutation({ onSuccess: () => areaQ.refetch() });
  const setAddress = trpc.areas.setAddress.useMutation({ onSuccess: () => { areaQ.refetch(); setStreet(""); } });
  const notifQ = trpc.admin.notifications.useQuery({ limit: 10 }, { enabled: !!agentId && status === "authenticated" });
  const markRead = trpc.admin.markNotificationRead.useMutation({ onSuccess: () => notifQ.refetch() });
  const [notifOpen, setNotifOpen] = useState(false);

  const performLogout = () => {
    setLoggingOut("signedout");
    window.setTimeout(() => signOut({ callbackUrl: "/" }), 1200);
  };

  const area = areaQ.data as { city?: string; pincodes?: string[]; streetAddress?: string | null; commissionPercent?: number; fullName?: string; avatar?: string | null; isVerified?: boolean } | undefined;
  const agentInitials = (area?.fullName ?? "?").split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const servingQ = trpc.areas.byCity.useQuery({ city: area?.city ?? "" }, { enabled: !!area?.city && !!area?.streetAddress });
  const serving = servingQ.data as { city?: string; pincodes?: string[]; isActive?: boolean } | null | undefined;
  const canPickArea = !!area?.streetAddress;
  const stats = statsQ.data as { areaVendors?: number; approvedVendors?: number; pendingKyc?: number; areaBookings?: number; commissionPercent?: number } | undefined;
  const vendors = useMemo(() => {
    const list = ((vendorsQ.data as { vendors?: AreaVendor[] } | undefined)?.vendors ?? []);
    const q = search.trim().toLowerCase();
    if (q === "") return list;
    return list.filter((v) => v.fullName.toLowerCase().includes(q) || (v.vendorProfile?.businessName ?? "").toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || v.mobile.includes(q));
  }, [vendorsQ.data, search]);
  const notifications = useMemo(() => ((notifQ.data as { id: string; title: string; message: string; isRead: boolean; createdAt: string | Date }[] | undefined) ?? []), [notifQ.data]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pincodes = area?.pincodes ?? [];
  const bookings = useMemo(() => {
    const list = (bookingsQ.data as AgentBooking[] | undefined) ?? [];
    if (bookingFilter === "unassigned") return list.filter((b) => !b.vendorId);
    if (bookingFilter === "active") return list.filter((b) => ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(b.status));
    if (bookingFilter === "completed") return list.filter((b) => ["COMPLETED", "CANCELLED", "DISPUTED"].includes(b.status));
    return list;
  }, [bookingsQ.data, bookingFilter]);
  const eligibleVendors = (eligibleQ.data as EligibleVendor[] | undefined) ?? [];
  const activeBooking = (bookingDetailQ.data as AgentBooking | undefined) ?? selectedBooking;

  // Must stay below every hook (auth-dependent early returns above would
  // otherwise change the hook order between loading and authenticated renders).
  if (status === "loading") return <BrandedLoader />;
  if (status !== "authenticated" || (role !== "AGENT" && role !== "ADMIN"))
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold">Agent login required</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Login</button>
      </div>
    );

  const NAV: { key: Tab; label: string; Icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: "Area Overview", Icon: LayoutDashboard },
    { key: "vendors", label: "My Vendors", Icon: Store },
    { key: "bookings", label: "Area Bookings", Icon: ClipboardList },
    { key: "area", label: "Manage Area", Icon: MapPinned },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink text-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
          <Image src="/logo.png" alt="ADDies" width={36} height={36} className="h-9 w-9 rounded-xl bg-white object-contain p-0.5" />
          <div className="leading-none">
            <p className="truncate text-[15px] font-extrabold">Agent Console</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300">{area?.city ?? "Your city"}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map(({ key, label, Icon }) => (
            <Link key={key} href={key === "overview" ? "/agent" : `/agent/${key}`} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ${tab === key ? "bg-white text-ink shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={17} className={tab === key ? "text-primary-600" : ""} />
              <span className="flex-1 text-left">{label}</span>
              {tab === key ? <ChevronRight size={14} className="text-muted" /> : null}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            <ArrowUpRight size={12} className="mr-2" /> View storefront
          </Link>
          <div className="relative">
            <button onClick={() => setNotifOpen((o) => !o)} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
              <span className="relative"><Bell size={17} />{unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-extrabold text-white">{unreadCount}</span> : null}</span>
              Notifications
            </button>
          </div>
          <button onClick={() => setLoggingOut("confirm")} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-danger hover:bg-danger-soft">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-line bg-white/95 px-6 py-3 backdrop-blur lg:flex">
          <div className="flex items-center gap-3">
            {area?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={area.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-100" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-xs font-extrabold text-primary-700 ring-1 ring-primary-100">{agentInitials}</span>
            )}
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-ink">Namaste, {area?.fullName?.split(" ")[0] ?? "Agent"} 👋</h1>
              <p className="text-xs font-medium text-muted">{area?.city ?? ""} • {pincodes.length} pincodes in your area</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" className="relative rounded-full border border-line bg-white p-2.5 text-body shadow-sm hover:border-primary-300 hover:text-primary-700">
              <Bell size={18} />
              {unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-extrabold text-white">{unreadCount}</span> : null}
            </button>
            <span className="chip chip-success hidden sm:inline-flex">● Online</span>
          </div>
        </header>

        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center gap-2 px-3">
            <Image src="/logo.png" alt="ADDies" width={30} height={30} className="h-8 w-8 object-contain" />
            <p className="truncate text-sm font-extrabold text-ink">Agent • {area?.city ?? ""}</p>
            <button onClick={() => setNotifOpen((o) => !o)} className="relative ml-auto rounded-full p-2 text-muted hover:bg-surface hover:text-ink">
              <Bell size={18} />
              {unreadCount > 0 ? <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[8px] font-extrabold text-white">{unreadCount}</span> : null}
            </button>
            <button onClick={() => setLoggingOut("confirm")} className="rounded-full px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger-soft">Logout</button>
          </div>
          <nav className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2.5">
            {NAV.map(({ key, label }) => (
              <Link key={key} href={key === "overview" ? "/agent" : `/agent/${key}`} className={`tab-pill shrink-0 !text-[13px] ${tab === key ? "tab-pill-active" : "tab-pill-idle"}`}>{label}</Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl space-y-4 p-4 lg:p-6">
          {/* area not configured banner */}
          {pincodes.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-accent-200 bg-accent-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-400 text-accent-ink"><MapPin size={20} /></span>
                <div>
                  <p className="text-sm font-extrabold text-accent-ink">Set your service-area pincodes to monitor vendors</p>
                  <p className="text-xs font-medium text-accent-600">Vendors serving these pincodes automatically fall under your area.</p>
                </div>
              </div>
              <button onClick={() => goTab("area")} className="btn-accent !py-2">Add pincodes <ChevronRight size={14} /></button>
            </div>
          ) : null}

          {/* ═══════ OVERVIEW ═══════ */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { icon: Store, l: "Vendors in area", v: `${stats?.areaVendors ?? 0}`, sub: `${stats?.approvedVendors ?? 0} approved` },
                  { icon: UserCheck, l: "Pending KYC", v: `${stats?.pendingKyc ?? 0}`, sub: "needs action" },
                  { icon: Briefcase, l: "Area bookings", v: `${stats?.areaBookings ?? 0}`, sub: "active" },
                  { icon: IndianRupee, l: "Your commission", v: `${stats?.commissionPercent ?? 0}%`, sub: "on area GMV" },
                ].map((s) => (
                  <div key={s.l} className="stat-card">
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted"><s.icon size={13} />{s.l}</p>
                    <p className="mt-1 text-2xl font-extrabold text-ink">{s.v}</p>
                    <p className="mt-0.5 text-xs font-semibold text-muted">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-extrabold text-ink">Vendors under you</p>
                  <button onClick={() => goTab("vendors")} className="text-[13px] font-bold text-primary-600">Manage →</button>
                </div>
                {(vendorsQ.data as { vendors?: AreaVendor[] } | undefined)?.vendors?.length ? (
                  <div className="space-y-2">
                    {(vendorsQ.data as { vendors?: AreaVendor[] } | undefined)?.vendors?.slice(0, 6).map((v) => (
                      <div key={v.id} className="row-line flex flex-wrap items-center justify-between gap-2 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">{v.vendorProfile?.businessName ?? v.fullName} <span className={`chip ml-1 ${v.vendorProfile?.isApproved ? "chip-success" : "chip-accent"}`}>{v.vendorProfile?.isApproved ? "Approved" : v.vendorProfile?.kycStatus ?? "PENDING"}</span></p>
                          <p className="text-xs text-muted">{v.fullName} • {v.city} • ★{(v.vendorProfile?.rating ?? 0).toFixed(1)} • {v.vendorProfile?.totalJobs ?? 0} jobs</p>
                        </div>
                        <span className={v.isActive ? "chip chip-success shrink-0" : "chip chip-danger shrink-0"}>{v.isActive ? "● Active" : "○ Inactive"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sub py-6 text-center">No vendors in your area yet — set pincodes in Manage Area and vendors serving them will appear here.</p>
                )}
              </div>
            </>
          )}

          {/* ═══════ VENDORS ═══════ */}
          {tab === "vendors" && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] font-bold text-muted">
                  <b className="text-ink">{vendors.length}</b> vendors in your area
                  <span className="chip chip-success ml-2">{vendors.filter((v) => v.vendorProfile?.isApproved && v.isActive).length} fully live</span>
                </p>
                <label className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendor, business, city…" className="input !pl-9 !py-2" />
                </label>
              </div>
              {vendors.length === 0 ? (
                <div className="card"><p className="sub py-8 text-center">No vendors match in your area — check your pincodes under Manage Area.</p></div>
              ) : (
                <div className="grid gap-2.5 lg:grid-cols-2">
                  {vendors.map((v) => (
                    <div key={v.id} className="card card-hover !p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white ${v.vendorProfile?.isApproved && v.isActive ? "bg-gradient-to-br from-success to-emerald-600" : "bg-gradient-to-br from-primary-500 to-primary-700"}`}>
                            {(v.vendorProfile?.businessName ?? v.fullName).slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-extrabold leading-tight text-ink">{v.vendorProfile?.businessName ?? v.fullName}</p>
                            <p className="mt-0.5 truncate text-xs text-muted">{v.fullName} • {v.mobile} • {v.city}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${v.isActive ? "bg-success-soft text-success ring-1 ring-success/20" : "bg-surface text-muted ring-1 ring-line"}`}>
                          {v.isActive ? "● ACTIVE" : "○ INACTIVE"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className={v.isVerified ? "chip chip-success" : "chip chip-neutral"}>{v.isVerified ? "✓ Email verified" : "Email unverified"}</span>
                        <span className={v.vendorProfile?.isApproved ? "chip chip-primary" : "chip chip-accent"}>{v.vendorProfile?.isApproved ? "✓ KYC approved" : `KYC ${v.vendorProfile?.kycStatus ?? "PENDING"}`}</span>
                        <span className="chip chip-accent">★ {(v.vendorProfile?.rating ?? 0).toFixed(1)}</span>
                        <span className="chip chip-neutral">{v.vendorProfile?.totalJobs ?? 0} jobs</span>
                      </div>
                      {(v.vendorProfile?.serviceAreaPincodes ?? []).length > 0 ? (
                        <p className="mt-2 text-xs font-semibold text-body">📍 {(v.vendorProfile?.serviceAreaPincodes ?? []).join(", ")}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════ AREA ═══════ */}
          {/* ───────── BOOKINGS (pincode area) ───────── */}
          {tab === "bookings" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-ink">Bookings in your area</p>
                  <p className="sub">
                    Assigned to you or raised inside {pincodes.length > 0 ? pincodes.join(", ") : "your service pincodes"}.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    ["all", "All"],
                    ["unassigned", "Needs vendor"],
                    ["active", "Active"],
                    ["completed", "Closed"],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setBookingFilter(key)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 transition-colors ${
                        bookingFilter === key
                          ? "bg-primary-600 text-white ring-primary-600"
                          : "bg-white text-body ring-line hover:bg-primary-50 hover:text-primary-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {bookingsQ.isLoading ? (
                <div className="card"><p className="sub py-8 text-center">Loading area bookings…</p></div>
              ) : bookings.length === 0 ? (
                <div className="card">
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface"><ClipboardList size={24} className="text-muted" /></span>
                    <p className="text-sm font-extrabold text-ink">No bookings in this view</p>
                    <p className="text-xs text-muted">New bookings in your pincodes will appear here automatically.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bookings.map((b) => {
                    const vendorName = b.vendor?.vendorProfile?.businessName ?? b.vendor?.fullName ?? "";
                    const addr = b.address ?? {};
                    return (
                      <div key={b.id} className="card card-hover !p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-extrabold text-ink">{b.description}</p>
                            <p className="mt-0.5 text-xs text-muted">
                              #{b.id.slice(-6)} · {b.customer?.fullName ?? "Customer"} · {addr.area ?? b.city ?? ""}
                              {b.pincode ? ` (${b.pincode})` : ""}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span className={STATUS_CHIP[b.status] ?? "chip chip-neutral"}>{b.status.replace(/_/g, " ")}</span>
                              {b.vendor ? (
                                <span className="chip chip-primary">Vendor: {vendorName}</span>
                              ) : (
                                <span className="chip chip-accent">Needs vendor</span>
                              )}
                              {b.agent ? <span className="chip chip-neutral">Agent: {b.agent.fullName}</span> : null}
                              <span className="chip chip-neutral">{b.events?.length ?? 0} events</span>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <b className="text-base text-ink">{inr(b.totalAmount)}</b>
                            <button
                              onClick={() => { setSelectedBooking(b); setAssignVendorId(""); setAgentNote(""); }}
                              className="btn-primary !px-3.5 !py-1.5 !text-xs"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "area" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card">
                <p className="font-extrabold text-ink">Your assigned area</p>
                <p className="sub mb-3">City: <b className="text-ink">{area?.city ?? "—"}</b> • commission <b className="text-success">{area?.commissionPercent ?? 5}%</b></p>

                {!canPickArea ? (
                  <>
                    <p className="rounded-xl bg-accent-50 px-3.5 py-2.5 text-[13px] font-semibold text-accent-600">
                      You don&apos;t have a service address yet — set your street/city first, then pick the pincodes you own.
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder={`Street / colony — e.g. MG Road, ${area?.city ?? ""}`} className="input !py-2.5" />
                      <button
                        type="button"
                        onClick={() => { if (street.trim().length < 3) { setPinErr("Enter a valid street address."); return; } setPinErr(""); setAddress.mutate({ streetAddress: street.trim() }); }}
                        disabled={setAddress.isPending}
                        className="btn-accent !py-2.5"
                      >
                        <MapPin size={15} /> Save my service address
                      </button>
                      {pinErr !== "" ? <p className="text-xs font-semibold text-danger">{pinErr}</p> : null}
                    </div>
                  </>
                ) : serving?.isActive === false || !serving ? (
                  <p className="rounded-xl bg-accent-50 px-3.5 py-2.5 text-[13px] font-semibold text-accent-600">
                    We don&apos;t serve <b className="text-ink">{area?.city}</b> yet. Ask the admin to add it to serving areas.
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-xs font-bold text-body">Your address: <span className="text-ink">{area?.streetAddress}</span></p>
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Serving pincodes you own in {serving.city}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(serving.pincodes ?? []).map((p) => {
                        const sel = pincodes.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setArea.mutate({ pincodes: sel ? pincodes.filter((x) => x !== p) : [...pincodes, p] })}
                            disabled={setArea.isPending}
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${sel ? "border-primary-600 bg-primary-600 text-white shadow-sm" : "border-line bg-white text-body hover:border-primary-300 hover:text-primary-700"}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      {!serving.pincodes?.length ? <p className="text-xs text-muted">No pincodes configured for this city yet.</p> : null}
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-muted">Vendors serving the pincodes you own appear in your area and are monitored by you.</p>
                  </>
                )}
              </div>
              <div className="card">
                <p className="font-extrabold text-ink">How area monitoring works</p>
                <div className="mt-2 space-y-2 text-sm text-body">
                  <p className="flex items-start gap-2"><MapPinned size={16} className="mt-0.5 shrink-0 text-primary-600" /> Vendors add the pincodes they serve — the ones overlapping yours land in your dashboard.</p>
                  <p className="flex items-start gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent-500" /> Track their KYC status and nudge the admin to approve complete applications.</p>
                  <p className="flex items-start gap-2"><TrendingUp size={16} className="mt-0.5 shrink-0 text-success" /> You earn {area?.commissionPercent ?? 5}% on every booking completed inside your area.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* booking management modal */}
      {activeBooking ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-extrabold leading-tight text-ink">{activeBooking.description}</p>
                <p className="sub mt-1">
                  #{activeBooking.id.slice(-6)} · {activeBooking.customer?.fullName ?? "Customer"} ·{" "}
                  {activeBooking.pincode ?? activeBooking.address?.pincode ?? "No pincode"} · {inr(activeBooking.totalAmount)}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                aria-label="Close"
                className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-3">
                <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                  <MapPin size={12} className="mr-1 inline" /> Service address
                </p>
                <p className="text-xs leading-relaxed text-body">
                  {[activeBooking.address?.houseNo, activeBooking.address?.area, activeBooking.address?.city, activeBooking.pincode ?? activeBooking.address?.pincode]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                {activeBooking.customer?.mobile ? (
                  <a
                    href={`tel:${activeBooking.customer.mobile}`}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:underline"
                  >
                    <Phone size={12} /> {activeBooking.customer.fullName ?? "Customer"} · {activeBooking.customer.mobile}
                  </a>
                ) : null}
              </div>
              <div className="rounded-2xl bg-surface p-3">
                <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted">Current status</p>
                <span className={STATUS_CHIP[activeBooking.status] ?? "chip chip-neutral"}>
                  {activeBooking.status.replace(/_/g, " ")}
                </span>
                <p className="mt-2 text-xs text-body">
                  {activeBooking.vendor
                    ? `Vendor: ${activeBooking.vendor.vendorProfile?.businessName ?? activeBooking.vendor.fullName}`
                    : "No vendor assigned yet."}
                </p>
                {activeBooking.agent ? (
                  <p className="mt-1 text-[11px] text-muted">Primary agent: {activeBooking.agent.fullName}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-line p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                <Store size={12} /> Assign a vendor
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={assignVendorId}
                  onChange={(e) => setAssignVendorId(e.target.value)}
                  disabled={eligibleQ.isLoading || assignVendor.isPending}
                  className="input flex-1 !py-2"
                >
                  <option value="">
                    {eligibleQ.isLoading
                      ? "Loading vendors…"
                      : eligibleVendors.length === 0
                        ? "No approved vendor serves this pincode"
                        : "Select approved vendor"}
                  </option>
                  {eligibleVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.businessName} · {v.city}
                      {v.pincodeMatch ? " · pincode match" : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!assignVendorId || !activeBooking) return;
                    assignVendor.mutate({
                      id: activeBooking.id,
                      vendorId: assignVendorId,
                      note: agentNote.trim() || undefined,
                    });
                  }}
                  disabled={!assignVendorId || assignVendor.isPending}
                  className="btn-primary !py-2 disabled:opacity-50"
                >
                  {assignVendor.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Assign
                </button>
              </div>
              {activeBooking.vendor ? (
                <p className="mt-1.5 text-[11px] text-muted">
                  Currently assigned to{" "}
                  <b className="text-body">
                    {activeBooking.vendor.vendorProfile?.businessName ?? activeBooking.vendor.fullName}
                  </b>
                  . Reassigning is allowed until the job is accepted.
                </p>
              ) : null}
            </div>

            <div className="mt-3 rounded-2xl border border-line p-3">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">Add a note / update status</p>
              <input
                value={agentNote}
                onChange={(e) => setAgentNote(e.target.value)}
                placeholder="Optional note (visible in the history)"
                className="input !py-2"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allowedNextStatuses("AGENT", activeBooking.status).map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      updateStatus.mutate({
                        id: activeBooking.id,
                        status: s,
                        note: agentNote.trim() || undefined,
                      })
                    }
                    disabled={updateStatus.isPending}
                    className={s === "CANCELLED" ? "btn-danger-ghost !px-3.5 !py-1.5 !text-xs disabled:opacity-50" : "btn-ghost !px-3.5 !py-1.5 !text-xs disabled:opacity-50"}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
                {allowedNextStatuses("AGENT", activeBooking.status).length === 0 ? (
                  <span className="text-[11px] font-semibold text-muted">No agent status action needed at this stage.</span>
                ) : null}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">Tracking history</p>
              <BookingTimeline events={activeBooking.events ?? []} empty="No tracking events recorded yet." />
            </div>
          </div>
        </div>
      ) : null}

      {/* notifications panel */}
      {notifOpen ? (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={() => setNotifOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
              <p className="font-extrabold text-ink">Notifications <span className="chip chip-neutral ml-1">{notifications.length}</span></p>
              <div className="flex items-center gap-1">
                {unreadCount > 0 ? (
                  <button onClick={() => notifications.filter((n) => !n.isRead).forEach((n) => markRead.mutate({ id: n.id }))} className="rounded-full p-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50"><Check size={15} /> Mark all read</button>
                ) : null}
                <button onClick={() => setNotifOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"><X size={18} /></button>
              </div>
            </div>
            <div className="p-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Bell size={24} className="text-muted" />
                  <p className="text-sm font-bold text-ink">All caught up</p>
                  <p className="text-xs text-muted">Area updates and platform notices appear here.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`mb-2 rounded-2xl border p-3 ${n.isRead ? "border-line bg-white" : "border-primary-200 bg-primary-50"}`}>
                    <p className="text-sm font-extrabold text-ink">{n.title}</p>
                    <p className="mt-0.5 text-[13px] text-body">{n.message}</p>
                    <p className="mt-1 text-[11px] font-medium text-muted">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* logout overlays */}
      {loggingOut === "confirm" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-pop">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft"><LogOut size={24} className="text-danger" /></span>
            <p className="mt-3 text-lg font-extrabold tracking-tight text-ink">Sign out of the console?</p>
            <p className="sub mt-1">You&apos;ll be returned to the home page.</p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button onClick={() => setLoggingOut(null)} className="btn-ghost !py-3">Cancel</button>
              <button onClick={performLogout} className="btn-primary !bg-danger !py-3">Sign out</button>
            </div>
          </div>
        </div>
      ) : null}
      {loggingOut === "signedout" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-pop">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50"><LogOut size={28} className="text-primary-600" /></span>
            <p className="mt-4 text-xl font-extrabold tracking-tight text-ink">Signed out</p>
            <p className="sub mt-1">See you soon — redirecting home…</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}