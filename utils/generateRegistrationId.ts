/**
 * Generates a unique ADDIES registration ID.
 *
 * Format:  ADDIES{PREFIX}{DDMMYY}{4-digit counter}
 * Examples:
 *   Customer → ADDIESCUST2602260001
 *   Vendor   → ADDIESVEND2602260001
 *   Agent    → ADDIESAGEN2602260001
 *
 * Counter resets to 0001 each new day (per prefix).
 */
export type RegistrationPrefix = "CUST" | "VEND" | "AGEN";

export function generateRegistrationId(prefix: RegistrationPrefix): string {
  const now    = new Date();
  const dd     = String(now.getDate()).padStart(2, "0");
  const mm     = String(now.getMonth() + 1).padStart(2, "0");
  const yy     = String(now.getFullYear()).slice(-2);
  const dateKey = `${dd}${mm}${yy}`;

  const storageKey = `addies_reg_counter_${prefix}_${dateKey}`;
  const current    = parseInt(localStorage.getItem(storageKey) ?? "0", 10);
  const next       = current + 1;
  localStorage.setItem(storageKey, String(next));

  const counter = String(next).padStart(4, "0");
  return `ADDIES${prefix}${dateKey}${counter}`;
}
