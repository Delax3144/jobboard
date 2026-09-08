import { Router } from "express";
import { randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";

import {
  signAccessToken,
  signTwoFactorChallenge,
} from "../lib/authTokens";
import { safeUserSelect } from "../selects/user";
import { generateUniqueUsername } from "../lib/generateUniqueUsername";
import { claimUnverifiedOAuthUser } from "../lib/claimUnverifiedOAuthUser";
import { googleOAuthSchema } from "../validation/auth";
import { oauthRateLimit } from "../middleware/rateLimits";

export const googleRouter = Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

googleRouter.post(
  "/google",
  oauthRateLimit,
  async (req, res) => {
    const parsedBody = googleOAuthSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message:
          parsedBody.error.issues[0]?.message ??
          "Invalid OAuth request",
      });
    }

    const {
      credential,
      role = "candidate",
    } = parsedBody.data;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (
        !payload ||
        !payload.email ||
        payload.email_verified !== true
      ) {
        return res.status(400).json({
          message: "Google email is not verified",
        });
      }

      const {
        given_name,
        family_name,
        picture,
      } = payload;

      const email = payload.email.toLowerCase();

      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          ...safeUserSelect,
          isVerified: true,
        },
      });

      let user;

      if (!existingUser) {
        const randomPassword = randomBytes(32).toString("hex");

        const passwordHash = await bcrypt.hash(
          randomPassword,
          10
        );

        const username = await generateUniqueUsername(
          email.split("@")[0]
        );

        user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            role,
            username,
            firstName: given_name || "User",
            lastName: family_name || "",
            avatarUrl: picture,
            phone: "",
            isVerified: true,
          },
          select: safeUserSelect,
        });
      } else if (!existingUser.isVerified) {
        user = await claimUnverifiedOAuthUser(
          existingUser.id,
          role
        );
      } else {
        const {
          isVerified: _isVerified,
          ...safeExistingUser
        } = existingUser;

        user = safeExistingUser;
      }

      if (user.isTwoFactorEnabled) {
        const challengeToken = signTwoFactorChallenge(
          user.id
        );

        return res.json({
          requires2FA: true,
          challengeToken,
        });
      }

      const token = signAccessToken(user);

      return res.json({
        user,
        token,
      });
    } catch (error) {
      console.error("Google OAuth failed:", error);

      return res.status(500).json({
        message: "Google authentication failed",
      });
    }
  }
);