# JobBoard frontend

React and TypeScript client for the JobBoard hiring platform, built with Vite.

See the [project README](../README.md) for features, architecture, environment variables, database/API setup, and a walkthrough of the candidate and employer workflow.

After configuring the project, run these commands from this directory:

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

The frontend expects the API at `http://localhost:4000` unless `VITE_API_URL` is set. Google and GitHub sign-in use the public client IDs in `.env.example`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Bundle the application into `dist` |
| `npm run preview` | Preview the built application locally |
| `npm run lint` | Run ESLint |
| `npx tsc -p tsconfig.app.json --noEmit` | Check application types separately from the Vite build |

Pages are in `src/pages`, reusable components in `src/components`, and feature state/API interactions in `src/hooks`. Authentication state lives in `src/context`, and the shared Axios client is in `src/lib/api.ts`.
