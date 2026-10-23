# R01 — Kiểm thử route protected trên checkout sạch

**Goal:** Regression tests chạy được ở worktree sạch và tiếp tục chứng minh runtime không đọc preview sau khi career routes đã được bảo vệ ở P01.

**Files:** `tests/unit/import-boundaries.test.ts`, `tests/e2e/career-detail.spec.ts`, `tests/e2e/explorer.spec.ts`.

**Commit:** `test(ui): align career guards and isolated test setup`.

- [ ] Giữ kết quả RED của baseline: unit helper thiếu thư mục ignored; hai browser cases kỳ vọng nội dung runtime khi chưa đăng nhập.
- [ ] Trong helper lint, `await mkdir(path.resolve('.superpowers/sdd/00-nen-chung'), { recursive: true })` trước mkdtemp; không dựa thư mục untracked có sẵn.
- [ ] Career detail guest phải chuyển `/login?returnTo=...`, không đọc career/preview. Sau fixture phiên thật mới kiểm invalid runtime ID, không đọc mẫu hoặc gửi mutation.
- [ ] Catalog failed read dùng fixture phiên đã xác minh, sau đó trả 503; giữ assertion không fallback preview.
- [ ] `pnpm exec vitest run tests/unit/import-boundaries.test.ts` và `E2E_PORT=4273 pnpm exec playwright test tests/e2e/career-detail.spec.ts tests/e2e/explorer.spec.ts` đều pass; typecheck/lint/diff check pass.
- [ ] Ghi evidence R01 và commit đúng ba test cùng plan/evidence; không sửa guard hay API chỉ để làm test xanh.
