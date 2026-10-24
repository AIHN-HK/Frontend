# P07 — CareerExplorer trên catalog runtime Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành careerexplorer trên catalog runtime.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P06 đã verify và commit.

**Commit:** `feat(ui): port CareerExplorer page`.

**Status:** Completed. Evidence: [P07](../../execution/ui-sync/P07.md).

## Checkpoint bắt buộc

- [x] Đọc plan, CONTRACTS và git status.
- [x] Thực thi chỉ các file thuộc plan này.
- [x] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [x] Ghi evidence thực tế, review diff, stage file cụ thể.
- [x] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## CareerExplorer trên catalog runtime

**Read:** `screens/career-explorer.html`.
**Modify:** `src/modules/career-platform/pages/CareerCatalogPage.tsx`.
**Create:** `CareerCatalogPage.module.css` cùng thư mục.
**Test:** `tests/e2e/career-platform.spec.ts`, `explorer.spec.ts`, `shell.spec.ts`.

- [x] Port search/filter/grid/card/sidebar bằng Input/Select/Button và HTML/CSS; giữ pagination/request params có thật.
- [x] Dùng catalogSchema và O*NET IDs/sourceVersion/sourceUrl hiện có. Không dùng preview catalog hoặc số tổng mẫu.
- [x] Control filter chỉ gửi param backend hiện đang hỗ trợ; chưa có category/salary không giả lập server filtering.
- [x] Loading, no-results, empty-catalog, failed request/retry, ảnh không có fallback đúng; request cũ khi search/session đổi không ghi đè kết quả mới.
- [x] Update browser test catalog authenticated sau thay đổi guard ở P01; anonymous phải login, login xong quay về catalog/deep link theo guard hiện có.
- [x] Chạy specs + Gate G; keyboard chọn filter, submit search và mobile grid không tràn.
