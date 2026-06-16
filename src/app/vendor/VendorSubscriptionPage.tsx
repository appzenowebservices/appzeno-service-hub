/**
 * VendorSubscriptionPage.tsx
 * Location: src/pages/vendor/VendorSubscriptionPage.tsx
 *
 * VendorDashboard.tsx mein add karo:
 *   import VendorSubscriptionPage from "./VendorSubscriptionPage";
 *   case "subscription": return <VendorSubscriptionPage />;
 */

import { useState } from "react";
import {
  CreditCard, CheckCircle2, X, Zap, Star, Crown,
  Shield, Clock, IndianRupee, ChevronRight, AlertTriangle,
  Sparkles, RotateCcw, BadgeCheck, Lock, Headphones,
  TrendingUp, Users, Package, Calendar, Info,
  ArrowRight, Check, Ban, Gift,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

// ─── Plan Data ────────────────────────────────────────────────────────────────
interface Plan {
  id:          string;
  name:        string;
  icon:        React.ElementType;
  tagline:     string;
  monthlyPrice: number;
  yearlyPrice:  number;    // per month when billed yearly
  yearlyTotal:  number;    // full year amount
  color:        string;
  bg:           string;
  border:       string;
  textAccent:   string;
  badge?:       string;
  badgeCls?:    string;
  features: {
    text:     string;
    included: boolean;
    highlight?: boolean;
  }[];
}

const PLANS: Plan[] = [
  {
    id:          "basic",
    name:        "Basic",
    icon:        Package,
    tagline:     "Sirf shuru karne ke liye",
    monthlyPrice: 0,
    yearlyPrice:  0,
    yearlyTotal:  0,
    color:       "text-slate-600",
    bg:          "bg-slate-50",
    border:      "border-slate-200",
    textAccent:  "text-slate-700",
    features: [
      { text: "5 leads per month",             included: true },
      { text: "Basic profile listing",          included: true },
      { text: "Customer ratings visible",       included: true },
      { text: "Standard support (72hr)",        included: true },
      { text: "Priority lead matching",         included: false },
      { text: "Unlimited leads",                included: false },
      { text: "Featured listing",              included: false },
      { text: "Dedicated account manager",      included: false },
      { text: "Business analytics dashboard",   included: false },
      { text: "Emergency leads access",         included: false },
    ],
  },
  {
    id:          "pro",
    name:        "Pro",
    icon:        Zap,
    tagline:     "Most popular — growing vendors ke liye",
    monthlyPrice: 499,
    yearlyPrice:  374,
    yearlyTotal:  4488,
    color:       "text-emerald-600",
    bg:          "bg-emerald-50",
    border:      "border-emerald-400",
    textAccent:  "text-emerald-700",
    badge:       "Most Popular",
    badgeCls:    "bg-emerald-500 text-white",
    features: [
      { text: "50 leads per month",             included: true, highlight: true },
      { text: "Priority profile listing",        included: true },
      { text: "Customer ratings visible",        included: true },
      { text: "Priority support (24hr)",         included: true },
      { text: "Priority lead matching",          included: true, highlight: true },
      { text: "Unlimited leads",                 included: false },
      { text: "Featured listing",               included: true },
      { text: "Dedicated account manager",       included: false },
      { text: "Business analytics dashboard",    included: true },
      { text: "Emergency leads access",          included: true, highlight: true },
    ],
  },
  {
    id:          "premium",
    name:        "Premium",
    icon:        Crown,
    tagline:     "Top vendors ke liye — maximum growth",
    monthlyPrice: 999,
    yearlyPrice:  749,
    yearlyTotal:  8988,
    color:       "text-violet-600",
    bg:          "bg-violet-50",
    border:      "border-violet-400",
    textAccent:  "text-violet-700",
    badge:       "Best Value",
    badgeCls:    "bg-violet-600 text-white",
    features: [
      { text: "Unlimited leads",                included: true, highlight: true },
      { text: "Top-ranked profile listing",     included: true, highlight: true },
      { text: "Customer ratings visible",       included: true },
      { text: "Dedicated support (2hr SLA)",    included: true },
      { text: "Priority lead matching",         included: true },
      { text: "Unlimited leads",                included: true, highlight: true },
      { text: "Featured listing (Top Slot)",    included: true, highlight: true },
      { text: "Dedicated account manager",      included: true, highlight: true },
      { text: "Business analytics dashboard",   included: true },
      { text: "Emergency leads access",         included: true },
    ],
  },
];

// ─── Invoice History ──────────────────────────────────────────────────────────
interface Invoice {
  id:     string;
  date:   string;
  plan:   string;
  amount: number;
  status: "paid" | "pending" | "failed";
  ref:    string;
}

const INVOICES: Invoice[] = [
  { id: "INV-002", date: "1 Feb 2026",  plan: "Pro — Monthly", amount: 499, status: "paid",    ref: "RZP26020001" },
  { id: "INV-001", date: "1 Jan 2026",  plan: "Pro — Monthly", amount: 499, status: "paid",    ref: "RZP26010001" },
  { id: "INV-000", date: "1 Dec 2025",  plan: "Basic",          amount: 0,   status: "paid",    ref: "FREE" },
];

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({
  plan, billing, onClose, onSuccess,
}: {
  plan: Plan; billing: "monthly" | "yearly"; onClose: () => void; onSuccess: () => void;
}) {
  const price    = billing === "yearly" ? plan.yearlyTotal : plan.monthlyPrice;
  const gst      = Math.round(price * 0.18);
  const total    = price + gst;
  const [step,   setStep]   = useState<"confirm" | "processing" | "done">("confirm");
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId,  setUpiId]  = useState("");
  const [err,    setErr]    = useState("");

  function handlePay() {
    if (method === "upi" && !upiId.includes("@")) {
      setErr("Valid UPI ID daalo (e.g. 9876543210@upi)");
      return;
    }
    setErr("");
    setStep("processing");
    setTimeout(() => { setStep("done"); setTimeout(onSuccess, 1500); }, 2000);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-950 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Upgrade to</p>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <plan.icon size={18} className={plan.color} /> {plan.name} Plan
              </h2>
            </div>
            {step === "confirm" && (
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">₹{total.toLocaleString("en-IN")}</span>
            <span className="text-slate-400 text-sm">/{billing === "yearly" ? "year" : "month"}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ₹{price} + ₹{gst} GST (18%)
            {billing === "yearly" && ` · Save ₹${((plan.monthlyPrice * 12) - plan.yearlyTotal).toLocaleString("en-IN")} vs monthly`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === "confirm" && (
            <div className="space-y-4">
              {/* Payment method */}
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Payment Method</p>
                <div className="flex gap-2">
                  {(["upi", "card", "netbanking"] as const).map(m => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all capitalize
                        ${method === m ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      {m === "upi" ? "UPI" : m === "card" ? "Card" : "Net Banking"}
                    </button>
                  ))}
                </div>
              </div>

              {method === "upi" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">UPI ID</label>
                  <input
                    type="text" placeholder="yourname@upi"
                    value={upiId} onChange={e => { setUpiId(e.target.value); setErr(""); }}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white
                      focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all
                      ${err ? "border-red-300" : "border-slate-200"}`}
                  />
                  {err && <p className="text-xs text-red-500 font-medium">{err}</p>}
                </div>
              )}
              {method === "card" && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Lock size={20} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Card payment Razorpay secure gateway pe process hogi</p>
                </div>
              )}
              {method === "netbanking" && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Lock size={20} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Net Banking Razorpay secure gateway pe process hogi</p>
                </div>
              )}

              {/* Order summary */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Order Summary</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    ["Plan", `${plan.name} ${billing === "yearly" ? "(Yearly)" : "(Monthly)"}`],
                    ["Subtotal",   `₹${price}`],
                    ["GST (18%)",  `₹${gst}`],
                    ["Total",      `₹${total}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between px-4 py-2.5">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-bold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">
                <Shield size={12} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                Secure payment powered by Razorpay. Aapka data encrypt hai.
              </div>

              <button onClick={handlePay}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                           font-black text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all
                           flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                Pay ₹{total.toLocaleString("en-IN")} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-slate-700">Payment Processing...</p>
                <p className="text-xs text-slate-400 mt-1">Please wait, do not close this window</p>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-800 mb-1">Payment Successful! 🎉</p>
                <p className="text-sm text-slate-500">Aap ab <strong>{plan.name}</strong> plan pe hain</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan, billing, isActive, onSelect,
}: {
  plan: Plan; billing: "monthly" | "yearly"; isActive: boolean; onSelect: () => void;
}) {
  const Icon  = plan.icon;
  const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const isFree = plan.monthlyPrice === 0;

  return (
    <div className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200
      ${isActive ? `${plan.border} shadow-xl scale-[1.02]` : "border-slate-200 hover:border-slate-300 hover:shadow-md"}`}>

      {plan.badge && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black ${plan.badgeCls}`}>
          {plan.badge}
        </div>
      )}

      {isActive && (
        <div className="absolute top-4 left-4">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
            <BadgeCheck size={11} /> Current Plan
          </span>
        </div>
      )}

      <div className={`h-1.5 w-full ${isActive ? `bg-gradient-to-r ${
        plan.id === "pro" ? "from-emerald-400 to-emerald-600" :
        plan.id === "premium" ? "from-violet-400 to-violet-600" : "from-slate-300 to-slate-400"
      }` : "bg-slate-100"}`} />

      <div className="p-5">
        {/* Plan name */}
        <div className={`w-10 h-10 rounded-xl ${plan.bg} flex items-center justify-center mb-3 ${isActive ? plan.border + " border" : ""}`}>
          <Icon size={18} className={plan.color} />
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-0.5">{plan.name}</h3>
        <p className="text-xs text-slate-400 mb-4">{plan.tagline}</p>

        {/* Price */}
        <div className="mb-5">
          {isFree ? (
            <p className="text-3xl font-black text-slate-800">Free</p>
          ) : (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-800">₹{price}</span>
                <span className="text-sm text-slate-400">/month</span>
              </div>
              {billing === "yearly" && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400 line-through">₹{plan.monthlyPrice}/month</span>
                  <span className={`text-xs font-bold ${plan.textAccent}`}>
                    Save ₹{((plan.monthlyPrice - price) * 12).toLocaleString("en-IN")}/yr
                  </span>
                </div>
              )}
              {billing === "yearly" && (
                <p className="text-xs text-slate-400 mt-0.5">Billed ₹{plan.yearlyTotal.toLocaleString("en-IN")}/year</p>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2 mb-5">
          {plan.features.map((f, i) => (
            <div key={i} className={`flex items-start gap-2.5 text-xs
              ${f.included ? (f.highlight ? "text-slate-800 font-semibold" : "text-slate-600") : "text-slate-300"}`}>
              {f.included
                ? <CheckCircle2 size={13} className={`flex-shrink-0 mt-0.5 ${f.highlight ? plan.color : "text-emerald-400"}`} />
                : <X size={13} className="flex-shrink-0 mt-0.5 text-slate-200" />}
              {f.text}
            </div>
          ))}
        </div>

        {/* CTA */}
        {isActive ? (
          <div className={`w-full py-2.5 rounded-xl text-center text-xs font-bold ${plan.bg} ${plan.textAccent} border ${plan.border}`}>
            ✓ Current Plan
          </div>
        ) : isFree ? (
          <div className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200">
            Free Forever
          </div>
        ) : (
          <button onClick={onSelect}
            className={`w-full py-2.5 rounded-xl text-xs font-black text-white transition-all
              ${plan.id === "premium"
                ? "bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"}
              flex items-center justify-center gap-1.5`}>
            Upgrade to {plan.name} <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorSubscriptionPage() {
  const { user } = useAuthStore();
  const currentPlan = (user as any)?.subscriptionPlan?.toLowerCase() ?? "pro";

  const [billing,       setBilling]       = useState<"monthly" | "yearly">("monthly");
  const [selectingPlan, setSelectingPlan] = useState<Plan | null>(null);
  const [activePlan,    setActivePlan]    = useState(currentPlan);
  const [showInvoices,  setShowInvoices]  = useState(false);
  const [upgraded,      setUpgraded]      = useState(false);

  // Map auth plan name to plan id
  const activePlanObj = PLANS.find(p => p.id === activePlan) ?? PLANS[1];

  // Renewal date mock
  const renewalDate = "1 Apr 2026";
  const daysLeft    = 32;

  function handleUpgrade(plan: Plan) {
    if (plan.id === activePlan || plan.monthlyPrice === 0) return;
    setSelectingPlan(plan);
  }

  function handlePaySuccess() {
    setActivePlan(selectingPlan!.id);
    setSelectingPlan(null);
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 4000);
  }

  return (
    <div className="space-y-6">

      {/* ── Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <CreditCard size={22} className="text-emerald-500" /> Subscription Plans
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Apne kaam ke hisaab se plan choose karo — jitna zyada plan, utne zyada leads
        </p>
      </div>

      {/* ── Upgrade Success Banner */}
      {upgraded && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border-2 border-green-300 animate-pulse">
          <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="font-black text-green-800 text-sm">Plan Upgrade Successful! 🎉</p>
            <p className="text-xs text-green-600">Aapka {activePlanObj.name} plan abhi se active hai</p>
          </div>
        </div>
      )}

      {/* ── Current Plan Status */}
      <div className={`rounded-2xl border-2 ${activePlanObj.border} overflow-hidden`}>
        <div className={`h-1 bg-gradient-to-r ${
          activePlan === "premium" ? "from-violet-400 to-violet-600" :
          activePlan === "pro" ? "from-emerald-400 to-emerald-600" : "from-slate-300 to-slate-400"
        }`} />
        <div className={`${activePlanObj.bg} px-5 py-4`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <activePlanObj.icon size={22} className={activePlanObj.color} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-slate-800">{activePlanObj.name} Plan</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${activePlanObj.bg} ${activePlanObj.textAccent} border ${activePlanObj.border}`}>
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Renews on <strong>{renewalDate}</strong> · {daysLeft} days baaki
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-right">
                <p className="text-xs text-slate-400">Monthly Cost</p>
                <p className={`text-xl font-black ${activePlanObj.textAccent}`}>
                  {activePlanObj.monthlyPrice === 0 ? "Free" : `₹${activePlanObj.monthlyPrice}`}
                </p>
              </div>
              <button
                onClick={() => setShowInvoices(s => !s)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-all">
                {showInvoices ? "Hide" : "View"} Invoices
              </button>
            </div>
          </div>

          {/* Days left bar */}
          {activePlan !== "basic" && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Billing Cycle</span>
                <span className="font-bold">{daysLeft} / 30 days left</span>
              </div>
              <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    activePlan === "premium" ? "bg-violet-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${(daysLeft / 30) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Invoice History */}
      {showInvoices && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Invoice History</p>
          </div>
          <div className="divide-y divide-slate-50">
            {INVOICES.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${inv.status === "paid" ? "bg-green-100" : "bg-amber-100"}`}>
                    {inv.status === "paid"
                      ? <CheckCircle2 size={14} className="text-green-500" />
                      : <Clock size={14} className="text-amber-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{inv.plan}</p>
                    <p className="text-xs text-slate-400">{inv.date} · #{inv.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">
                    {inv.amount === 0 ? "₹0 (Free)" : `₹${(inv.amount * 1.18).toFixed(0)}`}
                  </p>
                  <p className={`text-xs font-bold ${inv.status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                    {inv.status === "paid" ? "Paid" : "Pending"} · {inv.ref}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Billing Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-700">Choose Your Plan</p>
          <p className="text-xs text-slate-400">Yearly billing pe 25% discount milta hai</p>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          {(["monthly", "yearly"] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all capitalize
                ${billing === b ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {b === "yearly" ? (
                <span className="flex items-center gap-1.5">Yearly <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md text-xs">Save 25%</span></span>
              ) : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            isActive={plan.id === activePlan}
            onSelect={() => handleUpgrade(plan)}
          />
        ))}
      </div>

      {/* ── Feature Comparison Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Full Feature Comparison</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-slate-500 font-bold w-48">Feature</th>
                {PLANS.map(p => (
                  <th key={p.id} className={`px-4 py-3 font-black ${p.textAccent} text-center`}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                "5 leads per month",
                "Priority lead matching",
                "50 leads per month",
                "Unlimited leads",
                "Featured listing",
                "Featured listing (Top Slot)",
                "Business analytics dashboard",
                "Emergency leads access",
                "Dedicated account manager",
              ].map(feature => (
                <tr key={feature} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 font-medium">{feature}</td>
                  {PLANS.map(plan => {
                    const f = plan.features.find(pf => pf.text === feature);
                    return (
                      <td key={plan.id} className="px-4 py-3 text-center">
                        {f?.included
                          ? <CheckCircle2 size={15} className={`mx-auto ${f.highlight ? plan.color : "text-emerald-400"}`} />
                          : <X size={14} className="mx-auto text-slate-200" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ / Info */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          {
            icon: RotateCcw, title: "Cancel Anytime",
            desc: "Kisi bhi waqt subscription cancel kar sakte ho. Next billing cycle se charge nahi hoga.",
          },
          {
            icon: Shield, title: "Secure Payments",
            desc: "Razorpay secured payments. Bank-grade encryption. Aapka data kabhi share nahi hoga.",
          },
          {
            icon: Headphones, title: "Dedicated Support",
            desc: "Pro & Premium members ko priority support milti hai. Issues 24hr mein resolve hote hain.",
          },
          {
            icon: TrendingUp, title: "Grow Your Business",
            desc: "Higher plan = more leads = more earnings. Premium vendors average 3x zyada earn karte hain.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">{title}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectingPlan && (
        <PaymentModal
          plan={selectingPlan}
          billing={billing}
          onClose={() => setSelectingPlan(null)}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}
