import { Router } from "express";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import {
  authMiddleware,
  getAuthenticatedUser,
  requireRole,
} from "../middleware/auth";
import {
  removeCloudinaryUpload,
  uploadCV,
} from "../lib/upload";
import { applicationCandidateSelect } from "../selects/user";
import { mailTransporter } from "../config/mailer";
import {
  applicationIdSchema,
  createApplicationSchema,
  jobIdSchema,
  sendMessageSchema
} from "../validation/applications";
import { escapeHtml } from "../lib/escapeHtml";
import { sanitizeEmailHeader } from "../lib/sanitizeEmailHeader";
import { applicationUploadRateLimit } from "../middleware/rateLimits";

export const applicationsRouter = Router();

// 1. ОТПРАВИТЬ ОТКЛИК
applicationsRouter.post(
  "/",
  authMiddleware,
  requireRole("candidate"),
  applicationUploadRateLimit,
  uploadCV.single("cv"),
  async (req, res) => {
    const user = getAuthenticatedUser(req);
    const parsed = createApplicationSchema.safeParse(req.body);

    if (!parsed.success) {
      await removeCloudinaryUpload(req.file);

      return res.status(400).json({
        message: "Invalid application data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { jobId, coverLetter } = parsed.data;
    const cvUrl = req.file?.path ?? null;
    const cvPublicId = req.file?.filename ?? null;

    let applicationCreated = false;

    try {
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          status: "published",
        },
        select: {
          ownerId: true,
          title: true,
        },
      });

      if (!job) {
        await removeCloudinaryUpload(req.file);

        return res.status(404).json({
          message: "Job not found",
        });
      }

      const application = await prisma.application.create({
        data: {
          jobId,
          coverLetter,
          cvUrl,
          cvPublicId,
          candidateId: user.id,
          status: "new",
        },
      });

      applicationCreated = true;

      const io = req.app.get("io");

      if (io) {
        io.to(job.ownerId).emit("new_notification", {
          type: "new_application",
          message: `Новый отклик на вакансию ${job.title}`,
        });
      }

      return res.status(201).json(application);
    } catch (error) {
      if (!applicationCreated) {
        await removeCloudinaryUpload(req.file);
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
          return res.status(400).json({
            message: "Вы уже отправили отклик на эту вакансию",
          });
        }

      return res.status(500).json({
        message: "Ошибка при отправке отклика",
      });
    }
  }
);

// 2. ПОЛУЧИТЬ ОТКЛИКИ ДЛЯ ВАКАНСИИ
applicationsRouter.get(
  "/job/:jobId",
  authMiddleware,
  async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user.role !== "employer") {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const parsedJobId = jobIdSchema.safeParse(req.params.jobId);

      if (!parsedJobId.success) {
        return res.status(400).json({
          message: "Invalid job id",
        });
      }

      const jobId = parsedJobId.data;

      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });
      
      if (!job || job.ownerId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const apps = await prisma.application.findMany({
        where: { jobId },
        include: {
          candidate: {
            select: applicationCandidateSelect,
          },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(apps);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

// 3. ОБНОВИТЬ СТАТУС (И ОТПРАВИТЬ EMAIL)
applicationsRouter.patch("/:id", authMiddleware, async (req, res) => {
  const user = getAuthenticatedUser(req);
  const { status } = req.body; // status: 'invited' или 'rejected'

  const parsedId = applicationIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid application id",
    });
  }

  const applicationId = parsedId.data;

  const allowedStatuses = ["invited", "rejected"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid application status" });
  }

  if (user.role !== "employer") {
    return res.status(403).json({ message: "Access denied" });
  }
  
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        status: true,
        job: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.ownerId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const statusChanged =
      application.status !== status;

    // Обновляем статус в базе и достаем инфу для письма
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        ...(statusChanged && {
          statusUpdatedAt: new Date(),
        }),
      },
      include: {
        candidate: {
          select: applicationCandidateSelect,
        },
        job: true,
      },
    });

    const safeJobTitle = escapeHtml(updated.job.title);
    const safeCompanyName = escapeHtml(updated.job.companyName);

    let subject = "";
    let htmlText = "";

    if (status === "invited") {
      subject = `🎉 Вас пригласили на вакансию: ${updated.job.title}!`;

      htmlText = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #10b981;">Хорошие новости!</h2>
          <p>Здравствуйте!</p>
          <p>
            Работодатель рассмотрел ваш отклик на вакансию
            <b>"${safeJobTitle}"</b>
            в компании
            <b>${safeCompanyName}</b>
            и приглашает вас к общению.
          </p>
          <p>
            Войдите в личный кабинет на JobBoard, чтобы прочитать сообщение и начать чат.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">
            Это автоматическое письмо, пожалуйста, не отвечайте на него.
          </p>
        </div>
      `;
    } else if (status === "rejected") {
      subject = `Ответ по вакансии: ${updated.job.title}`;

      htmlText = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Статус вашего отклика обновлен</h2>
          <p>Здравствуйте.</p>
          <p>
            Спасибо за интерес к вакансии
            <b>"${safeJobTitle}"</b>
            в компании
            <b>${safeCompanyName}</b>.
          </p>
          <p>
            К сожалению, на данный момент работодатель принял решение продолжить
            общение с другими кандидатами. Мы желаем вам успехов в дальнейших поисках!
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">
            С уважением,<br />
            Команда JobBoard
          </p>
        </div>
      `;
    }

    const safeSubject = sanitizeEmailHeader(subject);

    // Если статус сменился на тот, что требует письма, отправляем!
    if (
      statusChanged &&
      (status === "invited" ||
        status === "rejected")
    ) {
      try {
        await mailTransporter.sendMail({
          from: `"JobBoard Platform" <${process.env.EMAIL_USER}>`,
          to: updated.candidate.email,
          subject: safeSubject,
          html: htmlText,
        });
      } catch (mailError) {
        console.error("Ошибка при отправке письма:", mailError);
        // Мы не прерываем выполнение (не кидаем ошибку 500), 
        // чтобы статус всё равно сохранился в базе, даже если почта упала.
      }
    }

    // === СОКЕТ: Уведомляем кандидата о смене статуса ===
    const io = req.app.get("io");

    if (io && statusChanged) {
      io.to(updated.candidateId).emit(
        "new_notification",
        {
          type: "status_update",
          applicationId: updated.id,
          jobTitle: updated.job.title,
          status: updated.status,
        }
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update error" });
  }
});

