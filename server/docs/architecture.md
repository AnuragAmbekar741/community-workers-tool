# Server Architecture

Source-of-truth overview for `@server/`. Describes the codebase **as it exists today** (Steps 1–9 complete).

**Related docs:**

- [auth.md](./auth.md) — Bearer JWT auth contract
- [backend_rules.md](./backend_rules.md) — where code goes, error/logging/validation conventions
- [step-by-step.md](./step-by-step.md) — incremental build guide
- [../../server-setup.md](../../server-setup.md) — full blueprint and ADRs

**Skills basis:**

- [Node.js Backend Patterns](../../.agents/skills/nodejs-backend-patterns/SKILL.md)
- [TypeScript Advanced Types](../../.agents/skills/typescript-advanced-types/SKILL.md)

---

## Overview

The server is an **Express 5 + TypeScript (ESM)** API backed by **PostgreSQL** via **Drizzle ORM** and the **postgres.js** driver.

Key design choices:

| Decision | Rationale |
|----------|-----------|
| **Factory pattern** (`createApp()`) | App is created without binding a port — importable in tests |
| **Layered modules** | Routes → controller → service (→ repository in Step 10) |
| **Fail-fast config** | Zod validates env at boot; bad deploy never serves traffic |
| **Centralized errors** | All errors flow through `next(err)` → `errorHandler` |
| **Structured logging** | Pino + pino-http; no ad-hoc `console.log` in `src/` |
| **Bearer JWT auth** | Login returns `{ user, token }`; `requireAuth` reads `Authorization: Bearer` — see [auth.md](./auth.md) |

---

## Authentication flow

```mermaid
sequenceDiagram
  participant SPA as Vite_SPA
  participant LS as localStorage
  participant API as Express_API

  SPA->>API: POST /auth/login
  API->>SPA: user plus token JSON
  SPA->>LS: save token
  SPA->>API: GET /me Authorization Bearer
  API->>SPA: user profile
```

Browser clients store the JWT in `localStorage` and attach `Authorization: Bearer`. Postman/scripts use the same header with `token` from login JSON.

---

## Tech stack and dependencies

### Runtime

- **express** — HTTP server and routing
- **cors** — cross-origin requests (origins from `CORS_ORIGINS` env)
- **helmet** — security headers
- **compression** — gzip response bodies
- **express-rate-limit** — abuse protection (stricter in production)
- **zod** — env validation and request schema validation
- **dotenv** — load `.env.{NODE_ENV}` files at boot
- **drizzle-orm** — type-safe SQL ORM
- **postgres** — Postgres driver (postgres.js) with built-in connection pooling
- **pino** — structured JSON logging
- **pino-http** — automatic request/response logging middleware

### Dev

- **typescript** — strict type checking
- **tsx** — run TypeScript directly in dev (`npm run dev`)
- **drizzle-kit** — generate and apply SQL migrations
- **vitest** — unit/integration tests (Step 12)
- **supertest** — HTTP assertions in tests (Step 12)
- **pino-pretty** — human-readable logs in development
- **@types/\*** — TypeScript definitions for express, cors, compression, node, supertest

---

## Folder structure

