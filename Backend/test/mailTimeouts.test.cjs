const { it } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:net');
const nodemailer = require('nodemailer');
const { mailTimeouts } = require('../dist/config/mailTimeouts');

for (const stage of ['greeting', 'command']) {
  it(`closes an SMTP connection that stalls during ${stage}`, { timeout: 15000 }, async () => {
    const sockets = new Set();
    const server = createServer(socket => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
      if (stage === 'command') socket.write('220 localhost ESMTP\r\n');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const transport = nodemailer.createTransport({
      ...mailTimeouts,
      host: '127.0.0.1', port: server.address().port,
      secure: false, ignoreTLS: true,
    });
    try {
      await assert.rejects(transport.sendMail({
        from: 'sender@example.test', to: 'recipient@example.test',
        subject: 'Timeout test', text: 'Local test only',
      }), error => {
        assert.equal(error.code, 'ETIMEDOUT');
        assert.match(error.message, stage === 'greeting' ? /Greeting never received/ : /Timeout/);
        return true;
      });
    } finally {
      transport.close();
      for (const socket of sockets) socket.destroy();
      await new Promise(resolve => server.close(resolve));
    }
  });
}
