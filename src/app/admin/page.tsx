"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, UserCheck, CalendarClock, Store, Users, MapPinned, Tags, Wallet,
  Megaphone, Search, Check, Ban, RefreshCw, Plus, LogOut, IndianRupee, TrendingUp,
  Clock, AlertTriangle, Star, ExternalLink, Receipt, Send, Globe, ChevronRight, Bell,
} from "lucide-react";
import { trpc } from "~/trpc/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/uploadthing";
import { LoadingConsole, StatSkeleton, ChartSkeleton, ListSkeleton, InlineSync } from "~/app/admin/components/loaders";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type Tab = "overview" | "approvals" | "bookings" | "vendors" | "users" | "agents" | "categories" | "finance" | "broadcast";

const STATUSES = ["ALL", "PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"] as const;
const SET_STATUSES = ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"] as const;
const USER_ROLES = ["ALL", "CUSTOMER", "VENDOR", "AGENT", "ADMIN"] as const;

const STATUS_STYLE: Record<string, string> = {
  PENDING: "chip chip-accent",
  ASSIGNED: "chip chip-primary",
  ACCEPTED: "chip chip-primary",
  IN_PROGRESS: "chip chip-primary",
  COMPLETED: "chip chip-success",
  CANCELLED: "chip chip-neutral",
  DISPUTED: "chip chip-danger",
  PAID: "chip chip-success",
  REFUNDED: "chip chip-neutral",
  FAILED: "chip chip-danger",
  APPROVED: "chip chip-success",
  REJECTED: "chip chip-danger",
  UNDER_REVIEW: "chip chip-accent",
};

interface StatsData {
  totalRevenue: number; platformFee: number; totalBookings: number; completedBookings: number;
  customers: number; vendors: number; agents: number; pendingKyc: number; openDisputes: number;
  avgOrderValue: number; todayCount: number; walletLiability: number;
  byStatus: Record<string, number>;
  trend: { day: string; revenue: number; bookings: number }[];
  revenueByCity: { city: string; bookings: number; revenue: number }[];
  recentBookings: { id: string; status: string; totalAmount: number; customer?: { fullName: string } | null }[];
}
interface VendorRow {
  id: string; fullName: string; mobile: string; city: string; isActive: boolean; isVerified: boolean;
  vendorProfile?: { businessName: string; kycStatus: string; isApproved: boolean; subscriptionPlan: string; rating: number; totalReviews: number; serviceCategories: string[]; yearsOfExperience: number; gst?: string | null; aadhaarDoc?: string | null; panDoc?: string | null; profilePhoto?: string | null } | null;
}
interface BookingRow {
  id: string; status: string; paymentStatus: string; totalAmount: number; description: string;
  customer?: { fullName: string; mobile: string } | null;
  vendor?: { id: string; fullName: string } | null;
}
interface UserRow {
  id: string; fullName: string; mobile: string; role: string; city: string; isActive: boolean;
  customerProfile?: { walletBalance: number } | null;
}
interface AgentRow { id: string; fullName: string; mobile: string; city: string; commissionPercent: number; cityBookings: number; cityGmv: number; commissionEarned: number }
interface CatRow { id: string; slug: string; name: string; icon: string; image?: string | null; rating: number; totalBookings: number; isFeatured: boolean; sortOrder: number; isActive: boolean; commissionPercent: number; subCategories: { id: string; name: string; basePrice: number; unit: string }[] }
interface TxRow { id: string; type: string; amount: number; description: string; balanceAfter: number; createdAt: string | Date; user: { fullName: string; mobile: string; role: string } }
interface NotifRow { id: string; title: string; message: string; type: string; createdAt: string | Date }

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtCount(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${n}`;
}

/** KYC completeness for a vendor profile: what's filled vs missing. */
function kycChecklist(p: VendorRow["vendorProfile"]) {
  const items: { label: string; ok: boolean }[] = [
    { label: "Business name", ok: !!p?.businessName?.trim() },
    { label: "Experience", ok: !!p?.yearsOfExperience },
    { label: "Aadhaar card", ok: !!p?.aadhaarDoc },
    { label: "PAN card", ok: !!p?.panDoc },
    { label: "Profile photo", ok: !!p?.profilePhoto },
    { label: "GSTIN", ok: !!p?.gst },
  ];
  return { items, missing: items.filter((i) => !i.ok).map((i) => i.label) };
}

function KycChecklist({ p }: { p: VendorRow["vendorProfile"] }) {
  const { items, missing } = kycChecklist(p);
  const done = items.filter((i) => i.ok).length;
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">KYC details</p>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${missing.length === 0 ? "bg-success-soft text-success" : "bg-accent-100 text-accent-600"}`}>
          {done}/6 filled
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {items.map((i) => (
          <span key={i.label} className="flex items-center gap-1.5 text-xs font-semibold text-body">
            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold ${i.ok ? "bg-success text-white" : "bg-accent-300 text-accent-ink"}`}>
              {i.ok ? "✓" : "!"}
            </span>
            {i.label}
          </span>
        ))}
      </div>
      {missing.length > 0 ? (
        <p className="mt-2 text-[11px] font-semibold text-accent-600">Missing: {missing.join(", ")}</p>
      ) : (
        <p className="mt-2 text-[11px] font-semibold text-success">All KYC items submitted</p>
      )}
    </div>
  );
}

function Chip({ value }: { value: string }) {
  return <span className={STATUS_STYLE[value] ?? "chip chip-neutral"}>{value.replace(/_/g, " ")}</span>;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className ?? ""}`}>{children}</div>;
}

function Empty({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-line bg-surface px-4 py-8 text-center">
      <p className="text-sm font-extrabold text-ink">{title}</p>
      <p className="max-w-sm text-[13px] text-muted">{hint}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

function HeroPhotoEditor({ label, onSave }: { label: string; onSave: (url: string) => void }) {
  const [err, setErr] = useState("");
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const url = res[0]?.url;
      if (url) onSave(url);
    },
    onUploadError: (e: Error) => setErr(e.message),
  });

  return (
    <span className="inline-flex flex-col items-stretch gap-1">
      <label className={`cursor-pointer rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-extrabold text-white backdrop-blur-md hover:bg-white/35 ${isUploading ? "pointer-events-none opacity-70" : ""}`}>
        {isUploading ? "Uploading…" : label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) {
              setErr("");
              void startUpload([f]);
            }
          }}
        />
      </label>
      {err !== "" ? <span className="rounded-lg bg-danger px-2 py-1 text-[10px] font-bold text-white">{err}</span> : null}
    </span>
  );
}

