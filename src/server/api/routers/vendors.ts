import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
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
      // Notify the vendor of the decision (surfaces in their notification bell).
      await ctx.db.notification.create({
        data: {
          userId: user.id,
          type: "kyc",
          title: input.approved ? "KYC approved 🎉" : "KYC not approved",
          message: input.approved
            ? "Congratulations! Your KYC is approved — you can now receive leads."
            : "Your KYC was not approved. Please review your documents and resubmit.",
          actionUrl: "/vendor",
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

  // Persist a single KYC doc URL immediately on upload (survives refresh).
  setKycDoc: protectedProcedure
    .input(z.object({ aadhaarDoc: z.string().optional(), panDoc: z.string().optional(), profilePhoto: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session.user as { id: string }).id;
      const profile = await ctx.db.vendorProfile.findFirst({ where: { userId } });
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor profile not found" });
      const patch: Record<string, unknown> = {};
      if (input.aadhaarDoc !== undefined) patch.aadhaarDoc = input.aadhaarDoc === "" ? null : input.aadhaarDoc;
      if (input.panDoc !== undefined) patch.panDoc = input.panDoc === "" ? null : input.panDoc;
      if (input.profilePhoto !== undefined) patch.profilePhoto = input.profilePhoto === "" ? null : input.profilePhoto;
      return ctx.db.vendorProfile.update({ where: { id: profile.id }, data: patch as never });
    }),

  submitKyc: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2).optional(),
        yearsOfExperience: z.number().int().min(0).max(60).optional(),
        aadhaarDoc: z.string().url().optional(),
        panDoc: z.string().url().optional(),
        profilePhoto: z.string().url().optional(),
        gst: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session.user as { id: string }).id;
      const profile = await ctx.db.vendorProfile.findFirst({ where: { userId } });
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor profile not found" });
      if (profile.isApproved) throw new TRPCError({ code: "BAD_REQUEST", message: "Already approved" });

      // Everything is optional: a partial submission stays PENDING; only when
      // the required pieces (business name + all three docs) are present does
      // it move to UNDER_REVIEW.
      const complete =
        !!input.businessName &&
        !!input.yearsOfExperience &&
        !!input.aadhaarDoc &&
        !!input.panDoc &&
        !!input.profilePhoto;

      return ctx.db.vendorProfile.update({
        where: { id: profile.id },
        data: {
          ...(input.businessName !== undefined ? { businessName: input.businessName } : {}),
          ...(input.yearsOfExperience !== undefined ? { yearsOfExperience: input.yearsOfExperience } : {}),
          ...(input.aadhaarDoc !== undefined ? { aadhaarDoc: input.aadhaarDoc } : {}),
          ...(input.panDoc !== undefined ? { panDoc: input.panDoc } : {}),
          ...(input.profilePhoto !== undefined ? { profilePhoto: input.profilePhoto } : {}),
          ...(input.gst !== undefined ? { gst: input.gst?.trim() === "" ? null : input.gst } : {}),
          kycStatus: complete ? "UNDER_REVIEW" : "PENDING",
          ...(complete ? { kycSubmittedAt: new Date() } : {}),
        },
      });
    }),

  remindKyc: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: input.id, role: "VENDOR" },
        include: { vendorProfile: true },
      });
      if (!user?.vendorProfile) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor profile not found" });

      // Build the missing-items list from what KYC requires.
      const missing: string[] = [];
      const p = user.vendorProfile;
      if (!p.businessName.trim()) missing.push("Business name");
      if (!p.yearsOfExperience) missing.push("Years of experience");
      if (!p.aadhaarDoc) missing.push("Aadhaar card");
      if (!p.panDoc) missing.push("PAN card");
      if (!p.profilePhoto) missing.push("Profile photo");
      if (!p.gst) missing.push("GSTIN");

      if (missing.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nothing missing — KYC is complete" });
      }

      // Store a notification for the vendor (surfaces in their bell / dashboard).
      await ctx.db.notification.create({
        data: {
          userId: user.id,
          type: "kyc",
          title: "KYC reminder — items missing",
          message: `Please complete your KYC: ${missing.join(", ")}.`,
          actionUrl: "/vendor",
        },
      });

      return { missing, sent: true };
    }),
});

export type VendorsRouter = typeof vendorsRouter;