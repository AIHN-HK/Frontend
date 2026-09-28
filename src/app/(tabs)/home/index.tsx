import IconBA from "@/assets/icon/ic_BA";
import IconEngineer from "@/assets/icon/ic_engineer";
import IconLeader from "@/assets/icon/ic_leader";
import IconNgheThuat from "@/assets/icon/ic_nghethuat";
import IconQ_A from "@/assets/icon/ic_Q&A";
import IconScientist from "@/assets/icon/ic_scientist";
import IconSocial from "@/assets/icon/ic_xahoi";
import ButtonType1 from "@/components/ButtonType1";
import ButtonType2 from "@/components/ButtonType2";
import {
  AsyncStorageKey,
  asyncStorageService,
} from "@/helpers/asyncStorageService";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { HistoryItem } from "@/modules/recent/hooks/useHistory";
import { useQuizStore } from "@/store/ExamStore";
import { capitalizeFirstLetter } from "@/utilities";
import { COLORS, renderColoryCode } from "@/utilities/colors";
import { Padding, TYPOGRAPHY } from "@/utilities/typography";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { default as quiz, default as quizz } from "../../../services/quizz";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [latest, setLatest] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { recentQuiz } = useLocalSearchParams<{ recentQuiz?: string }>();
  const setSession = useQuizStore((s) => s.setSession);
  const setQuestions = useQuizStore((s) => s.setQuestions);

  const isWeb = useIsDesktopWeb();
  const spacing = {
    containerPaddingHorizontal: isWeb ? 40 : Padding.paddingHorizontal,
    containerPaddingVertical: isWeb ? 32 : 20,
    headerMarginBottom: isWeb ? 56 : 12,
    historyMarginTop: isWeb ? 48 : 8,
    historyToQna: isWeb ? 64 : 24,
    cardPaddingHorizontal: isWeb ? 40 : 16,
    cardPaddingVertical: isWeb ? 40 : 20,
    cardInnerSpacing: isWeb ? 32 : 12,
    buttonGap: isWeb ? 40 : 16,
    qnaGap: isWeb ? 20 : 12,
    qnaCardPadding: isWeb ? 32 : 16,
    maxContentWidth: isWeb ? 760 : "100%",
  };

  const fetchLatestHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await quizz.getHistoryQuiz(1);
      const firstPage = result.formattedHistory;
      if (firstPage?.length > 0) {
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
        setLatest(mapped[0]);
      } else {
        setLatest(null);
      }
    } catch (error) {
      setLatest(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (recentQuiz) {
      try {
        const parsed = JSON.parse(recentQuiz) as HistoryItem;
        setLatest(parsed);
        setLoading(false);
      } catch (e) {
        console.error("Lỗi parse recentQuiz:", e);
        fetchLatestHistory();
      }
    }
  }, [recentQuiz, fetchLatestHistory]);

  useFocusEffect(
    useCallback(() => {
      if (!latest) {
        fetchLatestHistory();
      }
    }, [latest, fetchLatestHistory]),
  );

  useEffect(() => {
    asyncStorageService
      .getSyncedFromDevice(AsyncStorageKey.USER_NAME)
      .then((name) => setUserName(name || "Bạn"));
  }, []);

  const getIconByCode = (code: string) => {
    let icon;
    switch (code?.toUpperCase()) {
      case "R":
        icon = <IconEngineer />;
        break;
      case "I":
        icon = <IconScientist />;
        break;
      case "A":
        icon = <IconNgheThuat />;
        break;
      case "S":
        icon = <IconSocial />;
        break;
      case "E":
        icon = <IconLeader />;
        break;
      case "C":
        icon = <IconBA />;
        break;
      default:
        icon = <IconEngineer />;
    }
    if (isWeb) return icon;
    return (
      <View style={{ width: 150, height: 150, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
        <View style={{ transform: [{ scale: 0.75 }] }}>
          {icon}
        </View>
      </View>
    );
  };

  const handleStartQuiz = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("huong-nghiep-quiz");
      if (stored) {
        try {
          const state = JSON.parse(stored).state;
          if (state?.questions?.length > 0 && state.sessionId != null) {
            router.push("/home/test/testing");
            return;
          }
        } catch (parseError) {}
      }

      const sessionResponse = await quiz.getStartSessionStatus();
      const sessionId = String(sessionResponse.data.id);
      setSession(sessionId);

      const questionsRes = await quiz.getAllquiz();
      if (questionsRes?.data?.questions) {
        setQuestions(questionsRes.data.questions);
        router.push("/home/test/testing");
      } else {
        Alert.alert(
          "Thông báo",
          questionsRes?.message || "Không lấy được câu hỏi",
        );
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.");
    }
  }, [setSession, setQuestions, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isWeb ? 80 : 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.container,
            {
              paddingHorizontal: spacing.containerPaddingHorizontal,
              paddingVertical: spacing.containerPaddingVertical,
              width: "100%",
              maxWidth: isWeb ? 760 : undefined,
              alignSelf: "center",
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { marginBottom: spacing.headerMarginBottom },
            ]}
          >
            <View>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text style={styles.username}>{userName}</Text>
              <View
                style={[
                  styles.badge,
                  {
                    borderColor: renderColoryCode(
                      latest?.topCode ?? COLORS.purple1,
                    ),
                  },
                ]}
              >
                <Text style={styles.badgeLabel}>Nhóm ngành</Text>
                <Text style={styles.badgeValue}>
                  {capitalizeFirstLetter(latest?.title ?? "")}
                </Text>
              </View>
            </View>
          </View>

          {/* History Card */}
          <View style={{ marginTop: spacing.historyMarginTop }}>
            <View
              style={[
                styles.historyCard,
                {
                  borderColor: renderColoryCode(
                    latest?.topCode ?? COLORS.purple1,
                  ),
                  paddingHorizontal: spacing.cardPaddingHorizontal,
                  paddingVertical: spacing.cardPaddingVertical,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Nhóm ngành dành cho bạn</Text>
                <View
                  style={[
                    styles.dotIndicator,
                    {
                      backgroundColor: renderColoryCode(
                        latest?.topCode ?? COLORS.purple1,
                      ),
                    },
                  ]}
                />
              </View>

              {loading ? (
                <Text
                  style={[
                    styles.description,
                    { marginTop: spacing.cardInnerSpacing },
                  ]}
                >
                  Đang tải kết quả...
                </Text>
              ) : latest ? (
                <>
                  <View
                    style={[
                      styles.groupInfoRow,
                      { marginTop: spacing.cardInnerSpacing },
                    ]}
                  >
                    <Text style={styles.groupName}>
                      Nhóm ngành {capitalizeFirstLetter(latest.title ?? "")}
                    </Text>
                    <View>
                      <Text style={styles.dateLabel}>Ngày kiểm tra</Text>
                      <Text style={styles.dateValue}>{latest.date ?? "—"}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.descriptionContainer,
                      {
                        marginTop: spacing.cardInnerSpacing,
                        flexDirection: isWeb ? "row" : "column",
                        alignItems: isWeb ? "flex-start" : "center",
                      },
                    ]}
                  >
                    <View style={{ maxWidth: "100%", alignItems: "center" }}>
                      {getIconByCode(latest?.topCode ?? "I")}
                    </View>
                    <Text style={[styles.description, !isWeb && { textAlign: "center", marginTop: 12 }]}>
                      {latest.description ??
                        "Bạn có tư duy logic, cẩn trọng, kiên trì giải quyết vấn đề và luôn hướng tới giải pháp tối ưu dựa trên dữ liệu và tính khả thi."}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.buttonContainer,
                      {
                        marginTop: spacing.cardInnerSpacing,
                        gap: spacing.buttonGap,
                      },
                    ]}
                  >
                    <ButtonType1
                      title="Làm lại test"
                      onPress={handleStartQuiz}
                      colors={""}
                    />
                    <ButtonType2
                      title="Xem chi tiết"
                      colorsbackground={renderColoryCode(
                        latest?.topCode ?? COLORS.purple1,
                      )}
                      onPress={() => {
                        if (latest?.sessionId) {
                          router.push({
                            pathname: "/(tabs)/home/test/result",
                            params: { sessionId: latest.sessionId },
                          });
                        } else {
                          Alert.alert(
                            "Thông báo",
                            "Chưa có kết quả để xem chi tiết",
                          );
                        }
                      }}
                      colorText={COLORS.blackText}
                    />
                  </View>
                </>
              ) : (
                <Text
                  style={[
                    styles.description,
                    { marginTop: spacing.cardInnerSpacing },
                  ]}
                >
                  Bạn chưa hoàn thành bài kiểm tra nào
                </Text>
              )}
            </View>
          </View>

          {/* Q&A Section */}
          <View
            style={[
              styles.qnaContainer,
              { marginTop: spacing.historyToQna, gap: spacing.qnaGap },
            ]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => router.push("/(tabs)/chatbot/chat")}
            >
              <View
                style={[
                  styles.qnaCard,
                  {
                    backgroundColor: renderColoryCode(
                      latest?.topCode ?? COLORS.purple1,
                    ),
                    padding: spacing.qnaCardPadding,
                  },
                ]}
              >
                <Text style={styles.qnaText}>Q&A cùng Chuyên gia</Text>
                <IconQ_A style={styles.qnaIcon} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles giữ nguyên, chỉ cần đảm bảo historyCard và qnaCard nhận padding từ style inline
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    ...TYPOGRAPHY.B1,
    color: COLORS.black,
    fontWeight: "400",
  },
  username: {
    ...TYPOGRAPHY.B2,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  badgeLabel: {
    ...TYPOGRAPHY.S1,
    fontWeight: "400",
    color: COLORS.colortext2,
    marginRight: 8,
  },
  badgeValue: {
    ...TYPOGRAPHY.S2,
    fontWeight: "600",
    color: COLORS.colortext1,
  },
  historyCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    ...TYPOGRAPHY.C2,
    fontWeight: "500",
    color: COLORS.colortext1,
  },
  dotIndicator: {
    width: 28,
    height: 8,
    borderRadius: 10,
  },
  groupInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  groupName: {
    ...TYPOGRAPHY.B2,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.colortext1,
    maxWidth: "60%",
  },
  dateLabel: {
    ...TYPOGRAPHY.S1,
    color: COLORS.colortext2,
    textAlign: "right",
  },
  dateValue: {
    ...TYPOGRAPHY.S1,
    fontWeight: "500",
    color: COLORS.colortext1,
    textAlign: "right",
    marginTop: 4,
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  description: {
    ...TYPOGRAPHY.C3,
    lineHeight: 22,
    color: COLORS.colortext2,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  qnaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  qnaCard: {
    borderRadius: 24,
    justifyContent: "space-between",
    minHeight: 140,
  },
  qnaText: {
    ...TYPOGRAPHY.C1,
    lineHeight: 24,
    fontWeight: "600",
    color: COLORS.blackText,
    maxWidth: "75%",
  },
  qnaIcon: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
});

export default HomeScreen;
