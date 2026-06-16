import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { env } from "~/env";
import { compare, genSalt, hash } from "bcryptjs";
import { trpc } from "~/trpc/server";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ mobile: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { mobile: input.mobile },
      });

      if (!user || !user.passwordHash) {
        throw new Error("Invalid credentials");
      }

      const valid = await compare(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      return { id: user.id, mobile: user.mobile, role: user.role };
    }),

  register: publicProcedure
    .input(
      z.object({
        fullName: z.string(),
        mobile: z.string(),
        email: z.string().email().optional(),
        password: z.string().min(6),
        role: z.enum(["CUSTOMER", "VENDOR", "AGENT"]).default("CUSTOMER"),
        city: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const salt = await genSalt(10);
      const passwordHash = await hash(input.password, salt);

      const user = await ctx.db.user.create({
        data: {
          fullName: input.fullName,
          mobile: input.mobile,
          email: input.email,
          passwordHash,
          role: input.role,
          city: input.city,
          state: input.state,
        },
      });

      return { id: user.id, mobile: user.mobile, role: user.role };
    }),
});

export type AuthRouter = typeof authRouter;