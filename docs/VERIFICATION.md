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

Rechecked on 2026-10-01 with Node.js 22.15.0 after updating Nodemailer to 10.0.13, Multer to 2.4.0, DOMPurify to 3.4.16, and affected transitive dependencies. All 102 frontend tests and 15 isolated backend tests passed, along with frontend lint, TypeScript, and both production builds. New checks cover multipart upload types and size limits, cleanup of partial uploads, mail generation without SMTP, and sanitization of rendered job descriptions. Cloudinary is replaced in upload tests; these checks do not verify live delivery or uploads. PostgreSQL integration tests were not rerun for this dependency update.

The online npm audit after compatible dependency updates reports no backend advisories and no high or moderate frontend advisories. Two low-severity frontend entries remain for Quill and its React wrapper, referring to the same [HTML export advisory](https://github.com/advisories/GHSA-v3m3-f69x-jf25). The advisory lists no patched Quill version. JobBoard does not call `getSemanticHTML`; job descriptions are sanitized on the backend and with DOMPurify before display. This is a documented dependency limitation, not a claim that the upstream issue is fixed. No forced downgrade of the editor was applied.

## Before showing the deployed demo

- Deploy the employer dashboard backend before its frontend. `GET /jobs/mine?page=1&search=...` returns five vacancies, matching-page totals, global employer statistics, application counts per vacancy, and at most five candidate previews per vacancy with names, profile IDs, application dates and stages. Search and pagination run on the server; the dashboard no longer loads `/applications/owner`. Requests without `page` retain the legacy jobs response. PostgreSQL checks cover owner isolation, search, equal-date ordering, draft vacancies, and preview limits when a vacancy has more than five applicants.
- PostgreSQL integration checks passed locally on 2026-10-02 using a fresh `jobboard_test` database on loopback port 55433 with all nine migrations. They cover the hiring flow, unread counts and read markers, conversation pages beyond the first 20 records, equal-date ordering, literal search with special characters, case-insensitive job search, own-message previews, and isolation between accounts. The temporary server was stopped after verification. The configured application database was not migrated or seeded.
- Deploy `/applications/conversations` before the chat frontend. It returns up to 20 conversations and `hasNextPage`, with server-side partner/job search and ordering by the latest message. Ownership and candidate visibility are checked on the server. Isolated frontend tests additionally cover request cancellation and resetting pagination when searching or changing accounts.
- Deploy `/applications/unread-count` on the backend before the navigation frontend. It returns an aggregate count of applications with incoming messages or role-specific updates after the read marker, without loading application bodies. PostgreSQL integration assertions cover isolation, read markers, own messages, and multiple messages in one conversation.
- Deploy message history support on the backend before the chat frontend. The chat requests `/applications/:id?history=recent` for the latest 50 messages; `/applications/:id/messages?before=<message-id>` loads earlier messages in batches of 50. Access and cursor membership are checked against the application. Legacy detail requests retain their response shape.
- Deploy the backend before the vacancy applicant pagination frontend. `GET /applications/job/:jobId?page=1&status=all` returns up to 20 applicants, the total across statuses, and `hasNextPage`. Vacancy ownership is checked before reading applications or statistics. The status filter runs in the database; changing a status refreshes the current page. Requests without `page` retain the legacy array response.
- Deploy the backend before the candidate application pagination frontend. `GET /applications/my?page=1` returns a page of up to 20 applications and statistics across all applications belonging to the authenticated candidate. Requests without `page` retain the legacy array response for chat and unread counters; those consumers and employer lists still need separate pagination work. Application pagination checks use isolated persistence, not the configured database.
- Deploy the backend and frontend job pagination changes together. Public `GET /jobs` returns up to 20 jobs plus `page`, `pageSize`, and `hasNextPage`; search, location, level, and salary filters are applied before pagination. The older frontend only reads the first page. Pagination tests use isolated persistence; the PostgreSQL integration scenario was not rerun for this change.
- Allow at least 15 seconds for the backend to stop in the process manager (PM2 `kill_timeout: 15000`). SIGINT/SIGTERM close Socket.IO and drain HTTP requests before closing Prisma and mail resources; the application forces an exit after 10 seconds if shutdown stalls.
- Apply committed migrations before starting the updated backend, then deploy both application builds.
- Run the README demo walkthrough using two browser profiles on the deployed version.
- Check live email delivery, Google/GitHub OAuth callbacks, Cloudinary uploads, and a real two-browser Socket.IO exchange with the deployment's credentials.

These local checks do not establish that the published website has been updated. They do not constitute a load test or a complete security audit. CI configuration was added locally; an actual GitHub Actions run requires pushing the changes.
