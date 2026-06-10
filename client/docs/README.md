# Frontend Documentation

User journeys, screen specs, and planned routes for the Community Worker M&E Tool client.

## How this relates to other docs

| Doc | Purpose |
| --- | --- |
| [FE-GUIDELINES.md](../FE-GUIDELINES.md) | Code conventions — where files go, naming, types, API/hooks, design tokens |
| **This folder (`client/docs/`)** | Product UX — user flows, screen layouts, actions, and route map |
| [server/docs/prd.md](../../server/docs/prd.md) | Authoritative product requirements, RBAC, and API scope |
| [server/docs/db_schema.md](../../server/docs/db_schema.md) | Data model (`users`, `workers`, `sessions`) |
| [Postman collection](../../server/docs/dissertation-tool-api.postman_collection.json) | API endpoints and example payloads |

## Flow docs

| Doc | Scope |
| --- | --- |
| [Worker app flow](./flows/worker-app-flow.md) | Landing → register/login → worker home → session CRUD (read + delete only) |
| [Routes](./routes.md) | Planned URL map, auth guards, and feature folder mapping |

## Scope (current batch)

This documentation covers:

- **Shared entry:** landing page, worker registration, login (all three roles)
- **Worker app:** home screen, session list, new session, session detail (read-only + delete)

Out of scope for now:

- Supervisor dashboard screens (login redirect placeholder only)
- Admin dashboard screens (login redirect placeholder only)
