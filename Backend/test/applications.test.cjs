const { describe, it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { prisma, mailTransporter } = require('./runtime.cjs');
const { applicationsRouter } = require('../dist/routes/applications');
const { signAccessToken } = require('../dist/lib/authTokens');

const ownerId = '11111111-1111-4111-8111-111111111111';
const candidateId = '22222222-2222-4222-8222-222222222222';
const applicationId = '33333333-3333-4333-8333-333333333333';
const application = {
  id: applicationId, candidateId, status: 'new',
  job: { ownerId, title: 'Developer', companyName: 'Demo' },
  candidate: { email: 'candidate@example.test' },
};
let server, baseUrl, update;

describe('Application API (isolated persistence and mail)', () => {
  before(async () => {
    process.env.JWT_SECRET = 'test-only-secret-never-use-in-production';
    const app = express();
    app.use(express.json());
    app.use('/applications', applicationsRouter);
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => { await new Promise(resolve => server.close(resolve)); });
  beforeEach(() => {
    mock.method(prisma.user, 'findUnique', async ({ where }) => ({ tokenVersion: 0, role: where.id === ownerId ? 'employer' : 'candidate' }));
    mock.method(prisma.application, 'findUnique', async () => application);
    update = mock.method(prisma.application, 'update', async ({ data }) => ({ ...application, ...data }));
    mock.method(mailTransporter, 'sendMail', async () => ({}));
  });
  afterEach(() => mock.restoreAll());

  async function changeStatus(role, id, status) {
    const token = signAccessToken({ id, role });
    return fetch(`${baseUrl}/applications/${applicationId}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }
  for (const status of ['reviewed', 'invited', 'rejected']) {
    it(`lets the owner set ${status}`, async () => {
      const response = await changeStatus('employer', ownerId, status);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).status, status);
      assert.equal(update.mock.callCount(), 1);
    });
  }
  it('rejects changes by another employer', async () => {
    prisma.user.findUnique = async () => ({ tokenVersion: 0, role: 'employer' });
    const response = await changeStatus('employer', candidateId, 'invited');
    assert.equal(response.status, 403);
    assert.equal(update.mock.callCount(), 0);
  });
  it('rejects candidate changes and unsupported statuses', async () => {
    assert.equal((await changeStatus('candidate', candidateId, 'invited')).status, 403);
    assert.equal((await changeStatus('employer', ownerId, 'hired')).status, 400);
    assert.equal(update.mock.callCount(), 0);
  });
  it('reports unread status changes even without messages', async () => {
    mock.method(prisma.application, 'findMany', async () => [{
      ...application, status: 'invited', messages: [],
      statusUpdatedAt: new Date('2026-09-02'), lastViewedByCandidate: new Date('2026-09-01'),
    }]);
    const token = signAccessToken({ id: candidateId, role: 'candidate' });
    const response = await fetch(`${baseUrl}/applications/my`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 200);
    assert.equal((await response.json())[0].hasUpdate, true);
  });
  it('includes unread candidate messages for the employer', async () => {
    mock.method(prisma.application, 'findMany', async ({ include }) => {
      assert.equal(include.messages.where.senderId.not, ownerId);
      return [{ ...application, createdAt: new Date('2026-09-01'),
        lastViewedByOwner: new Date('2026-09-02'), messages: [{ createdAt: new Date('2026-09-03') }] }];
    });
    const token = signAccessToken({ id: ownerId, role: 'employer' });
    const response = await fetch(`${baseUrl}/applications/owner`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 200);
    assert.equal((await response.json())[0].hasUpdate, true);
  });
});
