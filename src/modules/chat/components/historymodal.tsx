import Header from "@/modules/profile/components/header";
import { COLORS } from "@/utilities/colors";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const HistoryModal = ({ visible, onClose }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.root}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.panel,
            {
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 16,
              gap: 20,
            },
          ]}
        >
          <Header />
          <Text style={styles.title}>Lịch sử hỏi đáp</Text>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: COLORS.colortext2,
            width: "100%",
          }}
        />
      </View>
    </Modal>
  );
};

export default HistoryModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  overlay: {
    width: "25%",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  panel: {
    width: "75%",
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },
});
