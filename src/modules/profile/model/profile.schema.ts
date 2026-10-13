import { z } from 'zod';
import type { Profile, ProfilePatch } from './profile.types';

export const profileSchema = z.object({
  fullname: z.string().trim().min(1, 'Vui lòng nhập họ và tên.').max(120, 'Họ và tên tối đa 120 ký tự.'),
  phone: z.string().trim().regex(/^0\d{9}$/, 'Số điện thoại cần 10 chữ số, bắt đầu bằng 0.'),
  address: z.string().trim().max(500, 'Địa chỉ tối đa 500 ký tự.'),
  gender: z.enum(['', 'MALE', 'FEMALE', 'OTHER'], { error: 'Vui lòng chọn giới tính hợp lệ.' }),
  class: z.string().refine(value => value === '' || /^(?:[1-9]|1[0-2])$/.test(value), 'Lớp cần là số nguyên từ 1 đến 12.'),
});
export type ProfileForm = z.infer<typeof profileSchema>;

export function profileToForm(profile: Profile): ProfileForm {
  return { fullname: profile.fullname, phone: profile.phone ?? '', address: profile.address ?? '', gender: profile.gender ?? '', class: profile.class === null ? '' : String(profile.class) };
}

export function toProfilePatch(form: ProfileForm): ProfilePatch {
  const fields = profileSchema.parse(form);
  return { fullname: fields.fullname, phone: fields.phone, address: fields.address || null, gender: fields.gender || null, class: fields.class === '' ? null : Number(fields.class) };
}
