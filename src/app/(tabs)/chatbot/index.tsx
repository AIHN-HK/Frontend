import IconIntroChat from "@/assets/icon/ic_introchat";
import ButtonType2 from "@/components/ButtonType2";
import ButtonHistory from "@/modules/chat/components/button";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { useRouter } from "expo-router";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const IntroChatbotScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPadding = Platform.OS === "android" ? insets.top : 0;
  const handleStartChat = () => {
    router.push("/chatbot/chat");
  };

  const isWeb = useIsDesktopWeb();

  const spacing = {
    paddingHorizontal: isWeb ? 760 : 24,
    introVerticalPadding: isWeb ? 80 : 40,
    titleToSubtitle: isWeb ? 24 : 10,
    subtitleToIcon: isWeb ? 48 : 20,
    iconToButton: isWeb ? 56 : 20,
    buttonToDivider: isWeb ? 64 : 40,
    dividerToHistory: isWeb ? 48 : 12,
    historyTitleToItem: isWeb ? 24 : 12,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingTop: topPadding,
            paddingHorizontal: spacing.paddingHorizontal,
          },
        ]}
      >
        <View style={styles.introSection}>
          <View
            style={{
              paddingVertical: spacing.introVerticalPadding,
            }}
          >
            <Text style={styles.title}>Q&A CÙNG CHUYÊN GIA</Text>
            <Text
              style={[
                styles.subtitle,
                {
                  marginTop: spacing.titleToSubtitle,
                  marginBottom: spacing.subtitleToIcon,
                },
              ]}
            >
              Tư vấn hướng nghiệp trực tiếp dành riêng cho bạn!
            </Text>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View style={{ marginBottom: spacing.iconToButton }}>
                <IconIntroChat />
              </View>
              <View style={{ marginBottom: spacing.buttonToDivider }}>
                <ButtonType2
                  title="Tham gia tư vấn ngay"
                  colorsbackground={COLORS.black}
                  colorText={COLORS.white}
                  onPress={handleStartChat}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.historySection}>
          <Text
            style={[
              styles.sectionTitle,
              { marginBottom: spacing.historyTitleToItem },
            ]}
          >
            Gần đây
          </Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/(tabs)/profile");
            }}
          >
            <ButtonHistory
              title="Tìm hiểu ngành gần đây"
              date="18/12/2025"
              colors={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IntroChatbotScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  introSection: {
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    ...TYPOGRAPHY.H5,
    color: COLORS.black,
    fontWeight: "500",
    textAlign: "center",
  },

  subtitle: {
    ...TYPOGRAPHY.C3,
    maxWidth: 300,
    textAlign: "center",
    color: COLORS.colortext2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.colortext2,
    width: "100%",
  },

  historySection: {
    paddingTop: 12,
  },

  sectionTitle: {
    ...TYPOGRAPHY.C3,
    color: COLORS.colortext2,
    fontWeight: "500",
  },
});
