# P16 — OtpVerify Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành otpverify.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P15 đã verify và commit.

**Commit:** `feat(ui): port OtpVerify page`.

**Status:** Pending.

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## OtpVerify

**Read:** `screens/otp-verify.html`, OTP API/flow/cooldown/draft hiện có.
**Modify:** `src/modules/auth/verification/pages/OtpVerifyPage.tsx`.
**Create:** `OtpVerifyPage.module.css` cùng thư mục.
**Test:** `tests/e2e/otp.spec.ts`, `signup.spec.ts`, `recovery.spec.ts`; unit `tests/unit/otp-api.test.ts`.

- [ ] Port OTP card/digits/resend/success block theo source; ưu tiên Input.OTP nếu type/API của antd đang cài phù hợp, hoặc Input thường với autocomplete one-time-code; không thêm OTP package.
- [ ] React quản lý digit/paste/backspace/focus; không copy `querySelectorAll('.otp-digit')` listener script.
- [ ] Resend cooldown/expiry/reused/wrong code theo server/client policy hiện có, không countdown cố định từ mockup làm nguồn xác nhận.
- [ ] Verify success chỉ sau server response; unknown outcome giữ draft, disable duplicate send và không tự replay resend/verify.
- [ ] `/otp-verify` và alias `/verify-otp` đều hoạt động đúng state scope; mở trực tiếp thiếu flow context có hướng khôi phục, không crash hoặc lấy email mẫu.
- [ ] Chạy specs + Gate G; paste đủ mã, mobile numeric keyboard, reduced motion và error announcement accessible.
