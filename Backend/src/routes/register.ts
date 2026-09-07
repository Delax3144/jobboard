import { Router } from "express";
import { prisma } from "../prisma";
import { mailTransporter } from "../config/mailer";
import bcrypt from "bcrypt";

import { registerSchema } from "../validation/auth";
import { registerRateLimit } from "../middleware/rateLimits";
import { createEmailVerificationToken } from "../lib/emailVerificationTokens";
import { escapeHtml } from "../lib/escapeHtml";

export const registerRouter = Router();

registerRouter.post("/register", registerRateLimit, async (req, res) => {
  const parsedBody = registerSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message: parsedBody.error.issues[0]?.message ?? "Invalid request",
    });
  }

  const {
    email,
    password,
    role,
    username,
    firstName,
    lastName,
    phone,
  } = parsedBody.data;
  const existingEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingEmail) {
    return res.status(409).json({ message: "email" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (existingUser) {
    return res.status(409).json({ message: "username" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const {
    token: verificationToken,
    tokenHash: verificationTokenHash,
    expiresAt: verificationTokenExpiresAt,
  } = createEmailVerificationToken();

  try {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        username,
        firstName,
        lastName,
        phone,
        verificationTokenHash,
        verificationTokenExpiresAt,
      },
      select: { id: true },
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    res.status(201).json({ message: "Успешная регистрация. Проверьте почту!" });

    const safeFirstName = escapeHtml(firstName);

    mailTransporter.sendMail({
      from: `"JobBoard Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Confirm your email on JobBoard",
      html: `
        <div style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 10px;">
          <h2 style="color: #10b981;">Welcome to JobBoard!</h2>
          <p>Hi ${safeFirstName},</p>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Verify Email</a>
        </div>
      `
    }).catch(err => console.error("Ошибка отправки письма (Регистрация):", err));

  } catch (err) {
    res.status(500).json({ message: "Database or email error" });
  }
});