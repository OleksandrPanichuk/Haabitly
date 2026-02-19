import { TRPCError } from "@trpc/server";
import { and, asc, eq, getTableColumns, inArray } from "drizzle-orm";
import { completions, habits } from "@/db/schema";
import {
  createHabitSchema,
  deleteHabitSchema,
  deleteManyHabitsSchema,
  listHabitsSchema,
  updateHabitSchema,
} from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const habitsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listHabitsSchema)
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          ...getTableColumns(habits),
          completedAt: completions.date,
        })
        .from(habits)
        .leftJoin(
          completions,
          and(
            eq(completions.habitId, habits.id),
            eq(completions.date, input.date),
          ),
        )
        .where(eq(habits.userId, ctx.user.id))
        .orderBy(asc(habits.createdAt));

      const dayOfWeek = input.date.getDay();

      return rows.filter((row) => {
        switch (row.frequencyType) {
          case "daily":
            return true;
          case "weekly":
            return row.frequencyDaysOfWeek?.includes(dayOfWeek);
          case "custom": {
            if (!row.frequencyInterval || !row.frequencyUnit) return false;

            const start = new Date(row.createdAt);
            start.setHours(0, 0, 0, 0);
            const target = new Date(input.date);
            target.setHours(0, 0, 0, 0);

            const daysDiff = Math.round(
              (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (daysDiff < 0) return false;

            const intervalDays =
              row.frequencyUnit === "weeks"
                ? row.frequencyInterval * 7
                : row.frequencyInterval;

            return daysDiff % intervalDays === 0;
          }
          default:
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Invalid frequency type",
            });
        }
      });
    }),
  create: protectedProcedure
    .input(createHabitSchema)
    .mutation(async ({ ctx, input }) => {
      const [habit] = await ctx.db
        .insert(habits)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          frequencyType: input.frequencyType,
          frequencyDaysOfWeek:
            input.frequencyType === "weekly" ? input.frequencyDaysOfWeek : null,
          frequencyInterval:
            input.frequencyType === "custom" ? input.frequencyInterval : null,
          frequencyUnit:
            input.frequencyType === "custom" ? input.frequencyUnit : null,
          color: input.color,
        })
        .returning();
      return habit;
    }),
  update: protectedProcedure
    .input(updateHabitSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, frequency, ...rest } = input;

      const frequencyFields = frequency
        ? {
            frequencyType: frequency.frequencyType,
            frequencyDaysOfWeek:
              frequency.frequencyType === "weekly"
                ? frequency.frequencyDaysOfWeek
                : null,
            frequencyInterval:
              frequency.frequencyType === "custom"
                ? frequency.frequencyInterval
                : null,
            frequencyUnit:
              frequency.frequencyType === "custom"
                ? frequency.frequencyUnit
                : null,
          }
        : {};

      const [updated] = await ctx.db
        .update(habits)
        .set({ ...rest, ...frequencyFields })
        .where(and(eq(habits.id, id), eq(habits.userId, ctx.user.id)))
        .returning();

      return updated;
    }),
  delete: protectedProcedure
    .input(deleteHabitSchema)
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(habits)
        .where(and(eq(habits.id, input.id), eq(habits.userId, ctx.user.id)))
        .returning({ id: habits.id });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Habit not found",
        });
      }

      return deleted;
    }),
  deleteMany: protectedProcedure
    .input(deleteManyHabitsSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(habits)
        .where(
          and(inArray(habits.id, input.ids), eq(habits.userId, ctx.user.id)),
        );
    }),
});
