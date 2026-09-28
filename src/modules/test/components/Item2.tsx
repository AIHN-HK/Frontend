import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { capitalizeFirstLetter, screenWidth } from "@/utilities";
import { COLORS, renderColoryCode } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  item: any;
  isSelected?: boolean;
};

const RenderItem2 = ({ item, isSelected = false }: Props) => {
  console.log("Item", item);
  const topCode = capitalizeFirstLetter(item.title);
  const title = topCode ? `Nhóm ngành ${topCode}` : "Bài test";
  const date = item?.date;
  const description = item.description;
  const isWeb = useIsDesktopWeb();
  const spacing = {
    cardPaddingHorizontal: isWeb ? 32 : 16,
    cardPaddingVertical: isWeb ? 32 : 20,
    cardMarginBottom: isWeb ? 24 : 16,
    cardBarMarginBottom: isWeb ? 12 : 6,
    titleMaxWidth: isWeb ? screenWidth * 0.6 : screenWidth * 0.7,
    descriptionMarginVertical: isWeb ? 16 : 10,
    actionMarginTop: isWeb ? 20 : 10,
    actionPaddingHorizontal: isWeb ? 40 : 20,
    actionPaddingVertical: isWeb ? 16 : 12,
  };
  return (
    <View
      style={[
        styles.historyCard,
        {
          paddingHorizontal: spacing.cardPaddingHorizontal,
          paddingVertical: spacing.cardPaddingVertical,
          marginBottom: spacing.cardMarginBottom,
          borderColor: renderColoryCode(item.code),
          width: isWeb ? "100%" : screenWidth - 40,
        },
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.cardTitle, { maxWidth: spacing.titleMaxWidth }]}>
          {title}
        </Text>
        <View
          style={[
            styles.cardBar,
            {
              marginBottom: spacing.cardBarMarginBottom,
              backgroundColor: renderColoryCode(item.code),
            },
          ]}
        />
      </View>
      <Text style={styles.cardDate}>{date}</Text>
      <Text
        style={[
          styles.cardDescription,
          { marginVertical: spacing.descriptionMarginVertical },
        ]}
      >
        {description}
      </Text>
      <View
        style={[
          styles.container,
          {
            marginTop: spacing.actionMarginTop,
            paddingHorizontal: spacing.actionPaddingHorizontal,
            paddingVertical: spacing.actionPaddingVertical,
            backgroundColor: renderColoryCode(item.code),
            alignSelf: "flex-end",
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: "black" }]}>Xem chi tiết</Text>
        </View>
      </View>
    </View>
  );
};

export default RenderItem2;

const styles = StyleSheet.create({
  historyCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: COLORS.purple1,
    shadowColor: COLORS.purple1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    ...TYPOGRAPHY.B4,
    fontWeight: "700",
    color: COLORS.colortext1,
  },
  cardBar: {
    width: 24,
    height: 6,
    borderRadius: 10,
  },
  cardDate: {
    ...TYPOGRAPHY.S1,
    color: COLORS.black,
    fontWeight: "400",
    marginTop: 4,
  },
  cardDescription: {
    ...TYPOGRAPHY.C3,
    color: COLORS.colortext2,
    lineHeight: 20,
  },
  container: {
    borderRadius: 30,
  },
  title: {
    textAlign: "center",
    ...TYPOGRAPHY.B2,
  },
});
