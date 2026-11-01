import { z } from 'zod';

export const signupSchema = z.object({
  fullname: z.string().trim().min(1, 'Nhập họ và tên.'),
  email: z.string().trim().email('Nhập email hợp lệ.'),
  yob: z.string().refine(value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return value <= localDate;
  }, 'Ngày sinh cần hợp lệ và không sau hôm nay.'),
  phone: z.string().trim().min(1, 'Nhập số điện thoại.'),
  password: z.string().min(8, 'Mật khẩu cần từ 8 ký tự.').max(72, 'Mật khẩu tối đa 72 ký tự.'),
});

export type SignupForm = z.infer<typeof signupSchema>;
