import { authSession } from '@/helpers/authSession';
import axiosIns from "@/helpers/axiosInterceptors";

import {
  FormRequestNewPassword,
  RegisterPayload,
} from "@/modules/authentication/type/auth";
import { AuthAPI } from "./api";

export default {
  async logout() {
    const current = await authSession.read();
    try {
      if (current.accessToken) await axiosIns.post('/api/v1/auth/logout', undefined, { timeout: 10000, headers: { Authorization: `Bearer ${current.accessToken}` } });
    } finally { await authSession.clear(current.accessToken); }
  },
  async registerSendOTP(userEmail: string) {
    try {
      const response = await axiosIns.post(AuthAPI.REGISTER_SENDOTP, {
        email: userEmail,
      });

      return response.data;
    } catch (error) {

      throw error;
    }
  },

  async register(registerForm: RegisterPayload) {
    try {

      const response = await axiosIns.post(AuthAPI.REGISTER, registerForm);
      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  async login(loginForm: any) {
    try {

      const response = await axiosIns.post(AuthAPI.LOGIN, loginForm);

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại";
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng của bạn.";
      } else if (error.response) {
        const serverMsg =
          error.response.data?.message ||
          error.response.data?.error ||
          `Lỗi ${error.response.status}`;
        errorMessage = serverMsg;
      } else if (error.request) {
        errorMessage = "Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.";
      }
      return {
        success: false,
        message: errorMessage,
        error,
      };
    }
  },
  async forgotPasswordOTP(email: string) {
    try {


      const resposnse = await axiosIns.post(AuthAPI.FORGOT_PASSWORD_OTP, {
        email: email,
      });
      const result = await resposnse.data;

      return result;
    } catch (error) {
      throw error;
    }
  },
  async verifyPasswordOtp(email: string, otp: string) {
    const response = await axiosIns.post('/api/v1/auth/verify-forget-password-otp', {email, otp});
    return response.data;
  },
  async resetPassword(resetForm: FormRequestNewPassword) {
    try {

      const response = await axiosIns.post(AuthAPI.RESET_PASSWORD, resetForm);
      const result = response.data;

      return result;
    } catch (error) {
      throw error;
    }
  },
};
