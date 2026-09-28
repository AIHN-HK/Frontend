import Header1 from "@/components/Header1";
import { ResultListSection } from "@/modules/test/components/ResultListSection";
import { ResultScoreSection } from "@/modules/test/components/ResultScoreSection";
import { useFetchResults } from "@/modules/test/hooks/useResultoverall";
import { RIASECScore } from "@/modules/test/utilities";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import IconBackLeft from "../../../../assets/icon/ic_backleft";

const ResultOverralScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessionId, score } = useLocalSearchParams<{
    sessionId: string;
    score?: string;
  }>();
  const { results, isLoading } = useFetchResults(sessionId as string);
  const parsedScore = useMemo<RIASECScore>(() => {
    if (typeof score !== "string" || !score.trim()) return {};
    try {
      return JSON.parse(score) as RIASECScore;
    } catch (e) {
      console.error("Lỗi parse score:", e);
      return {};
    }
  }, [score]);

  const isWeb = useIsDesktopWeb();

  const spacing = {
    paddingHorizontal: isWeb ? 760 : 20,
    paddingTopAndroid: isWeb ? 20 : insets.top,
    scoreMarginBottom: isWeb ? 32 : 16,
    sectionTitleMarginBottom: isWeb ? 24 : 12,
    resultsSectionPadding: isWeb ? 32 : 0,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingTop: spacing.paddingTopAndroid,
            paddingHorizontal: spacing.paddingHorizontal,
          },
        ]}
      >
        <Header1
          title="Kết quả kiểm tra"
          iconLeft={<IconBackLeft />}
          onClickLeft={() => router.push("/home")}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isWeb ? 80 : 40 },
          ]}
        >
          <View
            style={[
              styles.scoreContainer,
              { marginBottom: spacing.scoreMarginBottom },
            ]}
          >
            <ResultScoreSection parsedScore={parsedScore} />
          </View>

          <View style={styles.resultsSection}>
            <Text
              style={[
                styles.sectionTitle,
                { marginBottom: spacing.sectionTitleMarginBottom },
              ]}
            >
              Nhóm ngành phù hợp
            </Text>
            <ResultListSection
              results={results}
              isLoading={isLoading}
              sessionId={sessionId as string}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ResultOverralScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H5,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "center",
  },
  scoreContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
  },
  resultsSection: {
    width: "100%",
  },
});
