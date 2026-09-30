import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { compare, genSalt, hash } from "bcryptjs";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ mobile: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { OR: [{ mobile: input.mobile.trim() }, { email: input.mobile.trim() }] },
      });

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

      return { id: user.id, mobile: user.mobile, role: user.role, fullName: user.fullName, city: user.city, isVerified: user.isVerified };
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