// 4. ПОЛУЧИТЬ МОИ ОТКЛИКИ ДЛЯ КАНДИДАТА
applicationsRouter.get(
  "/my",
  authMiddleware,
  async (req, res) => {
    const user = getAuthenticatedUser(req);

    if (user.role !== "candidate") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    try {
      const apps =
        await prisma.application.findMany({
          where: {
            candidateId: user.id,
          },
          include: {
            job: {
              include: {
                owner: {
                  select: {
                    lastActive: true,
                  },
                },
              },
            },
            messages: {
              where: {
                senderId: {
                  not: user.id,
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      const enrichedApps = apps.map((app) => {
        const lastIncomingMessageAt =
          app.messages[0]?.createdAt ?? null;

        const hasUnreadMessage =
          lastIncomingMessageAt !== null &&
          lastIncomingMessageAt >
            app.lastViewedByCandidate;

        const hasUnreadStatusUpdate =
          app.statusUpdatedAt !== null &&
          app.statusUpdatedAt >
            app.lastViewedByCandidate;

        return {
          ...app,
          hasUpdate:
            hasUnreadMessage ||
            hasUnreadStatusUpdate,
        };
      });

      return res.json(enrichedApps);
    } catch (error) {
      console.error(
        "Failed to load candidate applications:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// 5. ПОЛУЧИТЬ ОТКЛИКИ ДЛЯ РАБОТОДАТЕЛЯ
applicationsRouter.get("/owner", authMiddleware, async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (user.role !== "employer") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const apps = await prisma.application.findMany({
      where: { job: { ownerId: user.id } },
      include: {
        job: true,
        candidate: { select: { id: true, email: true, avatarUrl: true, firstName: true, lastName: true, lastActive: true } } 
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки откликов" });
  }
});

// 6. ПОЛУЧИТЬ ОДИН ОТКЛИК ПО ID (ИСПРАВЛЕНО)
applicationsRouter.get("/:id", authMiddleware, async (req, res) => {
  const user = getAuthenticatedUser(req);
  try {
    const parsedId = applicationIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        message: "Invalid application id",
      });
    }

    const id = parsedId.data;

    const existingApp = await prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        candidateId: true,
        job: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingApp) {
      return res.status(404).json({ message: "Application not found" });
    }

    const isCandidate = existingApp.candidateId === user.id;
    const isOwner = existingApp.job.ownerId === user.id;

    if (!isCandidate && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updateData = isOwner
      ? { lastViewedByOwner: new Date() }
      : { lastViewedByCandidate: new Date() };

    const app = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          include: {
            owner: {
              select: { lastActive: true },
            },
          },
        },
        candidate: {
          select: applicationCandidateSelect,
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.json(app);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 7. ОТПРАВИТЬ СООБЩЕНИЕ В ЧАТ
applicationsRouter.post(
  "/:id/messages",
  authMiddleware,
  async (req, res) => {
    const user = getAuthenticatedUser(req);
    const parsedId = applicationIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        message: "Invalid application id",
      });
    }

    const parsedBody = sendMessageSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Invalid message data",
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const id = parsedId.data;
    const { text } = parsedBody.data;

    try {
      // Достаем отклик вместе с вакансией, чтобы знать ID работодателя
      const app = await prisma.application.findUnique({
        where: { id },
        select: {
          candidateId: true,
          status: true,
          job: {
            select: {
              ownerId: true,
            },
          },
          messages: {
            select: {
              id: true,
            },
            take: 1,
          },
        },
      });

      if (!app) return res.status(404).json({ message: "Отклик не найден" });

      const isCandidate = app.candidateId === user.id;
      const isOwner = app.job.ownerId === user.id;

      if (!isCandidate && !isOwner) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (
        isCandidate &&
        app.messages.length === 0 &&
        app.status === "new"
      ) {
        return res.status(403).json({
          message: "Подождите, пока работодатель напишет первым или изменит статус",
        });
      }

      const message = await prisma.message.create({
        data: {
          applicationId: id,
          senderId: user.id,
          text
        }
      });

      // === СОКЕТ: Отправляем сообщение второму участнику ===
      const io = req.app.get("io");
      if (io) {
        // Определяем, кому слать уведомление
        const recipientId = isOwner
          ? app.candidateId
          : app.job.ownerId;
        
        // Отправляем само сообщение (чтобы обновить чат)
        io.to(recipientId).emit("new_message", {
          applicationId: id,
          message
        });
        
        // Отправляем сигнал для "колокольчика" и звука
        io.to(recipientId).emit("new_notification", {
          type: "new_message",
          applicationId: id
        });
      }

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Ошибка отправки сообщения" });
    }
  });