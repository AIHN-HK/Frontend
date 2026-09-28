import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Pros = {
  title: string;
  colors: string;
  onPress: () => void;
};

const ButtonType1 = ({ title, colors, onPress }: Pros) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.container, { backgroundColor: colors }]}>
        <View>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ButtonType1;

const styles = StyleSheet.create({
  container: {
    padding: 11,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.colortext2,
    alignSelf: "flex-start",
  },
  title: {
    ...TYPOGRAPHY.B2,
    color: COLORS.colortext2,
    textAlign: "center",
  },
});
