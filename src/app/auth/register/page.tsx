"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { trpc } from "~/trpc/react";

function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const preset = (sp.get("role") ?? "customer").toUpperCase();
  const [form, setForm] = useState({ fullName: "", mobile: "", password: "", city: "Lucknow", state: "Uttar Pradesh", role: ["CUSTOMER", "VENDOR", "AGENT"].includes(preset) ? preset : "CUSTOMER", businessName: "" });
  const [err, setErr] = useState("");
  const reg = trpc.auth.register.useMutation();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await reg.mutateAsync({ fullName: form.fullName, mobile: form.mobile, password: form.password, city: form.city, state: form.state, role: form.role as "CUSTOMER", businessName: form.businessName || undefined });
      const r = await signIn("credentials", { redirect: false, mobile: form.mobile, password: form.password });
      if (r?.error) {
        router.push("/auth/login");
        return;
      }
      router.push(form.role === "VENDOR" ? "/vendor" : form.role === "AGENT" ? "/agent" : "/customer/dashboard");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 font-sans">
      <form onSubmit={submit} className="card w-full max-w-md !p-6 space-y-3">
        <p className="eyebrow">Join ADDies</p>
        <h1 className="h-section !text-2xl">Create account</h1>
        <div className="flex gap-2">
          {["CUSTOMER", "VENDOR", "AGENT"].map((r) => (
            <button type="button" key={r} onClick={() => setForm({ ...form, role: r })} className={`tab-pill ${form.role === r ? "tab-pill-active" : "tab-pill-idle"}`}>{r}</button>
          ))}
        </div>
        <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" />
        <input required placeholder="10-digit mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="input" />
        <input required type="password" placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        <div className="grid grid-cols-2 gap-2">
          <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
          <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" />
        </div>
        {form.role === "VENDOR" && <input placeholder="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="input" />}
        {err && <p className="rounded-xl border border-danger/20 bg-danger-soft p-2 text-xs font-semibold text-danger">{err}</p>}
        <button disabled={reg.isPending} className="btn-primary w-full !py-3">{reg.isPending ? "Creating…" : "Create account"}</button>
        <p className="text-center text-xs text-muted">Have account? <Link href="/auth/login" className="font-bold text-primary-600">Login</Link></p>
      </form>
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
