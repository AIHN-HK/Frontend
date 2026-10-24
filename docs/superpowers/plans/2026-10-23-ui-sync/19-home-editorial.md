# P19 — Public Home from the current OpenDesign editorial design

**Status:** Completed. Evidence: [P19](../../execution/ui-sync/P19.md).

**Commit:** `feat(ui): port editorial OpenDesign Home`.

## User intent and scope

After P18, the user corrected root entry to “home trc chứ?”, then asked to access OpenDesign again and implement the newer Home design. Preserve the in-progress root restoration and implement the source editorial Home in one verified local commit. Branch `feat/ui-sync-aihn-sequential` is checked out in `/home/hoang/do-an/Frontend`; preserve the old History stash and detached worktree. No backend changes, dependency changes, push or deploy.

Source project `/home/hoang/open-design/.od/projects/183966d9-0488-4ad3-ac9e-57774fc5a6ab/`: `screens/home.html`, `styles/aihn-editorial.css`, `styles/tokens.css`, `styles/global.css`, `styles/components.css`, `scripts/aihn-editorial-motion.js`. The editorial design is distinct from the older light Home currently in the app and from the 15 fixed-dark screens already ported. Do not alter original source.

## Implementation

- [x] Public `/` and compatible `/preview/home` render the new Home for guest, USER and ADMIN; existing auth/feature guards and destinations remain.
- [x] Preserve all ten source sections, typography and dark/light alternation with a private CSS Module and locally served fonts with OFL licenses.
- [x] Implement six keyboard-operable story steps and scoped GSAP scroll pin/crossfade; adapt reduced motion, mobile, short screens and cleanup on navigation.
- [x] Contrast header follows the current section; mobile menu supports focus, Escape, links and desktop resize.
- [x] Explicitly label illustrative data; replace prototype Likert/scoring/60-question copy with boolean demo and actual feature entry. No fabricated salary/market/personal data or simulated AI response. Advisor prompts link to the real guarded flow.
- [x] Remove old Home CSS and unused root redirect; keep public NotFound ownership and existing private/admin palettes.

## Acceptance

- [x] Compare source and runtime at 390×844, 768×1024, 1440×900; check 320px and responsive boundaries through 1600px, 44px controls, keyboard, no overflow and no page errors.
- [x] Typecheck, lint, unit tests, browser regression and production build pass; record actual results and any correction.
- [x] Record source hashes, screenshots, layout/content differences and evidence limits in `docs/superpowers/execution/ui-sync/P19.md`.
- [x] Review diff, stage only task files and commit locally.
