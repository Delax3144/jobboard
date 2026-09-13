const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const express = require('express');

test('hiring flow against PostgreSQL', async () => {
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
  const ids = [randomUUID(), randomUUID(), randomUUID()];
  try {
    const users = [];
    for (const [index, id] of ids.entries()) users.push(await prisma.user.create({ data: {
      id, email: `${id}@integration.test`, username: id, firstName: 'Integration', lastName: 'Test',
      passwordHash: 'unused-in-this-token-auth-test', role: index === 1 ? 'candidate' : 'employer', isVerified: true,
    } }));
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (user, path, method = 'GET', body) => fetch(`${base}${path}`, {
      method, headers: { Authorization: `Bearer ${signAccessToken(user)}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const [owner, candidate, outsider] = users;
    const created = await request(owner, '/jobs', 'POST', { title: 'Test Developer', companyName: 'Test Co', location: 'Remote',
      salaryFrom: 6000, salaryTo: 10000, description: '<p>Test opening</p>' });
    assert.equal(created.status, 201);
    const job = await created.json();
    const applied = await request(candidate, '/applications', 'POST', { jobId: job.id, coverLetter: 'Test application' });
    assert.equal(applied.status, 201);
    const application = await applied.json();
    assert.equal((await request(candidate, '/applications', 'POST', { jobId: job.id })).status, 400);
    assert.equal((await request(outsider, `/applications/${application.id}`, 'PATCH', { status: 'invited' })).status, 403);
    assert.equal((await request(candidate, `/applications/${application.id}/messages`, 'POST', { text: 'Too soon' })).status, 403);
    for (const status of ['reviewed', 'invited']) {
      assert.equal((await request(owner, `/applications/${application.id}`, 'PATCH', { status })).status, 200);
    }
    let mine = await (await request(candidate, '/applications/my')).json();
    assert.equal(mine[0].hasUpdate, true);
    assert.equal((await request(candidate, `/applications/${application.id}`)).status, 200);
    mine = await (await request(candidate, '/applications/my')).json();
    assert.equal(mine[0].hasUpdate, false);
    assert.equal((await request(candidate, `/applications/${application.id}/messages`, 'POST', { text: 'Thank you!' })).status, 201);
    const ownerApps = await (await request(owner, '/applications/owner')).json();
    assert.equal(ownerApps[0].hasUpdate, true);
    assert.equal((await request(outsider, `/applications/${application.id}`)).status, 403);
    assert.equal((await request(owner, `/jobs/${job.id}`, 'DELETE')).status, 204);
    assert.equal(await prisma.message.count({ where: { applicationId: application.id } }), 0);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await prisma.job.deleteMany({ where: { ownerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
});
