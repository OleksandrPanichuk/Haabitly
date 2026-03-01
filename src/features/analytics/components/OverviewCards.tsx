"use client";

import { motion } from "framer-motion";
import {
    CalendarCheckIcon,
    FlameIcon,
    SparklesIcon,
    StarIcon,
    TargetIcon,
    TrendingUpIcon,
} from "lucide-react";

interface IOverviewCardsProps {
    totalHabits: number;
    totalCompletions: number;
    overallRate: number;
    bestStreak: number;
    perfectDays: number;
    totalScheduled: number;
}

interface IStatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    gradient: string;
    delay?: number;
}

const StatCard = ({
    icon,
    label,
    value,
    sub,
    gradient,
    delay = 0,
}: IStatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4"
    >
        <div
            className={`pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-30 bg-gradient-to-br ${gradient}`}
        />

        <div className="relative flex items-start justify-between gap-3">
            <div className="space-y-1">
                <p className="text-xs font-medium text-foreground-500 uppercase tracking-wide">
                    {label}
                </p>
                <p className="text-3xl font-bold text-foreground leading-none">
                    {value}
                </p>
                {sub && (
                    <p className="text-xs text-foreground-400 mt-1">{sub}</p>
                )}
            </div>
            <div
                className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            >
                {icon}
            </div>
        </div>
    </motion.div>
);

export const OverviewCards = ({
    totalHabits,
    totalCompletions,
    overallRate,
    bestStreak,
    perfectDays,
    totalScheduled,
}: IOverviewCardsProps) => {
    const missed = Math.max(0, totalScheduled - totalCompletions);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
                icon={<TargetIcon size={18} className="text-white" />}
                label="Active Habits"
                value={totalHabits}
                sub="habits being tracked"
                gradient="from-blue-500 to-cyan-500"
                delay={0}
            />
            <StatCard
                icon={<CalendarCheckIcon size={18} className="text-white" />}
                label="Total Completions"
                value={totalCompletions.toLocaleString()}
                sub={`${missed} missed`}
                gradient="from-emerald-500 to-teal-500"
                delay={0.05}
            />
            <StatCard
                icon={<TrendingUpIcon size={18} className="text-white" />}
                label="Completion Rate"
                value={`${overallRate}%`}
                sub={`${totalScheduled} scheduled`}
                gradient="from-primary to-secondary"
                delay={0.1}
            />
            <StatCard
                icon={<FlameIcon size={18} className="text-white" />}
                label="Best Streak"
                value={`${bestStreak}d`}
                sub="longest streak in period"
                gradient="from-orange-500 to-red-500"
                delay={0.15}
            />
            <StatCard
                icon={<StarIcon size={18} className="text-white" />}
                label="Perfect Days"
                value={perfectDays}
                sub="all habits completed"
                gradient="from-yellow-500 to-orange-500"
                delay={0.2}
            />
            <StatCard
                icon={<SparklesIcon size={18} className="text-white" />}
                label="Scheduled"
                value={totalScheduled.toLocaleString()}
                sub="total habit-days in period"
                gradient="from-violet-500 to-purple-500"
                delay={0.25}
            />
        </div>
    );
};
