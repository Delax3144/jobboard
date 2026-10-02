import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export async function countUnreadApplications(userId: string, role: 'candidate' | 'employer') {
  const scope = role === 'employer'
    ? Prisma.sql`j."ownerId" = ${userId}`
    : Prisma.sql`a."candidateId" = ${userId}`;
  const readAt = role === 'employer'
    ? Prisma.sql`a."lastViewedByOwner"`
    : Prisma.sql`a."lastViewedByCandidate"`;
  const hasUpdate = role === 'employer'
    ? Prisma.sql`a."createdAt" > ${readAt}`
    : Prisma.sql`a."statusUpdatedAt" > ${readAt}`;
  const result = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
    SELECT COUNT(*)::integer AS count
    FROM "Application" a
    JOIN "Job" j ON j.id = a."jobId"
    WHERE ${scope} AND (
      ${hasUpdate} OR EXISTS (
        SELECT 1 FROM "Message" m
        WHERE m."applicationId" = a.id
          AND m."senderId" <> ${userId}
          AND m."createdAt" > ${readAt}
      )
    )
  `);
  return result[0].count;
}
