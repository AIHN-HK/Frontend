import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Pros = {
  title: string;
  colorsbackground: string;
  colorText: string;
  onPress: () => void;
};

const ButtonType2 = ({ title, colorsbackground, colorText, onPress }: Pros) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.container, { backgroundColor: colorsbackground }]}>
        <View>
          <Text style={[styles.title, { color: colorText }]}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ButtonType2;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: "flex-start",
  },
  title: {
    ...TYPOGRAPHY.B2,
    color: COLORS.white,
    textAlign: "center",
  },
});
