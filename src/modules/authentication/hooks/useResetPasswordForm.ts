import auth from "@/services/auth";
import { showErrorToast } from "@/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ResetFormData, resetSchema } from "../schemas/resetPasswordSchema";
import { ResultEmail } from "../type/auth";
type ResetFn = () => void;
export const useResetPasswordForm = () => {
  return useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });
};
export const useResetPassword = (resetForm?: ResetFn) => {
  const router = useRouter();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [resetData, setResetData] = useState<ResultEmail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onSubmitEmail = async (data: ResetFormData) => {
    try {
      setIsLoading(true);
      const resetEmail = await auth.forgotPasswordOTP(data.email);
      setResetData({
        email: data.email,
        otp: "",
      });
      if (resetEmail?.status == 201) {
        setShowOtpModal(true);
        return;
      } else {
        showErrorToast("Vui lòng thử lại");
      }
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (otp: string) => {
    try {
      if (!resetData) {
        return;
      }
      const payload: ResultEmail = {
        email: resetData?.email ?? "",
        otp,
      };
      if (resetForm) {
        resetForm();
      }
      setShowOtpModal(false);
      router.push({
        pathname: "/(authen)/newpassword",
        params: payload,
      });
    } catch (error: any) {
      showErrorToast(error.message);
    }
  };
  return {
    onSubmitEmail,
    handleVerifyOtp,
    showOtpModal,
    setShowOtpModal,
    isLoading,
  };
};
