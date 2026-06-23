# Frontend Guidelines

Source of truth for **where code goes** and **how to write it** in `@client/`. Follow these rules for every change.

**Related docs:**

- [docs/flows/worker-app-flow.md](./docs/flows/worker-app-flow.md) — worker user journey and screen actions
- [docs/routes.md](./docs/routes.md) — planned URL map and route guards
- [../server/docs/auth.md](../server/docs/auth.md) — Bearer JWT auth contract
- [../server/docs/backend_rules.md](../server/docs/backend_rules.md) — server conventions and API error shapes
- [../server/docs/architecture.md](../server/docs/architecture.md) — server folder structure and request lifecycle
- [../server/docs/dissertation-tool-api.postman_collection.json](../server/docs/dissertation-tool-api.postman_collection.json) — API endpoints and example payloads

**Skills basis:**

- [TypeScript Advanced Types](../.agents/skills/typescript-advanced-types/SKILL.md)
- [Vercel React Best Practices](../.agents/skills/vercel-react-best-practices/SKILL.md)
- [UI/UX Pro Max](../.agents/skills/ui-ux-pro-max/SKILL.md)

---

## Golden rules

1. **Use design tokens** — brand color, typography scale, and shadcn CSS variables from `src/global.css`; no one-off hex values in components
2. **Never use `any`** — use `unknown` and narrow with type guards
3. **Types live in `src/types/`** — DTOs aligned with server Zod schemas and the Postman collection
4. **API calls in `src/api/` only** — components never call `fetch` directly
5. **Data fetching in `src/hooks/`** — React Query hooks wrap `api/` functions
6. **Import base components directly** — `@/components/base/button`, not barrel files
7. **Props are always typed** — suffix component props with `Props` (e.g. `LoginFormProps`)
8. **Validate at the boundary** — Zod for user input and external data before processing
9. **Stable list keys** — use entity `id`, never array index
10. **Side effects in event handlers** — not in `useEffect` for user interactions

---

## 1. Style and typography

### Brand palette

| Token                  | Value                  | Usage                                    |
| ---------------------- | ---------------------- | ---------------------------------------- |
| **Brand / primary**    | `#D73F09`              | CTAs, links, active states, focus rings  |
| **Foreground**         | `zinc-800` (`#27272a`) | Body text, headings on light backgrounds |
| **Background**         | `#ffffff`              | Page and card surfaces                   |
| **Primary foreground** | `#ffffff`              | Text on brand buttons                    |
| **Muted text**         | `zinc-500` (`#71717a`) | Secondary labels, descriptions           |
| **Border**             | `zinc-200` (`#e4e4e7`) | Inputs, cards, dividers                  |

These map to shadcn CSS variables in `src/global.css`:

```css
--primary: #d73f09;
--primary-foreground: #ffffff;
--foreground: #27272a;
--background: #ffffff;
--muted-foreground: #71717a;
--border: #e4e4e7;
```

Semantic Tailwind aliases (via `@theme inline`):

| Class                     | Token                         |
| ------------------------- | ----------------------------- |
| `bg-brand` / `text-brand` | `--color-brand` (`#D73F09`)   |
| `text-ink`                | `--color-ink` (`#27272a`)     |
| `bg-surface`              | `--color-surface` (`#ffffff`) |

Prefer shadcn semantic classes (`bg-primary`, `text-foreground`, `text-muted-foreground`) in components. Use `brand` / `ink` / `surface` only when you need explicit brand references outside the default token mapping.

**Light mode is the default for v1.** Dark mode CSS variables exist for future use; do not build dark-mode-specific UI until explicitly requested.

### Font

- **Family:** Roboto Variable (`font-sans`, `font-heading`) — loaded via `@fontsource-variable/roboto` in `global.css`
- **Weights used:** 400 (body), 500 (labels/buttons), 600 (headings) — do not load or use other weights
- **Fallback:** `system-ui, sans-serif`
- Do not mix arbitrary font families in feature code
- `font-sans` and `font-heading` both resolve to Roboto (single-family system)

### Typography scale

Pick from this table only. Do not invent ad-hoc `text-*` / `font-*` combinations.

