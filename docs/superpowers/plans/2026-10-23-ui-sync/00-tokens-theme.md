# P00 — Preflight, nhánh riêng và baseline + Tokens, CSS boundary và Ant Design theme Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành preflight, nhánh riêng và baseline + tokens, css boundary và ant design theme.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** baseline sạch.

**Commit:** `feat(ui): add AIHN dark tokens and theme boundary`.

**Status:** Completed; kiểm thử trong P00.md.

## Checkpoint bắt buộc

- [x] Đọc plan, CONTRACTS và git status.
- [x] Thực thi chỉ các file thuộc plan này.
- [x] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [x] Ghi evidence thực tế, review diff, stage file cụ thể.
- [x] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Preflight, nhánh riêng và baseline

**Files đọc:** `AGENTS.md`, `package.json`, `pnpm-lock.yaml`, `.nvmrc`, `src/routes/*`, `docs/superpowers/execution/frontend-moi/T09.md` ở parent và dossier của màn đang làm.

**Files tạo khi thực thi:** `docs/superpowers/execution/ui-sync-aihn-design/U00.md` và `evidence/source-manifest.json` ở parent.

- [x] Chạy từng lệnh trong đúng repo, trước mọi sửa source:

```bash
cd /home/hoang/do-an/Frontend
git status --short --branch
git log -1 --oneline
git branch --list feat/ui-sync-aihn-design
git checkout -b feat/ui-sync-aihn-design
git branch --show-current
node --version
pnpm --version
```

Expected: nhánh mới đúng tên, Node v24, pnpm 10.33.2. Nếu nhánh đã tồn tại, kiểm tra ancestry/diff rồi switch khi đúng scope; không `checkout -B`, không reset/force. Nếu worktree có thay đổi mới, ghi rõ, giữ nguyên và không gom vào task. Không tự lấy `main` vì HEAD hiện tại chứa runtime fixes cần giữ.

- [x] `git -C ../Backend status --short --branch` để ghi baseline backend và đảm bảo cuối đợt không có diff do task này.
- [x] Đọc lại nguồn sống; tạo manifest SHA256 cho 15 HTML, shared CSS và các asset được copy. Manifest lúc lập plan: CSS `0246e1606571e9ec05b27990bb69945d9ce1a9b9f8a1e8a1963cf064b78c28d8`, result HTML `fc691a4c8492136c895d6b464816afe924738ca2f9bf3af44f253235a1591b96`. Nếu đổi, cập nhật reference trước khi port.
- [x] `pnpm install --frozen-lockfile` chỉ khi dependencies chưa đủ; không thay package manager.
- [x] Chạy baseline: `pnpm run typecheck`, `pnpm run lint`, `pnpm run test:unit`, `pnpm run test:e2e`, `pnpm run build`, `git diff --check`.
- [x] Ghi failure nền theo file/test và scope; không xóa assertion nghiệp vụ để lấy xanh. Chỉ sửa blocker của đợt UI khi đã xác định nguyên nhân và ghi riêng.
- [x] Mở 15 HTML và liệt kê blocks/controls/animation của từng màn vào U00; ghi rõ hai assets minh họa đều tồn tại. Serve reference bằng local static HTTP server được sở hữu bởi task; không dùng dev server để expose toàn workspace.
- [x] Không commit source ở task preflight. Kết thúc U00 có baseline có thể kiểm chứng và danh sách route thực tế.


## Tokens, CSS boundary và Ant Design theme

**Modify:** `src/shared/styles/tokens.css`, `src/main.tsx`.
**Create:** `src/shared/styles/ce-base.css`, `src/layouts/components/CareerThemeBoundary.tsx`.
**Test:** tạo `tests/e2e/ui-theme.spec.ts`; chạy thêm `tests/e2e/admin-shell.spec.ts`, `tests/e2e/settings.spec.ts` sau khi nối shell ở Task 02.

- [x] Copy khối `:root` của `aihn-system.css` vào cuối tokens hiện có; giữ nguyên tên/value. Thêm đúng một override được ghi chú `--ce-ease: cubic-bezier(0.34, 1.56, 0.64, 1);` theo prompt; không copy reset và body selector.
- [x] Thêm `.ce-app` base/reset scoped và import base sau tokens trong `src/main.tsx`. Chỉ scope áp dụng khi wrapper đã render.
- [x] Tạo `CareerThemeBoundary` có props `children: ReactNode`, render `.ce-app` bọc ConfigProvider với config mục 3. Đừng đổi providers auth/query/http.
- [x] Thêm browser assertion kiểm canvas ở route có fixture thật sau Task 02; ví dụ dùng helper đã tồn tại:

```tsx
import { expect, test } from '@playwright/test';
import { resultFixture } from './result.fixture';

test('career canvas uses the shared dark token', async ({ page }) => {
  await resultFixture(page);
  await page.goto('/assessment/results/812');
  await expect(page.getByText('TopCode: ISC', { exact: true })).toBeVisible();
  await expect(page.locator('.ce-app').first()).toHaveCSS(
    'background-color', 'rgb(18, 18, 20)',
  );
});
```

- [x] Mở popup Input/Select/Modal/message có consumer thực tế khi chuyển form; kiểm dark container, border/text, focus; không chỉ check object theme ở unit.
- [x] Chạy `pnpm run typecheck`, `pnpm run lint`; Task 01–02 là một foundation increment, chưa coi theme test pass khi shell chưa render boundary.

Commit foundation đề xuất sau Task 03: `feat(ui): add AIHN dark tokens and shared shell`.
