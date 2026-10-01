"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, Calendar, MapPin, AlertCircle, ArrowLeft, Wrench, Home, Check } from "lucide-react";
import { trpc } from "~/trpc/react";
import RazorpayCheckout from "./RazorpayCheckout";
import BookingMapPicker, { type MapAddress } from "./BookingMapPicker";

const SLOTS = [
  { id: "m1", label: "9:00 AM – 12:00 PM", start: "09:00", end: "12:00" },
  { id: "a1", label: "12:00 PM – 3:00 PM", start: "12:00", end: "15:00" },
  { id: "e1", label: "3:00 PM – 6:00 PM", start: "15:00", end: "18:00" },
  { id: "n1", label: "6:00 PM – 9:00 PM", start: "18:00", end: "21:00" },
];

interface Cat {
  id: string; slug: string; name: string; icon: string;
  subCategories: { id: string; name: string; basePrice: number; unit: string }[];
}

export default function CustomerBookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const mobile = session?.user?.mobile ?? "";

  const [catId, setCatId] = useState("");
  const [subId, setSubId] = useState("");
  const [desc, setDesc] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("Lucknow");
  const [landmark, setLandmark] = useState("");
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [payment, setPayment] = useState<"cod" | "upi" | "card" | "wallet">("cod");
  const [err, setErr] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [paidOnline, setPaidOnline] = useState(false);
  const [locPicked, setLocPicked] = useState(false);

  const onMapAddress = (a: MapAddress) => {
    setArea(a.area);
    if (a.pincode) setPincode(a.pincode);
    if (a.city) setCity(a.city);
    setLocPicked(true);
  };

  const catsQ = trpc.categories.getAll.useQuery(undefined, { enabled: status === "authenticated" });
  const create = trpc.bookings.create.useMutation({
    onSuccess: (b) => setCreatedId(b.id),
    onError: (e) => setErr(e.message),
  });
  const cats = (catsQ.data as Cat[] | undefined) ?? [];
  const cat = cats.find((c) => c.id === catId);
  const sub = cat?.subCategories.find((s) => s.id === subId);
  const baseAmount = sub?.basePrice ?? 0;
  const surgeAmount = 0;
  const visitingCharge = 0;
  const totalAmount = baseAmount + surgeAmount + visitingCharge;
  const slot = SLOTS.find((s) => s.id === slotId) ?? null;

  const missing: string[] = [];
  if (!catId) missing.push("service category");
  if (!subId) missing.push("exact service");
  if (desc.trim().length < 5) missing.push("issue description (min 5 chars)");
  if (!houseNo.trim()) missing.push("house / flat no.");
  if (!area.trim()) missing.push("area / locality");
  if (!/^\d{6}$/.test(pincode)) missing.push("6-digit pincode");
  if (!city.trim()) missing.push("city");
  if (!date) missing.push("preferred date");
  if (!slot) missing.push("time slot");
  const canSubmit = missing.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!canSubmit || !cat || !sub || !slot) {
      setErr("Please complete: " + (missing.join(", ") || "all required fields."));
      return;
    }
    create.mutate({
      categoryId: cat.id,
      subCategoryId: sub.id,
      description: desc.trim(),
      images: [],
      urgency: "normal",
      address: { houseNo: houseNo.trim(), area: area.trim(), pincode, city: city.trim(), landmark: landmark.trim() || undefined },
      preferredDate: date,
      timeSlot: { id: slot.id, label: slot.label, start: slot.start, end: slot.end },
      paymentMethod: payment,
      baseAmount,
      surgeAmount,
      visitingCharge,
      totalAmount,
    });
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

  if (createdId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-pop">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft"><CheckCircle2 size={32} className="text-success" /></span>
          <p className="mt-4 text-xl font-extrabold text-ink">Booking placed!</p>
          <p className="sub mt-1">{paidOnline ? "Payment received — your pro will be assigned shortly." : "Your request is live. An agent will assign a verified pro shortly."}</p>
          <div className="mt-4 rounded-2xl bg-surface px-4 py-3">
            <p className="text-xs font-bold text-muted">Booking ID</p>
            <p className="text-lg font-extrabold text-primary-700">#{createdId.slice(-6)}</p>
            <p className="text-xs font-semibold text-muted">{sub?.name} • ₹{totalAmount.toLocaleString("en-IN")} • {payment.toUpperCase()}</p>
          </div>
          {/* online payment step (dummy/test closed loop) */}
          {!paidOnline && payment !== "cod" ? (
            <div className="mt-4">
              <RazorpayCheckout bookingId={createdId} amount={totalAmount} mobile={mobile} onSuccess={() => setPaidOnline(true)} />
            </div>
          ) : null}
          <div className="mt-5 grid gap-2">
            <Link href="/customer/dashboard" className="btn-primary w-full !py-3">Track in dashboard</Link>
            <button onClick={() => setCreatedId("")} className="btn-ghost w-full !py-3">Book another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between">
          <Link href="/customer/dashboard" className="flex items-center gap-2 text-sm font-bold text-body hover:text-primary-700"><ArrowLeft size={16} /> Back to dashboard</Link>
          <p className="text-sm font-extrabold text-ink">Book a service</p>
          <span className="chip chip-primary">Fixed pricing</span>
        </div>
      </header>

      <main className="page-container mx-auto max-w-6xl py-6">
        <p className="eyebrow">Upfront pricing • Verified pros</p>
        <h1 className="h-section mt-2 !text-2xl">What do you need done?</h1>
        <p className="sub mb-5 mt-1">Fixed price shown live on the right — no surprises at the door.</p>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── left: form sections ── */}
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1 · service */}
            <section className="card">
              <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[11px] text-white">1</span><Wrench size={15} className="text-primary-600" /> Choose your service</p>

              {cats.length === 0 ? (
                <p className="rounded-xl bg-surface px-3 py-4 text-center text-xs font-semibold text-muted">Services launching soon.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cats.map((c) => (
                    <button key={c.id} type="button" onClick={() => { setCatId(c.id); setSubId(""); }} className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-bold transition-all ${catId === c.id ? "border-primary-600 bg-primary-600 text-white shadow-sm" : "border-line bg-white text-body hover:border-primary-300 hover:bg-primary-50"}`}>
                      <span className="text-base leading-none">{c.icon === "" ? "✨" : c.icon}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {cat ? (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">{cat.name} · pick one</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {cat.subCategories.map((s) => {
                      const active = subId === s.id;
                      return (
                        <button key={s.id} type="button" onClick={() => setSubId(s.id)} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${active ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600" : "border-line bg-white hover:border-primary-300 hover:bg-surface"}`}>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-ink">{s.name}</p>
                            <p className="text-[11px] font-medium text-muted">{s.unit}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2.5">
                            <b className="text-sm text-primary-700">₹{s.basePrice}</b>
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${active ? "border-primary-600 bg-primary-600 text-white" : "border-line text-transparent"}`}><Check size={11} /></span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : cats.length > 0 ? (
                <p className="mt-3 text-xs font-medium text-muted">👆 Pick a category to see exact services and fixed prices.</p>
              ) : null}
            </section>

            {/* 2 · issue */}
            <section className="card">
              <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[11px] text-white">2</span> Describe the issue</p>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="e.g. Bathroom tap is leaking, need it fixed today…" className="input" required />
            </section>

            {/* 3 · address */}
            <section className="card">
              <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[11px] text-white">3</span><MapPin size={15} className="text-primary-600" /> Service address</p>
              <BookingMapPicker onChange={onMapAddress} />
              {locPicked ? (
                <p className="mb-2 mt-1 flex items-center gap-1 rounded-lg bg-success-soft px-2.5 py-1 text-xs font-bold text-success"><Check size={12} /> Location picked from map</p>
              ) : null}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm">
                  <Home size={15} className="shrink-0 text-primary-600" />
                  <input value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="House / Flat no. *" className="w-full bg-transparent font-medium outline-none placeholder:text-muted" required />
                </label>
                <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area / Locality *" className="input" required />
                <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode (6-digit) *" inputMode="numeric" className="input" required />
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" className="input" required />
              </div>
              <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark (optional)" className="input mt-2" />
            </section>

            {/* 4 · schedule */}
            <section className="card">
              <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[11px] text-white">4</span><Calendar size={15} className="text-primary-600" /> When do you need it?</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} className="input" required />
                <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="input" required>
                  <option value="">Pick a time slot…</option>
                  {SLOTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </section>

            {err !== "" ? <p className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-[13px] font-semibold text-danger"><AlertCircle size={15} className="mt-0.5 shrink-0" />{err}</p> : null}
          </form>

          {/* ── right: sticky order summary ── */}
          <aside className="lg:sticky lg:top-20">
            <div className="card !p-5">
              <p className="mb-3 font-extrabold text-ink">Order summary</p>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{sub?.name ?? "Select a service"}</p>
                  <p className="text-xs text-muted">{cat?.name ?? "—"}{sub ? ` • ${sub.unit}` : ""}</p>
                </div>
                {sub ? <span className="chip chip-accent shrink-0">Priced</span> : <span className="chip chip-neutral shrink-0">Not selected</span>}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-body">Base price</span><b className="text-ink">₹{baseAmount.toLocaleString("en-IN")}</b></div>
                <div className="flex justify-between"><span className="text-body">Surge</span><b className="text-ink">₹{surgeAmount}</b></div>
                <div className="flex justify-between"><span className="text-body">Visiting</span><b className="text-ink">₹{visitingCharge}</b></div>
                <div className="flex justify-between border-t border-line pt-2 text-base"><span className="font-extrabold text-ink">Total</span><span className="font-extrabold text-primary-700">₹{totalAmount.toLocaleString("en-IN")}</span></div>
              </div>

              {date || slot ? (
                <div className="mt-3 rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-body">
                  📅 {date || "—"} · ⏰ {slot?.label ?? "—"}
                </div>
              ) : null}

              <div className="mt-3">
                <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-muted">Payment</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["cod", "upi", "card", "wallet"] as const).map((p) => (
                    <button key={p} type="button" onClick={() => setPayment(p)} className={`rounded-full border px-3 py-1 text-xs font-bold uppercase transition-all ${payment === p ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-body hover:border-primary-300"}`}>{p}</button>
                  ))}
                </div>
              </div>

              {missing.length > 0 ? (
                <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-[11px] font-semibold text-accent-ink">
                  Still needed: {missing.join(", ")}
                </p>
              ) : null}

              <button type="submit" form="booking-form" disabled={create.isPending} className="btn-primary mt-4 w-full !py-3.5 !text-[15px] disabled:opacity-50">
                {create.isPending ? <><Loader2 size={17} className="animate-spin" /> Placing booking…</> : <>Confirm booking • ₹{totalAmount.toLocaleString("en-IN")}</>}
              </button>
              <p className="mt-2 text-center text-[11px] font-medium text-muted">{payment === "cod" ? "You'll be charged at the door." : "You'll be charged at the door — pay " + payment.toUpperCase() + " after the work is done."}</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}