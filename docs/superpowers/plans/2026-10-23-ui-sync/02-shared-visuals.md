# P02 — TimelineSidebar, radar, showcase, bars và assets Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành timelinesidebar, radar, showcase, bars và assets.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P01 đã verify và commit.

**Commit:** `feat(ui): add shared radar showcase and timeline components`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## TimelineSidebar, radar, showcase, bars và assets

**Create:** toàn bộ shared UI `ce/*` và `TimelineSidebar.*` trong file map; `src/assets/aihn/hero-student.png`, `src/assets/aihn/student-male-laptop.jpg`.
**Modify:** `tests/e2e/ui-theme.spec.ts`; thêm `tests/e2e/ui-motion.spec.ts` khi Task 04 sử dụng các component.
**Read:** `src/modules/assessment/results/components/RiasecRadar.tsx`, `src/modules/assessment/results/model/result.model.ts` để giữ các quy tắc geometry/zero/missing.

- [ ] Copy đúng hai ảnh dùng trong HTML; import asset qua Vite, không dùng `/home/...`, URL dev Open Design hoặc external placeholder. Giữ aspect ratio/object-position của mỗi source.
- [ ] Tạo RadarChart pure theo mục 3; props `values: Record<'R'|'I'|'A'|'S'|'E'|'C', number|null>`, `label: string`; không gọi API hoặc import assessment model vào shared.
- [ ] Tạo Sidebar nhận `steps: { id:string; title:string; description:string; status:'pending'|'active'|'completed' }[]` và optional `radar: ReactNode`. Node CSS width/height/flex-basis 26px; nếu clickable thì wrapper hit area ≥44px.
- [ ] Tạo ShowcaseCard nhận `children`, optional `media: ReactNode`, optional `badge: ReactNode`; waves decorative `aria-hidden`. Không đặt block overlay giữa ảnh; badge absolute bottom/left 12px.
- [ ] Tạo RiasecBar với props `code`, `label`, `percentage:number|null`, `valueLabel:string`; target style đúng ngay trước effect, effect riêng theo mục 3; null hiển thị unavailable và không vẽ thanh có tỷ lệ giả.
- [ ] CSS Module shared dùng token, không sao chép class global `.active`/`.completed` có thể đụng component khác.
- [ ] Nối thử bằng data thật qua Task 04; test hai radar cùng DOM không trùng title ID, all-zero có tọa độ hữu hạn; không tạo trang demo có mock session.
- [ ] Chạy foundation + Task 04 scoped specs trước commit foundation; ghi phần nào chỉ scaffold chưa consumer để không tự nhận visual pass.

