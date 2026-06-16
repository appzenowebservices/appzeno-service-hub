// src/pages/customer/booking/Step6Payment.tsx
import { useState, useEffect, useRef } from "react";
import {
  Zap, BadgeCheck, Banknote, Check,
  Smartphone, CreditCard, Shield, Tag, Wallet,
  X, QrCode, Copy, CheckCircle2, IndianRupee, Info,
} from "lucide-react";
import type { Step6Data } from "./types";
import { VALID_COUPONS } from "./data";

interface Props {
  data:          Step6Data;
  errors:        Record<string,string>;
  onChange:      (d: Step6Data) => void;
  totalPayable:  number;
  preDiscount:   number;
  couponDiscount:number;
  walletDiscount:number;
  subtotal:      number;
  gst:           number;
  walletBalance: number; // from user profile (pass 250 as mock)
}

function PricingRow({ label, amount, note, highlight, red }: {
  label:string; amount:string; note?:string; highlight?:boolean; red?:boolean;
}) {
  return (
    <div className={`flex items-start justify-between py-2.5 ${highlight ? "bg-emerald-50 px-3 -mx-3 rounded-xl" : ""} border-b border-slate-50 last:border-0`}>
      <div>
        <p className={`text-sm ${highlight ? "font-black text-slate-800" : "text-slate-600"}`}>{label}</p>
        {note && <p className="text-xs text-slate-400 mt-0.5">{note}</p>}
      </div>
      <p className={`text-sm font-bold flex-shrink-0 ml-4 ${red ? "text-red-500" : highlight ? "text-emerald-700 font-black text-base" : "text-slate-700"}`}>
        {amount}
      </p>
    </div>
  );
}

