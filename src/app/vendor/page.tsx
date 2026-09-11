"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "~/trpc/react";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sUser = session?.user as { id?: string; role?: string } | undefined;
  const role = (sUser?.role ?? "").toUpperCase();
  const vendorId = sUser?.id ?? "";

  const meQ = trpc.users.getById.useQuery({ id: vendorId }, { enabled: !!vendorId && status === "authenticated" });
  const statsQ = trpc.vendors.getVendorStats.useQuery({ vendorId }, { enabled: !!vendorId });
  const jobsQ = trpc.bookings.getByVendor.useQuery({ vendorId, limit: 20 }, { enabled: !!vendorId });
  const leadsQ = trpc.vendors.getLeads.useQuery({ vendorId }, { enabled: !!vendorId });
  const updateStatus = trpc.bookings.updateStatus.useMutation({ onSuccess: () => jobsQ.refetch() });

  if (status === "loading") return <div className="p-10 text-muted">Loading…</div>;
  if (status !== "authenticated" || (role !== "VENDOR" && role !== "ADMIN")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold text-ink">Vendor login required</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Login</button>
      </div>
    );
  }

  const profile = (meQ.data as { vendorProfile?: { businessName: string; subscriptionPlan: string; kycStatus: string; isApproved: boolean } | null; fullName?: string; mobile?: string } | undefined);
  const stats = statsQ.data as { totalEarnings?: number; totalJobs?: number; completedJobs?: number; pendingJobs?: number; rating?: number } | undefined;

  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="flex items-center justify-between border-b border-line bg-white/90 p-4 backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-ink">{profile?.vendorProfile?.businessName ?? "Vendor Dashboard"}</h1>
          <p className="text-xs text-muted">{profile?.fullName} • {profile?.mobile} • <span className="chip chip-accent ml-1">{profile?.vendorProfile?.subscriptionPlan}</span> <span className="chip chip-primary ml-1">KYC {profile?.vendorProfile?.kycStatus}</span></p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full px-3 py-1.5 text-sm font-bold text-danger hover:bg-danger-soft">Logout</button>
      </header>
      <main className="mx-auto max-w-5xl space-y-4 p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { l: "Earnings", v: `₹${(stats?.totalEarnings ?? 0).toLocaleString("en-IN")}` },
            { l: "Total jobs", v: `${stats?.totalJobs ?? 0}` },
            { l: "Pending", v: `${stats?.pendingJobs ?? 0}` },
            { l: "Rating", v: `★${(stats?.rating ?? 0).toFixed(1)}` },
          ].map((s) => (
            <div key={s.l} className="stat-card"><p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">{s.l}</p><p className="mt-1 text-xl font-extrabold text-ink">{s.v}</p></div>
          ))}
        </div>
        <div className="card">
          <p className="mb-2 font-extrabold text-ink">New leads ({(leadsQ.data as unknown[] | undefined)?.length ?? 0})</p>
          {((leadsQ.data as { id: string; status: string; booking?: { description: string; totalAmount: number } }[] | undefined) ?? []).slice(0, 5).map((l) => (
            <p key={l.id} className="row-line text-sm text-body">{l.booking?.description?.slice(0, 60)} • <b className="text-ink">₹{l.booking?.totalAmount}</b> • <span className="chip chip-primary ml-1">{l.status}</span></p>
          ))}
        </div>
        <div className="card">
          <p className="mb-2 font-extrabold text-ink">My jobs (live)</p>
          {((jobsQ.data as { id: string; status: string; description: string; totalAmount: number }[] | undefined) ?? []).map((j) => (
            <div key={j.id} className="row-line flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-body">{j.description.slice(0, 50)} • <b className="text-ink">₹{j.totalAmount}</b> • {j.status}</span>
              <span className="flex gap-1">
                {["ACCEPTED", "IN_PROGRESS", "COMPLETED"].map((s) => (
                  <button key={s} onClick={() => updateStatus.mutate({ id: j.id, status: s as "ACCEPTED" })} className="rounded-full bg-surface px-2 py-1 text-[11px] font-bold text-body hover:bg-primary-50 hover:text-primary-700">{s}</button>
                ))}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}