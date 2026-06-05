import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";
import { uploadAvatar, uploadCV } from "../lib/upload";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import nodemailer from "nodemailer";
import crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

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

function signToken(user: { id: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "7d" });
}

authRouter.post("/register", async (req, res) => {
  const { email, password, role, username, firstName, lastName, phone } = req.body;
  if (!email || !password || !role || !username || !firstName || !lastName) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return res.status(409).json({ message: "email" });
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return res.status(409).json({ message: "username" });

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex'); 

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, role, username, firstName, lastName, phone, verificationToken },
      select: { id: true, email: true, role: true, username: true, firstName: true, lastName: true, phone: true, isTwoFactorEnabled: true }
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
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
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

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: "Please verify your email first. Check your inbox!" });
  }

  if (user.isTwoFactorEnabled) {
    return res.json({ requires2FA: true, userId: user.id });
  }

  const token = signToken(user);
  
  const { passwordHash: ph, twoFactorSecret, verificationToken, resetToken, ...safeUser } = user;
  
  res.json({ 
    user: safeUser, 
    token 
  });
});

authRouter.post("/verify-2fa-login", async (req, res) => {
  const { userId, code } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) return res.status(400).json({ message: "Invalid request" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1 
    });

    if (!verified) return res.status(401).json({ message: "Invalid 2FA code" });

    const token = signToken(user);
    res.json({ 
      user: { id: user.id, email: user.email, role: user.role, username: user.username, firstName: user.firstName, lastName: user.lastName, phone: user.phone, avatarUrl: user.avatarUrl, isTwoFactorEnabled: user.isTwoFactorEnabled }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/google", async (req, res) => {
  const { credential, role } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: "Некорректный токен Google" });

    const { email, given_name, family_name, picture } = payload;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const baseUsername = email.split('@')[0];
      const username = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;

      user = await prisma.user.create({
        data: { 
          email, passwordHash, role: role || 'candidate', username, 
          firstName: given_name || 'User', lastName: family_name || '', 
          avatarUrl: picture, phone: '', 
          isVerified: true 
        }
      });
    }

    const token = signToken(user);
    res.json({ user: { id: user.id, email: user.email, role: user.role, username: user.username, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl, isTwoFactorEnabled: user.isTwoFactorEnabled }, token });
  } catch (err) {
    res.status(500).json({ message: "Ошибка авторизации через Google" });
  }
});

authRouter.post("/github", async (req, res) => {
  const { code, role } = req.body;
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

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const baseUsername = githubUser.login || email.split('@')[0];
      const username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;

      user = await prisma.user.create({
        data: { 
          email, passwordHash, role: role || 'candidate', username, 
          firstName: githubUser.name?.split(' ')[0] || githubUser.login, lastName: githubUser.name?.split(' ').slice(1).join(' ') || '', 
          avatarUrl: githubUser.avatar_url, phone: '',
          isVerified: true
        }
      });
    }

    const token = signToken(user);
    res.json({ user: { ...user, isTwoFactorEnabled: user.isTwoFactorEnabled }, token });
  } catch (err) {
    res.status(500).json({ message: "Ошибка авторизации через GitHub" });
  }
});

authRouter.put("/profile", authMiddleware, async (req: any, res) => {
  const { firstName, lastName, phone, status, bio, skills, isPublic, showEmail, soundEnabled, toastsEnabled, experience, location, notificationVolume } = req.body; 
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone, status, bio, skills, isPublic, showEmail, soundEnabled, toastsEnabled, experience, location, notificationVolume },
      select: { 
        id: true, email: true, role: true, username: true, firstName: true, lastName: true, phone: true, avatarUrl: true, status: true, bio: true, skills: true, isTwoFactorEnabled: true,
        isPublic: true, showEmail: true, soundEnabled: true, toastsEnabled: true, experience: true, resumeUrl: true, 
        location: true,
        notificationVolume: true 
      }
    });
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

authRouter.get("/me", authMiddleware, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });
  
  if (!user) return res.status(404).json({ message: "User not found" });

  const { passwordHash, twoFactorSecret, verificationToken, resetToken, ...safeUser } = user;
  
  res.json({ user: safeUser });
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

authRouter.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: user.id }, data: { resetToken } });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // === 1. СНАЧАЛА ОТДАЕМ ОТВЕТ ФРОНТЕНДУ ===
    res.json({ message: "Письмо со ссылкой отправлено!" });

    // === 2. ПОТОМ ОТПРАВЛЯЕМ ПИСЬМО В ФОНЕ ===
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
          <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, just ignore this email.</p>
        </div>
      `
    }).catch(err => console.error("Ошибка отправки письма (Сброс пароля):", err));

  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await prisma.user.findFirst({ where: { resetToken: token } });
    if (!user) return res.status(400).json({ message: "Неверный или устаревший токен" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null } 
    });

    res.json({ message: "Пароль успешно изменен!" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

authRouter.post('/contact', async (req: any, res) => {
  const { name, email, subject, message, userId } = req.body;

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
        userId: userId || null
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
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
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
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
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

authRouter.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, username: true, email: true, phone: true, avatarUrl: true, status: true, role: true,
        isPublic: true, showEmail: true, bio: true, skills: true,
        location: true, experience: true, resumeUrl: true
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
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