# P15 — Signup Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành signup.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P14 đã verify và commit.

**Commit:** `feat(ui): port Signup page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Signup

**Read:** `screens/signup.html`, registration draft/schema/API hiện có.
**Modify:** `src/modules/auth/registration/pages/SignupPage.tsx`.
**Create:** `SignupPage.module.css` cùng thư mục.
**Test:** `tests/e2e/signup.spec.ts`, `otp.spec.ts`; unit `tests/unit/registration-draft.test.ts`.

- [ ] Port signup form/card/waves theo source; giữ field backend thật, validation và policy đang áp dụng. Không thêm required field chỉ có ở mockup nhưng API không chấp nhận.
- [ ] Duy trì password/confirm semantics, show/hide và pending lock với Form/Input/Button. Không dùng Switch giả checkbox consent nếu mất semantics; native checkbox được phép.
- [ ] Register success chuyển đúng OTP flow; error/unknown giữ draft theo chính sách hiện có, không tự replay register.
- [ ] Có link login/OTP canonical qua paths; không để `.html` link, không session giả sau register.
- [ ] Chạy specs + Gate G; duplicate email, invalid fields, failed submit, back/forward và mobile keyboard.
