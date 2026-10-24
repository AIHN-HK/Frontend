# P18 — Nghiệm thu toàn luồng, kiểm tra diff và bàn giao Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành nghiệm thu toàn luồng, kiểm tra diff và bàn giao.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P17 đã verify và commit.

**Commit:** `docs(ui): record AIHN UI migration acceptance`.

**Status:** Completed. Evidence: [P18](../../execution/ui-sync/P18.md).

## Checkpoint bắt buộc

- [x] Đọc plan, CONTRACTS và git status.
- [x] Thực thi chỉ các file thuộc plan này.
- [x] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [x] Ghi evidence thực tế, review diff, stage file cụ thể.
- [x] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Nghiệm thu toàn luồng, kiểm tra diff và bàn giao

**Modify nếu phát hiện lỗi thuộc scope:** đúng file của task tương ứng; không mở một đợt refactor toàn repo.
**Docs:** `docs/superpowers/execution/ui-sync/P18.md` trong repo Frontend.

- [x] Rà lại đủ **15/15 HTML**, **16 page runtime** vì recovery có hai page; mỗi page có CSS Module riêng. `LatestAssessmentResultPage` vẫn là redirect/data-entry riêng, không tính là màn thứ 16 trong nguồn.
- [x] Rà allowlist imports antd và dependencies: không Layout/Menu/Card/Typography/UI library mới; không CDN GSAP trong runtime; không source `.html` nằm trong bundle; không module import test fixture/mock data.
- [x] Kiểm tất cả `<a href="*.html">`, static inline event, `document.querySelector` không scope, hex ngoài token/theme exception; xử lý theo ownership, không mechanical replace cả legacy/reference.
- [x] Chạy final gate một lần sau các task đã ổn định:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test:unit
pnpm run test:e2e
pnpm run build
git diff --check
git status --short --branch
git -C /home/hoang/do-an/Backend status --short --branch
```

Expected: các command pass; mọi failure baseline mới/còn tồn tại được giải thích theo test cụ thể, không suy ra “pass” từ kết quả cũ.

- [x] Tương tác xuyên màn: guest `/` → login → dashboard → result latest/deep link → recommendations → selected recommendation detail → career detail → target profile → roadmap task → advisor/history reopen → logout. Thêm signup → OTP và forgot → reset → login; test USER/ADMIN redirect và deep links.
- [x] Không mượn fixture để kết luận backend integration. Khi có local backend đã xác minh origin/config, chạy smoke với tài khoản thử thuộc task; GET thực trên result/catalog/run/goal/history, mutation chỉ những action explicit của smoke, không migration/seed/đổi scoring. Ghi rõ nếu local integration chưa chạy.
- [x] Visual review 15 màn ở ba viewport chính, boundary/320px và reduced motion; ảnh source và app cùng viewport, fixed data/cùng điều kiện. Không yêu cầu pixel equality cho nội dung thật khác mock; ghi delta data/content có lý do, layout/token phải khớp.
- [x] Kiểm session isolation: logout A/login B khi query/mutation/socket pending, drafts/preview/avatar không rò; theme overlay không ảnh hưởng admin/preview; Holland boolean flow còn chạy.
- [x] Nếu commit đã được giao, chỉ stage task-owned files, commit theo từng màn; không `git add .`, không gom dirty file khác, không push/merge/deploy. Chỉ commit plan/evidence của worktree Frontend này; tài liệu parent ngoài repo được báo riêng.
- [x] Bàn giao rõ: đã sửa màn nào, visual reviewed hay chưa, test hiện tại, local integration có/chưa, commit hashes nếu có, dirty files còn lại; không tạo learning summary/task-summary-template khi user chưa yêu cầu.
