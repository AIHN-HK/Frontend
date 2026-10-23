# P09 — Roadmap Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành roadmap.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P08 đã verify và commit.

**Commit:** `feat(ui): port Roadmap page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Roadmap

**Read:** `screens/roadmap.html`, page runtime, goal/task schemas.
**Modify:** `src/modules/career-platform/pages/CareerRoadmapPage.tsx`.
**Create:** `CareerRoadmapPage.module.css` cùng thư mục.
**Test:** `tests/e2e/career-platform.spec.ts`, `roadmap.spec.ts`, `career-progress.spec.ts`.

- [ ] Port timeline/phases/task cards/header/progress theo HTML nhưng dùng goal/tasks đã lưu, target/profile/gaps thật.
- [ ] Giữ explicit tạo mục tiêu, revision khi cập nhật task, evidence/draft và failed/unknown mutation handling. Switch/Button antd thay control nhưng không thay event contract.
- [ ] Progress tính từ `done` của task thuộc goal đã xác nhận; no tasks là “chưa có nhiệm vụ”, không `100%`. Tách rõ tiến độ tự xác nhận và chứng nhận năng lực.
- [ ] Không copy mốc tháng, khóa học, trường hay chứng chỉ giả từ mockup. No target → CTA profile; gap unknown giữ unknown.
- [ ] Error cập nhật không đánh dấu task complete thành công; double submit không gửi hai mutation, reload phải từ server.
- [ ] Chạy specs + Gate G; keyboard toggle/modal evidence, mobile timeline, revision conflict và unknown-save.
