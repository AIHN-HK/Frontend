import { TYPOGRAPHY } from "@/utilities/typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Pros = {
  iconLeft?: React.ReactNode;
  title: React.ReactNode;
  iconRight?: React.ReactNode;
  fontWeight?: "normal" | "bold" | "400" | "500" | "600" | "700";
  onClickLeft?: () => void;
  onClickRight?: () => void;
};

const Header1 = ({
  title,
  iconLeft,
  iconRight,
  fontWeight,
  onClickLeft,
  onClickRight,
}: Pros) => {
  return (
    <View style={styles.header}>
      <View style={styles.header_container}>
        <TouchableOpacity onPress={onClickLeft}>{iconLeft}</TouchableOpacity>
        <Text
          style={[
            styles.headertext,
            typeof fontWeight === "number"
              ? { fontWeight: fontWeight }
              : { fontWeight },
          ]}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={onClickRight}>{iconRight}</TouchableOpacity>
      </View>
    </View>
  );
};

export default Header1;

const styles = StyleSheet.create({
  header: { paddingBottom: 25 },
  header_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingTop: 10,
  },
  headertext: {
    ...TYPOGRAPHY.B1,
    fontSize: 16,
    fontWeight: "600",
  },
});
