import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { compare, genSalt, hash } from "bcryptjs";
import { getFirebaseAdminAuth } from "~/server/firebase/admin";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ mobile: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const identifier = input.mobile.trim();
      const user = await ctx.db.user.findFirst({
        where: { OR: [{ mobile: identifier }, { email: identifier }] },
      });

      // Structured result instead of throwing: the login page needs to tell
      // "no account", "wrong password", "blocked", "unverified email" and the
      // env superadmin (no DB password) apart to drive the right UX.
      if (!user) return { ok: false as const, reason: "NO_ACCOUNT" as const };
      if (!user.passwordHash) return { ok: false as const, reason: "ENV_ADMIN" as const };
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

  register: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(2),
        mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
        email: z.string().email().optional(),
        password: z.string().min(6),
        role: z.enum(["CUSTOMER", "VENDOR", "AGENT"]).default("CUSTOMER"),
        city: z.string().min(2),
        state: z.string().min(2),
        businessName: z.string().optional(),
        serviceCategories: z.array(z.string()).max(20).optional(),
        yearsOfExperience: z.number().int().min(0).max(60).optional(),
        officeAddress: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Mobile is the global login key (unique across all roles). Email may
      // repeat across roles, but not twice within the SAME role.
      const existing = await ctx.db.user.findFirst({
        where: {
          OR: [
            { mobile: input.mobile },
            ...(input.email ? [{ email: input.email, role: input.role }] : []),
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
      const passwordHash = await hash(input.password, salt);

      const user = await ctx.db.user.create({
        data: {
          fullName: input.fullName,
          mobile: input.mobile,
          email: input.email,
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
      } else if (input.role === "AGENT") {
        await ctx.db.agentProfile.create({
          data: { userId: user.id, assignedCity: input.city, officeAddress: input.officeAddress ?? `${input.city} office`, commissionPercent: 5 },
        });
      }

      return { id: user.id, mobile: user.mobile, role: user.role };
    }),
});

export type AuthRouter = typeof authRouter;