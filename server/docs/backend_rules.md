# Backend Rules

Source of truth for **where code goes** and **how to write it** in `@server/`. Follow these rules for every change.

**Related docs:**

- [architecture.md](./architecture.md) — folder structure, request lifecycle, dependencies
- [step-by-step.md](./step-by-step.md) — incremental build guide

**Skills basis:**

- [Node.js Backend Patterns](../../.agents/skills/nodejs-backend-patterns/SKILL.md)
- [TypeScript Advanced Types](../../.agents/skills/typescript-advanced-types/SKILL.md)

---

## Golden rules

1. **ESM imports use `.js` extensions** — `import { env } from "./config/env.js"`
2. **Never read `process.env` outside `config/env.ts`** — import the typed `env` object
3. **Never use `any`** — use `unknown` and narrow with type guards
4. **Throw `AppError` subclasses** — never call `res.status(4xx).json({ error })` for errors in controllers
5. **Only `errorHandler` formats error responses** — controllers and services throw; middleware responds
6. **Log via `logger`** — no `console.log` / `console.error` in `src/` (except env boot failure in `env.ts`)
7. **Wrap async route handlers in `asyncHandler`** — unhandled promise rejections must reach `errorHandler`
8. **One concern per layer** — routes wire, controllers translate HTTP, services decide, repositories query
9. **Validate at the boundary** — Zod schemas on incoming requests; env validated at boot
10. **No secrets in logs** — never log tokens, passwords, or full `DATABASE_URL`

---

## Where code goes

### Decision guide

| I need to… | Put it in… |
|------------|------------|
| Define an HTTP route | `modules/<name>/<name>.routes.ts` |
| Read req / set status / send JSON | `modules/<name>/<name>.controller.ts` |
| Implement business logic | `modules/<name>/<name>.service.ts` |
| Run Drizzle queries | `modules/<name>/<name>.repository.ts` (Step 10+) |
| Define a DB table | `src/db/schema/<table>.ts`, re-export from `schema/index.ts` |
| Add shared error class | `src/lib/errors.ts` |
| Add framework-agnostic helper | `src/lib/` |
| Add Express middleware | `src/middleware/` |
| Add env var or logger config | `src/config/` |
| Mount a module router | `src/routes/index.ts` |
| Wire middleware globally | `src/app.ts` |
| Boot server / shutdown | `src/index.ts` |

### Layer rules

#### Routes (`*.routes.ts`)

- Create a `Router()`, define paths, export it
- Always wrap handlers: `asyncHandler(getSomething)`
- Apply `validate(schema)` before the handler when input validation is needed
- No business logic, no direct DB access, no `res.json` with computed data

```typescript
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { getHealth } from "./health.controller.js";

export const healthRouter = Router();
healthRouter.get("/", asyncHandler(getHealth));
```

#### Controllers (`*.controller.ts`)

- HTTP translation only: extract from `req`, call service, set status, `res.json(...)`
- No Drizzle imports, no complex logic, no try/catch for expected errors (throw instead)
- Instantiate service once at module level (or inject in tests later)

```typescript
export async function getHealth(_req: Request, res: Response) {
  const status = await healthService.getStatus();
  const httpStatus = status.database === "error" ? 503 : 200;
  res.status(httpStatus).json(status);
}
```

#### Services (`*.service.ts`)

- Own business rules and orchestration
- Call repositories for data (Step 10+); today `health.service.ts` may call `db` directly for the ping
- Throw `AppError` subclasses for domain failures (`NotFoundError`, custom errors)
- Return plain data/objects — never touch `req` or `res`

#### Repositories (`*.repository.ts`) — Step 10+

- **Only place** that imports `db` and Drizzle query builders
- One repository per entity/feature
- Return typed rows; no HTTP concerns
- Enables mocking in service tests

#### `lib/`

- Framework-agnostic utilities: error classes, `asyncHandler`, shared types
- No Express imports unless the utility is Express-specific (like `asyncHandler`)

#### `config/`

- `env.ts` — sole owner of `process.env` access
- `logger.ts` — sole owner of the pino instance

#### `middleware/`

- Reusable Express middleware used across modules
- `error-handler.ts`, `not-found.ts`, `validate.ts` live here — not in `lib/`

