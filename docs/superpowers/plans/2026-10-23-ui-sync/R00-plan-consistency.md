# R00 — Chuẩn hóa bộ plan theo commit

**Goal:** Có bộ P00–P18 nhất quán để tiếp tục trên nhánh mới mà không làm lại P00–P05.

**Files:** README.md, CONTRACTS.md và các plan trong thư mục này.

**Commit:** `docs(ui): align sequential migration plans and evidence paths`.

- [x] Tạo nhánh mới `feat/ui-sync-aihn-sequential` từ `e58489c` trong worktree riêng.
- [x] Giữ một màn hoặc một foundation increment trong mỗi plan/commit; recovery giữ hai route cùng một flow.
- [x] Đổi tham chiếu Task/U cũ sang P; thống nhất evidence trong repo và ảnh local.
- [x] Bỏ phụ thuộc vòng P02/P03 và đề xuất gộp commit nền cũ.
- [x] Phân biệt checklist yêu cầu với evidence lịch sử; không tự tick toàn bộ yêu cầu Completed.
- [x] Kiểm 15 HTML được map đúng một plan; link nội bộ và manifest còn hợp lệ; `git diff --check`.
- [x] Khởi chạy baseline hiện tại trước khi triển khai P06; lỗi guard kế thừa được tách sang R01, không coi kết quả cũ là pass mới.

P06–P18 thực thi tuần tự; mỗi plan đọc source HTML sống, đọc page/API/test hiện có, chỉ đổi UI trong scope, kiểm behavior/viewport/theme/motion, ghi evidence rồi commit. Không sửa backend/scoring, không push/merge/deploy.
