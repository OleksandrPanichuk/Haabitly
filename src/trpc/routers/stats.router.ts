import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { completions, habits } from "@/db/schema";
import {
    calculateStreaks,
    getDatesInRange,
    isHabitScheduledOn,
    toDateKey,
} from "@/lib/utils";
import { getHabitStatsSchema, getStatsSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const statsRouter = createTRPCRouter({
    getSummary: protectedProcedure
        .input(getStatsSchema)
        .query(async ({ ctx, input }) => {
            const userHabits = await ctx.db
                .select()
                .from(habits)
                .where(eq(habits.userId, ctx.user.id));

            const rangeCompletions = await ctx.db
                .select({
                    id: completions.id,
                    date: completions.date,
                    habitId: completions.habitId,
                })
                .from(completions)
                .innerJoin(habits, eq(habits.id, completions.habitId))
                .where(
                    and(
                        eq(habits.userId, ctx.user.id),
                        gte(completions.date, input.startDate),
                        lte(completions.date, input.endDate),
                    ),
                );

            const allDates = getDatesInRange(input.startDate, input.endDate);

            const completedDaySet = new Set(
                rangeCompletions.map((c) => toDateKey(c.date)),
            );

            let totalScheduled = 0;

            for (const habit of userHabits) {
                for (const date of allDates) {
                    if (isHabitScheduledOn(habit, date)) totalScheduled++;
                }
            }

            const totalCompletions = rangeCompletions.length;

            const completionRate =
                totalScheduled > 0
                    ? Math.round((totalCompletions / totalScheduled) * 100)
                    : 0;

            const { currentStreak, longestStreak } = calculateStreaks(
                allDates,
                completedDaySet,
            );

            const completionsByDay = allDates.map((date) => {
                const key = toDateKey(date);
                return {
                    date,
                    count: rangeCompletions.filter(
                        (c) => toDateKey(c.date) === key,
                    ).length,
                };
            });

            return {
                totalHabits: userHabits.length,
                totalCompletions,
                totalScheduled,
                completionRate,
                currentStreak,
                longestStreak,
                completionsByDay,
            };
        }),

    getHabitStats: protectedProcedure
        .input(getHabitStatsSchema)
        .query(async ({ ctx, input }) => {
            const [habit] = await ctx.db
                .select()
                .from(habits)
                .where(
                    and(
                        eq(habits.id, input.habitId),
                        eq(habits.userId, ctx.user.id),
                    ),
                );

            if (!habit) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Habit not found",
                });
            }

            const habitCompletions = await ctx.db
                .select({
                    id: completions.id,
                    date: completions.date,
                })
                .from(completions)
                .where(
                    and(
                        eq(completions.habitId, input.habitId),
                        gte(completions.date, input.startDate),
                        lte(completions.date, input.endDate),
                    ),
                );

            const completedDatesSet = new Set(
                habitCompletions.map((c) => toDateKey(c.date)),
            );

            const allDates = getDatesInRange(input.startDate, input.endDate);
            const scheduledDates = allDates.filter((date) =>
                isHabitScheduledOn(habit, date),
            );

            const habitCreatedKey = toDateKey(
                new Date(
                    Date.UTC(
                        habit.createdAt.getUTCFullYear(),
                        habit.createdAt.getUTCMonth(),
                        habit.createdAt.getUTCDate(),
                    ),
                ),
            );

            const firstCompletionKey =
                habitCompletions.length > 0
                    ? (habitCompletions
                          .map((c) => toDateKey(c.date))
                          .sort()[0] ?? null)
                    : null;

            const effectiveStartKey =
                firstCompletionKey && firstCompletionKey < habitCreatedKey
                    ? firstCompletionKey
                    : habitCreatedKey;

            const effectiveScheduledDates = scheduledDates.filter(
                (d) => toDateKey(d) >= effectiveStartKey,
            );

            const completionRate =
                effectiveScheduledDates.length > 0
                    ? Math.round(
                          (habitCompletions.length /
                              effectiveScheduledDates.length) *
                              100,
                      )
                    : 0;

            const { currentStreak, longestStreak } = calculateStreaks(
                effectiveScheduledDates,
                completedDatesSet,
            );

            const completionsByDay = allDates.map((date) => {
                const key = toDateKey(date);
                return {
                    date,
                    scheduled: scheduledDates.some((s) => toDateKey(s) === key),
                    completed: completedDatesSet.has(key),
                };
            });

            return {
                habit,
                totalCompletions: habitCompletions.length,
                totalScheduled: effectiveScheduledDates.length,
                completionRate,
                currentStreak,
                longestStreak,
                completionsByDay,
            };
        }),
});
