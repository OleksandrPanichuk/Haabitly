import { createTRPCRouter } from "../init";
import { completionsRouter } from "./completions.router";
import { habitsRouter } from "./habits.router";

export const appRouter = createTRPCRouter({
  habits: habitsRouter,
  completions: completionsRouter,
});

export type AppRouter = typeof appRouter;
