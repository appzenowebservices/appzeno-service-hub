import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const bookingsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        subCategoryId: z.string(),
        description: z.string(),
        images: z.array(z.string()),
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
        totalAmount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.create({
        data: {
          customerId: ctx.session.user.id,
          ...input,
        },
      });
      return booking;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        include: { customer: true, vendor: true },
      });
      return booking;
    }),

  getByCustomer: protectedProcedure
    .input(z.object({ customerId: z.string(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.db.booking.findMany({
        where: { customerId: input.customerId },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: { vendor: true },
      });
      return bookings;
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"]) }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      return booking;
    }),
});

export type BookingsRouter = typeof bookingsRouter;