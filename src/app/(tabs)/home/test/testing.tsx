import IconBackLeft from "@/assets/icon/ic_backleft";
import IconFlag from "@/assets/icon/ic_flag";
import ButtonType1 from "@/components/ButtonType1";
import ButtonType2 from "@/components/ButtonType2";
import Header1 from "@/components/Header1";
import Answer from "@/modules/test/components/Answer";
import ExitModal2 from "@/modules/test/components/ExitModal2";
import ProgressBar from "@/modules/test/components/ProgressBar";
import { useQuizStore } from "@/store/ExamStore";
import { screenWidth } from "@/utilities";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const StartScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "android" ? insets.top : 0;
  const {
    questions,
    answers,
    currentQuestionIndex,
    toggleAnswer,
    nextQuestion,
    prevQuestion,
    submitSession,
  } = useQuizStore();
  const [exitModalVisible, setExitModalVisible] = React.useState(false);
  const isWeb = useIsDesktopWeb();

  const section = questions[currentQuestionIndex];
  if (!section) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text>Đang tải câu hỏi...</Text>
      </SafeAreaView>
    );
  }

  const onSubmit = async () => {
    const result = await submitSession();
    if (!result.success || !result.id) return;
    router.push({
      pathname: "/home/test/result_overrall",
      params: {
        sessionId: result.id,
        score: JSON.stringify(result.score),
      },
    });
  };
  const QUESTIONS_PER_GROUP = 3;
  const currentGroupNumber =
    Math.floor(currentQuestionIndex / QUESTIONS_PER_GROUP) + 1;
  const totalGroups = Math.ceil(questions.length / QUESTIONS_PER_GROUP);
  const progress = currentGroupNumber / totalGroups;
  const isLastInGroup =
    (currentQuestionIndex + 1) % QUESTIONS_PER_GROUP === 0 &&
    currentQuestionIndex < questions.length - 1;

  var nextButtonText = isLastInGroup
    ? `Nhóm ${currentGroupNumber + 1}`
    : "Tiếp theo";

  if (currentQuestionIndex === questions.length - 1) {
    nextButtonText = "Hoàn thành";
  }

  const spacing = {
    paddingHorizontal: isWeb ? 760 : 24,
    headerPaddingBottom: isWeb ? 56 : 35,
    questionPaddingTop: isWeb ? 40 : 20,
    questionDetailMarginBottom: isWeb ? 16 : 8,
    answersPaddingTop: isWeb ? 40 : 20,
    footerPaddingTop: isWeb ? 64 : 40,
    footerGap: isWeb ? 32 : 24,
    footerPaddingBottom: isWeb ? insets.bottom + 40 : insets.bottom + 20,
  };

  return (
    <SafeAreaView style={styles.safeview}>
      <View
        style={[
          styles.container,
          {
            paddingTop: topPadding,
            paddingHorizontal: spacing.paddingHorizontal,
          },
        ]}
      >
        <View
          style={[
            styles.header,
            { paddingBottom: spacing.headerPaddingBottom },
          ]}
        >
          <Header1
            title={`Nhóm ${currentGroupNumber}/${totalGroups}`}
            iconLeft={<IconBackLeft />}
            iconRight={<IconFlag />}
            onClickLeft={() => setExitModalVisible(true)}
          />
          <ProgressBar
            progress={progress}
            height={10}
            fillColor={COLORS.green1}
          />
        </View>

        <View
          style={[
            styles.question_container,
            { paddingTop: spacing.questionPaddingTop },
          ]}
        >
          <Text
            style={[
              styles.question_detail,
              { marginBottom: spacing.questionDetailMarginBottom },
            ]}
          >
            Có thể chọn nhiều đáp án
          </Text>
          <Text style={styles.question_title}>{section.title}...</Text>
        </View>

        <FlatList
          data={section.answer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: spacing.answersPaddingTop }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Answer
              title={item.content}
              isSelected={!!answers[item.id]}
              onPress={() => toggleAnswer(item.id)}
            />
          )}
        />

        <View
          style={[
            styles.footer,
            {
              paddingTop: spacing.footerPaddingTop,
              gap: spacing.footerGap,
              paddingBottom: spacing.footerPaddingBottom,
            },
          ]}
        >
          {currentQuestionIndex > 0 && (
            <ButtonType1
              title="Trở về"
              colors={COLORS.white}
              onPress={prevQuestion}
            />
          )}

          {currentQuestionIndex !== questions.length - 1 ? (
            <ButtonType2
              title={nextButtonText}
              colorsbackground={COLORS.black}
              colorText={COLORS.white}
              onPress={nextQuestion}
            />
          ) : (
            <ButtonType2
              title="Hoàn thành"
              colorsbackground={COLORS.black}
              colorText={COLORS.white}
              onPress={onSubmit}
            />
          )}
        </View>

        <ExitModal2
          visible={exitModalVisible}
          onRetry={() => setExitModalVisible(false)}
          onClose={() => {
            router.push("/(tabs)/home");
            setExitModalVisible(false);
          }}
          description={
            "Phiên làm bài chưa kết thúc. Bạn có chắc chắn muốn kết thúc phiên làm bài?"
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  safeview: { flex: 1, backgroundColor: COLORS.white },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  header: {},
  question_container: {
    alignItems: "center",
  },
  question_title: { ...TYPOGRAPHY.H5, fontWeight: "600" },
  question_detail: {
    maxWidth: screenWidth * 0.7,
    ...TYPOGRAPHY.B1,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
