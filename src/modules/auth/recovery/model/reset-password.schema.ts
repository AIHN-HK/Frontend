import { z } from 'zod';

export const recoveryEmailSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Vui lòng nhập email hợp lệ.'),
});
export type RecoveryEmailForm = z.infer<typeof recoveryEmailSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự.').max(72, 'Mật khẩu không được quá 72 ký tự.'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới.'),
}).refine(values => values.newPassword === values.confirmPassword, {
  path: ['confirmPassword'], message: 'Mật khẩu xác nhận không khớp.',
});
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
