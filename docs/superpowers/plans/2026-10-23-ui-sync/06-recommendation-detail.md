# P06 — RecommendationDetail, tách page runtime có context chính xác Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành recommendationdetail, tách page runtime có context chính xác.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P05 đã verify và commit.

**Commit:** `feat(ui): port RecommendationDetail page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## RecommendationDetail, tách page runtime có context chính xác

**Read:** `screens/recommendation-detail.html`, schema run và route hiện đang dùng chung list Page.
**Modify:** `src/routes/student.routes.tsx`, `src/modules/career-platform/pages/CareerRecommendationsPage.tsx`.
**Create:** `src/modules/career-platform/pages/CareerRecommendationDetailPage.tsx`, `CareerRecommendationDetailPage.module.css`, `src/modules/career-platform/model/recommendation-selection.ts`, `tests/unit/recommendation-selection.test.ts`.
**Test:** `tests/e2e/career-platform.spec.ts`, `recommendation-detail.spec.ts`.

- [ ] Khóa nghĩa ID: path param là recommendation **run ID**, query `careerId` là item ID. Route cũ không có query hiển thị danh sách chọn nghề trong run, không tự chọn item đầu, không báo đó là career detail.
- [ ] Unit cho selection: item tồn tại trả đúng item; query thiếu/null trả null; query không thuộc run trả null. Hàm thuần hoàn chỉnh:

```ts
export function selectRecommendation<T extends { careerId: string }>(
  items: readonly T[], careerId: string | null,
): T | null {
  return careerId === null ? null
    : items.find((item) => item.careerId === careerId) ?? null;
}
```

```ts
import { expect, test } from 'vitest';
import { selectRecommendation } from '@/modules/career-platform/model/recommendation-selection';
test('selects only an explicitly requested item from the saved run', () => {
  const items = [{ careerId: '15-1252.00' }, { careerId: '15-2051.00' }];
  expect(selectRecommendation(items, '15-2051.00')).toBe(items[1]);
  expect(selectRecommendation(items, null)).toBeNull();
  expect(selectRecommendation(items, 'missing')).toBeNull();
});
```

- [ ] Lazy route detail trỏ Page mới; Page đọc run qua endpoint hiện có `/api/v1/career/recommendations/:runId` và usePlatformQuery personal. Giữ error/forbidden/invalid/null state, không request endpoint career bằng run ID.
- [ ] Port hero nghề/score/showcase ảnh + sidebar/detail sections. Render score components/gaps/contributions của item được chọn và metadata run/source; phần mockup không được API cung cấp dùng unavailable.
- [ ] CTA career detail dùng item.careerId; “chọn mục tiêu/lộ trình” tiếp tục flow profile/goal hiện có, không mutation tự phát khi mở link.
- [ ] Deep link, reload, URL đổi nghề cùng run, unknown careerId, run 404/403, account switch phải đúng; giữ old `/recommendations/:runId` usable qua màn chọn.
- [ ] Chạy unit `pnpm exec vitest run tests/unit/recommendation-selection.test.ts`, browser specs + Gate G.
