import { createCallerFactory, createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { usersRouter } from "./routers/users";
import { bookingsRouter } from "./routers/bookings";
import { vendorsRouter } from "./routers/vendors";
import { categoriesRouter } from "./routers/categories";
import { adminRouter } from "./routers/admin";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  bookings: bookingsRouter,
  vendors: vendorsRouter,
  categories: categoriesRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);