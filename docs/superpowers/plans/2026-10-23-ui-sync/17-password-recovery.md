# P17 — ForgotPassword + ResetPassword Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành forgotpassword + resetpassword.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P16 đã verify và commit.

**Commit:** `feat(ui): port ForgotPassword and ResetPassword pages`.

**Status:** Completed. Evidence: [P17](../../execution/ui-sync/P17.md).

## Checkpoint bắt buộc

- [x] Đọc plan, CONTRACTS và git status.
- [x] Thực thi chỉ các file thuộc plan này.
- [x] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [x] Ghi evidence thực tế, review diff, stage file cụ thể.
- [x] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## ForgotPassword + ResetPassword

**Read:** `screens/forgot-reset-password.html`, recovery-state/API/queries hiện có.
**Modify:** `src/modules/auth/recovery/pages/ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`.
**Create:** `ForgotPasswordPage.module.css`, `ResetPasswordPage.module.css` cùng thư mục; shared private `RecoveryCard.tsx` nếu cần tránh lặp markup.
**Test:** `tests/e2e/recovery.spec.ts`, `login.spec.ts`, `otp.spec.ts`; unit `tests/unit/recovery-state.test.ts`.

- [x] Port các state card/waves/step indicator từ cùng HTML, map sang flow OTP thật. Không chuyển recovery sang magic email link chỉ vì mockup có text đó.
- [x] Giữ route `/forgot-password` và `/reset-password`, missing-context/expired/wrong/reused/resend states. Form API adapters không đổi endpoint/DTO.
- [x] Recovery secrets/password giữ memory-only theo TTL/revision hiện có; không URL/localStorage/log. Timeout/unknown giữ draft để review/reconcile, không auto resend/reset.
- [x] Reset success xóa password/recovery state và về login, không tự login. Giữ test old password rejection và session invalidation ở mức integration phù hợp.
- [x] Chạy specs + Gate G cho cả hai page; long validation, keyboard, reload thiếu context và auth canvas viewport thấp.
