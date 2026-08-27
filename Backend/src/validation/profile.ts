import { z } from "zod";

const experienceItemSchema = z
  .object({
    id: z.union([
      z.number().int().nonnegative(),
      z.string().trim().min(1).max(100),
    ]),

    title: z
      .string()
      .trim()
      .max(100, "Job title is too long"),

    company: z
      .string()
      .trim()
      .max(100, "Company name is too long"),

    period: z
      .string()
      .trim()
      .max(100, "Experience period is too long"),

    description: z
      .string()
      .trim()
      .max(1500, "Experience description is too long"),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name is too long"),

    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(50, "Last name is too long"),

    phone: z
      .string()
      .trim()
      .max(30, "Phone number is too long"),

    status: z.enum([
      "Open to work",
      "Passive looking",
      "Not looking",
      "Hidden",
    ]),

    bio: z
      .string()
      .trim()
      .max(2000, "Bio is too long"),

    skills: z
      .string()
      .trim()
      .max(1000, "Skills are too long"),

    experience: z
      .array(experienceItemSchema)
      .max(20, "Too many experience entries"),

    location: z
      .string()
      .trim()
      .max(100, "Location is too long"),

    isPublic: z.boolean(),

    showEmail: z.boolean(),

    soundEnabled: z.boolean(),

    toastsEnabled: z.boolean(),

    notificationVolume: z
      .number()
      .int()
      .min(0)
      .max(100),
  })
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one profile field is required"
  );