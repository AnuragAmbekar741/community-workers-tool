# Dissertation Tool — Client

Vite + React 19 + TypeScript frontend for the Community Worker M&E Tool.

## Docs

- **[FE-GUIDELINES.md](./FE-GUIDELINES.md)** — frontend source of truth: styles, folder structure, naming, types, API/hooks, and component patterns

## Scripts

```bash
npm run dev      # start dev server
npm run build    # typecheck + production build
npm run preview  # preview production build
```

## API

Default API base URL: `http://localhost:3000/api` (override with `VITE_API_BASE_URL` in `.env.development`).

See [../server/docs/dissertation-tool-api.postman_collection.json](../server/docs/dissertation-tool-api.postman_collection.json) for endpoint reference.
