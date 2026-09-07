import { Router } from "express";
import { mailTransporter } from "../config/mailer";
import { prisma } from "../prisma";

import { verificationResendRateLimit } from "../middleware/rateLimits";
import { resendVerificationSchema } from "../validation/auth";
import { createEmailVerificationToken, hashEmailVerificationToken } from "../lib/emailVerificationTokens";
import { escapeHtml } from "../lib/escapeHtml";

export const emailVerificationRouter = Router();

emailVerificationRouter.post(
  "/resend-verification",
  verificationResendRateLimit,
  async (req, res) => {
    const parsedBody = resendVerificationSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message:
          parsedBody.error.issues[0]?.message ??
          "Invalid request",
      });
    }

    const { email } = parsedBody.data;

    const responseMessage =
      "If an unverified account with that email exists, a verification link has been sent.";

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          firstName: true,
          isVerified: true,
        },
      });

      if (!user || user.isVerified) {
        return res.json({
          message: responseMessage,
        });
      }

      const {
        token,
        tokenHash,
        expiresAt,
      } = createEmailVerificationToken();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationTokenHash: tokenHash,
          verificationTokenExpiresAt: expiresAt,
        },
      });

      const verifyLink =
        `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      const safeFirstName = escapeHtml(user.firstName);

      res.json({
        message: responseMessage,
      });

      mailTransporter
        .sendMail({
          from: `"JobBoard Team" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Confirm your email on JobBoard",
          html: `
            <div style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 10px;">
              <h2 style="color: #10b981;">Verify your JobBoard account</h2>
              <p>Hi ${safeFirstName},</p>
              <p>You requested a new email verification link.</p>
              <p>Please click the button below to verify your email address.</p>
              <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">
                Verify Email
              </a>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This link expires in 24 hours.
              </p>
            </div>
          `,
        })
        .catch((error) => {
          console.error(
            "Verification resend email failed:",
            error
          );
        });
    } catch (error) {
      console.error(
        "Verification resend failed:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

emailVerificationRouter.post("/verify-email", async (req, res) => {
  const { token } = req.body;

  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token)
  ) {
    return res.status(400).json({
      message: "Invalid or expired verification token",
    });
  }

  try {
    const verificationTokenHash =
      hashEmailVerificationToken(token);

    const now = new Date();

    const user = await prisma.user.findFirst({
      where: {
        verificationTokenHash,
        verificationTokenExpiresAt: {
          gt: now,
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        verificationTokenHash,
        verificationTokenExpiresAt: {
          gt: now,
        },
      },
      data: {
        isVerified: true,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
      },
    });

    if (result.count === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    return res.json({
      message: "Email successfully verified",
    });
  } catch (error) {
    console.error("Email verification failed:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});