"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "~/trpc/react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load payment gateway"));
    document.head.appendChild(s);
  });
}

export default function RazorpayCheckout({
  bookingId,
  amount,
  email,
  mobile,
  onSuccess,
}: {
  bookingId: string;
  amount: number;
  email?: string;
  mobile?: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [paid, setPaid] = useState(false);
  const createOrder = trpc.payments.createOrder.useMutation();
  const verify = trpc.payments.verify.useMutation({
    onSuccess: () => { setPaid(true); onSuccess(); },
    onError: (e) => { setErr(e.message); setLoading(false); },
  });

  const pay = async () => {
    setLoading(true);
    setErr("");
    try {
      const { orderId, keyId } = await createOrder.mutateAsync({ bookingId, amount });
      await loadRazorpayScript();
      const rz = new window.Razorpay!({
        key: keyId,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "ADDies Service Hub",
        description: `Booking #${bookingId.slice(-6)}`,
        order_id: orderId,
        prefill: { email, contact: mobile },
        handler: (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          verify.mutate({
            bookingId,
            razorpayOrderId: resp.razorpay_order_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          });
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rz.open();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed to start");
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-success-soft px-3.5 py-2.5 text-sm font-bold text-success">
        <CheckCircle2 size={16} /> Payment confirmed — ₹{amount.toLocaleString("en-IN")}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="w-full rounded-full bg-ink py-3 text-[15px] font-extrabold text-white transition-all hover:bg-primary-700 disabled:opacity-60"
      >
        {loading ? <><Loader2 size={16} className="mr-2 inline animate-spin" /> Opening payment…</> : <>🔒 Pay ₹{amount.toLocaleString("en-IN")} online</>}
      </button>
      {err !== "" ? <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-danger-soft px-3 py-2 text-[13px] font-semibold text-danger"><AlertCircle size={15} className="mt-0.5 shrink-0" />{err}</p> : null}
      <p className="mt-2 text-center text-[11px] font-medium text-muted">Test mode — use any test card (e.g. 4111 1111 1111 1111) or UPI. Signature is verified server-side.</p>
    </div>
  );
}