| Token      | Element               | Size | Weight | Line-height | Tailwind (allowed)        |
| ---------- | --------------------- | ---- | ------ | ----------- | ------------------------- |
| `display`  | Marketing hero only   | 32px | 600    | 1.25        | `text-display`            |
| `title-lg` | `h1` page title       | 24px | 600    | 1.3         | `text-2xl font-semibold`  |
| `title-md` | `h2` section          | 18px | 600    | 1.35        | `text-lg font-semibold`   |
| `title-sm` | `h3` subsection       | 16px | 600    | 1.4         | `text-base font-semibold` |
| `body`     | `body`, `p`           | 16px | 400    | 1.5         | `text-base font-normal`   |
| `body-sm`  | tables, compact lists | 14px | 400    | 1.5         | `text-sm font-normal`     |
| `label`    | form labels, `th`     | 14px | 500    | 1.4         | `text-sm font-medium`     |
| `caption`  | hints, timestamps     | 12px | 400    | 1.4         | `text-xs font-normal`     |
| `button`   | buttons               | 14px | 500    | 1.0         | `text-sm font-medium`     |

**Base body is 16px** (`text-base`) on all viewports — required for mobile readability and to prevent iOS input zoom.

**14px (`text-sm`)** is allowed only in compact contexts: table cells, badges, dense metadata, buttons. Never use `text-sm` for primary paragraph text on mobile forms.

Base typography is applied globally in `global.css` `@layer base` (`h1`–`h3`, `p`, `body`). Feature components should rely on defaults and only add layout/spacing classes.

#### Forbidden typography classes

Do **not** use these in feature code:

- Arbitrary sizes: `text-[15px]`, `text-[0.8rem]` (except inside base components)
- Out-of-scale sizes: `text-xl`, `text-3xl`, `text-4xl` (use `text-display` for hero only)
- `font-bold` on body text (use `font-semibold` on headings only)
- Arbitrary `leading-*` overrides unless documented in this file

### Border radius

Three-tier token system defined in `global.css` `@theme inline`:

| Token       | Value | Use                                        | Tailwind class |
| ----------- | ----- | ------------------------------------------ | -------------- |
| `radius-sm` | 4px   | checkbox, chips, tags, select items        | `rounded-sm`   |
| `radius-md` | 6px   | inputs, buttons, select triggers, popovers | `rounded-md`   |
| `radius-lg` | 8px   | cards, dialogs                             | `rounded-lg`   |

Base components map to these tiers:

| Component                                   | Radius class |
| ------------------------------------------- | ------------ |
| `Button`, `Input`, `Select` trigger/content | `rounded-md` |
| `Card`                                      | `rounded-lg` |
| `Checkbox`, `Select` items                  | `rounded-sm` |

#### Forbidden radius classes

