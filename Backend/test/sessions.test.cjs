const { describe, it, before, after, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const bcrypt = require('bcrypt');
const { prisma } = require('./runtime.cjs');
const { passwordResetRouter } = require('../dist/routes/passwordReset');
const { authMiddleware } = require('../dist/middleware/auth');
const { signAccessToken } = require('../dist/lib/authTokens');
const { authenticateSocket } = require('../dist/socket/authenticateSocket');

describe('Password reset revokes sessions', () => {
  let server, url;
  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/auth', passwordResetRouter);
    app.get('/private', authMiddleware, (_req, res) => res.json({ ok: true }));
    app.set('io', { in: () => ({ disconnectSockets: () => { disconnected = true; } }) });
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    url = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => { mock.restoreAll(); await new Promise(resolve => server.close(resolve)); });
  let disconnected = false;
  it('rejects old HTTP and socket credentials while accepting a new login', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    let tokenVersion = 0;
    let passwordHash;
    let consumed = false;
    mock.method(prisma.user, 'findUnique', async () => ({ tokenVersion, role: 'candidate' }));
    mock.method(prisma.user, 'findFirst', async () => consumed ? null : { id });
    mock.method(prisma.user, 'updateMany', async ({ data }) => {
      tokenVersion += data.tokenVersion.increment;
      passwordHash = data.passwordHash;
      consumed = true;
      return { count: 1 };
    });
    const oldToken = signAccessToken({ id, role: 'candidate', tokenVersion });
    const privateRequest = token => fetch(`${url}/private`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal((await privateRequest(oldToken)).status, 200);
    const body = JSON.stringify({ token: 'a'.repeat(64), newPassword: 'ChangedPassword123!' });
    const response = await fetch(`${url}/auth/reset-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
    assert.equal(response.status, 200);
    assert.equal(await bcrypt.compare('ChangedPassword123!', passwordHash), true);
    assert.equal(disconnected, true);
    assert.equal((await privateRequest(oldToken)).status, 401);
    const socketError = await new Promise(resolve => authenticateSocket({ handshake: { auth: { token: oldToken } }, data: {} }, resolve));
    assert.ok(socketError instanceof Error);
    const newToken = signAccessToken({ id, role: 'candidate', tokenVersion });
    assert.equal((await privateRequest(newToken)).status, 200);
    const replay = await fetch(`${url}/auth/reset-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
    assert.equal(replay.status, 400);
  });
});
