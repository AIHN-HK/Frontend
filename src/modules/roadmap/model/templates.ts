export const templates = {
  software: {
    name: 'Kỹ sư Phần mềm',
    careerId: 'preview-software',
    tasks: [
      'Tìm hiểu Toán, Tin học và điều bạn thích.',
      'Xem tổ hợp xét tuyển trong thông báo của trường.',
      'Thử làm một ứng dụng nhỏ, ghi lại điều học được.',
      'Xem yêu cầu thực tập và chuẩn bị dự án để giới thiệu.',
    ],
  },
  data: {
    name: 'Kỹ sư Dữ liệu',
    careerId: 'preview-data-engineer',
    tasks: [
      'Tìm hiểu Toán, Tin học và tập đặt câu hỏi.',
      'Kiểm tra điều kiện tuyển sinh từ nguồn chính thức.',
      'Thử làm một báo cáo dữ liệu nhỏ.',
      'Xem vị trí thực tập dữ liệu và chuẩn bị một dự án.',
    ],
  },
} as const;
export const stages = [
  'Lớp 10–11: sở thích và tổ hợp môn',
  'Lớp 12: ôn thi và xét tuyển',
  'Năm 1–2: nền tảng và dự án nhỏ',
  'Năm 3–4: thực tập và tìm việc',
];
export type TemplateId = keyof typeof templates;
export function templateId(value: string | null): TemplateId | null {
  return value === 'software' || value === 'data' ? value : null;
}
