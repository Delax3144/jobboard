import { z } from "zod";

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name is too long"),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(254, "Email is too long")
      .transform((email) => email.toLowerCase()),

    subject: z
      .string()
      .trim()
      .max(150, "Subject is too long")
      .optional(),

    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(5000, "Message is too long"),
  })
  .strict();