import IconAvartar1 from "@/assets/icon/ic_avartar";
import IconOnboard from "@/assets/icon/ic_onboard";
import ButtonType2 from "@/components/ButtonType2";
import {
  AsyncStorageKey,
  asyncStorageService,
} from "@/helpers/asyncStorageService";
import { useQuizStore } from "@/store/ExamStore";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import quiz from "../../../../services/quizz";

const OnboardScreen = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "android" ? insets.top : 0;
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const setSession = useQuizStore((s) => s.setSession);
  const setQuestions = useQuizStore((s) => s.setQuestions);

  const handleStartQuiz = useCallback(async () => {
    try {
      const ownerId = await asyncStorageService.getSyncedFromDevice(AsyncStorageKey.USER_ID);
      const stored = ownerId ? await AsyncStorage.getItem(`huong-nghiep-quiz:${ownerId}`) : null;
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

  useEffect(() => {
    asyncStorageService
      .getSyncedFromDevice(AsyncStorageKey.USER_NAME)
      .then((name) => setUserName(name || "Bạn"));
  }, []);

  const isWeb = useIsDesktopWeb();

  const spacing = {
    paddingHorizontal: isWeb ? 760 : 24,
    headerMarginBottom: isWeb ? 80 : 45,
    greetingToUsername: isWeb ? 12 : 4,
    usernameToContent: isWeb ? 72 : 40,
    titleToSubtitle: isWeb ? 24 : 8,
    subtitleToIcon: isWeb ? 64 : 32,
    iconToButton: isWeb ? 80 : 60,
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingTop: topPadding,
          paddingHorizontal: spacing.paddingHorizontal,
        },
      ]}
    >
      <View style={styles.mainContent}>
        <View style={styles.centerSection}>
          <View
            style={[
              styles.header,
              { marginBottom: spacing.headerMarginBottom },
            ]}
          >
            <View>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text
                style={[
                  styles.username,
                  { marginTop: spacing.greetingToUsername },
                ]}
              >
                {userName}
              </Text>
            </View>
            <IconAvartar1 />
          </View>

          <View style={styles.contentWrapper}>
            <Text style={styles.title}>TRẮC NGHIỆM HƯỚNG NGHIỆP</Text>
            <Text
              style={[
                styles.subtitle,
                {
                  marginTop: spacing.titleToSubtitle,
                  marginBottom: spacing.subtitleToIcon,
                },
              ]}
            >
              Khám phá nhóm ngành phù hợp với bạn
            </Text>
            <IconOnboard style={{ marginBottom: spacing.iconToButton }} />
            <ButtonType2
              title="Làm trắc nghiệm"
              colorsbackground={COLORS.green1}
              colorText={COLORS.blackText}
              onPress={handleStartQuiz}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "400",
  },
  username: {
    fontSize: 22,
    fontWeight: "500",
    color: COLORS.black,
  },
  contentWrapper: {
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.colortext1,
    textAlign: "center",
  },
});

export default OnboardScreen;
