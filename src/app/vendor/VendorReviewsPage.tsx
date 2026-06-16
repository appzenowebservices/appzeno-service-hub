/**
 * VendorReviewsPage.tsx
 * Location: src/pages/vendor/VendorReviewsPage.tsx
 *
 * VendorDashboard.tsx mein add karo:
 *   import VendorReviewsPage from "./VendorReviewsPage";
 *   case "reviews": return <VendorReviewsPage />;
 */

import { useState, useMemo } from "react";
import {
  Star, MessageSquare, ThumbsUp, BadgeCheck, Search,
  Filter, ChevronDown, ChevronUp, TrendingUp, Award,
  CheckCircle2, Clock, X, RotateCcw, Share2,
  Shield, AlertCircle, Sparkles, User,
  ArrowUp, Minus, ArrowDown, Send, Edit3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ReviewStatus = "published" | "pending" | "flagged";

interface Review {
  id:             string;
  bookingId:      string;
  service:        string;
  category:       string;
  categoryIcon:   string;
  customer: {
    name:         string;
    verified:     boolean;
    totalBookings: number;
    city:         string;
  };
  rating:         number;
  reviewText:     string;
  date:           string;
  status:         ReviewStatus;
  vendorReply:    string | null;
  helpful:        number;
  tags:           string[];
  repeatCustomer: boolean;
}

// ─── Mock Reviews ─────────────────────────────────────────────────────────────
const MOCK_REVIEWS: Review[] = [
  {
    id: "R001", bookingId: "BK-2602-0047",
    service: "Pipe Leak Fix — Kitchen", category: "Plumbing", categoryIcon: "🔧",
    customer: { name: "Ramesh Sharma", verified: true, totalBookings: 12, city: "Delhi" },
    rating: 5, date: "25 Feb 2026", status: "published",
    reviewText: "Bahut hi professional kaam kiya. Time pe aaye, kaam saaf kiya aur proper explanation di. Highly recommend karta hoon. 5 stars deservingly deta hoon!",
    vendorReply: "Thank you Ramesh ji! Aapka trust hamare liye bahut important hai. Aage bhi sewa karne ka mauka dena.",
    helpful: 7, tags: ["Professional", "On Time", "Clean Work"],
    repeatCustomer: true,
  },
  {
    id: "R002", bookingId: "BK-2602-0031",
    service: "Switchboard Replacement", category: "Electrical", categoryIcon: "⚡",
    customer: { name: "Pooja Mehta", verified: true, totalBookings: 5, city: "Delhi" },
    rating: 4, date: "24 Feb 2026", status: "published",
    reviewText: "Kaam accha tha. Thoda late aaye but kaam ke baad sab theek kiya. Paise bhi reasonable the.",
    vendorReply: null,
    helpful: 3, tags: ["Good Work", "Reasonable Price"],
    repeatCustomer: false,
  },
  {
    id: "R003", bookingId: "BK-2602-0018",
    service: "AC Annual Service", category: "AC Service", categoryIcon: "❄️",
    customer: { name: "Amit Kumar", verified: false, totalBookings: 8, city: "Delhi" },
    rating: 3, date: "23 Feb 2026", status: "published",
    reviewText: "Kaam theek tha lekin thoda zyada time liya. AC pehle se better chal raha hai.",
    vendorReply: null,
    helpful: 1, tags: ["Average"],
    repeatCustomer: false,
  },
  {
    id: "R004", bookingId: "BK-2602-0009",
    service: "Geyser Repair", category: "Appliance Repair", categoryIcon: "🔌",
    customer: { name: "Sunita Verma", verified: true, totalBookings: 20, city: "Delhi" },
    rating: 5, date: "22 Feb 2026", status: "published",
    reviewText: "Teesri baar in logo se kaam karaya. Hamesha top quality service milti hai. Trust karta hoon 100%. Geyser same din fix ho gaya.",
    vendorReply: "Sunita ji bahut shukriya! Aap jaisi regular customers hone se hame motivation milta hai.",
    helpful: 12, tags: ["Trusted", "Fast Service", "Repeat Customer"],
    repeatCustomer: true,
  },
  {
    id: "R005", bookingId: "BK-2602-0003",
    service: "Bathroom Fitting", category: "Plumbing", categoryIcon: "🔧",
    customer: { name: "Mohan Lal", verified: false, totalBookings: 3, city: "Delhi" },
    rating: 3, date: "20 Feb 2026", status: "published",
    reviewText: "Kaam ho gaya. Price negotiate karna pada. Overall theek hai.",
    vendorReply: null,
    helpful: 0, tags: [],
    repeatCustomer: false,
  },
  {
    id: "R006", bookingId: "BK-2501-0087",
    service: "Ceiling Fan Install", category: "Electrical", categoryIcon: "⚡",
    customer: { name: "Rekha Singh", verified: true, totalBookings: 7, city: "Delhi" },
    rating: 2, date: "18 Feb 2026", status: "flagged",
    reviewText: "Kaam galat kiya. Fan ek baar laga ke chale gaye. Baad mein aakar check nahi kiya.",
    vendorReply: "Rekha ji, humse galti hua. Agle din aakar issue fix kar diya gaya tha. Hum har kaam ki guarantee dete hain.",
    helpful: 0, tags: ["Needs Improvement"],
    repeatCustomer: false,
  },
  {
    id: "R007", bookingId: "BK-2501-0062",
    service: "Sofa Deep Cleaning", category: "Home Cleaning", categoryIcon: "🧹",
    customer: { name: "Priya Agarwal", verified: true, totalBookings: 30, city: "Delhi" },
    rating: 5, date: "15 Feb 2026", status: "published",
    reviewText: "Exceptional work! Sofa bilkul naya jaisa dikh raha hai. Chemicals bhi safe the, no smell. Certified professional team — 10/10.",
    vendorReply: "Priya ji aapka bohot shukriya! Itna detailed feedback dene ke liye thanks.",
    helpful: 18, tags: ["Exceptional", "Safe Products", "Professional"],
    repeatCustomer: true,
  },
  {
    id: "R008", bookingId: "BK-2501-0044",
    service: "AC Gas Refill", category: "AC Service", categoryIcon: "❄️",
    customer: { name: "Deepak Shah", verified: true, totalBookings: 15, city: "Delhi" },
    rating: 4, date: "12 Feb 2026", status: "published",
    reviewText: "Gas refill plus minor issues bhi fix kiye. Paise thode zyada lage but quality work tha.",
    vendorReply: null,
    helpful: 4, tags: ["Quality Work", "Thorough"],
    repeatCustomer: false,
  },
  {
    id: "R009", bookingId: "BK-2501-0021",
    service: "Pest Control — Full Home", category: "Pest Control", categoryIcon: "🪲",
    customer: { name: "Kavita Joshi", verified: true, totalBookings: 9, city: "Delhi" },
    rating: 5, date: "10 Feb 2026", status: "published",
    reviewText: "3BHK ka full treatment bahut accha kiya. Results agle din se dikhne lage. Will book again!",
    vendorReply: "Kavita ji bahut dhanyavaad! Guarantee period mein koi bhi issue ho toh free re-treatment milega.",
    helpful: 9, tags: ["Effective", "Great Value"],
    repeatCustomer: true,
  },
  {
    id: "R010", bookingId: "BK-2501-0008",
    service: "Wall Painting — 2 Rooms", category: "Painting", categoryIcon: "🎨",
    customer: { name: "Arvind Tiwari", verified: false, totalBookings: 4, city: "Delhi" },
    rating: 4, date: "6 Feb 2026", status: "pending",
    reviewText: "2 din mein kaam poora kiya. 2 coats laga ke finish tha. Wall smooth hai. Thoda putty work aur better ho sakta tha.",
    vendorReply: null,
    helpful: 2, tags: ["Timely", "Good Finish"],
    repeatCustomer: false,
  },
];

// ─── Star Display ─────────────────────────────────────────────────────────────
function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          className={n <= Math.round(value) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"} />
      ))}
    </div>
  );
}

