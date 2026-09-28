import auth from "@/services/auth";
import { showErrorToast, showSuccessToast } from "@/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  newpasswordForm,
  NewpasswordFormData,
} from "../schemas/newPasswordSchema";
import { FormRequestNewPassword } from "../type/auth";

export const useNewPasswordForm = () => {
  return useForm<NewpasswordFormData>({
    resolver: zodResolver(newpasswordForm),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });
};

export const useNewPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (
    data: NewpasswordFormData,
    email: string,
    otp: string,
  ) => {
    if (!email || !otp) {
      alert("Thiếu email hoặc OTP");
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      const payload: FormRequestNewPassword = {
        email: email,
        newPassword: data.password,
        otp: otp,
      };

      const resultNewPassword = await auth.resetPassword(payload);
      console.log("Res", resultNewPassword);
      if (resultNewPassword.status == 201) {
        showSuccessToast("Reset mật khẩu thành công");
        router.push("/(authen)");
      } else {
        showErrorToast("Reset mật khẩu thất bại");

        router.push("/(authen)");
      }
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return {
    onSubmit,
    error,
    isLoading,
  };
};
