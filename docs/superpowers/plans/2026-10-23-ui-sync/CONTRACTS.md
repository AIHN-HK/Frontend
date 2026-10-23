# UI sync shared contracts

## 1. Phạm vi, quyết định và bằng chứng hiện tại

Ngày lập plan: **23/10/2026**, múi giờ Asia/Saigon. Người dùng đã yêu cầu tách thành các plan nhỏ một commit và triển khai tuần tự. Được phép tạo commit local cho từng plan sau kiểm thử/review; không push/merge/deploy.

Nguồn yêu cầu: prompt người dùng đính kèm, tiêu đề `Migrate AIHN Career UI mockups → React + Ant Design frontend`.

Nguồn thiết kế sống:

```text
/home/hoang/open-design/.od/projects/183966d9-0488-4ad3-ac9e-57774fc5a6ab/
  screens/*.html
  styles/screens/aihn-system.css
  assets/hero-student.png
  assets/student-male-laptop.jpg
```

Đã đọc `aihn-system.css` trước khi khảo sát HTML; cả 15 HTML thuộc phạm vi đều import file này. CSS phần riêng của các màn mới chủ yếu nằm trong `<style>` của HTML, không được mặc định lấy các `styles/screens/<screen>.css` cũ.

| Hạng mục | Khảo sát trực tiếp | Quyết định cho plan |
| --- | --- | --- |
| Git workspace | `/home/hoang/do-an` không phải Git repo; `Frontend` và `Backend` độc lập | Mọi lệnh Git frontend chạy trong `Frontend` |
| Frontend | Nhánh `fix/web-runtime-and-readability`, sạch, HEAD `2e26e57` | Task 00 tạo `feat/ui-sync-aihn-design` từ HEAD đang được kiểm tra lại |
| Backend | Cùng tên nhánh, sạch, HEAD `3f5f21d` | Chỉ đọc contract; không sửa backend trong đợt UI |
| Router và structure | Router v8, `src/modules`, đã có đủ các nhóm page | **Người dùng đã chọn giữ v8 + src/modules**; thay thế yêu cầu v6 + `src/pages` trong prompt |
| Dependencies | Đã có `antd`, `gsap`, `socket.io-client` | Không chạy `npm install gsap`, không thêm UI/chart/motion library |
| Số màn | 17 HTML trong `screens`; prompt liệt kê 15 | Port đúng 15 màn; `home.html`, `holland-test.html` chỉ kiểm thử hồi quy |
| Easing | CSS thật là `cubic-bezier(0.16, 1, 0.3, 1)`; prompt ghi `(0.34, 1.56, 0.64, 1)` | Giá trị prompt được ưu tiên: giữ nguyên các token khác, override riêng `--ce-ease`; ghi delta này trong evidence |
| Routing hiện tại | `/` là Home; career catalog/detail public; OTP ở `/verify-otp` | Đổi `/` thành redirect theo session; career routes protected theo prompt; thêm `/otp-verify` canonical, giữ alias `/verify-otp` |
| Kết quả Holland | Có query/result parser/snapshot normalization/radar thật | Chỉ thay UI; giữ server TopCode và mẫu số từ snapshot lịch sử |
| Nghề/gợi ý/lộ trình | Route runtime trỏ `modules/career-platform` | Sửa page runtime này; không thay bằng các page preview cũ |
| Cài đặt appearance | Đang có preset/accent/background/sidebar | Canvas mới cố định dark `#121214`; không để preset cũ override token mới; giữ cấu hình lưu để tương thích ngoài scope |

`home.html` không có task port; việc thay route `/` là yêu cầu routing riêng của prompt. Không xóa Home source, preview hay admin. Các route preview hiện hữu tiếp tục bị phân biệt với runtime và không được cấp session giả. Các route admin tiếp tục dùng guard/quyền hiện có.

Không dựa vào số test hoặc trạng thái “đã hoàn thành” trong các hồ sơ cũ để tuyên bố phiên bản hiện tại pass. Task 00 phải lấy baseline mới.

### Cách tiếp cận đã chọn

1. **Đồng bộ tại chỗ theo domain đang chạy — chọn:** ít đổi contract, giữ regression coverage, mỗi màn review độc lập.
2. Viết một frontend `src/pages` song song: nhân đôi route và state, dễ sửa nhầm preview; không dùng.
3. Copy nguyên HTML/script vào React: giữ được ảnh mẫu sớm nhưng gây dữ liệu giả, listener toàn trang và animation không cleanup; không dùng.

## 2. File ownership và screen map

