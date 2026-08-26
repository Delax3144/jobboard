import { z } from "zod";

const jobLevels = [
  "Intern",
  "Junior",
  "Middle",
  "Senior",
  "Lead",
] as const;

const jobStatuses = [
  "published",
  "draft",
  "archived",
] as const;

const salarySchema = z.coerce
  .number()
  .int("Salary must be an integer")
  .min(0, "Salary cannot be negative")
  .max(1_000_000, "Salary is too large");

export const jobIdSchema = z.string().uuid("Invalid job id");

const jobFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title is too short")
    .max(120, "Title is too long"),

  companyName: z
    .string()
    .trim()
    .min(2, "Company name is too short")
    .max(120, "Company name is too long"),

  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(100, "Location is too long"),

  salaryFrom: salarySchema,
  salaryTo: salarySchema,

  description: z
    .string()
    .max(20_000, "Description is too long"),

  tags: z
    .string()
    .trim()
    .max(500, "Tags are too long")
    .default(""),

  level: z.enum(jobLevels).default("Junior"),

  status: z.enum(jobStatuses).default("published"),
});

export const createJobSchema = jobFieldsSchema.refine(
  (data) => data.salaryFrom <= data.salaryTo,
  {
    message: "Minimum salary cannot exceed maximum salary",
    path: ["salaryTo"],
  }
);

export const updateJobSchema = jobFieldsSchema
  .partial()
  .refine(
    (data) =>
      data.salaryFrom === undefined ||
      data.salaryTo === undefined ||
      data.salaryFrom <= data.salaryTo,
    {
      message: "Minimum salary cannot exceed maximum salary",
      path: ["salaryTo"],
    }
  );