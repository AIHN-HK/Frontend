export const templates = {
  software: { name: 'Kỹ sư Phần mềm', careerId: 'preview-software', tasks: ['Khám phá môn Toán, Tin học và sở thích cá nhân.', 'Tìm hiểu tổ hợp xét tuyển từ thông báo chính thức của trường.', 'Thử xây dựng ứng dụng nhỏ và ghi lại điều học được.', 'Tìm hiểu yêu cầu thực tập và chuẩn bị hồ sơ dự án.'] },
  data: { name: 'Kỹ sư Dữ liệu', careerId: 'preview-data-engineer', tasks: ['Khám phá môn Toán, Tin học và cách đặt câu hỏi.', 'Đối chiếu điều kiện tuyển sinh ở nguồn chính thức.', 'Thử xây dựng báo cáo dữ liệu nhỏ.', 'Tìm hiểu vị trí thực tập về dữ liệu và chuẩn bị dự án.'] },
} as const;
export const stages = ['Lớp 10–11 THPT — Định hình Năng khiếu & Tổ hợp môn', 'Lớp 12 THPT — Ôn thi Tốt nghiệp & Xét tuyển Đại học', 'Năm 1–2 Đại học — Kiến thức Chuyên ngành & Dự án', 'Năm 3–4 Đại học — Thực tập Doanh nghiệp & Việc làm'];
export type TemplateId = keyof typeof templates;
export function templateId(value: string | null): TemplateId | null { return value === 'software' || value === 'data' ? value : null; }
