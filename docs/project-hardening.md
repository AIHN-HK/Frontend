# Project hardening — 2026-10-19

Branch `fix/project-hardening` starts at local main and merges the existing React UI
baseline without rewriting history. User explicitly authorized grouped commits.

Removed fabricated personal exam countdown/target/score and unimplemented 40/30/30
admission algorithm claims. Restored source-driven, labeled preview career,
recommendation and roadmap pages; previews never imply verified salary/admissions.
Public Home and account profile now describe actual capabilities and limitations.
Kept the current layout on active account/test/result/chat pages. Fixed accessible
Holland controls and status, restored explicit chat connection alongside first-question
connection, corrected mobile shrinking/touch targets. Home GSAP lifecycle has scoped
cleanup, explicit destinations, and always-accessible CTAs.

Validation: typecheck, zero-warning lint, 18 unit files / 153 tests, build and all
400 Chromium browser tests passed (including responsive breakpoints, keyboard,
owner isolation, draft uncertainty and full fixture journey). Browser tests use
controlled API fixtures; Backend separately verified isolated PostgreSQL/Redis/
Bull/AI-adapter and Docker. Provider generation, production email, deployment
and remote CI were not claimed. See ../Backend/docs/career-platform-v2-plan.md
for the source-grounded audit and P0/P1/P2 implementation roadmap.
