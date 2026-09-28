import { RIASECScore, scoreOrder } from "@/modules/test/utilities";
import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  parsedScore: RIASECScore;
}

export const ResultScoreSection = ({ parsedScore }: Props) => {
  const hasScores = Object.keys(parsedScore).length > 0;
  if (!hasScores) {
    return (
      <Text style={styles.noDataText}>Không có dữ liệu điểm chi tiết</Text>
    );
  }
  return (
    <>
      {scoreOrder.map((type, index) => {
        const rawScore = parsedScore[type];
        if (rawScore === undefined) return null;
        const percentage = Math.round((Number(rawScore) / 18) * 100);
        return (
          <View key={type} style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Nhóm {index + 1}</Text>
            <Text style={styles.scoreValue}>{percentage}/100</Text>
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  scoreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black,
  },
  scoreLabel: {
    color: COLORS.black,
    ...TYPOGRAPHY.B4,
    fontWeight: "500",
  },
  scoreValue: {
    ...TYPOGRAPHY.B3,
    fontWeight: "400",
    color: COLORS.black,
  },
  noDataText: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 15,
    marginTop: 16,
    paddingVertical: 20,
  },
});
