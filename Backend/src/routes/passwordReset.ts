import { Router } from "express";
import { prisma } from "../prisma";
import { mailTransporter } from "../config/mailer";
import bcrypt from "bcrypt";

import { passwordResetConfirmRateLimit } from "../middleware/rateLimits";
import { resetPasswordSchema } from "../validation/auth";
import { hashPasswordResetToken } from "../lib/passwordResetTokens";
import { passwordResetRateLimit } from "../middleware/rateLimits";
import { requestPasswordResetSchema } from "../validation/auth";
import { createPasswordResetToken } from "../lib/passwordResetTokens";
import { escapeHtml } from "../lib/escapeHtml";

export const passwordResetRouter = Router();

passwordResetRouter.post(
  "/reset-password",
  passwordResetConfirmRateLimit,
  async (req, res) => {
    const parsedBody = resetPasswordSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.issues[0]?.message ?? "Invalid request",
      });
    }

    const { token, newPassword } = parsedBody.data;

    try {
      const tokenHash = hashPasswordResetToken(token);
      const now = new Date();

      const user = await prisma.user.findFirst({
        where: {
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: {
            gt: now,
          },
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        return res.status(400).json({
          message: "Invalid or expired reset token",
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      const result = await prisma.user.updateMany({
        where: {
          id: user.id,
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: {
            gt: now,
          },
        },
        data: {
          passwordHash,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      });

      if (result.count === 0) {
        return res.status(400).json({
          message: "Invalid or expired reset token",
        });
      }

      return res.json({
        message: "Password successfully changed!",
      });
    } catch (error) {
      console.error("Password reset failed:", error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  });

passwordResetRouter.post(
  "/request-password-reset",
  passwordResetRateLimit,
  async (req, res) => {
    const parsedBody = requestPasswordResetSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.issues[0]?.message ?? "Invalid request",
      });
    }

    const { email } = parsedBody.data;

    const responseMessage =
      "If an account with that email exists, a reset link has been sent.";

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          firstName: true,
        },
      });

      if (!user) {
        return res.json({ message: responseMessage });
      }

      const {
        token,
        tokenHash,
        expiresAt,
      } = createPasswordResetToken();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: expiresAt,
        },
      });

      const resetLink =
        `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      res.json({ message: responseMessage });

      const safeFirstName = escapeHtml(user.firstName);

      mailTransporter.sendMail({
        from: `"JobBoard Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 10px;">
            <h2 style="color: #10b981;">Change Your Password</h2>
            <p>Hi ${safeFirstName},</p>
            <p>We received a request to change your password. Click the button below to set a new one.</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This link expires in 30 minutes.</p>
            <p style="font-size: 12px; color: #666;">If you didn't request this, just ignore this email.</p>
          </div>
        `,
      }).catch((error) =>
        console.error("Password reset email failed:", error)
      );
    } catch (error) {
      console.error("Password reset request failed:", error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  });