const { describe, it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const axios = require('axios');
const { prisma } = require('./runtime.cjs');
const { githubRouter } = require('../dist/routes/github');

describe('GitHub OAuth upstream failures', () => {
  let server, baseUrl, post, get, lookup, logs;
  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/auth', githubRouter);
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => { await new Promise(resolve => server.close(resolve)); });
  beforeEach(() => {
    post = mock.method(axios, 'post', async () => ({ data: { access_token: 'test-access-token' } }));
    get = mock.method(axios, 'get', async () => ({ data: { login: 'example' } }));
    lookup = mock.method(prisma.user, 'findUnique', async () => { throw new Error('Unexpected database lookup'); });
    logs = mock.method(console, 'error', () => {});
  });
  afterEach(() => mock.restoreAll());

  async function signIn() {
    return fetch(`${baseUrl}/auth/github`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'test-code', role: 'candidate' }),
    });
  }

  for (const stage of ['token', 'profile', 'emails']) {
    it(`limits the ${stage} request and returns a gateway timeout without creating a session`, async () => {
      const error = new axios.AxiosError('Timeout with test-access-token', 'ECONNABORTED');
      error.config = { headers: { Authorization: 'Bearer test-access-token' } };
      if (stage === 'token') post.mock.mockImplementation(async () => { throw error; });
      else get.mock.mockImplementation(async url => {
        if (stage === 'profile' || url.endsWith('/emails')) throw error;
        return { data: { login: 'example' } };
      });
      const response = await signIn();
      assert.equal(response.status, 504);
      const body = await response.json();
      assert.match(body.message, /too long/);
      assert.equal(body.token, undefined);
      assert.equal(lookup.mock.callCount(), 0);
      assert.equal(post.mock.calls[0].arguments[2].timeout, 5000);
      for (const call of get.mock.calls) assert.equal(call.arguments[1].timeout, 5000);
      assert.doesNotMatch(JSON.stringify(logs.mock.calls), /test-access-token/);
    });
  }

  it('reports an upstream connection failure as unavailable', async () => {
    post.mock.mockImplementation(async () => { throw new axios.AxiosError('offline', 'ECONNREFUSED'); });
    const response = await signIn();
    assert.equal(response.status, 502);
    assert.match((await response.json()).message, /currently unavailable/);
    assert.equal(lookup.mock.callCount(), 0);
  });

  it('keeps invalid authorization codes as a client error', async () => {
    post.mock.mockImplementation(async () => ({ data: { error: 'bad_verification_code' } }));
    const response = await signIn();
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, 'Invalid GitHub code');
    assert.equal(get.mock.callCount(), 0);
    assert.equal(lookup.mock.callCount(), 0);
  });
});
