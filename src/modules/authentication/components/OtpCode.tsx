import { COLORS } from "@/utilities/colors";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

const CELL_COUNT = 6;

type Props = {
  title: string;
  description: string;
  onPress: (otp: string) => void;
  visible: boolean;
  onClose: () => void;
};

const PhoneNumberVerify = ({
  title,
  description,
  onPress,
  visible,
  onClose,
}: Props) => {
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [codeProps, getCellOnLayout] = useClearByFocusCell({
    value,
    setValue,
  });
  const router = useRouter();
  useEffect(() => {
    if (visible) {
      setValue("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (value.length === CELL_COUNT) {
      onPress(value);
    } else {
      alert("Vui lòng nhập đủ 6 số");
    }
  };
  const handleClose = () => {
    setValue("");
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={styles.body}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={styles.modalView}
        >
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{description}</Text>

            <CodeField
              ref={ref}
              {...codeProps}
              value={value}
              onChangeText={setValue}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete={
                Platform.OS === "android" ? "sms-otp" : "one-time-code"
              }
              renderCell={({ index, symbol, isFocused }) => (
                <Text
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}
                  onLayout={getCellOnLayout(index)}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSubmit}
            >
              <Text style={styles.signInButtonText}>Xác nhận</Text>
            </TouchableOpacity>

            <View style={styles.resendWrapper}>
              <Text>Bạn đã có tài khoản? </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push("/(authen)");
                  handleClose();
                }}
              >
                <Text style={styles.text}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default PhoneNumberVerify;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "85%",
    maxWidth: 360,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,

    elevation: 10,
  },
  contentWrapper: {
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
    color: "#666",
  },
  codeFieldRoot: {
    marginTop: 16,
    justifyContent: "center",
  },
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: "#00000030",
    textAlign: "center",
    marginHorizontal: 5,
    borderRadius: 8,
  },
  focusCell: {
    borderColor: "#000",
  },
  resendWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 24,
  },
  signInButton: {
    backgroundColor: COLORS.green1,
    padding: 15,
    borderRadius: 40,
    marginTop: 20,
    width: "100%",
  },
  signInButtonText: {
    color: COLORS.black,
    textAlign: "center",
    fontSize: 18,
  },
  text: {
    color: "#4D81E7",
  },
});
