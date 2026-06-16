// src/pages/admin/dashboard/mockAdminData.ts
// Replace with real API calls when backend is ready

export type Period = "day" | "week" | "month" | "year";

// ─── Platform Stats ───────────────────────────────────────────────────────────

export interface PlatformStat {
  totalRevenue:       number;
  platformFee:        number;
  totalBookings:      number;
  completedBookings:  number;
  cancelledBookings:  number;
  activeCustomers:    number;
  totalCustomers:     number;
  activeVendors:      number;
  totalVendors:       number;
  totalAgents:        number;
  activeCities:       number;
  pendingPayouts:     number;
  openDisputes:       number;
  newRegistrations:   number;
  avgOrderValue:      number;
  platformGrowth:     number; // % vs previous period
}

const PLATFORM_STATS: Record<Period, PlatformStat> = {
  day: {
    totalRevenue: 182000,      platformFee: 36400,
    totalBookings: 148,        completedBookings: 121,   cancelledBookings: 14,
    activeCustomers: 94,       totalCustomers: 12480,
    activeVendors: 187,        totalVendors: 312,
    totalAgents: 8,            activeCities: 6,
    pendingPayouts: 14200,     openDisputes: 7,
    newRegistrations: 23,      avgOrderValue: 1230,      platformGrowth: 12.4,
  },
  week: {
    totalRevenue: 1240000,     platformFee: 248000,
    totalBookings: 1024,       completedBookings: 892,   cancelledBookings: 87,
    activeCustomers: 634,      totalCustomers: 12480,
    activeVendors: 248,        totalVendors: 312,
    totalAgents: 8,            activeCities: 6,
    pendingPayouts: 98400,     openDisputes: 7,
    newRegistrations: 142,     avgOrderValue: 1210,      platformGrowth: 18.7,
  },
  month: {
    totalRevenue: 5480000,     platformFee: 1096000,
    totalBookings: 4312,       completedBookings: 3841,  cancelledBookings: 312,
    activeCustomers: 2840,     totalCustomers: 12480,
    activeVendors: 287,        totalVendors: 312,
    totalAgents: 8,            activeCities: 6,
    pendingPayouts: 312000,    openDisputes: 7,
    newRegistrations: 584,     avgOrderValue: 1271,      platformGrowth: 24.2,
  },
  year: {
    totalRevenue: 58400000,    platformFee: 11680000,
    totalBookings: 48200,      completedBookings: 42800, cancelledBookings: 3100,
    activeCustomers: 11240,    totalCustomers: 12480,
    activeVendors: 312,        totalVendors: 312,
    totalAgents: 8,            activeCities: 6,
    pendingPayouts: 1840000,   openDisputes: 7,
    newRegistrations: 12480,   avgOrderValue: 1211,      platformGrowth: 67.8,
  },
};

export function getPlatformStats(period: Period): PlatformStat {
  return PLATFORM_STATS[period];
}

// ─── Revenue Chart Data ────────────────────────────────────────────────────────

export interface ChartPoint {
  label:       string;
  revenue:     number;
  platformFee: number;
  bookings:    number;
}

export const REVENUE_CHART: Record<Period, ChartPoint[]> = {
  day: [
    { label: "6 AM",  revenue: 8400,   platformFee: 1680,  bookings: 7  },
    { label: "9 AM",  revenue: 22000,  platformFee: 4400,  bookings: 18 },
    { label: "12 PM", revenue: 38000,  platformFee: 7600,  bookings: 31 },
    { label: "3 PM",  revenue: 52000,  platformFee: 10400, bookings: 42 },
    { label: "6 PM",  revenue: 41000,  platformFee: 8200,  bookings: 33 },
    { label: "9 PM",  revenue: 21000,  platformFee: 4200,  bookings: 17 },
  ],
  week: [
    { label: "Mon", revenue: 148000, platformFee: 29600, bookings: 122 },
    { label: "Tue", revenue: 162000, platformFee: 32400, bookings: 134 },
    { label: "Wed", revenue: 184000, platformFee: 36800, bookings: 152 },
    { label: "Thu", revenue: 198000, platformFee: 39600, bookings: 163 },
    { label: "Fri", revenue: 224000, platformFee: 44800, bookings: 184 },
    { label: "Sat", revenue: 196000, platformFee: 39200, bookings: 162 },
    { label: "Sun", revenue: 128000, platformFee: 25600, bookings: 107 },
  ],
  month: [
    { label: "Week 1", revenue: 1180000, platformFee: 236000, bookings: 928  },
    { label: "Week 2", revenue: 1340000, platformFee: 268000, bookings: 1054 },
    { label: "Week 3", revenue: 1480000, platformFee: 296000, bookings: 1164 },
    { label: "Week 4", revenue: 1480000, platformFee: 296000, bookings: 1166 },
  ],
  year: [
    { label: "Jan", revenue: 3200000,  platformFee: 640000,  bookings: 2640 },
    { label: "Feb", revenue: 3840000,  platformFee: 768000,  bookings: 3172 },
    { label: "Mar", revenue: 4200000,  platformFee: 840000,  bookings: 3468 },
    { label: "Apr", revenue: 4680000,  platformFee: 936000,  bookings: 3864 },
    { label: "May", revenue: 5120000,  platformFee: 1024000, bookings: 4228 },
    { label: "Jun", revenue: 5480000,  platformFee: 1096000, bookings: 4524 },
    { label: "Jul", revenue: 4980000,  platformFee: 996000,  bookings: 4112 },
    { label: "Aug", revenue: 5240000,  platformFee: 1048000, bookings: 4328 },
    { label: "Sep", revenue: 5680000,  platformFee: 1136000, bookings: 4692 },
    { label: "Oct", revenue: 5920000,  platformFee: 1184000, bookings: 4888 },
    { label: "Nov", revenue: 4840000,  platformFee: 968000,  bookings: 3996 },
    { label: "Dec", revenue: 6020000,  platformFee: 1204000, bookings: 4972 },
  ],
};

// ─── City Breakdown ───────────────────────────────────────────────────────────

export interface CityData {
  id:          string;
  name:        string;
  state:       string;
  district:    string;
  pincode:     string;
  active:      boolean;
  vendors:     number;
  customers:   number;
  bookings:    number;
  revenue:     number;
  agent:       string;
  growth:      number;
  topCategory: string;
}

export const CITY_DATA: CityData[] = [
  { id: "C001", name: "Ghaziabad", state: "Uttar Pradesh", district: "Ghaziabad",  pincode: "201001", active: true,  vendors: 87,  customers: 3240, bookings: 1284, revenue: 1640000, agent: "Priya Sharma",  growth: 24.2, topCategory: "AC Service"   },
  { id: "C002", name: "Delhi",     state: "Delhi",          district: "New Delhi",  pincode: "110001", active: true,  vendors: 124, customers: 4180, bookings: 1682, revenue: 2180000, agent: "Rohit Verma",   growth: 18.7, topCategory: "Cleaning"     },
  { id: "C003", name: "Noida",     state: "Uttar Pradesh", district: "Gautam Buddha Nagar", pincode: "201301", active: true,  vendors: 64,  customers: 2140, bookings: 841,  revenue: 1020000, agent: "Sunita Rao",    growth: 31.4, topCategory: "Plumbing"     },
  { id: "C004", name: "Lucknow",   state: "Uttar Pradesh", district: "Lucknow",    pincode: "226001", active: true,  vendors: 48,  customers: 1820, bookings: 628,  revenue: 780000,  agent: "Amit Tiwari",   growth: 42.1, topCategory: "Pest Control" },
  { id: "C005", name: "Kanpur",    state: "Uttar Pradesh", district: "Kanpur Nagar",pincode: "208001", active: true,  vendors: 32,  customers: 980,  bookings: 412,  revenue: 480000,  agent: "Deepak Mishra", growth: 56.8, topCategory: "Electrical"   },
  { id: "C006", name: "Varanasi",  state: "Uttar Pradesh", district: "Varanasi",   pincode: "221001", active: false, vendors: 18,  customers: 120,  bookings: 48,   revenue: 52000,   agent: "Unassigned",    growth: 0,    topCategory: "—"            },
];

// ─── Category Performance ─────────────────────────────────────────────────────

export interface CategoryPerf {
  id:       string;
  name:     string;
  icon:     string;
  active:   boolean;
  vendors:  number;
  bookings: number;
  revenue:  number;
  avgPrice: number;
  growth:   number;
}

export const CATEGORY_PERF: CategoryPerf[] = [
  { id: "CAT001", name: "AC Service",     icon: "❄️",  active: true,  vendors: 68,  bookings: 892,  revenue: 1240000, avgPrice: 1390, growth: 28.4 },
  { id: "CAT002", name: "Cleaning",       icon: "🧹",  active: true,  vendors: 92,  bookings: 1124, revenue: 980000,  avgPrice: 872,  growth: 22.1 },
  { id: "CAT003", name: "Plumbing",       icon: "🔧",  active: true,  vendors: 84,  bookings: 986,  revenue: 740000,  avgPrice: 751,  growth: 18.7 },
  { id: "CAT004", name: "Electrical",     icon: "⚡",  active: true,  vendors: 76,  bookings: 842,  revenue: 620000,  avgPrice: 736,  growth: 15.2 },
  { id: "CAT005", name: "Pest Control",   icon: "🐛",  active: true,  vendors: 48,  bookings: 624,  revenue: 840000,  avgPrice: 1346, growth: 34.8 },
  { id: "CAT006", name: "Painting",       icon: "🎨",  active: true,  vendors: 36,  bookings: 312,  revenue: 1480000, avgPrice: 4744, growth: 12.4 },
  { id: "CAT007", name: "Carpentry",      icon: "🪚",  active: true,  vendors: 28,  bookings: 248,  revenue: 320000,  avgPrice: 1290, growth: 8.9  },
  { id: "CAT008", name: "Appliance Repair",icon: "🔌", active: true,  vendors: 42,  bookings: 486,  revenue: 380000,  avgPrice: 782,  growth: 19.3 },
  { id: "CAT009", name: "Salon (Men)",    icon: "💈",  active: false, vendors: 12,  bookings: 84,   revenue: 62000,   avgPrice: 738,  growth: 0    },
  { id: "CAT010", name: "Salon (Women)",  icon: "💅",  active: false, vendors: 8,   bookings: 42,   revenue: 48000,   avgPrice: 1143, growth: 0    },
];

// ─── Top Vendors (Platform-wide) ─────────────────────────────────────────────

export interface TopVendor {
  id:       string;
  name:     string;
  city:     string;
  category: string;
  jobs:     number;
  revenue:  number;
  rating:   number;
  status:   "active" | "suspended" | "inactive";
}

export const TOP_VENDORS: TopVendor[] = [
  { id: "V001", name: "CleanPro Services",      city: "Delhi",     category: "Cleaning",    jobs: 421, revenue: 524000, rating: 4.8, status: "active"    },
  { id: "V002", name: "CoolBreeze AC",          city: "Ghaziabad", category: "AC Service",  jobs: 312, revenue: 498000, rating: 4.5, status: "active"    },
  { id: "V003", name: "Kumar Home Services",    city: "Ghaziabad", category: "Plumbing",    jobs: 298, revenue: 412000, rating: 4.7, status: "active"    },
  { id: "V004", name: "ColorCraft Painters",    city: "Noida",     category: "Painting",    jobs: 184, revenue: 948000, rating: 4.6, status: "active"    },
  { id: "V005", name: "PestGuard Pro",          city: "Lucknow",   category: "Pest Control",jobs: 167, revenue: 284000, rating: 4.4, status: "active"    },
  { id: "V006", name: "SparkFix Electrical",    city: "Ghaziabad", category: "Electrical",  jobs: 145, revenue: 198000, rating: 4.3, status: "active"    },
  { id: "V007", name: "QuickFix Services",      city: "Kanpur",    category: "Appliance",   jobs: 87,  revenue: 84000,  rating: 3.1, status: "suspended" },
];

// ─── Admin Activity Feed ──────────────────────────────────────────────────────

export interface AdminActivity {
  id:      string;
  type:    "vendor_approved" | "dispute_resolved" | "payout_released" | "city_added"
         | "category_updated" | "vendor_suspended" | "agent_assigned" | "plan_updated"
         | "refund_issued" | "new_city_request";
  icon:    string;
  title:   string;
  subtitle:string;
  time:    string;
  amount?: number;
  by:      string;
}

export const ADMIN_ACTIVITY: AdminActivity[] = [
  { id: "A001", type: "payout_released",  icon: "💸", title: "Batch Payout Released",      subtitle: "42 vendors — Ghaziabad weekly settlement",           time: "30 min ago",      amount: 184000, by: "Auto" },
  { id: "A002", type: "dispute_resolved", icon: "⚖️", title: "Dispute Resolved",            subtitle: "BK-2602-0035 — TV damage case, ₹45,000 refund approved",time: "1 hour ago",     amount: 45000,  by: "Admin" },
  { id: "A003", type: "vendor_approved",  icon: "✅", title: "Vendor Batch Approved",       subtitle: "3 vendors KYC approved — Delhi",                     time: "2 hours ago",     by: "Rohit (Agent)" },
  { id: "A004", type: "vendor_suspended", icon: "🚫", title: "Vendor Suspended",            subtitle: "QuickFix Services — 3 complaints unresolved",        time: "3 hours ago",     by: "Admin" },
  { id: "A005", type: "city_added",       icon: "🏙️", title: "New City Onboarded",          subtitle: "Agra, UP — Awaiting agent assignment",               time: "Yesterday, 5 PM", by: "Admin" },
  { id: "A006", type: "payout_released",  icon: "💸", title: "Agent Commission Credited",   subtitle: "8 agents — Monthly settlement",                      time: "Yesterday, 4 PM", amount: 38400,  by: "Auto" },
  { id: "A007", type: "category_updated", icon: "📂", title: "Category Activated",          subtitle: "Salon (Men) — Re-activated in Delhi & Noida",        time: "2 days ago",      by: "Admin" },
  { id: "A008", type: "plan_updated",     icon: "💎", title: "Subscription Plan Updated",   subtitle: "Premium plan — Price revised from ₹1499 to ₹1299",  time: "2 days ago",      by: "Admin" },
  { id: "A009", type: "refund_issued",    icon: "💰", title: "Refund Processed",            subtitle: "BK-2602-0019 — ₹800 refunded to Kavita Joshi",       time: "3 days ago",      amount: 800,    by: "Auto" },
  { id: "A010", type: "agent_assigned",   icon: "👤", title: "Agent Assigned",              subtitle: "Deepak Mishra → Kanpur city",                        time: "4 days ago",      by: "Admin" },
];

// ─── Platform Alerts ──────────────────────────────────────────────────────────

export interface AdminAlert {
  id:      string;
  type:    "payout" | "dispute" | "city" | "vendor" | "system" | "revenue";
  title:   string;
  subtitle:string;
  urgent:  boolean;
  action:  string;
  tab:     string; // which tab to navigate to
}

export const ADMIN_ALERTS: AdminAlert[] = [
  { id: "AL001", type: "payout",   urgent: true,  title: "₹3.12L Payout Pending",        subtitle: "312 vendor payouts due this week",             action: "Process",  tab: "payouts"    },
  { id: "AL002", type: "dispute",  urgent: true,  title: "4 Escalated Disputes",          subtitle: "Awaiting final admin verdict",                  action: "Resolve",  tab: "disputes"   },
  { id: "AL003", type: "city",     urgent: false, title: "Varanasi City Inactive",        subtitle: "No agent assigned — 18 vendors waiting",       action: "Assign",   tab: "cities"     },
  { id: "AL004", type: "vendor",   urgent: false, title: "12 KYC Approvals Pending",      subtitle: "Across 3 cities — review required",            action: "Review",   tab: "vendors"    },
  { id: "AL005", type: "revenue",  urgent: false, title: "Revenue Dip — Kanpur",          subtitle: "28% drop this week vs last week",              action: "Analyse",  tab: "analytics"  },
  { id: "AL006", type: "system",   urgent: false, title: "Salon Category Inactive",       subtitle: "Salon (Men) & (Women) disabled citywide",      action: "Activate", tab: "categories" },
];

// ─── Subscription Plans ───────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id:           string;
  name:         string;
  price:        number;
  billingCycle: "monthly" | "quarterly" | "yearly";
  active:       boolean;
  subscribers:  number;
  features:     string[];
  color:        string;
  popular:      boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "SP001", name: "Basic", price: 499, billingCycle: "monthly",
    active: true, subscribers: 48, popular: false, color: "blue",
    features: ["Up to 20 leads/month", "Basic listing", "Email support", "Standard response time"],
  },
  {
    id: "SP002", name: "Premium", price: 1299, billingCycle: "monthly",
    active: true, subscribers: 184, popular: true, color: "violet",
    features: ["Unlimited leads", "Priority listing", "Phone + Email support", "Badge on profile", "Performance analytics"],
  },
  {
    id: "SP003", name: "Enterprise", price: 2999, billingCycle: "monthly",
    active: true, subscribers: 32, popular: false, color: "amber",
    features: ["Unlimited leads", "Top listing (city)", "Dedicated account manager", "All analytics", "Early access to new cities", "Custom branding"],
  },
];

