# Community Worker M&E Tool — Backend PRD

**Version:** 1.0
**Status:** Approved scope — open items reduced to listed TBDs in §13
**Owner:** Researcher / super admin
**Audience:** Backend developer building on the existing `@server/` scaffold
**Stack of record:** Express 5 + TypeScript (ESM) · PostgreSQL 16 · Drizzle ORM · postgres.js · Zod · Pino · `jose` (JWT)

**Related docs:** `community_worker_me_tool_spec.docx` (functional spec) · [db.schema.md](./db.schema.md) (**canonical schema**) · `architecture.md` · `backend_rules.md`

**Changes since v1.0:** auth resolved to JWT (DEC-4); worker PIN confirmed (DEC-2); worker approval lifecycle added — super admin is the sole gatekeeper who approves and assigns a supervisor in one action; supervisors do **not** authenticate workers; data-model section now references `db.schema.md` instead of duplicating it.

---

## 0. How to read this PRD

This document translates the functional spec into backend requirements that map onto the existing layered architecture. Every feature is a **module** under `src/modules/<name>/` (routes → controller → service → repository) following `backend_rules.md` (Zod at the boundary, `AppError` subclasses, repositories own all Drizzle queries, no `process.env` outside `config/env.ts`, no `any`, no TS `enum`).

The **schema is canonical in `db.schema.md`** — §7 here summarises intent only; column-level truth lives there.

Requirements use **MUST / SHOULD / MAY**. Items marked **[DEC]** are tracked in §13.

---

## 1. Product overview

A monitoring-and-evaluation (M&E) tool for a dissertation pilot in **one district in Botswana** (Mahalapye), partnered with **BONEPWA+** and a government partner. Community workers self-register; after super-admin approval they log every community session they facilitate. Supervisors and a single super admin (the researcher) view aggregated data; artefacts are designed to hand over to the government partner at pilot end.

**Defining design fact:** beneficiaries are **never individually identified**. Sessions record only _aggregate_ age/sex attendance counts. The only personal data the system holds is about the **workers and supervisors** — this removes the largest privacy-risk surface and must be preserved.

### 1.1 Success criteria

- A worker can register once, be approved, and then log sessions from a low-end Android phone, online or offline-then-synced.
- Supervisors see only their assigned workers; the super admin sees everything; enforced **server-side**, not just in the UI.
- All personal-data handling is defensible to a university ethics board and compliant with Botswana's Data Protection Act 18 of 2024.
- Exports (CSV/XLSX) and user/dropdown administration work end-to-end.

---

## 2. Goals and non-goals

### Goals

- Self-service worker registration → super-admin approval → session logging.
- Mobile-first session logging with server-computed totals and offline-safe submission.
- Scope-filtered, read-only dashboard for supervisors and super admin.
- Full super-admin administration: users, approval + supervisor assignment, dropdown lists, record edits.
- First-class compliance: consent records, audit log, data-subject-rights handling, breach-ready logging.

### Non-goals (this pilot)

- No beneficiary-level records of any kind.
- No automated worker-to-supervisor routing — assignment is a manual super-admin action.
- No supervisor-driven worker approval — the super admin is the sole gatekeeper.
- No multi-district tenancy (schema leaves room via `villages.district`, no logic).
- No worker-facing dashboard (data is already scoped by worker ID if added later).
- No native mobile app — the client is a mobile web form; this PRD covers the **API** only.

---

## 3. Users, roles and authentication

| Role                 | Authenticates via               | Token                                                          | Scope                 | Key powers                                                                                                       |
| -------------------- | ------------------------------- | -------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Community worker** | `worker_id` + 4-digit PIN       | Worker-scoped JWT, issued only when `approval_status = active` | Own submissions only  | Register once; after approval, log sessions; see own submission confirmation                                     |
| **Supervisor**       | Email + password                | JWT (`role: supervisor`)                                       | Assigned workers only | View dashboard + worker profiles (read-only); export own scope. **Cannot** approve, create, edit, or assign      |
| **Super admin**      | Email + password (+ 2FA SHOULD) | JWT (`role: super_admin`)                                      | Everything            | Approve workers + assign supervisor; CRUD users; edit dropdown lists; edit/delete sessions (audited); export all |

