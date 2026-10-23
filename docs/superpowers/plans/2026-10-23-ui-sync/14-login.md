# P14 — Login Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành login.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P13 đã verify và commit.

**Commit:** `feat(ui): port Login page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Login

**Read:** `screens/login.html`, auth login hook/controller và tests hiện có.
**Modify:** `src/modules/auth/login/pages/LoginPage.tsx`.
**Create:** `LoginPage.module.css` cùng thư mục.
**Test:** `tests/e2e/login.spec.ts`, `shell.spec.ts`; unit `tests/unit/auth-session.test.ts`, `session-http.test.ts`.

- [ ] Port auth card/waves/logo/spacing, password visibility/remember/CTA bằng antd controls. Auth canvas #121214 và form cuộn được trên màn thấp.
- [ ] Giữ validation, remember localStorage vs sessionStorage, single-flight refresh, no duplicate submit và same-account rotation.
- [ ] Form `onFinish` hoặc native submit dùng **một** login handler; không để onClick và onSubmit cùng gửi. Không lưu password vào URL/storage.
- [ ] Success chỉ sau server identity xác minh; USER dashboard, ADMIN admin hoặc returnTo được validate theo guard. Root redirect Task 02 không tạo loop.
- [ ] OAuth Google mẫu nếu chưa có contract phải disabled/unavailable, không tự đăng nhập giả.
- [ ] Chạy specs + Gate G; Enter submit, keyboard error focus, reload remembered session, logout/session changed và 320px.


