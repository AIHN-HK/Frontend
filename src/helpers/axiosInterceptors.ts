import { AppConfig } from "@/utilities/appInfo";
import axios from "axios";
import { AsyncStorageKey, asyncStorageService } from "./asyncStorageService";
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

axiosBear.interceptors.request.use(
  async (config) => {
    try {
      const token = await asyncStorageService.getSyncedFromDevice(
        AsyncStorageKey.ACCESS_TOKEN,
      );
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.log("Lỗi khi lấy token từ AsyncStorage:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosBear.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await asyncStorageService.clearAll();
      const { router } = require("expo-router");
      router.replace("/(authen)");
    }
    return Promise.reject(error);
  },
);
