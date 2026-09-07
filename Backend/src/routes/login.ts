import { Router } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";

import { loginRateLimit } from "../middleware/rateLimits";
import { loginSchema } from "../validation/auth";
import { safeUserSelect } from "../selects/user";
import { signTwoFactorChallenge } from "../lib/authTokens";
import { signAccessToken } from "../lib/authTokens";

export const loginRouter = Router();

loginRouter.post("/login", loginRateLimit, async (req, res) => {
  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message: parsedBody.error.issues[0]?.message ?? "Invalid request",
    });
  }

  const { email, password } = parsedBody.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...safeUserSelect,
      passwordHash: true,
      isVerified: true,
    },
  });
  
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: "Please verify your email first. Check your inbox!" });
  }
  if (user.isTwoFactorEnabled) {
    const challengeToken = signTwoFactorChallenge(user.id);

    return res.json({
      requires2FA: true,
      challengeToken,
    });
  }

  const token = signAccessToken(user);

  const {
    passwordHash,
    isVerified,
    ...safeUser
  } = user;

  res.json({
    user: safeUser,
    token,
  });
});