- `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- `rounded-full` (except avatars)
- Arbitrary `rounded-[Npx]`

### Mobile-first rules

Worker screens are primarily mobile. Follow these rules on every page:

- **Base text 16px** — never shrink body text below 16px on forms
- **No horizontal scroll** — use `max-w-full` on containers; page shells use `overflow-x-hidden` on `body`
- **Viewport height** — use `min-h-dvh`, not `min-h-screen` / `100vh`
- **Breakpoints** — mobile-first: default → `sm:` (640px) → `md:` (768px) → `lg:` (1024px)
- **Touch targets** — base `Button` uses `px-3 py-1.5` globally; `Input` default remains compact (`h-8`)
- **Form labels** — always visible; never placeholder-only labels
- **Errors** — show below the related field, not only at page top
- **Padding** — page content uses `p-4` minimum on mobile; avoid edge-to-edge text

### Design enforcement checklist (pre-PR)

- [ ] Only allowed `text-*` / `font-*` from the typography scale
- [ ] Only `rounded-sm` / `rounded-md` / `rounded-lg`
- [ ] No raw hex in components (use semantic tokens: `bg-primary`, `text-foreground`, etc.)
- [ ] No barrel imports from `components/base`
- [ ] Tested at 375px width — no overflow or layout break

---

## 2. Folder structure

```
client/src/
├── api/                    # Raw HTTP functions (no React)
│   ├── client.ts           # fetch wrapper, base URL, auth header
│   ├── auth-api.ts
│   └── me-api.ts
├── hooks/                  # React Query hooks (consume api/)
│   ├── use-login.ts
│   └── use-me.ts
├── types/                  # DTOs aligned with server API
│   ├── auth.ts
│   └── user.ts
├── components/
│   └── base/               # shadcn primitives
├── features/               # Feature-specific UI (kebab-case folders)
│   └── auth-login/
│       └── LoginForm.tsx
├── lib/
│   └── utils.ts
└── global.css
```

### Where code goes

| I need to…                     | Put it in…                     |
| ------------------------------ | ------------------------------ |
| Call an HTTP endpoint          | `src/api/<domain>-api.ts`      |
| Expose data to components      | `src/hooks/use-<thing>.ts`     |
| Define request/response shapes | `src/types/<domain>.ts`        |
| Reusable UI primitive          | `src/components/base/`         |
| Feature-specific screen/widget | `src/features/<feature-name>/` |
| Framework-agnostic helper      | `src/lib/`                     |

---

## 3. Naming conventions

- **Folders:** `kebab-case`
  - e.g. `task-tab`, `auth-login-form`, `crm-lead-csv-upload-container`

- **Component files:** `PascalCase`
  - e.g. `LoginForm.tsx`, `ImportExportDropdown.tsx`

- **Type & interface names:** `PascalCase`; prefix props with `Props`
  - e.g. `LoginRequest`, `AuthResponse`, `SearchBarProps`

- **Functions & variables:** `camelCase`
  - e.g. `handleSubmit`, `filteredWorkers`, `handleTagSelection`

- **API files:** `kebab-case` with `-api` suffix
  - e.g. `auth-api.ts`, `me-api.ts`

- **Hooks:** `use` prefix; file in `kebab-case`
  - e.g. `use-login.ts` exporting `useLogin`

---

## 4. Type safety and data access

- Define DTOs in `src/types/` aligned with server Zod schemas (e.g. `server/src/modules/auth/auth.schema.ts`) and the Postman collection
- **Avoid `any`**; use concrete types or `unknown` with narrowing
- Use optional chaining for nested API data: `user?.systemId`
- Use `Partial<T>` for PATCH bodies; `Pick<T, K>` for partial field updates
- Validate user-uploaded or external data with **Zod** before processing

### Example

```typescript
// src/types/auth.ts
export type LoginRequest = {
  phone: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: UserDto;
};

// src/api/auth-api.ts
import { api } from "./client";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", body);
  return data;
}

// src/hooks/use-login.ts
import { useMutation } from "@tanstack/react-query";
import { login } from "@/api/auth-api";

export function useLogin() {
  return useMutation({ mutationFn: login });
}
```

### Narrowing `unknown` API errors

```typescript
function isApiError(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}
```

---

## 5. Component and UI patterns

- Use design system components from `src/components/base/` — `Button`, `Input`, `Form`, `Card`, `Select`, `Checkbox`, etc.
- Reuse feature components where possible; avoid duplication
- Keep components focused — extract logic into hooks (`useXYZ`) if complex
- Props should always be typed explicitly (`LoginFormProps`)
- Avoid large `.map()` render logic inline — extract row/item subcomponents
- Always use sensible keys like `id`; never use array index as keys
- Keep JSX readable — break long expressions into variables or subcomponents
- Import directly: `import { Button } from "@/components/base/button"` (no barrel files)
- Derive display values during render, not in `useEffect`
- Put click/submit side effects in event handlers, not effects

### Example component

```tsx
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { useLogin } from "@/hooks/use-login";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    login.mutate(
      {
        phone: String(formData.get("phone") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
      { onSuccess },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input name="phone" placeholder="Phone" />
      <Input name="password" type="password" placeholder="Password" />
      <Button type="submit" disabled={login.isPending}>
        Sign in
      </Button>
    </form>
  );
}
```

---

## 6. API and React Query

### Install (once per project)

```bash
npm install @tanstack/react-query
```

### Provider setup (`src/main.tsx`)

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

### `api/client.ts` — axios instance (Bearer JWT auth)

JWT is stored in **localStorage** (`auth_token:v1`) and attached via an axios request interceptor.

```typescript
import axios from "axios";
import { toApiError } from "@/lib/api-error";
import { onUnauthorized } from "@/lib/auth-unauthorized";
import { getAuthToken } from "@/lib/auth-token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      if (!url.endsWith("/auth/login")) {
        onUnauthorized();
      }
    }
    return Promise.reject(toApiError(error));
  },
);
```

Register the unauthorized handler once at app boot in `main.tsx` (before render):

```typescript
import { meKeys } from "@/hooks/use-me";
import { clearAuthToken } from "@/lib/auth-token";
import { registerUnauthorizedHandler } from "@/lib/auth-unauthorized";

