# AIHN Career — frontend ReactJS

React DOM, TypeScript, Vite, React Router, TanStack Query, Axios và CSS/SVG. Cấu trúc ứng dụng: `app/`, `routes/`, `layouts/`, `modules/`, `shared/`, `assets/` khi có màn sử dụng.

## Chạy local

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Mở `http://127.0.0.1:5173`. API/socket origin mặc định là `http://localhost:3000`; URL endpoint nghiệp vụ được khai báo tại module sở hữu. `VITE_*` là cấu hình công khai của trình duyệt.

## Phạm vi đã triển khai

T00: nền ứng dụng và bản xem trước shell tại `/preview/student`, `/preview/admin`, `/preview/auth`. Các URL preview chỉ trình bày layout/UI, không có phiên hay dữ liệu cá nhân. Các route được bảo vệ yêu cầu đăng nhập; xác minh admin thuộc T18.

T01: Public Home tại `/`, header/menu mobile, hero và hành trình THPT, bàn làm việc minh họa có nhãn dữ liệu mẫu, footer và CTA. CTA tới assessment/dashboard/advisor/roadmap/recommendations chuyển khách tới login kèm đường dẫn quay lại. Search pill dẫn tới catalog; tìm kiếm thật thuộc T12.

T02: `/login` có giao diện split theo mẫu, validation, hiện/ẩn mật khẩu, chống submit trùng và API login/refresh/logout thật. USER vào `/dashboard`, ADMIN vào `/admin`, hoặc đường dẫn nội bộ phù hợp quyền. Khi reload, danh tính/quyền được xác minh với backend; không tin role lưu trên trình duyệt. Có thanh tài khoản và nút đăng xuất để sử dụng khi các màn đích còn unavailable.

Ghi nhớ bật lưu token trong localStorage; tắt dùng sessionStorage của tab. Không lưu mật khẩu. Refresh chạy một lần đồng thời; chỉ GET/HEAD được thử lại một lần, mutation không tự replay. Logout/đổi tài khoản hủy query và xóa cache cũ; refresh cùng tài khoản giữ cache. Logout backend hiện thu hồi mọi refresh token của tài khoản, access JWT vẫn theo thời hạn backend. Kiểm tra nhiều tab trong Chromium; phiên tab tuân theo hành vi sessionStorage của trình duyệt.

Đã smoke T02 với NestJS/PostgreSQL/Redis local bằng tài khoản thử riêng và dọn sạch sau kiểm tra. `/signup`, khôi phục mật khẩu, dashboard/catalog và màn quản trị chưa triển khai; admin guard tiếp tục đóng đến T18. Chưa kiểm chứng production.

Mẫu gốc ở `design-reference/`. Mã Expo trước chuyển đổi ở `legacy/expo/`, ngoài cây build. Hai thư mục chỉ lưu local và được ignore; asset dùng khi chạy nằm tại `src/assets/`. Đọc [AGENTS.md](AGENTS.md) để biết quy tắc module và phiên/cache.

## Kiểm chứng

```bash
npm run typecheck
npm run lint
npm run test:unit
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

`npm test` chạy toàn bộ unit/E2E của nền mới. Playwright tự build và chạy production preview tại `127.0.0.1:4173`, có thể đổi cổng bằng `E2E_PORT`. Kết quả browser test ở `playwright-report/`, trace/lỗi ở `test-results/`; chúng không được commit.

Production host cần fallback các URL SPA về `index.html` và phục vụ `/assets/*` như file tĩnh. T00 chỉ kiểm tra local preview; chưa chuyển traffic hoặc deploy.

Plan/đặc tả và hồ sơ T00/T01/T02 nằm trong workspace `../docs/superpowers/`. Hoàn tất từng plan → người dùng review/commit → sang plan tiếp theo; agent không tự commit/push/deploy.
