# P13 — Settings, dark canvas và chức năng có thật Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành settings, dark canvas và chức năng có thật.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P12 đã verify và commit.

**Commit:** `feat(ui): port Settings page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Settings, dark canvas và chức năng có thật

**Read:** `screens/settings.html`, `src/shared/appearance/appearance.ts`, `appearance.css` và SettingsPage.
**Modify:** `src/modules/settings/pages/SettingsPage.tsx`; appearance integration chỉ ở career theme boundary nếu cần.
**Create:** `SettingsPage.module.css` cùng thư mục.
**Test:** `tests/e2e/settings.spec.ts`, `admin-shell.spec.ts`, `shell.spec.ts`; unit `tests/unit/appearance.test.ts`.

- [ ] Port account/preferences/security sections với Form/Input/Select/Switch/Button/Modal được allow. Read-only profile fields vẫn read-only khi không có mutation.
- [ ] Trong career UI mới, canvas/nav/sidebar và RIASEC identity cố định theo `--ce-*`. Các lựa chọn preset cũ không được hứa đổi những màu cố định này. Giữ storage schema cũ để admin/preview không hỏng; giải thích ngắn “Giao diện AIHN hiện dùng chủ đề tối cố định” ở control tương ứng nếu phải disabled.
- [ ] Notification/privacy/delete-account/password-change controls trong HTML chỉ hoạt động nếu đã có contract. Không toast success cho local toggle giả server; unsupported control có unavailable state rõ ràng.
- [ ] Các preference còn được hỗ trợ áp dụng scope cũ thực tế, không ghi đè ce tokens. Logout/security action vẫn qua auth API hiện có.
- [ ] Chạy specs + Gate G; reload persistence được hỗ trợ, legacy stored preset không đổi canvas khỏi rgb(18,18,20), admin palette isolation không regress.
