"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Briefcase, Inbox, BadgeCheck, LogOut, Loader2, CheckCircle2,
  Star, IndianRupee, TrendingUp, Clock, ShieldCheck, FileText, UserRound, ChevronRight,
  X, ArrowUpRight, Building2, Store, Award, Bell, BellOff, CheckCheck, Check, MapPin,
} from "lucide-react";
import { trpc } from "~/trpc/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/uploadthing";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type Tab = "overview" | "orders" | "jobs" | "kyc";

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

interface Profile {
  fullName?: string;
  mobile?: string;
  email?: string;
  city?: string;
  vendorProfile?: {
    businessName: string;
    subscriptionPlan: string;
    kycStatus: string;
    isApproved: boolean;
    yearsOfExperience: number;
    rating: number;
    totalReviews: number;
    gst?: string | null;
    aadhaarDoc?: string | null;
    panDoc?: string | null;
    profilePhoto?: string | null;
    serviceCategories: string[];
    serviceAreaPincodes: string[];
    streetAddress?: string | null;
  } | null;
}
interface BookingRow { id: string; status: string; description: string; totalAmount: number; customer?: { fullName?: string } | null }
interface LeadRow { id: string; status: string; booking?: { description: string; totalAmount: number; createdAt?: string | Date } | null }

function KycUpload({ label, value, hint, onUpload, onRemove }: { label: string; value: string; hint: string; onUpload: (url: string) => void; onRemove: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  // Same pattern as admin category photos: UploadThing via useUploadThing,
  // custom label + hidden input (endpoint is vendor-scoped).
  const { startUpload, isUploading } = useUploadThing("vendorKycUploader", {
    onClientUploadComplete: (res) => { setUploading(false); const u = res[0]?.url; if (u) onUpload(u); },
    onUploadError: (e: Error) => { setUploading(false); setErr(e.message); },
  });
  const isPdf = value.toLowerCase().endsWith(".pdf") || value.includes("/pdf");

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50 text-primary-600">
        {value ? (
          isPdf ? (
            <FileText size={20} className="text-danger" />
          ) : (
            <Image src={value} alt={label} width={44} height={44} className="h-full w-full object-cover" unoptimized />
          )
        ) : (
          <FileText size={20} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-extrabold text-ink">{label} <span className="font-semibold text-muted">(optional)</span></p>
        <p className="truncate text-xs text-muted">{value ? "Uploaded ✓ — tap to view" : hint}</p>
        {err !== "" ? <p className="text-xs font-semibold text-danger">{err}</p> : null}
      </div>
      {value ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <a href={value} target="_blank" rel="noreferrer" className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-primary-600 ring-1 ring-line hover:bg-primary-50">View</a>
          <button type="button" onClick={onRemove} className="btn-danger-ghost disabled:opacity-50" disabled={uploading}><X size={13} /> Remove</button>
        </div>
      ) : (
        <label className={`shrink-0 cursor-pointer rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-700 ${isUploading ? "pointer-events-none opacity-70" : ""}`}>
          {isUploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) { setErr(""); setUploading(true); void startUpload([f]); } }}
          />
        </label>
      )}
    </div>
  );
}

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sUser = session?.user;
  const role = (sUser?.role ?? "").toUpperCase();
  const vendorId = sUser?.id ?? "";

  const [tab, setTab] = useState<Tab>("overview");
  const [loggingOut, setLoggingOut] = useState<"confirm" | "signedout" | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [bizName, setBizName] = useState("");
  const [exp, setExp] = useState("2");
  const [gst, setGst] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [photo, setPhoto] = useState("");
  const [kycErr, setKycErr] = useState("");
  const [kycDone, setKycDone] = useState(false);
  const [kycComplete, setKycComplete] = useState(false);

  const meQ = trpc.users.getById.useQuery({ id: vendorId }, { enabled: !!vendorId && status === "authenticated" });
  const statsQ = trpc.vendors.getVendorStats.useQuery({ vendorId }, { enabled: !!vendorId });
  const jobsQ = trpc.bookings.getByVendor.useQuery({ vendorId, limit: 20 }, { enabled: !!vendorId });
  const leadsQ = trpc.vendors.getLeads.useQuery({ vendorId }, { enabled: !!vendorId });
  const updateStatus = trpc.bookings.updateStatus.useMutation({ onSuccess: () => jobsQ.refetch() });
  const submitKyc = trpc.vendors.submitKyc.useMutation({
    onSuccess: () => { setKycDone(true); meQ.refetch(); window.setTimeout(() => { setKycOpen(false); setKycDone(false); }, 1800); },
  });
  // Persist a doc URL the moment it uploads so it survives refresh.
  const setKycDoc = trpc.vendors.setKycDoc.useMutation({ onSuccess: () => meQ.refetch() });
  const saveAadhaar = (url: string) => { setAadhaar(url); setKycDoc.mutate({ aadhaarDoc: url }); };
  const savePan = (url: string) => { setPan(url); setKycDoc.mutate({ panDoc: url }); };
  const savePhoto = (url: string) => { setPhoto(url); setKycDoc.mutate({ profilePhoto: url }); };
  const notifQ = trpc.admin.notifications.useQuery({ limit: 10 }, { enabled: !!vendorId && status === "authenticated" });
  const markRead = trpc.admin.markNotificationRead.useMutation({ onSuccess: () => notifQ.refetch() });
  const respondLead = trpc.vendors.respondLead.useMutation({ onSuccess: () => leadsQ.refetch() });
  const updateServiceArea = trpc.vendors.updateServiceArea.useMutation({ onSuccess: () => meQ.refetch() });
  const setAddress = trpc.areas.setAddress.useMutation({ onSuccess: () => { meQ.refetch(); setStreet(""); } });
  const [pinErr, setPinErr] = useState("");
  const [street, setStreet] = useState("");

  const profile = meQ.data as Profile | undefined;
  const profileLoaded = !!profile;
  const isApproved = profile?.vendorProfile?.isApproved ?? false;
  const kycStatus = profile?.vendorProfile?.kycStatus ?? "PENDING";
  const servingQ = trpc.areas.byCity.useQuery({ city: profile?.city ?? "" }, { enabled: !!profile?.city && !!profile?.vendorProfile?.streetAddress });
  const serving = servingQ.data as { city?: string; pincodes?: string[]; isActive?: boolean } | null | undefined;
  const canPickArea = !!profile?.vendorProfile?.streetAddress;

  // Autofill business fields from the profile the first time the modal opens
  useEffect(() => {
    if (kycOpen && profile?.vendorProfile) {
      const p = profile.vendorProfile;
      setBizName((b) => b || p.businessName);
      setExp(String(p.yearsOfExperience ?? 2));
      setAadhaar((v) => v || p.aadhaarDoc || "");
      setPan((v) => v || p.panDoc || "");
      setPhoto((v) => v || p.profilePhoto || "");
      setGst((v) => v || p.gst || "");
    }
  }, [kycOpen, profile]);

  // Pop the KYC modal on first load when not approved
  useEffect(() => {
    if (status === "authenticated" && profileLoaded && !isApproved && kycStatus === "PENDING") {
      setKycOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, profileLoaded]);

  const stats = statsQ.data as { totalEarnings?: number; totalJobs?: number; completedJobs?: number; pendingJobs?: number; rating?: number } | undefined;
  const jobs = useMemo(() => ((jobsQ.data as BookingRow[] | undefined) ?? []), [jobsQ.data]);
  const leads = useMemo(() => ((leadsQ.data as LeadRow[] | undefined) ?? []), [leadsQ.data]);
  const pendingLeads = leads.filter((l) => l.status === "pending").length;
  const notifications = useMemo(() => ((notifQ.data as { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string | Date }[] | undefined) ?? []), [notifQ.data]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const performLogout = () => {
    setLoggingOut("signedout");
    window.setTimeout(() => signOut({ callbackUrl: "/" }), 1200);
  };

  if (status === "loading") return <div className="p-10 text-muted">Loading dashboard…</div>;
  if (status !== "authenticated" || (role !== "VENDOR" && role !== "ADMIN")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold text-ink">Vendor login required</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Login</button>
      </div>
    );
  }

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKycErr("");
    // All fields optional — partial KYC stays PENDING and can be resumed.
    const complete = bizName.trim().length >= 2 && !!aadhaar && !!pan && !!photo;
    setKycComplete(complete);
    submitKyc.mutate({
      businessName: bizName.trim(),
      yearsOfExperience: Number(exp) || 0,
      aadhaarDoc: aadhaar || undefined,
      panDoc: pan || undefined,
      profilePhoto: photo || undefined,
      gst: gst.trim() === "" ? undefined : gst.trim(),
    });
  };

  const NAV: { key: Tab; label: string; Icon: typeof LayoutDashboard; badge?: number }[] = [
    { key: "overview", label: "Overview", Icon: LayoutDashboard },
    { key: "orders", label: "Live Orders", Icon: Inbox, badge: pendingLeads },
    { key: "jobs", label: "My Jobs", Icon: Briefcase, badge: stats?.pendingJobs },
    { key: "kyc", label: "KYC & Area", Icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans lg:flex">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink text-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
          <Image src="/logo.png" alt="ADDies" width={36} height={36} className="h-9 w-9 rounded-xl bg-white object-contain p-0.5" />
          <div className="leading-none">
            <p className="truncate text-[15px] font-extrabold">{profile?.vendorProfile?.businessName ?? "Vendor Console"}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300">
              {isApproved ? "Approved partner" : kycStatus === "UNDER_REVIEW" ? "KYC under review" : "Complete your KYC"}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map(({ key, label, Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ${tab === key ? "bg-white text-ink shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={17} className={tab === key ? "text-primary-600" : ""} />
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && badge > 0 ? <span className="rounded-full bg-accent-400 px-2 py-0.5 text-[11px] font-extrabold text-accent-ink">{badge}</span> : null}
              {tab === key ? <ChevronRight size={14} className="text-muted" /> : null}
            </button>
          ))}
        </nav>
        <div className="space-y-1 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            <Store size={17} /> View storefront <ArrowUpRight size={12} className="ml-auto" />
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
        {/* ── Desktop header ── */}
        <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-line bg-white/95 px-6 py-3 backdrop-blur lg:flex">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-ink">Welcome back, {profile?.fullName?.split(" ")[0] ?? "there"} 👋</h1>
            <p className="text-xs font-medium text-muted">{profile?.city ?? ""} • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" className="relative rounded-full border border-line bg-white p-2.5 text-body shadow-sm transition-all hover:border-primary-300 hover:text-primary-700">
              <Bell size={18} />
              {unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-extrabold text-white">{unreadCount}</span> : null}
            </button>
            <span className="chip chip-success hidden sm:inline-flex">● Online</span>
          </div>
        </header>

        {/* ── Mobile header ── */}
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center gap-2 px-3">
            <Image src="/logo.png" alt="ADDies" width={30} height={30} className="h-8 w-8 object-contain" />
            <p className="truncate text-sm font-extrabold text-ink">{profile?.vendorProfile?.businessName ?? "Vendor Console"}</p>
            <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" className="relative ml-auto rounded-full p-2 text-muted hover:bg-surface hover:text-ink">
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
          {/* KYC status banner (when not approved) */}
          {!isApproved ? (
            <div className={`flex flex-wrap items-center justify-between gap-3 rounded-3xl border px-4 py-3 ${kycStatus === "UNDER_REVIEW" ? "border-accent-200 bg-accent-50" : "border-accent-200 bg-accent-50"}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-400 text-accent-ink"><ShieldCheck size={20} /></span>
                <div>
                  <p className="text-sm font-extrabold text-accent-ink">
                    {kycStatus === "UNDER_REVIEW" ? "KYC submitted — under review" : "Action required: complete your KYC to get leads"}
                  </p>
                  <p className="text-xs font-medium text-accent-600">
                    {kycStatus === "UNDER_REVIEW" ? "Our team reviews within 24–48 hours. You'll be notified on approval." : "Verify your identity + business docs to go live — it takes ~3 minutes."}
                  </p>
                </div>
              </div>
              {kycStatus !== "UNDER_REVIEW" ? (
                <button onClick={() => setKycOpen(true)} className="btn-accent !py-2">Start KYC <ChevronRight size={14} /></button>
              ) : (
                <span className="chip chip-accent">Under review</span>
              )}
            </div>
          ) : null}

          {/* ═══════ OVERVIEW ═══════ */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { icon: IndianRupee, l: "Total earnings", v: inr(stats?.totalEarnings ?? 0), sub: "completed jobs" },
                  { icon: Briefcase, l: "Jobs", v: `${stats?.totalJobs ?? 0}`, sub: `${stats?.completedJobs ?? 0} completed` },
                  { icon: Clock, l: "Pending", v: `${stats?.pendingJobs ?? 0}`, sub: "needs action" },
                  { icon: Star, l: "Rating", v: `★${(stats?.rating ?? 0).toFixed(1)}`, sub: `${stats?.totalReviews ?? 0} reviews` },
                ].map((s) => (
                  <div key={s.l} className="stat-card">
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted"><s.icon size={13} />{s.l}</p>
                    <p className="mt-1 text-2xl font-extrabold text-ink">{s.v}</p>
                    <p className="mt-0.5 text-xs font-semibold text-muted">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="card">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-extrabold text-ink">New leads</p>
                    <button onClick={() => setTab("orders")} className="text-[13px] font-bold text-primary-600">View all →</button>
                  </div>
                  {leads.length === 0 ? (
                    <p className="sub py-6 text-center">No leads yet — complete your KYC to get booked.</p>
                  ) : (
                    leads.slice(0, 5).map((l) => (
                      <div key={l.id} className="row-line flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-body">{l.booking?.description?.slice(0, 55)}</span>
                        <span className="flex shrink-0 items-center gap-2"><b className="text-ink">{inr(l.booking?.totalAmount ?? 0)}</b><span className="chip chip-primary">{l.status}</span></span>
                      </div>
                    ))
                  )}
                </div>
                <div className="card">
                  <p className="mb-2 font-extrabold text-ink">Recent jobs</p>
                  {jobs.length === 0 ? (
                    <p className="sub py-6 text-center">Nothing yet — you'll see bookings appear here live.</p>
                  ) : (
                    jobs.slice(0, 5).map((j) => (
                      <div key={j.id} className="row-line flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-body">{j.description.slice(0, 50)} • <b className="text-ink">{inr(j.totalAmount)}</b></span>
                        <span className="chip chip-primary shrink-0">{j.status.replace(/_/g, " ")}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* ═══════ JOBS ═══════ */}
          {tab === "jobs" && (
            <div className="card">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-extrabold text-ink">My jobs <span className="chip chip-neutral ml-1">{jobs.length}</span></p>
                {jobsQ.isFetching ? <span className="text-xs font-semibold text-muted">Syncing…</span> : null}
              </div>
              {jobs.length === 0 ? (
                <p className="sub py-8 text-center">No jobs assigned yet.</p>
              ) : (
                jobs.map((j) => {
                  const FLOW = ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"] as const;
                  const idx = FLOW.indexOf(j.status as (typeof FLOW)[number]);
                  return (
                  <div key={j.id} className="row-line !py-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{j.description} <span className="font-extrabold text-primary-600">• {inr(j.totalAmount)}</span></p>
                        <p className="text-xs text-muted">Customer: {j.customer?.fullName ?? "—"}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {["ACCEPTED", "IN_PROGRESS", "COMPLETED"].map((s) => (
                          <button key={s} onClick={() => updateStatus.mutate({ id: j.id, status: s as "ACCEPTED" })} disabled={updateStatus.isPending} className="rounded-full bg-surface px-3 py-1 text-[11px] font-bold text-body hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50">{s.replace(/_/g, " ")}</button>
                        ))}
                      </div>
                    </div>
                    {/* status timeline */}
                    <div className="mt-3 flex items-center gap-0">
                      {FLOW.map((s, i) => {
                        const done = idx >= i;
                        return (
                          <div key={s} className="flex flex-1 items-center last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold ${done ? (j.status === s ? "bg-primary-600 text-white ring-2 ring-primary-200" : "bg-success text-white") : "bg-surface text-muted ring-1 ring-line"}`}>
                                {done && j.status !== s ? <Check size={11} /> : s === j.status ? <Clock size={11} /> : i + 1}
                              </div>
                              <p className={`text-[9px] font-bold ${done ? "text-primary-700" : "text-muted"}`}>{s.replace(/_/g, " ")}</p>
                            </div>
                            {i < FLOW.length - 1 ? <div className={`mx-1 mb-4 h-0.5 flex-1 rounded ${idx > i ? "bg-success" : "bg-line"}`} /> : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
              )}
            </div>
          )}

          {/* ═══════ LIVE ORDERS (rider-style) ═══════ */}
          {tab === "orders" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-ink">Incoming orders <span className="chip chip-accent ml-1">{pendingLeads} awaiting you</span></p>
                <span className="chip chip-primary">🔴 Live</span>
              </div>
              {leads.filter((l) => l.status === "pending").length === 0 ? (
                <div className="card">
                  <p className="sub py-8 text-center">No incoming orders right now — approved vendors get matched to bookings automatically. Keep your area pincodes updated in KYC & Area.</p>
                </div>
              ) : (
                leads.filter((l) => l.status === "pending").map((l) => (
                  <div key={l.id} className="card relative overflow-hidden !p-4">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-400 to-primary-600" />
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-extrabold leading-snug text-ink">{l.booking?.description?.slice(0, 80)}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-semibold text-muted">
                          <span className="chip chip-primary">₹{l.booking?.totalAmount}</span>
                          <span className="chip chip-neutral">📅 {l.booking?.preferredDate ?? "—"} {l.booking?.timeSlot?.label ?? ""}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted">{l.booking?.createdAt ? new Date(l.booking.createdAt).toLocaleString("en-IN") : ""}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => respondLead.mutate({ leadId: l.id, accept: true })}
                          disabled={respondLead.isPending}
                          className="rounded-full bg-success px-5 py-2 text-sm font-extrabold text-white hover:brightness-95 disabled:opacity-50"
                        >
                          <Check size={15} className="mr-1 inline" /> Accept
                        </button>
                        <button
                          onClick={() => respondLead.mutate({ leadId: l.id, accept: false })}
                          disabled={respondLead.isPending}
                          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-body hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {leads.filter((l) => l.status === "accepted").length > 0 ? (
                <div className="card">
                  <p className="mb-2 font-extrabold text-ink">Accepted — in progress</p>
                  {leads.filter((l) => l.status === "accepted").map((l) => (
                    <div key={l.id} className="row-line flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-body">{l.booking?.description?.slice(0, 55)}</span>
                      <span className="chip chip-success shrink-0">Accepted</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════ KYC ═══════ */}
          {tab === "kyc" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card">
                <p className="font-extrabold text-ink">Verification status</p>
                <p className="sub mb-4">Documents are stored securely and used only for identity verification.</p>
                <div className="space-y-2.5">
                  {[
                    { icon: BadgeCheck, l: "Email verified", ok: true },
                    { icon: ShieldCheck, l: isApproved ? "KYC approved" : kycStatus === "UNDER_REVIEW" ? "KYC under review" : "KYC pending", ok: isApproved || kycStatus === "UNDER_REVIEW" },
                    { icon: FileText, l: "Aadhaar", ok: !!profile?.vendorProfile?.aadhaarDoc },
                    { icon: FileText, l: "PAN", ok: !!profile?.vendorProfile?.panDoc },
                    { icon: UserRound, l: "Profile photo", ok: !!profile?.vendorProfile?.profilePhoto },
                  ].map((r) => (
                    <div key={r.l} className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5">
                      <span className="flex items-center gap-2.5 text-sm font-bold text-body"><r.icon size={16} className="text-primary-600" />{r.l}</span>
                      {r.ok ? <span className="chip chip-success">✓ Done</span> : <span className="chip chip-neutral">Pending</span>}
                    </div>
                  ))}
                </div>
                {!isApproved && kycStatus !== "UNDER_REVIEW" ? (
                  <button onClick={() => setKycOpen(true)} className="btn-accent mt-4 w-full !py-3">Start KYC now</button>
                ) : null}
              </div>
              <div className="card">
                <p className="font-extrabold text-ink">Service area</p>
                <p className="sub mb-3">Only pincodes we serve in your city ({profile?.city ?? "—"}) — agents monitor you inside your area.</p>

                {!canPickArea ? (
                  <>
                    <p className="rounded-xl bg-accent-50 px-3.5 py-2.5 text-[13px] font-semibold text-accent-600">
                      You don&apos;t have a service address yet — set your street/city first, then pick your serving pincodes.
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder={`Street / colony — e.g. MG Road, ${profile?.city ?? ""}`} className="input !py-2.5" />
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
                    We don&apos;t serve <b className="text-ink">{profile?.city}</b> yet. Ask your agent/admin to add it to serving areas.
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-xs font-bold text-body">Your address: <span className="text-ink">{profile?.vendorProfile?.streetAddress}</span></p>
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Serving pincodes in {serving.city}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(serving.pincodes ?? []).map((p) => {
                        const sel = (profile?.vendorProfile?.serviceAreaPincodes ?? []).includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              const cur = profile?.vendorProfile?.serviceAreaPincodes ?? [];
                              updateServiceArea.mutate({ pincodes: sel ? cur.filter((x) => x !== p) : [...cur, p] });
                            }}
                            disabled={updateServiceArea.isPending}
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${sel ? "border-primary-600 bg-primary-600 text-white shadow-sm" : "border-line bg-white text-body hover:border-primary-300 hover:text-primary-700"}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      {!serving.pincodes?.length ? <p className="text-xs text-muted">No pincodes configured for this city yet.</p> : null}
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-muted">Select the pincodes you serve — your selections are what agents see for area monitoring.</p>
                  </>
                )}
              </div>
              <div className="card">
                <p className="font-extrabold text-ink">Why KYC matters</p>
                <div className="mt-2 space-y-2 text-sm text-body">
                  <p className="flex items-start gap-2"><Award size={16} className="mt-0.5 shrink-0 text-accent-500" /> Approved vendors get the <b>Verified</b> badge customers trust.</p>
                  <p className="flex items-start gap-2"><TrendingUp size={16} className="mt-0.5 shrink-0 text-primary-600" /> Leads are matched only to approved vendors in your area.</p>
                  <p className="flex items-start gap-2"><Building2 size={16} className="mt-0.5 shrink-0 text-success" /> Faster payouts on completed jobs.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── KYC modal ── */}
      {kycOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl rounded-3xl bg-surface p-5 shadow-pop">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-400 text-accent-ink"><ShieldCheck size={22} /></span>
                <div>
                  <p className="text-lg font-extrabold text-ink">{kycDone ? "KYC submitted!" : "Complete your KYC"}</p>
                  <p className="text-xs font-medium text-accent-600">Takes ~3 minutes • verified within 24–48 hrs</p>
                </div>
              </div>
              <button onClick={() => setKycOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"><X size={18} /></button>
            </div>

            {/* urgency strip */}
            {!kycDone && kycStatus === "PENDING" ? (
              <div className="mb-3 flex items-start gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-3.5 py-2.5 text-[13px] font-semibold text-accent-600">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent-500" />
                <span><b className="text-accent-ink">Action required.</b> Until your KYC is approved you can&apos;t receive new leads — submitting complete documents avoids delays.</span>
              </div>
            ) : null}

            {kycDone ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft"><CheckCircle2 size={32} className="text-success" /></span>
                <p className="mt-2 text-lg font-extrabold text-ink">Details saved</p>
                <p className="sub max-w-sm">
                  {kycComplete
                    ? "Your KYC is complete and under review — you'll be notified here once approved."
                    : "Your KYC is still pending. Add the remaining documents (Aadhaar, PAN, profile photo) to go under review."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[13px] font-extrabold text-ink">Business name</label>
                    <input value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="e.g. Kumar Plumbing Works" className="input !py-2.5" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-extrabold text-ink">Experience (years)</label>
                    <input inputMode="numeric" value={exp} onChange={(e) => setExp(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="2" className="input !py-2.5" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-extrabold text-ink">GSTIN <span className="font-semibold text-muted">(optional)</span></label>
                  <input value={gst} onChange={(e) => setGst(e.target.value.toUpperCase().slice(0, 15))} placeholder="e.g. 27ABCDE1234F1Z5" className="input !py-2.5" />
                </div>

                <div className="rounded-2xl border border-accent-200 bg-white p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-accent-600">
                    <ShieldCheck size={13} /> Identity documents <span className="text-accent-500">— all optional, you can submit partial and finish later</span>
                  </p>
                  <div className="space-y-2">
                    <KycUpload label="Aadhaar Card" value={aadhaar} hint="JPG / PNG / PDF, up to 4 MB" onUpload={saveAadhaar} onRemove={() => saveAadhaar("")} />
                    <KycUpload label="PAN Card" value={pan} hint="JPG / PNG / PDF, up to 4 MB" onUpload={savePan} onRemove={() => savePan("")} />
                    <KycUpload label="Profile photo" value={photo} hint="A clear face photo (JPG / PNG)" onUpload={savePhoto} onRemove={() => savePhoto("")} />
                  </div>
                </div>

                {kycErr !== "" ? <p className="rounded-xl bg-danger-soft px-3 py-2 text-[13px] font-semibold text-danger">{kycErr}</p> : null}

                <button type="submit" disabled={submitKyc.isPending} className="btn-primary w-full !py-3.5 disabled:opacity-60">
                  {submitKyc.isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><ShieldCheck size={16} /> Save KYC details</>}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-accent-600">
                  <ShieldCheck size={12} className="shrink-0" /> Everything is optional — submit anytime. Your status stays <b>Pending</b> until business name + Aadhaar + PAN + photo are all provided.
                </p>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {/* ── notifications panel ── */}
      {notifOpen ? (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={() => setNotifOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
              <p className="font-extrabold text-ink">Notifications <span className="chip chip-neutral ml-1">{notifications.length}</span></p>
              <div className="flex items-center gap-1">
                {unreadCount > 0 ? (
                  <button onClick={() => notifications.filter((n) => !n.isRead).forEach((n) => markRead.mutate({ id: n.id }))} className="rounded-full p-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50"><CheckCheck size={15} /> Mark all read</button>
                ) : null}
                <button onClick={() => setNotifOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"><X size={18} /></button>
              </div>
            </div>
            <div className="p-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <BellOff size={24} className="text-muted" />
                  <p className="text-sm font-bold text-ink">All caught up</p>
                  <p className="text-xs text-muted">KYC reminders, lead updates and job alerts appear here.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`mb-2 rounded-2xl border p-3 ${n.isRead ? "border-line bg-white" : "border-primary-200 bg-primary-50"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-extrabold text-ink">{n.title}</p>
                      {!n.isRead ? <span className="chip chip-primary shrink-0">New</span> : null}
                    </div>
                    <p className="mt-0.5 text-[13px] text-body">{n.message}</p>
                    <p className="mt-1 text-[11px] font-medium text-muted">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── logout confirm / signed-out overlays ── */}
      {loggingOut === "confirm" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-pop">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft">
              <LogOut size={24} className="text-danger" />
            </span>
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
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <LogOut size={28} className="text-primary-600" />
            </span>
            <p className="mt-4 text-xl font-extrabold tracking-tight text-ink">Signed out</p>
            <p className="sub mt-1">See you soon — redirecting home…</p>
            <div className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-surface">
              <div className="h-full w-full origin-left animate-pulse rounded-full bg-gradient-to-r from-primary-600 to-accent-400" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}