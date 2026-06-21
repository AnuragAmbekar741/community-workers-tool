# PRD — Community Worker M&E Tool

**Version:** 2.2 · Pilot scope
**Goal:** Workers log community sessions; supervisors view their workers' data; admin manages everyone.
**Principle:** Minimal — **3 tables** (`users`, `workers`, `sessions`), 3 roles, JWT-only auth, controlled lists as server constants.

---

## 1. Fixed entities

| Entity        | Count | How created                             |
| ------------- | ----- | --------------------------------------- |
| Admin         | 1     | Seeded at deploy (no organisation)      |
| Supervisor    | 2     | Seeded at deploy                        |
| Organisation  | 2     | Server constant (`org_a`, `org_b`)      |
| Village/Topic | Fixed | Server constants — locked before launch |
| Worker        | Many  | Self-register, then admin approves      |

---

## 2. Roles & RBAC

Three roles, enforced **server-side**. Every request carries a JWT with `{ userId, role }`.

| Capability                        | Worker | Supervisor | Admin |
| --------------------------------- | :----: | :--------: | :---: |
| Self-register                     |   ✅   |     —      |   —   |
| Log in (re-login on token expiry) | ✅\* |     ✅     |  ✅   |
| Add a session                     |  ✅\*  |     —      |   —   |
| View own sessions (list + detail) |   ✅   |     —      |   —   |
| Delete own session                |   ✅   |     —      |   —   |
| Update a session                  |   ❌   |     ❌     |  ✅   |
| View their workers (by id)        |   —    |     ✅     |  ✅   |
| View their workers' sessions      |   —    |     ✅     |  ✅   |
| Worker analytics                  |   —    |     ✅     |  ✅   |
| Download worker data as PDF       |   —    |     ✅     |  ✅   |
| Approve a worker                  |   —    |     —      |  ✅   |
| Assign worker to supervisor       |   —    |     —      |  ✅   |
| View ALL workers / ALL sessions   |   —    |     —      |  ✅   |
| Edit / delete any session         |   —    |     —      |  ✅   |

\* Only after `workers.status = approved`.

\* Workers may log in only after `workers.status = approved`. Session creation also requires approval.

**Middleware:** `requireAuth` (valid JWT) → `requireRole(...)` → ownership check (worker only own sessions; supervisor only workers where `supervisor_id = self`).

**Auth model:** login is **phone or system_id** plus **password** for everyone. Server returns a **JWT** in the login JSON (`{ user, token }`); the SPA stores it in **localStorage** and sends `Authorization: Bearer`. No refresh token — re-login when token expires. See [auth.md](./auth.md).

---

## 3. User management (lifecycle)

```
SEEDED                         WORKER SELF-SERVE FLOW
┌─────────┐                    ┌──────────┐  register   ┌──────────┐
│  Admin  │  (1, at deploy)    │  Worker  │ ──────────▶ │ pending  │
└─────────┘                    └──────────┘             └────┬─────┘
┌─────────┐                              admin approves      │
│Superv. 1│  (2, at deploy)         + assigns supervisor     ▼
│Superv. 2│                                            ┌──────────┐
└─────────┘                                            │ approved │ ─▶ can log sessions
                                                       └──────────┘
```

- Admin + both supervisors are seeded (no signup path for them).
- **Registration is workers-only.** Workers select their **organisation** at registration (not assigned by admin). Registration creates a `pending` account; workers **cannot** log in until admin approves.
- Approval and supervisor assignment are admin actions (can be done together). Admin assigns a supervisor only — not organisation.
- **Org mapping:** workers and supervisors both belong to an org. A worker picks their org at registration; admin assigns them to a supervisor **in the same org**.

---

## 4. Functional requirements by role

### Worker

- Create an account (self-register → `pending`; select organisation during registration).
- Log in after admin approval; re-login when token expires (phone or system_id).
- Add session details (once approved).
- View list of own sessions / view one session.
- Delete an own session.
- **Cannot** update a session.

