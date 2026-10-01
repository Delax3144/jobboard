const { describe, it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { gaxios } = require('google-auth-library');
const { prisma } = require('./runtime.cjs');
const { googleRouter } = require('../dist/routes/google');

describe('Google OAuth certificate request failures', () => {
  let server, baseUrl, lookup, logs;
  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/auth', googleRouter);
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => { await new Promise(resolve => server.close(resolve)); });
  beforeEach(() => {
    lookup = mock.method(prisma.user, 'findUnique', async () => { throw new Error('Unexpected database lookup'); });
    logs = mock.method(console, 'error', () => {});
  });
  afterEach(() => mock.restoreAll());

  for (const [code, status] of [['TimeoutError', 504], ['ECONNREFUSED', 502]]) {
    it(`handles ${code} without retries, credentials in logs, or database changes`, async () => {
      const request = mock.method(gaxios.Gaxios.prototype, '_defaultAdapter', async options => {
        assert.equal(options.timeout, 5000);
        assert.equal(options.retryConfig.retry, 0);
        assert.ok(options.signal);
        const error = new gaxios.GaxiosError('test-credential', options);
        error.code = code;
        throw error;
      });
      const response = await fetch(`${baseUrl}/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: 'test-credential', role: 'candidate' }),
      });
      assert.equal(response.status, status);
      const body = await response.json();
      assert.match(body.message, status === 504 ? /too long/ : /currently unavailable/);
      assert.equal(body.token, undefined);
      assert.equal(request.mock.callCount(), 1);
      assert.equal(lookup.mock.callCount(), 0);
      assert.doesNotMatch(JSON.stringify(logs.mock.calls), /test-credential/);
    });
  }
});
