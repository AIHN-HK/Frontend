import z from "zod";

export const resetSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
});

export type ResetFormData = z.infer<typeof resetSchema>;
