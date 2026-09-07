import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../prisma";
import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";

import { oauthRoleSchema } from "../validation/auth";
import { safeUserSelect } from "../selects/user";
import { signTwoFactorChallenge } from "../lib/authTokens";
import { signAccessToken } from "../lib/authTokens";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleRouter = Router();

googleRouter.post("/google", async (req, res) => {
  const parsedRole = oauthRoleSchema.safeParse({
    role: req.body.role,
  });

  if (!parsedRole.success) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const { credential } = req.body;
  const role = parsedRole.data.role ?? "candidate";
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
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
    
    let user = await prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });

    if (!user) {
      const randomPassword = randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const baseUsername = email.split('@')[0];
      const username = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;

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
    }

    if (user.isTwoFactorEnabled) {
      const challengeToken = signTwoFactorChallenge(user.id);

      return res.json({
        requires2FA: true,
        challengeToken,
      });
    }

    const token = signAccessToken(user);
    res.json({
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка авторизации через Google" });
  }
});