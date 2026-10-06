import { createTRPCRouter, adminProcedure, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendPushToUser, sendPushToUsers } from "~/server/notifications/notify";
import { resolveDbUserId } from "~/server/utils/db-user";

const CATALOG: { slug: string; name: string; icon: string; description: string; commissionPercent: number; rating: number; totalBookings: number; sortOrder: number; image?: string; featured?: boolean; subs: { name: string; basePrice: number; unit: string }[] }[] = [
  { slug: "home-cleaning", name: "Home Cleaning", icon: "🧹", description: "Kitchen, sofa, full-home packages", commissionPercent: 15, rating: 4.82, totalBookings: 12400, sortOrder: 1, image: "/images/hero/home-cleaning.png", featured: true, subs: [{ name: "1BHK deep cleaning", basePrice: 1999, unit: "per home" }, { name: "2BHK deep cleaning", basePrice: 2999, unit: "per home" }, { name: "Sofa + carpet shampoo", basePrice: 899, unit: "per set" }] },
  { slug: "bathroom-cleaning", name: "Bathroom Cleaning", icon: "🛁", description: "Deep descaling, sanitisation", commissionPercent: 15, rating: 4.79, totalBookings: 18200, sortOrder: 2, subs: [{ name: "Intense bathroom cleaning", basePrice: 449, unit: "per bathroom" }, { name: "2 bathrooms combo", basePrice: 799, unit: "per job" }] },
  { slug: "ac-service", name: "AC Service & Repair", icon: "❄️", description: "Foam-jet service, gas refill, repair", commissionPercent: 15, rating: 4.85, totalBookings: 22600, sortOrder: 3, image: "/images/hero/ac-service.png", featured: true, subs: [{ name: "Foam-jet service", basePrice: 549, unit: "per AC" }, { name: "Gas refill (split)", basePrice: 1799, unit: "per AC" }, { name: "Uninstall / install", basePrice: 1499, unit: "per AC" }] },
  { slug: "appliance-repair", name: "Appliance Repair", icon: "🔌", description: "Fridge, washing machine, chimney", commissionPercent: 12, rating: 4.77, totalBookings: 9800, sortOrder: 4, subs: [{ name: "Inspection visit", basePrice: 299, unit: "per visit" }, { name: "Washing machine repair", basePrice: 499, unit: "per job" }, { name: "Chimney deep cleaning", basePrice: 699, unit: "per chimney" }] },
  { slug: "plumbing", name: "Plumber", icon: "🔧", description: "Taps, leaks, flush tanks, full fittings", commissionPercent: 12, rating: 4.81, totalBookings: 15100, sortOrder: 5, image: "/images/hero/plumbing.png", featured: true, subs: [{ name: "Tap / mixer repair", basePrice: 149, unit: "per visit" }, { name: "Flush tank repair", basePrice: 249, unit: "per job" }, { name: "Full bathroom fitting", basePrice: 1499, unit: "per bathroom" }] },
  { slug: "electrical", name: "Electrician", icon: "⚡", description: "Wiring, switches, fans, MCB & more", commissionPercent: 12, rating: 4.83, totalBookings: 14700, sortOrder: 6, subs: [{ name: "Switchboard repair", basePrice: 149, unit: "per visit" }, { name: "Ceiling fan install", basePrice: 299, unit: "per fan" }, { name: "Full house wiring checkup", basePrice: 999, unit: "per visit" }] },
  { slug: "carpentry", name: "Carpenter", icon: "🪚", description: "Furniture repair, locks, hinges", commissionPercent: 12, rating: 4.76, totalBookings: 6300, sortOrder: 7, subs: [{ name: "Lock / hinge repair", basePrice: 199, unit: "per visit" }, { name: "Furniture assembly", basePrice: 499, unit: "per job" }] },
  { slug: "salon-women", name: "Salon for Women", icon: "💅", description: "Waxing, facial, mani-pedi at home", commissionPercent: 18, rating: 4.88, totalBookings: 25900, sortOrder: 8, image: "/images/hero/salon-women.png", featured: true, subs: [{ name: "Full arms + legs waxing", basePrice: 499, unit: "per session" }, { name: "Classic facial", basePrice: 799, unit: "per session" }, { name: "Waxing + facial combo", basePrice: 1099, unit: "per session" }] },
  { slug: "salon-men", name: "Salon for Men", icon: "💈", description: "Haircut, beard, massage at home", commissionPercent: 18, rating: 4.86, totalBookings: 19400, sortOrder: 9, subs: [{ name: "Haircut + beard", basePrice: 299, unit: "per session" }, { name: "Haircut + massage", basePrice: 499, unit: "per session" }] },
  { slug: "massage", name: "Spa & Massage", icon: "💆", description: "At-home therapy by pros", commissionPercent: 18, rating: 4.84, totalBookings: 7100, sortOrder: 10, subs: [{ name: "Head + shoulder (45 min)", basePrice: 799, unit: "per session" }, { name: "Full body (90 min)", basePrice: 1299, unit: "per session" }] },
  { slug: "painting", name: "Painting & Waterproofing", icon: "🎨", description: "Full home, single room, waterproofing", commissionPercent: 10, rating: 4.74, totalBookings: 3200, sortOrder: 11, subs: [{ name: "1BHK repaint", basePrice: 9999, unit: "per home" }, { name: "Waterproofing (bathroom)", basePrice: 2499, unit: "per bathroom" }] },
  { slug: "pest-control", name: "Pest Control", icon: "🛡️", description: "Cockroach, termite, mosquito", commissionPercent: 15, rating: 4.78, totalBookings: 8600, sortOrder: 12, subs: [{ name: "Cockroach control (1BHK)", basePrice: 1099, unit: "per home" }, { name: "Termite treatment", basePrice: 2499, unit: "per home" }] },
];

