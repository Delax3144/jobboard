import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export async function loadEmployerDashboard(ownerId: string, page: number, search: string) {
  const where: Prisma.JobWhereInput = { ownerId, ...(search ? { OR: [
    { title: { contains: search, mode: 'insensitive' } },
    { companyName: { contains: search, mode: 'insensitive' } },
  ] } : {}) };
  const pageSize = 5;
  const [jobs, total, active, applicationStats] = await Promise.all([
    prisma.job.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize, take: pageSize,
      include: { applications: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 5,
        select: { id: true, candidate: { select: { email: true } } } } },
    }),
    prisma.job.count({ where }),
    prisma.job.count({ where: { ownerId, status: 'published' } }),
    prisma.application.groupBy({ by: ['status'], where: { job: { ownerId } }, _count: { _all: true } }),
  ]);
  const counts = await prisma.application.groupBy({ by: ['jobId', 'status'],
    where: { jobId: { in: jobs.map(job => job.id) }, job: { ownerId } }, _count: { _all: true },
  });
  return {
    jobs: jobs.map(({ applications, ...job }) => {
      const groups = counts.filter(group => group.jobId === job.id);
      return { ...job, applicantPreviews: applications,
        totalApplicants: groups.reduce((sum, group) => sum + group._count._all, 0),
        newApplicants: groups.find(group => group.status === 'new')?._count._all ?? 0,
      };
    }),
    total, totalPages: Math.ceil(total / pageSize),
    stats: { active, newApps: applicationStats.find(group => group.status === 'new')?._count._all ?? 0,
      totalApps: applicationStats.reduce((sum, group) => sum + group._count._all, 0) },
  };
}
