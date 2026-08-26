import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";
import { uploadJob } from "../lib/upload";
import { sanitizeRichText } from "../lib/sanitizeHtml";
import {
  createJobSchema,
  jobIdSchema,
  updateJobSchema,
} from "../validation/jobs";
import { optionalAuthMiddleware } from "../middleware/optionalAuth";

export const jobsRouter = Router();

// 1. Получение опубликованных вакансий
jobsRouter.get("/", async (_req, res) => {
  const jobs = await prisma.job.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  res.json({ jobs });
});

jobsRouter.get("/mine", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "Employers only" });
  }

  const jobs = await prisma.job.findMany({
    where: { ownerId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({ jobs });
});

// 2. Получение одной
jobsRouter.get("/:id", optionalAuthMiddleware, async (req, res) => {
  const parsedId = jobIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid job id",
    });
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: parsedId.data },
    });

    if (!job) {
      return res.status(404).json({ message: "Вакансия не найдена" });
    }

    const isOwner = req.user?.id === job.ownerId;

    if (job.status !== "published" && !isOwner) {
      return res.status(404).json({ message: "Вакансия не найдена" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 3. Создание
jobsRouter.post("/", authMiddleware, uploadJob.single("logo"), async (req: any, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "Employers only" });
  }

  const parsed = createJobSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid job data",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const {
    title,
    companyName,
    location,
    salaryFrom,
    salaryTo,
    description,
    tags,
    level,
    status,
  } = parsed.data;

  const companyLogo = req.file ? req.file.path : null;
  const sanitizedDescription = sanitizeRichText(description);

  try {
    const job = await prisma.job.create({
      data: {
        title,
        companyName,
        companyLogo,
        location,
        description: sanitizedDescription,
        level,
        salaryFrom,
        salaryTo,
        tags,
        ownerId: req.user.id,
        status,
      }
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании" });
  }
});

// 4. РЕДАКТИРОВАНИЕ 
jobsRouter.patch("/:id", authMiddleware, uploadJob.single("logo"), async (req: any, res) => {
  const { id } = req.params;

  const parsedId = jobIdSchema.safeParse(id);

  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid job id",
    });
  }

  const parsed = updateJobSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid job data",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const jobId = parsedId.data;

  const {
    title,
    companyName,
    location,
    salaryFrom,
    salaryTo,
    description,
    tags,
    level,
    status,
  } = parsed.data;
  const sanitizedDescription =
  description !== undefined
    ? sanitizeRichText(description)
    : undefined;

  try {
    const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existingJob || existingJob.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const nextSalaryFrom = salaryFrom ?? existingJob.salaryFrom;
    const nextSalaryTo = salaryTo ?? existingJob.salaryTo;

    if (
      nextSalaryFrom !== null &&
      nextSalaryTo !== null &&
      nextSalaryFrom > nextSalaryTo
    ) {
      return res.status(400).json({
        message: "Invalid job data",
        errors: {
          salaryTo: ["Minimum salary cannot exceed maximum salary"],
        },
      });
    }

    const companyLogo = req.file ? req.file.path : undefined;

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        companyName,
        location,
        level,
        description: sanitizedDescription,
        tags,
        status,
        salaryFrom,
        salaryTo,
        ...(companyLogo && { companyLogo }),
      }
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
});

// 5. Удаление
jobsRouter.delete("/:id", authMiddleware, async (req: any, res) => {
  const parsedId = jobIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid job id",
    });
  }

  const jobId = parsedId.data;

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.application.deleteMany({
      where: { jobId },
    });

    await prisma.job.delete({
      where: { id: jobId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});