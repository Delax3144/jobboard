import { Router } from "express";
import { prisma } from "../prisma";
import qrcode from "qrcode";
import speakeasy from "speakeasy";

import {
  twoFactorRateLimit,
  twoFactorSettingsRateLimit,
  twoFactorSetupRateLimit,
} from "../middleware/rateLimits";
import { verifyTwoFactorChallenge } from "../lib/authTokens";
import { safeUserSelect } from "../selects/user";
import { signAccessToken } from "../lib/authTokens";
import {
  authMiddleware,
  getAuthenticatedUser,
  requireRecentAuth,
} from "../middleware/auth";
import {
  twoFactorCodeSchema,
  twoFactorLoginSchema,
} from "../validation/auth";

export const twoFactorRouter = Router();

twoFactorRouter.post(
  "/verify-2fa-login",
  twoFactorRateLimit,
  async (req, res) => {
    const parsedBody = twoFactorLoginSchema.safeParse(
      req.body
    );

    if (!parsedBody.success) {
      return res.status(400).json({
        message:
          parsedBody.error.issues[0]?.message ??
          "Invalid request",
      });
    }

    const {
      challengeToken,
      code,
    } = parsedBody.data;

    let userId: string;

    try {
      const challenge =
        verifyTwoFactorChallenge(challengeToken);

      userId = challenge.userId;
    } catch {
      return res.status(401).json({
        message:
          "Invalid or expired 2FA challenge",
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          ...safeUserSelect,
          twoFactorSecret: true,
        },
      });

      if (
        !user ||
        !user.isTwoFactorEnabled ||
        !user.twoFactorSecret
      ) {
        return res.status(401).json({
          message: "Invalid 2FA request",
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({
          message: "Invalid 2FA code",
        });
      }

      const token = signAccessToken(user);

      const {
        twoFactorSecret: _twoFactorSecret,
        ...safeUser
      } = user;

      return res.json({
        user: safeUser,
        token,
      });
    } catch (error) {
      console.error(
        "2FA login verification failed:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

twoFactorRouter.post(
  "/2fa/disable",
  authMiddleware,
  twoFactorSettingsRateLimit,
  async (req, res) => {
    const parsedBody = twoFactorCodeSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.issues[0]?.message ?? "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { code } = parsedBody.data;

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          id: true,
          isTwoFactorEnabled: true,
          twoFactorSecret: true,
        },
      });

      if (
        !user ||
        !user.isTwoFactorEnabled ||
        !user.twoFactorSecret
      ) {
        return res.status(400).json({
          message: "2FA is not enabled",
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({
          message: "Invalid authentication code",
        });
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isTwoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      return res.json({
        message: "2FA disabled",
      });
    } catch (error) {
      console.error("2FA disable failed:", error);

      return res.status(500).json({
        message: "Server error",
      });
    }
});

twoFactorRouter.post(
  "/2fa/enable",
  authMiddleware,
  twoFactorSettingsRateLimit,
    async (req, res) => {
      const parsedBody = twoFactorCodeSchema.safeParse(req.body);

      if (!parsedBody.success) {
        return res.status(400).json({
          message: parsedBody.error.issues[0]?.message ?? "Invalid request",
        });
      }

      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const { code } = parsedBody.data;

      try {
        const user = await prisma.user.findUnique({
          where: {
            id: req.user.id,
          },
          select: {
            id: true,
            isTwoFactorEnabled: true,
            twoFactorSecret: true,
          },
        });

        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        if (user.isTwoFactorEnabled) {
          return res.status(409).json({
            message: "2FA is already enabled",
          });
        }

        if (!user.twoFactorSecret) {
          return res.status(400).json({
            message: "2FA not initialized",
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: code,
          window: 1,
        });

        if (!verified) {
          return res.status(400).json({
            message: "Invalid authentication code",
          });
        }

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            isTwoFactorEnabled: true,
          },
        });

        return res.json({
          message: "2FA successfully enabled!",
        });
      } catch (error) {
        console.error("2FA enable failed:", error);

        return res.status(500).json({
          message: "Server error",
        });
      }
    });

twoFactorRouter.post(
  "/2fa/generate",
  authMiddleware,
  requireRecentAuth(),
  twoFactorSetupRateLimit,
  async (req, res) => {
    const authUser = getAuthenticatedUser(req);

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: authUser.id,
        },
        select: {
          id: true,
          email: true,
          isTwoFactorEnabled: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user.isTwoFactorEnabled) {
        return res.status(409).json({
          message: "2FA is already enabled",
        });
      }

      const secret = speakeasy.generateSecret({
        name: `JobBoard (${user.email})`,
      });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorSecret: secret.base32,
        },
      });

      const qrCodeUrl = await qrcode.toDataURL(
        secret.otpauth_url || ""
      );

      return res.json({
        qrCodeUrl,
        secret: secret.base32,
      });
    } catch (error) {
      console.error("2FA generation failed:", error);

      return res.status(500).json({
        message: "Failed to generate 2FA",
      });
    }
  });