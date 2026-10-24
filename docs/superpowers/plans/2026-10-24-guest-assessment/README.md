# Guest Holland assessment and account handoff

User-approved flow: anonymous visitor completes the Boolean Holland assessment, sees a complete RIASEC summary, then signs up/logs in when requesting AI advice or a roadmap. The tab retains the draft through registration/OTP/login. Authenticated import stores one completed attempt, answers, result and snapshot in the user's database, then returns to the requested destination.

Branches: Frontend `feat/guest-assessment-onboarding` from merged main `3a1fe2f`; Backend same feature branch from working runtime `3f5f21d` (Backend main remains the old initial commit). Existing History stash is preserved. One local commit per completed plan; no push/deploy.

| Plan | Scope | Status |
| --- | --- | --- |
| G00 | Inspect contracts, select guest storage/import design and record execution boundaries | Completed |
| G01 | Public signed question catalog/result preview; authenticated atomic idempotent claim and lookup; migration and backend tests | Completed: Backend dd01ec6 |
| G02 | Public assessment and RIASEC result, sessionStorage draft, responsive source UI and guest tests | Completed |
| G03 | Signup/OTP/login return intent and explicit import recovery, account isolation and exact AI/roadmap destination | Completed |
| G04 | Full regression and integrated local browser/API/DB acceptance | Completed: [acceptance](../../execution/guest-assessment/G04.md) |

## Contract

- `GET /api/v1/guest-assessment/catalog`: signed, expiring frozen question/priority catalog; no guest database write.
- `POST /api/v1/guest-assessment/preview`: signed catalog plus complete unique Boolean answers; existing count/tie-break semantics produce scores, TopCode, snapshot and real analysis. Signed receipt stays in sessionStorage, no guest database write.
- `POST /api/v1/guest-assessment/claim`: authenticated receipt import, one atomic completed Attempt/Answer/Result/SnapShot and a unique durable claim. Same receipt/account returns the same attempt; another account or changed receipt conflicts.
- `GET /api/v1/guest-assessment/claim/:id`: authenticated reconciliation after unknown import outcome. Draft is retained until confirmed success; POST is never automatically replayed.
- Signed catalog/receipt lasts 24 hours. Edits/deletions to the question bank are detected before import. Keep the result visible and offer an explicit new test rather than silently mapping stale answers.
- Default guest storage is tab-scoped sessionStorage with an in-memory fallback and honest persistence notice. Passwords and OTP state retain the existing memory-only policy. Existing owned assessment and result routes remain guarded; private result IDs never become public.

## Completed commits and verification

- G00 Frontend `7f8ab15`: plan/contracts.
- G01 Backend `dd01ec6`: signed preview, claim/reconciliation, migration and backend regressions.
- G02 Frontend `a6dec3c`: public Holland/RIASEC and session draft.
- G03 Frontend `1c823a7`: auth return intent and durable import handoff.
- G04 Backend `062570e`: isolated real signup/import acceptance; Frontend final acceptance commit records final presentation/OTP-restart corrections and regression evidence.

Final gates: FE 166 unit tests, 531-case full browser run and 18-case final focused run (532 distinct current cases). BE 253 unit/security tests and 11 runtime cases. Integrated 108-question signup/OTP/login/import/idempotency/ownership checks passed. Both repositories retain local feature branches; no feature push/deploy.
