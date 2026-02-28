"use client";

import {
    Button,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Spinner,
} from "@heroui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { motion } from "framer-motion";
import {
    FlameIcon,
    NotebookPenIcon,
    TargetIcon,
    TrendingUpIcon,
    XIcon,
    ZapIcon,
} from "lucide-react";
import { Suspense, useMemo } from "react";
import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useTRPC } from "@/trpc/client";
import type { THabitWithStatus } from "@/types";

interface IHabitStatsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    habit: THabitWithStatus | null;
}

interface IStatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}

const StatCard = ({ icon, label, value, color }: IStatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
    >
        <div
            className={`flex items-center gap-1.5 text-xs font-medium ${color}`}
        >
            {icon}
            <span>{label}</span>
        </div>
        <span className="text-2xl font-bold text-foreground">{value}</span>
    </motion.div>
);

function getFrequencyLabel(habit: THabitWithStatus): string {
    switch (habit.frequencyType) {
        case "daily":
            return "Daily";
        case "weekly": {
            const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
            const selected = (habit.frequencyDaysOfWeek ?? [])
                .sort((a, b) => a - b)
                .map((d) => days[d])
                .join(", ");
            return `Weekly — ${selected}`;
        }
        case "custom":
            return `Every ${habit.frequencyInterval} ${habit.frequencyUnit}`;
        default:
            return "";
    }
}

interface IStatsContentProps {
    habit: THabitWithStatus;
}

