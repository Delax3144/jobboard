const { describe, it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { prisma } = require('./runtime.cjs');
const { jobsRouter } = require('../dist/routes/jobs');

describe('Public job pagination', () => {
  let server, baseUrl, findMany;
  before(async () => {
    const app = express();
    app.use('/jobs', jobsRouter);
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => { await new Promise(resolve => server.close(resolve)); });
  beforeEach(() => { findMany = mock.method(prisma.job, 'findMany', async () => []); });
  afterEach(() => mock.restoreAll());

  it('limits the default page and hides the extra row used to detect the next page', async () => {
    findMany.mock.mockImplementation(async () => Array.from({ length: 21 }, (_, id) => ({ id: String(id) })));
    const response = await fetch(`${baseUrl}/jobs`);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.jobs.length, 20);
    assert.equal(data.page, 1);
    assert.equal(data.hasNextPage, true);
    const query = findMany.mock.calls[0].arguments[0];
    assert.equal(query.take, 21);
    assert.equal(query.skip, 0);
    assert.equal(query.where.status, 'published');
    assert.deepEqual(query.orderBy, [{ createdAt: 'desc' }, { id: 'desc' }]);
  });

  it('applies search and combined filters before selecting page two', async () => {
    const response = await fetch(`${baseUrl}/jobs?page=2&search=%20React%20&locations=Remote&locations=Poland&levels=Junior&minSalary=5000&maxSalary=12000`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).hasNextPage, false);
    const query = findMany.mock.calls[0].arguments[0];
    assert.equal(query.skip, 20);
    assert.deepEqual(query.where.AND, [
      { OR: [{ salaryFrom: { lte: 12000 } }, { salaryFrom: null }] },
      { salaryTo: { gte: 5000 } },
      { OR: ['title', 'companyName', 'tags'].map(field => ({ [field]: { contains: 'React', mode: 'insensitive' } })) },
      { OR: ['Remote', 'Poland'].map(location => ({ location: { contains: location, mode: 'insensitive' } })) },
      { OR: [{ level: { equals: 'Junior', mode: 'insensitive' } }] },
    ]);
  });

  for (const query of ['page=0', 'page=1.5', 'page=100001', 'page=1&page=2', 'minSalary=5000&maxSalary=1000', 'locations[x]=Remote']) {
    it(`rejects invalid filters: ${query}`, async () => {
      const response = await fetch(`${baseUrl}/jobs?${query}`);
      assert.equal(response.status, 400);
      assert.equal(findMany.mock.callCount(), 0);
    });
  }
});