// ─── All Customers (for User Management) ─────────────────────────────────────

export interface CustomerRecord {
  id:           string;
  customerId:   string;
  name:         string;
  phone:        string;
  email:        string;
  city:         string;
  joinedDate:   string;
  totalBookings:number;
  totalSpend:   number;
  status:       "active" | "blocked";
  lastActive:   string;
  rating:       number;
}

export const MOCK_CUSTOMERS: CustomerRecord[] = [
  { id: "CU001", customerId: "CUS-0001", name: "Amit Sharma",   phone: "+91 98765 43210", email: "amit.sharma@gmail.com",   city: "Ghaziabad", joinedDate: "Jan 2025", totalBookings: 14, totalSpend: 18400, status: "active",  lastActive: "Today",        rating: 4.8 },
  { id: "CU002", customerId: "CUS-0002", name: "Pooja Mehta",   phone: "+91 87654 32109", email: "pooja.mehta@gmail.com",   city: "Delhi",     joinedDate: "Feb 2025", totalBookings: 8,  totalSpend: 9800,  status: "active",  lastActive: "Yesterday",    rating: 4.5 },
  { id: "CU003", customerId: "CUS-0003", name: "Rahul Sinha",   phone: "+91 76543 21098", email: "rahul.sinha@gmail.com",   city: "Noida",     joinedDate: "Mar 2025", totalBookings: 3,  totalSpend: 4200,  status: "active",  lastActive: "3 days ago",   rating: 4.0 },
  { id: "CU004", customerId: "CUS-0004", name: "Sunita Rao",    phone: "+91 65432 10987", email: "sunita.rao@gmail.com",    city: "Ghaziabad", joinedDate: "Dec 2024", totalBookings: 22, totalSpend: 31200, status: "active",  lastActive: "Today",        rating: 4.9 },
  { id: "CU005", customerId: "CUS-0005", name: "Kavita Joshi",  phone: "+91 54321 09876", email: "kavita.joshi@gmail.com",  city: "Lucknow",   joinedDate: "Apr 2025", totalBookings: 6,  totalSpend: 7400,  status: "active",  lastActive: "2 days ago",   rating: 4.6 },
  { id: "CU006", customerId: "CUS-0006", name: "Geeta Yadav",   phone: "+91 43210 98765", email: "geeta.yadav@gmail.com",   city: "Kanpur",    joinedDate: "May 2025", totalBookings: 2,  totalSpend: 1800,  status: "blocked", lastActive: "2 weeks ago",  rating: 3.2 },
  { id: "CU007", customerId: "CUS-0007", name: "Deepak Malhotra",phone: "+91 32109 87654",email: "deepak.m@gmail.com",      city: "Delhi",     joinedDate: "Jan 2025", totalBookings: 11, totalSpend: 14200, status: "active",  lastActive: "Today",        rating: 4.2 },
  { id: "CU008", customerId: "CUS-0008", name: "Ritu Agarwal",  phone: "+91 21098 76543", email: "ritu.ag@gmail.com",       city: "Noida",     joinedDate: "Mar 2025", totalBookings: 17, totalSpend: 24800, status: "active",  lastActive: "Yesterday",    rating: 4.7 },
];

// ─── All Agents ───────────────────────────────────────────────────────────────

export interface AgentRecord {
  id:            string;
  agentId:       string;
  name:          string;
  phone:         string;
  email:         string;
  city:          string;
  joinedDate:    string;
  vendors:       number;
  totalLeads:    number;
  disputesHandled: number;
  commission:    number;
  status:        "active" | "inactive";
  lastActive:    string;
  performance:   "excellent" | "good" | "average" | "poor";
}

export const MOCK_AGENTS: AgentRecord[] = [
  { id: "AG001", agentId: "AGT-001", name: "Priya Sharma",  phone: "+91 98001 11111", email: "priya.s@addies.in",  city: "Ghaziabad", joinedDate: "Dec 2024", vendors: 87,  totalLeads: 1284, disputesHandled: 34, commission: 51800, status: "active",   lastActive: "Today",      performance: "excellent" },
  { id: "AG002", agentId: "AGT-002", name: "Rohit Verma",   phone: "+91 98001 22222", email: "rohit.v@addies.in",  city: "Delhi",     joinedDate: "Dec 2024", vendors: 124, totalLeads: 1682, disputesHandled: 48, commission: 68400, status: "active",   lastActive: "Today",      performance: "excellent" },
  { id: "AG003", agentId: "AGT-003", name: "Sunita Rao",    phone: "+91 98001 33333", email: "sunita.r@addies.in", city: "Noida",     joinedDate: "Jan 2025", vendors: 64,  totalLeads: 841,  disputesHandled: 21, commission: 32400, status: "active",   lastActive: "Yesterday",  performance: "good"      },
  { id: "AG004", agentId: "AGT-004", name: "Amit Tiwari",   phone: "+91 98001 44444", email: "amit.t@addies.in",   city: "Lucknow",   joinedDate: "Feb 2025", vendors: 48,  totalLeads: 628,  disputesHandled: 17, commission: 24800, status: "active",   lastActive: "Today",      performance: "good"      },
  { id: "AG005", agentId: "AGT-005", name: "Deepak Mishra", phone: "+91 98001 55555", email: "deepak.m@addies.in", city: "Kanpur",    joinedDate: "Mar 2025", vendors: 32,  totalLeads: 412,  disputesHandled: 9,  commission: 14200, status: "active",   lastActive: "2 days ago", performance: "average"   },
  { id: "AG006", agentId: "AGT-006", name: "Meena Pandey",  phone: "+91 98001 66666", email: "meena.p@addies.in",  city: "Varanasi",  joinedDate: "Jun 2025", vendors: 0,   totalLeads: 0,    disputesHandled: 0,  commission: 0,     status: "inactive", lastActive: "Never",      performance: "poor"      },
];

// ─── Pending Payouts ──────────────────────────────────────────────────────────

export interface PendingPayout {
  id:          string;
  vendorId:    string;
  vendorName:  string;
  city:        string;
  category:    string;
  amount:      number;
  jobs:        number;
  period:      string;
  status:      "pending" | "approved" | "on_hold" | "released";
  upiId:       string;
  requestedAt: string;
}

export const PENDING_PAYOUTS: PendingPayout[] = [
  { id: "PP001", vendorId: "V001", vendorName: "CleanPro Services",    city: "Delhi",     category: "Cleaning",    amount: 42800, jobs: 84,  period: "Feb Week 4", status: "pending",  upiId: "cleanpro@upi",   requestedAt: "28 Feb 2026" },
  { id: "PP002", vendorId: "V002", vendorName: "CoolBreeze AC",        city: "Ghaziabad", category: "AC Service",  amount: 38400, jobs: 68,  period: "Feb Week 4", status: "pending",  upiId: "coolbreeze@upi", requestedAt: "28 Feb 2026" },
  { id: "PP003", vendorId: "V003", vendorName: "Kumar Home Services",  city: "Ghaziabad", category: "Plumbing",    amount: 34200, jobs: 72,  period: "Feb Week 4", status: "approved", upiId: "kumar.hs@upi",   requestedAt: "28 Feb 2026" },
  { id: "PP004", vendorId: "V004", vendorName: "ColorCraft Painters",  city: "Noida",     category: "Painting",    amount: 84000, jobs: 18,  period: "Feb Week 4", status: "pending",  upiId: "colorcraft@upi", requestedAt: "28 Feb 2026" },
  { id: "PP005", vendorId: "V005", vendorName: "PestGuard Pro",        city: "Lucknow",   category: "Pest Control",amount: 28400, jobs: 21,  period: "Feb Week 4", status: "on_hold",  upiId: "pestguard@upi",  requestedAt: "28 Feb 2026" },
  { id: "PP006", vendorId: "V006", vendorName: "SparkFix Electrical",  city: "Ghaziabad", category: "Electrical",  amount: 18200, jobs: 48,  period: "Feb Week 4", status: "pending",  upiId: "sparkfix@upi",   requestedAt: "28 Feb 2026" },
  { id: "PP007", vendorId: "V007", vendorName: "HandyMan Co.",         city: "Ghaziabad", category: "Carpentry",   amount: 12400, jobs: 32,  period: "Feb Week 4", status: "released", upiId: "handyman@upi",   requestedAt: "27 Feb 2026" },
];

// ─── Customer Booking History (for User Management drawer) ───────────────────

export interface CustomerBooking {
  id:        string;
  service:   string;
  icon:      string;
  vendor:    string;
  date:      string;
  amount:    number;
  status:    "completed" | "cancelled" | "ongoing" | "disputed";
}

export const CUSTOMER_BOOKINGS: Record<string, CustomerBooking[]> = {
  "CU001": [
    { id: "BK001", service: "AC Service",     icon: "❄️", vendor: "CoolBreeze AC",       date: "25 Feb 2026", amount: 1400, status: "completed" },
    { id: "BK002", service: "Plumbing",       icon: "🔧", vendor: "Kumar Home Services", date: "18 Feb 2026", amount: 800,  status: "completed" },
    { id: "BK003", service: "Cleaning",       icon: "🧹", vendor: "CleanPro Services",   date: "10 Feb 2026", amount: 1200, status: "completed" },
    { id: "BK004", service: "Electrical",     icon: "⚡", vendor: "SparkFix Electrical", date: "02 Feb 2026", amount: 950,  status: "disputed"  },
  ],
  "CU002": [
    { id: "BK005", service: "Pest Control",   icon: "🐛", vendor: "PestGuard Pro",       date: "22 Feb 2026", amount: 2200, status: "completed" },
    { id: "BK006", service: "AC Gas Refill",  icon: "❄️", vendor: "CoolBreeze AC",       date: "10 Feb 2026", amount: 3200, status: "disputed"  },
    { id: "BK007", service: "Cleaning",       icon: "🧹", vendor: "CleanPro Services",   date: "01 Feb 2026", amount: 900,  status: "completed" },
  ],
  "CU003": [
    { id: "BK008", service: "Pipe Leak Fix",  icon: "🔧", vendor: "Kumar Home Services", date: "27 Feb 2026", amount: 1200, status: "disputed"  },
    { id: "BK009", service: "Painting",       icon: "🎨", vendor: "ColorCraft Painters", date: "15 Jan 2026", amount: 8400, status: "completed" },
  ],
  "CU004": [
    { id: "BK010", service: "AC Service",     icon: "❄️", vendor: "CoolBreeze AC",       date: "26 Feb 2026", amount: 1800, status: "completed" },
    { id: "BK011", service: "Deep Cleaning",  icon: "🧹", vendor: "CleanPro Services",   date: "20 Feb 2026", amount: 2400, status: "completed" },
    { id: "BK012", service: "Carpentry",      icon: "🪚", vendor: "HandyMan Co.",         date: "15 Feb 2026", amount: 3200, status: "completed" },
    { id: "BK013", service: "Plumbing",       icon: "🔧", vendor: "Kumar Home Services", date: "08 Feb 2026", amount: 600,  status: "completed" },
    { id: "BK014", service: "Wiring Work",    icon: "⚡", vendor: "SparkFix Electrical", date: "01 Feb 2026", amount: 2400, status: "completed" },
  ],
  "CU005": [
    { id: "BK015", service: "Washing Machine",icon: "🔌", vendor: "QuickFix Services",   date: "22 Feb 2026", amount: 800,  status: "cancelled" },
    { id: "BK016", service: "Furniture Repair",icon: "🪚",vendor: "HandyMan Co.",         date: "28 Feb 2026", amount: 650,  status: "disputed"  },
  ],
  "CU006": [
    { id: "BK017", service: "AC Service",     icon: "❄️", vendor: "CoolBreeze AC",       date: "01 Feb 2026", amount: 1200, status: "cancelled" },
    { id: "BK018", service: "Cleaning",       icon: "🧹", vendor: "CleanPro Services",   date: "15 Jan 2026", amount: 900,  status: "completed" },
  ],
  "CU007": [
    { id: "BK019", service: "Plumbing",       icon: "🔧", vendor: "Kumar Home Services", date: "24 Feb 2026", amount: 1100, status: "completed" },
    { id: "BK020", service: "Pest Control",   icon: "🐛", vendor: "PestGuard Pro",       date: "12 Feb 2026", amount: 1800, status: "completed" },
    { id: "BK021", service: "Electrical",     icon: "⚡", vendor: "SparkFix Electrical", date: "05 Feb 2026", amount: 750,  status: "completed" },
  ],
  "CU008": [
    { id: "BK022", service: "Deep Cleaning",  icon: "🧹", vendor: "CleanPro Services",   date: "27 Feb 2026", amount: 2800, status: "ongoing"   },
    { id: "BK023", service: "AC Service",     icon: "❄️", vendor: "CoolBreeze AC",       date: "20 Feb 2026", amount: 1600, status: "completed" },
    { id: "BK024", service: "Painting",       icon: "🎨", vendor: "ColorCraft Painters", date: "10 Feb 2026", amount: 12400,status: "completed" },
    { id: "BK025", service: "Carpentry",      icon: "🪚", vendor: "HandyMan Co.",         date: "02 Feb 2026", amount: 2200, status: "completed" },
  ],
};

// ─── Agent Activity Log (for drawer) ─────────────────────────────────────────

export interface AgentActivity {
  id:      string;
  type:    "vendor_approved" | "vendor_rejected" | "dispute_resolved"
         | "lead_converted"  | "city_visit"       | "commission_credited";
  icon:    string;
  title:   string;
  sub:     string;
  date:    string;
  amount?: number;
}

export const AGENT_ACTIVITY: Record<string, AgentActivity[]> = {
  "AG001": [
    { id: "AC001", type: "vendor_approved",    icon: "✅", title: "Vendor Approved",      sub: "CoolBreeze AC — KYC verified",              date: "28 Feb 2026"             },
    { id: "AC002", type: "dispute_resolved",   icon: "⚖️", title: "Dispute Resolved",      sub: "BK-2602-0041 — ₹1,200 refund issued",       date: "26 Feb 2026", amount: 1200 },
    { id: "AC003", type: "lead_converted",     icon: "🎯", title: "Lead Converted",        sub: "Customer Sunita Rao → Painting job booked", date: "25 Feb 2026"             },
    { id: "AC004", type: "vendor_approved",    icon: "✅", title: "Vendor Approved",        sub: "PestGuard Pro — KYC verified",              date: "24 Feb 2026"             },
    { id: "AC005", type: "commission_credited",icon: "💸", title: "Commission Credited",   sub: "Feb Week 3 — ₹12,400 via UPI",             date: "22 Feb 2026", amount: 12400},
    { id: "AC006", type: "vendor_rejected",    icon: "❌", title: "Vendor Rejected",        sub: "FastFix Co. — Incomplete KYC documents",   date: "20 Feb 2026"             },
  ],
  "AG002": [
    { id: "AC007", type: "vendor_approved",    icon: "✅", title: "Vendor Approved",        sub: "CleanPro Services — KYC verified",          date: "27 Feb 2026"             },
    { id: "AC008", type: "vendor_approved",    icon: "✅", title: "Vendor Approved",        sub: "SparkFix Electrical — KYC verified",        date: "27 Feb 2026"             },
    { id: "AC009", type: "dispute_resolved",   icon: "⚖️", title: "Dispute Resolved",       sub: "BK-2602-0035 — No refund, vendor not at fault", date: "25 Feb 2026"        },
    { id: "AC010", type: "commission_credited",icon: "💸", title: "Commission Credited",    sub: "Feb Week 3 — ₹16,800 via UPI",             date: "22 Feb 2026", amount: 16800},
    { id: "AC011", type: "vendor_rejected",    icon: "❌", title: "Vendor Rejected",         sub: "QuickFix Co. — Fake KYC documents",        date: "20 Feb 2026"             },
    { id: "AC012", type: "lead_converted",     icon: "🎯", title: "Lead Converted",         sub: "Customer Pooja Mehta → AC service booked", date: "18 Feb 2026"             },
  ],
  "AG003": [
    { id: "AC013", type: "lead_converted",     icon: "🎯", title: "Lead Converted",         sub: "Customer Rahul Sinha → AC service booked", date: "28 Feb 2026"             },
    { id: "AC014", type: "vendor_approved",    icon: "✅", title: "Vendor Approved",         sub: "CarpentryKing — KYC verified",             date: "26 Feb 2026"             },
    { id: "AC015", type: "commission_credited",icon: "💸", title: "Commission Credited",    sub: "Feb Week 3 — ₹8,100 via UPI",             date: "22 Feb 2026", amount: 8100 },
    { id: "AC016", type: "city_visit",         icon: "🏙️", title: "City Field Visit",        sub: "Noida sector survey — 2 new vendors met",  date: "19 Feb 2026"             },
  ],
  "AG004": [
    { id: "AC017", type: "vendor_approved",    icon: "✅", title: "Vendor Approved",         sub: "LucknowPest Control — KYC verified",       date: "27 Feb 2026"             },
    { id: "AC018", type: "city_visit",         icon: "🏙️", title: "City Field Visit",         sub: "Lucknow market survey — 3 new vendors met",date: "25 Feb 2026"             },
    { id: "AC019", type: "commission_credited",icon: "💸", title: "Commission Credited",    sub: "Feb Week 3 — ₹6,200 via UPI",             date: "22 Feb 2026", amount: 6200 },
    { id: "AC020", type: "lead_converted",     icon: "🎯", title: "Lead Converted",         sub: "Customer Kavita Joshi → Plumbing booked",  date: "17 Feb 2026"             },
  ],
  "AG005": [
    { id: "AC021", type: "vendor_approved",    icon: "✅", title: "Vendor Approved",         sub: "KanpurElectric Co. — KYC verified",        date: "26 Feb 2026"             },
    { id: "AC022", type: "commission_credited",icon: "💸", title: "Commission Credited",    sub: "Feb Week 3 — ₹3,550 via UPI",             date: "22 Feb 2026", amount: 3550 },
  ],
  "AG006": [],
};