const StatsContent = ({ habit }: IStatsContentProps) => {
    const trpc = useTRPC();

    const endDate = useMemo(() => {
        const now = new Date();
        return new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        );
    }, []);

    const startDate = useMemo(() => {
        const s = subMonths(endDate, 6);
        return new Date(
            Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()),
        );
    }, [endDate]);

    const { data } = useSuspenseQuery(
        trpc.stats.getHabitStats.queryOptions({
            habitId: habit.id,
            startDate,
            endDate,
        }),
    );

    const { data: completionsData } = useSuspenseQuery(
        trpc.completions.getByDateRange.queryOptions({
            habitId: habit.id,
            startDate,
            endDate,
        }),
    );

    const notedCompletions = useMemo(
        () =>
            completionsData
                .filter((c) => c.note)
                .sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .slice(0, 5),
        [completionsData],
    );

    const heatmapValues = useMemo(
        () =>
            data.completionsByDay
                .filter((d) => d.completed)
                .map((d) => {
                    const dt = new Date(d.date);
                    const y = dt.getUTCFullYear();
                    const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
                    const day = String(dt.getUTCDate()).padStart(2, "0");
                    return { date: `${y}-${m}-${day}`, count: 1 };
                }),
        [data.completionsByDay],
    );

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3">
                <div
                    className="mt-0.5 shrink-0 w-4 h-4 rounded-full ring-2 ring-white/20"
                    style={{ backgroundColor: habit.color }}
                />
                <div className="min-w-0">
                    <h3 className="text-lg font-bold text-foreground leading-tight">
                        {habit.name}
                    </h3>
                    {habit.description && (
                        <p className="text-sm text-foreground-500 mt-0.5">
                            {habit.description}
                        </p>
                    )}
                    <Chip
                        size="sm"
                        variant="flat"
                        className="mt-1.5"
                        style={{
                            backgroundColor: `${habit.color}22`,
                            color: habit.color,
                            borderColor: `${habit.color}44`,
                        }}
                    >
                        {getFrequencyLabel(habit)}
                    </Chip>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    icon={<FlameIcon size={13} />}
                    label="Current Streak"
                    value={`${data.currentStreak}d`}
                    color="text-orange-400"
                />
                <StatCard
                    icon={<ZapIcon size={13} />}
                    label="Longest Streak"
                    value={`${data.longestStreak}d`}
                    color="text-yellow-400"
                />
                <StatCard
                    icon={<TargetIcon size={13} />}
                    label="Completion Rate"
                    value={`${data.completionRate}%`}
                    color="text-primary"
                />
                <StatCard
                    icon={<TrendingUpIcon size={13} />}
                    label="Total Done"
                    value={data.totalCompletions}
                    color="text-secondary"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                        Activity — last 6 months
                    </span>
                    <span className="text-xs text-foreground-400">
                        {data.totalCompletions} completions
                    </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
                    <style>{`
                        .react-calendar-heatmap .color-empty {
                            fill: rgba(255,255,255,0.05);
                            rx: 3px;
                        }
                        .react-calendar-heatmap .color-scale-1 {
                            fill: ${habit.color}99;
                            rx: 3px;
                        }
                        .react-calendar-heatmap text {
                            fill: rgba(255,255,255,0.4);
                            font-size: 9px;
                        }
                        .react-calendar-heatmap rect:hover {
                            opacity: 0.8;
                            cursor: pointer;
                        }
                    `}</style>

                    <ReactCalendarHeatmap
                        startDate={startDate}
                        endDate={endDate}
                        values={heatmapValues}
                        classForValue={(value) =>
                            !value || value.count === 0
                                ? "color-empty"
                                : "color-scale-1"
                        }
                        // @ts-expect-error: @types/react-calendar-heatmap incorrectly types TooltipDataAttrs as SVGAttributes, excluding data-* attributes
                        tooltipDataAttrs={(value) => ({
                            "data-tooltip-id": "heatmap-tip",
                            "data-tooltip-content": value?.date
                                ? format(new Date(value.date), "MMM d, yyyy")
                                : "",
                        })}
                        showWeekdayLabels
                    />

                    <ReactTooltip id="heatmap-tip" />
                </div>

                <div className="flex items-center justify-end gap-2 text-xs text-foreground-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {[0.1, 0.3, 0.6, 0.9].map((o) => (
                            <div
                                key={o}
                                className="w-3 h-3 rounded-sm"
                                style={{
                                    backgroundColor: `${habit.color}`,
                                    opacity: o,
                                }}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            {notedCompletions.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <NotebookPenIcon
                            size={13}
                            className="text-foreground-400"
                        />
                        <span className="text-sm font-semibold text-foreground">
                            Recent Notes
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {notedCompletions.map((c) => {
                            const dt = new Date(c.date);
                            const y = dt.getUTCFullYear();
                            const m = String(dt.getUTCMonth() + 1).padStart(
                                2,
                                "0",
                            );
                            const d = String(dt.getUTCDate()).padStart(2, "0");
                            const label = format(
                                new Date(`${y}-${m}-${d}`),
                                "MMM d, yyyy",
                            );
                            return (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 space-y-1"
                                >
                                    <p className="text-xs text-foreground-400 font-medium">
                                        {label}
                                    </p>
                                    <p className="text-sm text-foreground-300 leading-relaxed italic">
                                        &ldquo;{c.note}&rdquo;
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                    <p className="text-xs text-foreground-400">
                        Scheduled days
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                        {data.totalScheduled} days
                    </p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="space-y-0.5">
                    <p className="text-xs text-foreground-400">Completed</p>
                    <p className="text-sm font-semibold text-foreground">
                        {data.totalCompletions} days
                    </p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="space-y-0.5">
                    <p className="text-xs text-foreground-400">Missed</p>
                    <p className="text-sm font-semibold text-foreground">
                        {Math.max(
                            0,
                            data.totalScheduled - data.totalCompletions,
                        )}{" "}
                        days
                    </p>
                </div>
            </div>
        </div>
    );
};

export const HabitStatsModal = ({
    open,
    onOpenChange,
    habit,
}: IHabitStatsModalProps) => {
    return (
        <Modal
            isOpen={open}
            onOpenChange={onOpenChange}
            placement="center"
            size="lg"
            scrollBehavior="inside"
            classNames={{
                base: "max-h-[90vh]",
                body: "py-4",
            }}
            hideCloseButton
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center justify-between pr-3">
                            <span className="text-base font-semibold">
                                Habit Statistics
                            </span>
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={onClose}
                                className="text-foreground-400"
                            >
                                <XIcon size={16} />
                            </Button>
                        </ModalHeader>

                        <ModalBody>
                            {habit && (
                                <Suspense
                                    fallback={
                                        <div className="flex items-center justify-center py-12">
                                            <Spinner
                                                size="lg"
                                                color="primary"
                                            />
                                        </div>
                                    }
                                >
                                    <StatsContent habit={habit} />
                                </Suspense>
                            )}
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
