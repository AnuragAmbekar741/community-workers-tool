# Backend Step-by-Step Execution Plan

**Deliverable:** This document — [`server/docs/step-by-step-implementation.md`](./step-by-step-implementation.md).

**Current state (verified):** Steps 1–9 complete — Express 5 factory, production middleware, Pino logging, centralized errors, Drizzle + Postgres pool, `GET /api/health`. No tables, no auth, no business modules. Schema is an empty placeholder in [`server/src/db/schema/index.ts`](../src/db/schema/index.ts).

**Target:** PRD v2.2 — 3 tables, JWT auth, RBAC, 18 business endpoints + `/config`.

**Layer pattern (every model):**

```mermaid
flowchart LR
  Schema[Drizzle schema] --> Repo[Repository]
  Repo --> Service[Service]
  Service --> Controller[Controller]
  Controller --> Routes[Routes]
```

Per [backend_rules.md](./backend_rules.md): repositories own all `db` imports; services own business rules; controllers are HTTP-only; routes wire `asyncHandler` + `validate`.

---

## Progress tracker

| Phase | Title | Status |
|-------|-------|--------|
| 0 | Shared foundation (constants, auth utils, middleware) | TODO |
| 1 | `users` model — schema, repository, service, auth/me | TODO |
| 2 | `workers` model — schema, repository, service, admin/supervisor routes | TODO |
| 3 | `sessions` model — schema, repository, service, all session routes + PDF | TODO |
| 4 | Seed data + config endpoint | TODO |
| 5 | Integration tests + final verification | TODO |

---

## Phase 0 — Shared foundation (before models)

### Step 0.1 — Install auth packages

```bash
cd server
npm install bcrypt jsonwebtoken pdfkit
npm install -D @types/bcrypt @types/jsonwebtoken @types/pdfkit
```

### Step 0.2 — Extend env + errors

**Files:**

- [`server/src/config/env.ts`](../src/config/env.ts) — add `JWT_SECRET` (min 32 chars), `JWT_EXPIRES_IN` (e.g. `7d`), `BCRYPT_ROUNDS` (default 12)
- [`server/.env.example`](../.env.example) — document new vars
- [`server/src/lib/errors.ts`](../src/lib/errors.ts) — add `UnauthorizedError` (401), `ForbiddenError` (403), `ConflictError` (409)

**TypeScript:** `export type Env = typeof env`; use `satisfies` for config objects per skill.

### Step 0.3 — Server constants (single source of truth)

**New file:** `server/src/constants/index.ts`

Define `as const` objects + derived union types (no TS `enum`):