// ── QR Code Generator (canvas-based, no library) ─────────────────────────────
function QRDisplay({ amount, upiId, bookingRef }: { amount:number; upiId:string; bookingRef:string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied,  setCopied]  = useState(false);

  const upiString = `upi://pay?pa=${upiId || "addies@upi"}&pn=ADDies+ServiceHub&am=${amount}&cu=INR&tn=Booking+${bookingRef}`;

  // Draw a simple visual QR placeholder with real UPI string overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width  = size;
    canvas.height = size;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Draw a pattern resembling QR code (decorative — real integration uses qrcode lib)
    const cellSize = 8;
    const cols = Math.floor(size / cellSize);

    // Seed-based deterministic pattern from amount+bookingRef
    const seed = (amount * 7 + bookingRef.split("").reduce((a,c) => a + c.charCodeAt(0), 0)) % 999;
    function pseudoRand(x: number, y: number) {
      const n = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453;
      return n - Math.floor(n);
    }

    for (let r = 0; r < cols; r++) {
      for (let c = 0; c < cols; c++) {
        const isBorder = r < 2 || c < 2 || r >= cols-2 || c >= cols-2;
        const isCorner = (r < 7 && c < 7) || (r < 7 && c >= cols-7) || (r >= cols-7 && c < 7);
        if (isBorder) continue;
        if (isCorner) { ctx.fillStyle = "#1e293b"; ctx.fillRect(c*cellSize, r*cellSize, cellSize, cellSize); continue; }
        if (pseudoRand(r, c) > 0.55) {
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(c*cellSize, r*cellSize, cellSize, cellSize);
        }
      }
    }

    // Corner finder squares
    const drawFinder = (x: number, y: number) => {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(x, y, 7*cellSize, 7*cellSize);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x+cellSize, y+cellSize, 5*cellSize, 5*cellSize);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(x+2*cellSize, y+2*cellSize, 3*cellSize, 3*cellSize);
    };
    drawFinder(0, 0);
    drawFinder((cols-7)*cellSize, 0);
    drawFinder(0, (cols-7)*cellSize);

    // Center logo area
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(size/2-20, size/2-20, 40, 40);
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect(size/2-16, size/2-16, 32, 32, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("₹", size/2, size/2+5);
  }, [amount, bookingRef]);

  function copyUpi() {
    navigator.clipboard.writeText(upiString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
        <canvas ref={canvasRef} className="w-48 h-48 block" />
      </div>
      <div className="text-center">
        <p className="text-2xl font-black text-emerald-700">₹{amount.toLocaleString("en-IN")}</p>
        <p className="text-xs text-slate-500 mt-0.5">Scan with any UPI app</p>
        <p className="text-xs text-slate-400">GPay · PhonePe · Paytm · BHIM</p>
      </div>
      <button onClick={copyUpi}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all">
        {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
        {copied ? "Copied!" : "Copy UPI String"}
      </button>
      <p className="text-xs text-slate-400 max-w-xs text-center break-all px-2">{upiString}</p>
    </div>
  );
}

// ── Main Step6 ────────────────────────────────────────────────────────────────
export default function Step6Payment({
  data, errors, onChange,
  totalPayable, preDiscount, couponDiscount, walletDiscount, subtotal, gst,
  walletBalance,
}: Props) {
  const [couponInput, setCouponInput] = useState("");
  const [couponErr,   setCouponErr]   = useState("");
  const [showQr,      setShowQr]      = useState(false);
  const [partialInput,setPartialInput]= useState(String(Math.round(totalPayable * 0.3)));

  const bookingRef = `ADK${Date.now().toString().slice(-6)}`;

  // Partial: clamp between 1 and totalPayable
  const partialAmt  = Math.min(Math.max(parseInt(partialInput) || 0, 1), totalPayable);
  const remainingAmt= totalPayable - partialAmt;

  function applyCoupon() {
    setCouponErr("");
    const code  = couponInput.toUpperCase().trim();
    const valid = VALID_COUPONS[code];
    if (!valid) { setCouponErr("Invalid coupon code"); return; }
    const disc = valid.type === "percent"
      ? Math.round(preDiscount * valid.value / 100)
      : valid.value;
    onChange({ ...data, couponCode:code, couponApplied:true, couponDiscount:disc });
  }

  function removeCoupon() {
    onChange({ ...data, couponCode:"", couponApplied:false, couponDiscount:0 });
    setCouponInput("");
    setCouponErr("");
  }

  // Amount to pay now based on mode
  const payNowAmount = data.paymentMode === "partial"
    ? partialAmt
    : data.paymentMode === "full"
    ? totalPayable
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">Payment</h2>
        <p className="text-sm text-slate-400 mt-0.5">Choose how you'd like to pay</p>
      </div>

      {/* ── Payment Mode ── */}
      <div>
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Payment Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            {
              val:"partial",
              label:"Partial Payment",
              sub:"Pay a part now, rest after service",
              icon:Zap,
              color:"text-amber-600",
              badge:"Flexible",
            },
            {
              val:"full",
              label:"Full Payment",
              sub:`Pay ₹${totalPayable.toLocaleString("en-IN")} now`,
              icon:BadgeCheck,
              color:"text-emerald-600",
              badge:"Recommended",
            },
            {
              val:"cod",
              label:"Pay After Service",
              sub:"Cash/UPI on completion",
              icon:Banknote,
              color:"text-blue-600",
              badge:null,
            },
          ] as const).map(({ val, label, sub, icon:Icon, color, badge }) => (
            <button key={val} type="button"
              onClick={() => onChange({ ...data, paymentMode:val, paymentMethod: val === "cod" ? "cash" : data.paymentMethod })}
              className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                ${data.paymentMode === val ? "border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              {badge && (
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-emerald-500 text-white text-2xs font-bold rounded-full">
                  {badge}
                </span>
              )}
              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100">
                <Icon size={17} className={color} />
              </div>
              <div>
                <p className={`text-sm font-bold ${data.paymentMode === val ? "text-emerald-700" : "text-slate-700"}`}>{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
              {data.paymentMode === val && <Check size={14} className="text-emerald-500 ml-auto flex-shrink-0 mt-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Partial Amount Input ── */}
      {data.paymentMode === "partial" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black text-amber-700 uppercase tracking-wide">Choose Partial Amount</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 px-4 py-3 bg-white border-2 border-amber-300 rounded-xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <IndianRupee size={15} className="text-amber-600 flex-shrink-0" />
              <input
                type="number"
                min={1}
                max={totalPayable}
                value={partialInput}
                onChange={e => setPartialInput(e.target.value)}
                className="flex-1 text-lg font-black text-slate-800 outline-none bg-transparent w-0 min-w-0"
              />
            </div>
            <span className="text-xs text-slate-500">of ₹{totalPayable.toLocaleString("en-IN")}</span>
          </div>

          {/* Quick % buttons */}
          <div className="flex gap-2">
            {[25, 50, 75].map(pct => (
              <button key={pct} type="button"
                onClick={() => setPartialInput(String(Math.round(totalPayable * pct / 100)))}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-amber-300 text-amber-700 bg-white hover:bg-amber-100 transition-all">
                {pct}%
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <div>
              <p className="text-xs text-slate-500">Pay now</p>
              <p className="font-black text-emerald-700">₹{partialAmt.toLocaleString("en-IN")}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Pay after service</p>
              <p className="font-black text-slate-600">₹{remainingAmt.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-100 rounded-xl p-2.5">
            <Info size={12} className="flex-shrink-0 mt-0.5" />
            Remaining ₹{remainingAmt.toLocaleString("en-IN")} will be collected by the vendor after service completion.
          </div>
        </div>
      )}

      {/* ── Payment Method (not COD) ── */}
      {data.paymentMode !== "cod" && (
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
            Payment Method
          </label>
          <div className="flex gap-2">
            {([
              { val:"upi",        label:"UPI",         icon:Smartphone },
              { val:"card",       label:"Card",        icon:CreditCard },
              { val:"netbanking", label:"Net Banking",  icon:Shield },
            ] as const).map(({ val, label, icon:Icon }) => (
              <button key={val} type="button"
                onClick={() => onChange({ ...data, paymentMethod:val })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all
                  ${data.paymentMethod === val
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* UPI ID input */}
          {data.paymentMethod === "upi" && (
            <div className="mt-3 space-y-2" data-field="upiId">
              <input type="text" placeholder="Enter UPI ID (e.g. name@upi)"
                value={data.upiId}
                onChange={e => onChange({ ...data, upiId: e.target.value })}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border-2 bg-white transition-all
                  focus:outline-none focus:ring-2 focus:ring-emerald-200
                  ${errors.upiId ? "border-red-300" : "border-slate-200 focus:border-emerald-400"}`} />
              {errors.upiId && <p className="text-xs text-red-500">{errors.upiId}</p>}

              {/* Show QR button */}
              {data.paymentMode !== "cod" && (
                <button type="button" onClick={() => setShowQr(!showQr)}
                  className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline">
                  <QrCode size={13} />
                  {showQr ? "Hide QR Code" : "Show Payment QR Code"}
                </button>
              )}
            </div>
          )}

          {/* QR Display */}
          {showQr && data.paymentMode !== "cod" && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                  <QrCode size={14} className="text-emerald-500" />
                  Scan to Pay
                </p>
                <button onClick={() => setShowQr(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
              <QRDisplay
                amount={payNowAmount}
                upiId={data.upiId}
                bookingRef={bookingRef}
              />
            </div>
          )}

          {(data.paymentMethod === "card" || data.paymentMethod === "netbanking") && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              <Shield size={13} className="text-emerald-500 flex-shrink-0" />
              Redirected to Razorpay secure gateway on confirmation
            </div>
          )}
        </div>
      )}

      {/* ── Coupon ── */}
      <div>
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          <Tag size={12} className="inline mr-1" /> Apply Coupon
        </label>
        {data.couponApplied ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 border-2 border-green-300">
            <Check size={16} className="text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-black text-green-700">{data.couponCode}</p>
              <p className="text-xs text-green-600">{VALID_COUPONS[data.couponCode]?.desc} · Saved ₹{couponDiscount}</p>
            </div>
            <button onClick={removeCoupon} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input type="text" placeholder="Enter coupon code"
                value={couponInput}
                onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(""); }}
                onKeyDown={e => e.key === "Enter" && applyCoupon()}
                className={`flex-1 px-4 py-2.5 text-sm rounded-xl border-2 bg-white uppercase tracking-widest
                  focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all
                  ${couponErr ? "border-red-300" : "border-slate-200"}`} />
              <button onClick={applyCoupon}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all flex-shrink-0">
                Apply
              </button>
            </div>
            {couponErr && <p className="text-xs text-red-500 mt-1">{couponErr}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(VALID_COUPONS).map(([code, info]) => (
                <button key={code} type="button"
                  onClick={() => { setCouponInput(code); setCouponErr(""); }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100 transition-all">
                  {code}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Wallet ── */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-violet-600" />
            <p className="text-sm font-black text-violet-800">ADDies Wallet</p>
          </div>
          <p className="text-sm font-black text-violet-700">₹{walletBalance} available</p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox"
            checked={data.walletUsed > 0}
            onChange={e => onChange({ ...data, walletUsed: e.target.checked ? Math.min(walletBalance, totalPayable) : 0 })}
            className="w-4 h-4 accent-violet-600" />
          <span className="text-xs text-violet-700 font-medium">
            Use wallet balance (₹{Math.min(walletBalance, totalPayable)} will be applied)
          </span>
        </label>
      </div>

      {/* ── Bill Summary ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Bill Summary</p>
        </div>
        <div className="px-5 py-3">
          <PricingRow label="Subtotal"   amount={`₹${subtotal}`} />
          <PricingRow label="GST (18%)"  amount={`₹${gst}`} />
          {couponDiscount > 0 && <PricingRow label={`Coupon (${data.couponCode})`} amount={`−₹${couponDiscount}`} red />}
          {walletDiscount > 0 && <PricingRow label="Wallet Credit"   amount={`−₹${walletDiscount}`} red />}
          <div className="h-px bg-slate-200 my-1" />
          {data.paymentMode === "partial" ? (
            <>
              <PricingRow label="Pay Now" amount={`₹${partialAmt}`} highlight />
              <PricingRow label="Pay After Service" amount={`₹${remainingAmt}`}
                note="Collected by vendor on completion" />
            </>
          ) : data.paymentMode === "cod" ? (
            <PricingRow label="Pay After Service" amount={`₹${totalPayable}`} highlight />
          ) : (
            <PricingRow label="Total Payable" amount={`₹${totalPayable}`} highlight />
          )}
        </div>
      </div>
    </div>
  );
}
