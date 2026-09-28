import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { screenWidth } from "@/utilities";
import { COLORS, renderColoryCode } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { useRouter } from "expo-router";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { capitalizeFirstLetter } from "../../../utilities/index";

const ResultItemComponent = ({ item }: { item: any }) => {
  console.log("Item", item);
  const topCode = item.topCode;
  const title = capitalizeFirstLetter(item.title);
  const date = item?.date;
  const description = item?.description || "";
  const router = useRouter();
  const isWeb = useIsDesktopWeb();
  const spacing = {
    cardPaddingHorizontal: isWeb ? 32 : 16,
    cardPaddingVertical: isWeb ? 40 : 24,
    cardMarginBottom: isWeb ? 24 : 12,
    cardBarMarginBottom: isWeb ? 12 : 6,
    titleMaxWidth: isWeb ? screenWidth * 0.65 : screenWidth * 0.7,
    descriptionMarginTop: isWeb ? 16 : 8,
    descriptionLineHeight: isWeb ? 24 : 18,
    actionMarginTop: isWeb ? 24 : 12,
  };

  return (
    <View
      style={[
        styles.historyCard,
        {
          paddingHorizontal: spacing.cardPaddingHorizontal,
          paddingVertical: spacing.cardPaddingVertical,
          marginBottom: spacing.cardMarginBottom,
          borderColor: renderColoryCode(item.topCode),
        },
        isWeb && { width: "100%" },
        !isWeb && { width: screenWidth - 48 },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.cardTitle, { maxWidth: spacing.titleMaxWidth }]}>
          Nhóm ngành {title}
        </Text>
        <View
          style={[
            styles.cardBar,
            {
              marginBottom: spacing.cardBarMarginBottom,
              backgroundColor: renderColoryCode(item.topCode),
            },
          ]}
        />
      </View>
      <Text style={styles.cardDate}>{date}</Text>
      <Text
        style={[
          styles.cardDescription,
          {
            marginTop: spacing.descriptionMarginTop,
            lineHeight: spacing.descriptionLineHeight,
          },
        ]}
      >
        {description}
      </Text>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/test/result",
            params: { sessionId: Number(item.sessionId) },
          })
        }
      >
        <Text
          style={[styles.cardAction, { marginTop: spacing.actionMarginTop }]}
        >
          Xem chi tiết →
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const renderItem = ({ item }: { item: any }) => <ResultItemComponent item={item} />;

export default renderItem;

const styles = StyleSheet.create({
  historyCard: {
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: COLORS.white,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    ...TYPOGRAPHY.B4,
    fontWeight: "600",
    color: COLORS.colortext1,
  },
  cardBar: {
    width: 24,
    height: 6,
    borderRadius: 10,
  },
  cardDate: {
    ...TYPOGRAPHY.S1,
    color: COLORS.colortext1,
    fontWeight: "400",
    marginTop: 2,
  },
  cardDescription: {
    ...TYPOGRAPHY.C3,
    color: COLORS.colortext2,
  },
  cardAction: {
    ...TYPOGRAPHY.S1,
    fontWeight: "600",
    color: COLORS.colortext2,
    textAlign: "center",
  },
});
