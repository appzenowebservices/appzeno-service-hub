"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, CalendarClock, Wallet, Bell, BellOff, LogOut, ChevronRight, X, Check,
  Star, TrendingUp, CheckCircle2, Plus, ArrowRight, Sparkles, CheckCheck,
  CalendarCheck, CreditCard, Gift, Info, Phone, Loader2, XCircle, RotateCcw,
} from "lucide-react";
import { trpc } from "~/trpc/react";

type Tab = "overview" | "bookings" | "notifications";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "chip chip-accent",
  ASSIGNED: "chip chip-primary",
  ACCEPTED: "chip chip-primary",
  IN_PROGRESS: "chip chip-primary",
  COMPLETED: "chip chip-success",
  CANCELLED: "chip chip-neutral",
  DISPUTED: "chip chip-danger",
};

const PAY_STYLE: Record<string, string> = {
  PAID: "chip chip-success",
  PENDING: "chip chip-accent",
  REFUNDED: "chip chip-primary",
  FAILED: "chip chip-danger",
};

const STAGES = [
  { key: "PENDING", label: "Requested" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "IN_PROGRESS", label: "Working" },
  { key: "COMPLETED", label: "Done" },
];

function stageIndex(status: string): number {
  if (status === "PENDING") return 0;
  if (status === "ASSIGNED" || status === "ACCEPTED") return 1;
  if (status === "IN_PROGRESS") return 2;
  if (status === "COMPLETED") return 3;
  return -1;
}

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

interface NotifRow { id: string; title: string; message: string; isRead: boolean; createdAt: string | Date }

function relTime(d: string | Date): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function notifMeta(title: string): { Icon: typeof Bell; bg: string; fg: string } {
  const t = title.toLowerCase();
  if (t.includes("booking") || t.includes("assign")) return { Icon: CalendarCheck, bg: "bg-primary-50", fg: "text-primary-600" };
  if (t.includes("pay") || t.includes("refund") || t.includes("wallet")) return { Icon: CreditCard, bg: "bg-success-soft", fg: "text-success" };
  if (t.includes("offer") || t.includes("discount") || t.includes("deal") || t.includes("bonus")) return { Icon: Gift, bg: "bg-accent-soft", fg: "text-accent-600" };
  return { Icon: Info, bg: "bg-surface", fg: "text-body" };
}

type DayBucket = "Today" | "Yesterday" | "Earlier";
function dayBucket(d: string | Date): DayBucket {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = new Date(d).getTime();
  if (t >= startToday) return "Today";
  if (t >= startToday - 86400000) return "Yesterday";
  return "Earlier";
}

interface BookingRow {
  id: string; status: string; paymentStatus: string; description: string; totalAmount: number;
  preferredDate?: string; paymentMethod?: string;
  timeSlot?: { label?: string } | null;
  address?: { area?: string; city?: string; pincode?: string; houseNo?: string } | null;
  vendor?: { fullName: string; mobile?: string; vendorProfile?: { businessName?: string; avgRating?: number } | null } | null;
  Review?: { rating?: number }[];
}
interface Cat {
  id: string; slug: string; name: string; icon: string;
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sUser = session?.user;
  const customerId = sUser?.id ?? "";

  const [tab, setTab] = useState<Tab>("overview");
  const [loggingOut, setLoggingOut] = useState<"confirm" | "signedout" | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"all" | "unread">("all");

  const meQ = trpc.users.getById.useQuery({ id: customerId }, { enabled: !!customerId && status === "authenticated" });
  const bookingsQ = trpc.bookings.getByCustomer.useQuery({ customerId, limit: 50 }, { enabled: !!customerId });
  const catsQ = trpc.categories.getAll.useQuery();
  const notifQ = trpc.admin.notifications.useQuery({ limit: 10 }, { enabled: !!customerId && status === "authenticated" });
  const markRead = trpc.admin.markNotificationRead.useMutation({ onSuccess: () => notifQ.refetch() });

