import { TRPCError } from "@trpc/server";
import { and, asc, eq, getTableColumns, gte, lte } from "drizzle-orm";
import { completions, habits } from "@/db/schema";
import {
    getCompletionsByDateRangeSchema,
    toggleCompletionSchema,
    updateCompletionNoteSchema,
} from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const completionsRouter = createTRPCRouter({
    getByDateRange: protectedProcedure
        .input(getCompletionsByDateRangeSchema)
        .query(async ({ ctx, input }) => {
            return ctx.db
                .select(getTableColumns(completions))
                .from(completions)
                .innerJoin(habits, eq(habits.id, completions.habitId))
                .where(
                    and(
                        eq(habits.userId, ctx.user.id),
                        gte(completions.date, input.startDate),
                        lte(completions.date, input.endDate),
                        input.habitId
                            ? eq(completions.habitId, input.habitId)
                            : undefined,
                    ),
                )
                .orderBy(asc(completions.date));
        }),
    toggle: protectedProcedure
        .input(toggleCompletionSchema)
        .mutation(async ({ ctx, input }) => {
            const [habit] = await ctx.db
                .select({ id: habits.id })
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

            const [existing] = await ctx.db
                .select({ id: completions.id })
                .from(completions)
                .where(
                    and(
                        eq(completions.habitId, input.habitId),
                        eq(completions.date, input.date),
                    ),
                );

            if (existing) {
                await ctx.db
                    .delete(completions)
                    .where(eq(completions.id, existing.id));

                return { completed: false };
            }

            const [completion] = await ctx.db
                .insert(completions)
                .values({
                    habitId: input.habitId,
                    date: input.date,
                    note: input.note,
                })
                .returning();

            return { completed: true, completion };
        }),

    updateNote: protectedProcedure
        .input(updateCompletionNoteSchema)
        .mutation(async ({ ctx, input }) => {
            const [habit] = await ctx.db
                .select({ id: habits.id })
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

            const [existing] = await ctx.db
                .select({ id: completions.id })
                .from(completions)
                .where(
                    and(
                        eq(completions.habitId, input.habitId),
                        eq(completions.date, input.date),
                    ),
                );

            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Completion not found for this date",
                });
            }

            const [updated] = await ctx.db
                .update(completions)
                .set({ note: input.note ?? null })
                .where(eq(completions.id, existing.id))
                .returning();

            return updated;
        }),
});
