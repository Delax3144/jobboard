import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { applicationCandidateSelect } from '../selects/user';

export async function listConversations(userId: string, role: 'candidate' | 'employer', page: number, search: string) {
  const employer = role === 'employer';
  const scope = employer ? Prisma.sql`j."ownerId" = ${userId}` : Prisma.sql`a."candidateId" = ${userId}`;
  const visible = employer ? Prisma.sql`TRUE` : Prisma.sql`(a.status <> 'new' OR EXISTS (SELECT 1 FROM "Message" m WHERE m."applicationId" = a.id))`;
  const partner = employer ? Prisma.sql`CONCAT_WS(' ', u."firstName", u."lastName", u.email)` : Prisma.sql`j."companyName"`;
  const readAt = employer ? Prisma.sql`a."lastViewedByOwner"` : Prisma.sql`a."lastViewedByCandidate"`;
  const update = employer ? Prisma.sql`a."createdAt" > ${readAt}` : Prisma.sql`a."statusUpdatedAt" > ${readAt}`;
  const rows = await prisma.$queryRaw<Array<{ id: string; hasUpdate: boolean }>>(Prisma.sql`
    SELECT a.id, COALESCE(${update}, FALSE) OR EXISTS (
      SELECT 1 FROM "Message" m WHERE m."applicationId" = a.id
        AND m."senderId" <> ${userId} AND m."createdAt" > ${readAt}
    ) AS "hasUpdate"
    FROM "Application" a
    JOIN "Job" j ON j.id = a."jobId"
    JOIN "User" u ON u.id = a."candidateId"
    WHERE ${scope} AND ${visible}
      AND STRPOS(LOWER(CONCAT_WS(' ', ${partner}, j.title)), LOWER(${search})) > 0
    ORDER BY COALESCE((SELECT MAX(m."createdAt") FROM "Message" m WHERE m."applicationId" = a.id), a."createdAt") DESC, a.id DESC
    LIMIT 21 OFFSET ${(page - 1) * 20}
  `);
  const selected = rows.slice(0, 20);
  const applications = await prisma.application.findMany({
    where: { id: { in: selected.map(row => row.id) }, ...(employer ? { job: { ownerId: userId } } : { candidateId: userId }) },
    include: {
      job: { include: { owner: { select: { lastActive: true } } } },
      candidate: { select: applicationCandidateSelect },
      messages: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1 },
    },
  });
  const byId = new Map(applications.map(application => [application.id, application]));
  return {
    conversations: selected.flatMap(row => {
      const application = byId.get(row.id);
      return application ? [{ ...application, hasUpdate: row.hasUpdate }] : [];
    }),
    hasNextPage: rows.length > 20,
  };
}