// ─── Agent Commission History ─────────────────────────────────────────────────

export interface AgentCommissionMonth {
  month:      string;
  leads:      number;
  vendors:    number;
  disputes:   number;
  grossRev:   number;
  commission: number;
  status:     "credited" | "pending" | "processing";
}

export const AGENT_COMMISSION: Record<string, AgentCommissionMonth[]> = {
  "AG001": [
    { month: "Feb 2026", leads: 224, vendors: 8,  disputes: 6, grossRev: 1040000, commission: 51800, status: "credited"   },
    { month: "Jan 2026", leads: 198, vendors: 6,  disputes: 5, grossRev: 920000,  commission: 46000, status: "credited"   },
    { month: "Dec 2025", leads: 182, vendors: 5,  disputes: 4, grossRev: 840000,  commission: 42000, status: "credited"   },
  ],
  "AG002": [
    { month: "Feb 2026", leads: 298, vendors: 11, disputes: 8, grossRev: 1368000, commission: 68400, status: "credited"   },
    { month: "Jan 2026", leads: 264, vendors:  9, disputes: 7, grossRev: 1200000, commission: 60000, status: "credited"   },
    { month: "Dec 2025", leads: 241, vendors:  8, disputes: 6, grossRev: 1080000, commission: 54000, status: "credited"   },
  ],
  "AG003": [
    { month: "Feb 2026", leads: 148, vendors: 5,  disputes: 4, grossRev: 648000,  commission: 32400, status: "credited"   },
    { month: "Jan 2026", leads: 124, vendors: 4,  disputes: 3, grossRev: 540000,  commission: 27000, status: "credited"   },
  ],
  "AG004": [
    { month: "Feb 2026", leads: 112, vendors: 4,  disputes: 3, grossRev: 496000,  commission: 24800, status: "credited"   },
    { month: "Jan 2026", leads:  94, vendors: 3,  disputes: 2, grossRev: 400000,  commission: 20000, status: "credited"   },
  ],
  "AG005": [
    { month: "Feb 2026", leads:  72, vendors: 3,  disputes: 1, grossRev: 284000,  commission: 14200, status: "processing" },
    { month: "Jan 2026", leads:  58, vendors: 2,  disputes: 1, grossRev: 220000,  commission: 11000, status: "credited"   },
  ],
  "AG006": [],
};

// ─── Category Vendors (for Categories drawer) ─────────────────────────────────

export interface CategoryVendor {
  id:      string;
  name:    string;
  city:    string;
  jobs:    number;
  revenue: number;
  rating:  number;
  status:  "active" | "inactive" | "suspended";
}

export const CATEGORY_VENDORS: Record<string, CategoryVendor[]> = {
  "CAT001": [
    { id: "CV001", name: "CoolBreeze AC",       city: "Ghaziabad", jobs: 312, revenue: 498000, rating: 4.5, status: "active"    },
    { id: "CV002", name: "ArcticCool Services", city: "Delhi",     jobs: 248, revenue: 380000, rating: 4.7, status: "active"    },
    { id: "CV003", name: "FrostyAir Tech",      city: "Noida",     jobs: 186, revenue: 284000, rating: 4.3, status: "active"    },
    { id: "CV004", name: "IcePeak AC",          city: "Lucknow",   jobs: 94,  revenue: 140000, rating: 4.0, status: "inactive"  },
  ],
  "CAT002": [
    { id: "CV005", name: "CleanPro Services",   city: "Delhi",     jobs: 421, revenue: 524000, rating: 4.8, status: "active"    },
    { id: "CV006", name: "SparkClean",          city: "Ghaziabad", jobs: 312, revenue: 280000, rating: 4.4, status: "active"    },
    { id: "CV007", name: "HomeShine Co.",       city: "Noida",     jobs: 218, revenue: 184000, rating: 4.2, status: "active"    },
    { id: "CV008", name: "PureCleanz",          city: "Kanpur",    jobs: 86,  revenue: 68000,  rating: 3.8, status: "active"    },
    { id: "CV009", name: "ShineRight Cleaners", city: "Varanasi",  jobs: 32,  revenue: 24000,  rating: 3.5, status: "suspended" },
  ],
  "CAT003": [
    { id: "CV010", name: "Kumar Home Services", city: "Ghaziabad", jobs: 298, revenue: 412000, rating: 4.7, status: "active"    },
    { id: "CV011", name: "PipeWorks Pro",       city: "Delhi",     jobs: 248, revenue: 184000, rating: 4.3, status: "active"    },
    { id: "CV012", name: "DrainFix Expert",     city: "Noida",     jobs: 142, revenue: 98000,  rating: 4.0, status: "active"    },
    { id: "CV013", name: "Lucknow Plumbers",    city: "Lucknow",   jobs: 68,  revenue: 46000,  rating: 3.7, status: "active"    },
  ],
  "CAT004": [
    { id: "CV014", name: "SparkFix Electrical", city: "Ghaziabad", jobs: 145, revenue: 198000, rating: 4.3, status: "active"    },
    { id: "CV015", name: "VoltMasters",         city: "Delhi",     jobs: 186, revenue: 242000, rating: 4.6, status: "active"    },
    { id: "CV016", name: "WireRight Pro",       city: "Noida",     jobs: 98,  revenue: 86000,  rating: 4.1, status: "active"    },
    { id: "CV017", name: "ElectroPro Kanpur",   city: "Kanpur",    jobs: 64,  revenue: 54000,  rating: 3.9, status: "active"    },
  ],
  "CAT005": [
    { id: "CV018", name: "PestGuard Pro",       city: "Lucknow",   jobs: 167, revenue: 284000, rating: 4.4, status: "active"    },
    { id: "CV019", name: "BugBusters Delhi",    city: "Delhi",     jobs: 124, revenue: 198000, rating: 4.6, status: "active"    },
    { id: "CV020", name: "SafeHome Pest",       city: "Ghaziabad", jobs: 98,  revenue: 168000, rating: 4.2, status: "active"    },
    { id: "CV021", name: "PestAway Noida",      city: "Noida",     jobs: 84,  revenue: 140000, rating: 4.0, status: "active"    },
  ],
  "CAT006": [
    { id: "CV022", name: "ColorCraft Painters", city: "Noida",     jobs: 184, revenue: 948000, rating: 4.6, status: "active"    },
    { id: "CV023", name: "WallArt Delhi",       city: "Delhi",     jobs: 72,  revenue: 380000, rating: 4.4, status: "active"    },
    { id: "CV024", name: "PrimeCoat GZB",       city: "Ghaziabad", jobs: 48,  revenue: 108000, rating: 4.1, status: "active"    },
    { id: "CV025", name: "BrushMasters LKO",    city: "Lucknow",   jobs: 18,  revenue: 44000,  rating: 3.8, status: "inactive"  },
  ],
  "CAT007": [
    { id: "CV026", name: "HandyMan Co.",        city: "Ghaziabad", jobs: 142, revenue: 184000, rating: 4.5, status: "active"    },
    { id: "CV027", name: "WoodWorks Delhi",     city: "Delhi",     jobs: 84,  revenue: 108000, rating: 4.3, status: "active"    },
    { id: "CV028", name: "CraftFix Noida",      city: "Noida",     jobs: 42,  revenue: 54000,  rating: 4.0, status: "active"    },
  ],
  "CAT008": [
    { id: "CV029", name: "QuickFix Services",   city: "Kanpur",    jobs: 87,  revenue: 84000,  rating: 3.1, status: "suspended" },
    { id: "CV030", name: "AppliancePro GZB",    city: "Ghaziabad", jobs: 142, revenue: 124000, rating: 4.4, status: "active"    },
    { id: "CV031", name: "FixIt Fast Delhi",    city: "Delhi",     jobs: 118, revenue: 98000,  rating: 4.2, status: "active"    },
    { id: "CV032", name: "RepairKing Noida",    city: "Noida",     jobs: 84,  revenue: 64000,  rating: 4.0, status: "active"    },
  ],
  "CAT009": [
    { id: "CV033", name: "StyleCut Men GZB",    city: "Ghaziabad", jobs: 48,  revenue: 32000,  rating: 4.1, status: "inactive"  },
    { id: "CV034", name: "BarberElite Delhi",   city: "Delhi",     jobs: 36,  revenue: 30000,  rating: 3.9, status: "inactive"  },
  ],
  "CAT010": [
    { id: "CV035", name: "GlowSalon Noida",     city: "Noida",     jobs: 24,  revenue: 28000,  rating: 4.2, status: "inactive"  },
    { id: "CV036", name: "BeautyHive GZB",      city: "Ghaziabad", jobs: 18,  revenue: 20000,  rating: 4.0, status: "inactive"  },
  ],
};

// ─── EMOJI_OPTIONS for Category Add/Edit form ─────────────────────────────────
export const CATEGORY_EMOJI_OPTIONS = [
  "❄️","🧹","🔧","⚡","🐛","🎨","🪚","🔌","💈","💅",
  "🏠","🚿","🪣","🛠️","🔑","🌿","🧴","🪟","🛋️","🚗",
  "📦","🧱","💡","🔔","🧯","🪴","🏗️","🧲","🔩","🪜",
];

// ─── Subscription Extended Data ───────────────────────────────────────────────

// Vendor subscribers per plan
export interface PlanSubscriber {
  id:          string;
  vendorName:  string;
  city:        string;
  category:    string;
  joinedDate:  string;
  renewalDate: string;
  status:      "active" | "expiring_soon" | "expired" | "cancelled";
  autoRenew:   boolean;
  amountPaid:  number;
}

export const PLAN_SUBSCRIBERS: Record<string, PlanSubscriber[]> = {
  "SP001": [
    { id: "VS001", vendorName: "LucknowPest Control",  city: "Lucknow",   category: "Pest Control", joinedDate: "01 Dec 2025", renewalDate: "01 Mar 2026", status: "expiring_soon", autoRenew: false, amountPaid: 499 },
    { id: "VS002", vendorName: "CraftFix Noida",       city: "Noida",     category: "Carpentry",    joinedDate: "15 Jan 2026", renewalDate: "15 Feb 2026", status: "expired",       autoRenew: false, amountPaid: 499 },
    { id: "VS003", vendorName: "DrainFix Expert",      city: "Noida",     category: "Plumbing",     joinedDate: "10 Jan 2026", renewalDate: "10 Feb 2026", status: "active",        autoRenew: true,  amountPaid: 499 },
    { id: "VS004", vendorName: "ElectroPro Kanpur",    city: "Kanpur",    category: "Electrical",   joinedDate: "05 Feb 2026", renewalDate: "05 Mar 2026", status: "active",        autoRenew: true,  amountPaid: 499 },
    { id: "VS005", vendorName: "PureCleanz",           city: "Kanpur",    category: "Cleaning",     joinedDate: "20 Jan 2026", renewalDate: "20 Feb 2026", status: "expiring_soon", autoRenew: false, amountPaid: 499 },
    { id: "VS006", vendorName: "BrushMasters LKO",     city: "Lucknow",   category: "Painting",     joinedDate: "12 Feb 2026", renewalDate: "12 Mar 2026", status: "active",        autoRenew: true,  amountPaid: 499 },
  ],
  "SP002": [
    { id: "VS007", vendorName: "CoolBreeze AC",        city: "Ghaziabad", category: "AC Service",   joinedDate: "01 Nov 2025", renewalDate: "01 Mar 2026", status: "active",        autoRenew: true,  amountPaid: 1299 },
    { id: "VS008", vendorName: "CleanPro Services",    city: "Delhi",     category: "Cleaning",     joinedDate: "15 Oct 2025", renewalDate: "15 Mar 2026", status: "active",        autoRenew: true,  amountPaid: 1299 },
    { id: "VS009", vendorName: "Kumar Home Services",  city: "Ghaziabad", category: "Plumbing",     joinedDate: "20 Nov 2025", renewalDate: "20 Feb 2026", status: "expiring_soon", autoRenew: false, amountPaid: 1299 },
    { id: "VS010", vendorName: "SparkFix Electrical",  city: "Ghaziabad", category: "Electrical",   joinedDate: "01 Dec 2025", renewalDate: "01 Mar 2026", status: "active",        autoRenew: true,  amountPaid: 1299 },
    { id: "VS011", vendorName: "PestGuard Pro",        city: "Lucknow",   category: "Pest Control", joinedDate: "10 Dec 2025", renewalDate: "10 Mar 2026", status: "active",        autoRenew: true,  amountPaid: 1299 },
    { id: "VS012", vendorName: "WallArt Delhi",        city: "Delhi",     category: "Painting",     joinedDate: "05 Jan 2026", renewalDate: "05 Feb 2026", status: "cancelled",     autoRenew: false, amountPaid: 1299 },
    { id: "VS013", vendorName: "HandyMan Co.",         city: "Ghaziabad", category: "Carpentry",    joinedDate: "15 Jan 2026", renewalDate: "15 Feb 2026", status: "active",        autoRenew: true,  amountPaid: 1299 },
    { id: "VS014", vendorName: "VoltMasters",          city: "Delhi",     category: "Electrical",   joinedDate: "20 Dec 2025", renewalDate: "20 Mar 2026", status: "active",        autoRenew: false, amountPaid: 1299 },
  ],
  "SP003": [
    { id: "VS015", vendorName: "ColorCraft Painters",  city: "Noida",     category: "Painting",     joinedDate: "01 Sep 2025", renewalDate: "01 Mar 2026", status: "active",        autoRenew: true,  amountPaid: 2999 },
    { id: "VS016", vendorName: "ArcticCool Services",  city: "Delhi",     category: "AC Service",   joinedDate: "15 Oct 2025", renewalDate: "15 Apr 2026", status: "active",        autoRenew: true,  amountPaid: 2999 },
    { id: "VS017", vendorName: "BugBusters Delhi",     city: "Delhi",     category: "Pest Control", joinedDate: "01 Nov 2025", renewalDate: "01 May 2026", status: "active",        autoRenew: true,  amountPaid: 2999 },
    { id: "VS018", vendorName: "AppliancePro GZB",     city: "Ghaziabad", category: "Appliance",    joinedDate: "10 Dec 2025", renewalDate: "10 Jun 2026", status: "active",        autoRenew: false, amountPaid: 2999 },
  ],
};

// Monthly revenue trend per plan (last 6 months)
export interface SubRevenueMonth {
  month:    string;
  basic:    number;
  premium:  number;
  enterprise: number;
}

export const SUB_REVENUE_TREND: SubRevenueMonth[] = [
  { month: "Sep", basic: 14970, premium: 154162, enterprise: 59980 },
  { month: "Oct", basic: 17465, premium: 181862, enterprise: 74975 },
  { month: "Nov", basic: 19960, premium: 207532, enterprise: 74975 },
  { month: "Dec", basic: 22455, premium: 220244, enterprise: 89970 },
  { month: "Jan", basic: 21956, premium: 233244, enterprise: 89970 },
  { month: "Feb", basic: 23952, premium: 239016, enterprise: 95968 },
];

// Expiring renewals (next 30 days) — across all plans
export interface ExpiringRenewal {
  vendorName:  string;
  planName:    string;
  planId:      string;
  city:        string;
  renewalDate: string;
  amount:      number;
  autoRenew:   boolean;
  daysLeft:    number;
}

export const EXPIRING_RENEWALS: ExpiringRenewal[] = [
  { vendorName: "CraftFix Noida",       planName: "Basic",   planId: "SP001", city: "Noida",     renewalDate: "15 Feb 2026", amount: 499,  autoRenew: false, daysLeft: 0  },
  { vendorName: "PureCleanz",           planName: "Basic",   planId: "SP001", city: "Kanpur",    renewalDate: "20 Feb 2026", amount: 499,  autoRenew: false, daysLeft: 5  },
  { vendorName: "WallArt Delhi",        planName: "Premium", planId: "SP002", city: "Delhi",     renewalDate: "05 Feb 2026", amount: 1299, autoRenew: false, daysLeft: 0  },
  { vendorName: "HandyMan Co.",         planName: "Premium", planId: "SP002", city: "Ghaziabad", renewalDate: "15 Feb 2026", amount: 1299, autoRenew: true,  daysLeft: 0  },
  { vendorName: "Kumar Home Services",  planName: "Premium", planId: "SP002", city: "Ghaziabad", renewalDate: "20 Feb 2026", amount: 1299, autoRenew: false, daysLeft: 5  },
  { vendorName: "LucknowPest Control",  planName: "Basic",   planId: "SP001", city: "Lucknow",   renewalDate: "01 Mar 2026", amount: 499,  autoRenew: false, daysLeft: 14 },
];

