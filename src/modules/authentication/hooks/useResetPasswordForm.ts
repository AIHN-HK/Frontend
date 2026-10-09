import { passwordRecovery } from '@/helpers/passwordRecovery';
import auth from "@/services/auth";
import { showErrorToast } from "@/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
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
  const submitting = useRef(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [resetData, setResetData] = useState<ResultEmail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onSubmitEmail = async (data: ResetFormData) => {
    if (submitting.current) return false;
    submitting.current = true;
    try {
      setIsLoading(true);
      const resetEmail = await auth.forgotPasswordOTP(data.email);
      setResetData({
        email: data.email,
        otp: "",
      });
      if (resetEmail?.status === 201) {
        setShowOtpModal(true);
        return true;
      } else {
        showErrorToast("Vui lòng thử lại");
      }
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
    return false;
  };

  const handleVerifyOtp = async (otp: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!resetData) {
        return;
      }
      const payload: ResultEmail = {
        email: resetData?.email ?? "",
        otp,
      };
      await auth.verifyPasswordOtp(payload.email, otp);
      passwordRecovery.set(payload);
      if (resetForm) {
        resetForm();
      }
      setShowOtpModal(false);
      router.push("/(authen)/newpassword");
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || error.message);
    } finally { setIsLoading(false); }
  };
  return {
    onSubmitEmail,
    handleVerifyOtp,
    showOtpModal,
    setShowOtpModal,
    isLoading,
  };
};
