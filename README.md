# JobBoard

**A full-stack hiring platform for tech candidates and employers.**

JobBoard brings job discovery, applications, candidate profiles, and employer communication into one workflow. Candidates can find roles and track responses; employers can publish vacancies, review applications, and continue the conversation through an application-linked chat.

[Website](https://www.jobboard.com.pl) · [Repository](https://github.com/Delax3144/jobboard) · [Local setup](#local-setup) · [Demo walkthrough](#demo-walkthrough)

![JobBoard banner](Frontend/public/og.png)

## Features

| Candidates | Employers |
| --- | --- |
| Search by job title or company; filter by location, seniority, and salary range | Create, edit, publish, archive, and delete vacancies; save drafts |
| Bookmark jobs and submit applications with a cover letter and optional CV | Review applications and candidate profiles for their own vacancies |
| Track application statuses: `new`, `invited`, and `rejected` | Invite or reject candidates, with email notifications on status changes |
| Maintain a profile with skills, experience, location, avatar, and resume | Add company logos, salary ranges, tags, and rich-text job descriptions |
| Follow up through an application-linked chat | Start conversations with applicants and receive new-application notifications |

Shared account features include email verification, password recovery, Google and GitHub sign-in, optional TOTP two-factor authentication, profile visibility settings, and configurable message notification sounds and toasts. English and Russian translation resources are included; some screens and messages still contain hardcoded text.

## Engineering highlights

- **Authorization at the API boundary.** JWT authentication, candidate/employer role checks, and ownership checks restrict job management, application details, and conversations to the relevant users.
- **Persistent chat with real-time delivery.** Messages are validated and stored through REST endpoints. Socket.IO authenticates each connection and delivers message and notification events to a room associated with the recipient's user ID.
- **Relational data integrity.** Prisma models users, jobs, applications, messages, bookmarks, and support tickets. Composite unique constraints prevent duplicate applications and bookmarks; migrations add query indexes and cascade deletion of dependent records.
- **Account protection.** Passwords are hashed with bcrypt. Email verification and password reset tokens are stored as SHA-256 hashes with expiration timestamps. Two-factor login uses a separate, short-lived challenge token.
- **Input and upload handling.** Zod validates request data, rich-text content is sanitized, and sensitive routes have rate limits. Uploads use file type and size restrictions, with Cloudinary asset cleanup on failed operations and supported replacement/deletion flows.
- **Separate UI and interaction logic.** React pages compose reusable components, while feature hooks handle API calls, filtering, forms, and chat state.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 7, React Router, Axios, CSS |
| UI features | i18next, React Quill, React Easy Crop, React Hot Toast |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL 16, Prisma 5, versioned SQL migrations |
| Real-time events | Socket.IO |
| Authentication | JWT, bcrypt, Google and GitHub OAuth, Speakeasy TOTP |
| Files and email | Cloudinary, Multer, Nodemailer with Gmail transport |
| Local infrastructure | Docker Compose for PostgreSQL |

## Architecture

The React client calls the Express REST API through Axios and receives live events through Socket.IO. Both protocols share one HTTP server. The API uses Prisma to access PostgreSQL, Cloudinary for uploaded files, and Nodemailer for account and application emails.

```text
Frontend/
  src/
    pages/          Application screens
    components/     Shared UI and feature components
    hooks/          Feature state and API interactions
    context/        Authentication state
    lib/            Axios client and user-mode helpers
    locales/        English and Russian translations
  vercel.json       SPA route rewrites
Backend/
  src/
    routes/         Authentication, jobs, applications, profiles, bookmarks
    middleware/     Authentication, authorization, rate limits, errors
    validation/     Zod request schemas
    lib/            Tokens, uploads, sanitization, and shared helpers
    socket/         Socket.IO authentication
    config/         CORS and email transport
  prisma/
    schema.prisma   Data model
    migrations/     Database migration history
  docker-compose.yml
```

An application connects one candidate to one job and owns the conversation history. A candidate cannot send the first message while the application is still `new`; the employer must send a message or change its status first.

## Local setup

### Prerequisites

- Node.js **22.12 or newer** and npm. The locked Vite version also supports Node.js 20.19+ within the 20.x release line.
- Docker with Compose, or an existing PostgreSQL instance.
- Gmail credentials for the configured email transport. Email/password registration requires email verification before login.
- Cloudinary credentials to exercise avatar, company logo, and CV uploads.
- Google and GitHub OAuth applications if you want to test social sign-in.

### 1. Install dependencies

```sh
git clone https://github.com/Delax3144/jobboard.git
cd jobboard
npm --prefix Backend ci
npm --prefix Frontend ci
```

### 2. Configure environment variables

Copy `Backend/.env.example` to `Backend/.env` and `Frontend/.env.example` to `Frontend/.env`, then fill in the values. Existing `.env` files should be preserved. The examples contain placeholders, not working service credentials.

**Backend**

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string; the example matches Docker Compose |
| `JWT_SECRET` | Secret used to sign access and two-factor challenge tokens |
| `PORT` | API and Socket.IO port; defaults to `4000` |
| `NODE_ENV` | Use `development` locally and `production` when deploying |
| `FRONTEND_URL` | Frontend origin used by CORS and email verification/reset links |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail address and app password for Nodemailer |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary upload credentials |
| `GOOGLE_CLIENT_ID` | Google client ID used to verify sign-in credentials |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth application credentials |

Generate a JWT secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

**Frontend**

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API and Socket.IO base URL; defaults to `http://localhost:4000` |
| `VITE_GOOGLE_CLIENT_ID` | Same Google client ID as the backend |
| `VITE_GITHUB_CLIENT_ID` | Same GitHub client ID as the backend |

For local OAuth, configure Google's authorized JavaScript origin as `http://localhost:5173` and GitHub's authorization callback URL as `http://localhost:5173/login`. Keep private service credentials in the backend environment: Vite variables are included in the browser bundle.

### 3. Start PostgreSQL and apply migrations

From the repository root:

```sh
docker compose -f Backend/docker-compose.yml up -d
cd Backend
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

The Compose file starts **only PostgreSQL**, exposed on port `5432`, with data persisted in a named volume. If using an existing database, skip the Docker command and set its connection string in `DATABASE_URL`. Apply migrations to a database dedicated to this project. No seed script or demo accounts are included.

### 4. Start the frontend

In another terminal, from the repository root:

```sh
cd Frontend
npm run dev -- --port 5173 --strictPort
```

Open [localhost:5173](http://localhost:5173). The API process responds at [localhost:4000/health](http://localhost:4000/health) with `{"ok":true}`; this endpoint does not check the database or external services.

Without email credentials, public job browsing can still be exercised, but newly registered email/password accounts cannot complete verification. File uploads and social sign-in require their respective service credentials. The mail transport currently uses Gmail; changing to another provider requires updating `Backend/src/config/mailer.ts`.

## Demo walkthrough

Use separate browser profiles for the employer and candidate sessions.

1. Register one employer and one candidate account, then verify both email addresses.
2. As the employer, create a published vacancy with a title, company, location, salary range, and description.
3. As the candidate, find the vacancy, save it, and submit an application. Attach a CV if Cloudinary is configured.
4. As the employer, open the vacancy's applications, inspect the candidate, and change the application status to `invited`.
5. Exchange messages between the two sessions to demonstrate stored conversations and real-time notifications.
6. Check the candidate's updated application status, then explore profile editing and optional two-factor authentication.

Accepted upload formats are JPEG, PNG, and WebP for images (up to **3 MiB**), and PDF, DOC, and DOCX for CVs (up to **5 MiB**).

## Development and deployment

Run these commands from the repository root:

| Command | Purpose |
| --- | --- |
| `npm --prefix Frontend run dev` | Start the Vite development server |
| `npm --prefix Frontend run build` | Bundle the frontend into `Frontend/dist` |
| `npm --prefix Frontend run preview` | Preview the frontend build locally |
| `npm --prefix Frontend run lint` | Run the configured ESLint checks |
| `npm --prefix Backend run dev` | Start the API with automatic restart |
| `npm --prefix Backend run build` | Compile the backend into `Backend/dist` |
| `npm --prefix Backend start` | Run the compiled backend |
| `npm --prefix Backend run prisma:migrate` | Create/apply development migrations |

The frontend build runs Vite without a separate TypeScript check. To check frontend types, run `npx tsc -p tsconfig.app.json --noEmit` from `Frontend/`; for backend types, run `npx tsc --noEmit` from `Backend/`.

For deployment, build the frontend with its public environment variables set and serve `Frontend/dist`. The included Vercel configuration rewrites SPA routes to `index.html`. Deploy the backend to a Node.js host that supports persistent Socket.IO connections, generate the Prisma client, apply committed migrations with `npx prisma migrate deploy` from `Backend/`, and run the backend build and start commands. Set `NODE_ENV=production` and `FRONTEND_URL` to the exact frontend origin; update the frontend API URL and OAuth configuration for the deployed domains.

## Current scope

- Job filtering runs in the browser after fetching published jobs; server-side search and pagination are not implemented.
- Automated tests and CI workflows are not included. The backend `test` script is a placeholder that exits with an error.
- Docker Compose provisions the database; application containers and a seed dataset are not included.
- Translation coverage is partial, and live email, OAuth, and upload flows depend on external services.

Natural next steps are integration tests for the hiring and authentication flows, server-side job search with pagination, and reproducible demo data.
