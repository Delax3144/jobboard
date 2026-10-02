import { z } from "zod";

export const applicationListSchema = z.strictObject({
  page: z.coerce.number().int().min(1).max(100_000).optional(),
});

export const jobApplicationListSchema = applicationListSchema.extend({
  status: z.enum(['all', 'new', 'reviewed', 'invited', 'rejected']).default('all'),
});

export const conversationQuerySchema = z.strictObject({ history: z.literal('recent').optional() });
export const messageHistorySchema = z.strictObject({ before: z.string().uuid() });
export const conversationListSchema = z.strictObject({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  search: z.string().trim().max(120).default(''),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["reviewed", "invited", "rejected"]),
}).strict();

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
