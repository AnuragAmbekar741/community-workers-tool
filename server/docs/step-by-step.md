# Server Step-by-Step Setup

Incremental guide for building `@server/`. Complete **one step at a time**, verify it works, then move on.

**Blueprint (architecture, ADRs, full templates):** [`../../server-setup.md`](../../server-setup.md)

**Living docs (current codebase):**

- [architecture.md](./architecture.md) — tech stack, folder structure, request lifecycle, DB layer
- [backend_rules.md](./backend_rules.md) — where code goes, errors, logging, validation, TypeScript rules

**Skills applied:**
- [Node.js Backend Patterns](../../.agents/skills/nodejs-backend-patterns/SKILL.md) — layered Express, env validation, logging, graceful shutdown, health checks
- [TypeScript Advanced Types](../../.agents/skills/typescript-advanced-types/SKILL.md) — strict config typing, `typeof` / `z.infer`, ESM `NodeNext`

---

## How to use this doc

1. Find the first step marked **TODO**.
2. Implement only that step (do not skip ahead).
3. Run the **Verify** commands.
4. Check off the step and commit if you use git.

Each step adds one concept. Production practices are noted per step — adopt them when that step is implemented, not before.

---

## Progress

| Step | Title | Status |
|------|-------|--------|
| 1 | Install dependencies | Done |
| 2 | TypeScript + ESM tooling | Done |
| 3 | Environment config (`env.ts`) | Done |
| 4 | Minimal Express server | Done |
| 5 | `app.ts` split + health module | Done |
| 6 | Production middleware stack | Done |
| 7 | Structured logging (Pino) | Done |
| 8 | Error handling (`lib/` + middleware) | Done |
| 9 | Drizzle ORM + Docker Postgres | Done |
| 10 | Repository + service layer | TODO |
| 11 | Request validation (Zod on routes) | TODO |
| 12 | Integration tests (Vitest + Supertest) | TODO |
| 13 | Auth (when needed) | TODO |

---

## Step 1 — Install dependencies

**Status:** Done

**Goal:** Install runtime and dev packages once. No application code yet.

**Production practice:** Pin versions via `package-lock.json`; use `"type": "module"` for ESM (matches client, Node 20+).

**Commands** (already run):

```bash
cd server

npm install express cors helmet compression zod dotenv drizzle-orm postgres pino pino-http express-rate-limit

npm install -D typescript @types/node @types/express @types/cors @types/compression tsx drizzle-kit pino-pretty vitest supertest @types/supertest
```

**Verify:**

```bash
npm ls --depth=0
```

