import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ includeInactive: z.boolean().default(false) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: input?.includeInactive ? {} : { isActive: true },
        include: { subCategories: { where: { isActive: true } } },
        orderBy: { name: "asc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findUnique({
        where: { id: input.id },
        include: { subCategories: true },
      });
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.category.findUnique({ where: { slug: input.slug }, include: { subCategories: true } });
  }),

  create: adminProcedure
    .input(
      z.object({
        slug: z.string(),
        name: z.string(),
        icon: z.string().default("🔧"),
        description: z.string().optional(),
        commissionPercent: z.number().default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({ data: input });
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({ where: { id: input.id }, data: { isActive: input.isActive } });
    }),

  upsertSubCategory: adminProcedure
    .input(
      z.object({
        id: z.string().optional(),
        categoryId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        basePrice: z.number(),
        unit: z.string().default("per job"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        return ctx.db.subCategory.update({
          where: { id: input.id },
          data: { name: input.name, description: input.description, basePrice: input.basePrice, unit: input.unit },
        });
      }
      return ctx.db.subCategory.create({
        data: { categoryId: input.categoryId, name: input.name, description: input.description, basePrice: input.basePrice, unit: input.unit },
      });
    }),
});

export type CategoriesRouter = typeof categoriesRouter;