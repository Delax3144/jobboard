import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import { uploadCV } from "../lib/upload";
import { applicationCandidateSelect } from "../selects/user";
import nodemailer from "nodemailer";
import {
  applicationIdSchema,
  createApplicationSchema,
  jobIdSchema,
  sendMessageSchema
} from "../validation/applications";

export const applicationsRouter = Router();

// === НАСТРОЙКА NODEMAILER ===
// В идеале вынести это в .env, но для тестов оставим здесь
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. ОТПРАВИТЬ ОТКЛИК
applicationsRouter.post(
  "/",
  authMiddleware,
  requireRole("candidate"),
  uploadCV.single("cv"),
  async (req: any, res) => {
  const parsed = createApplicationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid application data",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { jobId, coverLetter } = parsed.data;
  const cvUrl = req.file ? req.file.path : null;

  try {
    // Сначала находим вакансию, чтобы знать, кто её владелец (работодатель)
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = await prisma.application.create({
      data: {
        jobId,
        coverLetter,
        cvUrl, 
        candidateId: req.user.id,
        status: "new"
      }
    });

    // === СОКЕТ: Уведомляем работодателя ===
    const io = req.app.get("io");
    if (io) {
      io.to(job.ownerId).emit("new_notification", {
        type: "new_application",
        message: `Новый отклик на вакансию ${job.title}`
      });
    }

    res.status(201).json(application);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Вы уже отправили отклик на эту вакансию" });
    }
    res.status(500).json({ message: "Ошибка при отправке отклика" });
  }
});

// 2. ПОЛУЧИТЬ ОТКЛИКИ ДЛЯ ВАКАНСИИ
applicationsRouter.get("/job/:jobId", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "employer") {
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
    });;
    
    if (!job || job.ownerId !== req.user.id) {
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
applicationsRouter.patch("/:id", authMiddleware, async (req: any, res) => {
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

  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "Access denied" });
  }
  
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
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

    if (application.job.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Обновляем статус в базе и достаем инфу для письма
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        candidate: {
          select: applicationCandidateSelect,
        },
        job: true,
      },
    });

    // Формируем письмо в зависимости от статуса
    let subject = "";
    let htmlText = "";

    if (status === 'invited') {
      subject = `🎉 Вас пригласили на вакансию: ${updated.job.title}!`;
      htmlText = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #10b981;">Хорошие новости!</h2>
          <p>Здравствуйте!</p>
          <p>Работодатель рассмотрел ваш отклик на вакансию <b>"${updated.job.title}"</b> в компании <b>${updated.job.companyName}</b> и приглашает вас к общению.</p>
          <p>Войдите в личный кабинет на JobBoard, чтобы прочитать сообщение и начать чат.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
        </div>
      `;
    } else if (status === 'rejected') {
      subject = `Ответ по вакансии: ${updated.job.title}`;
      htmlText = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Статус вашего отклика обновлен</h2>
          <p>Здравствуйте.</p>
          <p>Спасибо за интерес к вакансии <b>"${updated.job.title}"</b> в компании <b>${updated.job.companyName}</b>.</p>
          <p>К сожалению, на данный момент работодатель принял решение продолжить общение с другими кандидатами. Мы желаем вам успехов в дальнейших поисках!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">С уважением,<br/>Команда JobBoard</p>
        </div>
      `;
    }

    // Если статус сменился на тот, что требует письма, отправляем!
    if (status === 'invited' || status === 'rejected') {
      try {
        await transporter.sendMail({
          from: '"JobBoard Platform" <ТВОЙ_GMAIL@gmail.com>', // Замени на свою почту
          to: updated.candidate.email, // Отправляем на почту кандидата из базы
          subject: subject,
          html: htmlText
        });
        console.log(`Письмо отправлено кандидату: ${updated.candidate.email}`);
      } catch (mailError) {
        console.error("Ошибка при отправке письма:", mailError);
        // Мы не прерываем выполнение (не кидаем ошибку 500), 
        // чтобы статус всё равно сохранился в базе, даже если почта упала.
      }
    }

    // === СОКЕТ: Уведомляем кандидата о смене статуса ===
    const io = req.app.get("io");
    if (io) {
      io.to(updated.candidateId).emit("new_notification", {
        type: "status_update",
        applicationId: updated.id,
        jobTitle: updated.job.title,
        status: updated.status
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update error" });
  }
});

// 4. ПОЛУЧИТЬ МОИ ОТКЛИКИ ДЛЯ КАНДИДАТА
applicationsRouter.get("/my", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "candidate") {
    return res.status(403).json({ message: "Access denied" });
  }

  const apps = await prisma.application.findMany({
    where: { candidateId: req.user.id },
    include: { 
      job: { include: { owner: { select: { lastActive: true } } } }, // Достаем онлайн работодателя
      messages: { orderBy: { createdAt: "desc" }, take: 1 } 
    }
  });

  const enrichedApps = apps.map(app => {
    const lastMsgTime = app.messages[0]?.createdAt || app.createdAt;
    const hasUpdate = lastMsgTime > app.lastViewedByCandidate || app.status !== 'new'; 
    return { ...app, hasUpdate };
  });

  res.json(enrichedApps);
});

// 5. ПОЛУЧИТЬ ОТКЛИКИ ДЛЯ РАБОТОДАТЕЛЯ
applicationsRouter.get("/owner", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const apps = await prisma.application.findMany({
      where: { job: { ownerId: req.user.id } },
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
applicationsRouter.get("/:id", authMiddleware, async (req: any, res) => {
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

    const isCandidate = existingApp.candidateId === req.user.id;
    const isOwner = existingApp.job.ownerId === req.user.id;

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
applicationsRouter.post("/:id/messages", authMiddleware, async (req: any, res) => {
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

    const isCandidate = app.candidateId === req.user.id;
    const isOwner = app.job.ownerId === req.user.id;

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
        senderId: req.user.id,
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