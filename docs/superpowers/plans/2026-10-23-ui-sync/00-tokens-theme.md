# P00 — Preflight, nhánh riêng và baseline + Tokens, CSS boundary và Ant Design theme Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành preflight, nhánh riêng và baseline + tokens, css boundary và ant design theme.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** baseline sạch.

**Commit:** `feat(ui): add AIHN dark tokens and theme boundary`.

**Status:** Completed (lịch sử); evidence [P00](../../execution/ui-sync/P00.md). Consumer theme được kiểm ở P01/P03; các popup form được kiểm trong plan chứa form tương ứng.

## Tiêu chí đối chiếu với evidence lịch sử

- Đọc plan, CONTRACTS và git status.
- Thực thi chỉ các file thuộc plan này.
- Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- Ghi evidence thực tế, review diff, stage file cụ thể.
- Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## Preflight, nhánh riêng và baseline

**Files đọc:** `AGENTS.md`, `package.json`, `pnpm-lock.yaml`, `.nvmrc`, `src/routes/*`, `docs/superpowers/execution/frontend-moi/T09.md` ở parent và dossier của màn đang làm.

**Files tạo khi thực thi:** `docs/superpowers/execution/ui-sync/P00.md` và `docs/superpowers/execution/ui-sync/source-manifest.json` trong repo Frontend.

- Chạy từng lệnh trong đúng repo, trước mọi sửa source:

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

- `git -C ../Backend status --short --branch` để ghi baseline backend và đảm bảo cuối đợt không có diff do task này.
- Đọc lại nguồn sống; tạo manifest SHA256 cho 15 HTML, shared CSS và các asset được copy. Manifest lúc lập plan: CSS `0246e1606571e9ec05b27990bb69945d9ce1a9b9f8a1e8a1963cf064b78c28d8`, result HTML `fc691a4c8492136c895d6b464816afe924738ca2f9bf3af44f253235a1591b96`. Nếu đổi, cập nhật reference trước khi port.
- `pnpm install --frozen-lockfile` chỉ khi dependencies chưa đủ; không thay package manager.
- Chạy baseline: `pnpm run typecheck`, `pnpm run lint`, `pnpm run test:unit`, `pnpm run test:e2e`, `pnpm run build`, `git diff --check`.
- Ghi failure nền theo file/test và scope; không xóa assertion nghiệp vụ để lấy xanh. Chỉ sửa blocker của đợt UI khi đã xác định nguyên nhân và ghi riêng.
- Mở 15 HTML và liệt kê blocks/controls/animation của từng màn vào P00; ghi rõ hai assets minh họa đều tồn tại. Serve reference bằng local static HTTP server được sở hữu bởi task; không dùng dev server để expose toàn workspace.
- Không commit source ở task preflight. Kết thúc P00 có baseline có thể kiểm chứng và danh sách route thực tế.


## Tokens, CSS boundary và Ant Design theme

**Modify:** `src/shared/styles/tokens.css`, `src/main.tsx`.
**Create:** `src/shared/styles/ce-base.css`, `src/layouts/components/CareerThemeBoundary.tsx`.
**Test:** tạo `tests/e2e/ui-theme.spec.ts`; chạy thêm `tests/e2e/admin-shell.spec.ts`, `tests/e2e/settings.spec.ts` sau khi nối shell ở P01.

- Copy khối `:root` của `aihn-system.css` vào cuối tokens hiện có; giữ nguyên tên/value. Thêm đúng một override được ghi chú `--ce-ease: cubic-bezier(0.34, 1.56, 0.64, 1);` theo prompt; không copy reset và body selector.
- Thêm `.ce-app` base/reset scoped và import base sau tokens trong `src/main.tsx`. Chỉ scope áp dụng khi wrapper đã render.
- Tạo `CareerThemeBoundary` có props `children: ReactNode`, render `.ce-app` bọc ConfigProvider với config mục 3. Đừng đổi providers auth/query/http.
- Thêm browser assertion kiểm canvas ở route có fixture thật sau P01; ví dụ dùng helper đã tồn tại:

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

- Kiểm popup Input/Select/Modal/message được hoãn có chủ đích sang plan chứa consumer thực tế (P07, P11, P13–P17); P00 không chứng nhận visual popup.
- Chạy `pnpm run typecheck`, `pnpm run lint`; P00 có commit riêng; P01 nối theme consumer, chưa coi theme test pass khi shell chưa render boundary.

Commit riêng P00: `feat(ui): add AIHN dark tokens and theme boundary`; P01 và P02 có commit riêng. Không đợi consumer P03 để commit scaffold P02.
