import quizz from "@/services/quizz";
import { useEffect, useState } from "react";

export type ResultItem = {
  title: string;
  description: string | string[];
  date: string;
  personality: string | string[];
  careers: string;
  strengths: string;
  weaknesses: string;
  code: string;
};

interface UseQuizResultReturn {
  results: ResultItem[];
  isLoading: boolean;
  error: string | null;
}

export const useQuizResult = (
  sessionId?: string,
  resultsJson?: string,
  initialIndex?: string,
): UseQuizResultReturn => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      if (resultsJson) {
        try {
          const parsed = JSON.parse(resultsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setResults(parsed);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Không parse được results từ params:", e);
        }
      }
      if (!sessionId) {
        setIsLoading(false);
        setError("Không có session ID");
        return;
      }
      try {
        const sessionIdNumber = Number(sessionId);
        if (isNaN(sessionIdNumber)) {
          throw new Error("Session ID không hợp lệ");
        }
        const res = await quizz.getQuizresult(sessionIdNumber);
        const mappedResults = Array.isArray(res?.analyzeResult)
          ? res.analyzeResult.map((item: any) => ({
              title: item?.title || "",
              description: item?.description || "",
              date: res?.finishAt || "",
              personality: item?.personality || "",
              careers: item?.careers || "",
              strengths: item?.strengths || "",
              weaknesses: item?.weaknesses || "",
              code: item?.code || "",
            }))
          : [];
        setResults(mappedResults);
      } catch (err: any) {
        console.error("Lỗi fetch kết quả:", err);
        setError(err.message || "Không tải được kết quả");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sessionId, resultsJson]);

  return { results, isLoading, error };
};
