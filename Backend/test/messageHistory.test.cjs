const { it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { prisma } = require('./runtime.cjs');
const { applicationsRouter } = require('../dist/routes/applications');
const { signAccessToken } = require('../dist/lib/authTokens');
const userId = '22222222-2222-4222-8222-222222222222';
const applicationId = '33333333-3333-4333-8333-333333333333';
const cursorId = '44444444-4444-4444-8444-444444444444';
const createdAt = new Date('2026-10-02');
let server, baseUrl, findMany, update, cursor;

before(async () => {
  const app = express();
  app.use('/applications', applicationsRouter);
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });
beforeEach(() => {
  mock.method(prisma.user, 'findUnique', async () => ({ tokenVersion: 0, role: 'candidate' }));
  mock.method(prisma.application, 'findUnique', async () => ({ candidateId: userId, job: { ownerId: 'owner' } }));
  const messages = Array.from({ length: 51 }, (_, id) => ({ id: String(51 - id) }));
  findMany = mock.method(prisma.message, 'findMany', async () => messages);
  cursor = mock.method(prisma.message, 'findFirst', async () => ({ id: cursorId, createdAt }));
  update = mock.method(prisma.application, 'update', async () => ({ id: applicationId, messages }));
});
afterEach(() => mock.restoreAll());
const request = path => fetch(`${baseUrl}/applications/${applicationId}${path}`, {
  headers: { Authorization: `Bearer ${signAccessToken({ id: userId, role: 'candidate' })}` },
});

it('loads only the latest 50 messages in chronological order and updates read markers', async () => {
  const response = await request('?history=recent');
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.messages.length, 50);
  assert.equal(data.messages[0].id, '2');
  assert.equal(data.messages[49].id, '51');
  assert.equal(data.hasEarlierMessages, true);
  const query = update.mock.calls[0].arguments[0];
  assert.equal(query.include.messages.take, 51);
  assert.deepEqual(query.include.messages.orderBy, [{ createdAt: 'desc' }, { id: 'desc' }]);
  assert.ok(query.data.lastViewedByCandidate instanceof Date);
});

it('scopes the cursor to this conversation and handles equal timestamps deterministically', async () => {
  const response = await request(`/messages?before=${cursorId}`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.messages.length, 50);
  assert.equal(data.hasEarlierMessages, true);
  assert.deepEqual(cursor.mock.calls[0].arguments[0].where, { id: cursorId, applicationId });
  const query = findMany.mock.calls[0].arguments[0];
  assert.equal(query.take, 51);
  assert.deepEqual(query.where, { applicationId, OR: [
    { createdAt: { lt: createdAt } }, { createdAt, id: { lt: cursorId } },
  ] });
  assert.equal(update.mock.callCount(), 0);
});

it('rejects unauthorized history access and foreign cursors without reading messages', async () => {
  cursor.mock.mockImplementation(async () => null);
  assert.equal((await request(`/messages?before=${cursorId}`)).status, 404);
  mock.method(prisma.application, 'findUnique', async () => ({ candidateId: 'other', job: { ownerId: 'owner' } }));
  assert.equal((await request(`/messages?before=${cursorId}`)).status, 403);
  assert.equal(findMany.mock.callCount(), 0);
});
