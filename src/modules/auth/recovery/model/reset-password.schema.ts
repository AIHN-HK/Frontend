import { z } from 'zod';

export const recoveryEmailSchema = z.object({
  email: z.string().trim().min(1, 'Nhập email của bạn.').email('Nhập email hợp lệ.'),
});
export type RecoveryEmailForm = z.infer<typeof recoveryEmailSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Mật khẩu cần từ 8 ký tự.').max(72, 'Mật khẩu tối đa 72 ký tự.'),
  confirmPassword: z.string().min(1, 'Nhập lại mật khẩu mới.'),
}).refine(values => values.newPassword === values.confirmPassword, {
  path: ['confirmPassword'], message: 'Hai mật khẩu chưa khớp.',
});
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
