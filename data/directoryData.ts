// src/data/directoryData.ts

export type DirectorySubscriptionTier = "free" | "silver" | "gold" | "platinum";

export interface DirectoryVendor {
  id:           string;
  slug:         string;
  businessName: string;
  ownerName:    string;
  avatar:       string;
  category:     string;
  categorySlug: string;
  subServices:  string[];
  city:         string;
  citySlug:     string;
  area:         string;
  pincode:      string;
  tier:         DirectorySubscriptionTier;
  rating:       number;
  totalReviews: number;
  totalJobs:    number;
  yearsExp:     number;
  startingPrice: number;
  responseTime: string;
  isVerified:   boolean;
  isAvailable:  boolean;
  isFeatured:   boolean;
  tags:         string[];
  about:        string;
  portfolio:    string[];
  reviews: {
    customerName: string;
    rating:       number;
    comment:      string;
    date:         string;
    service:      string;
  }[];
}

export const DIRECTORY_CATEGORIES = [
  { slug: "plumbing",        name: "Plumbing",          icon: "🔧" },
  { slug: "electrical",      name: "Electrical",         icon: "⚡" },
  { slug: "ac-service",      name: "AC Service",         icon: "❄️" },
  { slug: "home-cleaning",   name: "Home Cleaning",      icon: "🧹" },
  { slug: "painting",        name: "Painting",           icon: "🎨" },
  { slug: "carpentry",       name: "Carpentry",          icon: "🪚" },
  { slug: "pest-control",    name: "Pest Control",       icon: "🐛" },
  { slug: "appliance-repair",name: "Appliance Repair",   icon: "📺" },
  { slug: "beauty-salon",    name: "Beauty & Salon",     icon: "💇" },
  { slug: "fitness",         name: "Fitness & Yoga",     icon: "🏋️" },
  { slug: "tutoring",        name: "Home Tutoring",      icon: "📚" },
  { slug: "security",        name: "CCTV & Security",    icon: "📷" },
];

export const DIRECTORY_CITIES = [
  { slug: "lucknow",   name: "Lucknow"   },
  { slug: "delhi",     name: "Delhi"     },
  { slug: "mumbai",    name: "Mumbai"    },
  { slug: "bangalore", name: "Bangalore" },
  { slug: "hyderabad", name: "Hyderabad" },
  { slug: "pune",      name: "Pune"      },
];

