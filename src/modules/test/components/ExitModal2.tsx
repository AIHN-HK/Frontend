import ButtonType1 from "@/components/ButtonType1";
import ButtonType2 from "@/components/ButtonType2";
import { COLORS } from "@/utilities/colors";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  description: string;
  onRetry: () => void;
  onClose: () => void;
};

const ExitModal2 = ({ visible, onRetry, onClose, description }: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRetry} // thêm để xử lý nút back Android
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Kết thúc phiên làm bài?</Text>

          <Text style={styles.modalMessage}>{description}</Text>

          <View style={styles.buttonRow}>
            <ButtonType1 title="Kết thúc" colors={""} onPress={onClose} />

            <ButtonType2
              title="Tiếp tục"
              colorsbackground={COLORS.black}
              onPress={onRetry}
              colorText={COLORS.white}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExitModal2;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "78%",
    maxWidth: 340,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#4A4A4A",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
