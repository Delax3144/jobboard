import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import {
  signAccessToken,
  signTwoFactorChallenge,
  verifyTwoFactorChallenge,
} from "../lib/authTokens";
import { authMiddleware } from "../middleware/auth";
import { optionalAuthMiddleware } from "../middleware/optionalAuth";
import { uploadAvatar, uploadCV } from "../lib/upload";
import {
  publicProfileSelect,
  safeUserSelect,
} from "../selects/user";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from "../lib/passwordResetTokens";
import { userIdSchema } from "../validation/users";
import {
  registerSchema,
  loginSchema,
  oauthRoleSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../validation/auth";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import nodemailer from "nodemailer";
import crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import {
  loginRateLimit,
  twoFactorRateLimit,
  passwordResetRateLimit,
  passwordResetConfirmRateLimit,
  registerRateLimit,
  contactRateLimit,
} from "../middleware/rateLimits";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authRouter = Router();

// Настройка почтальона
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ ОШИБКА NODEMAILER (Связь с Google не установлена):", error.message);
  } else {
    console.log("✅ Nodemailer успешно подключен! Сервер готов отправлять письма.");
  }
});

authRouter.post("/register", registerRateLimit, async (req, res) => {
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
  const verificationToken = crypto.randomBytes(32).toString('hex'); 

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
        verificationToken,
      },
      select: { id: true },
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    // === 1. СНАЧАЛА ОТДАЕМ ОТВЕТ ФРОНТЕНДУ ===
    res.status(201).json({ message: "Успешная регистрация. Проверьте почту!" });

    // === 2. ПОТОМ ОТПРАВЛЯЕМ ПИСЬМО В ФОНЕ (fire-and-forget) ===
    transporter.sendMail({
      from: `"JobBoard Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Confirm your email on JobBoard",
      html: `
        <div style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 10px;">
          <h2 style="color: #10b981;">Welcome to JobBoard!</h2>
          <p>Hi ${firstName},</p>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Verify Email</a>
        </div>
      `
    }).catch(err => console.error("Ошибка отправки письма (Регистрация):", err));

  } catch (err) {
    res.status(500).json({ message: "Database or email error" });
  }
});

authRouter.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
      select: { id: true },
    });
    if (!user) return res.status(400).json({ message: "Неверный или устаревший токен" });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null } 
    });

    res.json({ message: "Почта успешно подтверждена" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

authRouter.post("/login", loginRateLimit, async (req, res) => {
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

authRouter.post(
  "/verify-2fa-login",
  twoFactorRateLimit,
  async (req, res) => {
  const { challengeToken, code } = req.body;

  if (
    typeof challengeToken !== "string" ||
    typeof code !== "string"
  ) {
    return res.status(400).json({
      message: "Invalid request",
    });
  }

  let userId: string;

  try {
    const challenge = verifyTwoFactorChallenge(challengeToken);
    userId = challenge.userId;
  } catch {
    return res.status(401).json({
      message: "Invalid or expired 2FA challenge",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      twoFactorSecret,
      ...safeUser
    } = user;

    return res.json({
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("2FA login verification failed:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

authRouter.post("/google", async (req, res) => {
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
    if (!payload || !payload.email) return res.status(400).json({ message: "Некорректный токен Google" });

    const { email, given_name, family_name, picture } = payload;
    let user = await prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
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

    const token = signAccessToken(user);
    res.json({
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка авторизации через Google" });
  }
});

authRouter.post("/github", async (req, res) => {
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
    const primaryEmailObj = emailResponse.data.find((e: any) => e.primary) || emailResponse.data[0];
    const email = primaryEmailObj?.email;

    if (!email) return res.status(400).json({ message: "Не удалось получить email из GitHub" });

    let user = await prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
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

    const token = signAccessToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Ошибка авторизации через GitHub" });
  }
});

authRouter.put("/profile", authMiddleware, async (req: any, res) => {
  const { firstName, lastName, phone, status, bio, skills, isPublic, showEmail, soundEnabled, toastsEnabled, experience, location, notificationVolume } = req.body; 
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        status,
        bio,
        skills,
        isPublic,
        showEmail,
        soundEnabled,
        toastsEnabled,
        experience,
        location,
        notificationVolume,
      },
      select: safeUserSelect,
    });
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

authRouter.get("/me", authMiddleware, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: safeUserSelect,
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
});

authRouter.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const avatarUrl = req.file.path; 
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { id: true, email: true, role: true, username: true, firstName: true, lastName: true, avatarUrl: true, isTwoFactorEnabled: true }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

authRouter.post('/ping', authMiddleware, async (req: any, res: any) => {
  try {
    await prisma.user.update({ where: { id: req.user.id }, data: { lastActive: new Date() } });
    res.status(200).send();
  } catch (err) { res.status(500).send(); }
});

authRouter.post(
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

      transporter.sendMail({
        from: `"JobBoard Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 10px;">
            <h2 style="color: #10b981;">Change Your Password</h2>
            <p>Hi ${user.firstName},</p>
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

authRouter.post(
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

authRouter.post(
  "/contact",
  contactRateLimit,
  optionalAuthMiddleware,
  async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    try {
      const ticket = await prisma.supportTicket.create({
        data: {
          name,
          email,
          subject,
          message,
          userId: req.user?.id ?? null
        }
      });

      // === 1. СНАЧАЛА ОТДАЕМ ОТВЕТ ФРОНТЕНДУ ===
      res.json({ message: "Message sent and ticket created!", ticket });

      // === 2. ПОТОМ ОТПРАВЛЯЕМ ПИСЬМО В ФОНЕ ===
      transporter.sendMail({
        from: `"JobBoard Support" <${process.env.EMAIL_USER}>`, 
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `[Ticket #${ticket.id.slice(0,8)}] ${subject || 'Support Request'}`,
        html: `
          <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
            <h2>New Support Ticket</h2>
            <p><strong>Ticket ID:</strong> ${ticket.id}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr/>
            <p>${message}</p>
          </div>
        `
      }).catch(err => console.error("Ошибка отправки письма (Контакты):", err));

    } catch (err) {
      res.status(500).json({ message: "Failed to process request." });
    }
  });

authRouter.get('/support-tickets', authMiddleware, async (req: any, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

authRouter.post('/2fa/generate', authMiddleware, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = speakeasy.generateSecret({ name: `JobBoard (${user.email})` });

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 }
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || "");
    
    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate 2FA" });
  }
});

authRouter.post('/2fa/enable', authMiddleware, async (req: any, res: any) => {
  const { code } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        twoFactorSecret: true,
      },
    });
    if (!user || !user.twoFactorSecret) return res.status(400).json({ message: "2FA not initialized" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1 
    });

    if (verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isTwoFactorEnabled: true }
      });
      res.json({ message: "2FA successfully enabled!" });
    } else {
      res.status(400).json({ message: "Invalid authentication code" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post('/2fa/disable', authMiddleware, async (req: any, res: any) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null }
    });
    res.json({ message: "2FA disabled" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.get("/users/:id", async (req, res) => {
  const parsedId = userIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid user id",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parsedId.data },
      select: publicProfileSelect,
    });

    if (!user || !user.isPublic) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      isPublic,
      email,
      ...publicUser
    } = user;

    res.json({
      ...publicUser,
      email: user.showEmail ? email : null,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post('/resume', authMiddleware, uploadCV.single('resume'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const resumeUrl = req.file.path; 
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { resumeUrl },
      select: { id: true, resumeUrl: true }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Resume upload failed" });
  }
});