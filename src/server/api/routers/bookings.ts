import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { notifyUser } from "~/server/notifications/notify";
import { logBookingEvent } from "~/server/bookings/timeline";
import { agentPincodes, assertBookingAccess, roleOf } from "~/server/bookings/access";
import { resolvePincodeAgent } from "~/server/bookings/routing";
import { canTransition } from "~/lib/booking-flow";
import { isObjectId } from "~/server/utils/object-id";
import { TRPCError } from "@trpc/server";

const statusEnum = z.enum(["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"]);

const bookingInclude = {
  customer: { select: { id: true, fullName: true, mobile: true, email: true, city: true } },
  vendor: {
    select: {
      id: true,
      fullName: true,
      mobile: true,
      email: true,
      city: true,
      isVerified: true,
      vendorProfile: true,
    },
  },
  agent: { select: { id: true, fullName: true, mobile: true, city: true } },
  Lead: true,
  Review: true,
  events: { orderBy: { createdAt: "asc" as const } },
};

function sessionOf(ctx: { session: { user?: unknown } }) {
  return ctx.session.user as { id: string; role?: string };
}

function pincodeOf(address: unknown): string {
  return ((address as { pincode?: string } | null)?.pincode ?? "").trim();
}

function cityOf(address: unknown): string {
  return ((address as { city?: string } | null)?.city ?? "").trim();
}

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
          pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
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
      const user = sessionOf(ctx);
      if (roleOf(user) !== "CUSTOMER") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only customer accounts can place bookings." });
      }
      if (!isObjectId(user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid customer account." });
      }

      const pincode = input.address.pincode.trim();
      const city = input.address.city.trim();
      const areaAgent = await resolvePincodeAgent(ctx.db, pincode, city);

      const booking = await ctx.db.booking.create({
        data: {
          ...input,
          customerId: user.id,
          pincode,
          city,
          ...(areaAgent
            ? { agentId: areaAgent.userId, agentAssignedAt: new Date() }
            : {}),
        },
      });

      await notifyUser(ctx.db, {
        userId: user.id,
        type: "booking",
        title: "Booking created",
        message: `Your booking ${booking.id.slice(-6)} has been placed`,
        actionUrl: "/customer/dashboard/bookings",
      });

      await logBookingEvent(ctx.db, {
        bookingId: booking.id,
        status: "PENDING",
        action: "STATUS",
        actorRole: "CUSTOMER",
        actorId: user.id,
        note: "Booking placed",
      });

      if (areaAgent) {
        await logBookingEvent(ctx.db, {
          bookingId: booking.id,
          status: "PENDING",
          action: "AGENT_ASSIGNED",
          actorRole: "SYSTEM",
          note: `Area agent ${areaAgent.fullName} assigned for pincode ${pincode}`,
        });
      }

      // Notify every agent covering this pincode; they can all track the job,
      // while `agentId` records the primary responsible agent.
      const agents = await ctx.db.agentProfile.findMany({
        where: { serviceAreaPincodes: { has: pincode }, user: { is: { isActive: true } } },
        select: { userId: true },
      });
      for (const a of agents) {
        await notifyUser(ctx.db, {
          userId: a.userId,
          type: "area",
          title: areaAgent ? "New booking assigned in your area" : "New booking in your area",
          message: `Booking #${booking.id.slice(-6)} in ${input.address.area} (${pincode}) is waiting for a pro${
            areaAgent ? ` — primary agent: ${areaAgent.fullName}` : ""
          }.`,
          actionUrl: "/agent/bookings",
        });
      }

      return booking;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!isObjectId(input.id)) return null;
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        include: bookingInclude,
      });
      if (!booking) return null;
      await assertBookingAccess(ctx.db, sessionOf(ctx), booking);
      return booking;
    }),

  getByCustomer: protectedProcedure
    .input(z.object({ customerId: z.string(), limit: z.number().min(1).max(100).default(10), status: statusEnum.optional() }))
    .query(async ({ ctx, input }) => {
      const user = sessionOf(ctx);
      if (roleOf(user) !== "ADMIN" && input.customerId !== user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only view your own bookings." });
      }
      if (!isObjectId(input.customerId)) return [];
      return ctx.db.booking.findMany({
        where: { customerId: input.customerId, ...(input.status ? { status: input.status } : {}) },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          vendor: { include: { vendorProfile: true } },
          agent: { select: { id: true, fullName: true, mobile: true } },
          Review: true,
          events: { orderBy: { createdAt: "asc" } },
        },
      });
    }),

  getByVendor: protectedProcedure
    .input(z.object({ vendorId: z.string(), limit: z.number().default(20), status: statusEnum.optional() }))
    .query(async ({ ctx, input }) => {
      const user = sessionOf(ctx);
      if (roleOf(user) !== "ADMIN" && input.vendorId !== user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only view your own jobs." });
      }
      if (!isObjectId(input.vendorId)) return [];
      return ctx.db.booking.findMany({
        where: { vendorId: input.vendorId, ...(input.status ? { status: input.status } : {}) },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, fullName: true, mobile: true } },
          agent: { select: { id: true, fullName: true, mobile: true } },
          Review: true,
          events: { orderBy: { createdAt: "asc" } },
        },
      });
    }),

  /**
   * Agent console: bookings assigned to this agent OR falling inside any
   * pincode they own. Every covering agent can track/manage the same job.
   */
  getByAgent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        status: statusEnum.optional(),
        pincode: z.string().regex(/^\d{6}$/).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = sessionOf(ctx);
      const role = roleOf(user);
      if (role !== "AGENT" && role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Agent access required." });
      }

      const filters: Record<string, unknown>[] = [];
      if (input.status) filters.push({ status: input.status });
      if (input.pincode) filters.push({ pincode: input.pincode });

      if (role === "AGENT") {
        const pincodes = await agentPincodes(ctx.db, user.id);
        filters.unshift({
          OR: [
            { agentId: user.id },
            ...(pincodes.length > 0 ? [{ pincode: { in: pincodes } }] : []),
          ],
        });
      }

      const where = filters.length > 0 ? { AND: filters } : {};
      return ctx.db.booking.findMany({
        where: where as never,
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, fullName: true, mobile: true } },
          vendor: { include: { vendorProfile: true } },
          agent: { select: { id: true, fullName: true, mobile: true } },
          Lead: true,
          Review: true,
          events: { orderBy: { createdAt: "asc" } },
        },
      });
    }),

  listAll: adminProcedure
    .input(
      z.object({
        status: statusEnum.optional(),
        paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED", "FAILED"]).optional(),
        vendorId: z.string().optional(),
        pincode: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        skip: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.status ? { status: input.status } : {}),
        ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
        ...(input.vendorId ? { vendorId: input.vendorId } : {}),
        ...(input.pincode ? { pincode: input.pincode } : {}),
      };
      const bookings = await ctx.db.booking.findMany({
        where,
        take: input.limit,
        skip: input.skip,
        orderBy: { createdAt: "desc" },
        include: { customer: true, vendor: true, agent: true },
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
          ...bookingInclude,
          vendor: { select: { id: true, fullName: true, mobile: true, email: true, city: true, isVerified: true, vendorProfile: true } },
        },
      });
      if (!booking) return null;
      const pincode = booking.pincode ?? pincodeOf(booking.address);
      const agents = pincode
        ? await ctx.db.agentProfile.findMany({
            where: { serviceAreaPincodes: { has: pincode }, user: { is: { isActive: true } } },
            include: { user: { select: { id: true, fullName: true, mobile: true, city: true, isVerified: true } } },
          })
        : [];
      return { booking, agents };
    }),

  /** Vendors approved and serving the booking's pincode (or city fallback). */
  eligibleVendors: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = sessionOf(ctx);
      const role = roleOf(user);
      if (role !== "ADMIN" && role !== "AGENT") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins and area agents can assign vendors." });
      }
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: { id: true, customerId: true, vendorId: true, agentId: true, pincode: true, city: true, status: true },
      });
      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
      await assertBookingAccess(ctx.db, user, booking);

      const pincode = booking.pincode ?? "";
      const city = (booking.city ?? "").trim().toLowerCase();
      const vendors = await ctx.db.user.findMany({
        where: { role: "VENDOR", isActive: true, vendorProfile: { is: { isApproved: true } } },
        include: { vendorProfile: true },
      });

      return vendors
        .map((v) => {
          const pincodes = v.vendorProfile?.serviceAreaPincodes ?? [];
          const pincodeMatch = pincode !== "" && pincodes.includes(pincode);
          const cityMatch = city !== "" && v.city.trim().toLowerCase() === city;
          return {
            id: v.id,
            fullName: v.fullName,
            businessName: v.vendorProfile?.businessName ?? v.fullName,
            city: v.city,
            rating: v.vendorProfile?.rating ?? 0,
            totalReviews: v.vendorProfile?.totalReviews ?? 0,
            pincodes,
            pincodeMatch,
            cityMatch,
          };
        })
        .filter((v) => v.pincodeMatch || v.cityMatch)
        .sort((a, b) => Number(b.pincodeMatch) - Number(a.pincodeMatch));
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: statusEnum, note: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = sessionOf(ctx);
      const prev = await ctx.db.booking.findUnique({
        where: { id: input.id },
        select: { id: true, status: true, categoryId: true, customerId: true, vendorId: true, agentId: true, pincode: true },
      });
      if (!prev) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });

      const actorRole = await assertBookingAccess(ctx.db, user, prev);
      if (actorRole !== "ADMIN" && !canTransition(actorRole, prev.status, input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot move booking from ${prev.status.replace(/_/g, " ")} to ${input.status.replace(/_/g, " ")} as ${actorRole.toLowerCase()}.`,
        });
      }

      const updated = await ctx.db.booking.update({ where: { id: input.id }, data: { status: input.status } });

      await logBookingEvent(ctx.db, {
        bookingId: input.id,
        status: input.status,
        action: "STATUS",
        actorRole,
        actorId: user.id,
        note: input.note ?? null,
      });

      // first transition to COMPLETED → credit the category's public booking counter
      if (input.status === "COMPLETED" && prev.status !== "COMPLETED" && prev.categoryId) {
        const cat = await ctx.db.category.findFirst({ where: { OR: [{ id: prev.categoryId }, { slug: prev.categoryId }] } });
        if (cat) await ctx.db.category.update({ where: { id: cat.id }, data: { totalBookings: { increment: 1 } } });
      }

      if (prev.status !== input.status) {
        const short = input.id.slice(-6);
        if (input.status === "IN_PROGRESS" && prev.customerId) {
          await notifyUser(ctx.db, {
            userId: prev.customerId,
            type: "booking",
            title: "Work started",
            message: `Your pro has started working on booking #${short}.`,
            actionUrl: "/customer/dashboard/bookings",
          });
        } else if (input.status === "COMPLETED" && prev.customerId) {
          await notifyUser(ctx.db, {
            userId: prev.customerId,
            type: "booking",
            title: "Booking completed",
            message: `Work on booking #${short} is done. Please rate your pro!`,
            actionUrl: "/customer/dashboard/bookings",
          });
        } else if (input.status === "CANCELLED") {
          if (prev.customerId) {
            await notifyUser(ctx.db, {
              userId: prev.customerId,
              type: "booking",
              title: "Booking cancelled",
              message: `Booking #${short} was cancelled.`,
              actionUrl: "/customer/dashboard/bookings",
            });
          }
          if (prev.vendorId) {
            await notifyUser(ctx.db, {
              userId: prev.vendorId,
              type: "booking",
              title: "Job cancelled",
              message: `Booking #${short} was cancelled.`,
              actionUrl: "/vendor/jobs",
            });
          }
        } else if (input.status === "DISPUTED" && prev.vendorId) {
          await notifyUser(ctx.db, {
            userId: prev.vendorId,
            type: "booking",
            title: "Dispute raised",
            message: `A dispute was raised on booking #${short}. Our team will reach out.`,
            actionUrl: "/vendor/jobs",
          });
        }

        // Keep the primary area agent in the loop (unless they were the actor).
        if (prev.agentId && prev.agentId !== user.id) {
          await notifyUser(ctx.db, {
            userId: prev.agentId,
            type: "area",
            title: `Booking #${short} ${input.status.replace(/_/g, " ").toLowerCase()}`,
            message: `Booking #${short} moved to ${input.status.replace(/_/g, " ")}.`,
            actionUrl: "/agent/bookings",
          });
        }
      }

      return updated;
    }),

  assignVendor: protectedProcedure
    .input(z.object({ id: z.string(), vendorId: z.string(), note: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = sessionOf(ctx);
      const role = roleOf(user);
      if (role !== "ADMIN" && role !== "AGENT") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins and area agents can assign vendors." });
      }

      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        select: { id: true, customerId: true, vendorId: true, agentId: true, pincode: true, city: true, status: true, address: true },
      });
      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
      await assertBookingAccess(ctx.db, user, booking);

      if (role === "AGENT" && ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(booking.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This booking is already in progress; only an admin can reassign it.",
        });
      }

      const vendor = await ctx.db.user.findFirst({
        where: { id: input.vendorId, role: "VENDOR", isActive: true },
        include: { vendorProfile: true },
      });
      if (!vendor) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found or blocked." });
      if (!vendor.vendorProfile?.isApproved) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Vendor KYC is not approved yet." });
      }

      const pincode = booking.pincode ?? pincodeOf(booking.address);
      const city = (booking.city ?? cityOf(booking.address)).trim().toLowerCase();
      const pincodes = vendor.vendorProfile.serviceAreaPincodes ?? [];
      const servesPincode = pincode !== "" && pincodes.includes(pincode);
      const servesCity = city !== "" && vendor.city.trim().toLowerCase() === city;
      if (role === "AGENT" && !servesPincode && !servesCity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Vendor does not serve ${pincode || city || "this area"}.`,
        });
      }

      const updated = await ctx.db.booking.update({
        where: { id: input.id },
        data: {
          vendorId: input.vendorId,
          status: "ASSIGNED",
          ...(role === "AGENT" && !booking.agentId
            ? { agentId: user.id, agentAssignedAt: new Date() }
            : {}),
        },
      });

      await ctx.db.lead.create({
        data: {
          bookingId: input.id,
          vendorId: input.vendorId,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: "pending",
        },
      });

      const vendorName = vendor.vendorProfile.businessName ?? vendor.fullName;
      await logBookingEvent(ctx.db, {
        bookingId: input.id,
        status: "ASSIGNED",
        action: "VENDOR_ASSIGNED",
        actorRole: role,
        actorId: user.id,
        note: input.note?.trim()
          ? `${vendorName} assigned — ${input.note.trim()}`
          : `${vendorName} assigned by ${role.toLowerCase()} for pincode ${pincode || "—"}.`,
      });

      await notifyUser(ctx.db, {
        userId: input.vendorId,
        type: "lead",
        title: "New lead assigned",
        message: `New booking ${input.id.slice(-6)} assigned to you`,
        actionUrl: "/vendor/jobs",
      });
      await notifyUser(ctx.db, {
        userId: booking.customerId,
        type: "booking",
        title: "Pro assigned",
        message: `A verified pro has been assigned to booking #${input.id.slice(-6)}. Awaiting their confirmation.`,
        actionUrl: "/customer/dashboard/bookings",
      });
      if (booking.agentId && booking.agentId !== user.id) {
        await notifyUser(ctx.db, {
          userId: booking.agentId,
          type: "area",
          title: "Vendor assigned in your area",
          message: `Booking #${input.id.slice(-6)} was assigned to ${vendorName}.`,
          actionUrl: "/agent/bookings",
        });
      }

      return updated;
    }),

  addReview: protectedProcedure
    .input(z.object({ bookingId: z.string(), vendorId: z.string(), rating: z.number().min(1).max(5), comment: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = sessionOf(ctx);
      const customerId = user.id;
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: { id: true, customerId: true, vendorId: true, agentId: true, pincode: true },
      });
      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
      await assertBookingAccess(ctx.db, user, booking);
      if (booking.customerId !== customerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the customer can review this booking." });
      }

      const review = await ctx.db.review.create({
        data: { bookingId: input.bookingId, customerId, vendorId: input.vendorId, rating: input.rating, comment: input.comment },
      });

      const all = await ctx.db.review.findMany({ where: { vendorId: input.vendorId } });
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      const profile = await ctx.db.vendorProfile.findFirst({ where: { userId: input.vendorId } });
      if (profile) {
        await ctx.db.vendorProfile.update({ where: { id: profile.id }, data: { rating: avg, totalReviews: all.length } });
      }

      await notifyUser(ctx.db, {
        userId: input.vendorId,
        type: "review",
        title: `New review ${input.rating}/5`,
        message: input.comment?.trim() ? `"${input.comment.trim().slice(0, 80)}"` : "A customer rated your work.",
        actionUrl: "/vendor/jobs",
      });

      await logBookingEvent(ctx.db, {
        bookingId: input.bookingId,
        status: "REVIEWED",
        action: "STATUS",
        actorRole: "CUSTOMER",
        actorId: customerId,
        note: `Rated ${input.rating}/5.`,
      });
      return review;
    }),
});

export type BookingsRouter = typeof bookingsRouter;