/** Trims an optional string field, treating blank as "not set". */
function clean(v?: string): string | null {
  const t = v?.trim() ?? "";
  return t === "" ? null : t;
}

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

    // funnel: bookings per status
    const grouped = await ctx.db.booking.groupBy({ by: ["status"], _count: { status: true } });
    const byStatus: Record<string, number> = {};
    for (const g of grouped) byStatus[g.status] = g._count.status;

    // revenue trend: last 14 days (completed only)
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);
    const trendRows = await ctx.db.booking.findMany({
      where: { status: "COMPLETED", createdAt: { gte: since } },
      select: { createdAt: true, totalAmount: true },
    });
    const trend: { day: string; revenue: number; bookings: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayRows = trendRows.filter((b) => b.createdAt.toISOString().slice(0, 10) === key);
      trend.push({
        day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: dayRows.reduce((s, b) => s + b.totalAmount, 0),
        bookings: dayRows.length,
      });
    }

    // wallet liability: sum of all customer wallet balances
    const walletAgg = await ctx.db.customerProfile.aggregate({ _sum: { walletBalance: true } });

    // bookings created today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCount = await ctx.db.booking.count({ where: { createdAt: { gte: startOfToday } } });

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
      byStatus,
      trend,
      walletLiability: walletAgg._sum.walletBalance ?? 0,
      todayCount,
      revenueByCity: [...byCity.entries()].map(([city, v]) => ({ city, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 6),
      recentBookings,
    };
  }),

  agentsOverview: adminProcedure.query(async ({ ctx }) => {
    const agents = await ctx.db.user.findMany({
      where: { role: "AGENT", isActive: true },
      include: { agentProfile: true },
    });
    const completed = await ctx.db.booking.findMany({
      where: { status: "COMPLETED" },
      select: { totalAmount: true, address: true },
    });
    return agents.map((a) => {
      const city = a.agentProfile?.assignedCity ?? a.city;
      const pct = a.agentProfile?.commissionPercent ?? 5;
      const cityRows = completed.filter(
        (b) => ((b.address as Record<string, unknown> | null)?.city as string | undefined)?.toLowerCase() === city.toLowerCase(),
      );
      const gmv = cityRows.reduce((s, b) => s + b.totalAmount, 0);
      return {
        id: a.id,
        fullName: a.fullName,
        mobile: a.mobile,
        city,
        isVerified: a.isVerified,
        commissionPercent: pct,
        cityBookings: cityRows.length,
        cityGmv: gmv,
        commissionEarned: Math.round(gmv * (pct / 100)),
      };
    });
  }),

  walletTx: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.walletTransaction.findMany({
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true, mobile: true, role: true } } },
      });
    }),

  refundBooking: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        include: { customer: { include: { customerProfile: true } } },
      });
      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      if (booking.paymentStatus === "REFUNDED") throw new TRPCError({ code: "BAD_REQUEST", message: "Already refunded" });
      const profile = booking.customer.customerProfile;
      if (!profile) throw new TRPCError({ code: "BAD_REQUEST", message: "Customer has no wallet" });
      const balanceAfter = profile.walletBalance + booking.totalAmount;
      await ctx.db.customerProfile.update({ where: { id: profile.id }, data: { walletBalance: balanceAfter } });
      await ctx.db.walletTransaction.create({
        data: {
          userId: booking.customerId,
          type: "credit",
          amount: booking.totalAmount,
          description: `Refund for booking ${booking.id.slice(-6)}`,
          balanceAfter,
        },
      });
      return ctx.db.booking.update({ where: { id: input.id }, data: { paymentStatus: "REFUNDED", status: "CANCELLED" } });
    }),

  updateAgentCommission: adminProcedure
    .input(z.object({ id: z.string(), commissionPercent: z.number().min(0).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.agentProfile.findFirst({ where: { userId: input.id } });
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Agent profile not found" });
      return ctx.db.agentProfile.update({ where: { id: profile.id }, data: { commissionPercent: input.commissionPercent } });
    }),

  updateCategory: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      icon: z.string().min(1).max(64).optional(),
      image: z.string().max(300).optional(),
      description: z.string().optional(),
      commissionPercent: z.number().min(0).max(90).optional(),
      rating: z.number().min(0).max(5).optional(),
      totalBookings: z.number().int().min(0).optional(),
      sortOrder: z.number().int().min(0).max(999).optional(),
      isFeatured: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, image, ...data } = input;
      // empty image string = clear the photo
      return ctx.db.category.update({ where: { id }, data: { ...data, ...(image !== undefined ? { image: image === "" ? null : image } : {}) } });
    }),

  seedCategories: adminProcedure.mutation(async ({ ctx }) => {
    let created = 0;
    let backfilled = 0;
    const anyFeatured = await ctx.db.category.count({ where: { isFeatured: true } });
    for (const c of CATALOG) {
      const existing = await ctx.db.category.findUnique({ where: { slug: c.slug } });
      if (!existing) {
        await ctx.db.category.create({
          data: {
            slug: c.slug,
            name: c.name,
            icon: c.icon,
            description: c.description,
            commissionPercent: c.commissionPercent,
            rating: c.rating,
            totalBookings: c.totalBookings,
            sortOrder: c.sortOrder,
            image: c.image,
            isFeatured: anyFeatured === 0 && c.featured === true,
            subCategories: { create: c.subs.map((s) => ({ name: s.name, basePrice: s.basePrice, unit: s.unit })) },
          },
        });
        created++;
        continue;
      }
      // backfill merchandising defaults without overwriting admin customisations
      const patch: Record<string, unknown> = {};
      if (!existing.rating) patch.rating = c.rating;
      if (!existing.totalBookings) patch.totalBookings = c.totalBookings;
      if (!existing.sortOrder) patch.sortOrder = c.sortOrder;
      if (!existing.image && c.image) patch.image = c.image;
      if (Object.keys(patch).length > 0) {
        await ctx.db.category.update({ where: { id: existing.id }, data: patch as never });
        backfilled++;
      }
    }
    return { created, backfilled, total: CATALOG.length };
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
    .input(
      z.object({
        role: z.enum(["CUSTOMER", "VENDOR", "AGENT"]).optional(),
        title: z.string().min(1),
        message: z.string().min(1),
        actionUrl: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: input.role ? { role: input.role } : {},
        select: { id: true },
        take: 500,
      });
      const image = clean(input.imageUrl);
      const action = clean(input.actionUrl);
      await ctx.db.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type: "system",
          title: input.title,
          message: input.message,
          actionUrl: action,
          image,
        })),
      });
      // Fan the same message out as fully customised device pushes.
      await sendPushToUsers(ctx.db, users.map((u) => u.id), {
        title: input.title,
        body: input.message,
        url: action ?? "/",
        image,
      });
      console.log(`[fcm] broadcast${input.role ? ` to ${input.role}` : ""} — ${users.length} user(s), image: ${image ? "yes" : "no"}, link: ${action ?? "/"}`);
      return { sent: users.length };
    }),

  /** Sends a one-off custom push to the calling admin's own devices (preview). */
  sendTestPush: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        message: z.string().min(1),
        actionUrl: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sessionUser = ctx.session.user as { id: string; mobile?: string };
      const id = await resolveDbUserId(ctx.db, sessionUser);
      if (!id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No DB account for this session — run prisma/ensure-superadmin.mjs." });
      }
      const user = await ctx.db.user.findUnique({ where: { id }, select: { fcmTokens: true } });
      const devices = user?.fcmTokens.length ?? 0;
      await sendPushToUser(ctx.db, id, {
        title: input.title,
        body: input.message,
        url: clean(input.actionUrl) ?? "/",
        image: clean(input.imageUrl),
      });
      console.log(`[fcm] test push to admin ${id} — ${devices} device(s)`);
      return { ok: true, devices };
    }),
});
