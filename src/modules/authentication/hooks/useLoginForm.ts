import { authSession } from '@/helpers/authSession';
import { HistoryItem } from "@/modules/recent/hooks/useHistory";
import auth from "@/services/auth";
import quizz from "@/services/quizz";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "../schemas/loginSchema";
import { LoginFormData } from "../type/auth";
export const useLoginForm = () => {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });
};
export const useLogin = () => {
  const submitting = useRef(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    if (submitting.current) return;
    submitting.current = true;
    setLoginError(null);
    setIsLoading(true);

    try {
      const result = await auth.login(data);

      if (result.success && (result.status === 200 || result.status === 201)) {
        await authSession.establish(result.data.data);
        const res = await quizz.getHistoryQuiz(1);
        const firstPage = res.formattedHistory;
        const mapped = firstPage.map((item: any) => {
          const primary = item.primaryAnalyze || {};
          return {
            date: item.finishAt?.slice(0, 10) ?? null,
            sessionId: item.attemptId ?? null,
            title: primary.title ?? "Chưa có tiêu đề",
            description: primary.description ?? "Không có mô tả",
            topCode: primary.code ?? null,
          } satisfies HistoryItem;
        });
        if (firstPage?.length > 0) {
          const latestQuiz = mapped[0];
          router.push({
            pathname: "/(tabs)/home",
            params: { recentQuiz: JSON.stringify(latestQuiz) },
          });
        } else {
          router.replace("/(tabs)/home/onboard/onboard");
        }
      } else {
        setLoginError(
          result?.message || "Đăng nhập thất bại. Vui lòng thử lại.",
        );
      }
    } catch {
      setLoginError("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.");
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return {
    onSubmit,
    loginError,
    isLoading,
  };
};
