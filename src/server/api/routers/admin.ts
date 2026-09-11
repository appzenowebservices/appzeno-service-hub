import { createTRPCRouter, adminProcedure, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, totalBookings, totalCategories, completedBookings, pendingKyc, openDisputes] =
      await Promise.all([
        ctx.db.user.count(),
        ctx.db.booking.count(),
        ctx.db.category.count({ where: { isActive: true } }),
        ctx.db.booking.count({ where: { status: "COMPLETED" } }),
        ctx.db.vendorProfile.count({ where: { kycStatus: { in: ["PENDING", "UNDER_REVIEW"] } } }),
        ctx.db.booking.count({ where: { status: "DISPUTED" } }),
      ]);

    const completed = await ctx.db.booking.findMany({
      where: { status: "COMPLETED" },
      select: { totalAmount: true },
    });
    const totalRevenue = completed.reduce((s, b) => s + b.totalAmount, 0);
    const platformFee = Math.round(totalRevenue * 0.15);

    const [customers, vendors, agents] = await Promise.all([
      ctx.db.user.count({ where: { role: "CUSTOMER" } }),
      ctx.db.user.count({ where: { role: "VENDOR" } }),
      ctx.db.user.count({ where: { role: "AGENT" } }),
    ]);

    // revenue by city (top 6)
    const allBookings = await ctx.db.booking.findMany({
      where: { status: "COMPLETED" },
      select: { totalAmount: true, address: true },
    });
    const byCity = new Map<string, { bookings: number; revenue: number }>();
    for (const b of allBookings) {
      const city = ((b.address as Record<string, unknown>)?.city as string) ?? "Unknown";
      const cur = byCity.get(city) ?? { bookings: 0, revenue: 0 };
      cur.bookings += 1;
      cur.revenue += b.totalAmount;
      byCity.set(city, cur);
    }

    const recentBookings = await ctx.db.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { fullName: true, city: true } }, vendor: { select: { fullName: true } } },
    });

    return {
      totalUsers,
      totalBookings,
      completedBookings,
      totalCategories,
      pendingKyc,
      openDisputes,
      totalRevenue,
      platformFee,
      customers,
      vendors,
      agents,
      avgOrderValue: completed.length ? Math.round(totalRevenue / completed.length) : 0,
      revenueByCity: [...byCity.entries()].map(([city, v]) => ({ city, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 6),
      recentBookings,
    };
  }),

  notifications: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session.user as { id: string }).id;
      const role = ((ctx.session.user as { role?: string }).role ?? "").toUpperCase();
      if (role === "ADMIN") {
        return ctx.db.notification.findMany({ take: input.limit, orderBy: { createdAt: "desc" } });
      }
      return ctx.db.notification.findMany({
        where: { userId },
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });
    }),

  markNotificationRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notification.update({ where: { id: input.id }, data: { isRead: true } });
    }),

  broadcast: adminProcedure
    .input(z.object({ role: z.enum(["CUSTOMER", "VENDOR", "AGENT"]).optional(), title: z.string(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: input.role ? { role: input.role } : {},
        select: { id: true },
        take: 500,
      });
      await ctx.db.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type: "system",
          title: input.title,
          message: input.message,
        })),
      });
      return { sent: users.length };
    }),
});
