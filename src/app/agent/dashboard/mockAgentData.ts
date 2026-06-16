// src/pages/agent/dashboard/mockAgentData.ts
// Replace with real API calls when backend is ready

import type { Period } from "./components/PeriodSelector";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatData {
  totalVendors:      number;
  activeVendors:     number;
  activeJobsToday:   number;
  completedJobs:     number;
  totalRevenue:      number;      // gross (customer paid)
  platformRevenue:   number;      // platform commission
  agentCommission:   number;      // agent's 5% cut
  newRegistrations:  number;
  avgVendorRating:   number;
  disputesOpen:      number;
  disputesResolved:  number;
  approvalsP:        number;      // pending approvals
}

export interface AlertItem {
  id:       string;
  type:     "approval" | "dispute" | "low_performer" | "inactive" | "complaint";
  title:    string;
  subtitle: string;
  time:     string;
  urgent:   boolean;
  vendorId?: string;
}

export interface ActivityItem {
  id:       string;
  type:     "vendor_approved" | "vendor_rejected" | "dispute_resolved"
          | "lead_assigned"   | "commission_credited" | "new_registration"
          | "vendor_suspended"| "dispute_raised";
  title:    string;
  subtitle: string;
  time:     string;
  amount?:  number;
  icon:     string;
}

export interface CommissionBreakdown {
  totalGross:        number;
  platformTotal:     number;
  agentShare:        number;       // 5% of platform commission
  creditedAmount:    number;
  pendingAmount:     number;
  vendors: {
    name:     string;
    jobs:     number;
    gross:    number;
    agentEarned: number;
  }[];
}

// ─── Period-wise Stats ────────────────────────────────────────────────────────

const STATS: Record<Period, StatData> = {
  day: {
    totalVendors: 42, activeVendors: 31, activeJobsToday: 18,
    completedJobs: 14, totalRevenue: 24500, platformRevenue: 4800,
    agentCommission: 240, newRegistrations: 2, avgVendorRating: 4.3,
    disputesOpen: 2, disputesResolved: 1, approvalsP: 3,
  },
  week: {
    totalVendors: 42, activeVendors: 38, activeJobsToday: 18,
    completedJobs: 87, totalRevenue: 138000, platformRevenue: 27600,
    agentCommission: 1380, newRegistrations: 7, avgVendorRating: 4.4,
    disputesOpen: 5, disputesResolved: 9, approvalsP: 3,
  },
  month: {
    totalVendors: 42, activeVendors: 40, activeJobsToday: 18,
    completedJobs: 312, totalRevenue: 498000, platformRevenue: 99600,
    agentCommission: 4980, newRegistrations: 18, avgVendorRating: 4.4,
    disputesOpen: 5, disputesResolved: 34, approvalsP: 3,
  },
  year: {
    totalVendors: 42, activeVendors: 42, activeJobsToday: 18,
    completedJobs: 3240, totalRevenue: 5180000, platformRevenue: 1036000,
    agentCommission: 51800, newRegistrations: 42, avgVendorRating: 4.2,
    disputesOpen: 5, disputesResolved: 187, approvalsP: 3,
  },
};

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: "AL001", type: "approval", urgent: true,
    title: "3 Vendors Awaiting KYC Approval",
    subtitle: "Ramesh Plumbers, CoolBreeze AC, SparkFix Electrical",
    time: "2 hours ago",
  },
  {
    id: "AL002", type: "dispute", urgent: true,
    title: "Dispute Escalated — BK-2602-0031",
    subtitle: "Pooja Mehta vs Kumar Plumbers — Incomplete work claim",
    time: "4 hours ago",
  },
  {
    id: "AL003", type: "low_performer", urgent: false,
    title: "2 Vendors Below 3.5 Rating",
    subtitle: "QuickFix Services (3.1★), HandyMan Co. (3.3★) — Action needed",
    time: "Yesterday",
  },
  {
    id: "AL004", type: "inactive", urgent: false,
    title: "5 Vendors Inactive for 7+ Days",
    subtitle: "They haven't accepted any leads recently",
    time: "Yesterday",
  },
  {
    id: "AL005", type: "complaint", urgent: false,
    title: "New Customer Complaint",
    subtitle: "BK-2602-0047 — Service quality issue reported",
    time: "3 hours ago",
  },
];

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "AC001", type: "vendor_approved", icon: "✅",
    title: "Vendor Approved",
    subtitle: "Kumar Home Services — Plumbing & Electrical",
    time: "10 min ago",
  },
  {
    id: "AC002", type: "dispute_raised", icon: "⚖️",
    title: "Dispute Raised",
    subtitle: "BK-2602-0031 — Pooja Mehta vs Kumar Plumbers",
    time: "4 hours ago",
  },
  {
    id: "AC003", type: "lead_assigned", icon: "📋",
    title: "Lead Assigned",
    subtitle: "AC Service — Amit Kumar → CoolBreeze AC",
    time: "5 hours ago",
  },
  {
    id: "AC004", type: "commission_credited", icon: "💰",
    title: "Commission Credited",
    subtitle: "₹240 — 14 jobs completed today",
    time: "6 hours ago",
    amount: 240,
  },
  {
    id: "AC005", type: "new_registration", icon: "🆕",
    title: "New Vendor Registered",
    subtitle: "SparkFix Electrical — KYC pending review",
    time: "Yesterday, 5:30 PM",
  },
  {
    id: "AC006", type: "dispute_resolved", icon: "🤝",
    title: "Dispute Resolved",
    subtitle: "BK-2602-0018 — Refund issued to customer",
    time: "Yesterday, 3:00 PM",
  },
  {
    id: "AC007", type: "vendor_rejected", icon: "❌",
    title: "Vendor Application Rejected",
    subtitle: "HandyMan Express — Incomplete documents",
    time: "Yesterday, 1:15 PM",
  },
  {
    id: "AC008", type: "lead_assigned", icon: "📋",
    title: "Lead Assigned",
    subtitle: "Pest Control — Kavita Joshi → PestGuard Pro",
    time: "Yesterday, 11:00 AM",
  },
  {
    id: "AC009", type: "commission_credited", icon: "💰",
    title: "Commission Credited",
    subtitle: "₹1,380 — Weekly settlement",
    time: "3 days ago",
    amount: 1380,
  },
  {
    id: "AC010", type: "vendor_suspended", icon: "🚫",
    title: "Vendor Suspended",
    subtitle: "QuickFix Services — 3 unresolved complaints",
    time: "4 days ago",
  },
];

// ─── Commission Breakdown ─────────────────────────────────────────────────────

