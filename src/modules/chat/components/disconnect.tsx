import ButtonType1 from "@/components/ButtonType1";
import ButtonType2 from "@/components/ButtonType2";
import { COLORS } from "@/utilities/colors";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  message: string | null;
  onRetry: () => void;
  onClose: () => void;
};

const ConnectionErrorModal = ({
  visible,
  message,
  onRetry,
  onClose,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Lỗi kết nối mạng</Text>
          {/* {message && <Text style={styles.modalMessage}>{message}</Text>} */}

          <View style={styles.buttonContainer}>
            <ButtonType1 title="Thử lại" colors={""} onPress={onClose} />

            <ButtonType2
              title="Đóng"
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

export default ConnectionErrorModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 280,
    maxWidth: "75%",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 18,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,

    marginTop: 8,
  },
});
