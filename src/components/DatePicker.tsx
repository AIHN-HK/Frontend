import IconCalendar from "@/assets/icon/ic_calendar";
import IconErrorInput from "@/assets/icon/ic_error";
import { COLORS } from "@/utilities/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  placeholder: string;
  value: string | Date | null;
  onChange: (value: string | null) => void; 
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  onPressRightIcon?: () => void;
  containerStyle?: object;
  mode?: "text" | "date";
};

const TextField2 = ({
  placeholder,
  value,
  onChange,
  leftIcon,
  rightIcon,
  error,
  onPressRightIcon,
  containerStyle,
  mode = "text",
}: Props) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const displayValue =
    mode === "date" && value instanceof Date
      ? `${value.getDate().toString().padStart(2, "0")}/${(value.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${value.getFullYear()}`
      : (value as string) || "";

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {

      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const day = selectedDate.getDate().toString().padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    }
  };

  const openPicker = () => {
    if (mode === "date") {
      setShowDatePicker(true);
    }
  };

  return (
    <View style={[styles.outerContainer, containerStyle]}>
      <TouchableOpacity
        style={[styles.container, error && styles.errorBorder]}
        onPress={openPicker}
        activeOpacity={0.8}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          placeholder={placeholder}
          value={displayValue}
          placeholderTextColor="#767676"
          style={styles.textInput}
          autoCapitalize="none"
          editable={mode === "text"}
          pointerEvents={mode === "date" ? "none" : "auto"}
          onChangeText={mode === "text" ? (text) => onChange(text) : undefined}
        />

        {mode === "date" ? (
          <TouchableOpacity onPress={openPicker} style={styles.iconRight}>
            <IconCalendar />
          </TouchableOpacity>
        ) : (
          rightIcon && (
            <TouchableOpacity
              onPress={onPressRightIcon}
              style={styles.iconRight}
            >
              {rightIcon}
            </TouchableOpacity>
          )
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <IconErrorInput />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {mode === "date" && Platform.OS === "web" && showDatePicker && (
        <View style={styles.webDatePickerContainer}>
          <input
            type="date"
            value={
              value instanceof Date
                ? value.toISOString().split("T")[0]
                : typeof value === "string"
                  ? value
                  : ""
            }
            onChange={(e: any) => {
              const dateStr = e.target.value;
              if (dateStr) {
                onChange(dateStr);
              }
              setShowDatePicker(false);
            }}
            style={{
              fontSize: 16,
              padding: 8,
              borderRadius: 8,
              border: "1px solid #ccc",
              width: "100%",
            }}
          />
        </View>
      )}

      {mode === "date" && Platform.OS !== "web" && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.modalContent}>
              <DateTimePicker
                value={value instanceof Date ? value : new Date()}
                mode="date"
                display="inline"
                onChange={handleDateChange}
                style={styles.picker}
                accentColor={COLORS.black}
                textColor="#333333"
                themeVariant="light"
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    alignSelf: "center",
    paddingBottom: 12,
  },
  container: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderColor: "gray",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5,
    gap: 6,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    fontWeight: "400",
  },
  errorBorder: {
    borderColor: "red",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  picker: {
    width: "100%",
  },
  webDatePickerContainer: {
    marginTop: 8,
  },
});

export default TextField2;
