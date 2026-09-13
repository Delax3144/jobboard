require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const url = new URL(process.env.DATABASE_URL || '');
  if (process.env.NODE_ENV === 'production' || !['localhost', '127.0.0.1', '[::1]', 'db'].includes(url.hostname)) {
    throw new Error('Demo seed only supports a local development database. Do not seed production.');
  }
  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash('DemoOnly123!', 10);
    const users = [];
    for (const role of ['employer', 'candidate']) {
      users.push(await prisma.user.upsert({
        where: { email: `${role}@jobboard.test` }, update: {},
        create: { email: `${role}@jobboard.test`, username: `demo_${role}`, firstName: 'Demo',
          lastName: role === 'employer' ? 'Employer' : 'Candidate', role, passwordHash, isVerified: true,
          skills: role === 'candidate' ? 'React, TypeScript, CSS' : null },
      }));
    }
    const [employer, candidate] = users;
    const titles = ['Junior Frontend Developer', 'React Developer', 'Backend Developer', 'Full Stack Developer'];
    const jobs = [];
    for (const [index, title] of titles.entries()) {
      jobs.push(await prisma.job.upsert({
        where: { id: `dddddddd-dddd-4ddd-8ddd-${String(index + 1).padStart(12, '0')}` }, update: {},
        create: { id: `dddddddd-dddd-4ddd-8ddd-${String(index + 1).padStart(12, '0')}`, ownerId: employer.id,
          title, companyName: 'Demo Engineering', location: index % 2 ? 'Poland' : 'Remote', level: 'Junior',
          salaryFrom: 6000 + index * 1000, salaryTo: 10000 + index * 1000, tags: 'React, TypeScript, Node.js',
          description: '<p>A fictional opening for exploring the JobBoard demo.</p><ul><li>Build web features</li><li>Collaborate on code reviews</li></ul>', status: 'published' },
      }));
    }
    const application = await prisma.application.upsert({
      where: { jobId_candidateId: { jobId: jobs[0].id, candidateId: candidate.id } }, update: {},
      create: { jobId: jobs[0].id, candidateId: candidate.id, coverLetter: 'Demo application: I enjoy building React applications.',
        status: 'invited', statusUpdatedAt: new Date(), lastViewedByOwner: new Date(0) },
    });
    await prisma.message.upsert({
      where: { id: 'eeeeeeee-eeee-4eee-8eee-000000000001' }, update: {},
      create: { id: 'eeeeeeee-eeee-4eee-8eee-000000000001', applicationId: application.id,
        senderId: employer.id, text: 'Welcome to the local demo. Try replying, then apply to another opening.' },
    });
    console.log('Local demo ready. Employer: employer@jobboard.test; Candidate: candidate@jobboard.test');
    console.log('Initial password for both accounts: DemoOnly123! Existing records are preserved.');
  } finally { await prisma.$disconnect(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
