const { it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { prisma } = require('./runtime.cjs');
const { applicationsRouter } = require('../dist/routes/applications');
const { signAccessToken } = require('../dist/lib/authTokens');
const candidateId = '22222222-2222-4222-8222-222222222222';
let server, baseUrl, findMany, groupBy;

before(async () => {
  const app = express();
  app.use('/applications', applicationsRouter);
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });
beforeEach(() => {
  mock.method(prisma.user, 'findUnique', async () => ({ tokenVersion: 0, role: 'candidate' }));
  findMany = mock.method(prisma.application, 'findMany', async () => Array.from({ length: 21 }, (_, id) => ({
    id: String(id), messages: [], statusUpdatedAt: new Date('2026-10-01'),
    lastViewedByCandidate: new Date('2026-09-01'),
  })));
  groupBy = mock.method(prisma.application, 'groupBy', async () => [
    { status: 'new', _count: { _all: 30 } }, { status: 'reviewed', _count: { _all: 10 } },
    { status: 'invited', _count: { _all: 5 } }, { status: 'rejected', _count: { _all: 5 } },
  ]);
});
afterEach(() => mock.restoreAll());
const request = query => fetch(`${baseUrl}/applications/my${query}`, {
  headers: { Authorization: `Bearer ${signAccessToken({ id: candidateId, role: 'candidate' })}` },
});

it('paginates only the signed-in candidate applications and keeps global statistics', async () => {
  const response = await request('?page=2');
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.applications.length, 20);
  assert.equal(data.applications[0].hasUpdate, true);
  assert.equal(data.hasNextPage, true);
  assert.deepEqual(data.stats, { total: 50, invited: 5, pending: 40 });
  const query = findMany.mock.calls[0].arguments[0];
  assert.deepEqual(query.where, { candidateId });
  assert.equal(query.skip, 20);
  assert.equal(query.take, 21);
  assert.deepEqual(query.orderBy, [{ createdAt: 'desc' }, { id: 'desc' }]);
  assert.deepEqual(groupBy.mock.calls[0].arguments[0].where, { candidateId });
});

it('preserves the complete legacy list for chat and unread counter consumers', async () => {
  const response = await request('');
  const data = await response.json();
  assert.equal(data.length, 21);
  assert.equal(findMany.mock.calls[0].arguments[0].take, undefined);
  assert.equal(groupBy.mock.callCount(), 0);
});

it('rejects invalid pages and employer access before loading applications', async () => {
  assert.equal((await request('?page=0')).status, 400);
  mock.method(prisma.user, 'findUnique', async () => ({ tokenVersion: 0, role: 'employer' }));
  const response = await fetch(`${baseUrl}/applications/my?page=1`, {
    headers: { Authorization: `Bearer ${signAccessToken({ id: candidateId, role: 'employer' })}` },
  });
  assert.equal(response.status, 403);
  assert.equal(findMany.mock.callCount(), 0);
});
