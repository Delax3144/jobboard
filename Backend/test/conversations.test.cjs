const { it, before, after, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { prisma } = require('./runtime.cjs');
const { applicationsRouter } = require('../dist/routes/applications');
const { signAccessToken } = require('../dist/lib/authTokens');
const userId = '22222222-2222-4222-8222-222222222222';
let server, baseUrl;
before(async () => {
  const app = express(); app.use('/applications', applicationsRouter);
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });
afterEach(() => mock.restoreAll());

for (const role of ['candidate', 'employer']) {
  it(`bounds and scopes ${role} conversations, preserving last activity order`, async () => {
    mock.method(prisma.user, 'findUnique', async () => ({ tokenVersion: 0, role }));
    const rows = Array.from({ length: 21 }, (_, index) => ({ id: `app-${index}`, hasUpdate: index === 0 }));
    const raw = mock.method(prisma, '$queryRaw', async () => rows);
    const find = mock.method(prisma.application, 'findMany', async () => rows.slice(0, 20).reverse());
    const response = await fetch(`${baseUrl}/applications/conversations?page=2&search=%20Alex%20`, {
      headers: { Authorization: `Bearer ${signAccessToken({ id: userId, role })}` },
    });
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.conversations.length, 20);
    assert.equal(data.conversations[0].id, 'app-0');
    assert.equal(data.conversations[0].hasUpdate, true);
    assert.equal(data.hasNextPage, true);
    assert.deepEqual(raw.mock.calls[0].arguments[0].values, [userId, userId, 'Alex', 20]);
    const query = find.mock.calls[0].arguments[0];
    assert.equal(query.where.id.in.length, 20);
    assert.deepEqual(role === 'employer' ? query.where.job : query.where.candidateId, role === 'employer' ? { ownerId: userId } : userId);
    assert.equal(query.include.messages.take, 1);
  });
}

it('rejects unauthenticated callers and invalid pages before reading conversations', async () => {
  const raw = mock.method(prisma, '$queryRaw', async () => []);
  assert.equal((await fetch(`${baseUrl}/applications/conversations`)).status, 401);
  mock.method(prisma.user, 'findUnique', async () => ({ tokenVersion: 0, role: 'candidate' }));
  assert.equal((await fetch(`${baseUrl}/applications/conversations?page=0`, {
    headers: { Authorization: `Bearer ${signAccessToken({ id: userId, role: 'candidate' })}` },
  })).status, 400);
  assert.equal(raw.mock.callCount(), 0);
});
