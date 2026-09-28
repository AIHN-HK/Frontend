import { z } from "zod";

export const newpasswordForm = z
  .object({
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

export type NewpasswordFormData = z.infer<typeof newpasswordForm>;
