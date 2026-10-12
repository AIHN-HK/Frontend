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

## Phạm vi T00

Nền ứng dụng và bản xem trước shell tại `/preview/student`, `/preview/admin`, `/preview/auth`. Các URL preview chỉ trình bày layout/UI, không có phiên hay dữ liệu cá nhân. `/` và `/login` hiển thị trạng thái chưa sẵn sàng; Home/auth nghiệp vụ sẽ được triển khai ở T01/T02. Các route được bảo vệ yêu cầu đăng nhập; xác minh admin thuộc T18.

Mẫu gốc ở `design-reference/`. Mã Expo trước chuyển đổi ở `legacy/expo/`, ngoài cây build. Đọc [AGENTS.md](AGENTS.md) để biết quy tắc module và phiên/cache.

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

Plan/đặc tả và hồ sơ T00 nằm trong workspace `../docs/superpowers/`. Hoàn tất từng plan → người dùng review/commit → sang plan tiếp theo; agent không tự commit/push/deploy.
