import { createCallerFactory, createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { usersRouter } from "./routers/users";
import { bookingsRouter } from "./routers/bookings";
import { vendorsRouter } from "./routers/vendors";
import { categoriesRouter } from "./routers/categories";
import { adminRouter } from "./routers/admin";
import { agentsRouter } from "./routers/agents";
import { paymentsRouter } from "./routers/payments";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  bookings: bookingsRouter,
  vendors: vendorsRouter,
  categories: categoriesRouter,
  admin: adminRouter,
  agents: agentsRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);