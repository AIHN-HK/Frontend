import { COLORS } from "@/utilities/colors";
import { Padding, TYPOGRAPHY } from "@/utilities/typography";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "android" ? insets.top : 0;

  return (
    <SafeAreaView style={styles.safeview}>
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.centerContent}>
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>
              Tính năng đang phát triển
            </Text>
            <Text style={styles.comingSoonDescription}>
              Chúng tôi sẽ sớm cập nhật để bạn có thể theo dõi kết quả và tiến
              độ học tập của mình.
            </Text>
          </View>
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
    paddingHorizontal: Padding.paddingHorizontal,
    backgroundColor: COLORS.white,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  comingSoonContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    maxWidth: 340,
  },

  comingSoonTitle: {
    ...TYPOGRAPHY.H3,
    textAlign: "center",
    marginBottom: 16,
    color: COLORS.colortext1,
  },

  comingSoonDescription: {
    ...TYPOGRAPHY.B3,
    color: COLORS.colortext2,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },

  comingSoonNote: {
    ...TYPOGRAPHY.C3,
    color: COLORS.green1,
    fontWeight: "600",
    textAlign: "center",
  },

  historyWrapper: {
    marginTop: 32,
    alignItems: "center",
  },
  historyTitle: {
    ...TYPOGRAPHY.H4,
    color: COLORS.colortext1,
    marginBottom: 20,
  },
});