Mọi đường dẫn source/test bên dưới tính từ `/home/hoang/do-an/Frontend`. Tài liệu plan/evidence ở parent `/home/hoang/do-an/docs/superpowers/` theo quy ước workspace hiện tại; các file đó không tự nằm trong commit frontend.

### Foundation và shared UI

| File | Trách nhiệm |
| --- | --- |
| `src/shared/styles/tokens.css` | Thêm nguyên tên/value bộ `--ce-*`, trừ override easing được ghi rõ |
| `src/shared/styles/ce-base.css` | Reset/base chỉ dưới `.ce-app`, canvas, font, focus, responsive, reduced motion |
| `src/shared/ui/ce/RadarChart.tsx` | SVG thuần `viewBox="0 0 150 150"`, nhận vector 0–100/null đã chuẩn hóa |
| `src/shared/ui/ce/RadarChart.module.css` | Trình bày radar, không fetch/normalize dữ liệu |
| `src/shared/ui/ce/ShowcaseCard.tsx` | Gradient, waves, slot nội dung/ảnh; nhận nội dung qua props |
| `src/shared/ui/ce/ShowcaseCard.module.css` | Frame/ảnh/badge đúng vị trí, responsive |
| `src/shared/ui/ce/RiasecBar.tsx` | Thanh dữ liệu hợp lệ hoặc unavailable; animation `--tw`, accessibility |
| `src/shared/ui/ce/RiasecBar.module.css` | Track/fill, màu theo `var(--ce-r)` … |
| `src/layouts/components/AppHeader.tsx` | Navigation/session controls dùng API auth hiện có; shell component, không thuộc shared thuần |
| `src/layouts/components/AppHeader.module.css` | Header 64px, link active, điều hướng mobile bằng HTML/CSS |
| `src/shared/ui/ce/TimelineSidebar.tsx` | 26px nodes; step state và radar nhận props, không giả hoàn thành |
| `src/shared/ui/ce/TimelineSidebar.module.css` | Sidebar 420px/460px, sticky/scroll, ẩn ≤1024 |
| `src/shared/ui/ce/CareerScreenFrame.tsx` | Bố cục main/optional sidebar, không fetch hoặc tự lồng header |
| `src/shared/ui/ce/CareerScreenFrame.module.css` | 2-column grid và breakpoint |
| `src/layouts/components/CareerThemeBoundary.tsx` | `.ce-app` + ConfigProvider; message/modal context cùng theme |
| `src/layouts/StudentLayout.tsx` | Một AppHeader + một main Outlet cho runtime student |
| `src/layouts/AuthLayout.tsx` | Auth dark canvas/waves, không student header/sidebar |
| `src/layouts/CareerCatalogLayout.tsx` | Dark shell cho career routes sau khi chuyển sang protected |
| `src/routes/EntryRedirect.tsx` | Chờ hydration, điều hướng `/` theo session/role thật |

Shared components không import module, layout, router hoặc app. `AppHeader` có session/navigation nên đặt trong `layouts/components`; đây là tên component yêu cầu nhưng theo ownership hiện có, không tạo root `src/components` song song.

### 15 màn, route và CSS Module đích

| Task | HTML | Route canonical | Page runtime cần sửa/tạo | CSS Module mới |
| --- | --- | --- | --- | --- |
| 04 | `assessment-result.html` | `/assessment/results/:attemptId` | `src/modules/assessment/results/pages/AssessmentResultPage.tsx` | cùng thư mục: `AssessmentResultPage.module.css` |
| 05 | `dashboard.html` | `/dashboard` | `src/modules/dashboard/pages/DashboardPage.tsx` | `DashboardPage.module.css` |
| 06 | `recommendations.html` | `/recommendations` | `src/modules/career-platform/pages/CareerRecommendationsPage.tsx` | `CareerRecommendationsPage.module.css` |
| 07 | `recommendation-detail.html` | `/recommendations/:recommendationId` | tạo `src/modules/career-platform/pages/CareerRecommendationDetailPage.tsx` | `CareerRecommendationDetailPage.module.css` |
| 08 | `career-explorer.html` | `/careers` | `src/modules/career-platform/pages/CareerCatalogPage.tsx` | `CareerCatalogPage.module.css` |
| 09 | `career-detail.html` | `/careers/:careerId` | `src/modules/career-platform/pages/CareerRuntimeDetailPage.tsx` | `CareerRuntimeDetailPage.module.css` |
| 10 | `roadmap.html` | `/roadmap` | `src/modules/career-platform/pages/CareerRoadmapPage.tsx` | `CareerRoadmapPage.module.css` |
| 11 | `advisor.html` | `/advisor` | `src/modules/advisor/pages/AdvisorPage.tsx` | `AdvisorPage.module.css` |
| 12 | `career-profile.html` | `/career-profile` | `src/modules/profile/pages/CareerProfilePage.tsx` | `CareerProfilePage.module.css` |
| 13 | `history.html` | `/history` | `src/modules/history/pages/HistoryPage.tsx` | `HistoryPage.module.css` |
| 14 | `settings.html` | `/settings` | `src/modules/settings/pages/SettingsPage.tsx` | `SettingsPage.module.css` |
| 15 | `login.html` | `/login` | `src/modules/auth/login/pages/LoginPage.tsx` | `LoginPage.module.css` |
| 16 | `signup.html` | `/signup` | `src/modules/auth/registration/pages/SignupPage.tsx` | `SignupPage.module.css` |
| 17 | `otp-verify.html` | `/otp-verify` | `src/modules/auth/verification/pages/OtpVerifyPage.tsx` | `OtpVerifyPage.module.css` |
| 18 | `forgot-reset-password.html` | `/forgot-password`, `/reset-password` | `src/modules/auth/recovery/pages/ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx` | riêng `ForgotPasswordPage.module.css`, `ResetPasswordPage.module.css` |