function TextSaver({ value, onSave, saving, placeholder, width }: { value: string; onSave: (v: string) => void; saving: boolean; placeholder?: string; width?: string }) {
  const [v, setV] = useState(value);
  const dirty = v !== value;
  return (
    <span className="inline-flex w-full items-center gap-1.5">
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        className={`input min-w-0 flex-1 !px-2.5 !py-1.5 !text-[13px] ${width ?? ""}`}
      />
      <button
        type="button"
        disabled={!dirty || saving}
        onClick={() => onSave(v)}
        className="shrink-0 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
      >
        {saving ? "…" : "Save"}
      </button>
    </span>
  );
}

function NumberSaver({ value, onSave, saving, suffix }: { value: number; onSave: (v: number) => void; saving: boolean; suffix?: string }) {
  const [v, setV] = useState(String(value));
  const dirty = v !== String(value);
  return (
    <span className="inline-flex w-full items-center gap-1.5">
      <input
        type="number"
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="input min-w-0 flex-1 !px-2.5 !py-1.5 !text-[13px]"
      />
      {suffix ? <span className="shrink-0 text-xs font-bold text-muted">{suffix}</span> : null}
      <button
        type="button"
        disabled={!dirty || saving}
        onClick={() => {
          const n = Number(v);
          if (Number.isFinite(n)) onSave(n);
        }}
        className="shrink-0 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
      >
        {saving ? "…" : "Save"}
      </button>
    </span>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<Tab>("overview");
  const [loggingOut, setLoggingOut] = useState<"confirm" | "signedout" | null>(null);
  const [bookingStatus, setBookingStatus] = useState<(typeof STATUSES)[number]>("ALL");
  const [bookingSearch, setBookingSearch] = useState("");
  const [userRole, setUserRole] = useState<(typeof USER_ROLES)[number]>("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [userSearchDeb, setUserSearchDeb] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [assignSel, setAssignSel] = useState<Record<string, string>>({});
  const [statusSel, setStatusSel] = useState<Record<string, string>>({});
  const [bTitle, setBTitle] = useState("");
  const [bMsg, setBMsg] = useState("");
  const [bRole, setBRole] = useState<"CUSTOMER" | "VENDOR" | "AGENT" | undefined>(undefined);
  const [newCat, setNewCat] = useState({ name: "", icon: "🔧", commission: "10", description: "" });
  const [subForm, setSubForm] = useState({ catId: "", name: "", price: "", unit: "per job" });
  const [catSearch, setCatSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setUserSearchDeb(userSearch.trim()), 400);
    return () => clearTimeout(t);
  }, [userSearch]);

  const authed = status === "authenticated";
  const role = ((session?.user as { role?: string } | undefined)?.role ?? "").toUpperCase();
  const isEnvRoot = (session?.user)?.id === "env-superadmin";
  const myMobile = (session?.user as { mobile?: string } | undefined)?.mobile ?? "";

  const statsQ = trpc.admin.stats.useQuery(undefined, { enabled: authed && role === "ADMIN" });
  const vendorsQ = trpc.vendors.list.useQuery({ limit: 50 }, { enabled: authed && (tab === "approvals" || tab === "vendors" || tab === "bookings") });
  const bookingsQ = trpc.bookings.listAll.useQuery(
    { status: bookingStatus === "ALL" ? undefined : bookingStatus, limit: 50 },
    { enabled: authed && (tab === "bookings" || tab === "overview") },
  );
  const disputesQ = trpc.bookings.listAll.useQuery({ status: "DISPUTED", limit: 10 }, { enabled: authed && tab === "overview" });
  const usersQ = trpc.users.getAll.useQuery(
    { role: userRole === "ALL" ? undefined : userRole as "CUSTOMER", search: userSearchDeb === "" ? undefined : userSearchDeb, limit: 30 },
    { enabled: authed && tab === "users" },
  );
  const agentsQ = trpc.admin.agentsOverview.useQuery(undefined, { enabled: authed && tab === "agents" });
  const catsQ = trpc.categories.getAll.useQuery({ includeInactive: true }, { enabled: authed && tab === "categories" });
  const walletQ = trpc.admin.walletTx.useQuery({ limit: 25 }, { enabled: authed && tab === "finance" });
  const notifsQ = trpc.admin.notifications.useQuery({ limit: 10 }, { enabled: authed && tab === "broadcast" });

  const refreshAll = () => {
    void utils.invalidate();
  };

  const toggleUser = trpc.users.toggleActive.useMutation({ onSuccess: () => void usersQ.refetch() });
  const approveVendor = trpc.vendors.approveVendor.useMutation({ onSuccess: () => { void vendorsQ.refetch(); void statsQ.refetch(); } });
  const toggleVendor = trpc.vendors.toggleActive.useMutation({ onSuccess: () => void vendorsQ.refetch() });
  const updateBooking = trpc.bookings.updateStatus.useMutation({ onSuccess: () => { void bookingsQ.refetch(); void disputesQ.refetch(); void statsQ.refetch(); } });
  const assignVendor = trpc.bookings.assignVendor.useMutation({ onSuccess: () => { void bookingsQ.refetch(); void statsQ.refetch(); } });
  const refundBooking = trpc.admin.refundBooking.useMutation({ onSuccess: () => { void bookingsQ.refetch(); void walletQ.refetch(); void statsQ.refetch(); } });
  const toggleCat = trpc.categories.toggleActive.useMutation({ onSuccess: () => void catsQ.refetch() });
  const createCat = trpc.categories.create.useMutation({ onSuccess: () => { setNewCat({ name: "", icon: "🔧", commission: "10", description: "" }); void catsQ.refetch(); } });
  const upsertSub = trpc.categories.upsertSubCategory.useMutation({ onSuccess: () => { setSubForm({ catId: "", name: "", price: "", unit: "per job" }); void catsQ.refetch(); } });
  const updateCat = trpc.admin.updateCategory.useMutation({ onSuccess: () => void catsQ.refetch() });
  const seedCats = trpc.admin.seedCategories.useMutation({ onSuccess: () => void catsQ.refetch() });
  const updateComm = trpc.admin.updateAgentCommission.useMutation({ onSuccess: () => void agentsQ.refetch() });
  const remindKyc = trpc.vendors.remindKyc.useMutation({ onSuccess: () => alert("Reminder sent to the vendor's notifications.") });
  const broadcast = trpc.admin.broadcast.useMutation({ onSuccess: () => void notifsQ.refetch() });

  const stats = statsQ.data as StatsData | undefined;
  const vendors = useMemo(() => ((vendorsQ.data as { vendors?: VendorRow[] } | undefined)?.vendors ?? []), [vendorsQ.data]);
  const pendingKyc = useMemo(() => vendors.filter((v) => !v.vendorProfile?.isApproved), [vendors]);
  const approvedVendors = useMemo(() => vendors.filter((v) => v.vendorProfile?.isApproved && v.isActive), [vendors]);
  const bookings = useMemo(() => {
    const list = ((bookingsQ.data as { bookings?: BookingRow[] } | undefined)?.bookings ?? []);
    const q = bookingSearch.trim().toLowerCase();
    if (q === "") return list;
    return list.filter((b) =>
      b.id.toLowerCase().includes(q) ||
      (b.customer?.fullName ?? "").toLowerCase().includes(q) ||
      (b.customer?.mobile ?? "").includes(q) ||
      b.description.toLowerCase().includes(q),
    );
  }, [bookingsQ.data, bookingSearch]);
  const unassigned = useMemo(() => bookings.filter((b) => !b.vendor && b.status === "PENDING"), [bookings]);
  const users = useMemo(() => ((usersQ.data as { users?: UserRow[] } | undefined)?.users ?? []), [usersQ.data]);
  const vendorRows = useMemo(() => {
    const q = vendorSearch.trim().toLowerCase();
    if (q === "") return vendors;
    return vendors.filter((v) =>
      (v.vendorProfile?.businessName ?? "").toLowerCase().includes(q) ||
      v.fullName.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q) ||
      v.mobile.includes(q),
    );
  }, [vendors, vendorSearch]);
  const agents = useMemo(() => ((agentsQ.data as AgentRow[] | undefined) ?? []), [agentsQ.data]);
  const cats = useMemo(() => ((catsQ.data as CatRow[] | undefined) ?? []), [catsQ.data]);
  const visibleCats = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    if (q === "") return cats;
    return cats.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q));
  }, [cats, catSearch]);
  const txs = useMemo(() => ((walletQ.data as TxRow[] | undefined) ?? []), [walletQ.data]);
  const notifs = useMemo(() => ((notifsQ.data as NotifRow[] | undefined) ?? []), [notifsQ.data]);
  const disputes = useMemo(() => ((disputesQ.data as { bookings?: BookingRow[] } | undefined)?.bookings ?? []), [disputesQ.data]);

  const maxTrend = Math.max(1, ...((stats?.trend ?? []).map((t) => t.revenue)));
  const maxFunnel = Math.max(1, ...SET_STATUSES.map((s) => stats?.byStatus[s] ?? 0));

  if (status === "loading") return <LoadingConsole />;

  const performLogout = () => {
    setLoggingOut("signedout");
    window.setTimeout(() => signOut({ callbackUrl: "/" }), 1200);
  };
  if (status !== "authenticated" || role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold text-ink">Super Admin access required</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Go to Login</button>
      </div>
    );
  }

  const NAV: { key: Tab; label: string; Icon: typeof LayoutDashboard; badge?: number }[] = [
    { key: "overview", label: "Overview", Icon: LayoutDashboard },
    { key: "approvals", label: "KYC Approvals", Icon: UserCheck, badge: stats?.pendingKyc },
    { key: "bookings", label: "Bookings", Icon: CalendarClock, badge: stats?.openDisputes },
    { key: "vendors", label: "Vendors", Icon: Store },
    { key: "users", label: "Users", Icon: Users },
    { key: "agents", label: "Agents", Icon: MapPinned },
    { key: "categories", label: "Categories", Icon: Tags },
    { key: "finance", label: "Finance", Icon: Wallet },
    { key: "broadcast", label: "Broadcast", Icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans lg:flex">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink text-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
          <Image src="/logo.png" alt="ADDies" width={36} height={36} className="h-9 w-9 rounded-xl bg-white object-contain p-0.5" />
          <div className="leading-none">
            <p className="text-[15px] font-extrabold">ADDies Ops</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300">{isEnvRoot ? "Env root • full control" : "Super Admin • full control"}</p>
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
              {badge !== undefined && badge > 0 ? (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${key === "bookings" ? "bg-danger text-white" : "bg-accent-400 text-accent-ink"}`}>{badge}</span>
              ) : null}
              {tab === key ? <ChevronRight size={14} className="text-muted" /> : null}
            </button>
          ))}
        </nav>
        <div className="space-y-1 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            <Globe size={17} /> View site <ExternalLink size={12} className="ml-auto" />
          </Link>
          <button onClick={() => setLoggingOut("confirm")} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-danger hover:bg-danger-soft">
            <LogOut size={17} /> Logout
          </button>
          <p className="px-3.5 pb-2 pt-1 font-mono text-[11px] text-slate-500">{myMobile}</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* ── Mobile header ── */}
        <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center gap-2 px-3">
            <Image src="/logo.png" alt="ADDies" width={30} height={30} className="h-8 w-8 object-contain" />
            <p className="text-sm font-extrabold text-ink">Ops Console</p>
            <button onClick={() => setLoggingOut("confirm")} className="ml-auto rounded-full px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger-soft">Logout</button>
          </div>
          <nav className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2.5">
            {NAV.map(({ key, label, badge }) => (
              <button key={key} onClick={() => setTab(key)} className={`tab-pill shrink-0 !text-[13px] ${tab === key ? "tab-pill-active" : "tab-pill-idle"}`}>
                {label}{badge !== undefined && badge > 0 ? ` (${badge})` : ""}
              </button>
            ))}
          </nav>
        </header>

        {/* ── Topbar ── */}
        <div className="hidden items-center justify-between border-b border-line bg-white/80 px-6 py-3 backdrop-blur lg:flex">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-ink">{NAV.find((n) => n.key === tab)?.label}</h1>
            <p className="text-xs font-medium text-muted">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} • All figures live from MongoDB</p>
          </div>
          <button onClick={refreshAll} className="btn-ghost !py-2 text-[13px]"><RefreshCw size={14} /> Refresh</button>
        </div>

        <main className="mx-auto max-w-6xl space-y-4 p-4 lg:p-6">
          {/* ══════════ OVERVIEW ══════════ */}
          {tab === "overview" && (
            <>
              {statsQ.isLoading ? (<div className="space-y-4"><StatSkeleton /><ChartSkeleton /></div>) : null}
              {stats ? (
                <>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      { icon: IndianRupee, l: "Revenue (completed)", v: inr(stats.totalRevenue), sub: `${inr(stats.platformFee)} platform fee`, hot: true },
                      { icon: CalendarClock, l: "Bookings", v: `${stats.totalBookings}`, sub: `${stats.completedBookings} done • ${stats.todayCount} today`, hot: false },
                      { icon: TrendingUp, l: "Avg order value", v: inr(stats.avgOrderValue), sub: "per completed booking", hot: true },
                      { icon: Wallet, l: "Wallet liability", v: inr(stats.walletLiability), sub: "customer balances", hot: false },
                      { icon: Users, l: "Customers", v: `${stats.customers}`, sub: "registered", hot: false },
                      { icon: Store, l: "Vendors", v: `${stats.vendors}`, sub: "onboarded", hot: false },
                      { icon: MapPinned, l: "Agents", v: `${stats.agents}`, sub: "across cities", hot: false },
                      { icon: AlertTriangle, l: "Needs attention", v: `${stats.pendingKyc + stats.openDisputes}`, sub: `${stats.pendingKyc} KYC • ${stats.openDisputes} disputes`, hot: stats.pendingKyc + stats.openDisputes > 0 },
                    ].map((s) => (
                      <div key={s.l} className={`stat-card ${s.hot ? "!border-accent-200 !bg-accent-50" : ""}`}>
                        <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted"><s.icon size={13} />{s.l}</p>
                        <p className="mt-1 text-2xl font-extrabold text-ink">{s.v}</p>
                        <p className="mt-0.5 text-xs font-semibold text-muted">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-5">
                    <Card className="lg:col-span-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="font-extrabold text-ink">Revenue — last 14 days</p>
                        <span className="chip chip-success">live</span>
                      </div>
                      {stats.trend.every((t) => t.revenue === 0) ? (
                        <Empty title="No revenue yet" hint="Completed bookings will plot here automatically, day by day." />
                      ) : (
                        <div className="mt-3 flex h-40 items-end gap-1.5">
                          {stats.trend.map((t) => (
                            <div key={t.day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${t.day}: ${inr(t.revenue)} • ${t.bookings} bookings`}>
                              <div className="w-full rounded-t-lg bg-gradient-to-t from-primary-700 to-primary-400 transition-all group-hover:from-accent-500 group-hover:to-accent-300" style={{ height: `${Math.max(4, Math.round((t.revenue / maxTrend) * 100))}%` }} />
                              <p className="mt-1.5 truncate text-center text-[9px] font-bold text-muted">{t.day.split(" ")[0]}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                    <Card className="lg:col-span-2">
                      <p className="mb-3 font-extrabold text-ink">Booking funnel</p>
                      <div className="space-y-2.5">
                        {SET_STATUSES.map((s) => {
                          const n = stats.byStatus[s] ?? 0;
                          return (
                            <button key={s} onClick={() => { setBookingStatus(s); setTab("bookings"); }} className="group block w-full text-left">
                              <div className="mb-1 flex items-center justify-between text-[13px]">
                                <span className="font-bold text-body group-hover:text-primary-700">{s.replace(/_/g, " ")}</span>
                                <span className="font-extrabold text-ink">{n}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-surface">
                                <div className={`h-full rounded-full ${s === "COMPLETED" ? "bg-success" : s === "DISPUTED" ? "bg-danger" : s === "CANCELLED" ? "bg-muted/50" : "bg-primary-500"}`} style={{ width: `${Math.max(2, Math.round((n / maxFunnel) * 100))}%` }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-extrabold text-ink">Needs attention</p>
                        <button onClick={() => setTab("approvals")} className="text-[13px] font-bold text-primary-600 hover:text-primary-700">Open queue →</button>
                      </div>
                      {pendingKyc.length === 0 && disputes.length === 0 ? (
                        <Empty title="All clear" hint="No pending KYC applications or open disputes right now." />
                      ) : (
                        <div className="space-y-2">
                          {pendingKyc.slice(0, 3).map((v) => (
                            <div key={v.id} className="flex items-center justify-between gap-2 rounded-xl bg-accent-50 px-3 py-2 text-sm">
                              <span className="font-bold text-body">KYC: {v.vendorProfile?.businessName ?? v.fullName}</span>
                              <button onClick={() => setTab("approvals")} className="shrink-0 text-[13px] font-extrabold text-accent-600">Review →</button>
                            </div>
                          ))}
                          {disputes.slice(0, 3).map((b) => (
                            <div key={b.id} className="flex items-center justify-between gap-2 rounded-xl bg-danger-soft px-3 py-2 text-sm">
                              <span className="font-bold text-body">Dispute: {b.id.slice(-6)} • {inr(b.totalAmount)}</span>
                              <button onClick={() => { setBookingStatus("DISPUTED"); setTab("bookings"); }} className="shrink-0 text-[13px] font-extrabold text-danger">Resolve →</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                    <Card>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-extrabold text-ink">Revenue by city</p>
                        <span className="text-xs font-semibold text-muted">top 6</span>
                      </div>
                      {stats.revenueByCity.length === 0 ? (
                        <Empty title="No city data yet" hint="Revenue splits appear here once bookings complete." />
                      ) : (
                        stats.revenueByCity.map((c) => (
                          <div key={c.city} className="row-line flex justify-between text-sm">
                            <span className="font-bold text-body">{c.city}</span>
                            <span className="font-extrabold text-ink">{inr(c.revenue)} <span className="font-semibold text-muted">• {c.bookings}</span></span>
                          </div>
                        ))
                      )}
                    </Card>
                  </div>
                </>
              ) : null}
            </>
          )}

          {/* ══════════ APPROVALS ══════════ */}
          {tab === "approvals" && (
            <Card>
              <div className="mb-1 flex items-center justify-between">
                <p className="font-extrabold text-ink">KYC & vendor approvals <span className="chip chip-accent ml-2">{pendingKyc.length} pending</span></p>
                {vendorsQ.isFetching ? <InlineSync label="Syncing" /> : null}
              </div>
              <p className="sub mb-4">Review what the vendor submitted, see what&apos;s missing, then approve or nudge them with a reminder.</p>
              {pendingKyc.length === 0 ? (
                <Empty title="Queue is empty" hint="New vendor registrations land here for KYC review." />
              ) : (
                <div className="space-y-2.5">
                  {pendingKyc.map((v) => (
                    <div key={v.id} className="rounded-2xl border border-line p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-ink">{v.vendorProfile?.businessName ?? v.fullName} <Chip value={v.vendorProfile?.kycStatus ?? "PENDING"} /> {!v.isVerified ? <span className="chip chip-neutral">Email unverified</span> : <span className="chip chip-success">Email verified</span>}</p>
                          <p className="mt-0.5 text-[13px] text-muted">{v.fullName} • {v.mobile} • {v.city}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => approveVendor.mutate({ id: v.id, approved: true })} disabled={approveVendor.isPending} className="btn-primary !bg-success !px-4 !py-2 !text-[13px] disabled:opacity-50"><Check size={14} /> Approve</button>
                          <button onClick={() => remindKyc.mutate({ id: v.id })} disabled={remindKyc.isPending} className="btn-accent !px-4 !py-2 !text-[13px] disabled:opacity-50"><Bell size={14} /> Remind</button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <KycChecklist p={v.vendorProfile} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ══════════ BOOKINGS ══════════ */}
          {tab === "bookings" && (
            <div className="space-y-3">
              <Card className="!p-3">
                <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => setBookingStatus(s)} className={`tab-pill !px-3.5 !py-1.5 !text-xs ${bookingStatus === s ? "tab-pill-active" : "tab-pill-idle"}`}>{s.replace(/_/g, " ")}</button>
                    ))}
                  </div>
                  <label className="relative ml-auto w-full lg:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} placeholder="Search id, customer, mobile…" className="input !pl-9 !py-2" />
                  </label>
                </div>
              </Card>
              {unassigned.length > 0 && bookingStatus === "ALL" ? (
                <div className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-2.5 text-[13px] font-bold text-accent-600">
                  <Clock size={14} /> {unassigned.length} unassigned PENDING booking{unassigned.length === 1 ? "" : "s"} — assign a vendor below.
                </div>
              ) : null}
              {bookingsQ.isLoading ? <ListSkeleton rows={5} height="h-20" /> : null}
              {bookings.length === 0 && !bookingsQ.isLoading ? (
                <Card><Empty title="No bookings found" hint="Try a different status filter or search. New customer bookings appear here in real time." /></Card>
              ) : (
                <div className="space-y-2.5">
                  {bookings.map((b) => (
                    <Card key={b.id} className="!p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-ink">
                            #{b.id.slice(-6)} • {inr(b.totalAmount)} <Chip value={b.status} /> <Chip value={b.paymentStatus} />
                          </p>
                          <p className="mt-1 truncate text-[13px] text-body">{b.description}</p>
                          <p className="mt-0.5 text-xs text-muted">{b.customer?.fullName ?? "—"} ({b.customer?.mobile ?? "—"}) → {b.vendor?.fullName ?? <b className="text-accent-600">unassigned</b>}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <select
                            value={statusSel[b.id] ?? b.status}
                            onChange={(e) => setStatusSel((p) => ({ ...p, [b.id]: e.target.value }))}
                            className="input !w-auto !px-2.5 !py-1.5 !text-xs"
                          >
                            {SET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button
                            onClick={() => updateBooking.mutate({ id: b.id, status: (statusSel[b.id] ?? b.status) as "PENDING" })}
                            disabled={updateBooking.isPending}
                            className="rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                          >
                            Apply
                          </button>
                          {b.paymentStatus === "PAID" ? (
                            <button
                              onClick={() => { if (window.confirm(`Refund ${inr(b.totalAmount)} to customer wallet for #${b.id.slice(-6)}?`)) refundBooking.mutate({ id: b.id }); }}
                              disabled={refundBooking.isPending}
                              className="btn-danger-ghost disabled:opacity-50"
                            >
                              <Receipt size={13} /> Refund
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {!b.vendor ? (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
                          <span className="text-xs font-extrabold text-body">Assign vendor:</span>
                          <select
                            value={assignSel[b.id] ?? ""}
                            onChange={(e) => setAssignSel((p) => ({ ...p, [b.id]: e.target.value }))}
                            className="input !w-auto min-w-44 !px-2.5 !py-1.5 !text-xs"
                          >
                            <option value="">Select approved vendor…</option>
                            {approvedVendors.map((v) => <option key={v.id} value={v.id}>{v.vendorProfile?.businessName ?? v.fullName} • {v.city}</option>)}
                          </select>
                          <button
                            onClick={() => {
                              const vid = assignSel[b.id] ?? "";
                              if (vid !== "") assignVendor.mutate({ id: b.id, vendorId: vid });
                            }}
                            disabled={assignVendor.isPending || (assignSel[b.id] ?? "") === ""}
                            className="btn-primary !px-3.5 !py-1.5 !text-xs disabled:opacity-50"
                          >
                            Assign
                          </button>
                        </div>
                      ) : null}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════ VENDORS ══════════ */}
          {tab === "vendors" && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] font-bold text-muted">
                  <b className="text-ink">{vendors.length}</b> vendors
                  <span className="chip chip-success ml-2">{vendors.filter((v) => v.vendorProfile?.isApproved && v.isVerified).length} fully live</span>
                  <span className="chip chip-accent ml-1">{vendors.filter((v) => v.vendorProfile?.isApproved && !v.isVerified).length} KYC done, email pending</span>
                  <span className="chip chip-neutral ml-1">{vendors.filter((v) => !v.vendorProfile?.isApproved).length} awaiting KYC</span>
                </p>
                <label className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} placeholder="Search business, name, city…" className="input !pl-9 !py-2" />
                </label>
              </div>
              {vendorRows.length === 0 ? (
                <Card>
                  <Empty title="No vendors found" hint="Vendors appear here with their email-verification and KYC-approval status, ratings, plans and controls." />
                </Card>
              ) : (
                <div className="grid gap-2.5 lg:grid-cols-2">
                  {vendorRows.map((v) => {
                    const live = v.vendorProfile?.isApproved === true && v.isVerified === true;
                    return (
                      <div key={v.id} className="card card-hover !p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white ${live ? "bg-gradient-to-br from-success to-emerald-600" : "bg-gradient-to-br from-primary-500 to-primary-700"}`}>
                              {(v.vendorProfile?.businessName ?? v.fullName).slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-extrabold leading-tight text-ink">{v.vendorProfile?.businessName ?? v.fullName}</p>
                              <p className="mt-0.5 truncate text-xs text-muted">{v.fullName} • {v.mobile} • {v.city}</p>
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${live ? "bg-success-soft text-success ring-1 ring-success/20" : "bg-surface text-muted ring-1 ring-line"}`}>
                            {live ? "● LIVE" : "○ OFF"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className={v.isVerified ? "chip chip-success" : "chip chip-neutral"}>
                            {v.isVerified ? "✓ Email verified" : "Email unverified"}
                          </span>
                          <span className={v.vendorProfile?.isApproved ? "chip chip-primary" : "chip chip-accent"}>
                            {v.vendorProfile?.isApproved ? "✓ KYC approved" : `KYC ${v.vendorProfile?.kycStatus ?? "PENDING"}`}
                          </span>
                          {!v.isActive ? <span className="chip chip-danger">BLOCKED</span> : null}
                          <span className="chip chip-neutral">{v.vendorProfile?.subscriptionPlan ?? "FREE"} plan</span>
                          <span className="chip chip-accent">★ {(v.vendorProfile?.rating ?? 0).toFixed(1)} ({v.vendorProfile?.totalReviews ?? 0})</span>
                        </div>

                        {(v.vendorProfile?.serviceCategories ?? []).length > 0 ? (
                          <p className="mt-2.5 line-clamp-1 text-xs font-semibold text-body">
                            {(v.vendorProfile?.serviceCategories ?? []).slice(0, 5).join(" • ")}
                            {(v.vendorProfile?.serviceCategories ?? []).length > 5 ? "…" : ""}
                          </p>
                        ) : null}

                        <div className="mt-3">
                          <KycChecklist p={v.vendorProfile} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                          {!v.vendorProfile?.isApproved ? (
                            <>
                              <button onClick={() => approveVendor.mutate({ id: v.id, approved: true })} disabled={approveVendor.isPending} className="rounded-full bg-success px-4 py-1.5 text-xs font-bold text-white hover:brightness-95 disabled:opacity-50">
                                <Check size={13} className="mr-1 inline" />Approve KYC
                              </button>
                              <button onClick={() => remindKyc.mutate({ id: v.id })} disabled={remindKyc.isPending} className="btn-accent !px-3.5 !py-1.5 !text-xs disabled:opacity-50">
                                <Bell size={13} className="mr-1 inline" />Remind
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success ring-1 ring-success/20"><Check size={13} /> KYC approved</span>
                          )}
                          <button onClick={() => toggleVendor.mutate({ id: v.id, isActive: !v.isActive })} className={v.isActive ? "btn-danger-ghost" : "btn-primary !px-3.5 !py-1.5 !text-xs"}>
                            {v.isActive ? <><Ban size={13} /> Block</> : "Unblock"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════ USERS ══════════ */}
          {tab === "users" && (
            <Card>
              <div className="mb-4 flex flex-col gap-2.5 lg:flex-row lg:items-center">
                <div className="flex flex-wrap gap-1.5">
                  {USER_ROLES.map((r) => (
                    <button key={r} onClick={() => setUserRole(r)} className={`tab-pill !px-3.5 !py-1.5 !text-xs ${userRole === r ? "tab-pill-active" : "tab-pill-idle"}`}>{r}</button>
                  ))}
                </div>
                <label className="relative ml-auto w-full lg:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search name, mobile, email…" className="input !pl-9 !py-2" />
                </label>
              </div>
              {usersQ.isLoading ? <ListSkeleton rows={6} /> : null}
              {users.length === 0 && !usersQ.isLoading ? (
                <Empty title="No users found" hint="Adjust the role filter or search — every registration lands here." />
              ) : (
                users.map((u) => (
                  <div key={u.id} className="row-line flex flex-wrap items-center justify-between gap-2 !py-3">
                    <div>
                      <p className="text-sm font-extrabold text-ink">{u.fullName} <span className="chip chip-neutral ml-1">{u.role}</span></p>
                      <p className="mt-0.5 text-xs text-muted">{u.mobile} • {u.city} • {u.isActive ? "active" : <b className="text-danger">blocked</b>}{u.role === "CUSTOMER" ? ` • wallet ${inr(u.customerProfile?.walletBalance ?? 0)}` : ""}</p>
                    </div>
                    <button onClick={() => toggleUser.mutate({ id: u.id, isActive: !u.isActive })} disabled={toggleUser.isPending} className={u.isActive ? "btn-danger-ghost" : "btn-primary !px-3.5 !py-1.5 !text-xs"}>
                      {u.isActive ? "Block" : "Unblock"}
                    </button>
                  </div>
                ))
              )}
            </Card>
          )}

          {/* ══════════ AGENTS ══════════ */}
          {tab === "agents" && (
            <Card>
              <p className="mb-1 font-extrabold text-ink">City agents & commission economics</p>
              <p className="sub mb-4">Commission is earned on completed-booking GMV inside each agent&apos;s assigned city.</p>
              {agentsQ.isLoading ? <ListSkeleton rows={4} /> : null}
              {agents.length === 0 && !agentsQ.isLoading ? (
                <Empty title="No agents yet" hint="Agents register via Join as Agent and get a city territory assigned." />
              ) : (
                <div className="space-y-2.5">
                  {agents.map((a) => (
                    <div key={a.id} className="rounded-2xl border border-line p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-ink">{a.fullName} <span className="chip chip-primary ml-1">{a.city}</span></p>
                          <p className="mt-0.5 text-xs text-muted">{a.mobile} • {a.cityBookings} city bookings • {inr(a.cityGmv)} city GMV</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-right">
                            <span className="block text-lg font-extrabold text-success">{inr(a.commissionEarned)}</span>
                            <span className="block text-[11px] font-bold text-muted">earned @ {a.commissionPercent}%</span>
                          </p>
                          <NumberSaver value={a.commissionPercent} suffix="%" saving={updateComm.isPending} onSave={(v) => updateComm.mutate({ id: a.id, commissionPercent: Math.min(50, Math.max(0, Math.round(v))) })} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ══════════ CATEGORIES ══════════ */}
          {tab === "categories" && (
            <div className="space-y-3">
              {cats.length === 0 && !catsQ.isLoading ? (
                <Card>
                  <Empty
                    title="No service catalog yet"
                    hint="The storefront, search and vendor onboarding all depend on categories. Seed the standard 12-category catalog in one click, then edit pricing."
                    action={<button onClick={() => seedCats.mutate()} disabled={seedCats.isPending} className="btn-accent"><Plus size={15} /> {seedCats.isPending ? "Seeding…" : "Seed 12-category catalog"}</button>}
                  />
                </Card>
              ) : null}
              <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="order-first space-y-3 lg:order-last lg:sticky lg:top-[88px]">
                <Card className="relative overflow-hidden">
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-accent-400" />
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"><Tags size={18} /></span>
                    <div>
                      <p className="font-extrabold text-ink">Add category</p>
                      <p className="text-xs font-medium text-muted">Goes live on the storefront instantly</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} placeholder="Category name — e.g. Deep Cleaning" className="input" />
                        <input value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} placeholder="🔧" title="Icon emoji" className="input !w-14 text-center text-lg" />
                      </div>
                      {newCat.name.trim().length >= 2 ? (
                        <p className="mt-1 font-mono text-[11px] font-semibold text-muted">/{newCat.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}</p>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-2">
                      <input type="number" value={newCat.commission} onChange={(e) => setNewCat({ ...newCat, commission: e.target.value })} placeholder="Fee %" title="Commission %" className="input" />
                      <input value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} placeholder="Short description shown to customers" className="input" />
                    </div>
                    <button
                      onClick={() => {
                        const name = newCat.name.trim();
                        if (name.length < 2) return;
                        createCat.mutate({
                          slug: name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                          name,
                          icon: newCat.icon.trim() === "" ? "🔧" : newCat.icon.trim(),
                          description: newCat.description.trim() === "" ? undefined : newCat.description.trim(),
                          commissionPercent: Math.min(90, Math.max(0, Number(newCat.commission) || 0)),
                        });
                      }}
                      disabled={createCat.isPending}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      <Plus size={15} /> {createCat.isPending ? "Adding…" : "Add category"}
                    </button>
                  </div>
                </Card>
                <Card className="relative overflow-hidden">
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-400 via-accent-300 to-primary-400" />
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-100 text-accent-600"><Plus size={18} /></span>
                    <div>
                      <p className="font-extrabold text-ink">Add sub-service</p>
                      <p className="text-xs font-medium text-muted">Priced line-item inside a category</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <select value={subForm.catId} onChange={(e) => setSubForm({ ...subForm, catId: e.target.value })} className="input">
                      <option value="">Select category…</option>
                      {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="Sub-service name — e.g. Foam-jet AC service" className="input" />
                    <div className="grid grid-cols-[110px_1fr] gap-2">
                      <input type="number" value={subForm.price} onChange={(e) => setSubForm({ ...subForm, price: e.target.value })} placeholder="₹ price" title="Base price ₹" className="input" />
                      <input value={subForm.unit} onChange={(e) => setSubForm({ ...subForm, unit: e.target.value })} placeholder="Unit" title="Billing unit" className="input" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {["per job", "per visit", "per AC", "per home", "per bathroom", "per session"].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setSubForm({ ...subForm, unit: u })}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${subForm.unit === u ? "border-accent-500 bg-accent-400 text-accent-ink" : "border-line bg-white text-body hover:border-accent-300"}`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        if (subForm.catId === "" || subForm.name.trim().length < 2 || Number(subForm.price) <= 0) return;
                        upsertSub.mutate({ categoryId: subForm.catId, name: subForm.name.trim(), basePrice: Number(subForm.price), unit: subForm.unit.trim() === "" ? "per job" : subForm.unit.trim() });
                      }}
                      disabled={upsertSub.isPending}
                      className="btn-accent w-full disabled:opacity-50"
                    >
                      <Plus size={15} /> {upsertSub.isPending ? "Adding…" : "Add sub-service"}
                    </button>
                  </div>
                </Card>
              </div>
              <div className="order-last min-w-0 space-y-3 lg:order-first">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] font-bold text-muted">
                  <b className="text-ink">{visibleCats.length}</b> of <b className="text-ink">{cats.length}</b> categories
                  {catsQ.isFetching ? <span className="ml-2"><InlineSync label="Syncing" /></span> : null}
                </p>
                <label className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={catSearch} onChange={(e) => setCatSearch(e.target.value)} placeholder="Search categories…" className="input !pl-9 !py-2" />
                </label>
              </div>
              {visibleCats.length === 0 && cats.length > 0 ? (
                <Card><Empty title="No matches" hint={`Nothing named "${catSearch.trim()}". Clear the search to see all categories.`} /></Card>
              ) : null}
              <div className="space-y-3 lg:max-h-[calc(100vh-250px)] lg:overflow-y-auto lg:pr-1.5 [scrollbar-width:thin]">
              {visibleCats.map((c) => (
                <article key={c.id} className={`flex flex-col overflow-hidden rounded-3xl border bg-white shadow-card sm:h-[248px] sm:flex-row ${c.isActive ? "border-line" : "border-dashed opacity-75"}`}>
                  {/* photo rail */}
                  <div className="relative h-24 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary-800 via-primary-900 to-ink sm:h-auto sm:w-32 lg:w-40">
                    {c.image ? (
                      <Image src={c.image} alt={c.name} fill sizes="180px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-5xl">{c.icon === "" ? "✨" : c.icon}</span>
                    )}
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold backdrop-blur-md ${c.isActive ? "bg-success/90 text-white" : "bg-black/50 text-white"}`}>
                      {c.isActive ? "Live" : "Hidden"}
                    </span>
                    {c.image ? (
                      <button type="button" onClick={() => updateCat.mutate({ id: c.id, image: "" })} title="Remove photo" className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md hover:bg-danger">✕</button>
                    ) : null}
                    <div className="absolute inset-x-2 bottom-2">
                      <HeroPhotoEditor label={c.image ? "Replace" : "Add photo"} onSave={(url) => updateCat.mutate({ id: c.id, image: url })} />
                    </div>
                  </div>
                  {/* body */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          onClick={() => updateCat.mutate({ id: c.id, isFeatured: !c.isFeatured })}
                          title={c.isFeatured ? "Featured on home hero — click to remove" : "Feature on home hero"}
                          className={`shrink-0 rounded-full p-1.5 transition-all ${c.isFeatured ? "bg-accent-100 text-accent-600" : "text-muted hover:bg-surface hover:text-accent-600"}`}
                        >
                          <Star size={14} fill={c.isFeatured ? "currentColor" : "none"} />
                        </button>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-extrabold leading-tight text-ink">{c.name}</p>
                          <p className="truncate text-[11px] font-medium text-muted">/{c.slug} • {c.subCategories.length} subs • ★ {c.rating > 0 ? c.rating.toFixed(2) : "New"} • {fmtCount(c.totalBookings)}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleCat.mutate({ id: c.id, isActive: !c.isActive })} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${c.isActive ? "bg-danger-soft text-danger hover:brightness-95" : "bg-primary-600 text-white hover:bg-primary-700"}`}>
                        {c.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                    <div className="grid shrink-0 grid-cols-2 gap-x-2.5 gap-y-1.5 rounded-2xl bg-surface p-2 sm:grid-cols-3">
                      <label className="block">
                        <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted">Icon</span>
                        <TextSaver value={c.icon} width="!w-14" placeholder="🔧" saving={updateCat.isPending} onSave={(v) => { if (v.trim() !== "") updateCat.mutate({ id: c.id, icon: v.trim() }); }} />
                      </label>
                      <label className="block">
                        <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted">Rating</span>
                        <NumberSaver value={c.rating} saving={updateCat.isPending} onSave={(v) => updateCat.mutate({ id: c.id, rating: Math.min(5, Math.max(0, Math.round(v * 100) / 100)) })} />
                      </label>
                      <label className="block">
                        <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted">Fee %</span>
                        <NumberSaver value={c.commissionPercent} saving={updateCat.isPending} onSave={(v) => updateCat.mutate({ id: c.id, commissionPercent: Math.min(90, Math.max(0, Math.round(v))) })} />
                      </label>
                      <label className="block">
                        <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted">Bookings</span>
                        <NumberSaver value={c.totalBookings} saving={updateCat.isPending} onSave={(v) => updateCat.mutate({ id: c.id, totalBookings: Math.max(0, Math.round(v)) })} />
                      </label>
                      <label className="block">
                        <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted">Order</span>
                        <NumberSaver value={c.sortOrder} saving={updateCat.isPending} onSave={(v) => updateCat.mutate({ id: c.id, sortOrder: Math.min(999, Math.max(0, Math.round(v))) })} />
                      </label>
                      <div className="flex items-end pb-0.5">
                        <p className="text-[11px] font-bold leading-tight text-muted">Shows on<br />storefront ★</p>
                      </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto pr-1 [scrollbar-width:thin] sm:max-h-none sm:min-h-0 sm:flex-1">
                      {c.subCategories.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-line px-3 py-1.5 text-center text-xs font-semibold text-muted">No sub-services — add one in the form</p>
                      ) : (
                        c.subCategories.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-2 border-b border-slate-50 py-1 text-[13px] last:border-0">
                            <span className="truncate font-semibold text-body">{s.name} <span className="whitespace-nowrap text-muted">• {s.unit}</span></span>
                            <span className="shrink-0 font-extrabold text-ink">{inr(s.basePrice)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </article>
              ))}
              </div>
            </div>
            </div>
            </div>
          )}

          {/* ══════════ FINANCE ══════════ */}
          {tab === "finance" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { icon: IndianRupee, l: "Collected revenue", v: inr(stats?.totalRevenue ?? 0) },
                  { icon: TrendingUp, l: "Platform fee (~15%)", v: inr(stats?.platformFee ?? 0) },
                  { icon: Wallet, l: "Wallet liability", v: inr(stats?.walletLiability ?? 0) },
                  { icon: Receipt, l: "Avg order value", v: inr(stats?.avgOrderValue ?? 0) },
                ].map((s) => (
                  <div key={s.l} className="stat-card">
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted"><s.icon size={13} />{s.l}</p>
                    <p className="mt-1 text-2xl font-extrabold text-ink">{s.v}</p>
                  </div>
                ))}
              </div>
              <Card>
                <p className="mb-3 font-extrabold text-ink">Wallet ledger <span className="text-xs font-semibold text-muted">— latest first (credits = bonus/refund, debits = spend)</span></p>
                {walletQ.isLoading ? <ListSkeleton rows={6} /> : null}
                {txs.length === 0 && !walletQ.isLoading ? (
                  <Empty title="No wallet movement yet" hint="Welcome bonuses, refunds and wallet spends all ledger here." />
                ) : (
                  txs.map((t) => (
                    <div key={t.id} className="row-line flex flex-wrap items-center justify-between gap-2 !py-2.5 text-sm">
                      <div>
                        <p className="font-bold text-ink">{t.description}</p>
                        <p className="text-xs text-muted">{t.user.fullName} ({t.user.mobile}) • {t.type} • bal {inr(t.balanceAfter)}</p>
                      </div>
                      <span className={`font-extrabold ${t.type === "credit" ? "text-success" : "text-danger"}`}>{t.type === "credit" ? "+" : "−"}{inr(t.amount)}</span>
                    </div>
                  ))
                )}
              </Card>
            </div>
          )}

          {/* ══════════ BROADCAST ══════════ */}
          {tab === "broadcast" && (
            <div className="grid gap-3 lg:grid-cols-2">
              <Card>
                <p className="mb-1 font-extrabold text-ink">Broadcast notification</p>
                <p className="sub mb-4">Push an in-app notice to a whole role — offers, outages, policy changes.</p>
                <div className="mb-3 flex gap-2">
                  {(["CUSTOMER", "VENDOR", "AGENT"] as const).map((r) => (
                    <button key={r} onClick={() => setBRole(bRole === r ? undefined : r)} className={`tab-pill !text-xs ${bRole === r ? "tab-pill-active" : "tab-pill-idle"}`}>{r}</button>
                  ))}
                  <button onClick={() => setBRole(undefined)} className={`tab-pill !text-xs ${bRole === undefined ? "tab-pill-active" : "tab-pill-idle"}`}>ALL</button>
                </div>
                <input value={bTitle} onChange={(e) => setBTitle(e.target.value)} placeholder="Title — e.g. Diwali dhamaka: 20% off deep cleaning" className="input mb-2" />
                <textarea value={bMsg} onChange={(e) => setBMsg(e.target.value)} placeholder="Message — keep it short, add expiry if it's an offer" className="input mb-3" rows={4} />
                <button
                  disabled={bTitle.trim() === "" || bMsg.trim() === "" || broadcast.isPending}
                  onClick={() => {
                    broadcast.mutate(
                      { title: bTitle.trim(), message: bMsg.trim(), role: bRole ?? undefined },
                      { onSuccess: (d) => { setBTitle(""); setBMsg(""); alert(`Sent to ${d.sent} users`); } },
                    );
                  }}
                  className="btn-accent w-full disabled:opacity-50"
                >
                  <Send size={15} /> {broadcast.isPending ? "Sending…" : `Send${bRole ? ` to ${bRole}` : " to everyone"}`}
                </button>
              </Card>
              <Card>
                <p className="mb-3 font-extrabold text-ink">Latest notifications on platform</p>
                {notifs.length === 0 ? (
                  <Empty title="Nothing sent yet" hint="Booking updates, leads and your broadcasts show up here." />
                ) : (
                  notifs.map((n) => (
                    <div key={n.id} className="row-line !py-2.5">
                      <p className="text-sm font-extrabold text-ink">{n.title} <span className="chip chip-neutral ml-1">{n.type}</span></p>
                      <p className="mt-0.5 text-[13px] text-body">{n.message}</p>
                    </div>
                  ))
                )}
              </Card>
            </div>
          )}
        </main>
      </div>

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