// ─── Rating Trend Icon ────────────────────────────────────────────────────────
function Trend({ value }: { value: number }) {
  if (value > 0)  return <span className="flex items-center gap-0.5 text-xs text-green-600 font-bold"><ArrowUp size={11} />+{value}%</span>;
  if (value < 0)  return <span className="flex items-center gap-0.5 text-xs text-red-500 font-bold"><ArrowDown size={11} />{value}%</span>;
  return               <span className="flex items-center gap-0.5 text-xs text-slate-400 font-bold"><Minus size={11} />0%</span>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ReviewStatus }) {
  const map = {
    published: { label: "Published", cls: "bg-green-100 text-green-700" },
    pending:   { label: "Under Review", cls: "bg-amber-100 text-amber-700" },
    flagged:   { label: "Flagged", cls: "bg-red-100 text-red-600" },
  };
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${map[status].cls}`}>{map[status].label}</span>;
}

// ─── Reply Modal ──────────────────────────────────────────────────────────────
function ReplyModal({
  review, onClose, onSave,
}: {
  review: Review; onClose: () => void; onSave: (id: string, reply: string) => void;
}) {
  const [text, setText] = useState(review.vendorReply ?? "");
  const [saved, setSaved] = useState(false);

  const TEMPLATES = [
    "Dhanyavaad! Aapka feedback hamare liye bahut important hai.",
    "Thank you ji! Aage bhi sewa karne ka mauka dena.",
    "Aapka trust hamare liye sabse bada reward hai. Shukriya!",
    "Sorry agar koi inconvenience hua. Hum improvement par kaam kar rahe hain.",
    "Bahut shukriya! Aap jaisi customers hame better karne ki motivation deti hain.",
  ];

  function handleSave() {
    if (!text.trim()) return;
    onSave(review.id, text.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-slate-800 to-slate-950 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Replying to</p>
              <h2 className="text-lg font-black text-white">{review.customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Stars value={review.rating} size={12} />
                <span className="text-slate-400 text-xs">· {review.date}</span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Customer review */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic leading-relaxed">
            "{review.reviewText}"
          </div>

          {/* Template suggestions */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Quick Templates</p>
            <div className="flex flex-col gap-1.5">
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => setText(t)}
                  className="text-left text-xs p-2.5 rounded-xl border border-slate-200 text-slate-600
                             hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">
              Aapka Reply
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Customer ko personally reply karo..."
              rows={4}
              className="w-full text-sm p-3.5 border-2 border-slate-200 rounded-xl resize-none
                         focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">{text.length} characters — Customers ye reply publicly dekh sakte hain</p>
          </div>

          {saved ? (
            <div className="w-full py-3 rounded-xl bg-green-100 text-green-700 font-bold text-sm text-center flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> Reply Published!
            </div>
          ) : (
            <button onClick={handleSave} disabled={!text.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                         font-bold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Send size={15} /> {review.vendorReply ? "Update Reply" : "Publish Reply"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({
  review, onReply,
}: {
  review: Review; onReply: (r: Review) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.reviewText.length > 120;

  const borderMap = {
    published: review.rating >= 4 ? "border-green-200" : review.rating === 3 ? "border-slate-200" : "border-red-100",
    pending:   "border-amber-200",
    flagged:   "border-red-300",
  };

  return (
    <div className={`bg-white rounded-2xl border-2 ${borderMap[review.status]} overflow-hidden hover:shadow-md transition-all duration-200`}>
      <div className={`h-1 ${
        review.rating >= 5 ? "bg-gradient-to-r from-yellow-400 to-emerald-400" :
        review.rating >= 4 ? "bg-emerald-300" :
        review.rating >= 3 ? "bg-slate-200" : "bg-red-300"
      }`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-sm flex-shrink-0">
              {review.customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold text-slate-800">{review.customer.name}</p>
                {review.customer.verified && <BadgeCheck size={12} className="text-blue-500" />}
                {review.repeatCustomer && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold flex items-center gap-0.5">
                    <RotateCcw size={8} /> Repeat
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{review.customer.city} · {review.customer.totalBookings} bookings</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <StatusBadge status={review.status} />
            <p className="text-xs text-slate-400">{review.date}</p>
          </div>
        </div>

        {/* Rating + service */}
        <div className="flex items-center justify-between mb-3">
          <Stars value={review.rating} />
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <span className="text-base">{review.categoryIcon}</span>
            {review.service}
          </span>
        </div>

        {/* Review text */}
        <div className="mb-3">
          <p className={`text-sm text-slate-600 leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}>
            "{review.reviewText}"
          </p>
          {isLong && (
            <button onClick={() => setExpanded(e => !e)}
              className="text-xs text-emerald-600 font-bold mt-1 hover:text-emerald-700">
              {expanded ? "Less" : "Read more"}
            </button>
          )}
        </div>

        {/* Tags */}
        {review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {review.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{tag}</span>
            ))}
          </div>
        )}

        {/* Helpful */}
        {review.helpful > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <ThumbsUp size={11} />
            <span>{review.helpful} people found this helpful</span>
          </div>
        )}

        {/* Vendor reply */}
        {review.vendorReply && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-3">
            <p className="text-xs font-black text-emerald-700 mb-1 flex items-center gap-1">
              <Shield size={10} /> Aapka Reply:
            </p>
            <p className="text-xs text-emerald-800 leading-relaxed">{review.vendorReply}</p>
          </div>
        )}

        {/* Reply button */}
        {review.status !== "flagged" && (
          <button onClick={() => onReply(review)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all
              ${review.vendorReply
                ? "border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
                : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"}`}>
            {review.vendorReply
              ? <><Edit3 size={12} /> Edit Reply</>
              : <><MessageSquare size={12} /> Reply to Review</>}
          </button>
        )}

        {review.status === "flagged" && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
            <AlertCircle size={12} className="flex-shrink-0" />
            Ye review dispute mein hai. ADDies team review kar rahi hai.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorReviewsPage() {
  const [reviews,     setReviews]     = useState<Review[]>(MOCK_REVIEWS);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [search,      setSearch]      = useState("");
  const [ratingFilter,setRatingFilter]= useState<"all" | 5 | 4 | 3 | 2 | 1>("all");
  const [statusFilter,setStatusFilter]= useState<"all" | ReviewStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy,      setSortBy]      = useState<"date" | "rating" | "helpful">("date");

  // Stats
  const published    = reviews.filter(r => r.status === "published");
  const avgRating    = published.length
    ? (published.reduce((s, r) => s + r.rating, 0) / published.length)
    : 0;
  const fiveStars    = reviews.filter(r => r.rating === 5).length;
  const fourStars    = reviews.filter(r => r.rating === 4).length;
  const threeStars   = reviews.filter(r => r.rating === 3).length;
  const twoOrLess    = reviews.filter(r => r.rating <= 2).length;
  const noReply      = reviews.filter(r => !r.vendorReply && r.status === "published").length;
  const flagged      = reviews.filter(r => r.status === "flagged").length;

  // Rating distribution %
  function pct(count: number) { return reviews.length ? Math.round((count / reviews.length) * 100) : 0; }

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (ratingFilter !== "all")  list = list.filter(r => r.rating === ratingFilter);
    if (statusFilter !== "all")  list = list.filter(r => r.status === statusFilter);
    if (search)                  list = list.filter(r =>
      r.reviewText.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      r.service.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === "rating")     list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "helpful")    list.sort((a, b) => b.helpful - a.helpful);
    // date: default (mock already newest first)
    return list;
  }, [reviews, ratingFilter, statusFilter, search, sortBy]);

  function handleSaveReply(id: string, reply: string) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, vendorReply: reply } : r));
  }

  return (
    <div className="space-y-6">

      {/* ── Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Star size={22} className="text-yellow-500 fill-yellow-400" /> Reviews & Ratings
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Customer feedback manage karo — reply do, rating track karo, performance dekho
        </p>
      </div>

      {/* ── Alert — unanswered reviews */}
      {noReply > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300">
          <MessageSquare size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-amber-800 text-sm">{noReply} review{noReply > 1 ? "s" : ""} ka reply baaki hai</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Replied reviews se customer trust badhta hai aur platform par ranking improve hoti hai.
            </p>
          </div>
        </div>
      )}

      {flagged > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-300">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-red-700 text-sm">{flagged} review{flagged > 1 ? "s" : ""} dispute mein hai</p>
            <p className="text-xs text-red-500 mt-0.5">ADDies team review kar rahi hai. 48 ghante mein update milega.</p>
          </div>
        </div>
      )}

      {/* ── Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Overall Rating",
            value: avgRating.toFixed(1),
            sub:   `${published.length} verified reviews`,
            icon:  Star, c: "text-yellow-600", bg: "bg-yellow-50", b: "border-yellow-200",
            extra: <Stars value={avgRating} size={14} />,
          },
          {
            label: "5-Star Reviews",
            value: String(fiveStars),
            sub:   `${pct(fiveStars)}% of total`,
            icon:  Award, c: "text-green-600", bg: "bg-green-50", b: "border-green-200",
            extra: <Trend value={12} />,
          },
          {
            label: "Replies Done",
            value: `${reviews.filter(r => r.vendorReply).length}/${reviews.length}`,
            sub:   `${noReply} pending`,
            icon:  MessageSquare, c: "text-blue-600", bg: "bg-blue-50", b: "border-blue-200",
            extra: null,
          },
          {
            label: "Helpful Votes",
            value: String(reviews.reduce((s, r) => s + r.helpful, 0)),
            sub:   "Total helpful votes",
            icon:  ThumbsUp, c: "text-violet-600", bg: "bg-violet-50", b: "border-violet-200",
            extra: <Trend value={8} />,
          },
        ].map(({ label, value, sub, icon: Icon, c, bg, b, extra }) => (
          <div key={label} className={`rounded-2xl border-2 ${b} ${bg} p-4`}>
            <Icon size={16} className={`${c} mb-2`} />
            <p className={`text-2xl font-black ${c}`}>{value}</p>
            {extra && <div className="mt-1">{extra}</div>}
            <p className="text-xs font-bold text-slate-600 mt-1">{label}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Rating Distribution */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-amber-400" />
          <h3 className="font-black text-sm">Rating Distribution</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Big rating display */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-6xl font-black text-yellow-400">{avgRating.toFixed(1)}</p>
              <Stars value={avgRating} size={18} />
              <p className="text-xs text-slate-400 mt-1">{published.length} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: "5 ★", count: fiveStars,   color: "bg-green-400" },
                { label: "4 ★", count: fourStars,   color: "bg-emerald-400" },
                { label: "3 ★", count: threeStars,  color: "bg-yellow-400" },
                { label: "≤2 ★", count: twoOrLess, color: "bg-red-400" },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-8 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: `${pct(count)}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wide mb-3">Ranking Tips</p>
            {[
              { icon: MessageSquare, tip: "Har review ka reply do — ranking +15% hota hai" },
              { icon: TrendingUp,    tip: "4+ star reviews zyada leads lata hai" },
              { icon: Shield,        tip: "Flagged reviews ke liye support se baat karo" },
              { icon: CheckCircle2,  tip: "Repeat customers se rating zyada reliable hoti hai" },
            ].map(({ icon: Icon, tip }) => (
              <div key={tip} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Icon size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search review, customer, service…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(["date", "rating", "helpful"] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize whitespace-nowrap
                    ${sortBy === s ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                ${showFilters ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
              <Filter size={12} /> Filters
              {showFilters ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Rating</p>
              <div className="flex gap-1.5 flex-wrap">
                {(["all", 5, 4, 3, 2, 1] as const).map(r => (
                  <button key={r} onClick={() => setRatingFilter(r)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                      ${ratingFilter === r
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                    {r === "all" ? "All" : <><Star size={10} className="fill-yellow-400 text-yellow-400" /> {r} Star</>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Status</p>
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "published", "pending", "flagged"] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all
                      ${statusFilter === s
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-semibold">
          {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          {(search || ratingFilter !== "all" || statusFilter !== "all") ? " filtered" : " total"}
        </p>
        {(search || ratingFilter !== "all" || statusFilter !== "all") && (
          <button onClick={() => { setSearch(""); setRatingFilter("all"); setStatusFilter("all"); }}
            className="text-xs text-emerald-600 font-bold hover:text-emerald-700">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Review Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold text-slate-700 text-lg">Koi review nahi mili</p>
          <p className="text-sm text-slate-400 mt-1">Filter change karo ya search clear karo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map(review => (
            <ReviewCard key={review.id} review={review} onReply={setReplyTarget} />
          ))}
        </div>
      )}

      {/* ── Reply Modal */}
      {replyTarget && (
        <ReplyModal
          review={reviews.find(r => r.id === replyTarget.id) ?? replyTarget}
          onClose={() => setReplyTarget(null)}
          onSave={handleSaveReply}
        />
      )}
    </div>
  );
}
