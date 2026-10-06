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
