export type RegisterPayload = {
  email: string;
  password: string;
  fullname: string;
  yob: string;
  phone: string;
  otpCode: string;
};

export type ResultEmail = {
  email: string;
  otp: string;
};

export type FormRequestNewPassword = {
  email: string;
  otp: string;
  newPassword: string;
};
export type LoginFormData = {
  email: string;
  password: string;
};
