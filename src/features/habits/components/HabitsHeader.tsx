"use client";

import { Button, Chip, Tooltip } from "@heroui/react";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    SparklesIcon,
} from "lucide-react";

interface IHabitsHeaderProps {
    date: Date;
    onDateChange: (date: Date) => void;
    onCreateHabit: () => void;
    totalHabits: number;
    completedHabits: number;
}

function formatDateLabel(date: Date): string {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";

    return format(date, "EEEE, MMM d");
}

function getMotivationalMessage(completed: number, total: number): string {
    if (total === 0) return "Start building habits!";
    const pct = total > 0 ? completed / total : 0;
    if (pct === 0) return "Let's get started!";
    if (pct < 0.5) return "Keep going!";
    if (pct < 1) return "Almost there!";
    return "All done — great job!";
}

export const HabitsHeader = ({
    date,
    onDateChange,
    onCreateHabit,
    totalHabits,
    completedHabits,
}: IHabitsHeaderProps) => {
    const progress =
        totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    const dateLabel = formatDateLabel(date);
    const todayFlag = isToday(date);

    const goBack = () => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        onDateChange(d);
    };

    const goForward = () => {
        if (todayFlag) return;
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        onDateChange(d);
    };

    const goToday = () => onDateChange(new Date());

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Tooltip content="Previous day" placement="bottom">
                        <Button
                            isIconOnly
                            variant="flat"
                            size="sm"
                            onPress={goBack}
                            className="text-foreground-500"
                        >
                            <ChevronLeftIcon size={16} />
                        </Button>
                    </Tooltip>

                    <div className="flex flex-col items-center w-36">
                        <motion.h2
                            key={date.toDateString()}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xl font-bold text-foreground tracking-tight"
                        >
                            {dateLabel}
                        </motion.h2>
                        <span className="text-xs text-foreground-400">
                            {format(date, "MMMM d, yyyy")}
                        </span>
                    </div>

                    <Tooltip content="Next day" placement="bottom">
                        <Button
                            isIconOnly
                            variant="flat"
                            size="sm"
                            onPress={goForward}
                            isDisabled={todayFlag}
                            className="text-foreground-500"
                        >
                            <ChevronRightIcon size={16} />
                        </Button>
                    </Tooltip>

                    {!todayFlag && (
                        <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={goToday}
                            className="ml-1 text-xs font-medium"
                        >
                            Today
                        </Button>
                    )}
                </div>

                <Button
                    color="primary"
                    startContent={<PlusIcon size={16} />}
                    onPress={onCreateHabit}
                    className="font-semibold shadow-lg shadow-primary/25"
                >
                    New Habit
                </Button>
            </div>

            {totalHabits > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4"
                >
                    <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-secondary/15 blur-2xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="relative shrink-0">
                            <svg
                                width="56"
                                height="56"
                                className="-rotate-90"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-white/10"
                                />
                                <motion.circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    fill="none"
                                    stroke="url(#progressGrad)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 22}
                                    initial={{
                                        strokeDashoffset: 2 * Math.PI * 22,
                                    }}
                                    animate={{
                                        strokeDashoffset:
                                            2 *
                                            Math.PI *
                                            22 *
                                            (1 - progress / 100),
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeOut",
                                    }}
                                />
                                <defs>
                                    <linearGradient
                                        id="progressGrad"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="hsl(var(--heroui-primary))"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="hsl(var(--heroui-secondary))"
                                        />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground rotate-0">
                                {progress}%
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-semibold text-foreground">
                                    {completedHabits} / {totalHabits} completed
                                </span>
                                {progress === 100 && (
                                    <Chip
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                        startContent={
                                            <SparklesIcon size={10} />
                                        }
                                        classNames={{ base: "h-5" }}
                                    >
                                        Perfect day!
                                    </Chip>
                                )}
                            </div>
                            <p className="text-xs text-foreground-400">
                                {getMotivationalMessage(
                                    completedHabits,
                                    totalHabits,
                                )}
                            </p>

                            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-linear-to-r from-primary to-secondary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeOut",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
