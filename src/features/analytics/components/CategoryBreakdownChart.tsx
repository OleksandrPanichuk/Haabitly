"use client";

import { motion } from "framer-motion";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { HABIT_CATEGORIES } from "@/features/habits/constants";

interface CategoryData {
    category: string;
    completed: number;
    scheduled: number;
    habitCount: number;
    rate: number;
}

interface ICategoryBreakdownChartProps {
    data: CategoryData[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        payload: CategoryData & { label: string; icon: string; fill: string };
    }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;

    return (
        <div className="rounded-xl border border-white/15 bg-content1/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs space-y-1 min-w-35">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
                <span>{d.icon}</span>
                <span>{d.label}</span>
            </p>
            <div className="flex items-center justify-between gap-4">
                <span className="text-foreground-400">Rate</span>
                <span
                    className="font-bold"
                    style={{
                        color:
                            d.rate >= 80
                                ? "#10b981"
                                : d.rate >= 50
                                  ? "#eab308"
                                  : d.rate > 0
                                    ? "#ef4444"
                                    : "rgba(255,255,255,0.3)",
                    }}
                >
                    {d.rate}%
                </span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <span className="text-foreground-400">Completed</span>
                <span className="font-semibold text-foreground">
                    {d.completed}
                </span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <span className="text-foreground-400">Scheduled</span>
                <span className="font-semibold text-foreground">
                    {d.scheduled}
                </span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <span className="text-foreground-400">Habits</span>
                <span className="font-semibold text-foreground">
                    {d.habitCount}
                </span>
            </div>
        </div>
    );
};

export const CategoryBreakdownChart = ({
    data,
}: ICategoryBreakdownChartProps) => {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-foreground-400">
                No category data available.
            </div>
        );
    }

    const enriched = data
        .map((d) => {
            const meta = HABIT_CATEGORIES.find((c) => c.value === d.category);
            return {
                ...d,
                label: meta?.label ?? d.category,
                icon: meta?.icon ?? "✨",
                fill: meta?.color ?? "#6b7280",
            };
        })
        .sort((a, b) => b.rate - a.rate);

    const chartHeight = Math.max(160, enriched.length * 52);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-3"
        >
            <p className="text-sm font-semibold text-foreground">
                Category Breakdown
            </p>

            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                    layout="vertical"
                    data={enriched}
                    margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                    barCategoryGap="28%"
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                        horizontal={false}
                    />
                    <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                        type="category"
                        dataKey="label"
                        tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                        tickFormatter={(v: string) => v}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={28}>
                        {enriched.map((entry) => (
                            <Cell
                                key={entry.category}
                                fill={entry.fill}
                                fillOpacity={0.85}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-2 pt-1">
                {enriched.map((entry) => (
                    <div
                        key={entry.category}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1"
                    >
                        <span className="text-sm">{entry.icon}</span>
                        <span className="text-xs font-medium text-foreground-400">
                            {entry.label}
                        </span>
                        <span
                            className="text-xs font-bold"
                            style={{ color: entry.fill }}
                        >
                            {entry.rate}%
                        </span>
                        <span className="text-[10px] text-foreground-500">
                            ({entry.habitCount}{" "}
                            {entry.habitCount === 1 ? "habit" : "habits"})
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