### Supervisor (2 accounts only)

- Log in.
- Get their assigned workers (ids).
- Get sessions of their workers.
- View worker analytics.
- Download their workers' data as PDF.

### Admin (1 account)

- Log in.
- Approve a worker.
- Assign / reassign a worker to a supervisor.
- Get all workers (ids).
- Get all workers' session details.
- Edit / delete any session.

---

## 5. API endpoints (current scope)

> `🔓` public · `👤` worker · `🧑‍🏫` supervisor · `🛡️` admin. Access per the RBAC matrix; roles do not auto-inherit.
> **Path params:** `/admin/workers/:id` → a worker `system_id` (`CW0001`); `/sessions/:id` → a `session_id` (`SESS000001`).

### Auth

| Method | Path             | Access | Purpose                                     |
| ------ | ---------------- | ------ | ------------------------------------------- |
| POST   | `/auth/register` | 🔓     | **Worker-only** self-registration → pending (no token) |
| POST   | `/auth/login`    | 🔓     | Login (all roles) → `{ user, token }` |
| POST   | `/auth/logout`   | 🔓     | Client-side token clear; server returns `{ success: true }` |
| GET    | `/me`            | 👤🧑‍🏫🛡️ | Current user's own profile                  |

### Worker — sessions

| Method | Path            | Access | Purpose                               |
| ------ | --------------- | ------ | ------------------------------------- |
| POST   | `/sessions`     | 👤     | Add a session (approved workers only) |
| GET    | `/sessions`     | 👤     | List own sessions                     |
| GET    | `/sessions/:id` | 👤     | View one own session                  |
| DELETE | `/sessions/:id` | 👤     | Delete one own session                |

### Supervisor

| Method | Path                     | Access | Purpose                              |
| ------ | ------------------------ | ------ | ------------------------------------ |
| GET    | `/supervisor/workers`    | 🧑‍🏫     | List own assigned workers (ids)      |
| GET    | `/supervisor/sessions`   | 🧑‍🏫     | Sessions across own workers          |
| GET    | `/supervisor/analytics`  | 🧑‍🏫     | Aggregated analytics for own workers |
| GET    | `/supervisor/export.pdf` | 🧑‍🏫     | Download own workers' data as PDF    |

### Admin

| Method | Path                         | Access | Purpose                           |
| ------ | ---------------------------- | ------ | --------------------------------- |
| GET    | `/admin/workers`             | 🛡️     | List all workers (ids)            |
| PATCH  | `/admin/workers/:id/approve` | 🛡️     | Approve (or reject) a worker      |
| PATCH  | `/admin/workers/:id/assign`  | 🛡️     | Assign / reassign to a supervisor |
| GET    | `/admin/sessions`            | 🛡️     | All sessions across all workers   |
| PATCH  | `/admin/sessions/:id`        | 🛡️     | Edit any session                  |
| DELETE | `/admin/sessions/:id`        | 🛡️     | Delete any session                |

### Config

| Method | Path      | Access | Purpose                                                                                                |
| ------ | --------- | ------ | ------------------------------------------------------------------------------------------------------ |
| GET    | `/config` | 👤🧑‍🏫🛡️ | Returns the server constants (villages, topics, orgs, etc.) for dropdowns. Optional — UI may hardcode. |

---

## 6. Key validation rules

- `total_reached` auto-calculated; reject if all six attendance fields are 0.
- `session_date` cannot be in the future.
- `duration_min` between 10 and 300.
- `session.village` must be in the worker's `villages`.
- Worker registration requires `consent_given = true`.

---

## 7. Out of scope

- Worker self-service stats (data already scoped by worker).
- Editing constants via UI (they live in code).
- Multi-district scale-up, offline sync, multi-language, 2FA, per-worker PIN.

---

## 8. Open items

- **Final village + topic lists** — lock before launch (changing a constant = redeploy).
- Hosting platform (custom vs KoboToolbox/DHIS2).
- Data retention + handover procedure.