---

## Error handling

### Error classes ([`src/lib/errors.ts`](../src/lib/errors.ts))

| Class | Status | When to use |
|-------|--------|-------------|
| `AppError` | configurable | Base class; extend for new operational errors |
| `NotFoundError` | 404 | Resource or route not found |
| `ValidationError` | 400 | Zod / input validation failure |

All extend `AppError` with `isOperational = true` by default.

### Flow

```
Service throws NotFoundError
  → asyncHandler catches rejected promise
    → next(err)
      → errorHandler formats JSON response
```

### Rules

- **Services and controllers throw** — they never send error responses directly
- **Use `next(err)` in middleware** — e.g. `validate.ts` passes `ValidationError` to `next`
- **Operational vs programmer errors:**
  - Operational (`AppError`, `isOperational: true`) — safe to expose message to client
  - Programmer (unexpected `Error`) — log full stack; return generic message in production
- **`errorHandler` is the only error responder** — consistent `{ status, message, errors? }` shape

### Adding a new error class

```typescript
// src/lib/errors.ts
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}
```

Use in service: `throw new ConflictError("Email already registered")`.

### Error response shape

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [{ "field": "body.email", "message": "Invalid email" }]
}
```

`errors` array only present for `ValidationError`.

---

## Logging

### Logger ([`src/config/logger.ts`](../src/config/logger.ts))

Import everywhere:

```typescript
import { logger } from "../config/logger.js";
```

### Structured logging (object first)

```typescript
// correct
logger.info({ port: env.PORT, env: env.NODE_ENV }, "Server started");
logger.error({ err, method: req.method, url: req.url }, "Unhandled error");

// wrong
logger.info("Server started on port " + env.PORT);
console.log("debug:", data);
```

### Log levels

| Level | Use for |
|-------|---------|
| `fatal` | Boot failure — server cannot start |
| `error` | Unhandled exceptions in `errorHandler` |
| `warn` | Recoverable issues, deprecation notices |
| `info` | Lifecycle events (server started, shutdown) |
| `debug` / `trace` | Dev-only detail (blocked in production env) |

### Request logging

Handled automatically by `pino-http` in `app.ts`. Do not manually log every request in controllers.

### What not to log

- Passwords, JWTs, API keys
- Full `DATABASE_URL` (contains credentials)
- PII unless explicitly required and redacted

---

## Validation

### Request validation ([`src/middleware/validate.ts`](../src/middleware/validate.ts))

Define Zod schemas colocated with the module (e.g. `users.schema.ts` or inline in routes file).

Schema shape must wrap request parts:

```typescript
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1),
  }),
});

