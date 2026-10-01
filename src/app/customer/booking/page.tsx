"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, Calendar, MapPin, Tag, AlertCircle, ArrowLeft, Wrench } from "lucide-react";
import { trpc } from "~/trpc/react";
import RazorpayCheckout from "./RazorpayCheckout";

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

  const canSubmit = catId && subId && desc.trim().length >= 5 && houseNo.trim() && area.trim() && /^\d{6}$/.test(pincode) && city.trim() && date && slot && payment;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!canSubmit || !cat || !sub || !slot) {
      setErr("Please fill all required fields.");
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
          <span className="chip chip-primary">Customer</span>
        </div>
      </header>

      <main className="page-container mx-auto max-w-2xl py-6">
        <p className="eyebrow">Upfront pricing • Verified pros</p>
        <h1 className="h-section mt-2 !text-2xl">What do you need done?</h1>
        <p className="sub mb-5 mt-1">Fixed price shown before you confirm — no surprises at the door.</p>

        <form onSubmit={handleSubmit} className="card space-y-4 !p-5">
          {/* service */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-[13px] font-extrabold text-ink"><Wrench size={14} className="text-primary-600" /> Service</label>
            <select value={catId} onChange={(e) => { setCatId(e.target.value); setSubId(""); }} className="input mb-2" required>
              <option value="">Select category…</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            {cat ? (
              <select value={subId} onChange={(e) => setSubId(e.target.value)} className="input" required>
                <option value="">Select exact service…</option>
                {cat.subCategories.map((s) => <option key={s.id} value={s.id}>{s.name} — ₹{s.basePrice} ({s.unit})</option>)}
              </select>
            ) : null}
          </div>

          {/* description */}
          <div>
            <label className="mb-1 block text-[13px] font-extrabold text-ink">Describe the issue</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="e.g. Bathroom tap is leaking, need it fixed today…" className="input" required />
          </div>

          {/* address */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-[13px] font-extrabold text-ink"><MapPin size={14} className="text-primary-600" /> Service address</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="House / Flat no. *" className="input" required />
              <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area / Locality *" className="input" required />
              <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode (6-digit) *" inputMode="numeric" className="input" required />
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" className="input" required />
            </div>
            <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark (optional)" className="input mt-2" />
          </div>

          {/* schedule */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-[13px] font-extrabold text-ink"><Calendar size={14} className="text-primary-600" /> When do you need it?</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} className="input" required />
              <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="input" required>
                <option value="">Pick a time slot…</option>
                {SLOTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* payment */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-[13px] font-extrabold text-ink"><Tag size={14} className="text-primary-600" /> Payment method</label>
            <div className="flex flex-wrap gap-1.5">
              {(["cod", "upi", "card", "wallet"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPayment(p)} className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase transition-all ${payment === p ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-body hover:border-primary-300"}`}>{p}</button>
              ))}
            </div>
          </div>

          {/* summary */}
          {sub ? (
            <div className="rounded-2xl bg-surface p-4">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Price summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-body">{sub.name}</span><b className="text-ink">₹{baseAmount.toLocaleString("en-IN")}</b></div>
                <div className="flex justify-between"><span className="text-body">Surge</span><b className="text-ink">₹{surgeAmount}</b></div>
                <div className="flex justify-between"><span className="text-body">Visiting</span><b className="text-ink">₹{visitingCharge}</b></div>
                <div className="flex justify-between border-t border-line pt-1.5 text-base"><span className="font-extrabold text-ink">Total</span><span className="font-extrabold text-primary-700">₹{totalAmount.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
          ) : null}

          {err !== "" ? <p className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-[13px] font-semibold text-danger"><AlertCircle size={15} className="mt-0.5 shrink-0" />{err}</p> : null}

          <button type="submit" disabled={create.isPending || !canSubmit} className="btn-primary w-full !py-3.5 !text-[15px] disabled:opacity-50">
            {create.isPending ? <><Loader2 size={17} className="animate-spin" /> Placing booking…</> : <>Confirm booking • ₹{totalAmount.toLocaleString("en-IN")}</>}
          </button>
          <p className="text-center text-[11px] font-medium text-muted">You'll be charged at the door — pay {payment.toUpperCase()} after the work is done.</p>
        </form>
      </main>
    </div>
  );
}