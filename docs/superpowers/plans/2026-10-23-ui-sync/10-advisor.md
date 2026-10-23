# P10 — Advisor Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành advisor.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P09 đã verify và commit.

**Commit:** `feat(ui): port Advisor page`.

**Status:** Completed. Evidence: [P10](../../execution/ui-sync/P10.md).

## Checkpoint bắt buộc

- [x] Đọc plan, CONTRACTS và git status.
- [x] Thực thi chỉ các file thuộc plan này.
- [x] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [x] Ghi evidence thực tế, review diff, stage file cụ thể.
- [x] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Advisor

**Read:** `screens/advisor.html`, `src/modules/advisor/api/advisor.api.ts`, `queries/advisor.queries.ts` và lifecycle model hiện có.
**Modify:** `src/modules/advisor/pages/AdvisorPage.tsx`; private components trong module khi phải tách phần context/messages/composer.
**Create:** `src/modules/advisor/pages/AdvisorPage.module.css`.
**Test:** `tests/e2e/advisor.spec.ts`, `history.spec.ts`, `journey.spec.ts`; unit `tests/unit/advisor-lifecycle.test.ts`.

- [x] Port context panel, message list, prompt suggestions/composer theo HTML. Advisor có panel riêng; không ép tất cả màn vào sidebar timeline nếu source không dùng nó.
- [x] Giữ sessionId URL, fetch history, socket lifecycle/reconnect và account isolation hiện tại; DOM animation không mở thêm socket, không sinh chat khi chỉ mount page.
- [x] Giữ send pending/failure/timeout/unknown draft, explicit retry; không copy mock script thêm AI answer hoặc “đã gửi” bằng timer.
- [x] Prompt suggestion chỉ điền draft hoặc thao tác rõ theo behavior đã có; không tự gửi khi click mở page. Context RIASEC/profile chỉ hiển thị nếu được dữ liệu thật xác nhận.
- [x] Auto-scroll chỉ khi người dùng đang gần cuối, không giật viewport khi đọc tin cũ; composer không bị keyboard/mobile overlap, danh sách dài cuộn nội bộ hợp lý.
- [x] Chạy specs + Gate G; reduced motion giữ full message text, unmount/remount không duplicate listener/message, account switch không lộ chat cũ.
