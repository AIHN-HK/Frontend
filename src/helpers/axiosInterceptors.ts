import { router } from 'expo-router';
import { AppConfig } from "@/utilities/appInfo";
import axios from "axios";
import { authSession } from './authSession';
import { installSessionInterceptors } from './sessionInterceptors';
export const URL_HOST = AppConfig.environmentDev;

let headers = {
  "Content-Type": "application/json",
};

const axiosIns = axios.create({
  baseURL: URL_HOST,
  headers,
});

export default axiosIns;

export const axiosBear = axios.create({
  baseURL: URL_HOST,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
export const handleAxiosError = (
  error: any,
  defaultMessage = "Có lỗi xảy ra",
) => {
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.";
  }
  if (error.response) {
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      `Lỗi ${error.response.status}`
    );
  }
  if (error.request) {
    return "Không nhận được phản hồi từ máy chủ.";
  }
  return defaultMessage;
};

installSessionInterceptors(axiosBear, authSession, {
  refresh: async token => {
    const response = await axiosIns.post('/api/v1/auth/refresh', undefined, {
      timeout: 10000,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },
  onSignedOut: () => {
    router.replace('/(authen)');
  },
});
