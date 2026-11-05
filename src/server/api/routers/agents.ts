import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const inArea = (agentPincodes: string[], agentCity: string, vendorPincodes: string[], vendorCity: string) =>
  vendorPincodes.some((p) => agentPincodes.includes(p)) ||
  (agentCity.toLowerCase() === vendorCity.toLowerCase());

export const agentsRouter = createTRPCRouter({
  /** Agent identity + assigned area (city + pincodes). */
  area: protectedProcedure.query(async ({ ctx }) => {
    const id = (ctx.session.user as { id: string }).id;
    const user = await ctx.db.user.findUnique({
      where: { id },
      include: { agentProfile: true },
    });
    if (!user?.agentProfile) throw new TRPCError({ code: "NOT_FOUND", message: "Agent profile not found" });
    return {
      city: user.agentProfile.assignedCity,
      pincodes: user.agentProfile.serviceAreaPincodes ?? [],
      streetAddress: user.agentProfile.streetAddress ?? null,
      commissionPercent: user.agentProfile.commissionPercent,
      fullName: user.fullName,
      avatar: user.avatar ?? null,
      isVerified: user.isVerified,
    };
  }),

  /** Set the agent's owned pincodes (the area they monitor). */
  setServiceArea: protectedProcedure
    .input(z.object({ pincodes: z.array(z.string().regex(/^\d{6}$/)).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const id = (ctx.session.user as { id: string }).id;
      const profile = await ctx.db.agentProfile.findFirst({ where: { userId: id } });
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Agent profile not found" });

      // Agents may only claim pincodes the superadmin has enabled for their
      // assigned city — never arbitrary pincodes.
      const area = await ctx.db.servingArea.findFirst({
        where: { city: profile.assignedCity, isActive: true },
        select: { city: true, pincodes: true },
      });
      if (!area) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No serving area is configured for ${profile.assignedCity}. Contact the admin.`,
        });
      }
      const allowed = new Set(area.pincodes);
      const invalid = input.pincodes.filter((p) => !allowed.has(p));
      if (invalid.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Pincode${invalid.length > 1 ? "s" : ""} not available in ${area.city}: ${invalid.join(", ")}`,
        });
      }

      return ctx.db.agentProfile.update({
        where: { id: profile.id },
        data: { serviceAreaPincodes: [...new Set(input.pincodes)] },
      });
    }),

  /** Vendors under the agent's area (pincode overlap or same city), with live stats. */
  areaVendors: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      const id = (ctx.session.user as { id: string }).id;
      const user = await ctx.db.user.findUnique({ where: { id }, include: { agentProfile: true } });
      if (!user?.agentProfile) throw new TRPCError({ code: "NOT_FOUND", message: "Agent profile not found" });
      const agentPincodes = user.agentProfile.serviceAreaPincodes ?? [];
      const agentCity = user.agentProfile.assignedCity;

      const vendors = await ctx.db.user.findMany({
        where: { role: "VENDOR" },
        include: { vendorProfile: true, _count: { select: { BookingsAsVendor: true } } },
      });
      const inAreaVendors = vendors.filter((v) =>
        inArea(agentPincodes, agentCity, v.vendorProfile?.serviceAreaPincodes ?? [], v.city),
      );
      const pincodeMatched = vendors.filter((v) =>
        (v.vendorProfile?.serviceAreaPincodes ?? []).some((p) => agentPincodes.includes(p)),
      ).length;

      return {
        total: inAreaVendors.length,
        pincodeMatched,
        cityMatched: inAreaVendors.length - pincodeMatched,
        vendors: inAreaVendors.map((v) => ({
          id: v.id,
          fullName: v.fullName,
          mobile: v.mobile,
          city: v.city,
          isActive: v.isActive,
          isVerified: v.isVerified,
          vendorProfile: {
            businessName: v.vendorProfile?.businessName ?? null,
            kycStatus: v.vendorProfile?.kycStatus ?? "PENDING",
            isApproved: v.vendorProfile?.isApproved ?? false,
            rating: v.vendorProfile?.rating ?? 0,
            totalReviews: v.vendorProfile?.totalReviews ?? 0,
            serviceAreaPincodes: v.vendorProfile?.serviceAreaPincodes ?? [],
            totalJobs: v._count.BookingsAsVendor,
          },
        })),
      };
    }),

  /** Area monitoring stats. */
  areaStats: protectedProcedure.query(async ({ ctx }) => {
    const id = (ctx.session.user as { id: string }).id;
    const user = await ctx.db.user.findUnique({ where: { id }, include: { agentProfile: true } });
    if (!user?.agentProfile) throw new TRPCError({ code: "NOT_FOUND", message: "Agent profile not found" });
    const agentPincodes = user.agentProfile.serviceAreaPincodes ?? [];
    const agentCity = user.agentProfile.assignedCity;
    const vendors = await ctx.db.user.findMany({
      where: { role: "VENDOR" },
      include: { vendorProfile: true },
    });
    const area = vendors.filter((v) => inArea(agentPincodes, agentCity, v.vendorProfile?.serviceAreaPincodes ?? [], v.city));
    const bookingScope = {
      status: { notIn: ["CANCELLED", "DISPUTED"] as const },
      OR: [
        { agentId: user.id },
        ...(agentPincodes.length > 0 ? [{ pincode: { in: agentPincodes } }] : []),
      ],
    };
    const [bookings, approved, pendingKyc] = await Promise.all([
      ctx.db.booking.count({ where: bookingScope as never }),
      area.filter((v) => v.vendorProfile?.isApproved).length,
      area.filter((v) => v.vendorProfile?.kycStatus === "PENDING").length,
    ]);
    return {
      areaVendors: area.length,
      approvedVendors: approved,
      pendingKyc,
      areaBookings: bookings,
      commissionPercent: user.agentProfile.commissionPercent,
    };
  }),
});

export type AgentsRouter = typeof agentsRouter;