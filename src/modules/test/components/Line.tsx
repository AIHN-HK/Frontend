import { COLORS } from "@/utilities/colors";
import { StyleSheet, View } from "react-native";

const Line = () => {
  return <View style={styles.container} />;
};
export default Line;

const styles = StyleSheet.create({
  container: {
    height: 1,
    backgroundColor: COLORS.grey3,
    width: "100%",
  },
});