Một HTML recovery biểu diễn hai trạng thái/luồng hiện có; giữ hai page và URL, cùng một task nghiệm thu. `LatestAssessmentResultPage.tsx` tiếp tục tìm attempt gần nhất, không hardcode ID từ mẫu.

`career-platform/components/platform.css` và `PlatformUI.tsx` còn được admin/profile dùng. Không xóa hoặc đổi toàn cục để style một page. Trích xuất phần runtime cần thiết thành component có CSS Module trong cùng domain; giữ preview/admin chạy được. CSS page cũ chỉ xóa khi đã kiểm tra không còn consumer; không xóa cả archive.

## 3. Hợp đồng UI, theme, animation và dữ liệu

### Ant Design

Chỉ dùng **Form, Input, Select, Button, Switch, Modal, Tabs, message, Tooltip** làm UI. ConfigProvider và theme API là hạ tầng được prompt yêu cầu. Không dùng Layout/Menu/Card/Typography, cũng không tự thêm Table/Steps/Progress/Upload/Drawer từ antd. Dùng native semantic HTML cho table, progress, nav, avatar file input và mobile navigation.

ConfigProvider được scope trong `CareerThemeBoundary`, tránh thay theme admin/preview. Theme cấu hình bằng `ThemeConfig` từ dependency đang cài:

```tsx
import { ConfigProvider, theme } from 'antd';
import type { ThemeConfig } from 'antd';

const careerTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgContainer: '#161618',
    colorBgElevated: 'rgba(255,255,255,0.06)',
    colorBorder: 'rgba(255,255,255,0.12)',
    colorText: '#d4d4d8',
    colorPrimary: '#8b5cf6',
    borderRadius: 10,
  },
};

// careerTheme thuộc file CareerThemeBoundary.tsx.
// children nằm trong wrapper .ce-app với ConfigProvider trên.
```

Các literal trên được phép ở **một** cấu hình theme theo prompt; page CSS dùng `var(--ce-*)`. Nếu màu trong HTML chưa có token, thêm semantic `--ce-*` một lần ở tokens, không thay bằng màu gần giống hoặc rải hex khắp page. Không đổi tên/xóa token cũ vì admin, preview, Holland vẫn có thể dùng.

`message.useMessage()` và `Modal.useModal()` trả context holder; render holder bên trong theme boundary tại consumer cần dùng. Không dùng static `message.success`/`Modal.confirm` để rồi popup rơi ra theme. Không thêm một global notification store.

CSS `.ce-app` có `min-height:100dvh`, background `var(--ce-bg-main)`, `color`, font và box sizing kế thừa. Không copy reset `* { margin:0; padding:0 }` toàn ứng dụng. Overlay portal truyền container thuộc boundary khi thích hợp; kiểm tra Select dropdown, Tooltip, Modal và message thực tế. Không thêm `antd/dist/reset.css` toàn cục nếu chưa chứng minh không phá màn ngoài scope.

### HTML → JSX/CSS Module