  const me = meQ.data as { fullName?: string; mobile?: string; city?: string; customerProfile?: { walletBalance: number; referralCode?: string | null } | null } | undefined;
  const bookings = useMemo(() => ((bookingsQ.data as BookingRow[] | undefined) ?? []), [bookingsQ.data]);
  const cats = (catsQ.data as Cat[] | undefined) ?? [];
  const notifications = useMemo(() => ((notifQ.data as NotifRow[] | undefined) ?? []), [notifQ.data]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const shownNotifs = notifTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const renderNotif = (n: NotifRow) => {
    const { Icon, bg, fg } = notifMeta(n.title);
    return (
      <button
        key={n.id}
        type="button"
        onClick={() => { if (!n.isRead) markRead.mutate({ id: n.id }); }}
        className={`group relative flex w-full gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${n.isRead ? "hover:bg-surface" : "bg-primary-50/60 hover:bg-primary-50"}`}
      >
        {!n.isRead ? <span className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary-600" aria-label="Unread" /> : null}
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${fg}`}><Icon size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-extrabold text-ink">{n.title}</p>
            <span className="shrink-0 text-[10px] font-semibold text-muted">{relTime(n.createdAt)}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[13px] text-body">{n.message}</p>
        </div>
      </button>
    );
  };

  const notifGroups = (["Today", "Yesterday", "Earlier"] as DayBucket[])
    .map((b) => ({ b, items: shownNotifs.filter((n) => dayBucket(n.createdAt) === b) }))
    .filter((g) => g.items.length > 0);

  const notifList = notifGroups.length === 0 ? (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface"><BellOff size={24} className="text-muted" /></span>
      <p className="text-sm font-extrabold text-ink">{notifTab === "unread" ? "You're all caught up" : "No notifications yet"}</p>
      <p className="max-w-[220px] text-xs text-muted">Booking updates, payment receipts and offers appear here.</p>
    </div>
  ) : (
    notifGroups.map(({ b, items }) => (
      <div key={b} className="mb-1">
        <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted">{b}</p>
        {items.map(renderNotif)}
      </div>
    ))
  );

  const wallet = me?.customerProfile?.walletBalance ?? 0;
  const activeCount = bookings.filter((b) => ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  const performLogout = () => {
    setLoggingOut("signedout");
    window.setTimeout(() => { void signOut({ callbackUrl: "/" }); }, 1200);
  };

  if (status === "loading") return <div className="p-10 text-muted">Loading…</div>;
  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold text-ink">Please login as customer</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Login</button>
      </div>
    );
  }

  const NAV: { key: Tab; label: string; Icon: typeof LayoutDashboard; badge?: number }[] = [
    { key: "overview", label: "Overview", Icon: LayoutDashboard },
    { key: "bookings", label: "My Bookings", Icon: CalendarClock, badge: activeCount },
    { key: "notifications", label: "Notifications", Icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans lg:flex">
      {/* sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink text-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
          <Image src="/logo.png" alt="ADDies" width={36} height={36} className="h-9 w-9 rounded-xl bg-white object-contain p-0.5" />
          <div className="leading-none">
            <p className="truncate text-[15px] font-extrabold">My ADDies</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300">{me?.city ?? "Home"}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map(({ key, label, Icon, badge }) => (
            <button key={key} onClick={() => setTab(key)} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ${tab === key ? "bg-white text-ink shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={17} className={tab === key ? "text-primary-600" : ""} />
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && badge > 0 ? <span className="rounded-full bg-accent-400 px-2 py-0.5 text-[11px] font-extrabold text-accent-ink">{badge}</span> : null}
              {tab === key ? <ChevronRight size={14} className="text-muted" /> : null}
            </button>
          ))}
          <div className="px-3.5 pt-4">
            <Link href="/customer/booking" className="flex items-center justify-center gap-2 rounded-xl bg-accent-400 py-2.5 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-300">
              <Plus size={16} /> Book a service
            </Link>
          </div>
        </nav>
        <div className="space-y-1 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            <Sparkles size={17} /> Browse services <ArrowRight size={12} className="ml-auto" />
          </Link>
          <button onClick={() => setLoggingOut("confirm")} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-danger hover:bg-danger-soft">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* desktop header */}
        <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-line bg-white/95 px-6 py-3 backdrop-blur lg:flex">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-ink">Namaste, {me?.fullName?.split(" ")[0] ?? "there"} 👋</h1>
            <p className="text-xs font-medium text-muted">{me?.mobile ?? ""} • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/customer/booking" className="btn-primary !py-2 !text-[13px]"><Plus size={15} /> Book service</Link>
            <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" className="relative rounded-full border border-line bg-white p-2.5 text-body shadow-sm hover:border-primary-300 hover:text-primary-700">
              <Bell size={18} />
              {unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-extrabold text-white">{unreadCount}</span> : null}
            </button>
          </div>
        </header>

        {/* mobile header */}
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center gap-2 px-3">
            <Image src="/logo.png" alt="ADDies" width={30} height={30} className="h-8 w-8 object-contain" />
            <p className="truncate text-sm font-extrabold text-ink">Namaste, {me?.fullName?.split(" ")[0] ?? "there"}</p>
            <button onClick={() => setNotifOpen((o) => !o)} className="relative ml-auto rounded-full p-2 text-muted hover:bg-surface hover:text-ink">
              <Bell size={18} />
              {unreadCount > 0 ? <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[8px] font-extrabold text-white">{unreadCount}</span> : null}
            </button>
            <button onClick={() => setLoggingOut("confirm")} className="rounded-full px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger-soft">Logout</button>
          </div>
          <nav className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2.5">
            {NAV.map(({ key, label, badge }) => (
              <button key={key} onClick={() => setTab(key)} className={`tab-pill shrink-0 !text-[13px] ${tab === key ? "tab-pill-active" : "tab-pill-idle"}`}>
                {label}{badge !== undefined && badge > 0 ? ` (${badge})` : ""}
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl space-y-4 p-4 lg:p-6">
          {/* ═══ OVERVIEW ═══ */}
          {tab === "overview" && (
            <>
              {/* wallet hero */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-ink p-6 text-white">
                <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-400/30 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-primary-400/30 blur-3xl" />
                <div className="relative flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-200"><Wallet size={14} /> ADDies Wallet</p>
                    <p className="mt-1 text-4xl font-extrabold tracking-tight">{inr(wallet)}</p>
                    <p className="mt-1 text-xs font-medium text-primary-200">Earned from ₹100 signup bonus + refunds</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/customer/booking" className="rounded-full bg-accent-400 px-5 py-2.5 text-sm font-extrabold text-accent-ink hover:bg-accent-300">Book a service</Link>
                    <Link href="/services" className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20">Browse services</Link>
                  </div>
                </div>
              </div>

              {/* stats */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { icon: CalendarClock, l: "Total bookings", v: `${bookings.length}` },
                  { icon: TrendingUp, l: "Active", v: `${activeCount}` },
                  { icon: CheckCircle2, l: "Completed", v: `${completedCount}` },
                  { icon: Star, l: "Rating given", v: "—" },
                ].map((s) => (
                  <div key={s.l} className="stat-card">
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted"><s.icon size={13} />{s.l}</p>
                    <p className="mt-1 text-2xl font-extrabold text-ink">{s.v}</p>
                  </div>
                ))}
              </div>

              {/* quick book */}
              <div className="card">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-extrabold text-ink">Book in one tap</p>
                  <Link href="/services" className="text-[13px] font-bold text-primary-600">View all →</Link>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {cats.slice(0, 12).map((c) => (
                    <Link key={c.id} href="/customer/booking" className="group flex flex-col items-center gap-1.5 rounded-2xl border border-transparent p-2.5 text-center transition-all hover:border-primary-200 hover:bg-primary-50">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-2xl transition-transform group-hover:scale-110">{c.icon === "" ? "✨" : c.icon}</span>
                      <p className="text-[11px] font-bold leading-tight text-body">{c.name}</p>
                    </Link>
                  ))}
                  {cats.length === 0 ? <p className="sub col-span-3 py-4 text-center sm:col-span-6">Services launching soon — book once live.</p> : null}
                </div>
              </div>

              {/* recent bookings */}
              <div className="card">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-extrabold text-ink">Recent bookings</p>
                  <button onClick={() => setTab("bookings")} className="text-[13px] font-bold text-primary-600">View all →</button>
                </div>
                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <CalendarClock size={26} className="text-muted" />
                    <p className="text-sm font-bold text-ink">No bookings yet</p>
                    <p className="text-xs text-muted">Book your first service and track it live here.</p>
                    <Link href="/customer/booking" className="btn-primary mt-1 !py-2 !text-xs">Book now</Link>
                  </div>
                ) : (
                  bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="row-line flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{b.description.slice(0, 50)}</p>
                        <p className="text-xs text-muted">{b.vendor?.fullName ?? "Assigning a pro…"} • {b.preferredDate ?? ""}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <b className="text-ink">{inr(b.totalAmount)}</b>
                        <span className={STATUS_STYLE[b.status] ?? "chip chip-neutral"}>{b.status.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ═══ BOOKINGS ═══ */}
          {tab === "bookings" && (
            <div className="card !p-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="font-extrabold text-ink">My bookings <span className="chip chip-neutral ml-1">{bookings.length}</span></p>
                <Link href="/customer/booking" className="btn-primary !px-4 !py-1.5 !text-xs"><Plus size={14} /> New booking</Link>
              </div>
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface"><CalendarClock size={24} className="text-muted" /></span>
                  <p className="text-sm font-extrabold text-ink">No bookings yet</p>
                  <p className="text-xs text-muted">Book a service and track it here live.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => {
                    const stageIdx = stageIndex(b.status);
                    const accent = b.status === "COMPLETED" ? "bg-success" : b.status === "CANCELLED" ? "bg-slate-300" : b.status === "DISPUTED" ? "bg-danger" : b.status === "PENDING" ? "bg-accent-400" : "bg-primary-600";
                    const name = b.vendor?.vendorProfile?.businessName ?? b.vendor?.fullName ?? "";
                    const active = stageIdx >= 0 && b.status !== "COMPLETED";
                    return (
                      <article key={b.id} className="relative overflow-hidden rounded-2xl border border-line bg-white p-4 pl-5">
                        <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} aria-hidden />
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-extrabold text-ink">{b.description}</p>
                            <p className="mt-0.5 text-xs text-muted">
                              #{b.id.slice(-6)} • {b.preferredDate ?? "—"}
                              {b.timeSlot?.label ? ` • ${b.timeSlot.label}` : ""}
                              {b.address?.area ? ` • ${b.address.area}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <b className="text-base text-ink">{inr(b.totalAmount)}</b>
                            <div className="flex items-center gap-1.5">
                              <span className={STATUS_STYLE[b.status] ?? "chip chip-neutral"}>{b.status.replace(/_/g, " ")}</span>
                              <span className={PAY_STYLE[b.paymentStatus] ?? "chip chip-neutral"}>{b.paymentStatus}</span>
                            </div>
                          </div>
                        </div>

                        {b.vendor ? (
                          <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-extrabold text-white">{name.charAt(0).toUpperCase()}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-ink">{name}</p>
                              <p className="text-[11px] text-muted">Verified pro • {b.vendor.fullName}{typeof b.vendor.vendorProfile?.avgRating === "number" ? ` • ★ ${b.vendor.vendorProfile.avgRating.toFixed(1)}` : ""}</p>
                            </div>
                            {b.vendor.mobile ? (
                              <a href={`tel:${b.vendor.mobile}`} aria-label="Call pro" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100"><Phone size={14} /></a>
                            ) : null}
                          </div>
                        ) : active ? (
                          <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-xs font-bold text-accent-ink">
                            <Loader2 size={14} className="animate-spin" /> Finding a verified pro near you…
                          </div>
                        ) : null}

                        {stageIdx >= 0 ? (
                          <div className="mt-4 flex items-start">
                            {STAGES.map((st, i) => {
                              const done = stageIdx > i;
                              const isActive = stageIdx === i;
                              return (
                                <div key={st.key} className="flex flex-1 flex-col items-center">
                                  <div className="flex w-full items-center">
                                    <div className={`h-0.5 flex-1 rounded ${i === 0 ? "opacity-0" : stageIdx >= i ? "bg-success" : "bg-line"}`} />
                                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${done ? "bg-success text-white" : isActive ? "bg-primary-600 text-white" : "bg-white text-muted ring-1 ring-line"}`}>{done ? <Check size={11} /> : i + 1}</span>
                                    <div className={`h-0.5 flex-1 rounded ${i === STAGES.length - 1 ? "opacity-0" : stageIdx > i ? "bg-success" : "bg-line"}`} />
                                  </div>
                                  <p className={`mt-1.5 text-[10px] font-bold uppercase tracking-wide ${done ? "text-success" : isActive ? "text-primary-700" : "text-muted"}`}>{st.label}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${b.status === "DISPUTED" ? "bg-danger-soft text-danger" : "bg-surface text-body"}`}>
                            <XCircle size={14} /> {b.status === "DISPUTED" ? "Under dispute — our team will reach out shortly." : "This booking was cancelled."}
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {b.status === "COMPLETED" || b.status === "CANCELLED" ? (
                            <Link href="/services" className="btn-ghost !px-4 !py-1.5 !text-xs"><RotateCcw size={13} /> Book again</Link>
                          ) : null}
                          {active ? <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-muted"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live updates</span> : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ NOTIFICATIONS ═══ */}
          {tab === "notifications" && (
            <div className="card !p-3">
              <div className="mb-1 flex items-center justify-between px-2 pt-1">
                <p className="font-extrabold text-ink">Notifications <span className="chip chip-neutral ml-1">{notifications.length}</span></p>
                {unreadCount > 0 ? (
                  <button onClick={() => notifications.filter((n) => !n.isRead).forEach((n) => markRead.mutate({ id: n.id }))} className="flex items-center gap-1 text-[13px] font-bold text-primary-600 hover:underline"><CheckCheck size={14} /> Mark all read</button>
                ) : null}
              </div>
              <div className="mb-2 flex gap-1.5 px-2">
                <button onClick={() => setNotifTab("all")} className={`tab-pill !text-xs ${notifTab === "all" ? "tab-pill-active" : "tab-pill-idle"}`}>All <span className="ml-1 opacity-70">{notifications.length}</span></button>
                <button onClick={() => setNotifTab("unread")} className={`tab-pill !text-xs ${notifTab === "unread" ? "tab-pill-active" : "tab-pill-idle"}`}>Unread <span className="ml-1 opacity-70">{unreadCount}</span></button>
              </div>
              {notifList}
            </div>
          )}
        </main>
      </div>

      {/* notifications slide-in */}
      {notifOpen ? (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={() => setNotifOpen(false)}>
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line px-4 pb-2.5 pt-3">
              <p className="font-extrabold text-ink">Notifications</p>
              <div className="flex items-center gap-1">
                {unreadCount > 0 ? (
                  <button onClick={() => notifications.filter((n) => !n.isRead).forEach((n) => markRead.mutate({ id: n.id }))} className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-primary-600 hover:bg-primary-50"><CheckCheck size={14} /> Mark all read</button>
                ) : null}
                <button onClick={() => setNotifOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"><X size={18} /></button>
              </div>
            </div>
            <div className="flex gap-1.5 border-b border-line px-4 py-2">
              <button onClick={() => setNotifTab("all")} className={`tab-pill !text-xs ${notifTab === "all" ? "tab-pill-active" : "tab-pill-idle"}`}>All <span className="ml-1 opacity-70">{notifications.length}</span></button>
              <button onClick={() => setNotifTab("unread")} className={`tab-pill !text-xs ${notifTab === "unread" ? "tab-pill-active" : "tab-pill-idle"}`}>Unread <span className="ml-1 opacity-70">{unreadCount}</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5">{notifList}</div>
          </div>
        </div>
      ) : null}

      {/* logout overlays */}
      {loggingOut === "confirm" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-pop">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft"><LogOut size={24} className="text-danger" /></span>
            <p className="mt-3 text-lg font-extrabold tracking-tight text-ink">Sign out of My ADDies?</p>
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