registerUnauthorizedHandler(() => {
  clearAuthToken();
  queryClient.removeQueries({ queryKey: meKeys.all });
  window.location.assign("/login");
});
```

This clears the JWT, drops the cached `me` query, and redirects to `/login` so the sidebar does not show a stale user after token expiry.

- Dev: Vite proxies `/api` → `http://localhost:3000` (no `VITE_API_BASE_URL` needed)
- Production: set `VITE_API_BASE_URL` to the deployed API (e.g. `https://community-workers-tool.onrender.com/api`); ensure the server's `CORS_ORIGINS` includes the client origin
- Auth state: `GET /me` via `useMe()` — 200 = logged in, 401 = not
- Logout: clear token from localStorage, `POST /auth/logout`, invalidate `me` query cache

See [../server/docs/auth.md](../server/docs/auth.md).

### Layer rules

**`api/` — transport only**

- One file per domain (`auth-api.ts`, `me-api.ts`)
- Pure `async` functions returning typed DTOs
- No React imports

**`hooks/` — React Query only**

- `useQuery` for GET (e.g. `useMe`)
- `useMutation` for POST / PATCH / DELETE (e.g. `useLogin`)
- Export query key constants: `export const meKeys = { all: ["me"] as const }`
- Components consume hooks; they never import from `api/` directly

### Query key convention

```
["domain"]                 — list
["domain", id]             — detail
["domain", id, "nested"]   — nested resource
```

### Example: `useMe`

```typescript
// src/hooks/use-me.ts
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/me-api";

export const meKeys = {
  all: ["me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: meKeys.all,
    queryFn: getMe,
  });
}
```

### Data flow

```
Component → useLogin (hook) → login (api) → Express API
                ↓
         onSuccess / error / isPending
```

Components must not call `fetch` directly. All server communication goes through `api/` and is consumed via `hooks/`.

---

## 7. Performance rules

Relevant checklist from Vercel React best practices for this Vite SPA:

| Rule                  | Practice                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| Request deduplication | React Query deduplicates in-flight queries with the same key                |
| Barrel imports        | Import from `@/components/base/button`, not `@/components/base` index       |
| Functional setState   | Use `setItems((curr) => ...)` for stable callbacks in lists/forms           |
| Lazy state init       | `useState(() => expensiveInit())` for costly initial values                 |
| Bearer auth           | Store JWT in `localStorage`; attach `Authorization` header via axios interceptor |
| Derive during render  | Compute filtered/sorted lists during render with `useMemo` when expensive   |
| Event handlers        | Put submit/click logic in handlers, not `useEffect`                         |

### Direct imports (required)

```typescript
// Good
import { Button } from "@/components/base/button";

// Bad — barrel file (don't create index.ts in components/base)
import { Button } from "@/components/base";
```

### Adding shadcn components

The shadcn CLI may write to a literal `@/` folder. Always pass an explicit path:

```bash
npx shadcn@latest add <component> -p src/components/base -y -o
```

---

## Environment variables

| Variable            | Default                     | Purpose              |
| ------------------- | --------------------------- | -------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Express API base URL |

Add to `client/.env.development` (gitignored) as needed:

```
VITE_API_BASE_URL=http://localhost:3000/api
```