**Reference:** [server-setup.md §4](../../server-setup.md#4-dependencies--install-commands)

---

## Step 2 — TypeScript + ESM tooling

**Status:** Done

**Goal:** Compiler config and npm scripts for dev and type-checking.

**Files:**

| File | Purpose |
|------|---------|
| `tsconfig.json` | `strict`, `NodeNext`, `rootDir: src`, `noUncheckedIndexedAccess` |
| `tsconfig.build.json` | Extends base; used later for `npm run build` |
| `.gitignore` | Ignore `node_modules/`, `dist/`, env secrets, logs |
| `package.json` | `"type": "module"`, `dev` + `typecheck` scripts |

**TypeScript practice:** `moduleResolution: "NodeNext"` requires `.js` extensions on relative imports in source (e.g. `./config/env.js`).

**Scripts:**

```json
"dev": "NODE_ENV=development tsx watch src/index.ts",
"typecheck": "tsc --noEmit"
```

**Verify:**

```bash
npm run typecheck
```

**Reference:** [server-setup.md §9](../../server-setup.md#9-scripts--workflows)

---

## Step 3 — Environment config (`env.ts`)

**Status:** Done

**Goal:** Load env files, validate with Zod, fail fast at boot, export typed `env`.

**Files:**

- `src/config/env.ts`
- `.env.example` (committed template, no secrets)

**Current schema:** `PORT` only (default `3000`). Add more vars in later steps — one group at a time.

**How loading works:**

1. `NODE_ENV` is set outside the app (npm script, shell, or deploy platform).
2. Try `.env.{NODE_ENV}` (e.g. `.env.development`), then fallback `.env`.
3. Zod parses `process.env` → exported `env`.

**Production practice:** Never read `process.env` outside `env.ts`. Invalid config → `process.exit(1)` before serving traffic.

**TypeScript practice:**

```typescript
export const env = parsed.data;
export type Env = typeof env; // or z.infer<typeof schema>
```

Prefer `typeof env` after parse so types match runtime defaults/coercion.

**Where `NODE_ENV` is set:**

| Context | Where |
|---------|--------|
| Local dev | `package.json` → `"dev": "NODE_ENV=development ..."` |
| Production | Host env vars (Railway, Render, Docker, etc.) |
| Optional | `.env` / `.env.development` (usually redundant with npm script) |

**Verify:**

```bash
npm run typecheck
# Optional: copy .env.example → .env.development and set PORT
```

**Reference:** [server-setup.md §5](../../server-setup.md#5-environment-variables-with-zod)

---

## Step 4 — Minimal Express server

**Status:** Done

**Goal:** Prove the stack runs: Express listens on `env.PORT`.

**Files:**

- `src/index.ts` — create app, one route, `app.listen(env.PORT)`

**Production practice (deferred to later steps):** Split `app.ts` vs `index.ts`, graceful shutdown, security middleware — intentional simplification for learning.

**Verify:**

```bash
npm run dev
curl http://localhost:3000/
# Expected: {"message":"Server running"}
```

Note: align `.env.example` `PORT` with your Zod default if you change either.

**Reference:** [server-setup.md §6](../../server-setup.md#6-core-file-templates) (minimal subset)

---

## Step 5 — `app.ts` split + health module

**Status:** Done

**Goal:** Learn modular layout: routes → controller → service, without a database.

**Why before Drizzle:** HTTP layer structure should exist before adding DB complexity.

**Files to create:**

```
src/
├── app.ts                          # createApp() — middleware + routes, no listen
├── index.ts                        # import createApp, listen, graceful shutdown (no DB yet)
├── routes/
│   └── index.ts                    # mount module routers under /api
└── modules/
    └── health/
        ├── health.routes.ts
        ├── health.controller.ts
        └── health.service.ts
```

**Production practice:**

- `app.ts` factory → import in tests without binding a port (Node.js backend patterns).
- Health endpoint → load balancers and uptime monitors ([skill #13]( ../../.agents/skills/nodejs-backend-patterns/SKILL.md)).

**Layer jobs:**

| Layer | Job |
|-------|-----|
| `health.routes.ts` | `GET /` on router |
| `health.controller.ts` | HTTP status + JSON |
| `health.service.ts` | `{ status: "ok", timestamp }` (DB ping added in Step 9) |

**Verify:**

```bash
npm run dev
curl http://localhost:3000/api/health
```

**Reference:** [server-setup.md §6 — health module](../../server-setup.md#6-core-file-templates)

---

## Step 6 — Production middleware stack

**Status:** Done

**Goal:** Security and HTTP basics on `app.ts`.

**Add to `app.ts`:**

- `helmet()` — security headers
- `cors({ origin: ... })` — after `CORS_ORIGINS` is in `env.ts`
- `compression()`
- `express.json({ limit: "1mb" })`
- `express-rate-limit` — stricter max in production
- `app.set("trust proxy", 1)` — behind reverse proxy

**Env expansion (this step):** add to `env.ts` + `.env.example`:

```typescript
NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
CORS_ORIGINS: z.string().transform(...).pipe(z.array(z.string().url())),
```

**Production practice:** No wildcard CORS in production ([server-setup ADR-005](../../server-setup.md#adr-005-separate-envdevelopment-and-envproduction)).

**Verify:** Server starts; CORS headers present on responses; rate limit headers when configured.

**Reference:** [server-setup.md §6 — app.ts](../../server-setup.md#srcappts--express-factory)

---

## Step 7 — Structured logging (Pino)

**Status:** Done

**Goal:** JSON logs in production; pretty logs in dev only.

**Files:**

- `src/config/logger.ts`
- Wire `pino-http` in `app.ts`

**Env expansion:**

```typescript
LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
```

**Production practice:** `pino-pretty` only when `NODE_ENV === "development"`. Prod logs → stdout as JSON for aggregation.

**Verify:** Request logs appear on each HTTP hit in dev.

**Reference:** [server-setup.md §6 — logger.ts](../../server-setup.md#srcconfigloggerts)

---

## Step 8 — Error handling

**Status:** Done

**Goal:** Centralized errors; async routes safe; 404 for unknown paths.

**Files:**

```
src/lib/errors.ts              # AppError, NotFoundError, ValidationError
src/lib/async-handler.ts
src/middleware/error-handler.ts
src/middleware/not-found.ts
src/middleware/validate.ts     # Zod for request body/query/params
```

**Production practice:** Unknown errors → log stack; generic message in production only (no leak). Operational errors use `AppError` with status codes.

**TypeScript practice:** Narrow errors with `instanceof AppError`; use `ValidationError` for Zod `issues` mapping.

**Verify:** Hit unknown route → 404 JSON; throw in handler → consistent error shape.

**Reference:** [server-setup.md §6](../../server-setup.md#6-core-file-templates), [nodejs-backend-patterns details](../../.agents/skills/nodejs-backend-patterns/references/details.md)

---

## Step 9 — Drizzle ORM + Docker Postgres

**Status:** Done

**Goal:** Postgres connection via Docker, Drizzle client, migration tooling, and health DB ping. Schema tables deferred to a later step.

**Prerequisite:** Docker running locally.

**Env expansion:**

```typescript
DATABASE_URL: z.string().url().startsWith("postgresql"),
```

**Files:**

```
docker-compose.yml              # local Postgres 16
drizzle.config.ts
src/db/index.ts                 # postgres.js pool + drizzle client + closeDb()
src/db/schema/index.ts          # empty placeholder (tables added later)
drizzle/meta/_journal.json      # empty migration journal (no SQL yet)
```

**Scripts added:**

```json
"db:up": "docker compose up -d",
"db:down": "docker compose down",
"db:logs": "docker compose logs -f postgres",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

**Production practice:** Connection pooling (`max` tuned per env); call `closeDb()` on graceful shutdown; SSL in production; fail-fast `SELECT 1` at boot; health returns 503 when DB is down.

**Verify:**

```bash
npm run db:up
# copy DATABASE_URL from .env.example into .env.development
npm run db:migrate
npm run typecheck
npm run dev
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"...","database":"ok"}
npm run db:down
```

**Reference:** [server-setup.md §7](../../server-setup.md#7-drizzle-orm-setup)

---

## Step 10 — Repository + service layer

**Status:** TODO

**Goal:** Services own business logic; repositories own Drizzle queries.

**Files (example feature):**

```
src/modules/users/
  users.repository.ts
  users.service.ts
  users.types.ts
```

**TypeScript practice:** Infer row types from Drizzle schema:

```typescript
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```

**Production practice:** Services do not import `db` directly — go through repository (testability, single data-access boundary).

**Verify:** Service method returns data from DB via repository.

**Reference:** [server-setup.md §7 — repository pattern](../../server-setup.md#repository-pattern-with-drizzle--usersrepositoryts)

---

## Step 11 — Request validation (Zod on routes)

**Status:** TODO

**Goal:** Validate HTTP input before controller logic.

**Files:**

```
src/modules/{feature}/{feature}.schema.ts   # Zod — request DTOs
```

Wire `validate(schema)` middleware on POST/PATCH routes.

**TypeScript practice:**

```typescript
export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
```

**Production practice:** Same Zod library for env and requests — one validation mental model.

**Verify:** Invalid body → 400 with field errors; valid body → 201.

---

## Step 12 — Integration tests

**Status:** TODO

**Goal:** Test HTTP layer without manual curl.

**Files:**

```
tests/integration/health.test.ts
```

Use Supertest against `createApp()` (not a bound port).

**Production practice:** Tests run with `NODE_ENV=test`; separate test DB or transactions where possible.

**Scripts:**

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Verify:**

```bash
npm test
```

---

## Step 13 — Auth (when needed)

**Status:** TODO

**Goal:** JWT + bcrypt when the product requires users.

**Env expansion:** `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_ROUNDS`

**Packages:** `jsonwebtoken`, `bcrypt` (+ types)

**Production practice:** Secrets min length validation in Zod; auth rate limiting; never return password hashes.

**Reference:** [server-setup.md §4 optional](../../server-setup.md#optional-add-when-needed)

---

## Production checklist (before deploy)

Use when Steps 5–9+ are done. Full list: [server-setup.md §10](../../server-setup.md#10-production-checklist)

- [ ] `NODE_ENV=production` set by host
- [ ] Secrets in platform manager (not git)
- [ ] CORS exact origins (no `*`)
- [ ] Migrations applied in CI/CD
- [ ] `/api/health` for load balancer
- [ ] Graceful shutdown (`SIGTERM` + `closeDb()`)
- [ ] JSON logs to stdout in prod

---

## Target folder layout (end state)

Build this **gradually** — only create folders when a step adds files inside them.

```
server/
├── docs/
│   └── step-by-step.md          ← this file
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── db/
│   │   ├── index.ts
│   │   └── schema/
│   ├── lib/
│   ├── middleware/
│   ├── modules/
│   ├── routes/
│   └── types/
├── drizzle/
└── tests/
```

**Reference:** [server-setup.md §2](../../server-setup.md#2-folder-structure)

---

## Quick commands (current project)

```bash
cd server
npm run db:up       # start Postgres (Docker)
npm run dev         # start with hot reload
npm run typecheck   # TypeScript check
npm run db:migrate  # apply migrations (no-op until schema exists)
npm run db:down     # stop Postgres
```

More scripts appear as you complete Step 12.
