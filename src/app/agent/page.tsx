"use client";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "~/trpc/react";

export default function AgentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sUser = session?.user as { id?: string; role?: string } | undefined;
  const role = (sUser?.role ?? "").toUpperCase();
  const agentId = sUser?.id ?? "";
  const meQ = trpc.users.getById.useQuery({ id: agentId }, { enabled: !!agentId });
  const vendorsQ = trpc.vendors.list.useQuery({ limit: 20 }, { enabled: status === "authenticated" });

  if (status === "loading") return <div className="p-10 text-muted">Loading…</div>;
  if (status !== "authenticated" || (role !== "AGENT" && role !== "ADMIN"))
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <p className="font-bold">Agent login required</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">Login</button>
      </div>
    );

  const me = meQ.data as { fullName?: string; city?: string; agentProfile?: { assignedCity: string; commissionPercent: number } | null } | undefined;
  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="flex items-center justify-between border-b border-line bg-white/90 p-4 backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Agent • {me?.agentProfile?.assignedCity ?? me?.city}</h1>
          <p className="text-xs text-muted">{me?.fullName} • <span className="chip chip-accent ml-1">{me?.agentProfile?.commissionPercent}% commission</span></p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full px-3 py-1.5 text-sm font-bold text-danger hover:bg-danger-soft">Logout</button>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <div className="card">
          <p className="mb-2 font-extrabold text-ink">City vendors — approve & grow (live)</p>
          {(vendorsQ.data as { vendors?: { id: string; fullName: string; city: string; vendorProfile?: { businessName: string; kycStatus: string } | null }[] } | undefined)?.vendors?.slice(0, 15).map((v) => (
            <p key={v.id} className="row-line text-sm text-body">{v.vendorProfile?.businessName} • {v.city} • <span className="chip chip-primary ml-1">{v.vendorProfile?.kycStatus}</span></p>
          ))}
        </div>
      </main>
    </div>
  );
}