```
server/
├── docker-compose.yml              # Postgres 16-alpine, healthcheck, named volume
├── drizzle.config.ts               # drizzle-kit config (loads .env.{NODE_ENV})
├── drizzle/
│   └── meta/
│       └── _journal.json           # empty migration journal (no SQL yet)
├── tsconfig.json                   # strict, NodeNext ESM, noUncheckedIndexedAccess
├── tsconfig.build.json             # production build (excludes tests)
├── package.json                    # scripts: dev, typecheck, db:*
├── .env.example                    # committed template
├── .env.development                # gitignored — local dev values
└── src/
    ├── index.ts                    # boot: DB ping → listen → graceful shutdown
    ├── app.ts                      # createApp(): middleware + routes (no listen)
    ├── config/
    │   ├── env.ts                  # Zod-validated env, fail-fast, export type Env
    │   └── logger.ts               # pino instance (+ pino-pretty in dev)
    ├── db/
    │   ├── index.ts                # postgres.js pool + drizzle client + closeDb()
    │   └── schema/
    │       └── index.ts            # empty placeholder (tables added later)
    ├── lib/
    │   ├── errors.ts               # AppError, NotFoundError, ValidationError
    │   └── async-handler.ts        # wraps async route handlers → next(err)
    ├── middleware/
    │   ├── error-handler.ts        # central error response formatter
    │   ├── not-found.ts            # 404 → NotFoundError
    │   └── validate.ts             # Zod body/query/params validator
    ├── routes/
    │   └── index.ts                # apiRouter — mounts module routers under /api
    └── modules/
        └── health/
            ├── health.routes.ts    # GET / on router
            ├── health.controller.ts
            └── health.service.ts
```

**Planned (not yet implemented):**

```
src/modules/<feature>/
  <feature>.repository.ts           # Step 10 — Drizzle queries only
tests/
  unit/
  integration/                      # Step 12
```

---

## Layered architecture

Each feature lives in `src/modules/<name>/`. Dependencies flow **downward only** — never import a controller from a service.

```mermaid
flowchart TD
  Client[Client]
  MW[Middleware stack]
  Router[Module router]
  Controller[Controller]
  Service[Service]
  Repo[Repository]
  DB[(PostgreSQL)]

  Client --> MW --> Router --> Controller --> Service
  Service --> Repo --> DB
  Service -.->|"health only today"| DB
```

| Layer | File suffix | Responsibility |
|-------|-------------|----------------|
| **Router** | `*.routes.ts` | Wire HTTP paths, apply `asyncHandler` and `validate` middleware |
| **Controller** | `*.controller.ts` | HTTP only: read req, call service, set status, send JSON |
| **Service** | `*.service.ts` | Business logic; orchestrates repositories |
| **Repository** | `*.repository.ts` | All Drizzle queries for one entity (Step 10) |
| **Schema** | `src/db/schema/` | Table definitions as code; versioned via drizzle-kit |

---

## Request lifecycle

```mermaid
sequenceDiagram
  participant Client
  participant Express
  participant MW as Middleware
  participant Router
  participant Controller
  participant Service
  participant DB

  Client->>Express: HTTP request
  Express->>MW: helmet, cors, compression
  MW->>MW: json parser, rate-limit
  MW->>MW: pino-http logging
  MW->>Router: /api/*
  Router->>Controller: asyncHandler(handler)
  Controller->>Service: business call
  Service->>DB: query (or SELECT 1 for health)
  DB-->>Service: result
  Service-->>Controller: data
  Controller-->>Client: JSON response

  Note over Router,Controller: On error
  Controller-->>Express: throw / next(err)
  Express->>MW: errorHandler
  MW-->>Client: JSON error response
```

**Middleware order in `app.ts` (matters):**

1. `trust proxy`
2. `helmet()`
3. `cors({ origin: env.CORS_ORIGINS })`
4. `compression()`
5. `express.json({ limit: "1mb" })`
6. `express.urlencoded({ extended: true })`
7. `rateLimit(...)` — 1000 req/15min dev, 100 prod
8. `pinoHttp({ logger })`
9. `/api` → `apiRouter`
10. `notFoundHandler` — catches unmatched routes
11. `errorHandler` — must be last

---

## Application bootstrap

[`src/index.ts`](../src/index.ts) is the entry point. [`src/app.ts`](../src/app.ts) is imported but never listens directly.

```
main()
  ├── db.execute(SELECT 1)     # fail-fast if DATABASE_URL is wrong
  ├── createApp()
  ├── app.listen(env.PORT)
  └── register SIGTERM / SIGINT handlers
        └── server.close()
              └── closeDb()    # drain postgres.js pool
                    └── process.exit(0)
```