// ─── FINANCE PAGE DATA ────────────────────────────────────────────────────────

// Individual Transactions
export interface Transaction {
  id:          string;
  type:        "booking" | "payout" | "commission" | "refund" | "subscription" | "penalty";
  description: string;
  vendor:      string;
  customer:    string;
  city:        string;
  category:    string;
  grossAmount: number;
  platformFee: number;
  gst:         number;
  netAmount:   number;
  status:      "completed" | "pending" | "failed" | "refunded";
  date:        string;
  time:        string;
  txnId:       string;
  paymentMode: "upi" | "card" | "netbanking" | "wallet" | "cash";
}

export const TRANSACTIONS: Transaction[] = [
  { id: "T001", type: "booking",      description: "AC Service - Gas Refill",      vendor: "CoolBreeze AC",       customer: "Amit Sharma",    city: "Ghaziabad", category: "AC Service",   grossAmount: 1800, platformFee: 360,  gst: 64,  netAmount: 1440, status: "completed", date: "28 Feb 2026", time: "11:24 AM", txnId: "TXN-84921", paymentMode: "upi"        },
  { id: "T002", type: "booking",      description: "Deep Cleaning - 3BHK",         vendor: "CleanPro Services",   customer: "Sunita Rao",     city: "Ghaziabad", category: "Cleaning",     grossAmount: 2400, platformFee: 480,  gst: 86,  netAmount: 1920, status: "completed", date: "28 Feb 2026", time: "10:15 AM", txnId: "TXN-84922", paymentMode: "card"       },
  { id: "T003", type: "payout",       description: "Weekly Payout - Feb W4",       vendor: "CleanPro Services",   customer: "—",              city: "Delhi",     category: "Cleaning",     grossAmount: 42800,platformFee: 0,    gst: 0,   netAmount: 42800,status: "pending",   date: "28 Feb 2026", time: "09:00 AM", txnId: "TXN-84923", paymentMode: "upi"        },
  { id: "T004", type: "booking",      description: "Pipe Leak Repair",             vendor: "Kumar Home Services", customer: "Rahul Sinha",    city: "Noida",     category: "Plumbing",     grossAmount: 1200, platformFee: 240,  gst: 43,  netAmount: 960,  status: "completed", date: "27 Feb 2026", time: "03:42 PM", txnId: "TXN-84910", paymentMode: "upi"        },
  { id: "T005", type: "refund",       description: "Cancelled Booking Refund",     vendor: "QuickFix Services",   customer: "Kavita Joshi",   city: "Lucknow",   category: "Appliance",    grossAmount: 800,  platformFee: -160, gst: 0,   netAmount: 800,  status: "refunded",  date: "27 Feb 2026", time: "02:18 PM", txnId: "TXN-84911", paymentMode: "wallet"     },
  { id: "T006", type: "subscription", description: "Premium Plan - Feb Renewal",   vendor: "PestGuard Pro",       customer: "—",              city: "Lucknow",   category: "Pest Control", grossAmount: 1299, platformFee: 1299, gst: 233, netAmount: 1299, status: "completed", date: "27 Feb 2026", time: "12:00 PM", txnId: "TXN-84912", paymentMode: "card"       },
  { id: "T007", type: "booking",      description: "Interior Painting - 2BHK",     vendor: "ColorCraft Painters", customer: "Ritu Agarwal",   city: "Noida",     category: "Painting",     grossAmount: 12400,platformFee: 2480, gst: 446, netAmount: 9920, status: "completed", date: "27 Feb 2026", time: "09:30 AM", txnId: "TXN-84913", paymentMode: "netbanking" },
  { id: "T008", type: "commission",   description: "Agent Commission - Feb",       vendor: "—",                   customer: "—",              city: "Ghaziabad", category: "—",            grossAmount: 8400, platformFee: 0,    gst: 0,   netAmount: 8400, status: "completed", date: "26 Feb 2026", time: "06:00 PM", txnId: "TXN-84890", paymentMode: "upi"        },
  { id: "T009", type: "booking",      description: "Wiring & Board Repair",        vendor: "SparkFix Electrical", customer: "Deepak Malhotra",city: "Ghaziabad", category: "Electrical",   grossAmount: 2400, platformFee: 480,  gst: 86,  netAmount: 1920, status: "completed", date: "26 Feb 2026", time: "04:10 PM", txnId: "TXN-84891", paymentMode: "upi"        },
  { id: "T010", type: "penalty",      description: "Late Completion Penalty",      vendor: "QuickFix Services",   customer: "—",              city: "Kanpur",    category: "Appliance",    grossAmount: 500,  platformFee: 500,  gst: 0,   netAmount: 0,    status: "completed", date: "26 Feb 2026", time: "02:30 PM", txnId: "TXN-84892", paymentMode: "wallet"     },
  { id: "T011", type: "payout",       description: "Weekly Payout - Feb W4",       vendor: "CoolBreeze AC",       customer: "—",              city: "Ghaziabad", category: "AC Service",   grossAmount: 38400,platformFee: 0,    gst: 0,   netAmount: 38400,status: "pending",   date: "26 Feb 2026", time: "09:00 AM", txnId: "TXN-84893", paymentMode: "upi"        },
  { id: "T012", type: "booking",      description: "Termite Treatment - 3BHK",     vendor: "PestGuard Pro",       customer: "Pooja Mehta",    city: "Delhi",     category: "Pest Control", grossAmount: 3200, platformFee: 640,  gst: 115, netAmount: 2560, status: "completed", date: "25 Feb 2026", time: "11:00 AM", txnId: "TXN-84870", paymentMode: "card"       },
  { id: "T013", type: "subscription", description: "Basic Plan - Renewal",         vendor: "DrainFix Expert",     customer: "—",              city: "Noida",     category: "Plumbing",     grossAmount: 499,  platformFee: 499,  gst: 89,  netAmount: 499,  status: "completed", date: "25 Feb 2026", time: "10:00 AM", txnId: "TXN-84871", paymentMode: "upi"        },
  { id: "T014", type: "booking",      description: "Carpenter - Furniture Assembly",vendor: "HandyMan Co.",        customer: "Ritu Agarwal",   city: "Ghaziabad", category: "Carpentry",    grossAmount: 2200, platformFee: 440,  gst: 79,  netAmount: 1760, status: "completed", date: "25 Feb 2026", time: "02:00 PM", txnId: "TXN-84872", paymentMode: "upi"        },
  { id: "T015", type: "booking",      description: "Salon - Bridal Package",       vendor: "GlowSalon Noida",     customer: "Kavita Joshi",   city: "Noida",     category: "Salon",        grossAmount: 4800, platformFee: 960,  gst: 172, netAmount: 3840, status: "failed",    date: "24 Feb 2026", time: "04:30 PM", txnId: "TXN-84850", paymentMode: "card"       },
  { id: "T016", type: "payout",       description: "Weekly Payout - Feb W3",       vendor: "Kumar Home Services", customer: "—",              city: "Ghaziabad", category: "Plumbing",     grossAmount: 31200,platformFee: 0,    gst: 0,   netAmount: 31200,status: "completed", date: "22 Feb 2026", time: "09:00 AM", txnId: "TXN-84800", paymentMode: "upi"        },
  { id: "T017", type: "refund",       description: "Dispute Resolution Refund",    vendor: "SparkFix Electrical", customer: "Amit Sharma",    city: "Ghaziabad", category: "Electrical",   grossAmount: 950,  platformFee: 0,    gst: 0,   netAmount: 950,  status: "refunded",  date: "22 Feb 2026", time: "03:00 PM", txnId: "TXN-84801", paymentMode: "upi"        },
  { id: "T018", type: "subscription", description: "Enterprise Plan - Renewal",    vendor: "ColorCraft Painters", customer: "—",              city: "Noida",     category: "Painting",     grossAmount: 2999, platformFee: 2999, gst: 539, netAmount: 2999, status: "completed", date: "20 Feb 2026", time: "10:00 AM", txnId: "TXN-84780", paymentMode: "netbanking" },
];

// Monthly P&L summary
export interface MonthlyPL {
  month:          string;
  grossRevenue:   number;
  platformFee:    number;
  payouts:        number;
  commissions:    number;
  refunds:        number;
  subscriptions:  number;
  netProfit:      number;
  gstCollected:   number;
  bookings:       number;
}

export const MONTHLY_PL: MonthlyPL[] = [
  { month: "Sep 25", grossRevenue: 3800000, platformFee: 760000, payouts: 3040000, commissions: 124000, refunds: 48000,  subscriptions: 142000, netProfit: 730000, gstCollected: 136800, bookings: 2980 },
  { month: "Oct 25", grossRevenue: 4200000, platformFee: 840000, payouts: 3360000, commissions: 132000, refunds: 42000,  subscriptions: 168000, netProfit: 834000, gstCollected: 151200, bookings: 3240 },
  { month: "Nov 25", grossRevenue: 4680000, platformFee: 936000, payouts: 3744000, commissions: 148000, refunds: 56000,  subscriptions: 198000, netProfit: 930000, gstCollected: 168480, bookings: 3612 },
  { month: "Dec 25", grossRevenue: 5120000, platformFee: 1024000,payouts: 4096000, commissions: 162000, refunds: 38000,  subscriptions: 228000, netProfit: 1014000,gstCollected: 184320, bookings: 3980 },
  { month: "Jan 26", grossRevenue: 4840000, platformFee: 968000, payouts: 3872000, commissions: 154000, refunds: 64000,  subscriptions: 218000, netProfit: 968000, gstCollected: 174240, bookings: 3764 },
  { month: "Feb 26", grossRevenue: 5480000, platformFee: 1096000,payouts: 4384000, commissions: 178000, refunds: 52000,  subscriptions: 254000, netProfit: 1116000,gstCollected: 196080, bookings: 4312 },
];

// Revenue breakdown by category (current month)
export interface CategoryRevenue {
  category:    string;
  icon:        string;
  revenue:     number;
  platformFee: number;
  bookings:    number;
  avgValue:    number;
  growth:      number;
}

export const CATEGORY_REVENUE: CategoryRevenue[] = [
  { category: "AC Service",    icon: "❄️", revenue: 1240000, platformFee: 248000, bookings: 892,  avgValue: 1390, growth: 28.4 },
  { category: "Cleaning",      icon: "🧹", revenue: 980000,  platformFee: 196000, bookings: 1124, avgValue: 872,  growth: 22.1 },
  { category: "Pest Control",  icon: "🐛", revenue: 840000,  platformFee: 168000, bookings: 624,  avgValue: 1346, growth: 34.8 },
  { category: "Painting",      icon: "🎨", revenue: 1480000, platformFee: 296000, bookings: 312,  avgValue: 4744, growth: 12.4 },
  { category: "Plumbing",      icon: "🔧", revenue: 740000,  platformFee: 148000, bookings: 986,  avgValue: 751,  growth: 18.7 },
  { category: "Electrical",    icon: "⚡", revenue: 620000,  platformFee: 124000, bookings: 842,  avgValue: 736,  growth: 15.2 },
  { category: "Carpentry",     icon: "🪚", revenue: 320000,  platformFee: 64000,  bookings: 248,  avgValue: 1290, growth: 8.9  },
  { category: "Appliance",     icon: "🔌", revenue: 380000,  platformFee: 76000,  bookings: 486,  avgValue: 782,  growth: 19.3 },
];

// Revenue by city (current month)
export interface CityRevenue {
  city:        string;
  state:       string;
  revenue:     number;
  platformFee: number;
  bookings:    number;
  vendors:     number;
  growth:      number;
}

export const CITY_REVENUE: CityRevenue[] = [
  { city: "Delhi",      state: "Delhi", revenue: 2180000, platformFee: 436000, bookings: 1682, vendors: 124, growth: 18.7 },
  { city: "Ghaziabad",  state: "UP",    revenue: 1640000, platformFee: 328000, bookings: 1284, vendors: 87,  growth: 24.2 },
  { city: "Noida",      state: "UP",    revenue: 1020000, platformFee: 204000, bookings: 841,  vendors: 64,  growth: 31.4 },
  { city: "Lucknow",    state: "UP",    revenue: 780000,  platformFee: 156000, bookings: 628,  vendors: 48,  growth: 42.1 },
  { city: "Kanpur",     state: "UP",    revenue: 480000,  platformFee: 96000,  bookings: 412,  vendors: 32,  growth: 56.8 },
  { city: "Varanasi",   state: "UP",    revenue: 52000,   platformFee: 10400,  bookings: 48,   vendors: 18,  growth: 0    },
];

// GST summary
export interface GSTSummary {
  month:         string;
  taxableAmount: number;
  cgst:          number;  // 9%
  sgst:          number;  // 9%
  totalGST:      number;
  filedStatus:   "filed" | "pending" | "overdue";
}

