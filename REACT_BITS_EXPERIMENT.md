# Thử nghiệm React Bits

Worktree: `/home/hoang/do-an/.worktrees/react-bits-experiment`

Nhánh: `feat/react-bits-experiment`

Commit gốc: `2e26577c82a70e3cb59cef27605033257e00893e`

Node `24.18.1`, pnpm `10.33.2`. Cài bằng `pnpm install --frozen-lockfile`.

## Nguồn và cách điều chỉnh

Đã đọc source TypeScript/CSS và giấy phép tại commit React Bits
`e12c22192ac7b4b452c5e2feb9b586d74765d696`. Đây là các bản chuyển thể rút gọn,
không phải toàn bộ component upstream.

| Hiệu ứng | Nguồn chính xác | Mục đích / thay đổi |
| --- | --- | --- |
| [FadeContent](https://reactbits.dev/animations/fade-content) | [FadeContent.tsx](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/ts-default/Animations/FadeContent/FadeContent.tsx) | Giới thiệu Holland cho khách tại `/assessment`: chuyển nhánh `fade`, `trigger=mount`, `once` từ GSAP sang CSS keyframes; opacity `.65 → 1` trong `.45s`, easing tương đương `power2.out`. Không dùng blur, scroll, loop, stagger hoặc ẩn nội dung. |
| [SpotlightCard](https://reactbits.dev/components/spotlight-card) | [SpotlightCard.tsx](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/ts-default/Components/SpotlightCard/SpotlightCard.tsx), [SpotlightCard.css](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/ts-default/Components/SpotlightCard/SpotlightCard.css) | Thẻ danh mục `/careers`: giữ phép đổi tọa độ pointer sang tọa độ thẻ, radial spotlight, lớp trang trí và isolation; thay smoothing/RAF bằng CSS variables cập nhật qua React pointer handler cục bộ. Ánh tím theo token hiện tại, không ambient/proximity/grain/flare hoặc listener toàn trang. |
| [CountUp](https://reactbits.dev/text-animations/count-up) | [CountUp.tsx](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/ts-default/TextAnimations/CountUp/CountUp.tsx) | Lấy ý tưởng bộ đếm từ 0 tới số thật; viết lại bằng GSAP sẵn có, không thêm Motion. Chạy một lần khi số vào viewport, `.85s`, không overshoot; giữ chữ số thập phân và đơn vị hiện có. Dùng cho điểm/tỷ lệ Holland, thống kê Dashboard và điểm xếp hạng nghề. |
| [ShinyText](https://reactbits.dev/text-animations/shiny-text) | [ShinyText.tsx](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/ts-default/TextAnimations/ShinyText/ShinyText.tsx), [ShinyText.css](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/ts-default/TextAnimations/ShinyText/ShinyText.css) | Viết lại bằng gradient CSS quét một lần trong `1.3s`, không vòng RAF hoặc loop vô hạn. Giữ nguyên nhãn CTA, tên nghề đầu danh sách và nhãn hành động Dashboard; không thêm nhãn AI khuyên dùng hoặc xác suất phù hợp. |

Spotlight mặc định là `article`, hỗ trợ `section`/`div` và các thuộc tính HTML/ARIA;
thống kê Dashboard giữ `section` có nhãn. Các link và nội dung giữ nguyên. Bỏ entrance GSAP cũ
trên riêng các thẻ này để tránh chồng chuyển động. Keyboard có ánh sáng đứng yên
ở giữa và focus outline hiện hữu; touch dùng link bình thường và phản hồi viền
khi nhấn. Lớp ánh sáng không bắt pointer và không cắt focus outline.

CSS media query xử lý ngay cả khi `prefers-reduced-motion` đổi lúc trang mở:
intro hiển thị opacity cuối, spotlight tắt và bỏ dịch chuyển hover của thẻ,
CountUp hiển thị số cuối ngay, ShinyText giữ chữ thường có tương phản.
Fade/Spotlight/ShinyText không có effect hoặc vòng RAF mới. CountUp dùng
IntersectionObserver và tween GSAP; cleanup ngắt observer và kill tween khi đổi số,
đổi reduced motion hoặc unmount. Trình đọc màn hình nhận giá trị cuối qua nhãn
của nhóm `role="img"`; các frame trung gian được ẩn với accessibility tree.
Pointer handler do React quản lý, không cập nhật React state theo frame.

Không thêm dependency hoặc đổi lockfile/API/session lifecycle/query/scoring/dữ liệu.
Không sửa Home, Header, Footer hoặc global CSS/tokens. Ba component dùng chung nằm
trong `src/shared/ui/`; RiasecBar nhận thêm nội dung hiển thị tùy chọn.
Các route danh mục và chi tiết nghề đã được mở công khai theo yêu cầu riêng trước đó.

Giữ nguyên toàn bộ [giấy phép upstream](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/LICENSE.md)
trong `public/licenses/react-bits.txt` (MIT + Commons Clause, copyright David Haz).
Vite sao chép file này vào bundle tại `/licenses/react-bits.txt`; các file chuyển
thể cũng giữ notice tác giả và tham chiếu nguồn.

## File thay đổi

- `src/modules/assessment/guest/pages/GuestHollandPage.tsx`
- `src/modules/assessment/guest/pages/FadeContent.module.css`
- `src/modules/career-platform/pages/CareerCatalogPage.tsx`
- `src/shared/ui/SpotlightCard.tsx` và `SpotlightCard.module.css`
- `src/shared/ui/CountUp.tsx` và `CountUp.module.css`
- `src/shared/ui/ShinyText.tsx` và `ShinyText.module.css`
- `src/shared/ui/ce/RiasecBar.tsx`
- `src/modules/career-platform/components/CareerDashboardSummary.tsx`
- `src/modules/career-platform/pages/CareerRecommendationsPage.tsx`
- `src/modules/career-platform/pages/CareerRecommendationDetailPage.tsx`
- `src/modules/dashboard/pages/DashboardPage.tsx`
- `src/modules/assessment/results/pages/AssessmentResultPage.tsx`
- `src/modules/assessment/guest/pages/GuestResultPage.tsx`
- `tests/e2e/react-bits.spec.ts`
- `tests/e2e/shared-ui-effects.spec.ts`
- `public/licenses/react-bits.txt`
- `REACT_BITS_EXPERIMENT.md`

## Kiểm chứng lượt thử nghiệm Fade/Spotlight ban đầu

| Lệnh | Baseline | Sau thay đổi |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | Pass | Không đổi dependency/lockfile |
| `pnpm run typecheck` | Pass | Pass |
| `pnpm run lint` | Pass | Pass |
| `pnpm run test:unit` | 166/166 pass, 23 file | 166/166 pass, 23 file |
| `pnpm run build` | Pass | Pass; license có trong `dist/licenses/` |
| E2E liên quan | 42/42 pass trên snapshot HEAD riêng | 53/53 pass, gồm 11 test mới |
| `git diff --check` | — | Pass |

Lệnh E2E cuối, chạy trong worktree ứng dụng:

```sh
E2E_PORT=4190 pnpm exec playwright test tests/e2e/react-bits.spec.ts tests/e2e/guest-assessment.spec.ts tests/e2e/career-platform.spec.ts tests/e2e/home.spec.ts
```

Đã chạy Chromium thật qua Playwright: hover, keyboard/focus/Enter, touch context,
reduced motion bật trước và đổi trực tiếp, vào/ra màn hình, loading/error/retry/empty,
luồng làm bài/xem kết quả và route bảo vệ. Đã chụp hai màn hình ở
320/390/768/769/1024/1025/1440px; đã mở xem ảnh 390/768/1440px và ảnh hover.
Ảnh Home gồm Header/Footer tại 390/768/1440px giống từng byte với snapshot HEAD.

Các test dùng fixture sẵn có, không sửa guard hoặc tạo account trong production
code. Backend `localhost:3000` hiện không chạy: chưa xác minh với tài khoản thật,
API thật hoặc dữ liệu production. Đã xem thêm `/assessment` không mock khi API
không sẵn sàng và xác nhận hiển thị lỗi tải câu hỏi.

Lỗi baseline giữ nguyên: trang giới thiệu Holland tại đúng 768px có `scrollWidth=774`
do nút carousel bên phải. Đo trực tiếp cả bản build HEAD riêng và bản mới đều 774px;
test mới so sánh hình học với DOM intro gốc, không che overflow. Các kích thước
khác trong lượt kiểm tra không tràn ngang. Ba lỗi Home trong lượt chạy baseline
ban đầu không tái hiện khi chạy baseline riêng (42/42 pass).

Build vẫn có cảnh báo chunk lớn hơn 500kB như baseline. `pnpm install` cảnh báo
build script `unrs-resolver` bị bỏ qua; tất cả gate vẫn pass, không đổi thiết lập.

Log, source upstream đã đọc, snapshot baseline và số đo đối chiếu nằm trong
`.superpowers/react-bits/` (ignored); ảnh màn hình trong `test-results/`, báo cáo
browser trong `playwright-report/`. Không tạo commit/merge/push/deploy.

## Kiểm chứng mở rộng ba component dùng chung

- `pnpm run typecheck`, `pnpm run lint`, `git diff --check`: pass.
- `pnpm run test:unit`: 23 file, 166/166 test pass.
- Chromium: 96/96 test liên quan pass trong một lượt, gồm
  `shared-ui-effects`, `react-bits`, `career-platform`, `dashboard`, `result`
  và `guest-assessment`. Sau chỉnh màu tiêu đề gợi ý đầu tiên, build mới và
  chạy lại `shared-ui-effects`: 9/9 pass; đây là các ca nằm trong 96 ca trên.
- Test mới xác nhận số có frame trung gian và kết thúc đúng số từ fixture,
  nhãn accessibility cố định, số 0 khác trạng thái thiếu dữ liệu, đổi attempt,
  reduced motion thay đổi trực tiếp, hover glow và keyboard mở đúng gợi ý đã lưu.
- Chụp Dashboard/kết quả/gợi ý ở 320/390/768/1440px; không tràn ngang.
  Đã mở xem ảnh Dashboard 1440px, gợi ý 390px và kết quả 768px ở build cuối.
- Evidence là fixture/browser tại local. Chưa xác minh lại API thật hoặc production;
  không commit/merge/push/deploy. Package và lockfile giữ nguyên.

Lệnh E2E mở rộng:

```sh
E2E_PORT=4191 pnpm exec playwright test tests/e2e/shared-ui-effects.spec.ts tests/e2e/react-bits.spec.ts tests/e2e/career-platform.spec.ts tests/e2e/dashboard.spec.ts tests/e2e/result.spec.ts tests/e2e/guest-assessment.spec.ts
```

## Xem thử

```sh
cd /home/hoang/do-an/.worktrees/react-bits-experiment
pnpm run build
pnpm run preview --host 127.0.0.1 --port 4188
```

- `http://127.0.0.1:4188/assessment`: dùng phiên chưa đăng nhập để xem fade ở intro.
- `http://127.0.0.1:4188/careers`: cần backend, không cần đăng nhập để xem
  spotlight trên dữ liệu nghề thật. Không có dữ liệu thì giữ nguyên empty/error state.
- `/assessment/guest-result` sau khi hoàn thành bài: bộ đếm số câu Có.
- `/assessment/results/:attemptId`: bộ đếm tỷ lệ đã chuẩn hóa hoặc điểm đã lưu.
- `/dashboard`: glow trên thống kê và bộ đếm số liệu hành trình đã có.
- `/recommendations` và `/recommendations/:id?careerId=...`: glow trên thẻ,
  nhãn chữ quét sáng và điểm xếp hạng giữ nguyên thang `/100`.
- Tắt reduced motion để xem chuyển động; bật lại để kiểm tra fallback.
- Có thể xem báo cáo fixture mà không cần backend bằng
  `pnpm exec playwright show-report` sau lượt E2E nêu trên.

Worktree gốc và Backend/AI-service giữ nguyên; thay đổi để chưa commit cho review.