const COMMISSION: Record<Period, CommissionBreakdown> = {
  day: {
    totalGross: 24500, platformTotal: 4800,
    agentShare: 240, creditedAmount: 140, pendingAmount: 100,
    vendors: [
      { name: "Kumar Home Services", jobs: 4, gross: 8200,  agentEarned: 82 },
      { name: "CoolBreeze AC",       jobs: 3, gross: 7500,  agentEarned: 62 },
      { name: "CleanPro Services",   jobs: 4, gross: 5800,  agentEarned: 58 },
      { name: "SparkFix Electrical", jobs: 3, gross: 3000,  agentEarned: 38 },
    ],
  },
  week: {
    totalGross: 138000, platformTotal: 27600,
    agentShare: 1380, creditedAmount: 1080, pendingAmount: 300,
    vendors: [
      { name: "Kumar Home Services", jobs: 22, gross: 42000, agentEarned: 376 },
      { name: "CoolBreeze AC",       jobs: 18, gross: 38000, agentEarned: 320 },
      { name: "CleanPro Services",   jobs: 24, gross: 32000, agentEarned: 294 },
      { name: "SparkFix Electrical", jobs: 15, gross: 18000, agentEarned: 220 },
      { name: "PestGuard Pro",       jobs: 8,  gross: 8000,  agentEarned: 170 },
    ],
  },
  month: {
    totalGross: 498000, platformTotal: 99600,
    agentShare: 4980, creditedAmount: 4200, pendingAmount: 780,
    vendors: [
      { name: "Kumar Home Services", jobs: 87,  gross: 148000, agentEarned: 1340 },
      { name: "CoolBreeze AC",       jobs: 64,  gross: 138000, agentEarned: 1160 },
      { name: "CleanPro Services",   jobs: 92,  gross: 112000, agentEarned: 1040 },
      { name: "SparkFix Electrical", jobs: 48,  gross: 62000,  agentEarned: 820  },
      { name: "PestGuard Pro",       jobs: 21,  gross: 38000,  agentEarned: 620  },
    ],
  },
  year: {
    totalGross: 5180000, platformTotal: 1036000,
    agentShare: 51800, creditedAmount: 48000, pendingAmount: 3800,
    vendors: [
      { name: "Kumar Home Services", jobs: 890, gross: 1480000, agentEarned: 13400 },
      { name: "CoolBreeze AC",       jobs: 640, gross: 1320000, agentEarned: 11600 },
      { name: "CleanPro Services",   jobs: 920, gross: 1120000, agentEarned: 10400 },
      { name: "SparkFix Electrical", jobs: 480, gross: 640000,  agentEarned: 8200  },
      { name: "PestGuard Pro",       jobs: 310, gross: 620000,  agentEarned: 8200  },
    ],
  },
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export function getStats(period: Period): StatData { return STATS[period]; }
export function getCommission(period: Period): CommissionBreakdown { return COMMISSION[period]; }

// ─── Vendor Types ─────────────────────────────────────────────────────────────

export interface VendorItem {
  id:             string;
  vendorId:       string;
  name:           string;
  ownerName:      string;
  phone:          string;
  category:       string;
  area:           string;
  city:           string;
  status:         "active" | "inactive" | "suspended" | "pending";
  rating:         number;
  totalReviews:   number;
  jobsDone:       number;
  activeJobs:     number;
  totalEarnings:  number;
  completionRate: number;
  responseRate:   number;
  lastActive:     string;
  joinedDate:     string;
  services:       string[];
  kycAadhaar:     boolean;
  kycPan:         boolean;
  kycPhoto:       boolean;
  kycAddress:     boolean;
  recentJobs: {
    id: string; service: string; customer: string;
    date: string; amount: number; status: string; icon: string;
  }[];
  reviews: {
    id: string; customer: string; rating: number; comment: string; date: string;
  }[];
}

export interface PendingVendor {
  id:          string;
  vendorId:    string;
  name:        string;
  ownerName:   string;
  phone:       string;
  category:    string;
  area:        string;
  city:        string;
  appliedDate: string;
  appliedAt:   string;   // ISO date string for urgency calc
  experience:  string;
  services:    string[];
  agentNote?:  string;
  kyc: {
    aadhaar: "submitted" | "missing" | "verified";
    pan:     "submitted" | "missing" | "verified";
    photo:   "submitted" | "missing" | "verified";
    address: "submitted" | "missing" | "verified";
  };
}

// ─── Mock Vendors ─────────────────────────────────────────────────────────────

export const MOCK_VENDORS: VendorItem[] = [
  {
    id: "V001", vendorId: "VND-2601-0001",
    name: "Kumar Home Services", ownerName: "Ramesh Kumar",
    phone: "+91 98765 43210", category: "Plumbing",
    area: "Govindpuram", city: "Ghaziabad",
    status: "active", rating: 4.7, totalReviews: 128,
    jobsDone: 312, activeJobs: 3, totalEarnings: 48500,
    completionRate: 96, responseRate: 92, lastActive: "2 hours ago", joinedDate: "Jan 2025",
    services: ["Pipe Fitting", "Leak Repair", "Bathroom Fitting", "Water Tank Cleaning"],
    kycAadhaar: true, kycPan: true, kycPhoto: true, kycAddress: true,
    recentJobs: [
      { id: "J1", service: "Pipe Repair", customer: "Amit Sharma", date: "Today, 11:00 AM", amount: 850, status: "completed", icon: "🔧" },
      { id: "J2", service: "Bathroom Fitting", customer: "Priya Verma", date: "Today, 2:30 PM", amount: 2200, status: "ongoing", icon: "🚿" },
      { id: "J3", service: "Leak Fix", customer: "Kavita Joshi", date: "Yesterday", amount: 650, status: "completed", icon: "💧" },
    ],
    reviews: [
      { id: "R1", customer: "Amit Sharma", rating: 5, comment: "Excellent work! Fixed the pipe leak within 30 mins. Very professional.", date: "Today" },
      { id: "R2", customer: "Priya Verma", rating: 4, comment: "Good service, came on time. Slightly expensive but quality work.", date: "Yesterday" },
    ],
  },
  {
    id: "V002", vendorId: "VND-2601-0002",
    name: "CoolBreeze AC Services", ownerName: "Suresh Gupta",
    phone: "+91 87654 32109", category: "AC Service",
    area: "Vaishali Sector 4", city: "Ghaziabad",
    status: "active", rating: 4.5, totalReviews: 89,
    jobsDone: 198, activeJobs: 2, totalEarnings: 38200,
    completionRate: 93, responseRate: 88, lastActive: "30 min ago", joinedDate: "Feb 2025",
    services: ["AC Installation", "AC Service", "Gas Refilling", "AC Repair"],
    kycAadhaar: true, kycPan: true, kycPhoto: true, kycAddress: true,
    recentJobs: [
      { id: "J1", service: "AC Service", customer: "Mohit Agarwal", date: "Today", amount: 1200, status: "ongoing", icon: "❄️" },
      { id: "J2", service: "Gas Refill", customer: "Sunita Rao", date: "Yesterday", amount: 1800, status: "completed", icon: "🔄" },
    ],
    reviews: [
      { id: "R1", customer: "Mohit Agarwal", rating: 5, comment: "Superb AC service! AC is now cooling perfectly.", date: "Yesterday" },
    ],
  },
  {
    id: "V003", vendorId: "VND-2601-0003",
    name: "SparkFix Electrical", ownerName: "Vijay Singh",
    phone: "+91 76543 21098", category: "Electrical",
    area: "Kaushambi", city: "Ghaziabad",
    status: "active", rating: 4.3, totalReviews: 64,
    jobsDone: 145, activeJobs: 1, totalEarnings: 22800,
    completionRate: 91, responseRate: 85, lastActive: "1 hour ago", joinedDate: "Mar 2025",
    services: ["Wiring", "Switch Repair", "Fan Installation", "MCB Fitting"],
    kycAadhaar: true, kycPan: true, kycPhoto: true, kycAddress: true,
    recentJobs: [
      { id: "J1", service: "Fan Install", customer: "Deepak Malhotra", date: "Today", amount: 450, status: "completed", icon: "⚡" },
    ],
    reviews: [
      { id: "R1", customer: "Deepak Malhotra", rating: 4, comment: "Quick and clean work. Happy with the service.", date: "Today" },
    ],
  },
  {
    id: "V004", vendorId: "VND-2601-0004",
    name: "CleanPro Services", ownerName: "Anita Sharma",
    phone: "+91 65432 10987", category: "Cleaning",
    area: "Indirapuram", city: "Ghaziabad",
    status: "active", rating: 4.8, totalReviews: 201,
    jobsDone: 421, activeJobs: 4, totalEarnings: 52000,
    completionRate: 98, responseRate: 96, lastActive: "15 min ago", joinedDate: "Dec 2024",
    services: ["Home Cleaning", "Deep Cleaning", "Sofa Cleaning", "Kitchen Cleaning"],
    kycAadhaar: true, kycPan: true, kycPhoto: true, kycAddress: true,
    recentJobs: [
      { id: "J1", service: "Deep Cleaning", customer: "Ritu Agarwal", date: "Today, 9:00 AM", amount: 3500, status: "completed", icon: "🧹" },
      { id: "J2", service: "Home Cleaning", customer: "Vikram Nair", date: "Today, 1:00 PM", amount: 1200, status: "ongoing", icon: "🏠" },
    ],
    reviews: [
      { id: "R1", customer: "Ritu Agarwal", rating: 5, comment: "Outstanding! My entire house looks brand new. Highly recommend!", date: "Today" },
      { id: "R2", customer: "Rahul Sinha", rating: 5, comment: "Best cleaning service I've ever used. Very thorough.", date: "Yesterday" },
    ],
  },
  {
    id: "V005", vendorId: "VND-2601-0005",
    name: "QuickFix Services", ownerName: "Manoj Tiwari",
    phone: "+91 54321 09876", category: "Appliance Repair",
    area: "Raj Nagar", city: "Ghaziabad",
    status: "suspended", rating: 3.1, totalReviews: 42,
    jobsDone: 87, activeJobs: 0, totalEarnings: 8400,
    completionRate: 64, responseRate: 52, lastActive: "4 days ago", joinedDate: "Apr 2025",
    services: ["Washing Machine", "Refrigerator", "Microwave", "TV Repair"],
    kycAadhaar: true, kycPan: true, kycPhoto: false, kycAddress: true,
    recentJobs: [
      { id: "J1", service: "Washing Machine", customer: "Geeta Yadav", date: "5 days ago", amount: 1200, status: "cancelled", icon: "🔧" },
    ],
    reviews: [
      { id: "R1", customer: "Geeta Yadav", rating: 2, comment: "Didn't fix the issue properly. Had to call someone else.", date: "5 days ago" },
      { id: "R2", customer: "Rohit Soni", rating: 2, comment: "No call back, very unprofessional behavior.", date: "Last week" },
    ],
  },
  {
    id: "V006", vendorId: "VND-2601-0006",
    name: "HandyMan Co.", ownerName: "Dinesh Yadav",
    phone: "+91 43210 98765", category: "Carpentry",
    area: "Loni", city: "Ghaziabad",
    status: "inactive", rating: 3.3, totalReviews: 28,
    jobsDone: 54, activeJobs: 0, totalEarnings: 11200,
    completionRate: 72, responseRate: 60, lastActive: "8 days ago", joinedDate: "May 2025",
    services: ["Door Repair", "Furniture Repair", "Wardrobe Fitting", "Window Fitting"],
    kycAadhaar: true, kycPan: false, kycPhoto: true, kycAddress: true,
    recentJobs: [
      { id: "J1", service: "Door Repair", customer: "Suresh Mishra", date: "8 days ago", amount: 800, status: "completed", icon: "🚪" },
    ],
    reviews: [
      { id: "R1", customer: "Suresh Mishra", rating: 3, comment: "Work was okay, came late but eventually did the job.", date: "8 days ago" },
    ],
  },
  {
    id: "V007", vendorId: "VND-2601-0007",
    name: "PestGuard Pro", ownerName: "Kamlesh Sahu",
    phone: "+91 32109 87654", category: "Pest Control",
    area: "Crossings Republik", city: "Ghaziabad",
    status: "active", rating: 4.4, totalReviews: 76,
    jobsDone: 167, activeJobs: 2, totalEarnings: 31500,
    completionRate: 94, responseRate: 89, lastActive: "3 hours ago", joinedDate: "Feb 2025",
    services: ["Cockroach Control", "Termite Treatment", "Bed Bug Control", "General Pest"],
    kycAadhaar: true, kycPan: true, kycPhoto: true, kycAddress: true,
    recentJobs: [
      { id: "J1", service: "Termite Treatment", customer: "Alka Srivastava", date: "Today", amount: 3200, status: "ongoing", icon: "🐛" },
    ],
    reviews: [
      { id: "R1", customer: "Alka Srivastava", rating: 4, comment: "Very professional. Used good quality chemicals.", date: "Yesterday" },
    ],
  },
];

// ─── Mock Pending Vendors (for Approvals page) ────────────────────────────────

export const MOCK_PENDING_VENDORS: PendingVendor[] = [
  {
    id: "PV001", vendorId: "VND-2602-0041",
    name: "Ramesh Plumbers", ownerName: "Ramesh Chandra",
    phone: "+91 91234 56789", category: "Plumbing",
    area: "Pratap Vihar", city: "Ghaziabad",
    appliedDate: "25 Feb 2026", appliedAt: "2026-02-25T10:00:00",
    experience: "8 years",
    services: ["Pipe Fitting", "Bathroom Renovation", "Leak Repair", "Motor Repair"],
    agentNote: "Applicant came in person. Seems experienced.",
    kyc: { aadhaar: "submitted", pan: "submitted", photo: "submitted", address: "submitted" },
  },
  {
    id: "PV002", vendorId: "VND-2602-0042",
    name: "BrightSpark Electrical", ownerName: "Arjun Pandey",
    phone: "+91 98234 11234", category: "Electrical",
    area: "Meerut Road", city: "Ghaziabad",
    appliedDate: "24 Feb 2026", appliedAt: "2026-02-24T08:30:00",
    experience: "5 years",
    services: ["House Wiring", "Inverter Install", "CCTV Wiring", "Panel Repair"],
    kyc: { aadhaar: "submitted", pan: "missing", photo: "submitted", address: "submitted" },
  },
  {
    id: "PV003", vendorId: "VND-2602-0043",
    name: "FreshHome Cleaning", ownerName: "Pooja Arora",
    phone: "+91 87654 99123", category: "Cleaning",
    area: "Vasundhara", city: "Ghaziabad",
    appliedDate: "22 Feb 2026", appliedAt: "2026-02-22T14:00:00",
    experience: "3 years",
    services: ["Home Cleaning", "Office Cleaning", "Post-Construction Cleaning"],
    agentNote: "Documents look genuine. PAN needs verification.",
    kyc: { aadhaar: "submitted", pan: "submitted", photo: "missing", address: "submitted" },
  },
  {
    id: "PV004", vendorId: "VND-2602-0044",
    name: "Arctic Cool AC", ownerName: "Sunil Mehrotra",
    phone: "+91 76543 88901", category: "AC Service",
    area: "Shalimar Garden", city: "Ghaziabad",
    appliedDate: "20 Feb 2026", appliedAt: "2026-02-20T11:00:00",
    experience: "12 years",
    services: ["AC Install", "AC Repair", "Gas Filling", "AMC"],
    kyc: { aadhaar: "submitted", pan: "submitted", photo: "submitted", address: "submitted" },
  },
];

// ─── Dispute Types ────────────────────────────────────────────────────────────

export type DisputeStatus   = "open" | "under_review" | "resolved" | "escalated" | "closed";
export type DisputeCategory = "incomplete_work" | "overcharging" | "no_show" | "damage" | "behaviour" | "refund" | "other";
export type DisputeVerdict  = "favour_customer" | "favour_vendor" | "partial_refund" | "no_action" | null;

export interface DisputeMessage {
  id:        string;
  sender:    "customer" | "vendor" | "agent" | "system";
  name:      string;
  text:      string;
  time:      string;
  attachment?: string;
}

export interface DisputeItem {
  id:           string;
  bookingId:    string;
  category:     DisputeCategory;
  status:       DisputeStatus;
  priority:     "low" | "medium" | "high";
  raisedBy:     "customer" | "vendor";
  raisedAt:     string;
  updatedAt:    string;
  customer: {
    name:       string;
    phone:      string;
    rating:     number;
  };
  vendor: {
    id:         string;
    name:       string;
    phone:      string;
    rating:     number;
    category:   string;
  };
  service:      string;
  serviceDate:  string;
  jobAmount:    number;
  refundAmount: number;
  description:  string;
  verdict:      DisputeVerdict;
  verdictNote?: string;
  agentNote?:   string;
  timeline: {
    label: string;
    time:  string;
    done:  boolean;
  }[];
  messages:     DisputeMessage[];
}

export const MOCK_DISPUTES: DisputeItem[] = [
  {
    id: "DS001", bookingId: "BK-2602-0031",
    category: "incomplete_work", status: "open", priority: "high",
    raisedBy: "customer", raisedAt: "28 Feb 2026, 9:00 AM", updatedAt: "4 hours ago",
    customer: { name: "Pooja Mehta",    phone: "+91 98765 11111", rating: 4.5 },
    vendor:   { id: "V001", name: "Kumar Plumbers", phone: "+91 98765 43210", rating: 4.7, category: "Plumbing" },
    service: "Pipe Leak Fix", serviceDate: "27 Feb 2026", jobAmount: 1200, refundAmount: 0,
    description: "Vendor fixed the visible pipe but the underlying leak in the wall was not repaired. Water seepage continued after he left. He refused to come back without extra charges.",
    verdict: null, verdictNote: undefined, agentNote: undefined,
    timeline: [
      { label: "Dispute Raised",    time: "28 Feb, 9:00 AM",  done: true  },
      { label: "Agent Notified",    time: "28 Feb, 9:05 AM",  done: true  },
      { label: "Under Review",      time: "Pending",           done: false },
      { label: "Verdict Given",     time: "—",                 done: false },
      { label: "Closed",            time: "—",                 done: false },
    ],
    messages: [
      { id: "M1", sender: "customer", name: "Pooja Mehta",   time: "9:00 AM", text: "The plumber only fixed the outer pipe. Water is still leaking from inside the wall. I paid ₹1200 for incomplete work." },
      { id: "M2", sender: "vendor",   name: "Kumar Plumbers",time: "9:45 AM", text: "The job requested was pipe leak fix, which I completed. Wall seepage is a separate job that was not part of the original booking." },
      { id: "M3", sender: "customer", name: "Pooja Mehta",   time: "10:10 AM",text: "That was not explained before the job. The root cause is the wall pipe. Please refund my money." },
    ],
  },
  {
    id: "DS002", bookingId: "BK-2602-0028",
    category: "overcharging", status: "under_review", priority: "medium",
    raisedBy: "customer", raisedAt: "26 Feb 2026, 3:00 PM", updatedAt: "Yesterday",
    customer: { name: "Rahul Sinha",   phone: "+91 87654 22222", rating: 4.0 },
    vendor:   { id: "V002", name: "CoolBreeze AC Services", phone: "+91 87654 32109", rating: 4.5, category: "AC Service" },
    service: "AC Gas Refill", serviceDate: "26 Feb 2026", jobAmount: 3200, refundAmount: 800,
    description: "Platform quoted ₹1800 for AC gas refill but vendor charged ₹3200 on site citing extra gas used. No prior approval was taken before extra charges.",
    verdict: null, verdictNote: undefined, agentNote: "Contacted vendor — he claims 2.5kg gas was used vs 1kg quoted. Checking job photos.",
    timeline: [
      { label: "Dispute Raised",  time: "26 Feb, 3:00 PM", done: true  },
      { label: "Agent Notified",  time: "26 Feb, 3:05 PM", done: true  },
      { label: "Under Review",    time: "26 Feb, 4:00 PM", done: true  },
      { label: "Verdict Given",   time: "Pending",          done: false },
      { label: "Closed",          time: "—",                done: false },
    ],
    messages: [
      { id: "M1", sender: "customer", name: "Rahul Sinha",        time: "3:00 PM", text: "I was quoted ₹1800 on the app. Vendor charged ₹3200 on site without asking. This is fraud." },
      { id: "M2", sender: "vendor",   name: "CoolBreeze AC",      time: "4:00 PM", text: "The AC had low refrigerant. I used 2.5kg instead of standard 1kg. I showed the customer before charging extra." },
      { id: "M3", sender: "agent",    name: "You",                time: "5:00 PM", text: "I have reviewed the job details. Waiting for invoice and gas usage proof from vendor before making a decision." },
      { id: "M4", sender: "customer", name: "Rahul Sinha",        time: "5:30 PM", text: "He never showed me anything. Just demanded cash after work. Please help." },
    ],
  },
  {
    id: "DS003", bookingId: "BK-2602-0019",
    category: "no_show", status: "resolved", priority: "low",
    raisedBy: "customer", raisedAt: "22 Feb 2026, 11:00 AM", updatedAt: "3 days ago",
    customer: { name: "Kavita Joshi",  phone: "+91 76543 33333", rating: 4.6 },
    vendor:   { id: "V005", name: "QuickFix Services", phone: "+91 54321 09876", rating: 3.1, category: "Appliance Repair" },
    service: "Washing Machine Repair", serviceDate: "22 Feb 2026", jobAmount: 800, refundAmount: 800,
    description: "Vendor never showed up for the scheduled appointment at 10 AM. No call, no message. Customer waited 3 hours.",
    verdict: "favour_customer", verdictNote: "Full refund issued. Vendor penalised for no-show. Strike #2 on vendor account.",
    agentNote: "Called vendor — phone not reachable for 2 hours. Clear no-show case. Issued full refund.",
    timeline: [
      { label: "Dispute Raised",  time: "22 Feb, 11:00 AM", done: true },
      { label: "Agent Notified",  time: "22 Feb, 11:05 AM", done: true },
      { label: "Under Review",    time: "22 Feb, 11:30 AM", done: true },
      { label: "Verdict Given",   time: "22 Feb, 12:00 PM", done: true },
      { label: "Closed",          time: "22 Feb, 12:30 PM", done: true },
    ],
    messages: [
      { id: "M1", sender: "customer", name: "Kavita Joshi",   time: "11:00 AM", text: "Vendor did not come. I took a half day from office. This is unacceptable." },
      { id: "M2", sender: "system",   name: "System",         time: "11:05 AM", text: "Dispute auto-escalated to agent after 30 minutes of no vendor response." },
      { id: "M3", sender: "agent",    name: "You",            time: "11:30 AM", text: "Verified — vendor was unreachable. Issuing full refund of ₹800 to customer. Vendor has been penalised." },
    ],
  },
  {
    id: "DS004", bookingId: "BK-2602-0035",
    category: "damage", status: "escalated", priority: "high",
    raisedBy: "customer", raisedAt: "27 Feb 2026, 2:00 PM", updatedAt: "Yesterday",
    customer: { name: "Amit Sharma",  phone: "+91 65432 44444", rating: 4.8 },
    vendor:   { id: "V003", name: "SparkFix Electrical", phone: "+91 76543 21098", rating: 4.3, category: "Electrical" },
    service: "Wiring Work", serviceDate: "27 Feb 2026", jobAmount: 2400, refundAmount: 0,
    description: "During wiring work, vendor accidentally damaged the customer's new LED TV — burn marks visible on the back panel. Customer is demanding full TV replacement worth ₹45,000.",
    verdict: null, verdictNote: undefined, agentNote: "Escalated to Admin — damage amount exceeds my resolution authority (₹10,000 cap).",
    timeline: [
      { label: "Dispute Raised",  time: "27 Feb, 2:00 PM", done: true  },
      { label: "Agent Notified",  time: "27 Feb, 2:05 PM", done: true  },
      { label: "Under Review",    time: "27 Feb, 3:00 PM", done: true  },
      { label: "Escalated",       time: "27 Feb, 4:00 PM", done: true  },
      { label: "Admin Resolution","time": "Pending",        done: false },
    ],
    messages: [
      { id: "M1", sender: "customer", name: "Amit Sharma",      time: "2:00 PM", text: "The electrician shorted the circuit and burned my TV. I have photos. Who will pay for this?" },
      { id: "M2", sender: "vendor",   name: "SparkFix Electrical",time: "2:45 PM", text: "There was already a voltage fluctuation issue in the house. I cannot be held responsible for pre-existing electrical faults." },
      { id: "M3", sender: "agent",    name: "You",              time: "3:00 PM", text: "Both sides heard. Damage amount of ₹45,000 is beyond my resolution limit of ₹10,000. Escalating to admin." },
    ],
  },
  {
    id: "DS005", bookingId: "BK-2602-0041",
    category: "behaviour", status: "open", priority: "medium",
    raisedBy: "customer", raisedAt: "28 Feb 2026, 6:00 PM", updatedAt: "1 hour ago",
    customer: { name: "Sunita Rao",   phone: "+91 54321 55555", rating: 4.9 },
    vendor:   { id: "V006", name: "HandyMan Co.", phone: "+91 43210 98765", rating: 3.3, category: "Carpentry" },
    service: "Furniture Repair", serviceDate: "28 Feb 2026", jobAmount: 650, refundAmount: 0,
    description: "Vendor was rude and argumentative when asked to fix a minor mistake. Used inappropriate language in front of family members.",
    verdict: null,
    timeline: [
      { label: "Dispute Raised",  time: "28 Feb, 6:00 PM", done: true  },
      { label: "Agent Notified",  time: "28 Feb, 6:05 PM", done: true  },
      { label: "Under Review",    time: "Pending",          done: false },
      { label: "Verdict Given",   time: "—",                done: false },
      { label: "Closed",          time: "—",                done: false },
    ],
    messages: [
      { id: "M1", sender: "customer", name: "Sunita Rao", time: "6:00 PM", text: "The vendor was very rude when I pointed out the table leg was not fixed properly. He raised his voice in front of my children. Please take action." },
    ],
  },
];


// ─── Commission Page Types ────────────────────────────────────────────────────

export interface PayoutRecord {
  id:          string;
  period:      string;
  amount:      number;
  status:      "credited" | "processing" | "on_hold";
  date:        string;
  upiRef?:     string;
  jobs:        number;
  grossRevenue:number;
}

export interface MonthlyCommission {
  month:        string;
  jobs:         number;
  grossRevenue: number;
  platformFee:  number;
  agentShare:   number;
  credited:     number;
  pending:      number;
}

export const MOCK_PAYOUTS: PayoutRecord[] = [
  { id: "PY001", period: "Feb 2026 (Week 4)", amount: 1240, status: "processing", date: "Expected: 01 Mar 2026", jobs: 87,  grossRevenue: 248000 },
  { id: "PY002", period: "Feb 2026 (Week 3)", amount: 1180, status: "credited",   date: "22 Feb 2026", upiRef: "UPI2602221180X", jobs: 83,  grossRevenue: 236000 },
  { id: "PY003", period: "Feb 2026 (Week 2)", amount: 960,  status: "credited",   date: "15 Feb 2026", upiRef: "UPI2602150960X", jobs: 68,  grossRevenue: 192000 },
  { id: "PY004", period: "Feb 2026 (Week 1)", amount: 820,  status: "credited",   date: "08 Feb 2026", upiRef: "UPI2602080820X", jobs: 58,  grossRevenue: 164000 },
  { id: "PY005", period: "Jan 2026 (Week 4)", amount: 1100, status: "credited",   date: "25 Jan 2026", upiRef: "UPI2601251100X", jobs: 78,  grossRevenue: 220000 },
  { id: "PY006", period: "Jan 2026 (Week 3)", amount: 890,  status: "credited",   date: "18 Jan 2026", upiRef: "UPI2601180890X", jobs: 63,  grossRevenue: 178000 },
  { id: "PY007", period: "Jan 2026 (Week 2)", amount: 740,  status: "credited",   date: "11 Jan 2026", upiRef: "UPI2601110740X", jobs: 52,  grossRevenue: 148000 },
  { id: "PY008", period: "Jan 2026 (Week 1)", amount: 650,  status: "credited",   date: "04 Jan 2026", upiRef: "UPI2601040650X", jobs: 46,  grossRevenue: 130000 },
];

export const MONTHLY_COMMISSION: MonthlyCommission[] = [
  { month: "Feb 2026", jobs: 296, grossRevenue: 840000, platformFee: 168000, agentShare: 4200, credited: 2960, pending: 1240 },
  { month: "Jan 2026", jobs: 239, grossRevenue: 676000, platformFee: 135200, agentShare: 3380, credited: 3380, pending: 0 },
  { month: "Dec 2025", jobs: 312, grossRevenue: 912000, platformFee: 182400, agentShare: 4560, credited: 4560, pending: 0 },
  { month: "Nov 2025", jobs: 278, grossRevenue: 794000, platformFee: 158800, agentShare: 3970, credited: 3970, pending: 0 },
  { month: "Oct 2025", jobs: 254, grossRevenue: 720000, platformFee: 144000, agentShare: 3600, credited: 3600, pending: 0 },
  { month: "Sep 2025", jobs: 198, grossRevenue: 562000, platformFee: 112400, agentShare: 2810, credited: 2810, pending: 0 },
];

// ─── Lead Types ───────────────────────────────────────────────────────────────

export type LeadStatus = "unassigned" | "assigned" | "accepted" | "completed" | "expired" | "cancelled";
export type LeadUrgency = "standard" | "priority" | "emergency";

export interface LeadItem {
  id:              string;
  bookingId:       string;
  service:         string;
  category:        string;
  categoryIcon:    string;
  subService:      string;
  customer: {
    name:          string;
    phone:         string;
    rating:        number;         // customer's avg rating given to vendors
    totalBookings: number;
  };
  address: {
    area:          string;
    city:          string;
    pincode:       string;
    fullAddress:   string;
  };
  scheduledDate:   string;
  scheduledSlot:   string;
  createdAt:       string;        // time since created
  expiresIn:       string;        // time left before auto-expire
  expiresInMins:   number;        // for progress bar
  totalExpireMins: number;
  amount:          number;        // customer's estimated budget
  urgency:         LeadUrgency;
  status:          LeadStatus;
  assignedVendor?: {
    id:            string;
    name:          string;
    rating:        number;
    phone:         string;
  };
  suggestedVendors: {
    id:            string;
    name:          string;
    rating:        number;
    jobsDone:      number;
    distance:      string;
    available:     boolean;
    responseRate:  number;
  }[];
  notes?:          string;
}

// ─── Mock Leads ───────────────────────────────────────────────────────────────

export const MOCK_LEADS: LeadItem[] = [
  {
    id: "LD001", bookingId: "BK-2602-0051",
    service: "AC Service", category: "AC Service", categoryIcon: "❄️",
    subService: "AC Service & Cleaning",
    customer: { name: "Amit Sharma", phone: "+91 98765 43210", rating: 4.8, totalBookings: 12 },
    address: { area: "Indirapuram", city: "Ghaziabad", pincode: "201014", fullAddress: "Flat 4B, Aditya World City, Indirapuram" },
    scheduledDate: "28 Feb 2026", scheduledSlot: "11:00 AM – 1:00 PM",
    createdAt: "8 min ago", expiresIn: "22 min", expiresInMins: 22, totalExpireMins: 30,
    amount: 1200, urgency: "priority", status: "unassigned",
    suggestedVendors: [
      { id: "V002", name: "CoolBreeze AC Services", rating: 4.5, jobsDone: 198, distance: "1.2 km", available: true,  responseRate: 88 },
      { id: "V003", name: "ArcticCool Pro",         rating: 4.2, jobsDone: 143, distance: "2.8 km", available: true,  responseRate: 82 },
      { id: "V008", name: "FrostFix HVAC",           rating: 4.0, jobsDone: 91,  distance: "4.1 km", available: false, responseRate: 75 },
    ],
  },
  {
    id: "LD002", bookingId: "BK-2602-0052",
    service: "Plumbing", category: "Plumbing", categoryIcon: "🔧",
    subService: "Pipe Leak Fix",
    customer: { name: "Pooja Mehta", phone: "+91 87654 32109", rating: 4.5, totalBookings: 5 },
    address: { area: "Vaishali", city: "Ghaziabad", pincode: "201010", fullAddress: "H-12, Sector 4, Vaishali" },
    scheduledDate: "28 Feb 2026", scheduledSlot: "2:00 PM – 4:00 PM",
    createdAt: "25 min ago", expiresIn: "5 min", expiresInMins: 5, totalExpireMins: 30,
    amount: 500, urgency: "emergency", status: "unassigned",
    notes: "Water leaking from bathroom pipe since morning. Urgent!",
    suggestedVendors: [
      { id: "V001", name: "Kumar Home Services",  rating: 4.7, jobsDone: 312, distance: "0.8 km", available: true,  responseRate: 92 },
      { id: "V009", name: "RapidFix Plumbing",    rating: 4.1, jobsDone: 88,  distance: "3.5 km", available: true,  responseRate: 79 },
    ],
  },
  {
    id: "LD003", bookingId: "BK-2602-0049",
    service: "Home Cleaning", category: "Cleaning", categoryIcon: "🧹",
    subService: "Deep Cleaning",
    customer: { name: "Sunita Rao", phone: "+91 76543 21098", rating: 4.9, totalBookings: 18 },
    address: { area: "Kaushambi", city: "Ghaziabad", pincode: "201010", fullAddress: "Tower B, 602, Shipra Sun City, Kaushambi" },
    scheduledDate: "01 Mar 2026", scheduledSlot: "9:00 AM – 11:00 AM",
    createdAt: "1 hour ago", expiresIn: "Expired", expiresInMins: 0, totalExpireMins: 30,
    amount: 3500, urgency: "standard", status: "assigned",
    assignedVendor: { id: "V004", name: "CleanPro Services", rating: 4.8, phone: "+91 65432 10987" },
    suggestedVendors: [],
  },
  {
    id: "LD004", bookingId: "BK-2602-0048",
    service: "Electrical", category: "Electrical", categoryIcon: "⚡",
    subService: "Switchboard Repair",
    customer: { name: "Deepak Malhotra", phone: "+91 65432 10987", rating: 4.2, totalBookings: 3 },
    address: { area: "Govindpuram", city: "Ghaziabad", pincode: "201013", fullAddress: "Plot 22, Block C, Govindpuram" },
    scheduledDate: "28 Feb 2026", scheduledSlot: "5:00 PM – 7:00 PM",
    createdAt: "2 hours ago", expiresIn: "Expired", expiresInMins: 0, totalExpireMins: 30,
    amount: 400, urgency: "standard", status: "accepted",
    assignedVendor: { id: "V003", name: "SparkFix Electrical", rating: 4.3, phone: "+91 76543 21098" },
    suggestedVendors: [],
  },
  {
    id: "LD005", bookingId: "BK-2602-0045",
    service: "Pest Control", category: "Pest Control", categoryIcon: "🐛",
    subService: "Cockroach Treatment",
    customer: { name: "Kavita Joshi", phone: "+91 54321 09876", rating: 4.6, totalBookings: 7 },
    address: { area: "Crossings Republik", city: "Ghaziabad", pincode: "201016", fullAddress: "Green Valley Society, C-104" },
    scheduledDate: "27 Feb 2026", scheduledSlot: "10:00 AM – 12:00 PM",
    createdAt: "1 day ago", expiresIn: "—", expiresInMins: 0, totalExpireMins: 30,
    amount: 1800, urgency: "standard", status: "completed",
    assignedVendor: { id: "V007", name: "PestGuard Pro", rating: 4.4, phone: "+91 32109 87654" },
    suggestedVendors: [],
  },
  {
    id: "LD006", bookingId: "BK-2602-0047",
    service: "Painting", category: "Painting", categoryIcon: "🎨",
    subService: "Interior Wall Paint",
    customer: { name: "Rahul Sinha", phone: "+91 43210 98765", rating: 4.0, totalBookings: 2 },
    address: { area: "Raj Nagar", city: "Ghaziabad", pincode: "201002", fullAddress: "241, Raj Nagar Extension" },
    scheduledDate: "02 Mar 2026", scheduledSlot: "9:00 AM – 11:00 AM",
    createdAt: "30 min ago", expiresIn: "2 hr 30 min", expiresInMins: 150, totalExpireMins: 180,
    amount: 8500, urgency: "standard", status: "unassigned",
    suggestedVendors: [
      { id: "V010", name: "ColorCraft Painters",  rating: 4.6, jobsDone: 214, distance: "2.1 km", available: true,  responseRate: 91 },
      { id: "V011", name: "BrightWalls Co.",       rating: 4.3, jobsDone: 157, distance: "3.4 km", available: true,  responseRate: 84 },
    ],
  },
  {
    id: "LD007", bookingId: "BK-2602-0046",
    service: "Carpentry", category: "Carpentry", categoryIcon: "🪚",
    subService: "Door Repair",
    customer: { name: "Geeta Yadav", phone: "+91 32109 87654", rating: 3.8, totalBookings: 1 },
    address: { area: "Loni", city: "Ghaziabad", pincode: "201102", fullAddress: "S-42, Loni Industrial Area" },
    scheduledDate: "28 Feb 2026", scheduledSlot: "3:00 PM – 5:00 PM",
    createdAt: "3 hours ago", expiresIn: "Expired", expiresInMins: 0, totalExpireMins: 30,
    amount: 700, urgency: "standard", status: "expired",
    suggestedVendors: [],
    notes: "No suitable vendor available in area.",
  },
];

export function getLeadStats() {
  return {
    total:      MOCK_LEADS.length,
    unassigned: MOCK_LEADS.filter(l => l.status === "unassigned").length,
    assigned:   MOCK_LEADS.filter(l => l.status === "assigned" || l.status === "accepted").length,
    completed:  MOCK_LEADS.filter(l => l.status === "completed").length,
    expired:    MOCK_LEADS.filter(l => l.status === "expired").length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CITY ANALYTICS — Mock Data
// Append this block to the bottom of mockAgentData.ts
// ─────────────────────────────────────────────────────────────────────────────

// ─── City Health Score ────────────────────────────────────────────────────────

export interface CityHealthScore {
  overall:         number;   // 0-100
  completionRate:  number;
  avgRating:       number;
  disputeRate:     number;   // lower = better
  vendorActivity:  number;
  responseTime:    number;
  trend:           "up" | "down" | "stable";
  trendValue:      number;   // +/- points vs last month
}

export const CITY_HEALTH: CityHealthScore = {
  overall:        78,
  completionRate: 94,
  avgRating:      4.4,
  disputeRate:    3.2,
  vendorActivity: 88,
  responseTime:   82,
  trend:          "up",
  trendValue:     4,
};

// ─── MoM Growth Cards ─────────────────────────────────────────────────────────

export interface MoMStat {
  label:    string;
  current:  number | string;
  prev:     number | string;
  change:   number;          // % change
  unit:     string;          // "₹" | "" | "%"
  icon:     string;
  positive: boolean;         // is higher better?
}

export const MOM_STATS: MoMStat[] = [
  { label: "Total Bookings", current: 312,    prev: 278,    change: +12.2, unit: "",  icon: "📋", positive: true  },
  { label: "Gross Revenue",  current: 498000, prev: 432000, change: +15.3, unit: "₹", icon: "💰", positive: true  },
  { label: "Avg Order Value",current: 1596,   prev: 1554,   change: +2.7,  unit: "₹", icon: "🎯", positive: true  },
  { label: "New Customers",  current: 68,     prev: 54,     change: +25.9, unit: "",  icon: "👤", positive: true  },
  { label: "New Vendors",    current: 4,      prev: 7,      change: -42.8, unit: "",  icon: "🏪", positive: true  },
  { label: "Dispute Rate",   current: 3.2,    prev: 4.1,    change: -21.9, unit: "%", icon: "⚖️", positive: false },
];

// ─── Bookings Trend (last 30 days, daily) ─────────────────────────────────────

export interface DailyBooking {
  date:      string;   // "Feb 1", "Feb 2"...
  bookings:  number;
  revenue:   number;
  completed: number;
  cancelled: number;
}

export const DAILY_BOOKINGS: DailyBooking[] = [
  { date: "Feb 1",  bookings: 8,  revenue: 12800, completed: 7,  cancelled: 1 },
  { date: "Feb 2",  bookings: 11, revenue: 17600, completed: 10, cancelled: 1 },
  { date: "Feb 3",  bookings: 9,  revenue: 14400, completed: 9,  cancelled: 0 },
  { date: "Feb 4",  bookings: 14, revenue: 22400, completed: 13, cancelled: 1 },
  { date: "Feb 5",  bookings: 12, revenue: 19200, completed: 11, cancelled: 1 },
  { date: "Feb 6",  bookings: 7,  revenue: 11200, completed: 7,  cancelled: 0 },
  { date: "Feb 7",  bookings: 10, revenue: 16000, completed: 9,  cancelled: 1 },
  { date: "Feb 8",  bookings: 13, revenue: 20800, completed: 12, cancelled: 1 },
  { date: "Feb 9",  bookings: 16, revenue: 25600, completed: 15, cancelled: 1 },
  { date: "Feb 10", bookings: 11, revenue: 17600, completed: 10, cancelled: 1 },
  { date: "Feb 11", bookings: 15, revenue: 24000, completed: 14, cancelled: 1 },
  { date: "Feb 12", bookings: 18, revenue: 28800, completed: 17, cancelled: 1 },
  { date: "Feb 13", bookings: 9,  revenue: 14400, completed: 8,  cancelled: 1 },
  { date: "Feb 14", bookings: 21, revenue: 33600, completed: 20, cancelled: 1 },  // Valentine's peak
  { date: "Feb 15", bookings: 14, revenue: 22400, completed: 13, cancelled: 1 },
  { date: "Feb 16", bookings: 12, revenue: 19200, completed: 12, cancelled: 0 },
  { date: "Feb 17", bookings: 10, revenue: 16000, completed: 9,  cancelled: 1 },
  { date: "Feb 18", bookings: 13, revenue: 20800, completed: 12, cancelled: 1 },
  { date: "Feb 19", bookings: 17, revenue: 27200, completed: 16, cancelled: 1 },
  { date: "Feb 20", bookings: 11, revenue: 17600, completed: 11, cancelled: 0 },
  { date: "Feb 21", bookings: 14, revenue: 22400, completed: 13, cancelled: 1 },
  { date: "Feb 22", bookings: 16, revenue: 25600, completed: 15, cancelled: 1 },
  { date: "Feb 23", bookings: 12, revenue: 19200, completed: 11, cancelled: 1 },
  { date: "Feb 24", bookings: 9,  revenue: 14400, completed: 9,  cancelled: 0 },
  { date: "Feb 25", bookings: 15, revenue: 24000, completed: 14, cancelled: 1 },
  { date: "Feb 26", bookings: 19, revenue: 30400, completed: 18, cancelled: 1 },
  { date: "Feb 27", bookings: 13, revenue: 20800, completed: 12, cancelled: 1 },
  { date: "Feb 28", bookings: 18, revenue: 28800, completed: 17, cancelled: 1 },
];

// ─── Weekly Bookings (last 12 weeks) ─────────────────────────────────────────

export interface WeeklyBooking {
  week:     string;
  bookings: number;
  revenue:  number;
}

export const WEEKLY_BOOKINGS: WeeklyBooking[] = [
  { week: "W1 Dec", bookings: 58,  revenue: 92800  },
  { week: "W2 Dec", bookings: 72,  revenue: 115200  },
  { week: "W3 Dec", bookings: 81,  revenue: 129600  },
  { week: "W4 Dec", bookings: 94,  revenue: 150400  },
  { week: "W1 Jan", bookings: 46,  revenue: 73600   },
  { week: "W2 Jan", bookings: 52,  revenue: 83200   },
  { week: "W3 Jan", bookings: 63,  revenue: 100800  },
  { week: "W4 Jan", bookings: 78,  revenue: 124800  },
  { week: "W1 Feb", bookings: 54,  revenue: 86400   },
  { week: "W2 Feb", bookings: 68,  revenue: 108800  },
  { week: "W3 Feb", bookings: 83,  revenue: 132800  },
  { week: "W4 Feb", bookings: 87,  revenue: 139200  },
];

// ─── Monthly Bookings (last 6 months) ─────────────────────────────────────────

export interface MonthlyBooking {
  month:    string;
  bookings: number;
  revenue:  number;
  vendors:  number;
}

export const MONTHLY_BOOKINGS: MonthlyBooking[] = [
  { month: "Sep 25", bookings: 198, revenue: 316800,  vendors: 28 },
  { month: "Oct 25", bookings: 224, revenue: 358400,  vendors: 32 },
  { month: "Nov 25", bookings: 248, revenue: 396800,  vendors: 35 },
  { month: "Dec 25", bookings: 312, revenue: 499200,  vendors: 38 },
  { month: "Jan 26", bookings: 278, revenue: 444800,  vendors: 40 },
  { month: "Feb 26", bookings: 312, revenue: 499200,  vendors: 42 },
];

// ─── Category Breakdown ───────────────────────────────────────────────────────

export interface CategoryStat {
  name:       string;
  icon:       string;
  bookings:   number;
  revenue:    number;
  pct:        number;          // % of total bookings
  color:      string;          // tailwind bg color
  trend:      "up" | "down" | "stable";
  trendPct:   number;
}

export const CATEGORY_STATS: CategoryStat[] = [
  { name: "Cleaning",        icon: "🧹", bookings: 87,  revenue: 156600, pct: 27.9, color: "bg-violet-500",  trend: "up",     trendPct: 18  },
  { name: "AC Service",      icon: "❄️", bookings: 64,  revenue: 115200, pct: 20.5, color: "bg-blue-500",    trend: "up",     trendPct: 12  },
  { name: "Plumbing",        icon: "🔧", bookings: 52,  revenue: 93600,  pct: 16.7, color: "bg-cyan-500",    trend: "stable", trendPct: 2   },
  { name: "Electrical",      icon: "⚡", bookings: 41,  revenue: 73800,  pct: 13.1, color: "bg-amber-500",   trend: "up",     trendPct: 8   },
  { name: "Painting",        icon: "🎨", bookings: 28,  revenue: 50400,  pct: 9.0,  color: "bg-rose-500",    trend: "down",   trendPct: -5  },
  { name: "Pest Control",    icon: "🐛", bookings: 21,  revenue: 37800,  pct: 6.7,  color: "bg-emerald-500", trend: "up",     trendPct: 22  },
  { name: "Carpentry",       icon: "🪚", bookings: 12,  revenue: 21600,  pct: 3.8,  color: "bg-orange-500",  trend: "down",   trendPct: -10 },
  { name: "Appliance Repair",icon: "🔌", bookings: 7,   revenue: 12600,  pct: 2.2,  color: "bg-slate-500",   trend: "stable", trendPct: 0   },
];

// ─── Peak Hours Heatmap (hour x day-of-week) ──────────────────────────────────
// 7 rows = Mon-Sun, 18 cols = 6am to 11pm

export interface HeatmapCell {
  day:    number;   // 0=Mon, 6=Sun
  hour:   number;   // 6 to 23
  value:  number;   // number of bookings
}

const heatmapRaw: number[][] = [
  // Mon   6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22
  [1, 2, 5, 9, 12, 14, 10, 8, 11, 13, 15, 18, 12, 7, 4, 2, 1],
  // Tue
  [1, 2, 4, 8, 11, 13, 9,  8, 10, 12, 14, 17, 11, 6, 4, 2, 1],
  // Wed
  [1, 3, 5, 9, 13, 15, 11, 9, 12, 14, 16, 19, 13, 8, 5, 2, 1],
  // Thu
  [1, 2, 5, 8, 12, 14, 10, 9, 11, 13, 15, 17, 12, 7, 4, 2, 1],
  // Fri
  [2, 3, 6, 10,14, 16, 12,10, 13, 15, 17, 20, 16, 10,6, 3, 2],
  // Sat
  [3, 5, 9, 14,18, 21, 18,15, 17, 19, 22, 24, 20, 14,9, 5, 3],
  // Sun
  [2, 4, 8, 12,16, 19, 17,14, 16, 18, 20, 22, 18, 12,8, 4, 2],
];

export const HEATMAP_DATA: HeatmapCell[] = heatmapRaw.flatMap((row, dayIdx) =>
  row.map((value, hourOffset) => ({
    day:   dayIdx,
    hour:  6 + hourOffset,
    value,
  }))
);

export const HEATMAP_DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HEATMAP_HOURS = Array.from({ length: 17 }, (_, i) => {
  const h = 6 + i;
  return h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
});

// ─── Area-wise Performance ────────────────────────────────────────────────────

export interface AreaStat {
  area:         string;
  pincode:      string;
  bookings:     number;
  revenue:      number;
  avgRating:    number;
  activeVendors:number;
  disputeRate:  number;
  coverage:     "high" | "medium" | "low";  // vendor coverage
}

export const AREA_STATS: AreaStat[] = [
  { area: "Indirapuram",       pincode: "201014", bookings: 72,  revenue: 129600, avgRating: 4.5, activeVendors: 12, disputeRate: 2.8, coverage: "high"   },
  { area: "Vaishali",          pincode: "201010", bookings: 58,  revenue: 104400, avgRating: 4.4, activeVendors: 10, disputeRate: 3.1, coverage: "high"   },
  { area: "Kaushambi",         pincode: "201010", bookings: 44,  revenue: 79200,  avgRating: 4.3, activeVendors: 8,  disputeRate: 3.6, coverage: "medium" },
  { area: "Govindpuram",       pincode: "201013", bookings: 38,  revenue: 68400,  avgRating: 4.2, activeVendors: 6,  disputeRate: 4.2, coverage: "medium" },
  { area: "Crossings Republik",pincode: "201016", bookings: 31,  revenue: 55800,  avgRating: 4.4, activeVendors: 5,  disputeRate: 3.2, coverage: "medium" },
  { area: "Raj Nagar",         pincode: "201002", bookings: 28,  revenue: 50400,  avgRating: 4.1, activeVendors: 4,  disputeRate: 5.1, coverage: "low"    },
  { area: "Loni",              pincode: "201102", bookings: 19,  revenue: 34200,  avgRating: 3.9, activeVendors: 3,  disputeRate: 6.3, coverage: "low"    },
  { area: "Sahibabad",         pincode: "201005", bookings: 22,  revenue: 39600,  avgRating: 4.0, activeVendors: 3,  disputeRate: 4.8, coverage: "low"    },
];

// ─── Dispute Rate Trend (last 8 weeks) ───────────────────────────────────────

export interface DisputeTrend {
  week:          string;
  total:         number;
  disputes:      number;
  rate:          number;    // %
  resolved:      number;
  avgResolveDays:number;
}

export const DISPUTE_TREND: DisputeTrend[] = [
  { week: "W1 Jan", total: 46,  disputes: 3, rate: 6.5, resolved: 3, avgResolveDays: 2.1 },
  { week: "W2 Jan", total: 52,  disputes: 3, rate: 5.8, resolved: 2, avgResolveDays: 1.8 },
  { week: "W3 Jan", total: 63,  disputes: 4, rate: 6.3, resolved: 4, avgResolveDays: 2.4 },
  { week: "W4 Jan", total: 78,  disputes: 4, rate: 5.1, resolved: 3, avgResolveDays: 1.9 },
  { week: "W1 Feb", total: 54,  disputes: 3, rate: 5.6, resolved: 3, avgResolveDays: 1.7 },
  { week: "W2 Feb", total: 68,  disputes: 3, rate: 4.4, resolved: 3, avgResolveDays: 1.5 },
  { week: "W3 Feb", total: 83,  disputes: 3, rate: 3.6, resolved: 2, avgResolveDays: 1.4 },
  { week: "W4 Feb", total: 87,  disputes: 3, rate: 3.4, resolved: 2, avgResolveDays: 1.3 },
];

// ─── Vendor Performance (Analytics-level, high volume) ───────────────────────

export interface VendorAnalytics {
  id:             string;
  name:           string;
  category:       string;
  icon:           string;
  totalJobs:      number;
  completionRate: number;
  avgRating:      number;
  revenue:        number;
  disputeCount:   number;
  responseRate:   number;
  avgResponseMin: number;   // avg minutes to accept a lead
  repeatCustomers:number;   // %
  trend:          "up" | "down" | "stable";
  trendJobs:      number;   // +/- jobs vs last month
}

export const VENDOR_ANALYTICS: VendorAnalytics[] = [
  { id: "V001", name: "Kumar Home Services",  category: "Plumbing",        icon: "🔧", totalJobs: 87,  completionRate: 96, avgRating: 4.7, revenue: 148000, disputeCount: 1,  responseRate: 92, avgResponseMin: 8,  repeatCustomers: 38, trend: "up",     trendJobs: +14 },
  { id: "V004", name: "CleanPro Services",    category: "Cleaning",        icon: "🧹", totalJobs: 92,  completionRate: 98, avgRating: 4.8, revenue: 112000, disputeCount: 0,  responseRate: 96, avgResponseMin: 5,  repeatCustomers: 52, trend: "up",     trendJobs: +18 },
  { id: "V002", name: "CoolBreeze AC",        category: "AC Service",      icon: "❄️", totalJobs: 64,  completionRate: 93, avgRating: 4.5, revenue: 138000, disputeCount: 2,  responseRate: 88, avgResponseMin: 11, repeatCustomers: 29, trend: "up",     trendJobs: +9  },
  { id: "V003", name: "SparkFix Electrical",  category: "Electrical",      icon: "⚡", totalJobs: 48,  completionRate: 91, avgRating: 4.3, revenue: 62000,  disputeCount: 1,  responseRate: 85, avgResponseMin: 14, repeatCustomers: 21, trend: "stable", trendJobs: +2  },
  { id: "V007", name: "PestGuard Pro",        category: "Pest Control",    icon: "🐛", totalJobs: 21,  completionRate: 95, avgRating: 4.4, revenue: 38000,  disputeCount: 0,  responseRate: 90, avgResponseMin: 10, repeatCustomers: 33, trend: "up",     trendJobs: +6  },
  { id: "V010", name: "ColorCraft Painters",  category: "Painting",        icon: "🎨", totalJobs: 18,  completionRate: 89, avgRating: 4.6, revenue: 48000,  disputeCount: 1,  responseRate: 84, avgResponseMin: 18, repeatCustomers: 17, trend: "stable", trendJobs: 0   },
  { id: "V006", name: "HandyMan Co.",         category: "Carpentry",       icon: "🪚", totalJobs: 12,  completionRate: 75, avgRating: 3.3, revenue: 14400,  disputeCount: 3,  responseRate: 61, avgResponseMin: 32, repeatCustomers: 8,  trend: "down",   trendJobs: -5  },
  { id: "V005", name: "QuickFix Services",    category: "Appliance Repair",icon: "🔌", totalJobs: 7,   completionRate: 64, avgRating: 3.1, revenue: 8400,   disputeCount: 4,  responseRate: 52, avgResponseMin: 41, repeatCustomers: 4,  trend: "down",   trendJobs: -8  },
];