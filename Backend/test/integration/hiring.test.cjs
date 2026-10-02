const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const express = require('express');

test('hiring flow against PostgreSQL', async t => {
  const url = new URL(process.env.DATABASE_URL || '');
  assert.equal(url.pathname, '/jobboard_test', 'Use a dedicated jobboard_test database');
  process.env.JWT_SECRET = 'integration-test-only-secret';
  const mailPath = require.resolve('../../dist/config/mailer');
  require.cache[mailPath] = { id: mailPath, filename: mailPath, loaded: true,
    exports: { mailTransporter: { sendMail: async () => ({}) } } };
  const { prisma } = require('../../dist/prisma');
  const { jobsRouter } = require('../../dist/routes/jobs');
  const { applicationsRouter } = require('../../dist/routes/applications');
  const { signAccessToken } = require('../../dist/lib/authTokens');
  const app = express();
  app.use(express.json());
  app.use('/jobs', jobsRouter);
  app.use('/applications', applicationsRouter);
  let server;
  const ids = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
  try {
    const users = [];
    for (const [index, id] of ids.entries()) users.push(await prisma.user.create({ data: {
      id, email: `${id}@integration.test`, username: id, firstName: 'Integration', lastName: 'Test',
      passwordHash: 'unused-in-this-token-auth-test', role: index === 1 || index === 3 ? 'candidate' : 'employer', isVerified: true,
    } }));
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (user, path, method = 'GET', body) => fetch(`${base}${path}`, {
      method, headers: { Authorization: `Bearer ${signAccessToken(user)}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const [owner, candidate, outsider, otherCandidate] = users;
    const created = await request(owner, '/jobs', 'POST', { title: 'Test Developer', companyName: 'Test Co', location: 'Remote',
      salaryFrom: 6000, salaryTo: 10000, description: '<p>Test opening</p>' });
    assert.equal(created.status, 201);
    const job = await created.json();
    const applied = await request(candidate, '/applications', 'POST', { jobId: job.id, coverLetter: 'Test application' });
    assert.equal(applied.status, 201);
    const application = await applied.json();
    const conversations = async (user, query = '') => {
      const response = await request(user, `/applications/conversations${query}`);
      assert.equal(response.status, 200);
      return response.json();
    };
    assert.deepEqual((await conversations(candidate)).conversations, []);
    assert.equal((await conversations(owner)).conversations[0].id, application.id);
    assert.deepEqual((await conversations(outsider)).conversations, []);
    assert.deepEqual((await conversations(otherCandidate)).conversations, []);
    const unreadCount = async user => (await (await request(user, '/applications/unread-count')).json()).count;
    assert.equal(await unreadCount(owner), 1);
    assert.equal(await unreadCount(candidate), 0);
    assert.equal(await unreadCount(outsider), 0);
    assert.equal(await unreadCount(otherCandidate), 0);
    assert.equal((await request(candidate, '/applications', 'POST', { jobId: job.id })).status, 400);
    assert.equal((await request(outsider, `/applications/${application.id}`, 'PATCH', { status: 'invited' })).status, 403);
    assert.equal((await request(candidate, `/applications/${application.id}/messages`, 'POST', { text: 'Too soon' })).status, 403);
    for (const status of ['reviewed', 'invited']) {
      assert.equal((await request(owner, `/applications/${application.id}`, 'PATCH', { status })).status, 200);
    }
    let mine = await (await request(candidate, '/applications/my')).json();
    assert.equal(mine[0].hasUpdate, true);
    assert.equal(await unreadCount(candidate), 1);
    assert.equal((await conversations(candidate)).conversations[0].hasUpdate, true);
    assert.equal((await request(candidate, `/applications/${application.id}`)).status, 200);
    mine = await (await request(candidate, '/applications/my')).json();
    assert.equal(mine[0].hasUpdate, false);
    assert.equal(await unreadCount(candidate), 0);
    assert.equal((await conversations(candidate)).conversations[0].hasUpdate, false);
    assert.equal((await request(owner, `/applications/${application.id}`)).status, 200);
    assert.equal(await unreadCount(owner), 0);
    assert.equal((await request(candidate, `/applications/${application.id}/messages`, 'POST', { text: 'Thank you!' })).status, 201);
    const ownerApps = await (await request(owner, '/applications/owner')).json();
    assert.equal(ownerApps[0].hasUpdate, true);
    assert.equal(await unreadCount(owner), 1);
    const ownPreview = (await conversations(candidate)).conversations[0];
    assert.equal(ownPreview.messages[0].text, 'Thank you!');
    assert.equal(ownPreview.hasUpdate, false);
    assert.equal(await unreadCount(candidate), 0);
    assert.equal((await request(candidate, `/applications/${application.id}/messages`, 'POST', { text: 'One more detail' })).status, 201);
    assert.equal(await unreadCount(owner), 1);
    assert.equal((await request(outsider, `/applications/${application.id}`)).status, 403);
    assert.equal((await request(owner, `/jobs/${job.id}`, 'DELETE')).status, 204);
    assert.equal(await prisma.message.count({ where: { applicationId: application.id } }), 0);
    await t.test('conversation pages, literal search, activity ordering and account isolation', async () => {
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const jobs = Array.from({ length: 22 }, (_, index) => ({
        id: randomUUID(), ownerId: owner.id, title: `Pagination Developer ${index}`,
        companyName: index === 20 ? "Unique %_ ' company" : 'Page Co', description: 'Test', createdAt,
      }));
      const applications = jobs.map((job, index) => ({
        id: randomUUID(), jobId: job.id, candidateId: candidate.id, createdAt,
        status: index === 21 ? 'new' : 'invited',
      }));
      await prisma.job.createMany({ data: jobs });
      await prisma.application.createMany({ data: applications });
      const candidateOrder = applications.slice(0, 21).map(item => item.id).sort().reverse();
      const first = await conversations(candidate);
      const second = await conversations(candidate, '?page=2');
      assert.deepEqual(first.conversations.map(item => item.id), candidateOrder.slice(0, 20));
      assert.deepEqual(second.conversations.map(item => item.id), candidateOrder.slice(20));
      assert.equal(first.hasNextPage, true);
      assert.equal(second.hasNextPage, false);
      assert.equal((await conversations(owner, '?page=2')).conversations.length, 2);
      assert.deepEqual((await conversations(candidate, '?page=3')).conversations, []);
      const unique = await conversations(candidate, `?search=${encodeURIComponent("%_ ' company")}`);
      assert.deepEqual(unique.conversations.map(item => item.id), [applications[20].id]);
      assert.equal((await conversations(owner, `?search=${encodeURIComponent(candidate.email)}`)).conversations.length, 20);
      assert.equal((await conversations(candidate, '?search=pAgInAtIoN%20dEvElOpEr%2020')).conversations[0].id, applications[20].id);
      assert.deepEqual((await conversations(outsider, '?search=Pagination')).conversations, []);
      assert.deepEqual((await conversations(otherCandidate, '?search=Pagination')).conversations, []);
      await prisma.message.create({ data: { applicationId: applications[21].id, senderId: owner.id,
        text: 'Employer opened the conversation', createdAt: new Date('2025-01-01T00:00:00Z') } });
      assert.equal((await conversations(candidate)).conversations[0].id, applications[21].id);
      await prisma.message.create({ data: { applicationId: applications[0].id, senderId: candidate.id,
        text: 'Latest own message', createdAt: new Date('2025-01-02T00:00:00Z') } });
      for (const user of [owner, candidate]) {
        const latest = (await conversations(user)).conversations[0];
        assert.equal(latest.id, applications[0].id);
        assert.equal(latest.messages[0].text, 'Latest own message');
      }
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await prisma.job.deleteMany({ where: { ownerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
});
