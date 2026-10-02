import { Router } from "express";
import { prisma } from "../prisma";
import {
  authMiddleware,
  getAuthenticatedUser,
} from "../middleware/auth";
import { jobIdSchema } from "../validation/jobs";
import { bookmarkListSchema } from '../validation/bookmarks';

export const bookmarksRouter = Router();

bookmarksRouter.get("/", authMiddleware, async (req, res) => {
  const user = getAuthenticatedUser(req);
  const parsed = bookmarkListSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid bookmark filters' });
  const { page, jobIds } = parsed.data;
  const where = { userId: user.id, job: { status: 'published' }, ...(jobIds ? { jobId: { in: jobIds } } : {}) };
  try {
    const saved = await prisma.savedJob.findMany({
      where,
      include: {
        job: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(page ? { skip: (page - 1) * 20, take: 20 } : {}),
    });

    const formattedJobs = saved.map(({ job, createdAt }) => ({
      ...job,
      savedAt: createdAt,
    }));

    if (!page) return res.json(formattedJobs);
    const total = await prisma.savedJob.count({ where });
    return res.json({ jobs: formattedJobs, total, hasNextPage: page * 20 < total });
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);

    return res.status(500).json({
      message: "Failed to fetch bookmarks",
    });
  }
});

bookmarksRouter.delete('/:jobId', authMiddleware, async (req, res) => {
  const user = getAuthenticatedUser(req);
  const parsed = jobIdSchema.safeParse(req.params.jobId);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid job id' });
  try {
    await prisma.savedJob.deleteMany({ where: { userId: user.id, jobId: parsed.data } });
    return res.sendStatus(204);
  } catch {
    return res.status(500).json({ message: 'Failed to remove bookmark' });
  }
});

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
