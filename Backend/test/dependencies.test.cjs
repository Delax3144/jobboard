const { describe, it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const { PassThrough } = require('node:stream');
const express = require('express');
const nodemailer = require('nodemailer');
const { v2: cloudinary } = require('cloudinary');
const { uploadAvatar, uploadCV } = require('../dist/lib/upload');
const { uploadErrorHandler } = require('../dist/middleware/uploadErrorHandler');

describe('Upload dependency compatibility', () => {
  let server, baseUrl, upload, destroy;

  before(async () => {
    const app = express();
    const respond = (req, res) => res.status(201).json(req.file);
    app.post('/avatar', uploadAvatar.single('file'), respond);
    app.post('/resume', uploadCV.single('file'), respond);
    app.use(uploadErrorHandler);
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => { await new Promise(resolve => server.close(resolve)); });
  beforeEach(() => {
    upload = mock.method(cloudinary.uploader, 'upload_stream', (options, callback) => {
      const stream = new PassThrough();
      let bytes = 0;
      stream.on('data', chunk => { bytes += chunk.length; });
      stream.on('end', () => callback(null, {
        secure_url: 'https://example.test/upload', public_id: 'test-upload', bytes,
      }));
      return stream;
    });
    destroy = mock.method(cloudinary.uploader, 'destroy', async () => ({ result: 'ok' }));
  });
  afterEach(() => mock.restoreAll());

  async function sendFile(path, type, size) {
    const body = new FormData();
    body.append('file', new Blob([new Uint8Array(size)], { type }), 'upload');
    return fetch(`${baseUrl}/${path}`, { method: 'POST', body });
  }

  for (const [path, type, limit] of [
    ['avatar', 'image/png', 3 * 1024 * 1024],
    ['resume', 'application/pdf', 5 * 1024 * 1024],
  ]) {
    it(`accepts supported ${path} files through Cloudinary storage`, async () => {
      const response = await sendFile(path, type, 128);
      assert.equal(response.status, 201);
      const file = await response.json();
      assert.equal(file.size, 128);
      assert.equal(file.path, 'https://example.test/upload');
      assert.equal(upload.mock.callCount(), 1);
    });
    it(`rejects oversized ${path} files and removes partial uploads`, async () => {
      const response = await sendFile(path, type, limit + 1);
      assert.equal(response.status, 400);
      assert.equal((await response.json()).message, 'File is too large');
      assert.equal(destroy.mock.callCount(), 1);
    });
    it(`rejects unsupported ${path} files before storage`, async () => {
      const response = await sendFile(path, 'text/html', 128);
      assert.equal(response.status, 400);
      assert.equal((await response.json()).message, 'Unsupported file type');
      assert.equal(upload.mock.callCount(), 0);
    });
  }
});

it('builds notification mail without an external SMTP connection', async () => {
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true });
  const result = await transport.sendMail({
    from: 'JobBoard <sender@example.test>', to: 'candidate@example.test',
    subject: 'Application update', html: '<p>You have been invited.</p>',
  });
  assert.deepEqual(result.envelope.to, ['candidate@example.test']);
  assert.ok(Buffer.isBuffer(result.message));
  assert.match(result.message.toString(), /Subject: Application update/);
  assert.match(result.message.toString(), /You have been invited/);
});
