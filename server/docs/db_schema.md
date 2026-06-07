# Database Schema — Community Worker M&E Tool

**Version:** 2.2 (pilot scope)
**Tables:** 3 — `users`, `workers`, `sessions`
**Server constants (not tables):** organisation, role, gender, worker_role, education, village, district, topic.

---

## Design notes

- **`system_id` is THE identity key for every user** — workers, supervisors and admin. PK of `users`; all records reference it. No separate internal uuid.
  - Workers: `CW0001`, `CW0002`, … · Supervisors: `SUP01`, `SUP02` · Admin: `ADMIN`
- **Organisation mapping.** Both workers and supervisors carry `organisation` (on `users`; empty for admin). A worker is assigned to a supervisor **in the same org**, so the chain is **worker → supervisor → org**, with the worker's own `organisation` matching their supervisor's.
- **`users`** = the account every role shares. **`workers`** = worker-only profile, 1:1 with `users` (same `system_id`). **`sessions`** = the session log, referencing a worker by `system_id`.
- **Admin (1) + Supervisors (2) are seeded**; only workers self-register.
- Controlled lists live in server code (constants), not the DB.
- `total_reached` is computed on write from the six attendance fields.

---

## 1. `users` — base account for all roles

| Field         | Type      | Req  | Notes                                                                          |
| ------------- | --------- | ---- | ------------------------------------------------------------------------------ |
| system_id     | string    | PK   | Identity key. `CW0001` / `SUP01` / `ADMIN` (auto)                              |
| name          | string    | Yes  | Full name                                                                      |
| age           | int       | Yes  | Whole number                                                                   |
| gender        | enum      | Yes  | `female` \| `male` \| `prefer_not_to_say`                                      |
| phone         | string    | Yes  | Unique. **Login identifier**                                                   |
| organisation  | enum      | No   | `org_a` \| `org_b`. **Empty for admin.** Workers and supervisors both set this |
| role          | enum      | Yes  | `worker` \| `supervisor` \| `admin`                                            |
| password_hash | string    | Yes  | Hashed                                                                         |
| created_at    | timestamp | Auto |                                                                                |

---

## 2. `workers` — worker-only profile (1:1 with users)

| Field         | Type    | Req | Notes                                                                                  |
| ------------- | ------- | --- | -------------------------------------------------------------------------------------- |
| system_id     | string  | PK  | = users.system_id (FK, one-to-one). e.g. `CW0001`                                      |
| status        | enum    | Yes | `pending` \| `approved` \| `rejected`                                                  |
| supervisor_id | string  | No  | FK → users.system_id (a `SUP0x`, same org). Null until assigned                        |
| worker_role   | enum    | Yes | `CDO` \| `SW` \| `CHW` \| `other`                                                      |
| education     | enum    | Yes | none / primary / junior_sec / senior_sec / vocational / diploma / bachelors / postgrad |
| district      | enum    | Yes | `district` constant (urban or rural census district)                                   |
| villages      | enum[]  | Yes | Array of `village` constant values (one or more)                                       |
| consent_given | boolean | Yes | Must be `true` to register                                                             |

---

## 3. `sessions` — session log (created by workers)

| Field         | Type      | Req  | Notes                                                  |
| ------------- | --------- | ---- | ------------------------------------------------------ |
| session_id    | string    | PK   | `SESS000001` (auto)                                    |
| worker_id     | string    | Yes  | FK → users.system_id (a `CW000x`)                      |
| session_date  | date      | Yes  | Cannot be in the future                                |
| village       | enum      | Yes  | `village` constant. Must be in the worker's `villages` |
| topic         | enum      | Yes  | `topic` constant                                       |
| topic_other   | string    | No   | Only if topic = `other`                                |
| duration_min  | int       | Yes  | 10–300                                                 |
| n_women       | int       | Yes  | ≥ 0                                                    |
| n_men         | int       | Yes  | ≥ 0                                                    |
| n_girls       | int       | Yes  | ≥ 0 (under 18)                                         |
| n_boys        | int       | Yes  | ≥ 0 (under 18)                                         |
| n_elders      | int       | Yes  | ≥ 0 (60+)                                              |
| n_others      | int       | Yes  | ≥ 0                                                    |
| total_reached | int       | Auto | Sum of the six `n_*`. Must be > 0                      |
| key_issues    | text      | No   | Free-text follow-up notes                              |
| created_at    | timestamp | Auto |                                                        |

---

## Server constants (single source of truth, defined in code)

| Constant     | Values                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| organisation | org_a, org_b                                                                                                              |
| role         | worker, supervisor, admin                                                                                                 |
| gender       | female, male, prefer_not_to_say                                                                                           |
| worker_role  | CDO, SW, CHW, other                                                                                                       |
| education    | none, primary, junior_sec, senior_sec, vocational, diploma, bachelors, postgrad                                           |
| village      | village_a, village_b, village_c, village_d, village_e _(finalise before launch)_                                          |
| district     | See [District values](#district-values) below                                                                               |
| topic        | adolescence_youth_risk, puberty_body_changes, srh, relationships_gender_norms, consent_gbv, safeguarding_reporting, other |

### District values

Stored as snake_case slugs in code (e.g. `gaborone`, `kanye_moshupa`).

**Urban districts**

| Slug           | Label           |
| -------------- | --------------- |
| gaborone       | Gaborone        |
| francistown    | Francistown     |
| lobatse        | Lobatse         |
| selibe_phikwe  | Selibe Phikwe   |
| orapa          | Orapa           |
| jwaneng        | Jwaneng         |
| sowa_town      | Sowa Town       |

**Rural census districts**

| Slug                           | Label                          |
| ------------------------------ | ------------------------------ |
| kanye_moshupa                  | Kanye/Moshupa                  |
| barolong                       | Barolong                       |
| ngwaketse_west                 | Ngwaketse West                 |
| south_east                     | South East                     |
| kweneng_east                   | Kweneng East                   |
| kweneng_west                   | Kweneng West                   |
| kgatleng                       | Kgatleng                       |
| serowe_palapye                 | Serowe/Palapye                 |
| central_mahalapye              | Central Mahalapye              |
| central_bobonong               | Central Bobonong               |
| central_boteti                 | Central Boteti                 |
| central_tutume                 | Central Tutume                 |
| north_east                     | North East                     |
| ngamiland_east                 | Ngamiland East                 |
| ngamiland_west                 | Ngamiland West                 |
| chobe                          | Chobe                          |
| delta                          | Delta                          |
| ghanzi                         | Ghanzi                         |
| central_kalahari_game_reserve  | Central Kalahari Game Reserve  |
| kgalagadi_south                | Kgalagadi South                |
| kgalagadi_north                | Kgalagadi North                |

---

## Relationships

```
users.system_id ──1:1──▶ workers.system_id            (worker profile extends a user)
users.system_id ──1:many──▶ sessions.worker_id         (a worker logs many sessions)
workers.supervisor_id ──many:1──▶ users.system_id      (worker → supervisor, same org)
users.organisation ── shared by worker + supervisor    (worker's org = supervisor's org)
sessions.village / .topic, workers.villages / .district ── validated against server constants
```
