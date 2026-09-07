import { Router } from "express";
import { prisma } from "../prisma";
import {
  authMiddleware,
  getAuthenticatedUser,
} from "../middleware/auth";
import { jobIdSchema } from "../validation/jobs";

export const bookmarksRouter = Router();

// 1. Получить все сохраненные вакансии кандидата
bookmarksRouter.get("/", authMiddleware, async (req, res) => {
  const user = getAuthenticatedUser(req);
  try {
    const saved = await prisma.savedJob.findMany({
      where: {
        userId: user.id,
        job: {
          status: "published",
        },
      },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedJobs = saved.map(({ job, createdAt }) => ({
      ...job,
      savedAt: createdAt,
    }));

    return res.json(formattedJobs);
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);

    return res.status(500).json({
      message: "Failed to fetch bookmarks",
    });
  }
});

// 2. Переключить статус избранного (Поставить / Убрать лайк)
bookmarksRouter.post("/:jobId", authMiddleware, async (req, res) => {
  const user = getAuthenticatedUser(req);
  const parsedJobId = jobIdSchema.safeParse(req.params.jobId);

  if (!parsedJobId.success) {
    return res.status(400).json({
      message: "Invalid job id",
    });
  }

  try {
    const jobId = parsedJobId.data;
    const userId = user.id;

    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      await prisma.savedJob.delete({
        where: {
          id: existing.id,
        },
      });

      return res.json({
        saved: false,
      });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: "published",
      },
      select: {
        id: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    await prisma.savedJob.create({
      data: {
        userId,
        jobId,
      },
    });

    return res.json({
      saved: true,
    });
  } catch (error) {
    console.error("Bookmark toggle failed:", error);

    return res.status(500).json({
      message: "Failed to update bookmark",
    });
  }
});