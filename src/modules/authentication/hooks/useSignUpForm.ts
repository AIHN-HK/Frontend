import { userPhoneData } from "@/constants/phonePrefixes";
import auth from "@/services/auth";
import { showErrorToast, showSuccessToast } from "@/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SignUpFormData, signUpSchema } from "../schemas/signUpSchema";
import { RegisterPayload } from "../type/auth";
export const useSignUpForm = () => {
  return useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      birthDate: "",
      countryCode: userPhoneData[0].value,
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });
};
export const useSignUp = () => {
  const router = useRouter();
  const [registerData, setRegisterData] = useState<SignUpFormData | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleVerifyOtp = async (otp: string) => {
    if (!registerData) return;
    try {
      const payload: RegisterPayload = {
        email: registerData.email,
        password: registerData.password,
        fullname: registerData.fullName,
        yob: registerData.birthDate ?? "",
        phone: registerData.phone,
        otpCode: otp,
      };
      setIsLoading(true);
      setError(null);
      const registerResult = await auth.register(payload);
      if (registerResult.status === 201) {
        setShowOtpModal(false);
        showSuccessToast("Đăng ký tài khoản thành công!");
        setTimeout(() => {
          router.push("/(authen)");
        }, 1500);
      } else {
        setSignUpError(registerResult.message);
        showErrorToast("Đăng ký thất bại", registerResult.message);
      }
    } catch (error: any) {
      const msg = error.message;
      showErrorToast("Lỗi xác thực ", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setRegisterData(data);
      const emailOTP = await auth.registerSendOTP(data.email);
      if (emailOTP.status === 201) {
        setShowOtpModal(true);
      } else {
        showErrorToast(emailOTP.message);
      }
    } catch (error: any) {
      showErrorToast(error.message);
    }
  };
  return {
    onSubmit,
    handleVerifyOtp,
    showOtpModal,
    setShowOtpModal,
    signUpError,
    isLoading,
    registerData,
  };
};
