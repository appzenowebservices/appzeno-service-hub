"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Store, LogOut, ShieldCheck, MapPin, ChevronRight,
  X, ArrowUpRight, Bell, Check, TrendingUp, Briefcase, IndianRupee, Search, UserCheck, MapPinned,
} from "lucide-react";
import { trpc } from "~/trpc/react";

type Tab = "overview" | "vendors" | "area";

interface AreaVendor {
  id: string; fullName: string; mobile: string; city: string; isActive: boolean; isVerified: boolean;
  vendorProfile: { businessName: string | null; kycStatus: string; isApproved: boolean; rating: number; totalReviews: number; serviceAreaPincodes: string[]; totalJobs: number };
}

export default function AgentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sUser = session?.user;
  const role = (sUser?.role ?? "").toUpperCase();
  const agentId = sUser?.id ?? "";

  const [tab, setTab] = useState<Tab>("overview");
  const [pinErr, setPinErr] = useState("");
  const [street, setStreet] = useState("");
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState<"confirm" | "signedout" | null>(null);

  const areaQ = trpc.agents.area.useQuery(undefined, { enabled: !!agentId && status === "authenticated" });
  const statsQ = trpc.agents.areaStats.useQuery(undefined, { enabled: !!agentId && status === "authenticated" });
  const vendorsQ = trpc.agents.areaVendors.useQuery(undefined, { enabled: !!agentId && status === "authenticated" });
  const setArea = trpc.agents.setServiceArea.useMutation({ onSuccess: () => areaQ.refetch() });
  const setAddress = trpc.areas.setAddress.useMutation({ onSuccess: () => { areaQ.refetch(); setStreet(""); } });
  const notifQ = trpc.admin.notifications.useQuery({ limit: 10 }, { enabled: !!agentId && status === "authenticated" });
  const markRead = trpc.admin.markNotificationRead.useMutation({ onSuccess: () => notifQ.refetch() });
  const [notifOpen, setNotifOpen] = useState(false);

  const performLogout = () => {
    setLoggingOut("signedout");
    window.setTimeout(() => signOut({ callbackUrl: "/" }), 1200);
  };

  if (status === "loading") return <div className="p-10 text-muted">Loading…</div>;
  if (status !== "authenticated" || (role !== "AGENT" && role !== "ADMIN"))
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold">Agent login required</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Login</button>
      </div>
    );

  const area = areaQ.data as { city?: string; pincodes?: string[]; streetAddress?: string | null; commissionPercent?: number; fullName?: string; isVerified?: boolean } | undefined;
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

  const NAV: { key: Tab; label: string; Icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: "Area Overview", Icon: LayoutDashboard },
    { key: "vendors", label: "My Vendors", Icon: Store },
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
            <button key={key} onClick={() => setTab(key)} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ${tab === key ? "bg-white text-ink shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={17} className={tab === key ? "text-primary-600" : ""} />
              <span className="flex-1 text-left">{label}</span>
              {tab === key ? <ChevronRight size={14} className="text-muted" /> : null}
            </button>
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
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-ink">Namaste, {area?.fullName?.split(" ")[0] ?? "Agent"} 👋</h1>
            <p className="text-xs font-medium text-muted">{area?.city ?? ""} • {pincodes.length} pincodes in your area</p>
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
              <button key={key} onClick={() => setTab(key)} className={`tab-pill shrink-0 !text-[13px] ${tab === key ? "tab-pill-active" : "tab-pill-idle"}`}>{label}</button>
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
              <button onClick={() => setTab("area")} className="btn-accent !py-2">Add pincodes <ChevronRight size={14} /></button>
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
                  <button onClick={() => setTab("vendors")} className="text-[13px] font-bold text-primary-600">Manage →</button>
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