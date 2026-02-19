import {createTRPCRouter, protectedProcedure} from "@/trpc/init";

export const completionsRouter = createTRPCRouter({
  getByDateRange: protectedProcedure.query(async ({ ctx }) => {}),
  toggle: protectedProcedure.mutation(async ({ ctx }) => {}),
});
