import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Vui lòng nhập email hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
  rememberMe: z.boolean(),
});
export type LoginForm = z.infer<typeof loginSchema>;
