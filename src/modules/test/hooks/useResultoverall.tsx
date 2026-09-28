// @/modules/test/hooks/useFetchResults.ts
import quizz from "@/services/quizz";
import { useEffect, useState } from "react";
import { ResultItem } from "../utilities";

export const useFetchResults = (sessionId?: string) => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sessionIdNumber = Number(sessionId);
        if (isNaN(sessionIdNumber)) throw new Error("Session ID không hợp lệ");
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
        console.error("Lỗi fetch results:", err);
        setError(err.message || "Không tải được kết quả");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  return { results, isLoading, error };
};
