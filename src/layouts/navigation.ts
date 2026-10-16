import { paths } from '@/routes/paths';
import type { IconName } from '@/shared/ui/Icon';

export type NavigationItem = { label: string; mobileLabel?: string; path: string; icon: IconName; group: string; bottom?: boolean };

export const studentNavigation: NavigationItem[] = [
  { label: 'Trang của tôi', mobileLabel: 'Trang chủ', path: paths.dashboard, icon: 'home', group: 'Không gian học tập', bottom: true },
  { label: 'Hồ sơ của tôi', mobileLabel: 'Hồ sơ', path: paths.careerProfile, icon: 'user', group: 'Không gian học tập', bottom: true },
  { label: 'Trắc nghiệm Holland', mobileLabel: 'Holland', path: paths.assessment, icon: 'compass', group: 'Không gian học tập', bottom: true },
  { label: 'Gợi ý nghề nghiệp', path: paths.recommendations, icon: 'check', group: 'Không gian học tập' },
  { label: 'Khám phá nghề nghiệp', mobileLabel: 'Khám phá', path: paths.careers, icon: 'search', group: 'Khám phá & Phát triển', bottom: true },
  { label: 'Lộ trình phát triển', path: paths.roadmap, icon: 'roadmap', group: 'Khám phá & Phát triển' },
  { label: 'Cố vấn AI', mobileLabel: 'Cố vấn AI', path: paths.advisor, icon: 'chat', group: 'Khám phá & Phát triển', bottom: true },
  { label: 'Lịch sử', path: paths.history, icon: 'history', group: 'Tài khoản & Cài đặt' },
  { label: 'Cài đặt', path: paths.settings, icon: 'settings', group: 'Tài khoản & Cài đặt' },
];

export const adminNavigation: NavigationItem[] = [
  { label: 'Tổng quan', path: paths.admin, icon: 'home', group: 'Quản trị hệ thống' },
  { label: 'Ngân hàng câu hỏi', path: paths.adminQuestions, icon: 'library', group: 'Trắc nghiệm Holland' },
  { label: 'Cấu hình chấm điểm', path: paths.adminScoring, icon: 'compass', group: 'Trắc nghiệm Holland' },
  { label: 'Nội dung Holland', path: paths.adminHollandContent, icon: 'library', group: 'Trắc nghiệm Holland' },
  { label: 'Dữ liệu nghề nghiệp', path: paths.adminCareers, icon: 'search', group: 'Dữ liệu & Người dùng' },
  { label: 'Quản lý sinh viên', path: paths.adminStudents, icon: 'user', group: 'Dữ liệu & Người dùng' },
];
