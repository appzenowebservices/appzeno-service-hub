import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { isObjectId } from "~/server/utils/object-id";

export const usersRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Env superadmin (and other non-DB sessions) have non-ObjectId ids.
      if (!isObjectId(input.id)) return null;
      return ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          customerProfile: true,
          vendorProfile: true,
          agentProfile: true,
          Address: true,
        },
      });
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const id = (ctx.session.user as { id: string }).id;
    if (!isObjectId(id)) return null;
    return ctx.db.user.findUnique({
      where: { id },
      include: { customerProfile: true, vendorProfile: true, agentProfile: true, Address: true },
    });
  }),

  /** Registers (or refreshes) this browser's FCM token for web push. */
  registerFcmToken: protectedProcedure
    .input(z.object({ token: z.string().min(20) }))
    .mutation(async ({ ctx, input }) => {
      const id = (ctx.session.user as { id: string }).id;
      if (!isObjectId(id)) {
        console.warn(`[fcm] register skipped — session ${id} has no DB user (env superadmin?)`);
        return { ok: false, reason: "no-db-user" };
      }
      const user = await ctx.db.user.findUnique({ where: { id }, select: { fcmTokens: true } });
      if (!user) {
        console.warn(`[fcm] register skipped — no user row for ${id}`);
        return { ok: false, reason: "no-db-user" };
      }
      const existing = user.fcmTokens ?? [];
      if (existing.includes(input.token)) {
        console.log(`[fcm] token already registered for ${id} (${existing.length} device(s))`);
        return { ok: true, already: true };
      }
      await ctx.db.user.update({
        where: { id },
        data: { fcmTokens: { push: input.token } },
      });
      console.log(`[fcm] token registered for ${id} — ${existing.length + 1} device(s)`);
      return { ok: true };
    }),

  /** Removes this browser's FCM token (called on logout / push opt-out). */
  removeFcmToken: protectedProcedure
    .input(z.object({ token: z.string().min(20) }))
    .mutation(async ({ ctx, input }) => {
      const id = (ctx.session.user as { id: string }).id;
      const user = await ctx.db.user.findUnique({ where: { id }, select: { fcmTokens: true } });
      const tokens = user?.fcmTokens ?? [];
      await ctx.db.user.update({
        where: { id },
        data: { fcmTokens: { set: tokens.filter((t) => t !== input.token) } },
      });
      return { ok: true };
    }),

  getByMobile: publicProcedure
    .input(z.object({ mobile: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: { mobile: input.mobile },
        include: {
          customerProfile: true,
          vendorProfile: true,
          agentProfile: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          fullName: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          avatar: z.string().optional(),
          preferredLanguage: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({ where: { id: input.id }, data: input.data });
    }),

  getAll: adminProcedure
    .input(
      z.object({
        role: z.enum(["CUSTOMER", "VENDOR", "AGENT", "ADMIN"]).optional(),
        search: z.string().optional(),
        city: z.string().optional(),
        isActive: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        skip: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        ...(input.role ? { role: input.role } : {}),
        ...(input.city ? { city: { equals: input.city, mode: "insensitive" } } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.search
          ? {
              OR: [
                { fullName: { contains: input.search, mode: "insensitive" } },
                { mobile: { contains: input.search, mode: "insensitive" } },
                { email: { contains: input.search, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where: where as never,
          take: input.limit,
          skip: input.skip,
          orderBy: { createdAt: "desc" },
          include: { customerProfile: true, vendorProfile: true, agentProfile: true },
        }),
        ctx.db.user.count({ where: where as never }),
      ]);
      return { users, total };
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({ where: { id: input.id }, data: { isActive: input.isActive } });
    }),

  stats: adminProcedure.query(async ({ ctx }) => {
    const [customers, vendors, agents, admins] = await Promise.all([
      ctx.db.user.count({ where: { role: "CUSTOMER" } }),
      ctx.db.user.count({ where: { role: "VENDOR" } }),
      ctx.db.user.count({ where: { role: "AGENT" } }),
      ctx.db.user.count({ where: { role: "ADMIN" } }),
    ]);
    return { customers, vendors, agents, admins, total: customers + vendors + agents + admins };
  }),
});

export type UsersRouter = typeof usersRouter;