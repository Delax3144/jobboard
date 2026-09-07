import { Router } from "express";
import { prisma } from "../prisma";
import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import axios from "axios";

import { oauthRoleSchema } from "../validation/auth";
import { safeUserSelect } from "../selects/user";
import { signTwoFactorChallenge } from "../lib/authTokens";
import { signAccessToken } from "../lib/authTokens";

export const githubRouter = Router();

githubRouter.post("/github", async (req, res) => {
  const parsedRole = oauthRoleSchema.safeParse({
    role: req.body.role,
  });

  if (!parsedRole.success) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const { code } = req.body;
  const role = parsedRole.data.role ?? "candidate";
  try {
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code,
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(400).json({ message: "Неверный код GitHub" });

    const userResponse = await axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } });
    const githubUser = userResponse.data;

    const emailResponse = await axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}` } });
    type GitHubEmail = {
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string | null;
    };

    const githubEmails = emailResponse.data as GitHubEmail[];

    const verifiedEmail =
      githubEmails.find((item) => item.primary && item.verified) ??
      githubEmails.find((item) => item.verified);

    if (!verifiedEmail?.email) {
      return res.status(400).json({
        message: "No verified email found in GitHub account",
      });
    }

    const email = verifiedEmail.email.toLowerCase();

    if (!email) return res.status(400).json({ message: "Не удалось получить email из GitHub" });

    let user = await prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });

    if (!user) {
      const randomPassword = randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const baseUsername = githubUser.login || email.split('@')[0];
      const username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;

      user = await prisma.user.create({
        data: { 
          email,
          passwordHash,
          role,
          username, 
          firstName: githubUser.name?.split(' ')[0] || githubUser.login,
          lastName: githubUser.name?.split(' ').slice(1).join(' ') || '', 
          avatarUrl: githubUser.avatar_url,
          phone: '',
          isVerified: true
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
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Ошибка авторизации через GitHub" });
  }
});