import { analyticsRouter } from "@/trpc/routers/analytics.router";
import { statsRouter } from "@/trpc/routers/stats.router";
import { createTRPCRouter } from "../init";
import { completionsRouter } from "./completions.router";
import { habitsRouter } from "./habits.router";

export const appRouter = createTRPCRouter({
    habits: habitsRouter,
    completions: completionsRouter,
    stats: statsRouter,
    analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
