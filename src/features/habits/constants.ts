export const DEFAULT_COLOR = "#E6B333";

export const COLORS = [
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#99FF99",
    "#B34D4D",
    "#80B300",
];

export const DAYS_OF_WEEK = [
    { label: "Su", value: 0 },
    { label: "Mo", value: 1 },
    { label: "Tu", value: 2 },
    { label: "We", value: 3 },
    { label: "Th", value: 4 },
    { label: "Fr", value: 5 },
    { label: "Sa", value: 6 },
];

export const FREQUENCY_TYPES = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Custom", value: "custom" },
] as const;

export const FREQUENCY_UNITS = [
    { label: "Days", value: "days" },
    { label: "Weeks", value: "weeks" },
] as const;

export const HABIT_CATEGORIES = [
    { value: "health", label: "Health", icon: "🩺", color: "#ef4444" },
    { value: "fitness", label: "Fitness", icon: "💪", color: "#f97316" },
    { value: "learning", label: "Learning", icon: "📚", color: "#3b82f6" },
    {
        value: "mindfulness",
        label: "Mindfulness",
        icon: "🧘",
        color: "#8b5cf6",
    },
    {
        value: "productivity",
        label: "Productivity",
        icon: "⚡",
        color: "#eab308",
    },
    { value: "social", label: "Social", icon: "🤝", color: "#ec4899" },
    { value: "finance", label: "Finance", icon: "💰", color: "#10b981" },
    { value: "creativity", label: "Creativity", icon: "🎨", color: "#06b6d4" },
    { value: "other", label: "Other", icon: "✨", color: "#6b7280" },
] as const;

export type HabitCategoryValue = (typeof HABIT_CATEGORIES)[number]["value"];

export interface HabitTemplate {
    name: string;
    description: string;
    icon: string;
    color: string;
    category: HabitCategoryValue;
    frequencyType: "daily" | "weekly" | "custom";
    frequencyDaysOfWeek?: number[];
    frequencyInterval?: number;
    frequencyUnit?: "days" | "weeks";
}

export const HABIT_TEMPLATES: Record<string, HabitTemplate[]> = {
    "Morning Routine": [
        {
            name: "Morning Meditation",
            description: "Start the day with 10 minutes of mindful meditation",
            icon: "🧘",
            color: "#8b5cf6",
            category: "mindfulness",
            frequencyType: "daily",
        },
        {
            name: "Morning Run",
            description: "Go for a 20-minute run to kickstart your metabolism",
            icon: "🏃",
            color: "#f97316",
            category: "fitness",
            frequencyType: "daily",
        },
        {
            name: "Drink Water",
            description:
                "Drink a full glass of water first thing in the morning",
            icon: "💧",
            color: "#00B3E6",
            category: "health",
            frequencyType: "daily",
        },
        {
            name: "Journaling",
            description: "Write in your journal for 5–10 minutes",
            icon: "📓",
            color: "#E6B333",
            category: "mindfulness",
            frequencyType: "daily",
        },
    ],
    "Fitness & Health": [
        {
            name: "Workout",
            description: "Complete a full workout session",
            icon: "💪",
            color: "#ef4444",
            category: "fitness",
            frequencyType: "weekly",
            frequencyDaysOfWeek: [1, 3, 5],
        },
        {
            name: "Walk 10,000 Steps",
            description: "Hit your daily step goal",
            icon: "🚶",
            color: "#10b981",
            category: "fitness",
            frequencyType: "daily",
        },
        {
            name: "Stretching",
            description: "5–10 minutes of full-body stretching",
            icon: "🤸",
            color: "#f97316",
            category: "fitness",
            frequencyType: "daily",
        },
        {
            name: "No Junk Food",
            description: "Avoid processed and junk food for the day",
            icon: "🥗",
            color: "#80B300",
            category: "health",
            frequencyType: "daily",
        },
        {
            name: "Sleep 8 Hours",
            description: "Get a full 8 hours of quality sleep",
            icon: "😴",
            color: "#6366f1",
            category: "health",
            frequencyType: "daily",
        },
    ],
    "Learning & Growth": [
        {
            name: "Read 30 Minutes",
            description: "Read a book or article for at least 30 minutes",
            icon: "📖",
            color: "#3b82f6",
            category: "learning",
            frequencyType: "daily",
        },
        {
            name: "Learn a Language",
            description: "Practice a new language for 15 minutes",
            icon: "🗣️",
            color: "#06b6d4",
            category: "learning",
            frequencyType: "daily",
        },
        {
            name: "Online Course",
            description: "Complete one lesson from an online course",
            icon: "🎓",
            color: "#8b5cf6",
            category: "learning",
            frequencyType: "daily",
        },
        {
            name: "Practice Coding",
            description: "Solve one coding challenge or work on a side project",
            icon: "💻",
            color: "#3366E6",
            category: "learning",
            frequencyType: "daily",
        },
    ],
    "Mindfulness & Wellbeing": [
        {
            name: "Gratitude Practice",
            description: "Write down 3 things you're grateful for",
            icon: "🙏",
            color: "#ec4899",
            category: "mindfulness",
            frequencyType: "daily",
        },
        {
            name: "Digital Detox",
            description: "No social media before noon",
            icon: "📵",
            color: "#6b7280",
            category: "mindfulness",
            frequencyType: "daily",
        },
        {
            name: "Deep Breathing",
            description: "5 minutes of deep breathing or box breathing",
            icon: "🌬️",
            color: "#8b5cf6",
            category: "mindfulness",
            frequencyType: "daily",
        },
    ],
    Productivity: [
        {
            name: "Plan Your Day",
            description: "Spend 5 minutes planning your top 3 priorities",
            icon: "📋",
            color: "#eab308",
            category: "productivity",
            frequencyType: "daily",
        },
        {
            name: "Weekly Review",
            description: "Review goals and accomplishments from the week",
            icon: "📊",
            color: "#f97316",
            category: "productivity",
            frequencyType: "weekly",
            frequencyDaysOfWeek: [0],
        },
        {
            name: "Inbox Zero",
            description: "Clear and organize your email inbox",
            icon: "📧",
            color: "#3b82f6",
            category: "productivity",
            frequencyType: "weekly",
            frequencyDaysOfWeek: [1, 5],
        },
        {
            name: "No-Phone Morning",
            description: "Avoid your phone for the first hour after waking up",
            icon: "🌅",
            color: "#E6B333",
            category: "productivity",
            frequencyType: "daily",
        },
    ],
    Finance: [
        {
            name: "Track Expenses",
            description: "Log all expenses from the day",
            icon: "💰",
            color: "#10b981",
            category: "finance",
            frequencyType: "daily",
        },
        {
            name: "No Impulse Spending",
            description: "Avoid unplanned purchases today",
            icon: "🚫",
            color: "#ef4444",
            category: "finance",
            frequencyType: "daily",
        },
        {
            name: "Review Budget",
            description: "Check your weekly budget and spending",
            icon: "📈",
            color: "#06b6d4",
            category: "finance",
            frequencyType: "weekly",
            frequencyDaysOfWeek: [0],
        },
    ],
};
