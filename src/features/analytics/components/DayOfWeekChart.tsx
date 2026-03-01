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

interface DayData {
    day: string;
    dow: number;
    completed: number;
    scheduled: number;
    rate: number;
}

interface IDayOfWeekChartProps {
    data: DayData[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        payload: DayData;
    }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;

    return (
        <div className="rounded-xl border border-white/15 bg-content1/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs space-y-1 min-w-[120px]">
            <p className="font-semibold text-foreground">{d.day}</p>
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
        </div>
    );
};

function getBarColor(rate: number, isMax: boolean, isMin: boolean): string {
    if (rate === 0) return "rgba(255,255,255,0.08)";
    if (isMax) return "#10b981";
    if (isMin) return "#ef4444";
    if (rate >= 80) return "rgba(16,185,129,0.6)";
    if (rate >= 50) return "rgba(234,179,8,0.6)";
    return "rgba(249,115,22,0.6)";
}

export const DayOfWeekChart = ({ data }: IDayOfWeekChartProps) => {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-foreground-400">
                No data available for this period.
            </div>
        );
    }

    const nonZeroRates = data.filter((d) => d.rate > 0).map((d) => d.rate);
    const maxRate = nonZeroRates.length ? Math.max(...nonZeroRates) : 0;
    const minRate = nonZeroRates.length ? Math.min(...nonZeroRates) : 0;

    const bestDay = data.find((d) => d.rate === maxRate && maxRate > 0);
    const worstDay = data.find(
        (d) => d.rate === minRate && minRate > 0 && minRate < maxRate,
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
        >
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-sm font-semibold text-foreground">
                    Best Day of the Week
                </p>

                <div className="flex gap-3 text-xs">
                    {bestDay && (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                            Best: {bestDay.day} ({bestDay.rate}%)
                        </span>
                    )}
                    {worstDay && (
                        <span className="flex items-center gap-1.5 text-red-400">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                            Worst: {worstDay.day} ({worstDay.rate}%)
                        </span>
                    )}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={data}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    barCategoryGap="30%"
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="day"
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.04)", radius: 4 }}
                    />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {data.map((entry) => {
                            const isMax = entry.rate === maxRate && maxRate > 0;
                            const isMin =
                                entry.rate === minRate &&
                                minRate > 0 &&
                                minRate < maxRate;
                            return (
                                <Cell
                                    key={entry.day}
                                    fill={getBarColor(entry.rate, isMax, isMin)}
                                />
                            );
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {bestDay && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
                >
                    🏆 You perform best on <strong>{bestDay.day}s</strong> with
                    a <strong>{bestDay.rate}%</strong> completion rate.
                    {worstDay && (
                        <>
                            {" "}
                            Consider extra motivation on{" "}
                            <strong>{worstDay.day}s</strong>.
                        </>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};
