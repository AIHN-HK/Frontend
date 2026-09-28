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

const ExitModal = ({ visible, onRetry, onClose, description }: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{description}</Text>

          <View style={{ flexDirection: "row", gap: 16 }}>
            <ButtonType1 title={"Kết thúc"} colors={""} onPress={onClose} />

            <ButtonType2
              title="Tiếp tục"
              colorsbackground={COLORS.black}
              onPress={() => onRetry()}
              colorText={COLORS.white}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExitModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "70%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },

  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 30,
  },
});
