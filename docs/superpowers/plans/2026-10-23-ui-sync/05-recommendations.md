# P05 — Recommendations list Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành recommendations list.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P04 đã verify và commit.

**Commit:** `feat(ui): port Recommendations page`.

**Status:** Completed (lịch sử); evidence [P05](../../execution/ui-sync/P05.md).

## Tiêu chí đối chiếu với evidence lịch sử

- Đọc plan, CONTRACTS và git status.
- Thực thi chỉ các file thuộc plan này.
- Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- Ghi evidence thực tế, review diff, stage file cụ thể.
- Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Recommendations list

**Read:** `screens/recommendations.html`; `src/modules/career-platform/model/contracts.ts`, `api/platform.api.ts` và page runtime.
**Modify:** `src/modules/career-platform/pages/CareerRecommendationsPage.tsx`.
**Create:** `CareerRecommendationsPage.module.css` cùng thư mục; `src/modules/career-platform/components/RecommendationRunSummary.tsx` nếu tách nội dung run dùng chung cho detail.
**Test:** `tests/e2e/career-platform.spec.ts`, `recommendations.spec.ts`, `journey.spec.ts`.

- Port title/filter/career cards/grid/sidebar từ HTML; data lấy run latest API hiện có, không import fixture từ `modules/recommendations` preview.
- Giữ explicit action “Tạo gợi ý nghề”, pending lock, một POST khi double click và thông báo failed/unknown. Mount/read/filter không tự tạo run mới.
- Cards hiển thị score/components/missing thật; dùng “điểm xếp hạng /100”, source link và stale profile revision khi có. Không thêm salary/% success.
- Link card tạo từ `paths.recommendation(run.id)` và `?careerId=${encodeURIComponent(item.careerId)}`. Query chọn nghề trong **run đó**, không gộp với `/careers/:careerId`.
- Filter chỉ áp dụng trường có thật; state pending/empty/error/null score rõ ràng. Các filter mẫu không có dữ liệu hỗ trợ disabled với mô tả ngắn.
- Giữ phần explanation contribution/weights/missing ở khối đọc được hoặc Modal, không xóa để khớp ít chữ trong mockup.
- Chạy specs + Gate G; test click một nghề mở đúng cặp run/career và browser back giữ context.