Permissions are strictly hierarchical. Authorization is enforced in middleware + service layers (§8), never only in the controller or client.

---

## 4. Compliance and data-protection requirements (first-class)

Governing law: **Botswana Data Protection Act 18 of 2024**, in force since 14 January 2025, GDPR-aligned, regulated by the Information and Data Protection Commission. Hard requirements:

- **C1 — Consent as a record.** Registration MUST write an immutable `consents` row (exact text, version, timestamp, scope: research / monitoring / cross-border transfer). A boolean is insufficient. Consent MUST be withdrawable (`withdrawn_at`).
- **C2 — Cross-border transfer.** Hosting outside Botswana is a regulated transfer (s.74). If the host region is not adequacy-listed, the system MUST rely on explicit transfer consent, captured as the `cross_border_transfer` consent scope. Hosting region is **[DEC-1]**; prefer in-country or an adequacy-listed region (e.g. South Africa) to avoid this.
- **C3 — Data-subject rights.** MUST support access (export a worker's data), rectification, erasure, restriction. `is_active = false` is **deactivation, not erasure** — a separate routine anonymizes/removes personal fields, sets `deleted_at`, and is audited.
- **C4 — Data minimization & by-default protection.** Phone numbers MUST be encrypted at rest and excluded from all dashboards/exports by default. Endpoints return only essential fields.
- **C5 — Audit log.** All supervisor/admin actions (login, export, edit, delete, approve, reject, assignment, consent change, erasure) MUST be written append-only to `audit_log`.
- **C6 — Breach readiness.** Logging + audit trail MUST support 72-hour breach notification to the Commission.
- **C7 — DPO.** Large-scale/sensitive processing requires a registered Data Protection Officer; confirm threshold with the ethics board (likely the researcher is named DPO).
- **C8 — Sensitivity by context.** Topics include SRH, GBV, safeguarding. `key_issues` free text MUST carry an on-form warning against identifying details, be access-restricted, and be included in erasure scope.
- **C9 — Retention.** A retention period + handover procedure MUST be agreed and implemented as a documented job at pilot end. **[DEC-5]**

Penalties are material (up to BWP 50 million or 4% of turnover). Separately, Botswana **health-research ethics clearance** and the **university IRB** gate processing of live data (outside this PRD, but blocking launch).

---

## 5. Functional requirements by module

Each subsection is one module folder; endpoints mount under `/api` via `src/routes/index.ts`.

### 5.1 `auth` (JWT — DEC-4 resolved)

- **FR-A1** Supervisor/super-admin login: `POST /api/auth/login` (email + password) verifies the hash and returns a signed JWT with claims `sub`, `role`, and `tv` (token version). Library: **`jose`** (ESM-native). Dashboard clients SHOULD store it in an **httpOnly cookie**. Writes an audit `login` event. Rate-limited harder than the global limiter.
- **FR-A2** Worker session login: `POST /api/auth/worker-session` (`worker_id` + `pin`) verifies `pin_hash` **and** that `approval_status = active`; only then issues a worker-scoped JWT (`role: worker`, `sub: worker_id`, `tv`). An unapproved worker can hold a PIN but gets no token.
- **FR-A3** `POST /api/auth/logout` clears the cookie / ends the session.
- **FR-A4** Verification middleware: `requireAuth` validates signature + expiry, then checks the `tv` claim against the row's `token_version`; a mismatch (bumped on deactivation, erasure, password/PIN reset) rejects the token → instant revocation despite stateless JWTs.
- **FR-A5** Failed-login throttling: increment `failed_login_count`, set `locked_until` after N failures.
- New error classes in `src/lib/errors.ts`: `UnauthorizedError` (401), `ForbiddenError` (403), `ConflictError` (409).

### 5.2 `workers`

- **FR-W1** `POST /api/workers/register` — public. Validates all required fields (§10), verifies `consent_given === true`, generates `worker_id`, writes the `consents` row (C1), sets `pin_hash`. New worker is created **`pending` and unlinked** (`supervisor_id = null`). Returns the `worker_id` for the confirmation screen; never returns phone or PIN.
- **FR-W2** `GET /api/workers/:id` — supervisor (own scope) / super admin. Read-only profile, phone excluded.
- **FR-W3** `GET /api/workers` — super admin (all) / supervisor (assigned only), filters: supervisor, village, role, active, **approval_status** (the admin's approval queue is `?approval_status=pending`).
- **FR-W4** `PATCH /api/workers/:id` — super admin only. Edit profile, deactivate (`is_active`). Audited.
- **FR-W5** Data-subject rights (super admin, audited): `GET /api/workers/:id/export`, rectify via FR-W4, `POST /api/workers/:id/erase` (anonymize, set `deleted_at`, bump `token_version`).
- **FR-W6** `villages_worked` is managed via the `worker_villages` join, not an array.

### 5.3 `sessions`

- **FR-S1** `POST /api/sessions` — worker JWT required (so `worker_id` comes from the token, not the body — closes the spoofing gap). Validates per §10. `total_reached` is DB-generated, never client-supplied. Returns a confirmation of what was recorded.
- **FR-S2** Offline sync: accepts a client-generated `client_submission_uuid` (UNIQUE) → idempotent; a re-sent submission returns the existing record. On sync after token expiry, the client re-mints a token via FR-A2 (PIN re-entry).
- **FR-S3** Submitted `village` MUST be one of the worker's registered villages (`worker_villages`) else `ValidationError`.
- **FR-S4** `GET /api/sessions` — supervisor (assigned workers' sessions) / super admin (all), dashboard filters (§5.4); `key_issues` access-restricted (C8).
- **FR-S5** `GET /api/sessions/:id` — full record, same scope rules.
- **FR-S6** `PATCH /api/sessions/:id`, `DELETE /api/sessions/:id` — super admin only, each audited.

### 5.4 `dashboard`

- **FR-D1** `GET /api/dashboard/summary` — metric cards: sessions count, people reached (Σ `total_reached`), active workers (logged ≥1 session this month / total assigned), distinct villages covered. Scope-filtered by role.
- **FR-D2** `GET /api/dashboard/charts` — sessions per month (12-month rolling), reach by demographic (six categories), sessions by topic (desc), reach by village (desc). Aggregated in SQL in the repository.
- **FR-D3** Filters (validated query params): `dateRange` (default last 90 days), `village[]`, `topic[]`, `worker[]` (denied/ignored for supervisors — pre-scoped).
- **FR-D4** Read-only.

### 5.5 `exports`

- **FR-E1** `GET /api/exports/sessions.csv` and `.xlsx` — both roles, scoped, same filters as dashboard.
- **FR-E2** First two rows MUST contain export timestamp + applied filters (spec §4.5).
- **FR-E3** Phone and restricted fields excluded (C4).
- **FR-E4** Each export writes an audit `export` event with filters in `metadata` (C5).
- **FR-E5** Large exports SHOULD stream.

### 5.6 `admin` (super admin only)

- **FR-AD1 — Approve + assign (single action).** `POST /api/workers/:id/approve { supervisor_id }` sets `approval_status = active`, stamps `supervisor_id` and `approved_at`, and writes an audit `approve` event. `POST /api/workers/:id/reject { reason? }` sets `rejected` (audited).
- **FR-AD2** Reassignment: `POST /api/workers/:id/assign { supervisor_id }` and bulk `POST /api/assignments/bulk { worker_ids[], supervisor_id }`. Audited.
- **FR-AD3** Supervisor management: `POST /api/supervisors` (create, issue credentials, set `type`), `GET /api/supervisors` (name, email, type, # assigned, last login), `PATCH /api/supervisors/:id` (edit, deactivate → bump `token_version`).
- **FR-AD4** All admin actions audited.

### 5.7 `reference-data`

- **FR-R1** CRUD + archive for villages, topics, roles, education levels, organizations.
- **FR-R2** Archiving keeps a value valid on existing records but removes it from new-submission options (spec §5.4).
- **FR-R3** Reads available to forms; writes super admin only, audited.
- **FR-R4** `roles`, `education_levels`, `organizations` are lookup tables; `sex` is a fixed CHECK set (DEC-3).

### 5.8 `audit`

- **FR-AU1** Append-only; a shared `recordAudit(actor, action, target, metadata)` helper is called from services (not controllers). App DB role has no UPDATE/DELETE grant on the table.
- **FR-AU2** `GET /api/audit` — super admin only, filterable, paginated, never editable via API.

---

## 6. API surface (summary)

| Method         | Path                               | Role                       | Notes                                    |
| -------------- | ---------------------------------- | -------------------------- | ---------------------------------------- |
| POST           | `/api/auth/login`                  | supervisor, admin          | password → JWT                           |
| POST           | `/api/auth/worker-session`         | worker (id+PIN)            | gated on `approval_status=active`        |
| POST           | `/api/auth/logout`                 | authenticated              |                                          |
| POST           | `/api/workers/register`            | public                     | → `pending`, unlinked, + consent         |
| GET            | `/api/workers`                     | supervisor (scoped), admin | filters incl. `approval_status`          |
| GET            | `/api/workers/:id`                 | supervisor (scoped), admin | profile                                  |
| PATCH          | `/api/workers/:id`                 | admin                      | edit/deactivate                          |
| POST           | `/api/workers/:id/approve`         | admin                      | approve + assign supervisor              |
| POST           | `/api/workers/:id/reject`          | admin                      |                                          |
| POST           | `/api/workers/:id/assign`          | admin                      | reassign                                 |
| POST           | `/api/assignments/bulk`            | admin                      | bulk reassign                            |
| GET            | `/api/workers/:id/export`          | admin                      | DSR access                               |
| POST           | `/api/workers/:id/erase`           | admin                      | DSR erasure                              |
| POST           | `/api/sessions`                    | worker (JWT)               | idempotent via uuid                      |
| GET            | `/api/sessions`                    | supervisor (scoped), admin | filters                                  |
| GET            | `/api/sessions/:id`                | supervisor (scoped), admin |                                          |
| PATCH/DELETE   | `/api/sessions/:id`                | admin                      | audited                                  |
| GET            | `/api/dashboard/summary`           | supervisor (scoped), admin | metric cards                             |
| GET            | `/api/dashboard/charts`            | supervisor (scoped), admin | series                                   |
| GET            | `/api/exports/sessions.csv\|.xlsx` | supervisor (scoped), admin | audited                                  |
| POST/GET/PATCH | `/api/supervisors`                 | admin                      | management                               |
| GET/POST/PATCH | `/api/reference/:list`             | read: forms / write: admin | villages, topics, roles, education, orgs |
| GET            | `/api/audit`                       | admin                      | append-only view                         |

---

## 7. Data model (intent — canonical in db.schema.md)

The full schema lives in [db.schema.md](./db.schema.md). Tables: `workers`, `worker_villages`, `sessions`, `supervisors`, `consents`, `organizations`, `roles`, `education_levels`, `villages`, `topics`, `audit_log`.

Design points the developer must preserve:

- **Worker lifecycle** on `workers`: `approval_status` (`pending` → `active`/`rejected`, default `pending`), `approved_at`, `supervisor_id` null until the approve-and-assign action. `is_active` and `deleted_at` are separate axes (deactivation, erasure).
- **Auth fields:** `pin_hash` on `workers`; `password_hash` on `supervisors`; `token_version` on **both** (JWT revocation hook).
- **`sessions.total_reached`** is `GENERATED ALWAYS AS (sum of the six n_*) STORED`; **`client_submission_uuid`** is UNIQUE (offline idempotency).
- **`consents`** is a record (text/version/scope/timestamps), not a boolean; `cross_border_transfer` scope only when DEC-1 lands on a non-adequate region.
- **Lookup tables** carry `is_archived`; editable sets are tables, fixed sets (`sex`, `approval_status`, audit/consent enumerations, `supervisor_type`) are CHECK constraints — no TS `enum`.
- **FKs:** `sessions.worker_id` uses `RESTRICT` so erasure is a deliberate anonymization, not a cascade that destroys M&E history.
- **IDs** (`CW####`, `SESS######`, `SUP###`) generated atomically via per-prefix Postgres sequences in the repository transaction.

---

## 8. Authorization model

- **Middleware:** `requireAuth` (valid JWT + `token_version` match) and `requireRole('super_admin' | 'supervisor' | 'worker')`.
- **Scope filtering is a service/repository concern**, not just a route guard. Supervisor queries are constrained to `supervisor_id = currentUser.id` at the query level — a supervisor cannot read another's workers even by guessing IDs.
- **Worker identity comes from the token** (`sub`), never the request body, on every worker-facing write.
- Controllers only invoke guards; they make no authorization decisions ("one concern per layer").

---

## 9. Non-functional requirements

- **Auth/JWT:** `jose` for signing/verification; httpOnly cookies for browser clients; short-ish access-token TTL with `token_version` revocation. Worker tokens get a generous TTL to survive offline capture, with PIN re-entry on sync to re-mint (FR-S2).
- **Mobile-first / offline:** idempotent session submission (FR-S2); server-side totals (FR-S1) so a flaky client can't corrupt aggregates; small payloads.
- **Security:** existing `helmet`, `cors` (allow-listed origins), `compression`, `express-rate-limit` stay. Add argon2id/bcrypt hashing (passwords + PINs), field-level encryption for `phone_encrypted`, HTTPS at the edge, optional super-admin 2FA. New secrets (`JWT_SECRET`/keys, `ENCRYPTION_KEY`, hashing cost) go through `config/env.ts` Zod schema + `.env.example` — never `process.env` elsewhere.
- **Logging:** Pino structured logs only; **never log phone, PIN, password, token, or full `DATABASE_URL`** (extends "no secrets in logs" to PII). Auto request logging via `pino-http` stays.
- **Errors:** domain failures throw `AppError` subclasses; only `errorHandler` formats responses; `{ status, message, errors? }` shape preserved.
- **Validation:** every write endpoint has a Zod schema via `validate()` at the boundary (§10).
- **Performance:** dashboard aggregations run in SQL with the indexes from db.schema.md; pilot scale is comfortable.

---

## 10. Consolidated validation rules (Zod at the boundary)

**Registration (FR-W1):** all listed fields required; `age` int 18–80; `sex` ∈ {F, M, PNS}; `role_other` required iff role = Other; `villages_worked` non-empty array of valid village IDs; `training_date` a valid date; `consent_given === true` (else reject); PIN is 4 digits, hashed before persistence; phone validated then encrypted.

**Session log (FR-S1):** all required fields present; `session_date` not in the future; `duration_min` int 10–300; each `n_*` int ≥ 0; **at least one `n_*` > 0**; `village_id` ∈ the worker's registered villages; `topic_other` required iff topic = Other. `total_reached` not accepted from client; `worker_id` taken from the JWT.

**Approve/assign (FR-AD1/2):** `supervisor_id` references an active supervisor; target worker is `pending` for approve, `active` for reassign.

**Filters (FR-D3):** `dateRange` valid + bounded; array filters contain known IDs; supervisor requests deny a `worker[]` filter outside scope.

Failures become `ValidationError` with the field-level `errors` array.

---

## 11. Implementation plan (mapped to your step model)

You're at Step 9; repositories arrive at Step 10. Build order, each a full module slice mirroring `health`:

1. **Schema + migrations** — all tables per db.schema.md → `db:generate` → review SQL → `db:migrate`. Seed reference-data lookups (placeholder villages/topics).
2. **`reference-data`** — needed by every form; simplest CRUD to prove the pattern end-to-end.
3. **`auth` + error classes + middleware** — `jose` issuance (password + worker-PIN routes), `requireAuth`/`requireRole`, `token_version` revocation. Add `UnauthorizedError`, `ForbiddenError`, `ConflictError`.
4. **`workers`** — registration (pending + consent + ID gen + PIN), profile reads, admin edit, DSR endpoints.
5. **`sessions`** — submission (generated total, idempotency, token-derived worker), reads, admin edit/delete.
6. **`admin`** — approve+assign, reassign, supervisor management.
7. **`dashboard`** — SQL aggregations + scope filtering.
8. **`exports`** — CSV/XLSX with header rows + audit.
9. **`audit` view** + **DSR/retention routines** (C3, C9) and the erasure/anonymization job.

Each PR follows the existing checklist (asyncHandler, Zod, AppError, no `process.env`/`console.log`/`any`, repository owns queries, `typecheck` passes).

---

## 12. Acceptance criteria (high level)

- A worker registers → row is `pending`, unlinked, with a `consents` row; no token is issued yet.
- A super admin approves with a `supervisor_id` → worker becomes `active`, linked, `approved_at` set, audit entry written; only then can the worker mint a session token.
- A worker submits a session offline twice with one `client_submission_uuid` → a single record stored; `worker_id` comes from the token.
- A supervisor cannot retrieve/approve/assign a worker outside their assignment, even by direct ID.
- Deactivating a supervisor or erasing a worker bumps `token_version` → their existing JWT stops working.
- An export contains timestamp + filter rows, excludes phone, and writes an audit entry.
- Admin session edit/delete and any assignment write audit entries.
- No endpoint returns phone or PIN; no log line contains PII or secrets.

---

## 13. Open decisions and assumptions

| #          | Decision                    | State                                                                    | Why it matters                                                                                  |
| ---------- | --------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **DEC-1**  | Hosting region              | **Open** — default in-country / adequacy-listed (e.g. ZA)                | Non-adequate region triggers s.74 cross-border consent (C2) + the `cross_border_transfer` scope |
| **DEC-2**  | Worker PIN                  | **Resolved — yes** (4-digit, hashed); gates worker JWT                   | Closes the worker-ID spoofing gap                                                               |
| **DEC-3**  | `sex` editable?             | **Resolved — fixed** CHECK set {F, M, PNS}                               | Table vs constraint                                                                             |
| **DEC-4**  | Auth mechanism              | **Resolved — JWT** (`jose`, httpOnly cookie, `token_version` revocation) | Drives the whole `auth` module                                                                  |
| **DEC-5**  | Retention period + handover | **Open** — TBD with ethics board                                         | C9 routine can't be built until set                                                             |
| **DEC-6**  | Admin viewing phone         | **Resolved — no** by default                                             | If ever yes, must be reason-logged + audited                                                    |
| **DEC-7**  | Final village + topic lists | **Open** — placeholders seeded                                           | Replace before launch (spec §8)                                                                 |
| **DEC-8**  | Languages                   | **Open** — default English only                                          | Local-language forms add i18n                                                                   |
| **DEC-9**  | DPO appointment             | **Open** — researcher likely DPO                                         | Confirm threshold (C7)                                                                          |
| **DEC-10** | Supervisor **types**        | **Open** — `supervisors.type` exists, **values TBD**                     | Confirm the two types; affects the CHECK set and assignment UI                                  |
| **DEC-11** | Persist `role` column?      | **Open** — role currently a JWT claim                                    | Decide whether to also store on `supervisors`                                                   |

---

## 14. Out of scope / future

- Worker-facing personal stats (easy later — data already scoped by worker ID).
- Multi-district / national scale-up (`villages.district` hook present).
- SMS/notification integrations.
- Native mobile app.
