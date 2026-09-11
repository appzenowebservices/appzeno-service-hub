import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { z } from "zod";

const statusEnum = z.enum(["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"]);

export const bookingsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        subCategoryId: z.string(),
        description: z.string().min(5),
        images: z.array(z.string()).default([]),
        urgency: z.enum(["normal", "emergency"]).default("normal"),
        address: z.object({
          houseNo: z.string(),
          area: z.string(),
          pincode: z.string(),
          city: z.string(),
          landmark: z.string().optional(),
        }),
        preferredDate: z.string(),
        timeSlot: z.object({
          id: z.string(),
          label: z.string(),
          start: z.string(),
          end: z.string(),
        }),
        paymentMethod: z.enum(["cod", "upi", "card", "wallet"]),
        baseAmount: z.number(),
        surgeAmount: z.number().default(0),
        visitingCharge: z.number().default(0),
        totalAmount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customerId = (ctx.session.user as { id: string }).id;
      const booking = await ctx.db.booking.create({
        data: {
          customerId,
          ...input,
        },
      });
      // notify + wallet placeholder
      await ctx.db.notification.create({
        data: {
          userId: customerId,
          type: "booking",
          title: "Booking created",
          message: `Your booking ${booking.id.slice(-6)} has been placed`,
          actionUrl: `/customer/bookings/${booking.id}`,
        },
      });
      return booking;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.booking.findUnique({
        where: { id: input.id },
        include: { customer: true, vendor: true, Review: true, Lead: true },
      });
    }),

  getByCustomer: protectedProcedure
    .input(z.object({ customerId: z.string(), limit: z.number().min(1).max(100).default(10), status: statusEnum.optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.booking.findMany({
        where: { customerId: input.customerId, ...(input.status ? { status: input.status } : {}) },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: { vendor: { include: { vendorProfile: true } }, Review: true },
      });
    }),

  getByVendor: protectedProcedure
    .input(z.object({ vendorId: z.string(), limit: z.number().default(20), status: statusEnum.optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.booking.findMany({
        where: { vendorId: input.vendorId, ...(input.status ? { status: input.status } : {}) },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: { customer: true, Review: true },
      });
    }),

  listAll: adminProcedure
    .input(
      z.object({
        status: statusEnum.optional(),
        city: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        skip: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.db.booking.findMany({
        where: { ...(input.status ? { status: input.status } : {}) },
        take: input.limit,
        skip: input.skip,
        orderBy: { createdAt: "desc" },
        include: { customer: true, vendor: true },
      });
      const total = await ctx.db.booking.count({ where: { ...(input.status ? { status: input.status } : {}) } });
      return { bookings, total };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: statusEnum }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.booking.update({ where: { id: input.id }, data: { status: input.status } });
    }),

  assignVendor: protectedProcedure
    .input(z.object({ id: z.string(), vendorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.update({
        where: { id: input.id },
        data: { vendorId: input.vendorId, status: "ASSIGNED" },
      });
      await ctx.db.lead.create({
        data: {
          bookingId: input.id,
          vendorId: input.vendorId,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: "pending",
        },
      });
      await ctx.db.notification.create({
        data: {
          userId: input.vendorId,
          type: "lead",
          title: "New lead assigned",
          message: `New booking ${input.id.slice(-6)} assigned to you`,
          actionUrl: `/vendor/leads`,
        },
      });
      return booking;
    }),

  addReview: protectedProcedure
    .input(z.object({ bookingId: z.string(), vendorId: z.string(), rating: z.number().min(1).max(5), comment: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const customerId = (ctx.session.user as { id: string }).id;
      const review = await ctx.db.review.create({
        data: { bookingId: input.bookingId, customerId, vendorId: input.vendorId, rating: input.rating, comment: input.comment },
      });
      // update vendor aggregates
      const all = await ctx.db.review.findMany({ where: { vendorId: input.vendorId } });
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      const profile = await ctx.db.vendorProfile.findFirst({ where: { userId: input.vendorId } });
      if (profile) {
        await ctx.db.vendorProfile.update({ where: { id: profile.id }, data: { rating: avg, totalReviews: all.length } });
      }
      return review;
    }),
});

export type BookingsRouter = typeof bookingsRouter;