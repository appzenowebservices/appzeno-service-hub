import { createHash, randomBytes } from "node:crypto";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { compare, genSalt, hash } from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { getFirebaseAdminAuth } from "~/server/firebase/admin";
import {
  PATRA_TX_RESET_PASSWORD,
  PATRA_TX_WELCOME,
  sendPatraTx,
} from "~/server/patra/client";

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "there";
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Finds every active account for an e-mail. `email` is not unique by design
 * (one person can hold CUSTOMER + VENDOR + AGENT rows), so a reset link resets
 * all of them together. MongoDB/Prisma has no `mode: "insensitive"`, so after
 * an exact match fails we fall back to a small in-memory comparison for legacy
 * mixed-case rows.
 */
async function findActiveUsersByEmail(db: PrismaClient, email: string) {
  const normalized = email.trim().toLowerCase();
  const select = { id: true, fullName: true, email: true } as const;
  const exact = await db.user.findMany({
    where: { email: normalized, isActive: true },
    select,
  });
  if (exact.length > 0) return exact;

  const all = await db.user.findMany({
    where: { isActive: true, email: { not: null } },
    select,
  });
  return all.filter((u) => (u.email ?? "").trim().toLowerCase() === normalized);
}

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ mobile: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const identifier = input.mobile.trim();
      const emailIdentifier = identifier.includes("@") ? identifier.toLowerCase() : identifier;

      // The env-root superadmin has its own door (/auth/superadmin). Detect it
      // before the DB lookup so the standard login page can redirect even
      // before `prisma/ensure-superadmin.mjs` has created its DB row.
      const envMobile = (process.env.SUPERADMIN_MOBILE ?? "").trim();
      if (envMobile !== "" && identifier === envMobile) {
        return { ok: false as const, reason: "ENV_ADMIN" as const };
      }

      const user = await ctx.db.user.findFirst({
        where: { OR: [{ mobile: identifier }, { email: emailIdentifier }] },
      });

      // Structured result instead of throwing: the login page needs to tell
      // "no account", "wrong password", "blocked", "unverified email" apart
      // to drive the right UX.
      if (!user) return { ok: false as const, reason: "NO_ACCOUNT" as const };
      if (!user.passwordHash) return { ok: false as const, reason: "NO_PASSWORD" as const };
      if (!user.isActive) {
        return { ok: false as const, reason: "BLOCKED" as const, message: "Account blocked. Contact support." };
      }

      const valid = await compare(input.password, user.passwordHash);
      if (!valid) return { ok: false as const, reason: "WRONG_PASSWORD" as const };
      if (!user.isVerified) return { ok: false as const, reason: "EMAIL_UNVERIFIED" as const };

      return {
        ok: true as const,
        id: user.id,
        mobile: user.mobile,
        role: user.role,
        fullName: user.fullName,
        city: user.city,
        isVerified: user.isVerified,
        mobileVerified: user.mobileVerified,
      };
    }),

  /**
   * Verifies the login-time mobile OTP. Public (no session yet) but requires the
   * account password again, so it can't be abused to flip another user's flag.
   */
  verifyMobileOtp: publicProcedure
    .input(z.object({ mobile: z.string(), password: z.string(), idToken: z.string().min(20) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({ where: { mobile: input.mobile.trim() } });
      if (!user?.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      if (!user.isActive) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Account blocked. Contact support." });
      }
      const valid = await compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      if (user.mobileVerified) {
        return { ok: true, already: true };
      }

      const adminAuth = getFirebaseAdminAuth();
      if (!adminAuth) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Mobile verification is not configured on the server. Please try again later." });
      }

      let decoded;
      try {
        decoded = await adminAuth.verifyIdToken(input.idToken);
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired verification code. Please request a new OTP." });
      }

      const norm = (v: string) => v.replace(/\D/g, "").slice(-10);
      const phone = norm(decoded.phone_number ?? "");
      if (!phone) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No phone number attached to the verification. Please request a new OTP." });
      }
      if (phone !== norm(user.mobile)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You verified a different number than your account mobile." });
      }

      await ctx.db.user.update({
        where: { id: user.id },
        data: { mobileVerified: true, mobileVerifiedAt: new Date() },
      });
      console.log(`[auth] mobile verified at login for ${user.id} (${phone})`);
      return { ok: true };
    }),

  /**
   * Forgot password: e-mails a single-use Patra reset link valid for 30 min.
   * Always reports success so the form cannot be used to enumerate accounts.
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().trim().email("Enter a valid e-mail address") }))
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const users = await findActiveUsersByEmail(ctx.db, email);
      if (users.length === 0) return { ok: true as const };

      const token = randomBytes(32).toString("hex");
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // One link resets every role account that shares this e-mail address.
      await ctx.db.user.updateMany({
        where: { id: { in: users.map((u) => u.id) } },
        data: { passwordResetTokenHash: tokenHash, passwordResetExpires: expiresAt },
      });

      const resetUrl = `${appUrl()}/auth/reset-password?token=${token}`;
      // Local testing only: lets you open the exact e-mailed link without an
      // inbox. Never printed in production.
      if (process.env.NODE_ENV !== "production") {
        console.log(`[auth] dev reset link: ${resetUrl}`);
      }
      void sendPatraTx({
        templateId: PATRA_TX_RESET_PASSWORD,
        to: email,
        data: { name: firstName(users[0].fullName), resetUrl },
      }).catch((err) =>
        console.error("[auth] password-reset e-mail failed:", err instanceof Error ? err.message : err),
      );

      console.log(`[auth] password-reset link issued for ${users.length} account(s)`);
      return { ok: true as const };
    }),

  /** Sets a new password from the e-mailed single-use token. */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().trim().min(20, "Reset link is incomplete"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tokenHash = hashResetToken(input.token);
      const user = await ctx.db.user.findFirst({
        where: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpires: { gt: new Date() },
        },
        select: { id: true, email: true, isActive: true },
      });
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This reset link is invalid or has expired. Please request a new one.",
        });
      }
      if (!user.isActive) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Account blocked. Contact support." });
      }

      const salt = await genSalt(10);
      const passwordHash = await hash(input.password, salt);
      const targets = user.email
        ? await findActiveUsersByEmail(ctx.db, user.email)
        : [{ id: user.id }];

      // Using the e-mailed link proves ownership of the address, so the
      // account's e-mail gate is cleared along with the password.
      await ctx.db.user.updateMany({
        where: { id: { in: targets.map((t) => t.id) } },
        data: {
          passwordHash,
          passwordResetTokenHash: null,
          passwordResetExpires: null,
          isVerified: true,
        },
      });
      console.log(`[auth] password reset completed for ${targets.length} account(s)`);
      return { ok: true as const };
    }),

  register: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(2),
        mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
        email: z.string().email().optional(),
        // Passwordless registration (sign in with Google); kept optional for
        // backwards compatibility with older clients.
        password: z.string().min(6).optional(),
        role: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
        city: z.string().min(2),
        state: z.string().min(2),
        businessName: z.string().optional(),
        serviceCategories: z.array(z.string()).max(20).optional(),
        yearsOfExperience: z.number().int().min(0).max(60).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email?.trim().toLowerCase();
      // Mobile is the global login key (unique across all roles). Email may
      // repeat across roles, but not twice within the SAME role.
      const existing = await ctx.db.user.findFirst({
        where: {
          OR: [
            { mobile: input.mobile },
            ...(email ? [{ email, role: input.role }] : []),
          ],
        },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            existing.mobile === input.mobile
              ? "This mobile number is already registered"
              : "This email is already registered for the selected role",
        });
      }
      const salt = await genSalt(10);
      const passwordHash = input.password ? await hash(input.password, salt) : undefined;

      const user = await ctx.db.user.create({
        data: {
          fullName: input.fullName,
          mobile: input.mobile,
          email,
          passwordHash,
          role: input.role,
          city: input.city,
          state: input.state,
          // always false at signup — flipped only by email confirmation
          // (Omnipost subscriber.confirmed webhook); login is blocked until then.
          isVerified: false,
        },
      });

      if (input.role === "CUSTOMER") {
        await ctx.db.customerProfile.create({
          data: { userId: user.id, referralCode: `ADD${user.id.slice(-6).toUpperCase()}`, walletBalance: 100 },
        });
        await ctx.db.walletTransaction.create({
          data: { userId: user.id, type: "credit", amount: 100, description: "Welcome bonus", balanceAfter: 100 },
        });
      } else if (input.role === "VENDOR") {
        await ctx.db.vendorProfile.create({
          data: {
            userId: user.id,
            businessName: input.businessName ?? `${input.fullName} Services`,
            yearsOfExperience: input.yearsOfExperience ?? 1,
            serviceCategories: input.serviceCategories ?? [],
            serviceAreaPincodes: [],
            workingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
            timeSlots: [{ id: "m1", label: "9AM-12PM", start: "09:00", end: "12:00" }],
            basePricing: { basePrice: 299, emergencyCharge: 150, visitingCharge: 99 },
          },
        });
      }

      // Branded welcome mail via Patra template #10. Fire-and-forget: mail
      // outages must never fail or delay account creation.
      if (email) {
        void sendPatraTx({
          templateId: PATRA_TX_WELCOME,
          to: email,
          data: {
            name: firstName(input.fullName),
            dashboardUrl: `${appUrl()}${input.role === "VENDOR" ? "/vendor" : "/services"}`,
          },
        }).catch((err) =>
          console.error("[auth] welcome e-mail failed:", err instanceof Error ? err.message : err),
        );
      }

      return { id: user.id, mobile: user.mobile, role: user.role };
    }),
});

export type AuthRouter = typeof authRouter;