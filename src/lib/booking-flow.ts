/**
 * Shared booking status flow — used by the API for enforcement and by the
 * customer/vendor/agent consoles to show only legal next actions.
 *
 * Lifecycle:
 *   PENDING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED
 * Any active state may be CANCELLED; IN_PROGRESS/COMPLETED may be DISPUTED.
 */

export const BOOKING_FLOW = ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"] as const;
export const BOOKING_STATUSES = [...BOOKING_FLOW, "CANCELLED", "DISPUTED"] as const;

export type BookingStatusValue = (typeof BOOKING_STATUSES)[number];
export type BookingActorRole = "ADMIN" | "AGENT" | "VENDOR" | "CUSTOMER" | "SYSTEM";

const TRANSITIONS: Record<BookingStatusValue, BookingStatusValue[]> = {
  PENDING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "DISPUTED"],
  COMPLETED: ["DISPUTED"],
  DISPUTED: ["COMPLETED", "CANCELLED"],
  CANCELLED: [],
};

const ROLE_TARGETS: Record<BookingActorRole, BookingStatusValue[]> = {
  ADMIN: [...BOOKING_STATUSES],
  // Agents own the area: they assign vendors and may cancel/escalate.
  AGENT: ["CANCELLED", "DISPUTED"],
  VENDOR: ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
  CUSTOMER: ["CANCELLED", "DISPUTED"],
  SYSTEM: [],
};

export function allowedNextStatuses(
  role: string,
  current: string,
): BookingStatusValue[] {
  const actor = (role || "SYSTEM").toUpperCase() as BookingActorRole;
  const from = (current || "").toUpperCase() as BookingStatusValue;
  const next = TRANSITIONS[from] ?? [];
  const allowed = ROLE_TARGETS[actor] ?? [];
  return next.filter((s) => allowed.includes(s));
}

export function canTransition(role: string, current: string, next: string): boolean {
  return allowedNextStatuses(role, current).includes(next.toUpperCase() as BookingStatusValue);
}

export function isFlowStatus(status: string): boolean {
  return (BOOKING_FLOW as readonly string[]).includes(status);
}
