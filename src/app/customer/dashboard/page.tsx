"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "~/trpc/react";

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sUser = session?.user;
  const customerId = sUser?.id ?? "";

  const meQ = trpc.users.getById.useQuery({ id: customerId }, { enabled: !!customerId });
  const bookingsQ = trpc.bookings.getByCustomer.useQuery({ customerId, limit: 20 }, { enabled: !!customerId });
  const catsQ = trpc.categories.getAll.useQuery();

  if (status === "loading") return <div className="p-10 text-muted">Loading…</div>;
  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold">Please login as customer</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Login</button>
      </div>
    );
  }

  const me = meQ.data as { fullName?: string; mobile?: string; customerProfile?: { walletBalance: number } | null } | undefined;
  const bookings = (bookingsQ.data as { id: string; status: string; description: string; totalAmount: number; vendor?: { fullName: string } | null }[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="flex items-center justify-between border-b border-line bg-white/90 p-4 backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Namaste, {me?.fullName ?? session.user?.name}</h1>
          <p className="text-xs text-muted">Wallet <b className="text-accent-600">₹{me?.customerProfile?.walletBalance ?? 0}</b> • {bookings.length} bookings</p>
        </div>
        <div className="flex gap-2">
          <Link href="/customer/booking" className="btn-primary !py-2">Book service</Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full px-3 py-2 text-sm font-bold text-danger hover:bg-danger-soft">Logout</button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-4 p-4">
        <div className="card">
          <p className="mb-2 font-extrabold text-ink">Book in one tap</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(catsQ.data ?? []).slice(0, 12).map((c) => (
              <Link key={c.id} href={`/services?cat=${c.slug}`} className="rounded-xl border border-transparent p-2 text-center transition-all hover:border-primary-200 hover:bg-primary-50">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-xl">{c.icon}</div>
                <p className="mt-1 text-[11px] font-bold text-body">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <p className="mb-2 font-extrabold text-ink">My bookings (live)</p>
          {!bookings.length && <p className="sub">No bookings yet — pick a service above.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="row-line flex justify-between text-sm">
              <span className="text-body">{b.description.slice(0, 55)} <span className="text-muted">• {b.vendor?.fullName ?? "assigning…"}</span></span>
              <span className="font-extrabold text-ink">₹{b.totalAmount} <span className="chip chip-primary ml-2">{b.status}</span></span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}