const { it, before, after, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { prisma } = require('./runtime.cjs');
const { applicationsRouter } = require('../dist/routes/applications');
const { signAccessToken } = require('../dist/lib/authTokens');
const userId = '22222222-2222-4222-8222-222222222222';
let server, baseUrl;
before(async () => {
  const app = express();
  app.use('/applications', applicationsRouter);
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });
afterEach(() => mock.restoreAll());

for (const role of ['candidate', 'employer']) {
  it(`returns only the aggregate scoped to the authenticated ${role}`, async () => {
    mock.method(prisma.user, 'findUnique', async () => ({ tokenVersion: 0, role }));
    const query = mock.method(prisma, '$queryRaw', async () => [{ count: 7 }]);
    const response = await fetch(`${baseUrl}/applications/unread-count?userId=someone-else`, {
      headers: { Authorization: `Bearer ${signAccessToken({ id: userId, role })}` },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { count: 7 });
    const sql = query.mock.calls[0].arguments[0];
    assert.deepEqual(sql.values, [userId, userId]);
    const text = sql.strings.join('?');
    assert.match(text, /COUNT\(\*\)::integer/);
    assert.match(text, /EXISTS/);
    assert.match(text, /"senderId" <>/);
    assert.ok(text.includes(role === 'candidate' ? 'a."candidateId" = ' : 'j."ownerId" = '));
    assert.ok(text.includes(role === 'candidate' ? 'a."statusUpdatedAt" > a."lastViewedByCandidate"' : 'a."createdAt" > a."lastViewedByOwner"'));
  });
}

it('rejects unauthenticated callers without reading counts', async () => {
  const query = mock.method(prisma, '$queryRaw', async () => [{ count: 0 }]);
  assert.equal((await fetch(`${baseUrl}/applications/unread-count`)).status, 401);
  assert.equal(query.mock.callCount(), 0);
});
