"use client";

import { useState } from "react";
import { trpc } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

type Tab = "overview" | "users" | "vendors" | "bookings" | "categories" | "broadcast";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const role = ((session?.user as { role?: string } | undefined)?.role ?? "").toUpperCase();

  const statsQ = trpc.admin.stats.useQuery(undefined, { enabled: status === "authenticated" });
  const usersQ = trpc.users.getAll.useQuery({ limit: 20 }, { enabled: tab === "users" && status === "authenticated" });
  const vendorsQ = trpc.vendors.list.useQuery({ limit: 20 }, { enabled: tab === "vendors" && status === "authenticated" });
  const bookingsQ = trpc.bookings.listAll.useQuery({ limit: 20 }, { enabled: tab === "bookings" && status === "authenticated" });
  const catsQ = trpc.categories.getAll.useQuery({ includeInactive: true }, { enabled: tab === "categories" && status === "authenticated" });

  const toggleUser = trpc.users.toggleActive.useMutation({ onSuccess: () => usersQ.refetch() });
  const approveVendor = trpc.vendors.approveVendor.useMutation({ onSuccess: () => vendorsQ.refetch() });
  const toggleCat = trpc.categories.toggleActive.useMutation({ onSuccess: () => catsQ.refetch() });
  const updateBooking = trpc.bookings.updateStatus.useMutation({ onSuccess: () => bookingsQ.refetch() });
  const broadcast = trpc.admin.broadcast.useMutation();

  const [bTitle, setBTitle] = useState("");
  const [bMsg, setBMsg] = useState("");
  const [bRole, setBRole] = useState<"CUSTOMER" | "VENDOR" | "AGENT" | undefined>(undefined);

  if (status === "loading") return <div className="p-10 text-muted">Loading admin…</div>;
  if (status !== "authenticated" || role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold text-ink">Super Admin access required</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Go to Login</button>
      </div>
    );
  }

  const stats = statsQ.data;

  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-black text-white">A</span>
          <div>
            <p className="text-sm font-extrabold leading-none text-ink">ADDies Admin</p>
            <p className="text-xs font-bold text-primary-600">Super Admin • full control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted sm:block">{(session.user as { mobile?: string })?.mobile}</span>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full px-4 py-2 text-sm font-bold text-danger hover:bg-danger-soft">Logout</button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-3 lg:px-6">
        {(["overview", "users", "vendors", "bookings", "categories", "broadcast"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab-pill ${tab === t ? "tab-pill-active" : "tab-pill-idle"}`}>{t}</button>
        ))}
      </div>

      <main className="page-container py-5">
        {tab === "overview" && (
          <div className="space-y-4">
            {statsQ.isLoading && <p className="sub">Loading live platform stats from MongoDB…</p>}
            {stats && (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { l: "Revenue (completed)", v: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, accent: true },
                    { l: "Platform fee ~15%", v: `₹${stats.platformFee.toLocaleString("en-IN")}`, accent: false },
                    { l: "Bookings", v: `${stats.totalBookings} (${stats.completedBookings} done)`, accent: false },
                    { l: "Avg order value", v: `₹${stats.avgOrderValue.toLocaleString("en-IN")}`, accent: true },
                    { l: "Customers", v: `${stats.customers}`, accent: false },
                    { l: "Vendors", v: `${stats.vendors}`, accent: false },
                    { l: "Agents", v: `${stats.agents}`, accent: false },
                    { l: "Pending KYC", v: `${stats.pendingKyc}`, accent: true },
                  ].map((s) => (
                    <div key={s.l} className={`stat-card ${s.accent ? "!border-accent-200 !bg-accent-50" : ""}`}>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">{s.l}</p>
                      <p className="mt-1 text-xl font-extrabold text-ink">{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="card">
                    <p className="mb-3 font-extrabold text-ink">Revenue by city (live)</p>
                    {stats.revenueByCity.map((c) => (
                      <div key={c.city} className="row-line flex justify-between text-sm">
                        <span className="font-bold text-body">{c.city}</span>
                        <span className="font-extrabold text-ink">₹{c.revenue.toLocaleString("en-IN")} • {c.bookings}</span>
                      </div>
                    ))}
                  </div>
                  <div className="card">
                    <p className="mb-3 font-extrabold text-ink">Recent bookings (live)</p>
                    {stats.recentBookings.map((b: { id: string; status: string; totalAmount: number; customer?: { fullName: string } | null }) => (
                      <div key={b.id} className="row-line flex justify-between text-sm">
                        <span className="text-body">{b.customer?.fullName} <span className="chip chip-primary ml-1">{b.status}</span></span>
                        <span className="font-extrabold">₹{b.totalAmount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="card">
            <p className="mb-3 font-extrabold text-ink">All users — block / unblock (live DB)</p>
            {usersQ.isLoading && <p className="sub">Loading…</p>}
            {(usersQ.data as { users?: { id: string; fullName: string; mobile: string; role: string; city: string; isActive: boolean }[] } | undefined)?.users?.map((u) => (
              <div key={u.id} className="row-line flex items-center justify-between text-sm">
                <div>
                  <p className="font-extrabold text-ink">{u.fullName} <span className="chip chip-neutral ml-2">{u.role}</span></p>
                  <p className="text-xs text-muted">{u.mobile} • {u.city} • {u.isActive ? "active" : "blocked"}</p>
                </div>
                <button onClick={() => toggleUser.mutate({ id: u.id, isActive: !u.isActive })} className={u.isActive ? "btn-danger-ghost" : "btn-primary !px-3 !py-1.5 !text-xs"}>{u.isActive ? "Block" : "Unblock"}</button>
              </div>
            ))}
          </div>
        )}

        {tab === "vendors" && (
          <div className="card">
            <p className="mb-3 font-extrabold text-ink">Vendor KYC & approval — approve / reject (live DB)</p>
            {(vendorsQ.data as { vendors?: { id: string; fullName: string; city: string; vendorProfile?: { businessName: string; kycStatus: string; isApproved: boolean; subscriptionPlan: string; rating: number } | null }[] } | undefined)?.vendors?.map((v) => (
              <div key={v.id} className="row-line flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-extrabold text-ink">{v.vendorProfile?.businessName} <span className={`chip ml-2 ${v.vendorProfile?.isApproved ? "chip-success" : "chip-accent"}`}>{v.vendorProfile?.kycStatus}</span></p>
                  <p className="text-xs text-muted">{v.fullName} • {v.city} • {v.vendorProfile?.subscriptionPlan} • ★{v.vendorProfile?.rating}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveVendor.mutate({ id: v.id, approved: true })} className="btn-primary !px-3 !py-1.5 !text-xs !bg-success">Approve</button>
                  <button onClick={() => approveVendor.mutate({ id: v.id, approved: false })} className="btn-ghost !px-3 !py-1.5 !text-xs">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "bookings" && (
          <div className="card">
            <p className="mb-3 font-extrabold text-ink">All bookings — update status / resolve disputes (live DB)</p>
            {(bookingsQ.data as { bookings?: { id: string; status: string; totalAmount: number; customer?: { fullName: string } | null; vendor?: { fullName: string } | null }[] } | undefined)?.bookings?.map((b) => (
              <div key={b.id} className="row-line flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-extrabold text-ink">{b.id.slice(-6)} • ₹{b.totalAmount} <span className="chip chip-primary ml-2">{b.status}</span></p>
                  <p className="text-xs text-muted">{b.customer?.fullName} → {b.vendor?.fullName ?? "unassigned"}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"].map((s) => (
                    <button key={s} onClick={() => updateBooking.mutate({ id: b.id, status: s as "ASSIGNED" })} className="rounded-full bg-surface px-2 py-1 text-[11px] font-bold text-body hover:bg-primary-50 hover:text-primary-700">{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "categories" && (
          <div className="card">
            <p className="mb-3 font-extrabold text-ink">Categories — enable / disable (live DB, {catsQ.data?.length ?? 0})</p>
            {catsQ.data?.map((c) => (
              <div key={c.id} className="row-line flex items-center justify-between text-sm">
                <p className="font-bold text-body">{c.icon} {c.name} <span className="text-xs font-medium text-muted">• {c.subCategories.length} subs • {c.commissionPercent}%</span></p>
                <button onClick={() => toggleCat.mutate({ id: c.id, isActive: !c.isActive })} className={c.isActive ? "btn-danger-ghost" : "btn-primary !px-3 !py-1.5 !text-xs"}>{c.isActive ? "Disable" : "Enable"}</button>
              </div>
            ))}
          </div>
        )}

        {tab === "broadcast" && (
          <div className="card max-w-xl">
            <p className="mb-3 font-extrabold text-ink">Broadcast notification to role</p>
            <div className="mb-3 flex gap-2">
              {(["CUSTOMER", "VENDOR", "AGENT"] as const).map((r) => (
                <button key={r} onClick={() => setBRole(bRole === r ? undefined : r)} className={`tab-pill ${bRole === r ? "tab-pill-active" : "tab-pill-idle"}`}>{r}</button>
              ))}
            </div>
            <input value={bTitle} onChange={(e) => setBTitle(e.target.value)} placeholder="Title — e.g. Diwali offer" className="input mb-2" />
            <textarea value={bMsg} onChange={(e) => setBMsg(e.target.value)} placeholder="Message" className="input mb-3" rows={3} />
            <button disabled={!bTitle || !bMsg || broadcast.isPending} onClick={() => broadcast.mutate({ title: bTitle, message: bMsg, role: bRole ?? undefined }, { onSuccess: (d) => alert(`Sent to ${d.sent} users`) })} className="btn-accent disabled:opacity-50">{broadcast.isPending ? "Sending…" : "Send broadcast"}</button>
          </div>
        )}
      </main>
    </div>
  );
}
