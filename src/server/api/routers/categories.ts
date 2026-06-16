import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      where: { isActive: true },
      include: { subCategories: true },
    });
    return categories;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
        include: { subCategories: true },
      });
      return category;
    }),
});

export type CategoriesRouter = typeof categoriesRouter;