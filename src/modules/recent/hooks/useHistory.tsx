import {
  AsyncStorageKey,
  asyncStorageService,
} from "@/helpers/asyncStorageService";
import quizz from "@/services/quizz";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";

export interface HistoryItem {
  date: string | null;
  sessionId: string | null;
  description: string | undefined;
  title: string | null;
  topCode: string | null;
}

export const useHistory = () => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [userName, setUserName] = useState<string>("Bạn");
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursorCreatedAt, setNextCursorCreatedAt] = useState<string | null>(
    null,
  );
  const [lastTest, setLastTest] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [nextCursorId, setNextCursorId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 10;
  const isLoadingRef = useRef(false);
  const fetchQuizHistory = useCallback(
    async (isInitial: boolean = false) => {
      if (isLoadingRef.current) {
        console.log("Already loading, skipping...");
        return;
      }
      if (!isInitial && !hasMore) return;
      isLoadingRef.current = true;
      if (isInitial) {
        setLoading(true);
        setHistoryData([]);
        setNextCursorCreatedAt(null);
        setNextCursorId(null);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      try {
        const params: any = { limit };
        if (!isInitial && nextCursorCreatedAt && nextCursorId) {
          params.cursorCreatedAt = nextCursorCreatedAt;
          params.cursorId = nextCursorId;
        }
        const res = await quizz.getHistoryQuiz(params);
        if (isInitial) {
          setLastTest(res.formattedHistory[0].primaryAnalyze.title);
          console.log("Inital", res.formattedHistory[0]);
          setLastCode(res.formattedHistory[0].primaryAnalyze.code);
        }
        console.log("API Response:", res);
        const result = res.formattedHistory || [];
        if (!Array.isArray(result)) {
          throw new Error("Dữ liệu lịch sử không phải mảng");
        }
        const mapped = result
          .filter((item: any) => item.finishAt !== null)
          .map((item: any) => {
            const primary = item.primaryAnalyze || {};
            return {
              date: item.finishAt?.slice(0, 10) ?? null,
              sessionId: item.attemptId ?? null,
              title: primary.title ?? "Chưa có tiêu đề",
              description: primary.description ?? "Không có mô tả",
              topCode: primary.code ?? null,
            } satisfies HistoryItem;
          });
        setHistoryData((prev) => (isInitial ? mapped : [...prev, ...mapped]));
        if (res.pageInfo?.hasNext === true) {
          const { cursorCreatedAt, cursorId } = res.pageInfo.nextCursor || {};
          setNextCursorCreatedAt(cursorCreatedAt || null);
          setNextCursorId(cursorId || null);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
        if (mapped.length < limit) {
          setHasMore(false);
        }
      } catch (err: any) {
        console.error("Lỗi khi lấy lịch sử quiz:", err);
        setError(err.message || "Không thể tải lịch sử test");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
        setCanLoadMore(true);
        isLoadingRef.current = false;
      }
    },
    [nextCursorCreatedAt, nextCursorId, hasMore],
  );

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const name = await asyncStorageService.getSyncedFromDevice(
          AsyncStorageKey.USER_NAME,
        );
        setUserName(name || "Bạn");
      } catch (err) {
        console.warn("Không lấy được tên người dùng:", err);
      }
    };
    loadUserName();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchQuizHistory(true);
    }, []),
  );

  const loadMore = useCallback(() => {
    if (
      !canLoadMore ||
      loading ||
      isLoadingMore ||
      !hasMore ||
      historyData.length === 0 ||
      isLoadingRef.current
    ) {
      console.log("loadMore skipped:", {
        canLoadMore,
        loading,
        isLoadingMore,
        hasMore,
        dataLength: historyData.length,
        isLoadingRef: isLoadingRef.current,
      });
      return;
    }

    console.log("loadMore called:", {
      currentLength: historyData.length,
      nextCursorId,
    });

    setCanLoadMore(false);
    fetchQuizHistory(false);
  }, [
    canLoadMore,
    loading,
    isLoadingMore,
    hasMore,
    historyData.length,
    nextCursorId,
    fetchQuizHistory,
  ]);

  return {
    historyData,
    userName,
    loading,
    isLoadingMore,
    error,
    loadMore,
    hasMore,
    lastTest,
    lastCode,
  };
};
