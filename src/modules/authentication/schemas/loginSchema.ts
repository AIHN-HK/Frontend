import { z } from "zod";

export const phoneRegex = /^0\d{9}$/;
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email hoặc số điện thoại")
    .trim()
    .refine(
      (value) =>
        phoneRegex.test(value) || z.string().email().safeParse(value).success,
      {
        message: "Email hoặc số điện thoại không hợp lệ",
      },
    ),
  password: z.string().min(8, "Mật khẩu ít nhất 8 ký tự"),
});
