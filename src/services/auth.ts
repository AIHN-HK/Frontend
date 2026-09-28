import axiosIns from "@/helpers/axiosInterceptors";

import {
  FormRequestNewPassword,
  RegisterPayload,
} from "@/modules/authentication/type/auth";
import { AuthAPI } from "./api";

export default {
  async registerSendOTP(userEmail: string) {
    try {
      const response = await axiosIns.post(AuthAPI.REGISTER_SENDOTP, {
        email: userEmail,
      });
      console.log("Đăng ký OTP:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi kết nối backend", error);
      throw error;
    }
  },

  async register(registerForm: RegisterPayload) {
    try {
      console.log("Payload gửi đi:", registerForm);
      const response = await axiosIns.post(AuthAPI.REGISTER, registerForm);
      return response.data;
    } catch (error: any) {
      console.error("Register error:", error?.response?.data);
      throw error;
    }
  },

  async login(loginForm: any) {
    try {
      console.log(loginForm);
      const response = await axiosIns.post(AuthAPI.LOGIN, loginForm);
      console.log("LOGIN: ", response);
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
      console.log("Email", email);
      console.log("URL:", AuthAPI.FORGOT_PASSWORD_OTP);
      const resposnse = await axiosIns.post(AuthAPI.FORGOT_PASSWORD_OTP, {
        email: email,
      });
      const result = await resposnse.data;
      console.log("Result", result);
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  async resetPassword(resetForm: FormRequestNewPassword) {
    try {
      console.log("ResetForm", resetForm);
      const response = await axiosIns.post(AuthAPI.RESET_PASSWORD, resetForm);
      const result = response.data;
      console.log("Login result:", result);
      return result;
    } catch (error) {
      console.log(error);
    }
  },
};
