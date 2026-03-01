"use client";

import { motion } from "framer-motion";
import { FlameIcon, TargetIcon, TrendingUpIcon } from "lucide-react";

interface HabitStat {
    id: string;
    name: string;
    color: string;
    icon: string | null;
    category: string | null;
    completed: number;
    scheduled: number;
    rate: number;
    currentStreak: number;
    longestStreak: number;
}

interface IHabitBreakdownChartProps {
    data: HabitStat[];
}

export const HabitBreakdownChart = ({ data }: IHabitBreakdownChartProps) => {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-foreground-400">
                No habits to display.
            </div>
        );
    }

    const sorted = [...data].sort((a, b) => b.rate - a.rate);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-3"
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                    Per-Habit Breakdown
                </p>
                <div className="flex items-center gap-3 text-xs text-foreground-400">
                    <span className="flex items-center gap-1">
                        <TargetIcon size={11} />
                        Rate
                    </span>
                    <span className="flex items-center gap-1">
                        <FlameIcon size={11} className="text-orange-400" />
                        Streak
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {sorted.map((habit, index) => (
                    <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className="group space-y-1.5"
                    >
                        <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div
                                    className="shrink-0 w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: habit.color }}
                                />

                                <div className="flex items-center gap-1.5 min-w-0">
                                    {habit.icon && (
                                        <span className="text-sm leading-none select-none shrink-0">
                                            {habit.icon}
                                        </span>
                                    )}
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {habit.name}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {habit.currentStreak >= 3 && (
                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-400">
                                        <FlameIcon size={11} />
                                        {habit.currentStreak}d
                                    </span>
                                )}
                                <span
                                    className="text-xs font-bold tabular-nums"
                                    style={{
                                        color:
                                            habit.rate >= 80
                                                ? "#10b981"
                                                : habit.rate >= 50
                                                  ? "#eab308"
                                                  : habit.rate > 0
                                                    ? "#f97316"
                                                    : "rgba(255,255,255,0.3)",
                                    }}
                                >
                                    {habit.rate}%
                                </span>
                                <span className="text-xs text-foreground-400 tabular-nums">
                                    {habit.completed}/{habit.scheduled}
                                </span>
                            </div>
                        </div>

                        <div className="relative h-2 w-full rounded-full bg-white/8 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${habit.rate}%` }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.1 + index * 0.04,
                                    ease: "easeOut",
                                }}
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{
                                    backgroundColor: habit.color,
                                    opacity: habit.rate === 0 ? 0.2 : 0.85,
                                }}
                            />
                        </div>

                        {habit.longestStreak > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-foreground-500">
                                <TrendingUpIcon size={10} />
                                <span>
                                    Longest streak:{" "}
                                    <span className="text-foreground-300 font-medium">
                                        {habit.longestStreak}d
                                    </span>
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
