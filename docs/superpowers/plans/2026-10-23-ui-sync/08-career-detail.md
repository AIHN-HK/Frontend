# P08 — CareerDetail trên O*NET career ID Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành careerdetail trên o*net career id.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P07 đã verify và commit.

**Commit:** `feat(ui): port CareerDetail page`.

**Status:** Completed. Evidence: [P08](../../execution/ui-sync/P08.md).

## Checkpoint bắt buộc

- [x] Đọc plan, CONTRACTS và git status.
- [x] Thực thi chỉ các file thuộc plan này.
- [x] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [x] Ghi evidence thực tế, review diff, stage file cụ thể.
- [x] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## CareerDetail trên O*NET career ID

**Read:** `screens/career-detail.html`.
**Modify:** `src/modules/career-platform/pages/CareerRuntimeDetailPage.tsx`.
**Create:** `CareerRuntimeDetailPage.module.css` cùng thư mục.
**Test:** `tests/e2e/career-platform.spec.ts`, `career-detail.spec.ts`, `career-progress.spec.ts`.

- [x] Giữ validate ID dạng O*NET hiện có, API `/api/v1/careers/:careerId`, source link và query cancellation.
- [x] Port hero/title, ảnh sinh viên minh họa, sections/skills và sidebar; không cho badge/card che giữa ảnh.
- [x] Hiển thị RIASEC nghề theo thang 1–7 và skills /5 từ API. Nếu radar cần 0–100 để vẽ, adapter tính `value / 7 * 100`, chú giải vẫn ghi thang tham khảo 1–7; không đặt nhãn match cá nhân.
- [x] Salary/market/local degree blocks không có nguồn giữ unavailable; không đổi dữ liệu nghề tiếng Anh thành lời mô tả VN tự bịa.
- [x] Giữ CTA `/career-profile?target=<careerId>` chọn mục tiêu và nguồn nghề; unknown/invalid ID không rơi vào nghề đầu danh sách.
- [x] Chạy specs + Gate G; reload, 404, empty skills, long title, 320px và protected deep link.
