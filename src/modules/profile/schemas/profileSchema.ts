import { z } from "zod";

export const profileSchema = z.object({
  fullname: z.string().trim().min(1, "Họ tên không được để trống").max(120, "Họ tên tối đa 120 ký tự"),
  phone: z.string().trim().regex(/^0\d{9}$/, "Nhập số điện thoại 10 chữ số, bắt đầu bằng 0"),
  address: z.string().trim().max(500, "Địa chỉ tối đa 500 ký tự").transform(value => value || null),
  gender: z.enum(["", "MALE", "FEMALE", "OTHER"]).transform(value => value || null),
  class: z.string().trim().refine(value => value === "" || /^(?:[1-9]|1[0-2])$/.test(value), "Lớp phải là số nguyên từ 1 đến 12").transform(value => value === "" ? null : Number(value)),
});
export type ProfileDraft = z.input<typeof profileSchema>;
export type UpdatePersonalProfile = z.output<typeof profileSchema>;
export type UserProfile = {
  fullname: string;
  email: string;
  age: number;
  phone: string | null;
  address: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  class: number | null;
};
export const toProfileDraft = (profile: UserProfile): ProfileDraft => ({
  fullname: profile.fullname,
  phone: profile.phone ?? "",
  address: profile.address ?? "",
  gender: profile.gender ?? "",
  class: profile.class?.toString() ?? "",
});
