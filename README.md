# AIHN Career — ReactJS frontend

React DOM + TypeScript + Vite, React Router, TanStack Query, Axios, Socket.IO và Ant Design Skeleton. Node 24, pnpm 10.33.2; `pnpm-lock.yaml` là lockfile đang dùng.

## Chạy local

```bash
nvm use
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Ứng dụng: `http://127.0.0.1:5173`. API/socket mặc định `http://localhost:3000`. `VITE_*` là cấu hình công khai; không đặt secrets trong frontend. Backend là repo riêng `../Backend`.

## Phạm vi và bằng chứng

| Task | Route | Phạm vi đã triển khai |
| --- | --- | --- |
| T01 | `/` | Trang chủ static, responsive, CTA và bản minh họa có nhãn |
| T02 | `/login` | Login, server identity, refresh, logout; đã smoke backend local |
| T03–T05 | `/signup`, `/verify-otp`, `/forgot-password`, `/reset-password` | Đăng ký/khôi phục OTP; smoke backend + SMTP capture local, chưa chứng minh email production |
| T06–T07 | `/dashboard`, `/career-profile` | Hồ sơ GET/PATCH và lịch sử hoàn thành thật; không có tỷ lệ hoàn thiện/skills giả |
| T08–T09 | `/assessment`, `/assessment/results/:attemptId` | Giữ thang Có/Không; bản nháp theo owner; kết quả/snapshot/phân tích từ backend |
| T10 | `/history` | Lịch sử trắc nghiệm và metadata phiên chat; không mở lại phiên cũ để gửi |
| T11 | `/advisor` | REST và Socket.IO/Bull đã smoke backend local; streaming dùng AI protocol fixture, AI thật chưa kiểm chứng |
| T12–T16 | `/careers`, `/careers/:careerId`, `/recommendations`, `/recommendations/:recommendationId`, `/roadmap` | Runtime chưa sẵn sàng do thiếu catalog/recommendation/target/progress contract; bản mẫu ở `/preview/careers`, `/preview/recommendations`, `/preview/roadmap` ghi rõ dữ liệu mẫu |
| T17 | `/settings` | Theme theo thiết bị, version1, reset/storage fallback; email chỉ đọc, không đồng bộ server |
| T18 | `/admin` | `/admin/me` xác minh trước shell, counts và recent attempts thật; chưa có growth/distribution/audit API |
| T19–T20 | `/admin/questions`, `/admin/scoring`, `/admin/holland-content` | Câu hỏi theo editable/used/activeAttempts; ưu tiên atomic 6 nhóm; nội dung Holland. Đọc đã smoke backend local; lưu đã kiểm tra browser fixtures, chưa ghi thử lên bộ đề thật |
| T21 | `/admin/careers` | Chưa có catalog quản trị; `/preview/admin/careers` chỉ đọc/tìm kiếm/xem nguồn mẫu |
| T22–T23 | `/admin/students`, `/admin/students/:studentId` | Search/page/limit và hồ sơ/kết quả hoàn thành từ backend local; thiếu metadata AI/roadmap và workflow hỗ trợ |

Không gọi bản này là thay thế đầy đủ mọi chức năng mẫu: các phần nghề/gợi ý/lộ trình, AI thật và các hành động chưa có API vẫn còn giới hạn. Không có simulator, sửa trọng số/threshold, export/PDF, xóa tài khoản, đổi mật khẩu đã đăng nhập, thông báo server, publication hoặc hỗ trợ/retest giả.

## Phiên, dữ liệu và cấu trúc

`app → routes → modules/layouts → shared`. Page lazy tại routes; giao tiếp giữa domain qua `index.ts`. API/schema/query thuộc module, transport/session/UI nền ở `shared`. [AGENTS.md](AGENTS.md) ghi quy tắc repo; user ngày 14/10/2026 đã cho phép agent commit riêng từng task, vẫn không push/deploy/migrate tự động.

Ghi nhớ đăng nhập lưu token localStorage; không ghi nhớ dùng sessionStorage. Reload xác minh server identity, không tin role lưu sẵn. Queries dùng owner + revision + AbortSignal. Đổi tài khoản/logout xóa cache và hủy request cũ. Chỉ GET/HEAD được replay một lần sau refresh; mutations không tự retry/replay. Logout thu hồi refresh tokens theo backend; access JWT còn theo thời hạn server.

Bản nháp trắc nghiệm là `aihn.assessment.boolean.v1.<owner>`. Không tự nhập draft Expo/Likert cũ. Nháp admin trong sessionStorage có owner + loại bản ghi + version; đánh dấu cần đối chiếu trước gửi, giữ khi lỗi/unknown outcome. Mở lại nháp không tự gửi. Lựa chọn giao diện `aihn.appearance.v1` dùng chung theo thiết bị, chỉ áp trên student scope, giữ admin palette riêng. Không tự nhập khóa theme legacy.

## Kiểm chứng

```bash
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
pnpm preview
```

Playwright tự build production bundle và mở preview `127.0.0.1:4173` (`E2E_PORT` có thể đổi). Không chạy đồng thời hai bộ E2E cùng cổng hoặc rebuild `dist` khi đang capture ảnh. Browser fixtures, backend local và AI thật là ba mức bằng chứng riêng. Reports/trace ở `playwright-report/`, `test-results/`, được ignore.

Hồ sơ và ảnh T00–T24, kiểm kê từng màn, commit và giới hạn nằm ở `../docs/superpowers/execution/frontend-moi/verification.md` (ngoài repo Git này). Bản gốc `design-reference/` và `legacy/expo/` chỉ lưu local, ignored, không thuộc bundle.

## Phương án chuyển đổi và rollback để review

1. Chốt các contract còn thiếu hoặc chấp nhận phạm vi unavailable; kiểm thử AI/email thật trên môi trường được cấu hình. Giữ bản deploy/commit cũ và bản sao cấu hình host trước chuyển đổi.
2. Build một artifact từ commit đã review với API/socket origins HTTPS đúng môi trường. Cấu hình CORS cho origin frontend, Socket.IO path `/socket.io/`, TLS và thời gian chờ streaming; không nhúng secrets.
3. Preview artifact trên origin staging. Host SPA phải trả `index.html` cho routes UI, giữ `/assets/*` là file tĩnh (asset thiếu trả 404), không rewrite API/socket. Kiểm tra deep links/reload, đăng nhập/OTP/logout, role ADMIN/USER và origin/CORS/socket thực tế.
4. Lập bảng URL Expo cũ cần chuyển hướng theo nhu cầu thực tế; không tự redirect link kết quả/owner bằng ID suy đoán. Chỉ đổi entry/domain/CDN khi người dùng yêu cầu triển khai.
5. Nếu lỗi, khôi phục artifact/config/CDN entry trước đó; không rollback dữ liệu từ frontend. Nháp boolean version1 không nhập vào UI có schema khác. Giữ legacy/checkpoint để phục hồi; chỉ xóa sau quyết định riêng.

Chưa push, deploy, chuyển traffic, migrate hay xóa frontend cũ trong đợt T15–T24.

Mẫu cấu hình host để review: [deploy/nginx.conf.example](deploy/nginx.conf.example), dựa trên [`try_files` chính thức](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files). Mẫu chưa được chạy trên host/nginx thực. Vite preview chỉ để xem bản build, [không phải production server](https://vite.dev/guide/static-deploy.html); kiểm tra local hiện thấy asset không tồn tại có thể nhận SPA fallback 200, nên staging/production cần cấu hình `/assets/*` trả 404 như mẫu trước khi chuyển traffic.
