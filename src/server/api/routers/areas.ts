import { createTRPCRouter, publicProcedure, adminProcedure, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Default serving areas (current target cities) with well-known pincodes.
export const DEFAULT_AREAS: { city: string; state: string; lat: number; lng: number; pincodes: string[] }[] = [
  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, pincodes: ["226001", "226002", "226003", "226004", "226005", "226006", "226010", "226012", "226021", "226024", "226025", "226026", "226028", "226029", "226030", "226031"] },
  { city: "Barabanki", state: "Uttar Pradesh", lat: 26.9255, lng: 81.19, pincodes: ["225001", "225003", "225004", "225121", "225123", "225124", "225126", "225201", "225203", "225205", "225206", "225207", "225301", "225401", "225409", "225412"] },
  { city: "Gurgaon", state: "Haryana", lat: 28.4595, lng: 77.0266, pincodes: ["122001", "122002", "122003", "122004", "122005", "122006", "122007", "122008", "122009", "122010", "122011", "122012", "122013", "122015", "122016", "122017", "122018", "122101", "122102", "122413", "122414", "122415", "122501"] },
  { city: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3732, pincodes: ["273001", "273002", "273003", "273004", "273005", "273006", "273007", "273008", "273009", "273010", "273012", "273013", "273014", "273015", "273016", "273017", "273151", "273152", "273153", "273201", "273202", "273203", "273301", "273303", "273304", "273305", "273306", "273307", "273308", "273309", "273401", "273402", "273403", "273404", "273405", "273406", "273407", "273408", "273409", "273410", "273411", "273412", "273413", "273414", "273415"] },
];

export const areasRouter = createTRPCRouter({
  /** Active serving areas (city + pincodes) — public read for vendor/agent dashboards. */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const areas = await ctx.db.servingArea.findMany({ orderBy: { city: "asc" } });
    // auto-seed the defaults the very first time (idempotent)
    if (areas.length === 0) {
      for (const d of DEFAULT_AREAS) {
        const exists = await ctx.db.servingArea.findUnique({ where: { city: d.city } });
        if (!exists) {
          await ctx.db.servingArea.create({ data: d });
        }
      }
      return ctx.db.servingArea.findMany({ orderBy: { city: "asc" } });
    }
    return areas;
  }),

  /** Pincodes served for one city. */
  byCity: publicProcedure.input(z.object({ city: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.servingArea.findFirst({ where: { city: { equals: input.city, mode: "insensitive" }, isActive: true } });
  }),

  /** Seed the default areas (idempotent). */
  seed: adminProcedure.mutation(async ({ ctx }) => {
    let created = 0;
    for (const d of DEFAULT_AREAS) {
      const exists = await ctx.db.servingArea.findUnique({ where: { city: d.city } });
      if (!exists) {
        await ctx.db.servingArea.create({ data: d });
        created++;
      }
    }
    return { created, total: DEFAULT_AREAS.length };
  }),

  create: adminProcedure
    .input(z.object({ city: z.string().min(2), state: z.string().min(2), lat: z.number(), lng: z.number(), pincodes: z.array(z.string().regex(/^\d{6}$/)).default([]) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.servingArea.findFirst({ where: { city: { equals: input.city, mode: "insensitive" } } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "City already exists" });
      return ctx.db.servingArea.create({ data: { ...input, pincodes: [...new Set(input.pincodes)] } });
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), city: z.string().min(2).optional(), state: z.string().optional(), lat: z.number().optional(), lng: z.number().optional(), isActive: z.boolean().optional(), pincodes: z.array(z.string().regex(/^\d{6}$/)).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      if (data.pincodes !== undefined) data.pincodes = [...new Set(data.pincodes)];
      return ctx.db.servingArea.update({ where: { id }, data });
    }),

  addPincode: adminProcedure
    .input(z.object({ id: z.string(), pincode: z.string().regex(/^\d{6}$/) }))
    .mutation(async ({ ctx, input }) => {
      const area = await ctx.db.servingArea.findUnique({ where: { id: input.id } });
      if (!area) throw new TRPCError({ code: "NOT_FOUND", message: "Area not found" });
      const pincodes = Array.from(new Set([...area.pincodes, input.pincode]));
      return ctx.db.servingArea.update({ where: { id: input.id }, data: { pincodes } });
    }),

  removePincode: adminProcedure
    .input(z.object({ id: z.string(), pincode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const area = await ctx.db.servingArea.findUnique({ where: { id: input.id } });
      if (!area) throw new TRPCError({ code: "NOT_FOUND", message: "Area not found" });
      return ctx.db.servingArea.update({ where: { id: input.id }, data: { pincodes: area.pincodes.filter((p) => p !== input.pincode) } });
    }),

  remove: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.servingArea.delete({ where: { id: input.id } });
  }),

  /** Vendor/agent: set their street address; gates which serving pincodes they can pick. */
  setAddress: protectedProcedure
    .input(z.object({ streetAddress: z.string().min(3).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session.user as { id: string }).id;
      const user = await ctx.db.user.findUnique({ where: { id: userId } });
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (user.role === "VENDOR") {
        const p = await ctx.db.vendorProfile.findFirst({ where: { userId } });
        if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor profile not found" });
        return ctx.db.vendorProfile.update({ where: { id: p.id }, data: { streetAddress: input.streetAddress } });
      }
      if (user.role === "AGENT") {
        const p = await ctx.db.agentProfile.findFirst({ where: { userId } });
        if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Agent profile not found" });
        return ctx.db.agentProfile.update({ where: { id: p.id }, data: { streetAddress: input.streetAddress } });
      }
      throw new TRPCError({ code: "FORBIDDEN", message: "Only vendors and agents set a service address" });
    }),
});

export type AreasRouter = typeof areasRouter;