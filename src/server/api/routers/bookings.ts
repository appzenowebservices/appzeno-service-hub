import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { notifyUser } from "~/server/notifications/notify";
import { logBookingEvent } from "~/server/bookings/timeline";
import { isObjectId } from "~/server/utils/object-id";
import { TRPCError } from "@trpc/server";

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
      if (!isObjectId(customerId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only customer accounts can place bookings." });
      }
      const booking = await ctx.db.booking.create({
        data: {
          customerId,
          ...input,
        },
      });
      // notify customer (in-app + web push)
      await notifyUser(ctx.db, {
        userId: customerId,
        type: "booking",
        title: "Booking created",
        message: `Your booking ${booking.id.slice(-6)} has been placed`,
        actionUrl: "/customer/dashboard",
      });
      await logBookingEvent(ctx.db, {
        bookingId: booking.id,
        status: "PENDING",
        actorRole: "CUSTOMER",
        actorId: customerId,
        note: "Booking placed",
      });
      // area awareness: notify the agent(s) covering this pincode
      const agents = await ctx.db.agentProfile.findMany({
        where: { serviceAreaPincodes: { has: input.address.pincode } },
        select: { userId: true },
      });
      for (const a of agents) {
        await notifyUser(ctx.db, {
          userId: a.userId,
          type: "area",
          title: "New booking in your area 📍",
          message: `Booking #${booking.id.slice(-6)} in ${input.address.area} (${input.address.pincode}) is waiting for a pro.`,
          actionUrl: "/agent",
        });
      }
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
      if (!isObjectId(input.customerId)) return [];
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
      if (!isObjectId(input.vendorId)) return [];
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
        paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED", "FAILED"]).optional(),
        vendorId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        skip: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.status ? { status: input.status } : {}),
        ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
        ...(input.vendorId ? { vendorId: input.vendorId } : {}),
      };
      const bookings = await ctx.db.booking.findMany({
        where,
        take: input.limit,
        skip: input.skip,
        orderBy: { createdAt: "desc" },
        include: { customer: true, vendor: true },
      });
      const total = await ctx.db.booking.count({ where });
      return { bookings, total };
    }),

  /** Full 360° view for the ops console: participants, lifecycle, area agents. */
  adminDetail: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!isObjectId(input.id)) return null;
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        include: {
          customer: { select: { id: true, fullName: true, mobile: true, email: true, city: true } },
          vendor: { select: { id: true, fullName: true, mobile: true, email: true, city: true, isVerified: true, vendorProfile: true } },
          Review: { include: { customer: { select: { fullName: true } } } },
          Lead: true,
          events: { orderBy: { createdAt: "asc" } },
        },
      });
      if (!booking) return null;
      const pincode = (booking.address as { pincode?: string } | null)?.pincode ?? "";
      const agents = pincode
        ? await ctx.db.agentProfile.findMany({
            where: { serviceAreaPincodes: { has: pincode } },
            include: { user: { select: { id: true, fullName: true, mobile: true, city: true, isVerified: true } } },
          })
        : [];
      return { booking, agents };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: statusEnum }))
    .mutation(async ({ ctx, input }) => {
      const prev = await ctx.db.booking.findUnique({
        where: { id: input.id },
        select: { status: true, categoryId: true, customerId: true, vendorId: true },
      });
      const updated = await ctx.db.booking.update({ where: { id: input.id }, data: { status: input.status } });
      await logBookingEvent(ctx.db, {
        bookingId: input.id,
        status: input.status,
        actorRole: ((ctx.session.user as { role?: string }).role ?? "SYSTEM").toUpperCase(),
        actorId: (ctx.session.user as { id: string }).id,
      });
      // first transition to COMPLETED → credit the category's public booking counter
      if (input.status === "COMPLETED" && prev && prev.status !== "COMPLETED" && prev.categoryId) {
        const cat = await ctx.db.category.findFirst({ where: { OR: [{ id: prev.categoryId }, { slug: prev.categoryId }] } });
        if (cat) await ctx.db.category.update({ where: { id: cat.id }, data: { totalBookings: { increment: 1 } } });
      }
      // status-aware pushes to the affected parties
      if (prev && prev.status !== input.status) {
        const short = input.id.slice(-6);
        if (input.status === "IN_PROGRESS" && prev.customerId) {
          await notifyUser(ctx.db, {
            userId: prev.customerId,
            type: "booking",
            title: "Work started 🛠️",
            message: `Your pro has started working on booking #${short}.`,
            actionUrl: "/customer/dashboard",
          });
        } else if (input.status === "COMPLETED" && prev.customerId) {
          await notifyUser(ctx.db, {
            userId: prev.customerId,
            type: "booking",
            title: "Booking completed 🎉",
            message: `Work on booking #${short} is done. Please rate your pro!`,
            actionUrl: "/customer/dashboard",
          });
        } else if (input.status === "CANCELLED") {
          if (prev.customerId) {
            await notifyUser(ctx.db, {
              userId: prev.customerId,
              type: "booking",
              title: "Booking cancelled",
              message: `Booking #${short} was cancelled.`,
              actionUrl: "/customer/dashboard",
            });
          }
          if (prev.vendorId) {
            await notifyUser(ctx.db, {
              userId: prev.vendorId,
              type: "booking",
              title: "Job cancelled",
              message: `Booking #${short} was cancelled.`,
              actionUrl: "/vendor",
            });
          }
        } else if (input.status === "DISPUTED" && prev.vendorId) {
          await notifyUser(ctx.db, {
            userId: prev.vendorId,
            type: "booking",
            title: "Dispute raised ⚠️",
            message: `A dispute was raised on booking #${short}. Our team will reach out.`,
            actionUrl: "/vendor",
          });
        }
      }
      return updated;
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
      const vendorUser = await ctx.db.user.findUnique({ where: { id: input.vendorId }, select: { fullName: true } });
      await logBookingEvent(ctx.db, {
        bookingId: input.id,
        status: "ASSIGNED",
        actorRole: "ADMIN",
        actorId: (ctx.session.user as { id: string }).id,
        note: `Assigned to ${vendorUser?.fullName ?? "vendor"}`,
      });
      await notifyUser(ctx.db, {
        userId: input.vendorId,
        type: "lead",
        title: "New lead assigned",
        message: `New booking ${input.id.slice(-6)} assigned to you`,
        actionUrl: "/vendor",
      });
      // keep the customer in the loop
      await notifyUser(ctx.db, {
        userId: booking.customerId,
        type: "booking",
        title: "Pro assigned 👷",
        message: `A verified pro has been assigned to booking #${input.id.slice(-6)}. Awaiting their confirmation.`,
        actionUrl: "/customer/dashboard",
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
      // let the pro know they got rated
      await notifyUser(ctx.db, {
        userId: input.vendorId,
        type: "review",
        title: `New review ⭐ ${input.rating}/5`,
        message: input.comment?.trim() ? `"${input.comment.trim().slice(0, 80)}"` : "A customer rated your work.",
        actionUrl: "/vendor",
      });
      await logBookingEvent(ctx.db, {
        bookingId: input.bookingId,
        status: "REVIEWED",
        actorRole: "CUSTOMER",
        actorId: customerId,
        note: `Rated ${input.rating}★`,
      });
      return review;
    }),
});

export type BookingsRouter = typeof bookingsRouter;