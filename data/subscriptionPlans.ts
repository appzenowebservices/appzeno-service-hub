// src/data/subscriptionPlans.ts

import { SubscriptionPlanConfig } from "../types";

export const SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: "free",
    name: "Free",
    monthlyFee: 0,
    leadPriorityLevel: 1,
    maxLeadsPerMonth: 5,
    commissionDiscount: 0,
    analyticsAccess: false,
    badgeVisible: false,
    features: [
      "5 leads per month",
      "Standard listing position",
      "Basic profile page",
      "Commission: Standard rate",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    monthlyFee: 499,
    leadPriorityLevel: 2,
    maxLeadsPerMonth: 20,
    commissionDiscount: 2,
    analyticsAccess: false,
    badgeVisible: true,
    features: [
      "20 leads per month",
      "Silver badge on profile",
      "Priority over Free vendors",
      "2% commission discount",
      "WhatsApp lead alerts",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    monthlyFee: 999,
    leadPriorityLevel: 3,
    maxLeadsPerMonth: 60,
    commissionDiscount: 5,
    analyticsAccess: true,
    badgeVisible: true,
    features: [
      "60 leads per month",
      "Gold badge on profile",
      "Priority over Silver vendors",
      "5% commission discount",
      "Basic analytics dashboard",
      "Featured in category listings",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    monthlyFee: 1999,
    leadPriorityLevel: 4,
    maxLeadsPerMonth: 999,
    commissionDiscount: 10,
    analyticsAccess: true,
    badgeVisible: true,
    features: [
      "Unlimited leads",
      "Platinum badge on profile",
      "Top priority listing",
      "10% commission discount",
      "Full analytics + revenue insights",
      "Homepage featured vendor slot",
      "Dedicated support",
    ],
  },
];

export const PLAN_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  free:     { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200",  badge: "bg-slate-100 text-slate-500" },
  silver:   { bg: "bg-slate-100", text: "text-slate-700",  border: "border-slate-300",  badge: "bg-slate-200 text-slate-600" },
  gold:     { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", badge: "bg-yellow-100 text-yellow-700" },
  platinum: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-300", badge: "bg-violet-100 text-violet-700" },
};