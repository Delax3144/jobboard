import { Router } from "express";
import { prisma } from "../prisma";
import { mailTransporter } from "../config/mailer";

import {
  authMiddleware,
  getAuthenticatedUser,
} from "../middleware/auth";
import { contactRateLimit } from "../middleware/rateLimits";
import { optionalAuthMiddleware } from "../middleware/optionalAuth";
import { contactSchema } from "../validation/support";
import { escapeHtml } from "../lib/escapeHtml";
import { sanitizeEmailHeader } from "../lib/sanitizeEmailHeader";

export const supportRouter = Router();

supportRouter.get(
  "/support-tickets",
  authMiddleware,
  async (req, res) => {
    const user = getAuthenticatedUser(req);

    try {
      const tickets = await prisma.supportTicket.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json(tickets);
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);

      return res.status(500).json({
        message: "Error fetching tickets",
      });
    }
  }
);

supportRouter.post(
  "/contact",
  contactRateLimit,
  optionalAuthMiddleware,
  async (req, res) => {
    const parsedBody = contactSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.issues[0]?.message ?? "Invalid contact form data",
      });
    }

    const { name, email, subject, message } = parsedBody.data;

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = sanitizeEmailHeader(
      subject || "Support Request"
    );
    const safeMessage = escapeHtml(message);

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

      res.json({ message: "Message sent and ticket created!", ticket });

      mailTransporter.sendMail({
        from: `"JobBoard Support" <${process.env.EMAIL_USER}>`, 
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `[Ticket #${ticket.id.slice(0, 8)}] ${safeSubject}`,
        html: `
          <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
            <h2>New Support Ticket</h2>
            <p><strong>Ticket ID:</strong> ${ticket.id}</p>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <hr/>
            <p>${safeMessage}</p>
          </div>
        `
      }).catch(err => console.error("Error sending message (Contacts):", err));

    } catch (err) {
      res.status(500).json({ message: "Failed to process request." });
    }
  });