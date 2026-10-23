# P12 — History Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành history.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P11 đã verify và commit.

**Commit:** `feat(ui): port History page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## History

**Read:** `screens/history.html` và history API/queries.
**Modify:** `src/modules/history/pages/HistoryPage.tsx`.
**Create:** `HistoryPage.module.css` cùng thư mục.
**Test:** `tests/e2e/history.spec.ts`, `result.spec.ts`, `advisor.spec.ts`.

- [ ] Port tabs/filter/timeline/list theo source với Tabs antd và semantic list/table. Chỉ show category được history API hỗ trợ; không tạo sự kiện roadmap/like mẫu.
- [ ] Giữ cursor/pagination/sort/state hiện có; không từ trang đầu suy ra total toàn hệ thống. Result/chat reopen trỏ đúng attempt/session.
- [ ] Dates format theo dữ liệu/server và locale, không dùng ngày mẫu. Empty/loading/error của từng tab độc lập.
- [ ] Owner-scoped query, abort khi đổi tab/account; không giữ history A ở B hoặc đổi tab khiến auto mutation.
- [ ] Chạy specs + Gate G; tab keyboard, long title/date, duplicate load-more và deep link reopen.
