# Verification record

Checked locally on 2026-09-13 with Node.js 22.15.0.

Final result: 10 frontend tests, 8 isolated backend tests, and 1 PostgreSQL integration scenario passed. Frontend lint, TypeScript, both builds, a clean frontend `npm ci`, and `git diff --check` passed. The final main frontend JavaScript chunk is approximately 444 kB (144 kB gzip), compared with approximately 956 kB before page splitting and dependency updates.

## Automated checks

- Frontend TypeScript and configured ESLint rules.
- Frontend production build, including TypeScript before bundling and lazy page loading.
- Frontend regression tests: employer Review → Invite, registration without premature login, 2FA challenge without a session, cleanup of legacy invalid tokens, separate conversations for separate applications, chat API failure handling, unread status notifications, email verification in StrictMode, and GitHub OAuth state validation.
- Isolated backend HTTP tests: supported status changes, ownership/role checks, unread notifications, password reset revocation for HTTP/socket authentication, acceptance of a new token, and rejection of a used reset token. Database and mail operations are replaced in these tests.
- PostgreSQL 16.14 integration: vacancy creation → application → duplicate rejection → ownership restriction → status changes → read markers → candidate message → cascade deletion. This test uses real Prisma/database operations; email delivery is replaced.
- All nine committed migrations applied successfully to fresh PostgreSQL databases.
- Demo seed executed twice: two users, four jobs, one application, and one message remained, with no duplicate records.

The temporary PostgreSQL instance used a separate local data directory and loopback port 55432. It was stopped after verification. The configured application database was not migrated or seeded during these checks.

## Running the checks

From the repository root:

```sh
npm --prefix Frontend run lint
npm --prefix Frontend test
npm --prefix Frontend run build
npm --prefix Backend test
```

For integration tests, create a dedicated PostgreSQL database named `jobboard_test`, point `DATABASE_URL` to it, apply migrations from `Backend/`, and run `npm run test:integration`. GitHub Actions provisions this database automatically.

## Dependency audit

The online npm audit after compatible dependency updates reports no backend advisories and no high or moderate frontend advisories. Two low-severity frontend entries remain for Quill and its React wrapper, referring to the same [HTML export advisory](https://github.com/advisories/GHSA-v3m3-f69x-jf25). The advisory lists no patched Quill version. JobBoard does not call `getSemanticHTML`; job descriptions are sanitized on the backend and with DOMPurify before display. This is a documented dependency limitation, not a claim that the upstream issue is fixed. No forced downgrade of the editor was applied.

## Before showing the deployed demo

- Apply committed migrations before starting the updated backend, then deploy both application builds.
- Run the README demo walkthrough using two browser profiles on the deployed version.
- Check live email delivery, Google/GitHub OAuth callbacks, Cloudinary uploads, and a real two-browser Socket.IO exchange with the deployment's credentials.

These local checks do not establish that the published website has been updated. They do not constitute a load test or a complete security audit. CI configuration was added locally; an actual GitHub Actions run requires pushing the changes.
