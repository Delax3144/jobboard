const { it, mock } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { createShutdown } = require('../dist/lib/shutdown');

it('finishes an active HTTP request before disconnecting the database and exits once', async () => {
  let finishRequest;
  const started = new Promise(resolve => {
    finishRequest = { started: resolve };
  });
  const server = createServer((_req, res) => {
    finishRequest.respond = () => res.end('completed');
    finishRequest.started();
  });
  const io = new Server(server);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const events = [];
  const exit = mock.fn(code => events.push(`exit:${code}`));
  const shutdown = createShutdown({
    closeServer: () => io.close(),
    disconnectDatabase: async () => { events.push('database'); },
    closeMailer: () => events.push('mailer'), exit,
  });
  try {
    const response = fetch(`http://127.0.0.1:${server.address().port}`);
    await started;
    const pending = shutdown();
    assert.equal(shutdown(), pending);
    assert.deepEqual(events, []);
    finishRequest.respond();
    assert.equal(await (await response).text(), 'completed');
    await pending;
    assert.deepEqual(events, ['database', 'mailer', 'exit:0']);
    assert.equal(exit.mock.callCount(), 1);
    assert.equal(server.listening, false);
  } finally {
    await io.close();
  }
});

it('forces a failed exit when shutdown exceeds its deadline', async () => {
  const exit = mock.fn();
  const shutdown = createShutdown({
    closeServer: () => new Promise(() => {}),
    disconnectDatabase: async () => {}, closeMailer: () => {},
    exit, timeoutMs: 10,
  });
  shutdown();
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.deepEqual(exit.mock.calls.map(call => call.arguments), [[1]]);
});

it('still closes mail resources if database cleanup fails', async () => {
  const closeMailer = mock.fn();
  const exit = mock.fn();
  const shutdown = createShutdown({
    closeServer: async () => {},
    disconnectDatabase: async () => { throw new Error('Database cleanup failed'); },
    closeMailer, exit,
  });
  await shutdown();
  assert.equal(closeMailer.mock.callCount(), 1);
  assert.deepEqual(exit.mock.calls.map(call => call.arguments), [[1]]);
});
