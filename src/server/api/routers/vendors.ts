import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const vendorsRouter = createTRPCRouter({
  getPublicProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id, role: "VENDOR" },
        include: { vendorProfile: true },
      });
      return user;
    }),

  getApprovedVendors: publicProcedure
    .input(z.object({ city: z.string().optional(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const vendors = await ctx.db.user.findMany({
        where: { role: "VENDOR", isApproved: true, ...(input.city && { city: input.city }) },
        take: input.limit,
        include: { vendorProfile: true },
      });
      return vendors;
    }),

  approveVendor: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.user.update({
        where: { id: input.id },
        data: { isApproved: true },
      });
      return vendor;
    }),

  getVendorStats: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.db.booking.findMany({
        where: { vendorId: input.vendorId },
      });
      const totalEarnings = bookings
        .filter((b) => b.status === "COMPLETED")
        .reduce((sum, b) => sum + b.totalAmount, 0);
      const totalJobs = bookings.length;
      const rating = bookings.filter((b) => b.status === "COMPLETED").length > 0 ? 4.5 : 0;
      return { totalEarnings, totalJobs, rating };
    }),
});

export type VendorsRouter = typeof vendorsRouter;