- Giữ semantic và bố cục HTML; `class` → `className`, `for` → `htmlFor`, JSX SVG camelCase (`strokeWidth`, `fillRule`, `clipPath`, `strokeLinecap`). `aria-*`/`data-*` giữ nguyên.
- Page-local class giữ tên như `ar-score-row`: `className={styles['ar-score-row']}`. Selector GSAP dùng refs hoặc `data-ce-enter`, không truy vấn tên CSS Module chưa hash.
- Không copy inline `onclick`, thao tác `innerHTML`, `.style.display` hay script giả server. Tất cả event dùng React handlers/state hiện có.
- `style` custom properties phải có TypeScript type; không tắt strict/ESLint. Ví dụ bar props nội bộ:

```tsx
import type { CSSProperties } from 'react';
type BarStyle = CSSProperties & { '--tw': string };
const barStyle: BarStyle = { '--tw': `${percentage}%`, width: `${percentage}%` };
```

`percentage` là số đã validate 0–100; missing là `null`, không đổi thành zero. Dùng `fromTo(...,{width:0},{width:target})` khi có motion. Base style luôn là target để reduced motion, effect chưa chạy hoặc cleanup vẫn đọc được giá trị đúng; không giữ `width:0` vĩnh viễn như ví dụ prompt.

### GSAP

Giữ timing/ease/sequence biểu đạt trong từng HTML, thay script toàn trang bằng effect scoped/ref + cleanup. Không thêm `@gsap/react` vì `gsap.context` đã đủ và package này chưa có trong dependencies. Áp dụng hướng dẫn skill `gsap-react`: scope và `ctx.revert()` bắt buộc.

RiasecBar animate trong component riêng khi `percentage` đổi, kể cả snapshot tải sau result. Page entrance chạy khi nội dung thực sự ready, không chỉ lúc mount loading placeholder. Ví dụ effect hoàn chỉnh để dùng trong `RiasecBar`:

```tsx
const fillRef = useRef<HTMLSpanElement>(null);
useEffect(() => {
  const fill = fillRef.current;
  if (!fill || percentage === null) return;
  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(fill, { width: 0 }, {
        width: `${percentage}%`, duration: 0.85,
        ease: 'power2.out', delay: 0.4,
      });
    });
  }, fill);
  return () => ctx.revert();
}, [percentage]);
```

Các import `useEffect`, `useRef`, `gsap` đặt trong file bar; fill nhận `ref` và `barStyle` ở trên. Hover đơn giản dùng CSS; callback tạo tween phải thuộc GSAP context hoặc được kill khi cleanup. Effect không tạo fetch, POST, socket mới hoặc giả message. Không dùng `setTimeout` để mô phỏng AI response/success.

Radar shared giữ `viewBox 0 0 150 150`, tâm 75/75, bán kính 50 theo template; mọi điểm theo vector props. Danh sách thứ tự R/I/A/S/E/C cố định cho geometry, không tính lại server TopCode. All-zero vẽ đúng tâm; null được diễn đạt “Chưa có dữ liệu”, không vẽ polygon cá nhân hoàn chỉnh khi vector thiếu. Có `useId`, title/desc riêng mỗi instance và chú giải văn bản đọc được. Tránh ID trùng khi cùng page có radar chính và sidebar.

### Dữ liệu và side effects

- Holland vẫn boolean `answers: [{ questionId, check: boolean }]`. Không hardcode 60, không đổi qua Likert. Tỷ lệ điểm người dùng lấy từ snapshot của chính attempt, không dùng ngân hàng câu hỏi hiện tại.
- Career O*NET RIASEC 1–7, self-rated interests 0–5 và result percentages 0–100 là ba thang khác nhau. Shared radar chỉ nhận dữ liệu đã chuyển đổi kèm nhãn đúng thang; không tự xem vector O*NET là phần trăm phù hợp.
- Gợi ý runtime có `run.id`, `attemptId`, `input.profileRevision`, `items[].careerId`, score/components/contributions/missing/gaps và source. Giữ nhãn “điểm xếp hạng /100”, không diễn giải thành xác suất thành công hay copy “92% phù hợp” từ HTML.
- Schema run trả một danh sách nghề. `/recommendations/:recommendationId` hiện có ID của **run**, không phải ID nghề. Task 07 giữ ID đó và dùng query `careerId` để chọn item; không bịa endpoint detail hoặc lấy item đầu khi thiếu ID.
- Query cá nhân giữ owner/revision trong key; truyền AbortSignal. Không thêm cache chung khiến tài khoản B thấy radar, history hay roadmap A.
- Không retry/replay mutation tự động; unknown outcome giữ draft và có explicit đọc lại trạng thái trước khi retry. UI không báo “đã lưu” nếu chưa xác nhận server.
- Sidebar “completed/active” lấy từ dữ liệu thật. Nếu không có nguồn cho một bước thì không đánh dấu completed chỉ để giống mẫu.
- Ảnh sinh viên là minh họa tĩnh, không giả avatar của tài khoản. Avatar thật vẫn dùng upload/preview/lỗi hiện có. Không thêm lương VN, trường/khóa học, social login, notification settings hoặc AI text giả để lấp chỗ trống.

