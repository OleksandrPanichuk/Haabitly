import type { THabit } from "@/db/schema";

export function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];

  const current = new Date(
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()),
  );

  const endNorm = new Date(
    Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()),
  );

  while (current <= endNorm) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

export function isHabitScheduledOn(habit: THabit, date: Date): boolean {
  const dayOfWeek = date.getUTCDay();

  switch (habit.frequencyType) {
    case "daily":
      return true;
    case "weekly":
      return habit.frequencyDaysOfWeek?.includes(dayOfWeek) ?? false;
    case "custom": {
      if (!habit.frequencyInterval || !habit.frequencyUnit) return false;

      const habitStart = new Date(
        Date.UTC(
          habit.createdAt.getFullYear(),
          habit.createdAt.getMonth(),
          habit.createdAt.getDate(),
        ),
      );

      const daysDiff = Math.round(
        (date.getTime() - habitStart.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff < 0) return false;

      const intervalDays =
        habit.frequencyUnit === "weeks"
          ? habit.frequencyInterval * 7
          : habit.frequencyInterval;

      return daysDiff % intervalDays === 0;
    }
  }
}

export function calculateStreaks(
  scheduledDates: Date[],
  completedDatesSet: Set<string>,
): {
  currentStreak: number;
  longestStreak: number;
} {
  if (scheduledDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  const sorted = [...scheduledDates].sort((a, b) => a.getTime() - b.getTime())
  
  let longestStreak = 0;
  let run = 0;
  
  
  for (const date of sorted) {
    if (completedDatesSet.has(toDateKey(date))) {
      run++
      if(run > longestStreak) longestStreak = run
    } else {
      run = 0
    }
  }
  
  
  let currentStreak = 0;
  
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (completedDatesSet.has(toDateKey(sorted[i]))) {
      currentStreak++
    } else {
      break;
    }
  }
  
  
  return {currentStreak, longestStreak}
}
