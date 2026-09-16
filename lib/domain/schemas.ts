import { z } from "zod";

export const profileSchema = z.object({
  assessmentYear: z.string().min(1, "Choose an assessment year."),
  taxpayerType: z.string().min(1, "Choose a taxpayer type."),
  residentialStatus: z.string().min(1, "Choose a residential status."),
  ageCategory: z.string().min(1, "Choose an age category."),
});

export const activitySchema = z.object({
  activityDescription: z
    .string()
    .max(120, "Keep this description under 120 characters.")
    .optional(),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;
