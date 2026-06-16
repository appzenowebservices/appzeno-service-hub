import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          customerProfile: true,
          vendorProfile: true,
          agentProfile: true,
        },
      });
      return user;
    }),

  getByMobile: publicProcedure
    .input(z.object({ mobile: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { mobile: input.mobile },
        include: {
          customerProfile: true,
          vendorProfile: true,
          agentProfile: true,
        },
      });
      return user;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: z.object({ fullName: z.string().optional(), city: z.string().optional(), state: z.string().optional() }) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: input.data,
      });
      return user;
    }),

  getAll: protectedProcedure
    .input(z.object({ role: z.enum(["CUSTOMER", "VENDOR", "AGENT", "ADMIN"]).optional(), limit: z.number().default(10), skip: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: input.role ? { role: input.role } : {},
        take: input.limit,
        skip: input.skip,
      });
      return users;
    }),
});

export type UsersRouter = typeof usersRouter;