# Dissertation Tool — Client

Vite + React 19 + TypeScript frontend for the Community Worker M&E Tool.

## Docs

- **[FE-GUIDELINES.md](./FE-GUIDELINES.md)** — frontend source of truth: styles, folder structure, naming, types, API/hooks, and component patterns
- **[docs/](./docs/)** — user flows, screen specs, and planned routes
  - [Worker app flow](./docs/flows/worker-app-flow.md)
  - [Routes](./docs/routes.md)

## Scripts

```bash
npm run dev      # start dev server
npm run build    # typecheck + production build
npm run preview  # preview production build
```

## API

Auth uses **HttpOnly cookies** set by the server — see [../server/docs/auth.md](../server/docs/auth.md).

**Local dev:** `.env.development` sets `VITE_API_BASE_URL=/api`. Vite proxies `/api` to `http://localhost:3000` so cookies work same-origin. Start the server on port 3000 before using auth.

**Production (Amplify + Render):** Set Amplify build env `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api` and rebuild. On Render, set `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true`, and `CORS_ORIGINS` to your exact Amplify URL(s) (comma-separated, no trailing slash). Redeploy Render after env changes, then rebuild Amplify.

See [../server/docs/dissertation-tool-api.postman_collection.json](../server/docs/dissertation-tool-api.postman_collection.json) for endpoint reference.
