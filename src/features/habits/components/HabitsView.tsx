"use client";

import { Button } from "@heroui/react";
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
    calculateStreaks,
    getDatesInRange,
    isHabitScheduledOn,
    toDateKey,
} from "@/lib/utils";
import type { THabitFormValues } from "@/schemas";
import { habitUpdateSchema } from "@/schemas";
import { useTRPC } from "@/trpc/client";
import type { THabitWithStatus } from "@/types";
import { HabitDeleteDialog } from "./HabitDeleteDialog";
import { HabitDialog } from "./HabitDialog";
import { HabitStatsModal } from "./HabitStatsModal";
import { HabitsHeader } from "./HabitsHeader";
import { HabitsList } from "./HabitsList";

type TabState = "ALL" | "COMPLETED" | "INCOMPLETE";

const TABS: { key: TabState; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "COMPLETED", label: "Completed" },
    { key: "INCOMPLETE", label: "Incomplete" },
];

export const HabitsView = ({ date: initialDate }: { date: string }) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [date, setDate] = useState<Date>(() => new Date(initialDate));
    const [tab, setTab] = useState<TabState>("ALL");

    const [createOpen, setCreateOpen] = useState(false);
    const [editHabit, setEditHabit] = useState<THabitWithStatus | null>(null);
    const [deleteHabit, setDeleteHabit] = useState<THabitWithStatus | null>(
        null,
    );
    const [statsHabit, setStatsHabit] = useState<THabitWithStatus | null>(null);
    const [statsOpen, setStatsOpen] = useState(false);

    const { data: habits } = useSuspenseQuery(
        trpc.habits.list.queryOptions({ date }),
    );

    const streakStart = useMemo(
        () =>
            new Date(
                Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate() - 90,
                ),
            ),
        [date],
    );
    const streakEnd = useMemo(
        () =>
            new Date(
                Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                ),
            ),
        [date],
    );

    const { data: rangeCompletions } = useSuspenseQuery(
        trpc.completions.getByDateRange.queryOptions({
            startDate: streakStart,
            endDate: streakEnd,
        }),
    );

    const streaks = useMemo(() => {
        const allDates = getDatesInRange(streakStart, streakEnd);
        const result: Record<string, number> = {};

        for (const habit of habits) {
            const completedKeys = new Set(
                rangeCompletions
                    .filter((c) => c.habitId === habit.id)
                    .map((c) => toDateKey(new Date(c.date))),
            );
            const scheduledDates = allDates.filter((d) =>
                isHabitScheduledOn(habit, d),
            );
            const { currentStreak } = calculateStreaks(
                scheduledDates,
                completedKeys,
            );
            result[habit.id] = currentStreak;
        }

        return result;
    }, [habits, rangeCompletions, streakStart, streakEnd]);

    const bannerStreak = useMemo(() => {
        if (habits.length === 0) return 0;
        if (!habits.every((h) => !!h.completedAt)) return 0;
        return Math.min(...habits.map((h) => streaks[h.id] ?? 0));
    }, [habits, streaks]);

    const { mutate: createHabit, isPending: isCreating } = useMutation(
        trpc.habits.create.mutationOptions({
            onSuccess: (newHabit) => {
                queryClient.invalidateQueries({
                    queryKey: trpc.habits.list.queryKey({ date }),
                });
                setCreateOpen(false);
                toast.success(`"${newHabit.name}" created!`);
            },
            onError: () => {
                toast.error("Failed to create habit. Please try again.");
            },
        }),
    );

    const { mutate: updateHabit, isPending: isUpdating } = useMutation(
        trpc.habits.update.mutationOptions({
            onSuccess: (updated) => {
                queryClient.invalidateQueries({
                    queryKey: trpc.habits.list.queryKey({ date }),
                });
                setEditHabit(null);
                toast.success(`"${updated.name}" updated!`);
            },
            onError: () => {
                toast.error("Failed to update habit. Please try again.");
            },
        }),
    );

    const { mutate: deleteHabitMutation, isPending: isDeleting } = useMutation(
        trpc.habits.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: trpc.habits.list.queryKey({ date }),
                });
                const name = deleteHabit?.name;
                setDeleteHabit(null);
                toast.success(`"${name}" deleted.`);
            },
            onError: () => {
                toast.error("Failed to delete habit. Please try again.");
            },
        }),
    );

    const handleCreateSubmit = (values: THabitFormValues) => {
        createHabit(values);
    };

    const handleEditSubmit = (values: THabitFormValues) => {
        if (!editHabit) return;
        const parsed = habitUpdateSchema.safeParse({
            ...values,
            id: editHabit.id,
        });
        if (!parsed.success) return;
        updateHabit(parsed.data);
    };

    const handleDeleteConfirm = () => {
        if (!deleteHabit) return;
        deleteHabitMutation({ id: deleteHabit.id });
    };

    const handleOpenStats = (habit: THabitWithStatus) => {
        setStatsHabit(habit);
        setStatsOpen(true);
    };

    const handleStatsOpenChange = (open: boolean) => {
        setStatsOpen(open);
        if (!open) setStatsHabit(null);
    };

    const filteredHabits = habits.filter((habit) => {
        if (tab === "ALL") return true;
        if (tab === "COMPLETED") return !!habit.completedAt;
        return !habit.completedAt;
    });

    const completedCount = habits.filter((h) => !!h.completedAt).length;

    return (
        <>
            <HabitDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={handleCreateSubmit}
                isLoading={isCreating}
            />

            <HabitDialog
                open={!!editHabit}
                onOpenChange={(open) => {
                    if (!open) setEditHabit(null);
                }}
                habit={editHabit}
                onSubmit={handleEditSubmit}
                isLoading={isUpdating}
            />

            <HabitDeleteDialog
                open={!!deleteHabit}
                onOpenChange={(open) => {
                    if (!open) setDeleteHabit(null);
                }}
                habit={deleteHabit}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
            />

            <HabitStatsModal
                open={statsOpen}
                onOpenChange={handleStatsOpenChange}
                habit={statsHabit}
            />

            <div className="min-h-screen px-4 pt-8 pb-16 sm:px-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    <HabitsHeader
                        date={date}
                        onDateChange={setDate}
                        onCreateHabit={() => setCreateOpen(true)}
                        totalHabits={habits.length}
                        completedHabits={completedCount}
                    />

                    {habits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit"
                        >
                            {TABS.map(({ key, label }) => {
                                const count =
                                    key === "ALL"
                                        ? habits.length
                                        : key === "COMPLETED"
                                          ? completedCount
                                          : habits.length - completedCount;

                                return (
                                    <Button
                                        key={key}
                                        size="sm"
                                        variant={
                                            tab === key ? "solid" : "light"
                                        }
                                        color={
                                            tab === key ? "primary" : "default"
                                        }
                                        onPress={() => setTab(key)}
                                        className={[
                                            "text-xs font-medium px-3 h-7 min-w-fit rounded-lg transition-all",
                                            tab === key
                                                ? "shadow-sm"
                                                : "text-foreground-500 hover:text-foreground",
                                        ].join(" ")}
                                    >
                                        {label}
                                        <span
                                            className={[
                                                "ml-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold w-4 h-4",
                                                tab === key
                                                    ? "bg-white/20 text-white"
                                                    : "bg-white/10 text-foreground-400",
                                            ].join(" ")}
                                        >
                                            {count}
                                        </span>
                                    </Button>
                                );
                            })}
                        </motion.div>
                    )}

                    {bannerStreak >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, delay: 0.15 }}
                            className="flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3"
                        >
                            <span className="text-2xl select-none">🔥</span>
                            <div>
                                <p className="text-sm font-semibold text-orange-300">
                                    {bannerStreak}-day streak!
                                </p>
                                <p className="text-xs text-orange-400/70">
                                    Keep the momentum going. Don&apos;t break
                                    the chain!
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <HabitsList
                        data={filteredHabits}
                        date={date}
                        streaks={streaks}
                        tab={tab}
                        onEdit={setEditHabit}
                        onDelete={setDeleteHabit}
                        onStats={handleOpenStats}
                        onCreateHabit={() => setCreateOpen(true)}
                        totalHabits={habits.length}
                    />
                </div>
            </div>
        </>
    );
};