export const DIRECTORY_VENDORS: DirectoryVendor[] = [
  {
    id: "DV001", slug: "atoz-plumbing-works",
    businessName: "AtoZ Plumbing Works",
    ownerName: "Ramesh Kumar",
    avatar: "R",
    category: "Plumbing", categorySlug: "plumbing",
    subServices: ["Pipe Leak Fix", "Tap Installation", "Drainage Cleaning", "Geyser Fitting"],
    city: "Lucknow", citySlug: "lucknow", area: "near Friend medical Store, Dindayal Puram, Mayawati Colony, Indira Nagar, Uttar Pradesh", pincode: "226016",
    tier: "platinum",
    rating: 4.9, totalReviews: 312, totalJobs: 890,
    yearsExp: 8, startingPrice: 299, responseTime: "15 min",
    isVerified: true, isAvailable: true, isFeatured: true,
    tags: ["Emergency", "Same Day", "Guaranteed Work"],
    about: "8 saal ka experience hai plumbing mein. Delhi se Lucknow shift hoke kaam shuru kiya. Har kaam pe 30 din ki warranty deta hoon.",
    portfolio: [],
    reviews: [
      { customerName: "Priya S.", rating: 5, comment: "Bahut badhiya kaam kiya, pipe leak 30 min mein fix ho gayi.", date: "28 Feb 2026", service: "Pipe Leak Fix" },
      { customerName: "Amit K.", rating: 5, comment: "Very professional, sahi time pe aaye aur kaam bhi clean.", date: "20 Feb 2026", service: "Tap Installation" },
      { customerName: "Meena R.", rating: 4, comment: "Accha kaam hai, thoda expensive tha but worth it.", date: "10 Feb 2026", service: "Drainage Cleaning" },
    ],
  },
  {
    id: "DV002", slug: "priya-electricals",
    businessName: "Priya Electricals",
    ownerName: "Priya Sharma",
    avatar: "P",
    category: "Electrical", categorySlug: "electrical",
    subServices: ["Wiring", "Switch Board", "Fan Installation", "MCB/Fuse"],
    city: "Lucknow", citySlug: "lucknow", area: "Gomti Nagar", pincode: "226010",
    tier: "gold",
    rating: 4.7, totalReviews: 198, totalJobs: 540,
    yearsExp: 5, startingPrice: 199, responseTime: "30 min",
    isVerified: true, isAvailable: true, isFeatured: true,
    tags: ["Female Technician", "Emergency", "ISI Certified"],
    about: "Certified electrician hoon, ITI aur 5 saal ka field experience. Ghar ke electrical kaam ke liye 100% safe aur reliable.",
    portfolio: [],
    reviews: [
      { customerName: "Sunita P.", rating: 5, comment: "Female technician thi, bahut comfortable feel hua. Kaam bhi perfect.", date: "25 Feb 2026", service: "Wiring" },
      { customerName: "Ravi K.", rating: 4, comment: "On time, professional work.", date: "15 Feb 2026", service: "Switch Board" },
    ],
  },
  {
    id: "DV003", slug: "suresh-ac-services",
    businessName: "Suresh AC Services",
    ownerName: "Suresh Yadav",
    avatar: "S",
    category: "AC Service", categorySlug: "ac-service",
    subServices: ["AC Service", "Gas Refill", "AC Installation", "AC Repair"],
    city: "Lucknow", citySlug: "lucknow", area: "Aliganj", pincode: "226024",
    tier: "gold",
    rating: 4.6, totalReviews: 267, totalJobs: 720,
    yearsExp: 10, startingPrice: 499, responseTime: "45 min",
    isVerified: true, isAvailable: true, isFeatured: false,
    tags: ["All Brands", "Same Day", "Gas Refill Expert"],
    about: "10 saal se AC service mein hoon. Samsung, LG, Voltas, Daikin — sab brands handle karta hoon.",
    portfolio: [],
    reviews: [
      { customerName: "Deepak M.", rating: 5, comment: "AC bilkul theek ho gaya, gas refill bhi kiya. Sahi price.", date: "1 Mar 2026", service: "Gas Refill" },
      { customerName: "Kavita S.", rating: 4, comment: "Good service, time pe aaye.", date: "18 Feb 2026", service: "AC Service" },
    ],
  },
  {
    id: "DV004", slug: "clean-home-services",
    businessName: "Clean Home Services",
    ownerName: "Meena Devi",
    avatar: "M",
    category: "Home Cleaning", categorySlug: "home-cleaning",
    subServices: ["Full Home Cleaning", "Kitchen Deep Clean", "Bathroom Cleaning", "Sofa Cleaning"],
    city: "Lucknow", citySlug: "lucknow", area: "Indira Nagar", pincode: "226016",
    tier: "silver",
    rating: 4.4, totalReviews: 143, totalJobs: 380,
    yearsExp: 3, startingPrice: 399, responseTime: "2 hr",
    isVerified: true, isAvailable: true, isFeatured: false,
    tags: ["Eco Friendly", "Team of 3", "Weekend Available"],
    about: "3 trained staff ke saath kaam karta hoon. Eco-friendly products use karte hain, ghar mein koi chemical smell nahi rehta.",
    portfolio: [],
    reviews: [
      { customerName: "Anjali T.", rating: 5, comment: "Ghar bilkul chamak gaya! Bahut badhiya team.", date: "22 Feb 2026", service: "Full Home Cleaning" },
      { customerName: "Rohit S.", rating: 4, comment: "Kitchen deep clean bahut acchi thi.", date: "8 Feb 2026", service: "Kitchen Deep Clean" },
    ],
  },
  {
    id: "DV005", slug: "delhi-painters",
    businessName: "Delhi Painters Co.",
    ownerName: "Ahmed Khan",
    avatar: "A",
    category: "Painting", categorySlug: "painting",
    subServices: ["Interior Painting", "Exterior Painting", "Texture Work", "Waterproofing"],
    city: "Delhi", citySlug: "delhi", area: "Lajpat Nagar", pincode: "110024",
    tier: "platinum",
    rating: 4.8, totalReviews: 421, totalJobs: 1100,
    yearsExp: 12, startingPrice: 8, responseTime: "Same Day",
    isVerified: true, isAvailable: true, isFeatured: true,
    tags: ["Asian Paints Partner", "Free Estimate", "Texture Expert"],
    about: "12 saal se painting mein hoon. Asian Paints certified contractor hoon. Per sq ft rate pe kaam karta hoon.",
    portfolio: [],
    reviews: [
      { customerName: "Vijay L.", rating: 5, comment: "Pura 3BHK paint ho gaya 4 din mein. Bahut clean finish.", date: "27 Feb 2026", service: "Interior Painting" },
      { customerName: "Rekha S.", rating: 5, comment: "Texture work amazing tha, sab log taarif karte hain.", date: "14 Feb 2026", service: "Texture Work" },
    ],
  },
  {
    id: "DV006", slug: "raj-carpentry",
    businessName: "Raj Carpentry Works",
    ownerName: "Raj Singh",
    avatar: "R",
    category: "Carpentry", categorySlug: "carpentry",
    subServices: ["Furniture Repair", "Door/Window Fix", "Modular Furniture", "Custom Work"],
    city: "Mumbai", citySlug: "mumbai", area: "Andheri", pincode: "400058",
    tier: "silver",
    rating: 4.3, totalReviews: 89, totalJobs: 210,
    yearsExp: 6, startingPrice: 350, responseTime: "1 hr",
    isVerified: true, isAvailable: false, isFeatured: false,
    tags: ["Custom Furniture", "Weekend Available"],
    about: "Furniture design aur repair dono karta hoon. Custom modular furniture bhi banata hoon.",
    portfolio: [],
    reviews: [
      { customerName: "Pooja M.", rating: 4, comment: "Furniture repair acchi thi, time pe aaye.", date: "20 Feb 2026", service: "Furniture Repair" },
    ],
  },
  {
    id: "DV007", slug: "quick-pest-control",
    businessName: "Quick Pest Control",
    ownerName: "Vinod Gupta",
    avatar: "V",
    category: "Pest Control", categorySlug: "pest-control",
    subServices: ["Cockroach Treatment", "Termite Control", "Bed Bug Treatment", "Rat Control"],
    city: "Lucknow", citySlug: "lucknow", area: "Rajajipuram", pincode: "226017",
    tier: "free",
    rating: 4.1, totalReviews: 56, totalJobs: 130,
    yearsExp: 2, startingPrice: 599, responseTime: "Same Day",
    isVerified: false, isAvailable: true, isFeatured: false,
    tags: ["Govt Approved Chemicals", "1 Year Warranty (Termite)"],
    about: "Government approved chemicals use karta hoon. Termite treatment pe 1 saal ki warranty deta hoon.",
    portfolio: [],
    reviews: [
      { customerName: "Shyam L.", rating: 4, comment: "Cockroach problem solve ho gayi.", date: "5 Feb 2026", service: "Cockroach Treatment" },
    ],
  },
];

// Tier priority for sorting (higher = shown first)
export const TIER_PRIORITY: Record<DirectorySubscriptionTier, number> = {
  platinum: 4,
  gold:     3,
  silver:   2,
  free:     1,
};

export const TIER_LABELS: Record<DirectorySubscriptionTier, { label: string; color: string; bg: string; border: string }> = {
  platinum: { label: "Platinum",  color: "text-violet-700", bg: "bg-violet-100", border: "border-violet-300" },
  gold:     { label: "Gold",      color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-300" },
  silver:   { label: "Silver",    color: "text-slate-600",  bg: "bg-slate-100",  border: "border-slate-300"  },
  free:     { label: "Basic",     color: "text-slate-400",  bg: "bg-slate-50",   border: "border-slate-200"  },
};
