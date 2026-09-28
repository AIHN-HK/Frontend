import IconDetail from "@/assets/icon/ic_detail";
import { COLORS } from "@/utilities/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  date: string;
  colors: string;
};

const ButtonHistory = ({ title, date, colors }: Props) => {
  return (
    <View style={[styles.container, { backgroundColor: colors }]}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={styles.iconContainer}>
          <IconDetail />
        </View>
      </View>
    </View>
  );
};

export default ButtonHistory;
const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: COLORS.colortext1,
    fontSize: 14,
    fontWeight: "500",
  },

  date: {
    color: COLORS.colortext2,
    marginTop: 4,
    fontSize: 12,
  },
});
