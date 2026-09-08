import { Router } from "express";
import { randomBytes } from "node:crypto";
import { prisma } from "../prisma";
import axios from "axios";
import bcrypt from "bcrypt";

import {
  signAccessToken,
  signTwoFactorChallenge,
} from "../lib/authTokens";
import { safeUserSelect } from "../selects/user";
import { generateUniqueUsername } from "../lib/generateUniqueUsername";
import { claimUnverifiedOAuthUser } from "../lib/claimUnverifiedOAuthUser";
import { githubOAuthSchema } from "../validation/auth";
import { oauthRateLimit } from "../middleware/rateLimits";

export const githubRouter = Router();

type GitHubTokenResponse = {
  access_token?: string;
};

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string | null;
};

type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

githubRouter.post(
  "/github",
  oauthRateLimit,
  async (req, res) => {
    const parsedBody = githubOAuthSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message:
          parsedBody.error.issues[0]?.message ??
          "Invalid OAuth request",
      });
    }

    const {
      code,
      role = "candidate",
    } = parsedBody.data;

    try {
      const tokenResponse =
        await axios.post<GitHubTokenResponse>(
          "https://github.com/login/oauth/access_token",
          {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret:
              process.env.GITHUB_CLIENT_SECRET,
            code,
          },
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

      const accessToken =
        tokenResponse.data.access_token;

      if (!accessToken) {
        return res.status(400).json({
          message: "Invalid GitHub code",
        });
      }

      const userResponse =
        await axios.get<GitHubUser>(
          "https://api.github.com/user",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

      const githubUser = userResponse.data;

      const emailResponse =
        await axios.get<GitHubEmail[]>(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

      const verifiedEmail =
        emailResponse.data.find(
          (item) =>
            item.primary && item.verified
        ) ??
        emailResponse.data.find(
          (item) => item.verified
        );

      if (!verifiedEmail?.email) {
        return res.status(400).json({
          message:
            "No verified email found in GitHub account",
        });
      }

      const email =
        verifiedEmail.email.toLowerCase();

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
          githubUser.login || email.split("@")[0]
        );

        const nameParts =
          githubUser.name?.trim().split(/\s+/) ?? [];

        const firstName =
          nameParts[0] || githubUser.login;

        const lastName =
          nameParts.slice(1).join(" ");

        user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            role,
            username,
            firstName,
            lastName,
            avatarUrl: githubUser.avatar_url,
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
      console.error("GitHub OAuth failed:", error);

      return res.status(500).json({
        message: "GitHub authentication failed",
      });
    }
  }
);