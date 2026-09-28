import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
};
const Description = ({ title }: Props) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.bullet} />
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};
export default Description;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    marginVertical: 1,
  },
  bullet: {
    width: 6,
    marginTop: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: COLORS.colortext2,
    marginRight: 12,
  },
  text: {
    ...TYPOGRAPHY.C3,
    color: COLORS.colortext2,
    flex: 1,
  },
});
