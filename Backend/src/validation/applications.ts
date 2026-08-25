import { z } from "zod";

export const jobIdSchema = z.string().uuid("Invalid job id");

export const createApplicationSchema = z.object({
  jobId: jobIdSchema,
  coverLetter: z
    .string()
    .trim()
    .max(5000, "Cover letter must be 5000 characters or less")
    .optional(),
});

export const sendMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or less"),
});

export const applicationIdSchema = z
  .string()
  .uuid("Invalid application id");