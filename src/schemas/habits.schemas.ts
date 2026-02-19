import z from "zod";

export const listHabitsSchema = z.object({
  date: z
    .date()
    .optional()
    .default(() => new Date()),
});

const frequencySchema = z.discriminatedUnion("frequencyType", [
  z.object({
    frequencyType: z.literal("daily"),
  }),
  z.object({
    frequencyType: z.literal("weekly"),
    frequencyDaysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Select at least one day"),
  }),
  z.object({
    frequencyType: z.literal("custom"),
    frequencyInterval: z.number().int().positive("Interval must be positive"),
    frequencyUnit: z.enum(["days", "weeks"]),
  }),
]);

export const createHabitSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(50),
    description: z.string().max(500).optional(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
      .default("#3b82f6"),
  })
  .and(frequencySchema);

export const updateHabitSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(500).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  frequency: frequencySchema.optional(),
});

export const deleteHabitSchema = z.object({
  id: z.uuid(),
});

export const deleteManyHabitsSchema = z.object({
  ids: z.array(z.uuid()).min(1, "Select at least one habit to delete"),
});
