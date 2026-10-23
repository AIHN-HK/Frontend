# P03 — AssessmentResult, màn ưu tiên số một Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, sequentially. Each plan produces one reviewed local commit.

**Goal:** Hoàn thành assessmentresult, màn ưu tiên số một.

**Architecture:** Giữ Router v8, domain modules, session/query/API contracts; xem [CONTRACTS](CONTRACTS.md).

**Tech Stack:** React 19, TypeScript, Vite, Ant Design 6, GSAP, pnpm 10, Playwright/Vitest.

**Depends on:** P02 đã verify và commit.

**Commit:** `feat(ui): port AssessmentResult page`.

**Status:** Completed; evidence [P03](../../execution/ui-sync/P03.md).

## Checkpoint bắt buộc

- [ ] Đọc plan, CONTRACTS và git status.
- [ ] Thực thi chỉ các file thuộc plan này.
- [ ] Typecheck/lint, scoped tests và visual khi có UI consumer phải pass.
- [ ] Ghi evidence thực tế, review diff, stage file cụ thể.
- [ ] Tạo commit message ở trên; cập nhật status rồi mới chuyển plan kế tiếp.

## AssessmentResult, màn ưu tiên số một

**Read:** `screens/assessment-result.html` và inline CSS/script.
**Modify:** `src/modules/assessment/results/pages/AssessmentResultPage.tsx`; adapter `components/RiasecRadar.tsx` nếu dùng lại shared renderer.
**Create:** `src/modules/assessment/results/pages/AssessmentResultPage.module.css`.
**Test:** `tests/e2e/result.spec.ts`, `holland.spec.ts`, `dashboard.spec.ts`, `ui-theme.spec.ts`, `ui-motion.spec.ts`; unit `tests/unit/assessment-result.test.ts`.

- [ ] Giữ nguyên hooks result/analysis/snapshot, parseAttemptId, latest-result redirect và owner scope. Đối chiếu parser/model/test trước thay JSX.
- [ ] Port hero TopCode, pill, showcase ảnh + waves, score rows và timeline/sidebar theo source mới; map từng region qua CSS Module, không giữ white hero cũ.
- [ ] Dùng server TopCode cho nội dung và snapshot percentages cho radar/bar; duy trì raw scores + unavailable khi snapshot lỗi. Không hardcode polygon hoặc score mẫu.
- [ ] Dùng shared RadarChart 150×150 viewBox, giữ accessible name/description và textual score. Nếu thay geometry cũ, cập nhật assertion all-zero từ tâm `180,170` sang `75,75`, giữ ý nghĩa zero/missing tests.
- [ ] Entrance mount ready và score animation độc lập sau snapshot ready. Test trả snapshot muộn: bars phải đạt đúng width mà không remount page.
- [ ] Giữ analysis missing/partial/aggregate special case; không tạo ba nhận xét tính cách cố định. Bridge dùng links thật, không tự POST tạo gợi ý hay chat khi render.
- [ ] Thêm assertion sidebar visible ở 1025px, hidden ở 1024px; node visual 26×26; badge offset 12px và không có overlay che vùng giữa ảnh.
- [ ] Chạy specs + Gate G; ảnh so sánh ít nhất ready, zero, snapshot-unavailable và mobile. Dừng để review màn đầu tiên trước dashboard.
