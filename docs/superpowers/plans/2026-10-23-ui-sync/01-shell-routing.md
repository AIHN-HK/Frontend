# P01 — AppHeader, shell và routing thật Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành appheader, shell và routing thật.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P00 đã verify và commit.

**Commit:** `feat(ui): add AIHN navigation shell and guarded routes`.

**Status:** Completed (lịch sử); evidence [P01](../../execution/ui-sync/P01.md).

## Tiêu chí đối chiếu với evidence lịch sử

- Đọc plan, CONTRACTS và git status.
- Thực thi chỉ các file thuộc plan này.
- Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- Ghi evidence thực tế, review diff, stage file cụ thể.
- Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## AppHeader, shell và routing thật

**Modify:** `src/layouts/StudentLayout.tsx`, `src/layouts/AuthLayout.tsx`, `src/routes/paths.ts`, `src/routes/index.tsx`, `src/routes/public.routes.tsx`, `src/routes/student.routes.tsx`, `src/routes/auth.routes.tsx`, `src/routes/RouteStates.tsx`.
**Create:** `src/layouts/CareerCatalogLayout.tsx`, `src/layouts/components/AppHeader.tsx`, `AppHeader.module.css`, `CareerScreenFrame.tsx`, `CareerScreenFrame.module.css`, `src/routes/EntryRedirect.tsx`.
**Test:** `tests/e2e/shell.spec.ts`, `login.spec.ts`, `otp.spec.ts`, `career-platform.spec.ts`, `home.spec.ts`, `ui-theme.spec.ts`; unit `tests/unit/import-boundaries.test.ts`.

- Chép header `.ce-header` vào component shell có semantic nav; Link/NavLink dùng `paths`. Giữ logout/identity qua controller/auth API hiện có, không tự parse token để xác nhận role.
- Chuyển StudentLayout sang boundary + header + `<main id="main-content"><Outlet /></main>`. Frame từng page chỉ section/div/aside, không tạo main/header lồng thêm. Preview/admin vẫn dùng shell hiện có.
- Đọc `RootRoute`/`AccountControls`: chuyển phần student account controls vào AppHeader hoặc scope ẩn phần strip khi header mới đã sở hữu nó. Giữ logout/failure/retry behavior, không render thêm một strip 60px trên header 64px. Không thay phần admin chưa được port.
- AuthLayout dùng boundary và nền waves; giữ guest-only/hydration, không thêm student navigation.
- Tạo `EntryRedirect` dùng `useSession`; loading hiển thị pending, authenticated USER → dashboard, ADMIN → admin theo quyền hiện có, anonymous → login. Dùng `Navigate replace`; tuyệt đối không redirect trước hydration hoàn tất.
- Thay route `/` bằng EntryRedirect; Home source được giữ. Cập nhật `home.spec.ts` cho contract entry mới: guest/reload → login, USER → dashboard, ADMIN → admin; giữ các regression public khác ở route còn tồn tại, không xóa suite để che khác biệt.
- Đặt career catalog/detail dưới `RequireSession` với `CareerCatalogLayout`; bỏ đăng ký public trùng. Cập nhật test anonymous catalog thành assert redirect theo thay đổi **được prompt yêu cầu**; test authenticated vẫn chứng minh đọc API/provenance.
- `paths.verifyOtp` đổi thành `/otp-verify`; thêm alias route `/verify-otp` cùng lazy Page để giữ draft, query và flow cũ. Giữ `/reset-password`. Không thêm route sinh ID giả.
- Giữ `/assessment` ở cấu trúc riêng hiện có; không bọc trùng header hoặc đổi boolean flow. Protected guard/owner checks tiếp tục áp dụng cho result/history/advisor/profile/settings/recommendations/roadmap. Không thay quyền admin bằng RequireSession đơn giản.
- Chạy các spec của task và unit boundary. Gate: không redirect loop, chỉ một header/main, deep links/reload/404/guard và login returnTo vẫn đúng.
