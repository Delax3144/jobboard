import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password is too long"
  );

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, "Invalid reset token"),

  newPassword: passwordSchema,
});