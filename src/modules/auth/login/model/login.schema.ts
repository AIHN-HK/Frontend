import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Nhập email hợp lệ.'),
  password: z.string().min(1, 'Nhập mật khẩu.'),
  rememberMe: z.boolean(),
});
export type LoginForm = z.infer<typeof loginSchema>;