Boot failure (bad env, DB unreachable) logs at `fatal` and exits with code 1.

---

## Configuration and environment

All config is validated in [`src/config/env.ts`](../src/config/env.ts).

**Loading order:**

1. `.env.{NODE_ENV}` (e.g. `.env.development`)
2. `.env` (fallback)

**Current env vars:**

| Variable | Type | Default | Notes |
|----------|------|---------|-------|
| `NODE_ENV` | `development \| production \| test` | `development` | Set by npm script in dev |
| `PORT` | number | `3000` | Coerced from string |
| `DATABASE_URL` | URL | required | Must start with `postgresql` |
| `CORS_ORIGINS` | URL[] | `http://localhost:5173` | Comma-separated |
| `LOG_LEVEL` | pino level | `info` | No debug/trace in production |

**Production refinements** (via `superRefine`):

- Reject `LOG_LEVEL=debug|trace`
- Reject wildcard `*` in `CORS_ORIGINS`

**Rule:** never read `process.env` outside `config/env.ts`. Import `env` everywhere else.

---

## Database layer

### Local Postgres (Docker)

```bash
npm run db:up      # start postgres:16-alpine
npm run db:down    # stop container
npm run db:logs    # tail postgres logs
```

Credentials (aligned with `.env.example`):

```
postgresql://dissertation:dissertation@localhost:5432/dissertation
```

If the container was previously initialized with different credentials, reset the volume:

```bash
npm run db:down -- -v && npm run db:up
```

### Connection pool ([`src/db/index.ts`](../src/db/index.ts))

| Setting | Development | Production |
|---------|-------------|------------|
| `max` | 3 | 10 |
| `idle_timeout` | 20s | 20s |
| `connect_timeout` | 10s | 10s |
| `ssl` | off | `require` |

Exports: `db` (Drizzle client), `Db` (type alias), `closeDb()` (pool teardown).

### Migrations

```bash
npm run db:generate   # diff schema → SQL in drizzle/
npm run db:migrate    # apply pending migrations
npm run db:studio     # Drizzle Studio UI
```

Schema tables are defined in `src/db/schema/` and exported from `schema/index.ts`. Currently empty — first table comes in a later step.

The empty `drizzle/meta/_journal.json` allows `db:migrate` to run as a no-op until real migrations exist.

---

## Scripts reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `NODE_ENV=development tsx watch src/index.ts` | Hot-reload dev server |
| `typecheck` | `tsc --noEmit` | TypeScript check without emit |
| `db:up` | `docker compose up -d` | Start local Postgres |
| `db:down` | `docker compose down` | Stop local Postgres |
| `db:logs` | `docker compose logs -f postgres` | Stream Postgres logs |
| `db:generate` | `drizzle-kit generate` | Generate migration SQL from schema |
| `db:migrate` | `drizzle-kit migrate` | Apply migrations to database |
| `db:studio` | `drizzle-kit studio` | Open Drizzle Studio |

---

## TypeScript configuration

[`tsconfig.json`](../tsconfig.json):

- `"module": "NodeNext"` — native ESM with `.js` import specifiers
- `"strict": true`
- `"noUncheckedIndexedAccess": true`
- `"rootDir": "src"`, `"outDir": "dist"`

Import rule: always use `.js` extensions in import paths (TypeScript ESM requirement).

```typescript
import { env } from "./config/env.js";   // correct
import { env } from "./config/env";     // wrong
```

---

## Conventions snapshot

For full rules see [backend_rules.md](./backend_rules.md).

- ESM with `.js` import specifiers
- No `process.env` outside `config/env.ts`
- No `any` — use `unknown` and narrow
- Throw `AppError` subclasses; never format error JSON in controllers
- Log via `logger` from `config/logger.ts`
- Async routes wrapped in `asyncHandler`
- Validate requests with Zod via `validate()` middleware
- Services do not import `db` directly (repositories in Step 10)
