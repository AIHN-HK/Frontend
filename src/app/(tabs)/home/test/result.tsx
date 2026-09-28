import Header1 from "@/components/Header1";
import RenderItem2 from "@/modules/test/components/Item2";
import PersonalitySection from "@/modules/test/components/PersionalitySection";
import { useQuizResult } from "@/modules/test/hooks/useQuizResult";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS, renderColoryCode } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import IconBA from "../../../../assets/icon/ic_BA";
import IconBackLeft from "../../../../assets/icon/ic_backleft";
import IconEngineer from "../../../../assets/icon/ic_engineer";
import IconLeader from "../../../../assets/icon/ic_leader";
import IconNgheThuat from "../../../../assets/icon/ic_nghethuat";
import IconScientist from "../../../../assets/icon/ic_scientist";
import IconSocial from "../../../../assets/icon/ic_xahoi";

const ResultScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const {
    sessionId,
    initialIndex,
    results: resultsJson,
  } = useLocalSearchParams<{
    sessionId: string;
    initialIndex?: string;
    results?: string;
  }>();
  const { results, isLoading, error } = useQuizResult(
    sessionId,
    resultsJson as string,
    initialIndex,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (results.length > 0) {
      const idx = initialIndex ? Number(initialIndex) : 0;
      setSelectedIndex(Math.min(Math.max(0, idx), results.length - 1));
    }
  }, [results, initialIndex]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [selectedIndex]);

  const selectedResult = results[selectedIndex] || null;

  const getIconByCode = (code: string) => {
    switch (code?.toUpperCase()) {
      case "R":
        return <IconEngineer />;
      case "I":
        return <IconScientist />;
      case "A":
        return <IconNgheThuat />;
      case "S":
        return <IconSocial />;
      case "E":
        return <IconLeader />;
      case "C":
        return <IconBA />;
      default:
        return <IconEngineer />;
    }
  };

  const isWeb = useIsDesktopWeb();

  const spacing = {
    paddingHorizontal: isWeb ? 760 : 20,
    paddingTop: isWeb ? 20 : Platform.OS === "android" ? insets.top : 0,
    headerMarginTop: isWeb ? 24 : 20,
    headerToIllustration: isWeb ? 64 : 30,
    illustrationToSections: isWeb ? 80 : 30,
    sectionsGap: isWeb ? 40 : 16,
    listSectionMarginTop: isWeb ? 80 : 32,
    listTitleMarginBottom: isWeb ? 40 : 16,
    listItemMarginBottom: isWeb ? 24 : 12,
    buttonGroupPaddingTop: isWeb ? 64 : 24,
    buttonGroupGap: isWeb ? 24 : 12,
    bottomSpace: isWeb ? 100 : 40,
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeview}>
        <View style={[styles.container, { paddingTop: spacing.paddingTop }]}>
          <Header1
            title="Kết quả chi tiết"
            iconLeft={<IconBackLeft />}
            onClickLeft={() => router.back()}
          />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Đang tải kết quả...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!selectedResult && results.length === 0)) {
    return (
      <SafeAreaView style={styles.safeview}>
        <View style={[styles.container, { paddingTop: spacing.paddingTop }]}>
          <Header1
            title="Kết quả chi tiết"
            iconLeft={<IconBackLeft />}
            onClickLeft={() => router.back()}
          />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {error || "Không có kết quả để hiển thị"}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeview}>
      <View
        style={[
          styles.container,
          {
            paddingTop: spacing.paddingTop,
            paddingHorizontal: spacing.paddingHorizontal,
          },
        ]}
      >
        <Header1
          title="Kết quả chi tiết"
          iconLeft={<IconBackLeft />}
          onClickLeft={() => router.back()}
        />

        <ScrollView
          ref={scrollRef}
          style={styles.detailScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.bottomSpace }}
        >
          <View
            style={[
              styles.headerResult,
              { marginTop: spacing.headerMarginTop },
            ]}
          >
            <View>
              <Text style={styles.labelSmall}>Bạn thuộc nhóm ngành</Text>
              <Text style={styles.mainTitle}>{selectedResult.title}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View
                style={[
                  styles.dateBar,
                  {
                    backgroundColor:
                      renderColoryCode(selectedResult.code) || COLORS.grey,
                  },
                ]}
              />
              <Text style={styles.labelSmall}>Ngày kiểm tra</Text>
              <Text style={styles.dateText}>
                {selectedResult.date || "Chưa có"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.illustrationContainer,
              { marginVertical: spacing.headerToIllustration },
            ]}
          >
            {getIconByCode(selectedResult.code ?? "I")}
          </View>

          <View
            style={[styles.sectionsContainer, { gap: spacing.sectionsGap }]}
          >
            <PersonalitySection
              title="Tính cách"
              backgroundColor="#E8E5FF"
              data={selectedResult?.personality}
            />
            <PersonalitySection
              title="Ưu điểm"
              backgroundColor="#E9F9E6"
              data={selectedResult?.strengths}
            />
            <PersonalitySection
              title="Nhược điểm"
              backgroundColor="#FFE9E9"
              data={selectedResult?.weaknesses}
            />
            <PersonalitySection
              title="Công việc phù hợp"
              backgroundColor="#FFF9E1"
              data={selectedResult.careers}
            />
          </View>

          {results.length > 1 && (
            <View
              style={[
                styles.listSection,
                { marginTop: spacing.listSectionMarginTop },
              ]}
            >
              <Text
                style={[
                  styles.listTitle,
                  { marginBottom: spacing.listTitleMarginBottom },
                ]}
              >
                Các nhóm ngành phù hợp khác
              </Text>

              {results
                .map((item, idx) => ({ item, idx }))
                .filter(({ idx }) => idx !== selectedIndex)
                .map(({ item, idx: originalIdx }) => (
                  <TouchableOpacity
                    key={item.code ?? originalIdx}
                    onPress={() => setSelectedIndex(originalIdx)}
                    activeOpacity={0.8}
                    style={[
                      styles.listItemWrapper,
                      { marginBottom: spacing.listItemMarginBottom },
                    ]}
                  >
                    <RenderItem2 item={item} isSelected={false} />
                  </TouchableOpacity>
                ))}
            </View>
          )}

          <View
            style={[
              styles.buttonGroup,
              {
                paddingTop: spacing.buttonGroupPaddingTop,
                gap: spacing.buttonGroupGap,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/chatbot/chat")}
            >
              <Text style={styles.primaryButtonText}>
                Hỏi đáp cùng chuyên gia
              </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>
                Trải nghiệm công việc
              </Text>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  safeview: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1 },
  detailScroll: { flex: 1 },
  headerResult: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  labelSmall: { color: COLORS.colortext2, ...TYPOGRAPHY.B3, marginBottom: 2 },
  mainTitle: {
    color: COLORS.black,
    ...TYPOGRAPHY.H3,
    lineHeight: 40,
    textTransform: "uppercase",
  },
  dateBar: {
    width: 28,
    height: 6,
    borderRadius: 10,
    marginBottom: 8,
  },
  dateText: { ...TYPOGRAPHY.S1, color: COLORS.black, fontWeight: "400" },
  illustrationContainer: {
    alignItems: "center",
  },
  sectionsContainer: {
    width: "100%",
  },
  listSection: {
    backgroundColor: COLORS.white,
    paddingBottom: 24,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1C1C1E",
    textAlign: "center",
  },
  listItemWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGroup: {
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#333333",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.colortext2,
    width: "100%",
    maxWidth: 320,
  },
  primaryButtonText: {
    color: COLORS.white,
    textAlign: "center",
    ...TYPOGRAPHY.B2,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.colortext2,
    width: "100%",
    maxWidth: 320,
  },
  secondaryButtonText: {
    color: COLORS.colortext2,
    textAlign: "center",
    ...TYPOGRAPHY.B2,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
});