## 4. Workflow và nghiệm thu áp dụng cho từng task

Không làm liên tiếp 15 desktop screen rồi mới nối API/mobile. Hoàn tất task nền, sau đó hoàn tất từng screen theo thứ tự bên dưới. Mỗi screen gồm các bước nhỏ: mở source; mở page/API/test; thêm assertion có ý nghĩa; chạy và xác nhận RED nếu là hành vi mới; đổi một khối UI; chạy scoped checks; so sánh desktop; so sánh mobile; review; checkpoint.

Không viết unit test chỉ để mirror class hoặc màu literal. Với UI port, ưu tiên browser assertion cho layout/keyboard/animation/route và chạy lại test behavior đang có. Unit chỉ thêm khi có logic mới như parse selector cho detail, vector normalization hoặc dữ liệu missing/zero.

Evidence mỗi màn đặt tại:

```text
/home/hoang/do-an/docs/superpowers/execution/ui-sync-aihn-design/
  U00.md ... U19.md
  evidence/<screen>/reference-390.png
  evidence/<screen>/reference-768.png
  evidence/<screen>/reference-1440.png
  evidence/<screen>/implementation-390.png
  evidence/<screen>/implementation-768.png
  evidence/<screen>/implementation-1440.png
```

U00–U19 khớp task number, không ghi đè hồ sơ T00–T24 cũ. Chụp cả source nguyên bản và implementation; nếu dựng reference cùng dữ liệu fixture, lưu riêng `reference-fixture-*` và mô tả thay đổi. Không sửa HTML gốc để làm ảnh diff đẹp hơn.

Khi chạy command ở các task, working directory là `Frontend`. Dùng `pnpm exec playwright test <specs>` để chạy scoped suite; runner hiện tự build rồi mở production preview. Script runner hiện gọi npm ở bên trong để dispatch scripts, không có nghĩa chuyển package manager hoặc tạo `package-lock.json`. Giữ Node/pnpm/lockfile hiện tại.

**Gate G cho mỗi màn:**

- [ ] `pnpm run typecheck` và `pnpm run lint` pass.
- [ ] Chạy đúng spec liệt kê ở task; fixture phản ánh contract thật, không seed mock vào runtime.
- [ ] Review side-by-side ở 390×844, 768×1024, 1440×900; kiểm tra 320px, boundary 768/769 và 1024/1025; ≥1600px kiểm sidebar 460px khi có.
- [ ] Không horizontal overflow; sidebar đúng loại ẩn ≤1024, main stack ≤768; auth không bị `overflow:hidden` cắt form trên màn thấp.
- [ ] Entrance chạy ở no-preference; reduced-motion nội dung/bar hiện ngay; remount, đổi attempt, query ready muộn không để opacity 0/width 0 hoặc tween cũ.
- [ ] Header chỉ một, một main landmark, keyboard/focus/skip link hoạt động; control hit area ≥44px dù timeline visual node là 26px.
- [ ] Các trạng thái applicable: loading/ready/empty/error/retry/forbidden/unavailable/unknown-save; không render số mẫu khi thiếu dữ liệu.
- [ ] Kiểm tra browser console/pageerror, image/font/request lỗi mới; popup cùng theme; tài khoản/session cách ly.
- [ ] `git diff --check`; review diff không sửa backend/scoring/legacy hoặc dependency ngoài phạm vi.
- [ ] Cập nhật Uxx với delta so HTML và mức bằng chứng `UI reviewed`/`Integrated local`/chưa verify; không ghi production pass.
- [ ] Checkpoint một màn. Nếu được giao thực thi cả prompt gồm commit từng màn, dùng message của task và stage đúng file; nếu phạm vi chỉ giao sửa màn thì tuân thủ `AGENTS.md`: dừng ở diff để user review/commit.

---


## Execution authorization

User: “chia ra thành các plan nhỏ để vừa hợp 1 commit, rồi triển khai từng plan luôn”. Mỗi plan P00–P18 là một commit local, thực thi theo thứ tự, không chờ xác nhận lặp lại. Không thay backend/scoring. User đã chọn giữ Router v8 và src/modules. Evidence và source manifest ghi trong `Frontend/docs/superpowers/execution/ui-sync/`.
