export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type Profile = {
  fullname: string;
  phone: string | null;
  address: string | null;
  gender: Gender | null;
  class: number | null;
  email: string;
  age?: number;
};
export type ProfilePatch = Pick<Profile, 'fullname' | 'address' | 'gender' | 'class'> & { phone: string };
export type ProfileScope = { ownerId: number; revision: number };
