import { createHmac } from "node:crypto";
import Razorpay from "razorpay";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { notifyUser } from "~/server/notifications/notify";

// Server-only: the secret never leaves the server. key_id may be shared for checkout.
const keyId = process.env.RAZORPAY_KEY_ID ?? "";
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

function client(): Razorpay {
  if (!keyId || !keySecret) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Razorpay not configured" });
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const paymentsRouter = createTRPCRouter({
  /** Server-side create of a Razorpay order for a booking (dummy/test amounts flow through here). */
  createOrder: protectedProcedure
    .input(z.object({ bookingId: z.string(), amount: z.number().int().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session.user as { id: string }).id;
      const booking = await ctx.db.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking || booking.customerId !== userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      }
      const order = await client().orders.create({
        amount: Math.round(input.amount * 100), // paise
        currency: "INR",
        receipt: `booking_${input.bookingId.slice(-8)}`,
        notes: { bookingId: input.bookingId },
      });
      await ctx.db.booking.update({
        where: { id: input.bookingId },
        data: { razorpayOrderId: order.id },
      });
      return { orderId: order.id, amount: input.amount, currency: order.currency, keyId };
    }),

  /** Verify Razorpay's signature (never trust the client) and mark the booking PAID. */
  verify: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session.user as { id: string }).id;
      const booking = await ctx.db.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking || booking.customerId !== userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      }
      if (booking.razorpayOrderId !== input.razorpayOrderId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Order mismatch" });
      }
      const expected = createHmac("sha256", keySecret)
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest("hex");
      if (expected !== input.signature) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid payment signature" });
      }
      await ctx.db.booking.update({
        where: { id: input.bookingId },
        data: { paymentStatus: "PAID", razorpayPaymentId: input.razorpayPaymentId },
      });
      await notifyUser(ctx.db, {
        userId,
        type: "payment",
        title: "Payment received",
        message: `Your payment for booking #${input.bookingId.slice(-6)} is confirmed.`,
        actionUrl: "/customer/dashboard",
      });
      return { ok: true, paymentId: input.razorpayPaymentId };
    }),
});

export type PaymentsRouter = typeof paymentsRouter;