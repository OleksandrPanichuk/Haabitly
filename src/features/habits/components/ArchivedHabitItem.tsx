"use client";

import { Button, Tooltip } from "@heroui/react";
import {
    ArchiveRestoreIcon,
    BarChart2Icon,
    PencilIcon,
    Trash2Icon,
} from "lucide-react";
import { HABIT_CATEGORIES } from "@/features/habits/constants";
import type { THabitWithStatus } from "@/types";

interface IArchivedHabitItemProps {
    data: THabitWithStatus;
    onEdit: (habit: THabitWithStatus) => void;
    onDelete: (habit: THabitWithStatus) => void;
    onStats: (habit: THabitWithStatus) => void;
    onRestore: (habit: THabitWithStatus) => void;
}

function getFrequencyBadge(habit: THabitWithStatus): string {
    switch (habit.frequencyType) {
        case "daily":
            return "Daily";
        case "weekly": {
            const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
            const days = (habit.frequencyDaysOfWeek ?? [])
                .sort((a, b) => a - b)
                .map((d) => dayNames[d])
                .join(" · ");
            return days ? `Weekly — ${days}` : "Weekly";
        }
        case "custom":
            return `Every ${habit.frequencyInterval} ${habit.frequencyUnit}`;
        default:
            return "";
    }
}

export const ArchivedHabitItem = ({
    data,
    onEdit,
    onDelete,
    onStats,
    onRestore,
}: IArchivedHabitItemProps) => {
    const categoryMeta = HABIT_CATEGORIES.find(
        (c) => c.value === data.category,
    );
    const frequencyBadge = getFrequencyBadge(data);

    return (
        <div
            className="group relative flex items-start gap-4 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm px-4 py-3.5 opacity-60 transition-all duration-200 hover:opacity-80 hover:border-white/15"
        >
            <div
                className="absolute left-0 top-3 bottom-3 w-1 rounded-full opacity-40"
                style={{ backgroundColor: data.color }}
            />

            <div className="relative mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 border-white/15 bg-white/5" />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    {data.icon && (
                        <span className="text-base leading-none select-none opacity-70">
                            {data.icon}
                        </span>
                    )}
                    <span className="text-sm font-semibold text-foreground-400">
                        {data.name}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {data.description && (
                        <span className="text-xs text-foreground-500 truncate max-w-50">
                            {data.description}
                        </span>
                    )}

                    {categoryMeta && categoryMeta.value !== "other" && (
                        <span
                            className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium opacity-60"
                            style={{
                                backgroundColor: `${categoryMeta.color}18`,
                                color: categoryMeta.color,
                            }}
                        >
                            {categoryMeta.icon}
                            {categoryMeta.label}
                        </span>
                    )}

                    <span
                        className="inline-flex items-center text-xs rounded-full px-2 py-0.5 font-medium opacity-60"
                        style={{
                            backgroundColor: `${data.color}18`,
                            color: data.color,
                        }}
                    >
                        {frequencyBadge}
                    </span>

                    {data.archivedAt && (
                        <span className="text-xs text-foreground-500">
                            Archived{" "}
                            {new Date(data.archivedAt).toLocaleDateString(
                                undefined,
                                {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                },
                            )}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mt-0.5">
                <Tooltip content="Statistics" placement="top" delay={400}>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => onStats(data)}
                        className="text-foreground-400 hover:text-foreground min-w-7 w-7 h-7"
                    >
                        <BarChart2Icon size={14} />
                    </Button>
                </Tooltip>

                <Tooltip content="Edit" placement="top" delay={400}>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => onEdit(data)}
                        className="text-foreground-400 hover:text-foreground min-w-7 w-7 h-7"
                    >
                        <PencilIcon size={14} />
                    </Button>
                </Tooltip>

                <Tooltip content="Restore" placement="top" delay={400}>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => onRestore(data)}
                        className="text-warning/60 hover:text-warning min-w-7 w-7 h-7"
                    >
                        <ArchiveRestoreIcon size={14} />
                    </Button>
                </Tooltip>

                <Tooltip content="Delete" placement="top" delay={400}>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        color="danger"
                        onPress={() => onDelete(data)}
                        className="text-foreground-400 hover:text-danger min-w-7 w-7 h-7"
                    >
                        <Trash2Icon size={14} />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};
