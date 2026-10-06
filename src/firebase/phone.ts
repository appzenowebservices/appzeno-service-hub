import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseApp } from "~/firebase/client";

/**
 * Firebase Phone Auth (SMS OTP) for mobile verification.
 * Web equivalent of the console's "Phone Number Verification" — the console
 * test token is Android SIM-less testing only and doesn't work on the web.
 */

let recaptcha: RecaptchaVerifier | null = null;
let pending: ConfirmationResult | null = null;

export function isPhoneAuthAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(getFirebaseApp());
}

/** Sends the SMS OTP to the account mobile (10-digit IN number). */
export async function startPhoneVerification(mobile10: string, containerId: string): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured (check NEXT_PUBLIC_FIREBASE_*).");
  const auth = getAuth(app);
  auth.useDeviceLanguage();

  // Fresh verifier each attempt — reusing a consumed one throws.
  if (recaptcha) {
    try { recaptcha.clear(); } catch { /* already cleared */ }
    recaptcha = null;
  }
  recaptcha = new RecaptchaVerifier(auth, containerId, { size: "invisible" });

  const digits = mobile10.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) throw new Error("Enter a valid 10-digit mobile number.");
  pending = await signInWithPhoneNumber(auth, `+91${digits}`, recaptcha);
}

/** Confirms the 6-digit OTP and returns a Firebase ID token for server verification. */
export async function confirmPhoneCode(code: string): Promise<string> {
  if (!pending) throw new Error("No OTP request in progress — send the code again.");
  const credential = await pending.confirm(code.trim());
  pending = null;
  if (recaptcha) {
    try { recaptcha.clear(); } catch { /* ignore */ }
    recaptcha = null;
  }
  return credential.user.getIdToken();
}

const ERROR_MESSAGES: Record<string, string> = {
  "auth/operation-not-allowed": "Phone verification isn't enabled for this project — enable the Phone sign-in provider in Firebase Console.",
  "auth/billing-not-enabled": "SMS verification needs billing enabled on Firebase (Blaze plan).",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/quota-exceeded": "SMS quota exceeded for now. Please try again later.",
  "auth/invalid-phone-number": "This mobile number can't receive SMS. Please check it.",
  "auth/invalid-verification-code": "Incorrect OTP — check the 6-digit code and try again.",
  "auth/code-expired": "This OTP has expired. Request a new one.",
  "auth/session-expired": "The verification session expired. Resend the OTP.",
  "auth/captcha-check-failed": "Security check failed. Refresh the page and try again.",
  "auth/missing-recaptcha-token": "Security check failed. Refresh the page and try again.",
  "auth/network-request-failed": "Network error — check your connection and retry.",
  "auth/operation-not-supported-in-this-environment": "This browser can't run SMS verification. Try Chrome or Edge.",
};

/** Maps Firebase Auth error codes (and generic errors) to user-facing text. */
export function phoneAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? "";
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (error instanceof Error && error.message) return error.message;
  return "Could not complete mobile verification. Please try again.";
}
