import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) return `₹${(amount / 1000000).toFixed(1)}L`;
  if (amount >= 1000)    return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function formatTimeAgo(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d))     return `Today, ${format(d, "hh:mm a")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "hh:mm a")}`;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatMobile(mobile: string): string {
  const clean = mobile.replace(/\D/g, "").slice(-10);
  return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export const validators = {
  email:    (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Invalid email",
  mobile:   (val: string) => /^[6-9]\d{9}$/.test(val.replace(/\D/g, "")) || "Invalid mobile",
  pincode:  (val: string) => /^\d{6}$/.test(val) || "Invalid PIN code",
  aadhaar:  (val: string) => /^\d{12}$/.test(val.replace(/\s/g, "")) || "Invalid Aadhaar",
  pan:      (val: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase()) || "Invalid PAN",
  ifsc:     (val: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val.toUpperCase()) || "Invalid IFSC",
  password: (val: string) => val.length >= 8 || "Min 8 characters",
  required: (val: string) => (val && val.trim().length > 0) || "Required",
};

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending:      "bg-warning-light text-warning-dark",
    assigned:     "bg-primary-100 text-primary-700",
    accepted:     "bg-primary-100 text-primary-700",
    in_progress:  "bg-blue-100 text-blue-700",
    completed:    "bg-success-light text-success-dark",
    cancelled:    "bg-danger-light text-danger-dark",
    disputed:     "bg-orange-100 text-orange-700",
    approved:     "bg-success-light text-success-dark",
    rejected:     "bg-danger-light text-danger-dark",
    paid:         "bg-success-light text-success-dark",
    failed:       "bg-danger-light text-danger-dark",
  };
  return map[status] ?? "bg-neutral-100 text-neutral-600";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending:      "Pending",
    assigned:     "Assigned",
    accepted:     "Accepted",
    in_progress:  "In Progress",
    completed:    "Completed",
    cancelled:    "Cancelled",
    disputed:     "Disputed",
    approved:     "Approved",
    rejected:     "Rejected",
    paid:         "Paid",
    failed:       "Failed",
    under_review: "Under Review",
  };
  return map[status] ?? capitalize(status);
}
