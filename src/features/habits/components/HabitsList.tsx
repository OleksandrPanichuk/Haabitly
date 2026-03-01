"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArchiveIcon,
    CalendarCheckIcon,
    PlusIcon,
    SparklesIcon,
} from "lucide-react";
import type { THabitWithStatus } from "@/types";
import { ArchivedHabitItem } from "./ArchivedHabitItem";
import { HabitItem } from "./HabitItem";

interface IHabitsListProps {
    data: THabitWithStatus[];
    date: Date;
    streaks: Record<string, number>;
    tab: "ALL" | "COMPLETED" | "INCOMPLETE";
    includeArchived?: boolean;
    onEdit: (habit: THabitWithStatus) => void;
    onDelete: (habit: THabitWithStatus) => void;
    onStats: (habit: THabitWithStatus) => void;
    onArchive: (habit: THabitWithStatus) => void;
    onRestore: (habit: THabitWithStatus) => void;
    onCreateHabit: () => void;
    onHideArchived: () => void;
    totalHabits: number;
}

const EmptyAll = ({ onCreateHabit }: { onCreateHabit: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center"
    >
        <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CalendarCheckIcon size={36} className="text-primary" />
            </div>
            <motion.div
                animate={{ rotate: [0, 15, -10, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center"
            >
                <SparklesIcon size={14} className="text-secondary" />
            </motion.div>
        </div>

        <div className="space-y-1.5 max-w-xs">
            <h3 className="text-lg font-bold text-foreground">No habits yet</h3>
            <p className="text-sm text-foreground-500 leading-relaxed">
                Create your first habit and start building streaks. Small steps
                lead to big changes.
            </p>
        </div>

        <Button
            color="primary"
            startContent={<PlusIcon size={16} />}
            onPress={onCreateHabit}
            className="font-semibold shadow-lg shadow-primary/25"
        >
            Create your first habit
        </Button>
    </motion.div>
);

const EmptyArchived = ({ onHideArchived }: { onHideArchived: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center"
    >
        <div className="w-20 h-20 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center">
            <ArchiveIcon size={36} className="text-warning" />
        </div>
        <div className="space-y-1.5 max-w-xs">
            <h3 className="text-lg font-bold text-foreground">
                No archived habits
            </h3>
            <p className="text-sm text-foreground-500 leading-relaxed">
                You haven't archived any habits yet. Archive a habit to remove
                it from your daily view without deleting it.
            </p>
        </div>
        <Button
            variant="flat"
            onPress={onHideArchived}
            className="font-semibold"
        >
            Back to my habits
        </Button>
    </motion.div>
);

const EmptyFiltered = ({ tab }: { tab: "COMPLETED" | "INCOMPLETE" }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center"
    >
        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            {tab === "COMPLETED" ? (
                <SparklesIcon size={26} className="text-foreground-400" />
            ) : (
                <CalendarCheckIcon size={26} className="text-foreground-400" />
            )}
        </div>
        <div className="space-y-1 max-w-xs">
            <p className="text-sm font-semibold text-foreground-500">
                {tab === "COMPLETED"
                    ? "No completed habits yet"
                    : "All caught up!"}
            </p>
            <p className="text-xs text-foreground-400">
                {tab === "COMPLETED"
                    ? "Check off some habits to see them here."
                    : "You have completed all habits for today. Great work!"}
            </p>
        </div>
    </motion.div>
);

export const HabitsList = ({
    data,
    date,
    streaks,
    tab,
    includeArchived = false,
    onEdit,
    onDelete,
    onStats,
    onArchive,
    onRestore,
    onCreateHabit,
    onHideArchived,
    totalHabits,
}: IHabitsListProps) => {
    if (includeArchived) {
        if (data.length === 0) {
            return <EmptyArchived onHideArchived={onHideArchived} />;
        }
    } else {
        if (totalHabits === 0) {
            return <EmptyAll onCreateHabit={onCreateHabit} />;
        }

        if (data.length === 0) {
            return <EmptyFiltered tab={tab as "COMPLETED" | "INCOMPLETE"} />;
        }
    }

    return (
        <motion.div className="flex flex-col gap-2.5" initial={false}>
            <AnimatePresence mode="sync" initial={false}>
                {includeArchived
                    ? data.map((habit) => (
                          <ArchivedHabitItem
                              key={habit.id}
                              data={habit}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onStats={onStats}
                              onRestore={onRestore}
                          />
                      ))
                    : data.map((habit) => (
                          <HabitItem
                              key={habit.id}
                              data={habit}
                              date={date}
                              includeArchived={false}
                              currentStreak={streaks[habit.id] ?? 0}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onStats={onStats}
                              onArchive={onArchive}
                          />
                      ))}
            </AnimatePresence>
        </motion.div>
    );
};
