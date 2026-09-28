import IconAvartar1 from "@/assets/icon/ic_avartar";
import { COLORS } from "@/utilities/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Header = () => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Good Morning!</Text>
        <Text style={styles.username}>Thi Hong Nhung Ngo</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Nhóm ngành</Text>
          <Text style={styles.badgeValue}>Kỹ sư</Text>
        </View>
      </View>
      <IconAvartar1 />
    </View>
  );
};

export default Header;
const styles = StyleSheet.create({
  header: {
    paddingTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: COLORS.colortext2,
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.colortext1,
    marginTop: 2,
  },

  badge: {
    flexDirection: "row",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.purple1,
    alignSelf: "flex-start",
  },
  badgeLabel: {
    fontSize: 12,
    color: COLORS.colortext2,
    marginRight: 4,
  },
  badgeValue: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.colortext1,
  },
});
