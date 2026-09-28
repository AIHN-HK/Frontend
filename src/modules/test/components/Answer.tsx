import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  isSelected: boolean;
  onPress: () => void;
};

const Answer = ({ title, isSelected, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.container,
          {
            borderColor: isSelected ? COLORS.green1 : COLORS.basegrey4,
            backgroundColor: isSelected ? COLORS.green2 : COLORS.white,
          },
        ]}
      >
        <Text style={styles.answer}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Answer;

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  answer: {
    ...TYPOGRAPHY.B1,
    textAlign: "center",
    color: COLORS.colortext2,
  },
});
