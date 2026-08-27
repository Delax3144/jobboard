import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password is too long"
  );

const roleSchema = z.enum(["candidate", "employer"]);

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .transform((email) => email.toLowerCase());

const loginPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password is too long"
  );

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(50, "Name is too long");

export const registerSchema = z.object({
  email: emailSchema,

  password: passwordSchema,

  role: roleSchema,

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username is too long")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username contains invalid characters"
    ),

  firstName: nameSchema,

  lastName: nameSchema,

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .optional()
    .default(""),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const oauthRoleSchema = z.object({
  role: roleSchema.optional(),
});

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

export const twoFactorCodeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "Authentication code must contain exactly 6 digits"),
});