export type UserRole = "customer" | "vendor" | "agent" | "admin" | "guest";

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  role: UserRole;
  city: string;
  avatar?: string;
  preferredLanguage?: "en" | "hi";
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Customer extends User {
  role: "customer";
  referralCode?: string;
  walletBalance: number;
  savedAddresses: Address[];
}

export interface Vendor extends User {
  role: "vendor";
  businessName: string;
  yearsOfExperience: number;
  serviceCategories: string[];
  serviceAreaPincodes: string[];
  workingDays: WeekDay[];
  timeSlots: TimeSlot[];
  kycStatus: KYCStatus;
  subscriptionPlan: SubscriptionPlan;
  reliabilityScore: number;
  rating: number;
  totalReviews: number;
  basePricing: PricingConfig;
  isApproved: boolean;
}

export interface CityAgent extends User {
  role: "agent";
  assignedCity: string;
  commissionPercent: number;
  officeAddress: string;
  gst?: string;
  bankDetails: BankDetails;
}

export interface Address {
  id: string;
  label: string;
  houseNo: string;
  landmark?: string;
  area: string;
  pincode: string;
  city: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  image?: string;
  description?: string;
  commissionPercent: number;
  subCategories: SubCategory[];
  isActive: boolean;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  unit: string;
  isActive: boolean;
}

export type BookingStatus = "pending" | "assigned" | "accepted" | "in_progress" | "completed" | "cancelled" | "disputed";
export type UrgencyLevel = "normal" | "emergency";
export type PaymentMethod = "cod" | "upi" | "card" | "wallet";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface Booking {
  id: string;
  customerId: string;
  customer?: Customer;
  vendorId?: string;
  vendor?: Vendor;
  categoryId: string;
  subCategoryId: string;
  description: string;
  images: string[];
  urgency: UrgencyLevel;
  address: Address;
  preferredDate: string;
  timeSlot: TimeSlot;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  baseAmount: number;
  surgeAmount: number;
  visitingCharge: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  bookingId: string;
  booking: Booking;
  vendorId: string;
  sentAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  vendorId: string;
  rating: number;
  comment?: string;
  reply?: string;
  createdAt: string;
}

export type WalletTxType = "credit" | "debit";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTxType;
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export type SubscriptionPlan = "free" | "silver" | "gold" | "platinum";

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  monthlyFee: number;
  leadPriorityLevel: number;
  maxLeadsPerMonth: number;
  commissionDiscount: number;
  analyticsAccess: boolean;
  badgeVisible: boolean;
  features: string[];
}

export interface PricingConfig {
  basePrice: number;
  emergencyCharge: number;
  visitingCharge: number;
}

export type KYCStatus = "pending" | "under_review" | "approved" | "rejected";

export interface BankDetails {
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
  agentId?: string;
  pincodes: string[];
}

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}

export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Notification {
  id: string;
  userId: string;
  type: "booking" | "offer" | "system" | "payment" | "lead";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
