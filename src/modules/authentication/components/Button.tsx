import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  icon: React.ReactNode;
  style?: any;
  onPress: () => void;
};

const Item1 = ({ icon, onPress, style }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      <View style={[styles.container]}>
        <View style={styles.body}>{icon}</View>
      </View>
    </TouchableOpacity>
  );
};

export default Item1;
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    borderRadius: 12,
    alignItems: "center",
   
    borderWidth: 1,
    borderColor: "#EFF0F6",
    paddingVertical: 20,
  },

  body: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});
