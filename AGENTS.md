# Frontend AIHN — ReactJS web

## Scope

React DOM + TypeScript strict + Vite. React Router owns routing, TanStack Query owns server state, Axios owns HTTP transport. Styling uses CSS/SVG from `design-reference/`. Native Android/iOS are outside this frontend's scope.

Implement one approved plan at a time. T00 builds the foundation; feature Pages belong to T01–T23. Stop for user review/commit after each plan. Never automatically commit, push, deploy or change backend contracts/scoring.

## Structure and ownership

- `src/app/`: providers, router composition and session/query lifecycle.
- `src/routes/`: route groups, lazy Page imports, guards, pending/error/404 states.
- `src/routes/paths.ts`: pure URL constants/builders, no application imports.
- `src/layouts/`: public/auth/student/admin shells and navigation.
- `src/modules/<domain>[/<group>]/`: pages, private components, domain API, queries and model/schema. Create folders when they have content.
- `src/shared/`: transport, session identity, storage, environment config, pure UI and CSS tokens.
- `src/assets/`: runtime images/SVG when a screen needs them.
- `tests/unit/` and `tests/e2e/`: real behavior and import-boundary fixtures.

Imports flow `app → routes → modules/layouts → shared`. Layouts/modules may import pure `routes/paths.ts`; shared may not import router/module/layout/app. Different root modules communicate through `modules/<domain>/index.ts`. Routes lazy import the actual Page instead of an eager all-Pages barrel. ESLint enforces these rules and runtime import cycles.

Do not introduce a global services/types/store folder, Nx, Module Federation, Redux or a UI framework without a concrete need. Form libraries belong to the first form plan, Socket.IO to Advisor. Server record types/schemas stay in their domain.

## Data/session

Session is a single source of truth. Query keys for personal data must include owner ID; pass query AbortSignal to HTTP. Discard responses from an obsolete session. Cancel/clear personal server state on account switch/logout; keep owner/version-scoped drafts. HTTP never navigates. Mutation retries/replays are disabled; unknown outcomes preserve the draft for explicit review/retry.

T02 implements auth hydration/login/refresh/logout: checked remember-me uses localStorage, unchecked uses sessionStorage; persist tokens/owner metadata only and verify current server identity on restore. Refresh is single-flight and only GET/HEAD may replay once. Same-account token rotation keeps its session revision/cache; account changes invalidate it. Admin workspace access remains closed until T18. A preview shell must never manufacture an authenticated user or grant access to protected routes.

`VITE_*` values are public client configuration, never secrets. Use `.env.example`; do not track real environment files.

## Commands

Use Node 24 (`.nvmrc`) and pnpm 10.33.2 as pinned in package.json; `pnpm-lock.yaml` is the active lockfile.

```bash
pnpm install --frozen-lockfile
pnpm run dev
pnpm run typecheck
pnpm run lint
pnpm run test:unit
pnpm exec playwright install chromium
pnpm run test:e2e
pnpm run build
pnpm run preview
```

`pnpm test` runs all active unit/browser tests. E2E builds and runs production preview itself, with an isolated browser context per test. Check 390×844, 768×1024, 1440×900, 320px and breakpoint boundaries 768/769, 1024/1025. Check keyboard/focus/scroll, deep links, honest loading/error/empty/unavailable states and palette isolation.

## Reference and legacy

`design-reference/` preserves the supplied 23-screen HTML/CSS/assets. It is excluded from the application bundle and Vite dev file serving. `legacy/expo/` preserves the previous source/config/tests for behavior comparison and recovery; it is outside the ReactJS source/build/test roots. Do not modify that archive during new screen work. The private pre-migration checkpoint also preserves staged/unstaged/untracked content and the Git index; preserve it until the user has reviewed and committed the migration.

Use current official React/Vite/React Router/TanStack/Axios docs when implementing their APIs. Changes to legacy Expo guidance are already superseded by the user's ReactJS migration decision.