export const GST_SUMMARY: GSTSummary[] = [
  { month: "Sep 25", taxableAmount: 760000,  cgst: 68400,  sgst: 68400,  totalGST: 136800, filedStatus: "filed"   },
  { month: "Oct 25", taxableAmount: 840000,  cgst: 75600,  sgst: 75600,  totalGST: 151200, filedStatus: "filed"   },
  { month: "Nov 25", taxableAmount: 936000,  cgst: 84240,  sgst: 84240,  totalGST: 168480, filedStatus: "filed"   },
  { month: "Dec 25", taxableAmount: 1024000, cgst: 92160,  sgst: 92160,  totalGST: 184320, filedStatus: "filed"   },
  { month: "Jan 26", taxableAmount: 968000,  cgst: 87120,  sgst: 87120,  totalGST: 174240, filedStatus: "filed"   },
  { month: "Feb 26", taxableAmount: 1096000, cgst: 98640,  sgst: 98640,  totalGST: 197280, filedStatus: "pending" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS DATA
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. Hourly Booking Pattern (avg bookings per hour, by day type) ────────────
export interface HourlyPattern {
  hour:     number;   // 0–23
  label:    string;   // "6 AM"
  weekday:  number;
  weekend:  number;
}

export const HOURLY_PATTERN: HourlyPattern[] = [
  { hour:  6, label: "6 AM",  weekday:  4, weekend:  2 },
  { hour:  7, label: "7 AM",  weekday:  9, weekend:  5 },
  { hour:  8, label: "8 AM",  weekday: 18, weekend: 12 },
  { hour:  9, label: "9 AM",  weekday: 32, weekend: 28 },
  { hour: 10, label: "10 AM", weekday: 48, weekend: 42 },
  { hour: 11, label: "11 AM", weekday: 56, weekend: 54 },
  { hour: 12, label: "12 PM", weekday: 41, weekend: 48 },
  { hour: 13, label: "1 PM",  weekday: 38, weekend: 44 },
  { hour: 14, label: "2 PM",  weekday: 52, weekend: 50 },
  { hour: 15, label: "3 PM",  weekday: 61, weekend: 58 },
  { hour: 16, label: "4 PM",  weekday: 58, weekend: 62 },
  { hour: 17, label: "5 PM",  weekday: 44, weekend: 68 },
  { hour: 18, label: "6 PM",  weekday: 34, weekend: 52 },
  { hour: 19, label: "7 PM",  weekday: 24, weekend: 38 },
  { hour: 20, label: "8 PM",  weekday: 14, weekend: 22 },
  { hour: 21, label: "9 PM",  weekday:  7, weekend: 12 },
];

// ─── 2. Day-of-Week Performance ───────────────────────────────────────────────
export interface DayPerf {
  day:           string;
  shortDay:      string;
  bookings:      number;
  revenue:       number;
  cancellations: number;
  avgValue:      number;
}

export const DAY_PERF: DayPerf[] = [
  { day: "Monday",    shortDay: "Mon", bookings: 580, revenue: 712000,  cancellations: 48, avgValue: 1228 },
  { day: "Tuesday",   shortDay: "Tue", bookings: 542, revenue: 664000,  cancellations: 44, avgValue: 1225 },
  { day: "Wednesday", shortDay: "Wed", bookings: 618, revenue: 758000,  cancellations: 52, avgValue: 1227 },
  { day: "Thursday",  shortDay: "Thu", bookings: 596, revenue: 730000,  cancellations: 50, avgValue: 1225 },
  { day: "Friday",    shortDay: "Fri", bookings: 672, revenue: 828000,  cancellations: 56, avgValue: 1232 },
  { day: "Saturday",  shortDay: "Sat", bookings: 824, revenue: 1024000, cancellations: 62, avgValue: 1243 },
  { day: "Sunday",    shortDay: "Sun", bookings: 780, revenue: 964000,  cancellations: 58, avgValue: 1236 },
];

// ─── 3. Booking Funnel ────────────────────────────────────────────────────────
export interface FunnelStep {
  step:       string;
  count:      number;
  dropoffPct: number;  // % that dropped off from previous step
  color:      string;
}

export const BOOKING_FUNNEL: FunnelStep[] = [
  { step: "App Opens",          count: 84200, dropoffPct: 0,    color: "#0ea5e9" },
  { step: "Service Browsed",    count: 52400, dropoffPct: 37.8, color: "#6366f1" },
  { step: "Vendor Selected",    count: 28600, dropoffPct: 45.4, color: "#8b5cf6" },
  { step: "Booking Initiated",  count: 18400, dropoffPct: 35.7, color: "#ec4899" },
  { step: "Payment Attempted",  count: 14200, dropoffPct: 22.8, color: "#f59e0b" },
  { step: "Booking Confirmed",  count: 12840, dropoffPct: 9.6,  color: "#10b981" },
];

// ─── 4. Customer Retention Cohorts (monthly, % retained) ─────────────────────
export interface RetentionCohort {
  cohort:  string;   // "Sep 25"
  size:    number;
  m0:      number;   // 100 always
  m1:      number;
  m2:      number;
  m3:      number;
  m4:      number;
  m5:      number;
}

export const RETENTION_COHORTS: RetentionCohort[] = [
  { cohort: "Sep 25", size: 1840, m0: 100, m1: 42, m2: 34, m3: 29, m4: 26, m5: 24 },
  { cohort: "Oct 25", size: 2120, m0: 100, m1: 44, m2: 36, m3: 31, m4: 28, m5: 25 },
  { cohort: "Nov 25", size: 2480, m0: 100, m1: 46, m2: 38, m3: 33, m4: 30, m5: 0  },
  { cohort: "Dec 25", size: 2840, m0: 100, m1: 48, m2: 40, m3: 35, m4: 0,  m5: 0  },
  { cohort: "Jan 26", size: 2640, m0: 100, m1: 47, m2: 39, m3: 0,  m4: 0,  m5: 0  },
  { cohort: "Feb 26", size: 3120, m0: 100, m1: 0,  m2: 0,  m3: 0,  m4: 0,  m5: 0  },
];

// ─── 5. Platform Growth KPIs (month-over-month) ───────────────────────────────
export interface GrowthKPI {
  metric:      string;
  current:     number;
  previous:    number;
  growthPct:   number;
  unit:        string;
  icon:        string;
  trend:       "up" | "down" | "flat";
  positive:    boolean;  // is "up" good for this metric?
}

export const GROWTH_KPIS: GrowthKPI[] = [
  { metric: "Gross Revenue",      current: 5480000, previous: 4840000, growthPct: 13.2,  unit: "₹", icon: "💰", trend: "up",   positive: true  },
  { metric: "Platform Fee",       current: 1096000, previous: 968000,  growthPct: 13.2,  unit: "₹", icon: "🏦", trend: "up",   positive: true  },
  { metric: "Total Bookings",     current: 4312,    previous: 3764,    growthPct: 14.6,  unit: "",  icon: "📋", trend: "up",   positive: true  },
  { metric: "New Customers",      current: 584,     previous: 496,     growthPct: 17.7,  unit: "",  icon: "👤", trend: "up",   positive: true  },
  { metric: "New Vendors",        current: 28,      previous: 22,      growthPct: 27.3,  unit: "",  icon: "🏪", trend: "up",   positive: true  },
  { metric: "Avg Order Value",    current: 1271,    previous: 1286,    growthPct: -1.2,  unit: "₹", icon: "🧾", trend: "down", positive: false },
  { metric: "Cancellation Rate",  current: 7.2,     previous: 8.3,     growthPct: -13.3, unit: "%", icon: "❌", trend: "down", positive: true  },
  { metric: "Dispute Rate",       current: 1.6,     previous: 2.1,     growthPct: -23.8, unit: "%", icon: "⚖️", trend: "down", positive: true  },
];

// ─── 6. Vendor Health Distribution ────────────────────────────────────────────
export interface VendorHealthBucket {
  label:       string;
  range:       string;
  count:       number;
  color:       string;
  bg:          string;
}

export const VENDOR_HEALTH: VendorHealthBucket[] = [
  { label: "Elite",     range: "4.5–5.0 ★", count: 84,  color: "text-emerald-700", bg: "bg-emerald-500" },
  { label: "Good",      range: "4.0–4.4 ★", count: 112, color: "text-sky-700",     bg: "bg-sky-500"     },
  { label: "Average",   range: "3.5–3.9 ★", count: 68,  color: "text-amber-700",   bg: "bg-amber-500"   },
  { label: "At Risk",   range: "3.0–3.4 ★", count: 32,  color: "text-orange-700",  bg: "bg-orange-500"  },
  { label: "Critical",  range: "< 3.0 ★",   count: 16,  color: "text-red-700",     bg: "bg-red-500"     },
];

// ─── 7. Customer Segments ─────────────────────────────────────────────────────
export interface CustomerSegment {
  segment:     string;
  count:       number;
  pct:         number;
  avgSpend:    number;
  avgBookings: number;
  color:       string;
  bg:          string;
  desc:        string;
}

export const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  { segment: "Champions",       count: 1248,  pct: 10.0, avgSpend: 18400, avgBookings: 14, color: "text-violet-700", bg: "bg-violet-500", desc: "High frequency, high spend"      },
  { segment: "Loyal",           count: 2496,  pct: 20.0, avgSpend: 9200,  avgBookings: 7,  color: "text-sky-700",    bg: "bg-sky-500",    desc: "Regular users, consistent"       },
  { segment: "Potential Loyal", count: 3120,  pct: 25.0, avgSpend: 4800,  avgBookings: 4,  color: "text-emerald-700",bg: "bg-emerald-500",desc: "Growing engagement"              },
  { segment: "New Customers",   count: 2496,  pct: 20.0, avgSpend: 1800,  avgBookings: 1,  color: "text-amber-700",  bg: "bg-amber-500",  desc: "Joined this month"               },
  { segment: "At Risk",         count: 1872,  pct: 15.0, avgSpend: 2400,  avgBookings: 2,  color: "text-orange-700", bg: "bg-orange-500", desc: "Were active, now dormant 30d"    },
  { segment: "Churned",         count: 1248,  pct: 10.0, avgSpend: 1200,  avgBookings: 1,  color: "text-red-700",    bg: "bg-red-500",    desc: "No activity 90+ days"            },
];

// ─── 8. Booking Heatmap (day × hour, normalised 0–100) ────────────────────────
export interface HeatmapCell {
  day:   string;
  hour:  string;
  value: number; // 0–100 relative intensity
}

export const BOOKING_HEATMAP: HeatmapCell[] = [
  // Monday
  { day: "Mon", hour: "9AM",  value: 28 }, { day: "Mon", hour: "10AM", value: 42 }, { day: "Mon", hour: "11AM", value: 58 },
  { day: "Mon", hour: "12PM", value: 38 }, { day: "Mon", hour: "2PM",  value: 52 }, { day: "Mon", hour: "3PM",  value: 64 },
  { day: "Mon", hour: "4PM",  value: 55 }, { day: "Mon", hour: "5PM",  value: 40 }, { day: "Mon", hour: "6PM",  value: 28 },
  // Tuesday
  { day: "Tue", hour: "9AM",  value: 24 }, { day: "Tue", hour: "10AM", value: 38 }, { day: "Tue", hour: "11AM", value: 52 },
  { day: "Tue", hour: "12PM", value: 34 }, { day: "Tue", hour: "2PM",  value: 48 }, { day: "Tue", hour: "3PM",  value: 60 },
  { day: "Tue", hour: "4PM",  value: 50 }, { day: "Tue", hour: "5PM",  value: 36 }, { day: "Tue", hour: "6PM",  value: 24 },
  // Wednesday
  { day: "Wed", hour: "9AM",  value: 32 }, { day: "Wed", hour: "10AM", value: 48 }, { day: "Wed", hour: "11AM", value: 62 },
  { day: "Wed", hour: "12PM", value: 42 }, { day: "Wed", hour: "2PM",  value: 56 }, { day: "Wed", hour: "3PM",  value: 70 },
  { day: "Wed", hour: "4PM",  value: 60 }, { day: "Wed", hour: "5PM",  value: 44 }, { day: "Wed", hour: "6PM",  value: 30 },
  // Thursday
  { day: "Thu", hour: "9AM",  value: 30 }, { day: "Thu", hour: "10AM", value: 44 }, { day: "Thu", hour: "11AM", value: 58 },
  { day: "Thu", hour: "12PM", value: 40 }, { day: "Thu", hour: "2PM",  value: 54 }, { day: "Thu", hour: "3PM",  value: 66 },
  { day: "Thu", hour: "4PM",  value: 56 }, { day: "Thu", hour: "5PM",  value: 42 }, { day: "Thu", hour: "6PM",  value: 28 },
  // Friday
  { day: "Fri", hour: "9AM",  value: 38 }, { day: "Fri", hour: "10AM", value: 54 }, { day: "Fri", hour: "11AM", value: 68 },
  { day: "Fri", hour: "12PM", value: 48 }, { day: "Fri", hour: "2PM",  value: 62 }, { day: "Fri", hour: "3PM",  value: 74 },
  { day: "Fri", hour: "4PM",  value: 64 }, { day: "Fri", hour: "5PM",  value: 50 }, { day: "Fri", hour: "6PM",  value: 36 },
  // Saturday
  { day: "Sat", hour: "9AM",  value: 52 }, { day: "Sat", hour: "10AM", value: 72 }, { day: "Sat", hour: "11AM", value: 88 },
  { day: "Sat", hour: "12PM", value: 68 }, { day: "Sat", hour: "2PM",  value: 80 }, { day: "Sat", hour: "3PM",  value: 92 },
  { day: "Sat", hour: "4PM",  value: 86 }, { day: "Sat", hour: "5PM",  value: 76 }, { day: "Sat", hour: "6PM",  value: 58 },
  // Sunday
  { day: "Sun", hour: "9AM",  value: 48 }, { day: "Sun", hour: "10AM", value: 68 }, { day: "Sun", hour: "11AM", value: 82 },
  { day: "Sun", hour: "12PM", value: 64 }, { day: "Sun", hour: "2PM",  value: 76 }, { day: "Sun", hour: "3PM",  value: 88 },
  { day: "Sun", hour: "4PM",  value: 80 }, { day: "Sun", hour: "5PM",  value: 70 }, { day: "Sun", hour: "6PM",  value: 52 },
];

export const HEATMAP_DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export const HEATMAP_HOURS = ["9AM","10AM","11AM","12PM","2PM","3PM","4PM","5PM","6PM"];

// ─── 9. Revenue Trend (12 months with all breakdowns) ─────────────────────────
export interface RevenueTrend {
  month:         string;
  shortMonth:    string;
  grossRevenue:  number;
  platformFee:   number;
  subscriptions: number;
  netProfit:     number;
  bookings:      number;
  newCustomers:  number;
  newVendors:    number;
}

export const REVENUE_TREND_12M: RevenueTrend[] = [
  { month: "Mar 25", shortMonth: "Mar", grossRevenue: 1840000, platformFee: 368000, subscriptions: 62000,  netProfit: 306000,  bookings: 1484, newCustomers: 284, newVendors: 12 },
  { month: "Apr 25", shortMonth: "Apr", grossRevenue: 2240000, platformFee: 448000, subscriptions: 78000,  netProfit: 370000,  bookings: 1748, newCustomers: 318, newVendors: 16 },
  { month: "May 25", shortMonth: "May", grossRevenue: 2680000, platformFee: 536000, subscriptions: 92000,  netProfit: 444000,  bookings: 2084, newCustomers: 362, newVendors: 18 },
  { month: "Jun 25", shortMonth: "Jun", grossRevenue: 2960000, platformFee: 592000, subscriptions: 104000, netProfit: 488000,  bookings: 2284, newCustomers: 394, newVendors: 20 },
  { month: "Jul 25", shortMonth: "Jul", grossRevenue: 3240000, platformFee: 648000, subscriptions: 116000, netProfit: 532000,  bookings: 2512, newCustomers: 418, newVendors: 22 },
  { month: "Aug 25", shortMonth: "Aug", grossRevenue: 3540000, platformFee: 708000, subscriptions: 128000, netProfit: 580000,  bookings: 2748, newCustomers: 448, newVendors: 24 },
  { month: "Sep 25", shortMonth: "Sep", grossRevenue: 3800000, platformFee: 760000, subscriptions: 142000, netProfit: 618000,  bookings: 2980, newCustomers: 476, newVendors: 26 },
  { month: "Oct 25", shortMonth: "Oct", grossRevenue: 4200000, platformFee: 840000, subscriptions: 168000, netProfit: 692000,  bookings: 3240, newCustomers: 512, newVendors: 28 },
  { month: "Nov 25", shortMonth: "Nov", grossRevenue: 4680000, platformFee: 936000, subscriptions: 198000, netProfit: 738000,  bookings: 3612, newCustomers: 548, newVendors: 30 },
  { month: "Dec 25", shortMonth: "Dec", grossRevenue: 5120000, platformFee: 1024000,subscriptions: 228000, netProfit: 796000,  bookings: 3980, newCustomers: 588, newVendors: 32 },
  { month: "Jan 26", shortMonth: "Jan", grossRevenue: 4840000, platformFee: 968000, subscriptions: 218000, netProfit: 750000,  bookings: 3764, newCustomers: 496, newVendors: 22 },
  { month: "Feb 26", shortMonth: "Feb", grossRevenue: 5480000, platformFee: 1096000,subscriptions: 254000, netProfit: 842000,  bookings: 4312, newCustomers: 584, newVendors: 28 },
];

// ─── 10. Top Cities Performance Radar (normalised 0–100) ──────────────────────
export interface CityRadar {
  city:        string;
  revenue:     number;
  growth:      number;
  retention:   number;
  vendorScore: number;
  satisfaction:number;
}

export const CITY_RADAR: CityRadar[] = [
  { city: "Delhi",     revenue: 100, growth: 62, retention: 78, vendorScore: 88, satisfaction: 82 },
  { city: "Ghaziabad", revenue: 75,  growth: 78, retention: 72, vendorScore: 84, satisfaction: 80 },
  { city: "Noida",     revenue: 47,  growth: 88, retention: 68, vendorScore: 76, satisfaction: 78 },
  { city: "Lucknow",   revenue: 36,  growth: 92, retention: 62, vendorScore: 72, satisfaction: 74 },
  { city: "Kanpur",    revenue: 22,  growth: 100,retention: 54, vendorScore: 64, satisfaction: 70 },
];

// ─── 11. NPS & Satisfaction ───────────────────────────────────────────────────
export interface NPSData {
  month:      string;
  nps:        number;  // -100 to 100
  promoters:  number;  // %
  passives:   number;  // %
  detractors: number;  // %
  responses:  number;
}

export const NPS_TREND: NPSData[] = [
  { month: "Sep 25", nps: 38, promoters: 58, passives: 22, detractors: 20, responses: 842  },
  { month: "Oct 25", nps: 42, promoters: 61, passives: 21, detractors: 18, responses: 968  },
  { month: "Nov 25", nps: 44, promoters: 63, passives: 19, detractors: 18, responses: 1084 },
  { month: "Dec 25", nps: 48, promoters: 66, passives: 18, detractors: 16, responses: 1248 },
  { month: "Jan 26", nps: 46, promoters: 64, passives: 20, detractors: 16, responses: 1124 },
  { month: "Feb 26", nps: 52, promoters: 68, passives: 18, detractors: 14, responses: 1342 },
];

// ─── 12. Agent Performance Leaderboard ───────────────────────────────────────
export interface AgentLeaderboard {
  rank:        number;
  agentId:     string;
  name:        string;
  city:        string;
  vendors:     number;
  bookings:    number;
  revenue:     number;
  disputes:    number;
  resolution:  number; // % disputes resolved
  score:       number; // 0–100 composite
  trend:       "up" | "down" | "flat";
}

export const AGENT_LEADERBOARD: AgentLeaderboard[] = [
  { rank: 1, agentId: "AGT-002", name: "Rohit Verma",   city: "Delhi",     vendors: 124, bookings: 1682, revenue: 2180000, disputes: 48, resolution: 94, score: 96, trend: "up"   },
  { rank: 2, agentId: "AGT-001", name: "Priya Sharma",  city: "Ghaziabad", vendors: 87,  bookings: 1284, revenue: 1640000, disputes: 34, resolution: 97, score: 92, trend: "up"   },
  { rank: 3, agentId: "AGT-003", name: "Sunita Rao",    city: "Noida",     vendors: 64,  bookings: 841,  revenue: 1020000, disputes: 21, resolution: 91, score: 84, trend: "flat" },
  { rank: 4, agentId: "AGT-004", name: "Amit Tiwari",   city: "Lucknow",   vendors: 48,  bookings: 628,  revenue: 780000,  disputes: 17, resolution: 88, score: 76, trend: "down" },
  { rank: 5, agentId: "AGT-005", name: "Deepak Mishra", city: "Kanpur",    vendors: 32,  bookings: 412,  revenue: 480000,  disputes: 9,  resolution: 78, score: 62, trend: "down" },
];

// ─── 13. Category Trend (6 months bookings per category) ──────────────────────
export interface CategoryTrendPoint {
  month:          string;
  acService:      number;
  cleaning:       number;
  plumbing:       number;
  electrical:     number;
  pestControl:    number;
  painting:       number;
}

export const CATEGORY_TREND: CategoryTrendPoint[] = [
  { month: "Sep 25", acService: 620, cleaning: 840, plumbing: 720, electrical: 580, pestControl: 380, painting: 180 },
  { month: "Oct 25", acService: 680, cleaning: 920, plumbing: 780, electrical: 640, pestControl: 420, painting: 210 },
  { month: "Nov 25", acService: 740, cleaning: 980, plumbing: 840, electrical: 700, pestControl: 480, painting: 240 },
  { month: "Dec 25", acService: 820, cleaning: 1040,plumbing: 900, electrical: 760, pestControl: 540, painting: 280 },
  { month: "Jan 26", acService: 780, cleaning: 980, plumbing: 860, electrical: 720, pestControl: 500, painting: 260 },
  { month: "Feb 26", acService: 892, cleaning: 1124,plumbing: 986, electrical: 842, pestControl: 624, painting: 312 },
];

// ─── 14. Key Alerts / Insights for Analytics ─────────────────────────────────
export interface AnalyticsInsight {
  id:       string;
  type:     "opportunity" | "warning" | "achievement" | "info";
  title:    string;
  body:     string;
  metric:   string;
  change:   string;
  icon:     string;
}

export const ANALYTICS_INSIGHTS: AnalyticsInsight[] = [
  { id: "INS001", type: "achievement", title: "Best Month Ever",          body: "Feb 2026 hit ₹54.8L gross revenue — highest in platform history.",  metric: "₹54.8L", change: "+13.2% MoM", icon: "🏆" },
  { id: "INS002", type: "opportunity", title: "Kanpur Growing Fast",      body: "56.8% growth in Kanpur. Onboard more vendors to meet demand.",       metric: "+56.8%", change: "vs last month",icon: "🚀" },
  { id: "INS003", type: "warning",     title: "AOV Slightly Down",        body: "Avg order value dropped ₹15 MoM. Review discount campaigns.",        metric: "₹1,271", change: "−1.2% MoM",   icon: "⚠️" },
  { id: "INS004", type: "achievement", title: "Dispute Rate Record Low",  body: "Dispute rate at 1.6% — lowest ever. Vendor quality improving.",      metric: "1.6%",   change: "−23.8% MoM",  icon: "✅" },
  { id: "INS005", type: "opportunity", title: "Weekend Demand Untapped",  body: "Saturday 3PM slots have 92/100 demand score but 18% vendor gap.",    metric: "92/100", change: "demand score", icon: "📅" },
  { id: "INS006", type: "info",        title: "NPS at All-Time High",     body: "Net Promoter Score reached +52 in Feb, up from +46 in Jan.",         metric: "+52",    change: "+6 pts MoM",   icon: "😊" },
];

// ─── Disputes ─────────────────────────────────────────────────────────────────

export type DisputeStatus  = "open" | "under_review" | "escalated" | "resolved";
export type DisputeVerdict = "favor_customer" | "favor_vendor" | "partial_refund" | "no_action" | null;

export interface DisputeMessage {
  id:           string;
  from:         "customer" | "vendor" | "admin";
  name:         string;
  text:         string;
  time:         string;
  attachments?: string[];
}

export interface AdminDispute {
  id:              string;
  bookingId:       string;
  service:         string;
  serviceIcon:     string;
  category:        string;
  city:            string;
  customerName:    string;
  customerId:      string;
  customerPhone:   string;
  vendorName:      string;
  vendorId:        string;
  vendorPhone:     string;
  jobAmount:       number;
  refundRequested: number;
  refundIssued:    number;
  status:          DisputeStatus;
  verdict:         DisputeVerdict;
  verdictNote:     string;
  raisedBy:        "customer" | "vendor";
  raisedOn:        string;
  lastUpdated:     string;
  assignedTo:      string;
  reason:          string;
  description:     string;
  messages:        DisputeMessage[];
}

export const ADMIN_DISPUTES: AdminDispute[] = [
  {
    id: "D001", bookingId: "BK-2602-0035",
    service: "TV Wall Mounting + Wiring", serviceIcon: "📺", category: "Electrical", city: "Ghaziabad",
    customerName: "Amit Sharma",         customerId: "CUS-0001", customerPhone: "+91 98765 43210",
    vendorName:   "SparkFix Electrical", vendorId:   "VND-2601-0003", vendorPhone: "+91 76543 21098",
    jobAmount: 950, refundRequested: 950, refundIssued: 0,
    status: "escalated", verdict: null, verdictNote: "",
    raisedBy: "customer", raisedOn: "25 Feb 2026", lastUpdated: "28 Feb 2026",
    assignedTo: "Priya Sharma",
    reason: "Work not completed",
    description: "Vendor took full payment but left mid-job. TV is still not mounted and wires are left exposed. Vendor is not responding to calls since 3 days.",
    messages: [
      { id: "M1", from: "customer", name: "Amit Sharma",          text: "Vendor took full payment but left without completing the work. TV wires are still hanging loose.", time: "25 Feb, 11:00 AM" },
      { id: "M2", from: "vendor",   name: "SparkFix Electrical",  text: "I had a family emergency and had to leave. I was planning to return the next morning.", time: "25 Feb, 2:00 PM" },
      { id: "M3", from: "customer", name: "Amit Sharma",          text: "It has been 3 days now. He has not returned or picked up any calls. This is unacceptable.", time: "28 Feb, 9:00 AM" },
      { id: "M4", from: "admin",    name: "Priya Sharma (Agent)", text: "Reviewed the case. Vendor response is unsatisfactory. Escalating to senior admin for final verdict.", time: "28 Feb, 11:00 AM" },
    ],
  },
  {
    id: "D002", bookingId: "BK-2602-0019",
    service: "AC Gas Refill", serviceIcon: "❄️", category: "AC Service", city: "Delhi",
    customerName: "Pooja Mehta",   customerId: "CUS-0002", customerPhone: "+91 87654 32109",
    vendorName:   "CoolBreeze AC", vendorId:   "VND-2601-0002", vendorPhone: "+91 87654 32109",
    jobAmount: 3200, refundRequested: 1600, refundIssued: 0,
    status: "under_review", verdict: null, verdictNote: "",
    raisedBy: "customer", raisedOn: "22 Feb 2026", lastUpdated: "27 Feb 2026",
    assignedTo: "Rohit Verma",
    reason: "AC not cooling after service",
    description: "Paid ₹3200 for gas refill but AC is still not cooling. Vendor says gas was filled correctly but the issue persists. Requesting partial refund of ₹1600.",
    messages: [
      { id: "M1", from: "customer", name: "Pooja Mehta",          text: "Paid ₹3200 for AC gas refill but AC is still not cooling at all. Very disappointed.", time: "22 Feb, 3:00 PM" },
      { id: "M2", from: "vendor",   name: "CoolBreeze AC",        text: "Gas was properly filled. The issue might be with the compressor which is a completely separate problem.", time: "23 Feb, 10:00 AM" },
      { id: "M3", from: "customer", name: "Pooja Mehta",          text: "I got the compressor checked by another technician — it is perfectly fine. Gas was not filled properly.", time: "24 Feb, 5:00 PM" },
      { id: "M4", from: "admin",    name: "Rohit Verma (Agent)",  text: "Case under review. Requesting technical inspection from both parties before giving verdict.", time: "27 Feb, 12:00 PM" },
    ],
  },
  {
    id: "D003", bookingId: "BK-2602-0041",
    service: "Pipe Leak Fix", serviceIcon: "🔧", category: "Plumbing", city: "Noida",
    customerName: "Rahul Sinha",         customerId: "CUS-0003", customerPhone: "+91 76543 21098",
    vendorName:   "Kumar Home Services", vendorId:   "VND-2601-0001", vendorPhone: "+91 98765 43210",
    jobAmount: 1200, refundRequested: 1200, refundIssued: 1200,
    status: "resolved", verdict: "favor_customer", verdictNote: "Vendor acknowledged the incomplete repair. Leak recurred within 24 hours causing ceiling damage. Full refund approved.",
    raisedBy: "customer", raisedOn: "20 Feb 2026", lastUpdated: "26 Feb 2026",
    assignedTo: "Sunita Rao",
    reason: "Repair failed, property damage",
    description: "Vendor fixed the pipe but it started leaking again within 24 hours causing water damage to the ceiling below.",
    messages: [
      { id: "M1", from: "customer", name: "Rahul Sinha",         text: "Vendor fixed the pipe but it started leaking again the very next day. Caused water damage to my ceiling.", time: "20 Feb, 8:00 AM" },
      { id: "M2", from: "vendor",   name: "Kumar Home Services", text: "The fix was done correctly but the pipe material itself is very old and weak. This is not our fault.", time: "21 Feb, 11:00 AM" },
      { id: "M3", from: "admin",    name: "Sunita Rao (Agent)",  text: "Vendor has acknowledged the issue. Given the property damage caused, full refund of ₹1,200 approved.", time: "26 Feb, 2:00 PM" },
    ],
  },
  {
    id: "D004", bookingId: "BK-2602-0028",
    service: "Furniture Repair", serviceIcon: "🪚", category: "Carpentry", city: "Lucknow",
    customerName: "Kavita Joshi", customerId: "CUS-0005", customerPhone: "+91 54321 09876",
    vendorName:   "HandyMan Co.", vendorId:   "VND-2601-0006", vendorPhone: "+91 43210 98765",
    jobAmount: 650, refundRequested: 650, refundIssued: 0,
    status: "open", verdict: null, verdictNote: "",
    raisedBy: "customer", raisedOn: "28 Feb 2026", lastUpdated: "28 Feb 2026",
    assignedTo: "Unassigned",
    reason: "Damage caused during service",
    description: "Vendor scratched my expensive wooden dining table while doing the repair work. The table cost ₹12,000 and now has a deep visible scratch.",
    messages: [
      { id: "M1", from: "customer", name: "Kavita Joshi", text: "Vendor scratched my expensive dining table while doing the repair. Demanding full refund of the service amount.", time: "28 Feb, 4:00 PM" },
    ],
  },
  {
    id: "D005", bookingId: "BK-2602-0052",
    service: "Deep Home Cleaning", serviceIcon: "🧹", category: "Cleaning", city: "Ghaziabad",
    customerName: "Ritu Agarwal",      customerId: "CUS-0008", customerPhone: "+91 21098 76543",
    vendorName:   "CleanPro Services", vendorId:   "VND-2601-0004", vendorPhone: "+91 65432 10987",
    jobAmount: 2800, refundRequested: 800, refundIssued: 800,
    status: "resolved", verdict: "partial_refund", verdictNote: "Cleaning was mostly complete but both bathrooms were skipped. Partial refund of ₹800 for missed work approved.",
    raisedBy: "customer", raisedOn: "18 Feb 2026", lastUpdated: "22 Feb 2026",
    assignedTo: "Priya Sharma",
    reason: "Incomplete service",
    description: "The cleaning team did most areas well but completely skipped both bathrooms which were included in the ₹2800 deep clean package.",
    messages: [
      { id: "M1", from: "customer", name: "Ritu Agarwal",         text: "Team skipped both bathrooms. This was included in the ₹2800 deep clean package. Need refund.", time: "18 Feb, 6:00 PM" },
      { id: "M2", from: "vendor",   name: "CleanPro Services",    text: "Sorry for the inconvenience. Team ran out of time. We can come back tomorrow to do the bathrooms.", time: "19 Feb, 9:00 AM" },
      { id: "M3", from: "customer", name: "Ritu Agarwal",         text: "I don't want a revisit. I want a refund for the skipped bathrooms.", time: "19 Feb, 11:00 AM" },
      { id: "M4", from: "admin",    name: "Priya Sharma (Agent)", text: "Partial refund of ₹800 approved for two skipped bathrooms. Amount deducted from CleanPro's next payout.", time: "22 Feb, 3:00 PM" },
    ],
  },
  {
    id: "D006", bookingId: "BK-2602-0061",
    service: "House Painting (2 BHK)", serviceIcon: "🎨", category: "Painting", city: "Noida",
    customerName: "Deepak Malhotra",     customerId: "CUS-0007", customerPhone: "+91 32109 87654",
    vendorName:   "ColorCraft Painters", vendorId:   "VND-2601-0008", vendorPhone: "+91 65432 10987",
    jobAmount: 12400, refundRequested: 4000, refundIssued: 0,
    status: "under_review", verdict: null, verdictNote: "",
    raisedBy: "customer", raisedOn: "26 Feb 2026", lastUpdated: "28 Feb 2026",
    assignedTo: "Rohit Verma",
    reason: "Wrong shade, poor quality paint",
    description: "Vendor used a completely different shade than what was agreed. Paint quality appears low grade — already peeling in one corner after just 2 days.",
    messages: [
      { id: "M1", from: "customer", name: "Deepak Malhotra",      text: "Vendor used the wrong shade and paint is already peeling after just 2 days. Absolutely terrible work!", time: "26 Feb, 7:00 PM" },
      { id: "M2", from: "vendor",   name: "ColorCraft Painters",  text: "The shade selected was from our standard catalogue. Peeling is due to existing wall dampness — not our paint.", time: "27 Feb, 10:00 AM" },
      { id: "M3", from: "customer", name: "Deepak Malhotra",      text: "I have photos clearly showing the shade mismatch and paint peeling from a dry wall. Attaching proof.", time: "27 Feb, 1:00 PM", attachments: ["shade_mismatch.jpg", "peeling_paint.jpg"] },
      { id: "M4", from: "admin",    name: "Rohit Verma (Agent)",  text: "Reviewing photo evidence. Will give final verdict within 48 hours.", time: "28 Feb, 11:00 AM" },
    ],
  },
  {
    id: "D007", bookingId: "BK-2602-0077",
    service: "Pest Control (2 BHK)", serviceIcon: "🐛", category: "Pest Control", city: "Kanpur",
    customerName: "Sunita Rao",    customerId: "CUS-0004", customerPhone: "+91 65432 10987",
    vendorName:   "PestGuard Pro", vendorId:   "VND-2601-0007", vendorPhone: "+91 32109 87654",
    jobAmount: 2200, refundRequested: 0, refundIssued: 0,
    status: "resolved", verdict: "favor_vendor", verdictNote: "Customer raised dispute without merit. Pest control treatment takes 48–72 hours to take full effect. Vendor not at fault.",
    raisedBy: "customer", raisedOn: "15 Feb 2026", lastUpdated: "18 Feb 2026",
    assignedTo: "Amit Tiwari",
    reason: "No visible effect after treatment",
    description: "Got pest control done but still seeing cockroaches the very next day. Vendor says it takes time but customer is not satisfied.",
    messages: [
      { id: "M1", from: "customer", name: "Sunita Rao",           text: "Got pest control done yesterday but still seeing cockroaches today. What was the point of spending ₹2200?", time: "15 Feb, 9:00 AM" },
      { id: "M2", from: "vendor",   name: "PestGuard Pro",        text: "This is completely normal. Our chemicals require 48–72 hours to fully eliminate all pests. Please wait.", time: "15 Feb, 11:00 AM" },
      { id: "M3", from: "admin",    name: "Amit Tiwari (Agent)",  text: "Vendor's explanation is technically accurate. Closing dispute in vendor's favor. No refund issued.", time: "18 Feb, 2:00 PM" },
    ],
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotifCategory =
  | "dispute"
  | "vendor"
  | "payout"
  | "booking"
  | "customer"
  | "system"
  | "agent"
  | "city";

export type NotifPriority = "urgent" | "high" | "normal" | "low";
export type NotifStatus   = "unread" | "read" | "archived";

export interface AdminNotification {
  id:          string;
  category:    NotifCategory;
  priority:    NotifPriority;
  status:      NotifStatus;
  icon:        string;
  title:       string;
  body:        string;
  meta:        string;          // e.g. "BK-2602-0035 · Ghaziabad"
  time:        string;          // relative display  "2 min ago"
  timestamp:   string;          // ISO-like for sorting "2026-02-28T11:30"
  actionLabel?: string;
  actionTab?:   string;         // which admin tab to navigate to
  refId?:       string;         // bookingId / vendorId / disputeId etc.
}

export const ADMIN_NOTIFICATIONS: AdminNotification[] = [
  // ── Urgent ────────────────────────────────────────────────────────────────
  {
    id: "N001", category: "dispute", priority: "urgent", status: "unread",
    icon: "⚖️", title: "Escalated Dispute Needs Verdict",
    body: "Dispute D001 (TV Wall Mounting, Ghaziabad) has been escalated by agent Priya Sharma. Amit Sharma vs SparkFix Electrical — ₹950 at stake. Senior admin verdict required immediately.",
    meta: "BK-2602-0035 · Ghaziabad", time: "12 min ago", timestamp: "2026-02-28T11:30",
    actionLabel: "Resolve Now", actionTab: "disputes", refId: "D001",
  },
  {
    id: "N002", category: "vendor", priority: "urgent", status: "unread",
    icon: "🚨", title: "Vendor Account Suspended — Action Required",
    body: "QuickFix Services (Kanpur) has received 3 consecutive 1-star reviews and has a dispute rate of 18.4% this month. Account has been auto-flagged. Manual review and action needed.",
    meta: "VND-2601-0007 · Kanpur", time: "34 min ago", timestamp: "2026-02-28T11:08",
    actionLabel: "Review Vendor", actionTab: "vendors", refId: "VND-2601-0007",
  },
  {
    id: "N003", category: "payout", priority: "urgent", status: "unread",
    icon: "💸", title: "Bulk Payout Approval Needed — ₹3.12L Pending",
    body: "14 vendor payouts totalling ₹3,12,000 are awaiting admin approval. Oldest request is 6 days old. Vendors may escalate if not processed today.",
    meta: "14 vendors · Feb settlement", time: "1 hr ago", timestamp: "2026-02-28T10:42",
    actionLabel: "Approve Payouts", actionTab: "payouts", refId: undefined,
  },

  // ── High ──────────────────────────────────────────────────────────────────
  {
    id: "N004", category: "vendor", priority: "high", status: "unread",
    icon: "✅", title: "New Vendor KYC Submitted — Pending Approval",
    body: "HomeCare Solutions (Noida) has submitted complete KYC documents including Aadhaar, PAN and address proof. 3 other vendors also have pending KYC in queue.",
    meta: "VND-2601-0014 · Noida", time: "2 hr ago", timestamp: "2026-02-28T09:55",
    actionLabel: "Review KYC", actionTab: "vendors", refId: "VND-2601-0014",
  },
  {
    id: "N005", category: "booking", priority: "high", status: "unread",
    icon: "📋", title: "Unusual Cancellation Spike — Delhi",
    body: "Delhi has seen 34 cancellations in the last 4 hours — 3.2× above the daily average. Most cancellations are in the Cleaning category. Possible vendor shortage or quality issue.",
    meta: "Delhi · Cleaning · 4hr window", time: "3 hr ago", timestamp: "2026-02-28T08:48",
    actionLabel: "View Analytics", actionTab: "analytics", refId: undefined,
  },
  {
    id: "N006", category: "agent", priority: "high", status: "unread",
    icon: "👤", title: "New Agent Registration — Varanasi",
    body: "Meena Pandey has reactivated her agent account in Varanasi after 2 months of inactivity. She has 0 active vendors. Needs follow-up to onboard vendors in her city.",
    meta: "AGT-006 · Varanasi", time: "4 hr ago", timestamp: "2026-02-28T07:30",
    actionLabel: "View Agent", actionTab: "agents", refId: "AGT-006",
  },
  {
    id: "N007", category: "payout", priority: "high", status: "read",
    icon: "💰", title: "Payout Released — ColorCraft Painters",
    body: "₹74,400 payout has been successfully released to ColorCraft Painters (Noida) for the January 2026 settlement period covering 184 jobs.",
    meta: "VND-2601-0004 · Noida · Jan 26", time: "5 hr ago", timestamp: "2026-02-28T06:20",
    actionLabel: "View Payouts", actionTab: "payouts", refId: undefined,
  },

  // ── Normal ────────────────────────────────────────────────────────────────
  {
    id: "N008", category: "customer", priority: "normal", status: "unread",
    icon: "⭐", title: "Platform NPS Reached All-Time High",
    body: "February 2026 NPS score is +52, up from +46 in January. 1,342 customers responded. Promoters are at 68% — highest since platform launch.",
    meta: "1,342 responses · Feb 2026", time: "6 hr ago", timestamp: "2026-02-28T05:40",
    actionLabel: "View Satisfaction", actionTab: "analytics", refId: undefined,
  },
  {
    id: "N009", category: "booking", priority: "normal", status: "read",
    icon: "🎉", title: "Monthly Booking Record Broken",
    body: "February 2026 closed with 4,312 total bookings — the highest single month in platform history, surpassing December 2025 (3,980). Gross revenue: ₹54.8L.",
    meta: "4,312 bookings · ₹54.8L revenue", time: "8 hr ago", timestamp: "2026-02-28T03:30",
    actionLabel: "View Analytics", actionTab: "analytics", refId: undefined,
  },
  {
    id: "N010", category: "dispute", priority: "normal", status: "read",
    icon: "✅", title: "Dispute Resolved — Pipe Leak Fix",
    body: "Dispute D003 resolved in customer's favor. Full refund of ₹1,200 issued to Rahul Sinha. Kumar Home Services' payout has been adjusted accordingly.",
    meta: "BK-2602-0041 · Noida", time: "10 hr ago", timestamp: "2026-02-28T01:48",
    actionLabel: "View Dispute", actionTab: "disputes", refId: "D003",
  },
  {
    id: "N011", category: "city", priority: "normal", status: "unread",
    icon: "🏙️", title: "Kanpur Hitting 56.8% Growth — Vendor Gap",
    body: "Kanpur is the fastest growing city at 56.8% MoM but only has 32 active vendors. Saturday afternoon slots are near capacity. Recommend urgent vendor onboarding.",
    meta: "Kanpur · 32 vendors · 412 bookings", time: "Yesterday", timestamp: "2026-02-27T18:00",
    actionLabel: "View Cities", actionTab: "cities", refId: undefined,
  },
  {
    id: "N012", category: "vendor", priority: "normal", status: "read",
    icon: "🏪", title: "28 New Vendors Onboarded — February",
    body: "February saw 28 new vendor registrations across all cities — 27.3% above January (22). Ghaziabad and Delhi account for 18 of the new onboardings.",
    meta: "28 vendors · Feb 2026", time: "Yesterday", timestamp: "2026-02-27T12:00",
    actionLabel: "View Vendors", actionTab: "vendors", refId: undefined,
  },
  {
    id: "N013", category: "system", priority: "normal", status: "read",
    icon: "🔒", title: "GST Filing Due — February 2026",
    body: "GST filing for February 2026 is pending. Taxable amount: ₹10,96,000. CGST + SGST: ₹1,97,280. Due date is approaching. Please file via the Finance section.",
    meta: "₹1,97,280 GST due · Feb 2026", time: "Yesterday", timestamp: "2026-02-27T09:00",
    actionLabel: "View Finance", actionTab: "finance", refId: undefined,
  },

  // ── Low ───────────────────────────────────────────────────────────────────
  {
    id: "N014", category: "system", priority: "low", status: "read",
    icon: "📊", title: "Weekly Performance Report Ready",
    body: "Your weekly summary for Feb 22–28 is ready. 1,024 bookings, ₹12.4L revenue, 87 new customers, 6 disputes opened. Full report available in Analytics.",
    meta: "Feb 22–28, 2026", time: "2 days ago", timestamp: "2026-02-26T08:00",
    actionLabel: "View Report", actionTab: "analytics", refId: undefined,
  },
  {
    id: "N015", category: "agent", priority: "low", status: "archived",
    icon: "🏆", title: "Agent Leaderboard Updated",
    body: "Rohit Verma (Delhi) leads this month with a composite score of 96/100. Priya Sharma (Ghaziabad) is second at 92. Both have shown improvement from last month.",
    meta: "Monthly leaderboard · Feb 2026", time: "2 days ago", timestamp: "2026-02-26T07:00",
    actionLabel: "View Agents", actionTab: "agents", refId: undefined,
  },
  {
    id: "N016", category: "customer", priority: "low", status: "archived",
    icon: "👥", title: "584 New Customers Joined in February",
    body: "February saw 584 new customer registrations — 17.7% above January (496). Delhi contributed the most with 184 new signups followed by Ghaziabad with 142.",
    meta: "584 new users · Feb 2026", time: "3 days ago", timestamp: "2026-02-25T10:00",
    actionLabel: "View Users", actionTab: "users", refId: undefined,
  },
  {
    id: "N017", category: "booking", priority: "low", status: "archived",
    icon: "📅", title: "Weekend Peak Alert — Saturday Slots Near Full",
    body: "This Saturday saw 824 bookings — 18% above the previous Saturday. Vendors in Delhi and Ghaziabad reported 100% slot utilisation between 10AM–4PM.",
    meta: "Saturday 28 Feb · 824 bookings", time: "3 days ago", timestamp: "2026-02-25T08:00",
    actionLabel: "View Demand", actionTab: "analytics", refId: undefined,
  },
  {
    id: "N018", category: "payout", priority: "low", status: "archived",
    icon: "📑", title: "January 2026 Payout Cycle Completed",
    body: "All January payouts have been settled. Total disbursed: ₹38.72L across 248 active vendors. Commission collected: ₹7.74L. No outstanding disputes for the period.",
    meta: "₹38.72L disbursed · Jan 2026", time: "4 days ago", timestamp: "2026-02-24T16:00",
    actionLabel: "View Finance", actionTab: "finance", refId: undefined,
  },
];
// ═══════════════════════════════════════════════════════════════════════════════
// ─── SETTINGS PAGE DATA ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Admin Profile ────────────────────────────────────────────────────────────
export interface AdminProfile {
  id:           string;
  fullName:     string;
  email:        string;
  phone:        string;
  role:         string;
  joinedDate:   string;
  lastLogin:    string;
  lastLoginIP:  string;
  twoFAEnabled: boolean;
  timezone:     string;
  language:     string;
}

export const ADMIN_PROFILE: AdminProfile = {
  id:           "ADM-001",
  fullName:     "Rajesh Gupta",
  email:        "rajesh.gupta@addies.in",
  phone:        "+91 98000 00001",
  role:         "Super Admin",
  joinedDate:   "Dec 2024",
  lastLogin:    "28 Feb 2026, 09:14 AM",
  lastLoginIP:  "103.27.12.84",
  twoFAEnabled: true,
  timezone:     "Asia/Kolkata",
  language:     "English",
};

// ─── Platform Configuration ───────────────────────────────────────────────────
export interface PlatformConfig {
  appName:            string;
  tagline:            string;
  supportEmail:       string;
  supportPhone:       string;
  platformFeeRate:    number;
  gstRate:            number;
  currency:           string;
  currencySymbol:     string;
  timezone:           string;
  dateFormat:         string;
  maintenanceMode:    boolean;
  vendorAutoApprove:  boolean;
  newCityRequests:    boolean;
  maxBookingsPerSlot: number;
  minBookingAdvance:  number;
  cancellationWindow: number;
  refundWindow:       number;
  termsVersion:       string;
  privacyVersion:     string;
  lastUpdated:        string;
  updatedBy:          string;
}

export const PLATFORM_CONFIG: PlatformConfig = {
  appName:            "ADDies ServiceHub",
  tagline:            "India's Most Trusted Home Services",
  supportEmail:       "support@addies.in",
  supportPhone:       "+91 1800-XXX-XXXX",
  platformFeeRate:    20,
  gstRate:            18,
  currency:           "INR",
  currencySymbol:     "₹",
  timezone:           "Asia/Kolkata",
  dateFormat:         "DD MMM YYYY",
  maintenanceMode:    false,
  vendorAutoApprove:  false,
  newCityRequests:    true,
  maxBookingsPerSlot: 3,
  minBookingAdvance:  2,
  cancellationWindow: 4,
  refundWindow:       7,
  termsVersion:       "v2.4 (Jan 2026)",
  privacyVersion:     "v1.8 (Dec 2025)",
  lastUpdated:        "15 Feb 2026",
  updatedBy:          "Rajesh Gupta",
};

// ─── Commission Tiers ─────────────────────────────────────────────────────────
export interface CommissionTier {
  id:          string;
  label:       string;
  minLeads:    number;
  maxLeads:    number | null;
  rate:        number;
  bonusRate:   number;
  description: string;
}

export const COMMISSION_TIERS: CommissionTier[] = [
  { id: "CT001", label: "Starter", minLeads: 0,   maxLeads: 49,   rate: 4, bonusRate: 0,   description: "New agents in first 3 months"       },
  { id: "CT002", label: "Bronze",  minLeads: 50,  maxLeads: 149,  rate: 5, bonusRate: 0.5, description: "Agents handling 50–149 leads/month"  },
  { id: "CT003", label: "Silver",  minLeads: 150, maxLeads: 299,  rate: 6, bonusRate: 0.5, description: "High-performing agents"              },
  { id: "CT004", label: "Gold",    minLeads: 300, maxLeads: null, rate: 7, bonusRate: 1,   description: "Top agents — unlimited leads"        },
];

export interface CommissionConfig {
  baseCalcOn:      "gross_revenue" | "net_revenue" | "platform_fee";
  payoutCycle:     "weekly" | "biweekly" | "monthly";
  payoutDay:       string;
  holdPeriod:      number;
  minPayout:       number;
  penaltyRate:     number;
  disputeHoldDays: number;
}

export const COMMISSION_CONFIG: CommissionConfig = {
  baseCalcOn:      "gross_revenue",
  payoutCycle:     "monthly",
  payoutDay:       "1st of month",
  holdPeriod:      7,
  minPayout:       500,
  penaltyRate:     10,
  disputeHoldDays: 14,
};

// ─── Payout Config ────────────────────────────────────────────────────────────
export interface PayoutConfig {
  vendorCycle:           "weekly" | "biweekly" | "monthly";
  vendorPayoutDay:       string;
  minVendorPayout:       number;
  autoRelease:           boolean;
  holdAfterBooking:      number;
  upiEnabled:            boolean;
  bankEnabled:           boolean;
  walletEnabled:         boolean;
  maxPayoutPerTxn:       number;
  requireVerification:   boolean;
  verificationThreshold: number;
}

export const PAYOUT_CONFIG: PayoutConfig = {
  vendorCycle:           "weekly",
  vendorPayoutDay:       "Friday",
  minVendorPayout:       200,
  autoRelease:           false,
  holdAfterBooking:      24,
  upiEnabled:            true,
  bankEnabled:           true,
  walletEnabled:         false,
  maxPayoutPerTxn:       500000,
  requireVerification:   true,
  verificationThreshold: 50000,
};

// ─── Notification Preferences ────────────────────────────────────────────────
export interface NotifPreference {
  id:       string;
  category: string;
  label:    string;
  email:    boolean;
  sms:      boolean;
  push:     boolean;
  inApp:    boolean;
}

export const NOTIF_PREFERENCES: NotifPreference[] = [
  { id: "NP001", category: "Finance",   label: "New booking payment received",   email: true,  sms: false, push: true,  inApp: true  },
  { id: "NP002", category: "Finance",   label: "Payout released to vendor",      email: true,  sms: false, push: true,  inApp: true  },
  { id: "NP003", category: "Finance",   label: "Refund issued",                  email: true,  sms: true,  push: true,  inApp: true  },
  { id: "NP004", category: "Finance",   label: "GST filing due reminder",        email: true,  sms: true,  push: false, inApp: true  },
  { id: "NP005", category: "Vendors",   label: "New vendor registration",        email: false, sms: false, push: true,  inApp: true  },
  { id: "NP006", category: "Vendors",   label: "Vendor KYC document uploaded",   email: true,  sms: false, push: true,  inApp: true  },
  { id: "NP007", category: "Vendors",   label: "Vendor subscription renewal",    email: true,  sms: false, push: false, inApp: true  },
  { id: "NP008", category: "Disputes",  label: "New dispute raised",             email: true,  sms: true,  push: true,  inApp: true  },
  { id: "NP009", category: "Disputes",  label: "Dispute escalated",              email: true,  sms: true,  push: true,  inApp: true  },
  { id: "NP010", category: "Disputes",  label: "Dispute resolved",               email: false, sms: false, push: true,  inApp: true  },
  { id: "NP011", category: "System",    label: "Daily performance digest",       email: true,  sms: false, push: false, inApp: false },
  { id: "NP012", category: "System",    label: "Weekly revenue report",          email: true,  sms: false, push: false, inApp: false },
  { id: "NP013", category: "System",    label: "System maintenance alerts",      email: true,  sms: true,  push: true,  inApp: true  },
  { id: "NP014", category: "System",    label: "Login from new device/location", email: true,  sms: true,  push: true,  inApp: true  },
  { id: "NP015", category: "Agents",    label: "Agent commission credited",      email: true,  sms: false, push: false, inApp: true  },
  { id: "NP016", category: "Agents",    label: "Agent performance alert (low)",  email: true,  sms: false, push: true,  inApp: true  },
];

// ─── Security — Login History ─────────────────────────────────────────────────
export interface LoginEvent {
  id:       string;
  date:     string;
  time:     string;
  ip:       string;
  device:   string;
  browser:  string;
  location: string;
  status:   "success" | "failed" | "blocked";
}

export const LOGIN_HISTORY: LoginEvent[] = [
  { id: "LH001", date: "28 Feb 2026", time: "09:14 AM", ip: "103.27.12.84",  device: "Desktop", browser: "Chrome 122",  location: "Ghaziabad, UP", status: "success" },
  { id: "LH002", date: "27 Feb 2026", time: "11:42 PM", ip: "103.27.12.84",  device: "Desktop", browser: "Chrome 122",  location: "Ghaziabad, UP", status: "success" },
  { id: "LH003", date: "27 Feb 2026", time: "06:18 PM", ip: "49.204.88.12",  device: "Mobile",  browser: "Safari iOS",  location: "Delhi, DL",     status: "success" },
  { id: "LH004", date: "26 Feb 2026", time: "10:05 AM", ip: "182.64.44.21",  device: "Desktop", browser: "Chrome 122",  location: "Noida, UP",     status: "success" },
  { id: "LH005", date: "26 Feb 2026", time: "02:34 AM", ip: "45.128.219.4",  device: "Unknown", browser: "Unknown",     location: "Mumbai, MH",    status: "failed"  },
  { id: "LH006", date: "25 Feb 2026", time: "08:50 AM", ip: "103.27.12.84",  device: "Desktop", browser: "Chrome 122",  location: "Ghaziabad, UP", status: "success" },
  { id: "LH007", date: "24 Feb 2026", time: "11:19 PM", ip: "223.190.12.64", device: "Unknown", browser: "Firefox 124", location: "Lucknow, UP",   status: "blocked" },
  { id: "LH008", date: "24 Feb 2026", time: "09:00 AM", ip: "103.27.12.84",  device: "Desktop", browser: "Edge 122",    location: "Ghaziabad, UP", status: "success" },
];

// ─── IP Whitelist ─────────────────────────────────────────────────────────────
export interface IPWhitelistEntry {
  id:        string;
  ip:        string;
  label:     string;
  addedDate: string;
  addedBy:   string;
  active:    boolean;
}

export const IP_WHITELIST: IPWhitelistEntry[] = [
  { id: "IP001", ip: "103.27.12.84",  label: "Office — Ghaziabad HQ", addedDate: "01 Dec 2024", addedBy: "Rajesh Gupta", active: true  },
  { id: "IP002", ip: "49.204.88.12",  label: "Home — Delhi",          addedDate: "15 Jan 2025", addedBy: "Rajesh Gupta", active: true  },
  { id: "IP003", ip: "182.64.44.21",  label: "Noida Branch Office",   addedDate: "10 Mar 2025", addedBy: "Rajesh Gupta", active: true  },
  { id: "IP004", ip: "103.41.56.200", label: "VPN — Work from Home",  addedDate: "20 Jun 2025", addedBy: "Rajesh Gupta", active: false },
];

// ─── Roles & Permissions ──────────────────────────────────────────────────────
export type Permission =
  | "view_finance"        | "edit_finance"
  | "manage_vendors"      | "approve_vendors"
  | "manage_agents"       | "manage_customers"
  | "manage_cities"       | "manage_categories"
  | "manage_disputes"     | "resolve_disputes"
  | "process_payouts"     | "view_analytics"
  | "manage_subscriptions"| "send_notifications"
  | "edit_settings"       | "manage_roles"
  | "view_audit_log"      | "export_data";

export interface AdminRole {
  id:          string;
  name:        string;
  description: string;
  color:       string;
  permissions: Permission[];
  memberCount: number;
  isSystem:    boolean;
  createdDate: string;
}

export const ADMIN_ROLES: AdminRole[] = [
  {
    id: "ROLE001", name: "Super Admin", color: "sky", isSystem: true, memberCount: 1, createdDate: "01 Dec 2024",
    description: "Full access to all platform features and settings",
    permissions: [
      "view_finance","edit_finance","manage_vendors","approve_vendors","manage_agents",
      "manage_customers","manage_cities","manage_categories","manage_disputes","resolve_disputes",
      "process_payouts","view_analytics","manage_subscriptions","send_notifications",
      "edit_settings","manage_roles","view_audit_log","export_data",
    ],
  },
  {
    id: "ROLE002", name: "Finance Manager", color: "violet", isSystem: false, memberCount: 2, createdDate: "15 Jan 2025",
    description: "Access to Finance, Payouts, Subscriptions and GST",
    permissions: ["view_finance","edit_finance","process_payouts","manage_subscriptions","view_analytics","export_data"],
  },
  {
    id: "ROLE003", name: "Operations Manager", color: "emerald", isSystem: false, memberCount: 3, createdDate: "15 Jan 2025",
    description: "Vendor onboarding, city ops, disputes and agents",
    permissions: ["manage_vendors","approve_vendors","manage_agents","manage_cities","manage_categories","manage_disputes","resolve_disputes","view_analytics"],
  },
  {
    id: "ROLE004", name: "Support Executive", color: "amber", isSystem: false, memberCount: 5, createdDate: "01 Mar 2025",
    description: "Customer support, disputes and notifications only",
    permissions: ["manage_customers","manage_disputes","resolve_disputes","send_notifications"],
  },
  {
    id: "ROLE005", name: "Viewer", color: "slate", isSystem: false, memberCount: 4, createdDate: "01 Jun 2025",
    description: "Read-only access — analytics and reports",
    permissions: ["view_finance","view_analytics","view_audit_log"],
  },
];

// All available permissions with labels
export const ALL_PERMISSIONS: { key: Permission; label: string; category: string }[] = [
  { key: "view_finance",        label: "View Finance",          category: "Finance"       },
  { key: "edit_finance",        label: "Edit Finance",          category: "Finance"       },
  { key: "process_payouts",     label: "Process Payouts",       category: "Finance"       },
  { key: "manage_vendors",      label: "Manage Vendors",        category: "Platform"      },
  { key: "approve_vendors",     label: "Approve Vendors",       category: "Platform"      },
  { key: "manage_categories",   label: "Manage Categories",     category: "Platform"      },
  { key: "manage_cities",       label: "Manage Cities",         category: "Platform"      },
  { key: "manage_subscriptions",label: "Manage Subscriptions",  category: "Platform"      },
  { key: "manage_agents",       label: "Manage Agents",         category: "People"        },
  { key: "manage_customers",    label: "Manage Customers",      category: "People"        },
  { key: "manage_disputes",     label: "Manage Disputes",       category: "Support"       },
  { key: "resolve_disputes",    label: "Resolve Disputes",      category: "Support"       },
  { key: "send_notifications",  label: "Send Notifications",    category: "Support"       },
  { key: "view_analytics",      label: "View Analytics",        category: "Analytics"     },
  { key: "export_data",         label: "Export Data",           category: "Analytics"     },
  { key: "edit_settings",       label: "Edit Settings",         category: "Admin"         },
  { key: "manage_roles",        label: "Manage Roles",          category: "Admin"         },
  { key: "view_audit_log",      label: "View Audit Log",        category: "Admin"         },
];

// ─── Audit Log ────────────────────────────────────────────────────────────────
export type AuditAction =
  | "settings_changed"   | "user_created"      | "user_blocked"
  | "vendor_approved"    | "vendor_rejected"   | "plan_updated"
  | "plan_created"       | "payout_released"   | "dispute_resolved"
  | "role_created"       | "role_updated"      | "city_added"
  | "commission_updated" | "ip_added"          | "password_changed"
  | "login_failed"       | "2fa_toggled"       | "export_done"
  | "notification_sent"  | "city_deactivated";

export interface AuditEntry {
  id:        string;
  action:    AuditAction;
  actor:     string;
  actorRole: string;
  target:    string;
  detail:    string;
  timestamp: string;
  ipAddress: string;
  severity:  "info" | "warning" | "critical";
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: "AU001", action: "settings_changed",   actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "Platform Config",     detail: "Platform fee rate changed from 18% to 20%",          timestamp: "28 Feb 2026, 09:44 AM", ipAddress: "103.27.12.84",  severity: "critical" },
  { id: "AU002", action: "payout_released",    actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "PP001, PP002, PP003", detail: "Batch payout ₹1,15,400 released to 3 vendors",       timestamp: "28 Feb 2026, 09:30 AM", ipAddress: "103.27.12.84",  severity: "info"     },
  { id: "AU003", action: "vendor_approved",    actor: "Priya Sharma", actorRole: "Operations Mgr", target: "AppliancePro GZB",    detail: "Vendor VND-2602-0031 approved after KYC review",     timestamp: "27 Feb 2026, 06:12 PM", ipAddress: "49.204.88.12",  severity: "info"     },
  { id: "AU004", action: "dispute_resolved",   actor: "Rohit Verma",  actorRole: "Operations Mgr", target: "Dispute D004",        detail: "Resolved in customer's favour — ₹800 refund issued", timestamp: "27 Feb 2026, 04:48 PM", ipAddress: "49.204.88.12",  severity: "info"     },
  { id: "AU005", action: "plan_updated",       actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "Premium Plan SP002",  detail: "Price changed from ₹1,499 to ₹1,299/month",          timestamp: "27 Feb 2026, 02:30 PM", ipAddress: "103.27.12.84",  severity: "warning"  },
  { id: "AU006", action: "city_added",         actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "Varanasi (C006)",     detail: "New city added via pincode 221001",                   timestamp: "26 Feb 2026, 11:20 AM", ipAddress: "182.64.44.21",  severity: "info"     },
  { id: "AU007", action: "user_blocked",       actor: "Sunita Rao",   actorRole: "Support Exec",   target: "Geeta Yadav (CU006)", detail: "Customer blocked — 3 cancellations in 7 days",        timestamp: "26 Feb 2026, 10:05 AM", ipAddress: "182.64.44.21",  severity: "warning"  },
  { id: "AU008", action: "login_failed",       actor: "Unknown",      actorRole: "—",              target: "Admin Portal",        detail: "Failed login from IP 45.128.219.4 (Mumbai)",         timestamp: "26 Feb 2026, 02:34 AM", ipAddress: "45.128.219.4",  severity: "critical" },
  { id: "AU009", action: "commission_updated", actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "Commission Tiers",    detail: "Gold tier rate updated from 6.5% to 7%",              timestamp: "25 Feb 2026, 05:00 PM", ipAddress: "103.27.12.84",  severity: "warning"  },
  { id: "AU010", action: "role_created",       actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "Viewer Role",         detail: "New role 'Viewer' created with read-only permissions",timestamp: "25 Feb 2026, 03:12 PM", ipAddress: "103.27.12.84",  severity: "info"     },
  { id: "AU011", action: "2fa_toggled",        actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "Admin ADM-001",       detail: "Two-factor authentication enabled",                   timestamp: "24 Feb 2026, 09:00 AM", ipAddress: "103.27.12.84",  severity: "info"     },
  { id: "AU012", action: "export_done",        actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "Finance Report",      detail: "Feb 2026 P&L exported as CSV",                        timestamp: "23 Feb 2026, 04:30 PM", ipAddress: "103.27.12.84",  severity: "info"     },
  { id: "AU013", action: "vendor_rejected",    actor: "Priya Sharma", actorRole: "Operations Mgr", target: "VND-2602-0028",       detail: "Rejected — incomplete KYC, GST number invalid",       timestamp: "22 Feb 2026, 02:10 PM", ipAddress: "49.204.88.12",  severity: "warning"  },
  { id: "AU014", action: "ip_added",           actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "IP 49.204.88.12",     detail: "IP whitelisted as 'Home — Delhi'",                    timestamp: "20 Feb 2026, 10:00 AM", ipAddress: "103.27.12.84",  severity: "info"     },
  { id: "AU015", action: "notification_sent",  actor: "System",       actorRole: "Automated",      target: "All Active Vendors",  detail: "Bulk SMS — 287 vendors: payout schedule update",      timestamp: "20 Feb 2026, 09:00 AM", ipAddress: "Internal",      severity: "info"     },
  { id: "AU016", action: "settings_changed",   actor: "Rajesh Gupta", actorRole: "Super Admin",    target: "Payout Config",       detail: "Auto-release disabled, manual approval required",     timestamp: "18 Feb 2026, 03:45 PM", ipAddress: "103.27.12.84",  severity: "critical" },
];

// ─── Admin Team Members ───────────────────────────────────────────────────────
export interface AdminMember {
  id:          string;
  name:        string;
  email:       string;
  phone:       string;
  roleId:      string;
  roleName:    string;
  status:      "active" | "suspended" | "invited";
  joinedDate:  string;
  lastLogin:   string;
  avatar:      string;
  twoFA:       boolean;
  department:  string;
}

export const ADMIN_MEMBERS: AdminMember[] = [
  { id: "ADM001", name: "Rajesh Gupta",    email: "rajesh@addies.in",   phone: "+91 98765 43210", roleId: "ROLE001", roleName: "Super Admin",       status: "active",    joinedDate: "01 Dec 2024", lastLogin: "28 Feb 2026, 09:14 AM", avatar: "R", twoFA: true,  department: "Management"   },
  { id: "ADM002", name: "Priya Sharma",    email: "priya@addies.in",    phone: "+91 87654 32109", roleId: "ROLE003", roleName: "Operations Manager", status: "active",    joinedDate: "15 Jan 2025", lastLogin: "27 Feb 2026, 06:12 PM", avatar: "P", twoFA: true,  department: "Operations"   },
  { id: "ADM003", name: "Rohit Verma",     email: "rohit@addies.in",    phone: "+91 76543 21098", roleId: "ROLE003", roleName: "Operations Manager", status: "active",    joinedDate: "15 Jan 2025", lastLogin: "27 Feb 2026, 04:48 PM", avatar: "R", twoFA: false, department: "Operations"   },
  { id: "ADM004", name: "Sunita Rao",      email: "sunita@addies.in",   phone: "+91 65432 10987", roleId: "ROLE004", roleName: "Support Executive",  status: "active",    joinedDate: "01 Mar 2025", lastLogin: "26 Feb 2026, 10:05 AM", avatar: "S", twoFA: false, department: "Support"      },
  { id: "ADM005", name: "Ankit Jain",      email: "ankit@addies.in",    phone: "+91 54321 09876", roleId: "ROLE002", roleName: "Finance Manager",    status: "active",    joinedDate: "01 Apr 2025", lastLogin: "25 Feb 2026, 09:30 AM", avatar: "A", twoFA: true,  department: "Finance"      },
  { id: "ADM006", name: "Meera Nair",      email: "meera@addies.in",    phone: "+91 43210 98765", roleId: "ROLE002", roleName: "Finance Manager",    status: "active",    joinedDate: "01 Apr 2025", lastLogin: "24 Feb 2026, 11:00 AM", avatar: "M", twoFA: true,  department: "Finance"      },
  { id: "ADM007", name: "Deepak Singh",    email: "deepak@addies.in",   phone: "+91 32109 87654", roleId: "ROLE004", roleName: "Support Executive",  status: "suspended", joinedDate: "01 Mar 2025", lastLogin: "10 Feb 2026, 03:20 PM", avatar: "D", twoFA: false, department: "Support"      },
  { id: "ADM008", name: "Kavita Bansal",   email: "kavita@addies.in",   phone: "+91 21098 76543", roleId: "ROLE005", roleName: "Viewer",             status: "active",    joinedDate: "01 Jun 2025", lastLogin: "22 Feb 2026, 02:00 PM", avatar: "K", twoFA: false, department: "Analytics"    },
  { id: "ADM009", name: "Vivek Agarwal",   email: "vivek@addies.in",    phone: "+91 11223 34455", roleId: "ROLE005", roleName: "Viewer",             status: "invited",   joinedDate: "—",           lastLogin: "—",                    avatar: "V", twoFA: false, department: "Analytics"    },
  { id: "ADM010", name: "Pallavi Mishra",  email: "pallavi@addies.in",  phone: "+91 99887 76655", roleId: "ROLE003", roleName: "Operations Manager", status: "active",    joinedDate: "15 Sep 2025", lastLogin: "27 Feb 2026, 09:00 AM", avatar: "P", twoFA: false, department: "Operations"   },
];

// ─── SMS / Email Gateway Config ───────────────────────────────────────────────
export interface GatewayConfig {
  smsProvider:      "twilio" | "msg91" | "textlocal" | "kaleyra";
  smsSenderId:      string;
  smsBalance:       number;         // credits remaining
  emailProvider:    "sendgrid" | "mailgun" | "ses" | "smtp";
  emailSenderName:  string;
  emailSenderAddr:  string;
  emailDailyLimit:  number;
  emailSentToday:   number;
  razorpayEnabled:  boolean;
  razorpayMode:     "live" | "test";
  cashfreeEnabled:  boolean;
  paytmEnabled:     boolean;
}

export const GATEWAY_CONFIG: GatewayConfig = {
  smsProvider:      "msg91",
  smsSenderId:      "ADDIES",
  smsBalance:       18420,
  emailProvider:    "sendgrid",
  emailSenderName:  "ADDies ServiceHub",
  emailSenderAddr:  "noreply@addies.in",
  emailDailyLimit:  5000,
  emailSentToday:   1284,
  razorpayEnabled:  true,
  razorpayMode:     "live",
  cashfreeEnabled:  false,
  paytmEnabled:     false,
};
