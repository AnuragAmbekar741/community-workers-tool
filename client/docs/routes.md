# Planned Routes

URL map, auth guards, and feature folder mapping for the client app. Implement when `react-router` is added.

**Related:** [Worker app flow](./flows/worker-app-flow.md) · [FE-GUIDELINES](../FE-GUIDELINES.md)

---

## Route table

| Path | Screen | Auth | Role guard |
| --- | --- | --- | --- |
| `/` | Landing | Public | — |
| `/register` | Worker registration | Public | — |
| `/login` | Login | Public | — |
| `/worker` | Worker home | JWT | `worker` |
| `/worker/sessions` | Session list | JWT | `worker` |
| `/worker/sessions/new` | New session | JWT | `worker` + approved |
| `/worker/sessions/:id` | Session detail | JWT | `worker` + own session |
| `/supervisor` | Supervisor overview | JWT | `supervisor` |
| `/supervisor/workers` | Assigned workers | JWT | `supervisor` |
| `/supervisor/sessions` | Worker sessions | JWT | `supervisor` |
| `/supervisor/analytics` | Analytics | JWT | `supervisor` |
| `/admin` | Admin overview | JWT | `admin` |
| `/admin/workers` | Worker approval | JWT | `admin` |
| `/admin/sessions` | All sessions (stub) | JWT | `admin` |

---

## Guard behavior

### Unauthenticated

- Any protected route → redirect to `/login`
- Store intended path for post-login redirect (optional)

### Wrong role

- Worker on `/supervisor` or `/admin` → redirect to `/worker`
- Supervisor on `/worker` or `/admin` → redirect to `/supervisor`
- Admin on `/worker` or `/supervisor` → redirect to `/admin`

### Pending worker

- `/worker/sessions/new` → show approval banner, block submit (or redirect to `/worker`)
- `POST /sessions` will fail server-side if not approved

### Token expiry (401)

- Call `POST /auth/logout` to clear HttpOnly cookie (optional if already expired)
- Invalidate React Query `me` cache
- Redirect to `/login`

### Own-session check

- `/worker/sessions/:id` — session must belong to logged-in worker
- Server enforces ownership; FE shows error if 403/404

---

## Post-login redirects

| Role | Default route |
| --- | --- |
| `worker` | `/worker` |
| `supervisor` | `/supervisor` |
| `admin` | `/admin` |

---

## Feature folder mapping

Per [FE-GUIDELINES](../FE-GUIDELINES.md), map routes to `src/features/`:

| Route | Feature folder |
| --- | --- |
| `/` | `src/features/landing/` |
| `/register` | `src/features/auth-register/` |
| `/login` | `src/features/auth-login/` |
| `/worker` | `src/features/worker-home/` |
| `/worker/sessions`, `/worker/sessions/new`, `/worker/sessions/:id` | `src/features/worker-sessions/` |
| `/supervisor`, `/supervisor/workers`, `/supervisor/sessions`, `/supervisor/analytics` | `src/features/dashboard/pages/supervisor/` |
| `/admin`, `/admin/workers`, `/admin/sessions` | `src/features/dashboard/pages/admin/` |

Shared dashboard shell (sidebar, header, nav): `src/features/dashboard/layout/`

Shared infrastructure (not feature folders):

- `src/api/` — HTTP functions
- `src/hooks/` — React Query hooks
- `src/types/` — DTOs
