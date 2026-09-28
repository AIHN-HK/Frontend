import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().min(1, "Họ tên không được để trống"),
    email: z.string().email("Email không hợp lệ").trim(),
    birthDate: z
      .string()
      .nullable()
      .refine(
        (val): val is string | null =>
          val === null || /^\d{4}-\d{2}-\d{2}$/.test(val),
        {
          message: "Định dạng ngày không đúng (yyyy-mm-dd)",
        },
      )
      .refine((val) => val === null || new Date(val) <= new Date(), {
        message: "Ngày sinh không được ở tương lai",
      }),

    countryCode: z.string().min(2, "Vui lòng chọn mã quốc gia"),
    phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu ít nhất 8 ký tự")
      .regex(/[a-z]/, "Phải có ít nhất 1 chữ cái thường (a-z)")
      .regex(/[A-Z]/, "Phải có ít nhất 1 chữ cái in hoa (A-Z)")
      .regex(/[0-9]/, "Phải có ít nhất 1 chữ số (0-9)")
      .regex(/[^a-zA-Z0-9]/, "Phải có ít nhất 1 ký tự đặc biệt "),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
