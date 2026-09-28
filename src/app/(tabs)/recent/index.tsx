import { useHistory } from "@/modules/recent/hooks/useHistory";
import renderItem from "@/modules/test/components/ResultItem";
import { capitalizeFirstLetter } from "@/utilities";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS, renderColoryCode } from "@/utilities/colors";
import { Padding, TYPOGRAPHY } from "@/utilities/typography";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "android" ? insets.top : 0;
  const {
    historyData,
    userName,
    loading,
    error,
    loadMore,
    isLoadingMore,
    hasMore,
    lastTest,
    lastCode,
  } = useHistory();

  const isWeb = useIsDesktopWeb();

  const spacing = {
    containerPaddingHorizontal: isWeb ? 40 : Padding.paddingHorizontal,
    containerPaddingVertical: isWeb ? 32 : 20,
    headerPaddingTop: isWeb ? 32 : 20,
    headerMarginBottom: isWeb ? 48 : 16,
    greetingToUsername: isWeb ? 12 : 4,
    usernameToBadge: isWeb ? 16 : 8,
    badgeToHistoryTitle: isWeb ? 56 : 24,
    historyTitleMarginBottom: isWeb ? 32 : 16,
    listPaddingBottom: isWeb ? 120 : 80,
    footerPaddingVertical: isWeb ? 32 : 20,
    emptyMarginTop: isWeb ? 120 : 60,
    maxContentWidth: isWeb ? 760 : "100%",
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safeview}>
        <View style={[styles.loading, { paddingTop: topPadding }]}>
          <Text>{error}</Text>
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
            paddingTop: topPadding,
            paddingHorizontal: spacing.containerPaddingHorizontal,
            paddingVertical: spacing.containerPaddingVertical,
            width: "100%",
            alignSelf: "center",
            ...(isWeb ? { maxWidth: 760 } : {}),
          },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              paddingTop: spacing.headerPaddingTop,
              marginBottom: spacing.headerMarginBottom,
            },
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
            <View
              style={[
                styles.badge,
                {
                  marginTop: spacing.usernameToBadge,
                  borderColor: renderColoryCode(lastCode ?? COLORS.purple1),
                },
              ]}
            >
              <Text style={styles.badgeLabel}>Nhóm ngành</Text>
              <Text style={styles.badgeValue}>
                {capitalizeFirstLetter(lastTest ?? "")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.historyWrapper}>
          <Text
            style={[
              styles.historyTitle,
              { marginBottom: spacing.historyTitleMarginBottom },
            ]}
          >
            Lịch sử test
          </Text>
          <FlatList
            data={historyData}
            keyExtractor={(item, index) => {
              const base = item.sessionId || `no-session-${index}`;
              const dateStr = item.date || "no-date";
              return `${base}-${dateStr}-${index}`;
            }}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingBottom: spacing.listPaddingBottom,
            }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color={COLORS.purple1} />
                  <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.emptyText,
                    { marginTop: spacing.emptyMarginTop },
                  ]}
                >
                  Chưa có lịch sử test
                </Text>
              )
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View
                  style={[
                    styles.footer,
                    { paddingVertical: spacing.footerPaddingVertical },
                  ]}
                >
                  <ActivityIndicator size="small" color={COLORS.purple1} />
                  <Text style={styles.footerText}>Đang tải thêm...</Text>
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  safeview: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    fontWeight: "500",
    color: COLORS.black,
  },
  badge: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  badgeLabel: {
    ...TYPOGRAPHY.S1,
    fontWeight: "400",
    color: COLORS.colortext2,
    marginRight: 6,
  },
  badgeValue: {
    ...TYPOGRAPHY.S2,
    fontWeight: "500",
    color: COLORS.colortext1,
  },
  historyWrapper: {
    flex: 1,
  },
  historyTitle: {
    ...TYPOGRAPHY.H5,
    fontWeight: "600",
    alignSelf: "center",
    color: COLORS.colortext1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    ...TYPOGRAPHY.B3,
    color: COLORS.colortext2,
  },
  emptyText: {
    textAlign: "center",
    ...TYPOGRAPHY.B3,
    color: COLORS.colortext2,
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    marginTop: 8,
    ...TYPOGRAPHY.C3,
    color: COLORS.colortext2,
  },
});