router.post("/", validate(createUserSchema), asyncHandler(createUser));
```

Validation failures become `ValidationError` with field-level `errors` array.

### Environment validation

All env vars validated once in `config/env.ts`. To add a new var:

1. Add to Zod schema in `env.ts`
2. Add to `.env.example`
3. Add to your local `.env.development`

---

## Database access

### Client ([`src/db/index.ts`](../src/db/index.ts))

```typescript
import { db, type Db } from "../../db/index.js";
```

- **`db`** — Drizzle client instance
- **`Db`** — type alias for repositories and tests
- **`closeDb()`** — called on graceful shutdown only (from `index.ts`)

### Rules

- **Step 10+:** services call repositories; repositories call `db`
- **Never** run raw migrations in application code — use `npm run db:migrate`
- **Schema changes:** edit `src/db/schema/` → `db:generate` → review SQL → `db:migrate` → commit `drizzle/`
- **Health checks:** `db.execute(sql\`SELECT 1\`)` is acceptable in services for liveness probes
- **Transactions:** use Drizzle transaction API inside repositories when needed

### Schema files

```typescript
// src/db/schema/users.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", { /* ... */ });

// src/db/schema/index.ts
export * from "./users.js";
```

---

## TypeScript rules

Based on [TypeScript Advanced Types](../../.agents/skills/typescript-advanced-types/SKILL.md) and project `tsconfig.json`.

### Compiler settings (non-negotiable)

- `strict: true`
- `noUncheckedIndexedAccess: true` — array/object index access may be `undefined`
- `module: NodeNext` — ESM with `.js` import specifiers

### Type conventions

| Situation | Use |
|-----------|-----|
| Object shapes | `interface` (better error messages) |
| Unions, mapped, conditional types | `type` |
| Unknown external data | `unknown` + type guard — never `any` |
| Config objects | `satisfies` to validate shape while preserving inference |
| Env type | `export type Env = typeof env` after Zod parse |
| Drizzle client type | `export type Db = typeof db` |
| Inferred schema type | `typeof users.$inferSelect` / `$inferInsert` |

### `satisfies` example (from `db/index.ts`)

```typescript
const poolConfig = {
  max: env.NODE_ENV === "production" ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 10,
  ...(env.NODE_ENV === "production" && { ssl: "require" as const }),
} satisfies postgres.Options<Record<string, postgres.PostgresType>>;
```

### Discriminated unions for results

Prefer typed result shapes over throwing for expected outcomes when it improves readability:

```typescript
type DbStatus = "ok" | "error";

return {
  status: database === "ok" ? "ok" : "degraded",
  database,
};
```

### Avoid

- Type assertions (`as Foo`) unless unavoidable — prefer type guards
- `enum` — use string literal unions or `as const` objects
- Deeply nested conditional types — keep types readable

---

## Adding a new module

Example: adding a `users` feature. Mirror the `health` module pattern.

### 1. Create module files

```
src/modules/users/
  users.routes.ts
  users.controller.ts
  users.service.ts
  users.repository.ts    # Step 10+
  users.schema.ts        # Zod request schemas (optional separate file)
```

### 2. Routes

```typescript
// users.routes.ts
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { createUser, getUser } from "./users.controller.js";
import { createUserSchema } from "./users.schema.js";

export const usersRouter = Router();
usersRouter.post("/", validate(createUserSchema), asyncHandler(createUser));
usersRouter.get("/:id", asyncHandler(getUser));
```

### 3. Controller

```typescript
// users.controller.ts
import type { Request, Response } from "express";
import { UsersService } from "./users.service.js";

const usersService = new UsersService();

export async function createUser(req: Request, res: Response) {
  const user = await usersService.create(req.body);
  res.status(201).json(user);
}

export async function getUser(req: Request, res: Response) {
  const user = await usersService.findById(req.params.id);
  res.json(user);
}
```

### 4. Service

```typescript
// users.service.ts
import { NotFoundError } from "../../lib/errors.js";
import { UsersRepository } from "./users.repository.js";

export class UsersService {
  constructor(private repo = new UsersRepository()) {}

  async findById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}
```

### 5. Mount in router index

```typescript
// src/routes/index.ts
import { usersRouter } from "../modules/users/users.routes.js";

apiRouter.use("/users", usersRouter);
// → POST /api/users, GET /api/users/:id
```

### 6. Add DB schema (when ready)

Define table in `src/db/schema/users.ts`, export from `schema/index.ts`, run `db:generate` and `db:migrate`.

---

## Naming and imports

### Files

- **kebab-case** for multi-word module folders: `users/`, not `Users/`
- **Suffix convention:** `<name>.routes.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.repository.ts`
- **Schema files:** `<name>.schema.ts` for Zod; `src/db/schema/<table>.ts` for Drizzle tables

### Imports

Order (blank line between groups):

1. Node built-ins (`node:path`)
2. External packages (`express`, `zod`, `drizzle-orm`)
3. Internal absolute-from-src (`../../lib/errors.js`)

Always use `.js` extension on relative imports.

### Exports

- Prefer named exports over default exports
- Export router as `<name>Router` (e.g. `healthRouter`, `usersRouter`)

---

## Checklist before opening a PR

- [ ] New routes use `asyncHandler`
- [ ] Input validated with Zod where applicable
- [ ] Errors thrown as `AppError` subclasses, not manual `res.status().json()`
- [ ] No `process.env`, `console.log`, or `any` in new code
- [ ] Service has no direct `req`/`res` usage
- [ ] DB queries in repository (or documented exception for health-style probes)
- [ ] New env vars added to `env.ts` and `.env.example`
- [ ] `npm run typecheck` passes