| Constant        | Values (from [db_schema.md](./db_schema.md)) |
| --------------- | -------------------------------------------- |
| `ORGANISATION`  | `org_a`, `org_b`                             |
| `ROLE`          | `worker`, `supervisor`, `admin`              |
| `GENDER`        | `female`, `male`, `prefer_not_to_say`        |
| `WORKER_ROLE`   | `CDO`, `SW`, `CHW`, `other`                  |
| `EDUCATION`     | `none` … `postgrad`                          |
| `VILLAGE`       | `village_a` … `village_e` (placeholder until locked) |
| `DISTRICT`      | Urban + rural census districts (see [db_schema.md](./db_schema.md#district-values)) |
| `TOPIC`         | `adolescence_youth_risk` … `other`           |
| `WORKER_STATUS` | `pending`, `approved`, `rejected`            |

Export Zod helpers: `zOrganisation`, `zVillage`, `zDistrict`, etc. for request validation.

**New file:** `server/src/lib/id-generator.ts` — `generateWorkerId()`, `generateSessionId()` (`CW0001`, `SESS000001` format; query max existing id in repository).

### Step 0.4 — Auth utilities + middleware

**New files:**

- `server/src/lib/password.ts` — `hashPassword`, `verifyPassword` (bcrypt)
- `server/src/lib/jwt.ts` — `signToken({ userId, role })`, `verifyToken`; payload type as discriminated union
- `server/src/middleware/require-auth.ts` — parse `Authorization: Bearer`, attach `req.user`
- `server/src/middleware/require-role.ts` — `requireRole("admin" | "supervisor" | "worker")`
- `server/src/types/express.d.ts` — augment `Request` with `user?: { userId: string; role: Role }`

**Verify:** `npm run typecheck`

---

## Phase 1 — `users` model

### Step 1.1 — DB layer: `users` schema

**New file:** `server/src/db/schema/users.ts`

| Column          | Drizzle type              | Notes                        |
| --------------- | ------------------------- | ---------------------------- |
| `system_id`     | `varchar` PK              | `CW0001` / `SUP01` / `ADMIN` |
| `name`          | `varchar` not null        |                              |
| `age`           | `integer` not null        |                              |
| `gender`        | `varchar` or pgEnum       | from constants               |
| `phone`         | `varchar` unique not null | login id                     |
| `organisation`  | `varchar` nullable        | null for admin               |
| `role`          | `varchar` not null        |                              |
| `password_hash` | `varchar` not null        |                              |
| `created_at`    | `timestamp` default now   |                              |

**Update:** [`server/src/db/schema/index.ts`](../src/db/schema/index.ts) — re-export `users`.

```bash
npm run db:generate && npm run db:migrate
```

**Verify:** `npm run db:studio` shows `users` table.

### Step 1.2 — Repository: `users`

**New file:** `server/src/modules/users/users.repository.ts`

Methods:

- `findById(systemId: string)`
- `findByPhone(phone: string)`
- `create(data: NewUser)` — used by seed + registration
- `listByRole(role)` — for admin listing supervisors

**Types:** `type User = typeof users.$inferSelect`, `type NewUser = typeof users.$inferInsert`

### Step 1.3 — Service: `users`

**New file:** `server/src/modules/users/users.service.ts`

Business rules:

- Phone uniqueness → throw `ConflictError`
- Admin has no `organisation`
- Supervisors/workers must have `organisation`
- Never return `password_hash` — map to public DTO

Methods: `findById`, `findByPhone`, `getPublicProfile(systemId)`, `createUser` (internal).

### Step 1.4 — Controller + routes: auth + `/me`

**New files:**

- `server/src/modules/auth/auth.schema.ts` — Zod: `loginSchema`, `registerSchema` (worker fields delegated to workers schema)
- `server/src/modules/auth/auth.service.ts` — orchestrates `UsersService` + `WorkersService` (register added in Phase 2)
- `server/src/modules/auth/auth.controller.ts` — `login`, `register`, `getMe`
- `server/src/modules/auth/auth.routes.ts` — `POST /register`, `POST /login`
- `server/src/modules/me/me.routes.ts` — `GET /` with `requireAuth`

**Mount in** [`server/src/routes/index.ts`](../src/routes/index.ts):

```typescript
apiRouter.use("/auth", authRouter);
apiRouter.use("/me", requireAuth, meRouter);
```

**Verify:**

```bash
curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"phone":"...","password":"..."}'
# After seed (Phase 4): returns JWT
curl http://localhost:3000/api/me -H "Authorization: Bearer <token>"
```

---

## Phase 2 — `workers` model

### Step 2.1 — DB layer: `workers` schema

**New file:** `server/src/db/schema/workers.ts`

| Column          | Notes                                 |
| --------------- | ------------------------------------- |
| `system_id`     | PK, FK → `users.system_id`            |
| `status`        | `pending` \| `approved` \| `rejected` |
| `supervisor_id` | FK → `users.system_id`, nullable      |
| `worker_role`   | enum constant                         |
| `education`     | enum constant                         |
| `district`      | enum constant (`district`)            |
| `villages`      | `text[]` or jsonb array               |
| `consent_given` | boolean not null                      |

Export from schema index; generate + migrate.

### Step 2.2 — Repository: `workers`

**New file:** `server/src/modules/workers/workers.repository.ts`

Methods:

- `create`, `findById`, `updateStatus`, `assignSupervisor`
- `listAll()` — admin
- `listBySupervisor(supervisorId)` — supervisor scope
- `getNextWorkerId()` — for `CW0001` generation

### Step 2.3 — Service: `workers`

**New file:** `server/src/modules/workers/workers.service.ts`

Business rules:

- Registration: `consent_given` must be `true` → else `ValidationError`
- `district` must be a valid `DISTRICT` constant
- Self-register creates `users` row + `workers` row with `status: pending` in a **transaction** (repository or service-orchestrated)
- Approve/reject: admin only; idempotent guards
- Assign supervisor: same `organisation` as worker; supervisor must have `role: supervisor`
- `assertApproved(workerId)` — used by sessions module
- `assertSupervisorOwnsWorker(supervisorId, workerId)` — RBAC helper

Wire `auth.service.register()` to call `WorkersService.registerWorker()`.

### Step 2.4 — Controllers + routes: admin worker management

**New files:**

- `server/src/modules/admin/admin.schema.ts` — approve body (`approved: boolean`), assign body (`supervisorId`)
- `server/src/modules/admin/admin.controller.ts`
- `server/src/modules/admin/admin.routes.ts`

| Method | Path                   | Handler             |
| ------ | ---------------------- | ------------------- |
| GET    | `/workers`             | list all worker ids |
| PATCH  | `/workers/:id/approve` | approve/reject      |
| PATCH  | `/workers/:id/assign`  | assign supervisor   |

**Mount:** `apiRouter.use("/admin", requireAuth, requireRole("admin"), adminRouter)`

**New files for supervisor:**

- `server/src/modules/supervisor/supervisor.controller.ts`
- `server/src/modules/supervisor/supervisor.routes.ts`

| Method | Path       | Handler              |
| ------ | ---------- | -------------------- |
| GET    | `/workers` | own assigned workers |

**Mount:** `apiRouter.use("/supervisor", requireAuth, requireRole("supervisor"), supervisorRouter)`

**Verify:** Register worker → login while pending → admin approve → assign → supervisor sees worker.

---

## Phase 3 — `sessions` model

### Step 3.1 — DB layer: `sessions` schema

**New file:** `server/src/db/schema/sessions.ts`

| Column                 | Notes                   |
| ---------------------- | ----------------------- |
| `session_id`           | PK `SESS000001`         |
| `worker_id`            | FK → `users.system_id`  |
| `session_date`         | date                    |
| `village`, `topic`     | enum constants          |
| `topic_other`          | nullable text           |
| `duration_min`         | int                     |
| `n_women` … `n_others` | int ≥ 0                 |
| `total_reached`        | int — computed on write |
| `key_issues`           | text nullable           |
| `created_at`           | timestamp               |

Generate + migrate.

### Step 3.2 — Repository: `sessions`

**New file:** `server/src/modules/sessions/sessions.repository.ts`

Methods:

- `create`, `findById`, `findByWorker(workerId)`, `findByWorkerIds(ids[])`
- `update(sessionId, data)`, `delete(sessionId)`
- `listAll()` — admin
- `getNextSessionId()`
- Analytics aggregation queries (counts by topic, village, date range) for supervisor

### Step 3.3 — Service: `sessions`

**New file:** `server/src/modules/sessions/sessions.service.ts`

Validation (PRD §6):

- `total_reached = sum(n_*)` — compute in service; reject if `=== 0`
- `session_date` not in future
- `duration_min` between 10 and 300
- `village` must be in worker's `villages`
- `topic_other` required when `topic === "other"`
- Worker create/delete: ownership check (`worker_id === req.user.userId`)
- Worker cannot update (throw `ForbiddenError`)
- Admin: full CRUD on any session
- Supervisor: read-only across assigned workers' sessions

Methods: `createForWorker`, `listOwn`, `getOwn`, `deleteOwn`, `listForSupervisor`, `listAll`, `updateAny`, `deleteAny`, `getAnalytics(supervisorId)`.

### Step 3.4 — Controllers + routes

**Worker sessions** — `server/src/modules/sessions/sessions.*`:

| Method | Path            | Middleware                                              |
| ------ | --------------- | ------------------------------------------------------- |
| POST   | `/sessions`     | `requireAuth`, `requireRole("worker")` + approved check |
| GET    | `/sessions`     | worker                                                  |
| GET    | `/sessions/:id` | worker + ownership                                      |
| DELETE | `/sessions/:id` | worker + ownership                                      |

**Admin sessions** — extend `admin.routes.ts`:

| Method | Path            |
| ------ | --------------- |
| GET    | `/sessions`     |
| PATCH  | `/sessions/:id` |
| DELETE | `/sessions/:id` |

**Supervisor** — extend `supervisor.routes.ts`:

| Method | Path          |
| ------ | ------------- |
| GET    | `/sessions`   |
| GET    | `/analytics`  |
| GET    | `/export.pdf` |

**PDF export:** `server/src/lib/pdf-export.ts` using pdfkit — supervisor-scoped worker + session data. Set `Content-Type: application/pdf`, `Content-Disposition: attachment`.

**Verify:** Full worker session CRUD; admin edit/delete; supervisor list + analytics + PDF download.

---

## Phase 4 — Seed data + config endpoint

### Step 4.1 — Seed script

**New file:** `server/src/db/seed.ts`  
**Script:** `"db:seed": "NODE_ENV=development tsx src/db/seed.ts"` in package.json

Seed at deploy:

- 1 admin (`ADMIN`) — no organisation
- 2 supervisors (`SUP01`, `SUP02`) — one per org (`org_a`, `org_b`)
- Bcrypt-hash passwords from env `SEED_PASSWORD` (dev only) or hardcoded dev default documented in `.env.example`

Use transaction; skip if already seeded (idempotent).

### Step 4.2 — Config module

**New files:**

- `server/src/modules/config/config.controller.ts` — returns all constants for UI dropdowns
- `server/src/modules/config/config.routes.ts` — `GET /` with `requireAuth`

**Mount:** `apiRouter.use("/config", requireAuth, configRouter)`

---

## Phase 5 — Cross-cutting hardening

### Step 5.1 — Refactor health to repository pattern (optional cleanup)

Move `db.execute` from [`health.service.ts`](../src/modules/health/health.service.ts) to `health.repository.ts` for consistency.

### Step 5.2 — Integration tests (Step 12)

**New files under `server/tests/integration/`:**

- `auth.test.ts` — register, login, /me
- `sessions.test.ts` — worker CRUD + validation failures
- `rbac.test.ts` — supervisor cannot see other supervisor's workers; worker cannot update session

**Scripts:** `"test": "vitest run"`, `"test:watch": "vitest"`

Use `createApp()` + Supertest; `NODE_ENV=test`; separate test DB URL.

### Step 5.3 — Final verification checklist

```bash
npm run db:up
npm run db:migrate
npm run db:seed
npm run typecheck
npm test
npm run dev
```

Manual curl matrix for all 18 PRD endpoints + `/config` + `/health`.

---

## Target module layout (end state)

```
server/src/
├── constants/index.ts
├── lib/
│   ├── id-generator.ts
│   ├── jwt.ts
│   ├── password.ts
│   └── pdf-export.ts
├── middleware/
│   ├── require-auth.ts
│   └── require-role.ts
├── db/
│   ├── seed.ts
│   └── schema/
│       ├── users.ts
│       ├── workers.ts
│       ├── sessions.ts
│       └── index.ts
└── modules/
    ├── auth/          # register, login
    ├── me/            # GET /me
    ├── users/         # repo + service (no public routes)
    ├── workers/       # repo + service
    ├── sessions/      # worker session routes
    ├── admin/         # admin workers + sessions
    ├── supervisor/    # supervisor workers, sessions, analytics, PDF
    ├── config/        # GET /config
    └── health/        # existing
```

---

## Endpoint → module mapping (PRD §5)

| Endpoint                           | Module     | Phase |
| ---------------------------------- | ---------- | ----- |
| `POST /auth/register`              | auth       | 1–2   |
| `POST /auth/login`                 | auth       | 1     |
| `GET /me`                          | me         | 1     |
| `POST/GET/DELETE /sessions`        | sessions   | 3     |
| `GET /supervisor/workers`          | supervisor | 2     |
| `GET /supervisor/sessions`         | supervisor | 3     |
| `GET /supervisor/analytics`        | supervisor | 3     |
| `GET /supervisor/export.pdf`       | supervisor | 3     |
| `GET /admin/workers`               | admin      | 2     |
| `PATCH /admin/workers/:id/approve` | admin      | 2     |
| `PATCH /admin/workers/:id/assign`  | admin      | 2     |
| `GET/PATCH/DELETE /admin/sessions` | admin      | 3     |
| `GET /config`                      | config     | 4     |
| `GET /health`                      | health     | done  |

---

## Conventions reminder (from skills + backend_rules)

- ESM `.js` import suffixes; no `any`; `unknown` + narrow
- Throw `AppError` subclasses; never `res.status().json({ error })` in controllers
- Zod at route boundary via `validate()`; infer types with `z.infer<typeof schema>["body"]`
- Drizzle types via `$inferSelect` / `$inferInsert`
- Transactions for multi-table writes (register, approve+assign)
- No secrets in logs; strip `password_hash` from all responses
- `requireAuth` → `requireRole` → ownership check (defense in depth)

---

## Suggested commit granularity

1. `feat: add shared constants, auth utils, and middleware`
2. `feat: add users schema, repository, and auth login/me`
3. `feat: add workers schema, registration, and admin/supervisor routes`
4. `feat: add sessions schema, worker CRUD, and validation rules`
5. `feat: add admin session management and supervisor analytics/PDF`
6. `feat: add seed script and config endpoint`
7. `test: add integration tests for auth, sessions, and RBAC`
