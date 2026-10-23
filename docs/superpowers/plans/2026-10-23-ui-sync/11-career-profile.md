# P11 — CareerProfile, giữ avatar và career profile panel Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành careerprofile, giữ avatar và career profile panel.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P10 đã verify và commit.

**Commit:** `feat(ui): port CareerProfile page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## CareerProfile, giữ avatar và career profile panel

**Read:** `screens/career-profile.html`, page hiện có, `ProfileEditor`, `AvatarEditor`, `CareerProfilePanel` export từ career-platform.
**Modify:** `src/modules/profile/pages/CareerProfilePage.tsx`; CSS/markup private editor khi cần theme compatibility.
**Create:** `CareerProfilePage.module.css` cùng thư mục; private editor CSS Modules riêng nếu editor có class riêng.
**Test:** `tests/e2e/profile.spec.ts`, `avatar.spec.ts`, `career-platform.spec.ts`, `career-progress.spec.ts`; unit `tests/unit/profile-model.test.ts`, `avatar-api.test.ts`.

- [ ] Port information/skills/target sections theo HTML; giữ ranh giới user profile và career profile API, không gộp thành mutation mới.
- [ ] Chuyển Form/Input/Select/Button sang antd trong phạm vi cần thiết, chỉ một nguồn form state. Giữ validation/schema/draft hiện có, không vừa RHF vừa antd quản lý cùng field độc lập.
- [ ] Giữ avatar file input native + preview/cancel/upload/errors/limits/ownership hiện có; không dùng antd Upload ngoài allowlist hoặc thay bằng ảnh sinh viên mẫu.
- [ ] Giữ target `?target=<careerId>`, explicit save và profile revision; self-rating 0 là giá trị hợp lệ, unknown khác zero.
- [ ] Chuyển light inline badge colors sang ce tokens. Không hiển thị phần trăm hoàn thiện hồ sơ hoặc kinh nghiệm không có nguồn.
- [ ] Chạy specs + Gate G; unsaved draft/failed save giữ dữ liệu, account switch xóa đúng scope, avatar lỗi không mất profile draft.
