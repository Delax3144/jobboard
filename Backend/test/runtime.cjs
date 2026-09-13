// Stub external I/O before importing routes. Unexpected database calls fail closed.
const unexpected = async () => { throw new Error('Unexpected database call in isolated API test'); };
const prisma = Object.fromEntries(['user', 'job', 'application', 'message', 'savedJob'].map(model => [model,
  Object.fromEntries(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'updateMany', 'delete'].map(method => [method, unexpected])),
]));
const mailTransporter = { sendMail: unexpected };
for (const [path, exports] of [
  ['../dist/prisma', { prisma }],
  ['../dist/config/mailer', { mailTransporter }],
]) {
  const id = require.resolve(path);
  require.cache[id] = { id, filename: id, loaded: true, exports };
}
process.env.JWT_SECRET = 'test-only-secret-never-use-in-production';
module.exports = { prisma, mailTransporter };
