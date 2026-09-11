import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const vendorsRouter = createTRPCRouter({
  getPublicProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: input.id, role: "VENDOR" },
        include: { vendorProfile: true },
      });
      return user;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findFirst({
        where: { id: input.id, role: "VENDOR" },
        include: { vendorProfile: true, VendorReviews: { take: 10, orderBy: { createdAt: "desc" } } },
      });
    }),

  list: publicProcedure
    .input(
      z.object({
        city: z.string().optional(),
        category: z.string().optional(),
        search: z.string().optional(),
        kycStatus: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
        isApproved: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        skip: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const vendors = await ctx.db.user.findMany({
        where: {
          role: "VENDOR",
          ...(input.city ? { city: { equals: input.city, mode: "insensitive" } } : {}),
          ...(input.search
            ? {
                OR: [
                  { fullName: { contains: input.search, mode: "insensitive" } },
                  { city: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(input.kycStatus || input.isApproved !== undefined
            ? {
                vendorProfile: {
                  is: {
                    ...(input.kycStatus ? { kycStatus: input.kycStatus } : {}),
                    ...(input.isApproved !== undefined ? { isApproved: input.isApproved } : {}),
                  },
                },
              }
            : {}),
        },
        take: input.limit,
        skip: input.skip,
        orderBy: { createdAt: "desc" },
        include: { vendorProfile: true },
      });
      // post-filter category since serviceCategories is String[]
      const filtered = input.category
        ? vendors.filter((v) =>
            (v.vendorProfile?.serviceCategories ?? []).some((c) =>
              c.toLowerCase().includes(input.category!.toLowerCase())
            )
          )
        : vendors;
      const total = await ctx.db.user.count({ where: { role: "VENDOR" } });
      return { vendors: filtered, total };
    }),

  getApprovedVendors: publicProcedure
    .input(z.object({ city: z.string().optional(), category: z.string().optional(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const vendors = await ctx.db.user.findMany({
        where: {
          role: "VENDOR",
          isActive: true,
          ...(input.city ? { city: { equals: input.city, mode: "insensitive" } } : {}),
          vendorProfile: { is: { isApproved: true } },
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: { vendorProfile: true },
      });
      if (input.category) {
        return vendors.filter((v) =>
          (v.vendorProfile?.serviceCategories ?? []).some((c) =>
            c.toLowerCase().includes(input.category!.toLowerCase())
          )
        );
      }
      return vendors;
    }),

  approveVendor: adminProcedure
    .input(z.object({ id: z.string(), approved: z.boolean().default(true) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({ where: { id: input.id, role: "VENDOR" }, include: { vendorProfile: true } });
      if (!user?.vendorProfile) throw new Error("Vendor profile not found");
      await ctx.db.vendorProfile.update({
        where: { id: user.vendorProfile.id },
        data: {
          isApproved: input.approved,
          kycStatus: input.approved ? "APPROVED" : "REJECTED",
        },
      });
      return ctx.db.user.findUnique({ where: { id: input.id }, include: { vendorProfile: true } });
    }),

  updateKyc: adminProcedure
    .input(z.object({ id: z.string(), kycStatus: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({ where: { id: input.id }, include: { vendorProfile: true } });
      if (!user?.vendorProfile) throw new Error("Vendor profile not found");
      return ctx.db.vendorProfile.update({
        where: { id: user.vendorProfile.id },
        data: {
          kycStatus: input.kycStatus,
          isApproved: input.kycStatus === "APPROVED",
        },
      });
    }),

  updateSubscription: protectedProcedure
    .input(z.object({ vendorId: z.string(), plan: z.enum(["FREE", "SILVER", "GOLD", "PLATINUM"]) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.vendorProfile.findFirst({ where: { userId: input.vendorId } });
      if (!profile) throw new Error("Vendor profile not found");
      return ctx.db.vendorProfile.update({ where: { id: profile.id }, data: { subscriptionPlan: input.plan } });
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({ where: { id: input.id }, data: { isActive: input.isActive } });
    }),

  getVendorStats: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.db.booking.findMany({ where: { vendorId: input.vendorId } });
      const completed = bookings.filter((b) => b.status === "COMPLETED");
      const totalEarnings = completed.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalJobs = bookings.length;
      const pendingJobs = bookings.filter((b) => ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(b.status)).length;
      const reviews = await ctx.db.review.findMany({ where: { vendorId: input.vendorId } });
      const rating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      return { totalEarnings, totalJobs, completedJobs: completed.length, pendingJobs, rating, totalReviews: reviews.length };
    }),

  getLeads: protectedProcedure
    .input(z.object({ vendorId: z.string(), status: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.lead.findMany({
        where: { vendorId: input.vendorId, ...(input.status ? { status: input.status } : {}) },
        include: { booking: true },
        orderBy: { sentAt: "desc" },
        take: 50,
      });
    }),
});

export type VendorsRouter = typeof vendorsRouter;