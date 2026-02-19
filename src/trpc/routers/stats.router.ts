import {createTRPCRouter, protectedProcedure} from "@/trpc/init";

export const statsRouter = createTRPCRouter({
  getCurrentStreaks: protectedProcedure.query(async ({ ctx }) => {}),
  getCompletionRate: protectedProcedure.query(async ({ ctx }) => {}),
  getLongestStreak: protectedProcedure.query(async ({ ctx }) => {}),
});
