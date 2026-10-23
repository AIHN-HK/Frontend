# P04 — Dashboard Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành dashboard.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P03 đã verify và commit.

**Commit:** `feat(ui): port Dashboard page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Dashboard

**Read:** `screens/dashboard.html`.
**Modify:** `src/modules/dashboard/pages/DashboardPage.tsx`.
**Create:** `src/modules/dashboard/pages/DashboardPage.module.css`.
**Test:** `tests/e2e/dashboard.spec.ts`, `journey.spec.ts`, `result.spec.ts`.

- [ ] Port greeting, dashboard cards/actions, recent history theo HTML; phần số liệu lấy từ query có thật. Field không được response cung cấp hiển thị unavailable hoặc bỏ giá trị mẫu.
- [ ] Giữ profile identity, latest owned attempt, empty assessment CTA và link mở lại đúng attempt. Không biến history completed thành tổng mọi lượt bắt đầu.
- [ ] Header và avatar chỉ thuộc shell; loại bỏ header local trùng nếu có.
- [ ] Chuyển page-local CSS/import sang module; các shared control dùng Button antd đúng loading/disabled semantics.
- [ ] Entrance chỉ tác động card của dashboard, reduced motion vẫn hiện đủ; 320px mọi action ≥44px, không lặp lỗi touch target 34px từ evidence cũ.
- [ ] Chạy scoped specs + Gate G, kiểm reload/dashboard → latest result → back.
