import IconErrorInput from "@/assets/icon/ic_error";
import { TYPOGRAPHY } from "@/utilities/typography";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label?: string;
  placeholder: string;
  value: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange: (text: string) => void;
  error?: string;
  onPressRightIcon?: () => void;
  containerStyle?: object;
  secureTextEntry?: boolean;
  trimWhitespace?: boolean;
  maxPhoneLength?: number;
};

const TextField3 = ({
  label,
  placeholder,
  value,
  leftIcon,
  rightIcon,
  onChange,
  error,
  onPressRightIcon,
  containerStyle,
  secureTextEntry = false,
  trimWhitespace = false,
  maxPhoneLength = 10,
}: Props) => {
  const handleChangeText = (text: string) => {
    let processed = text;
    if (trimWhitespace) {
      processed = text.trim();
    }
    if (/^0\d*$/.test(processed) && processed.length > maxPhoneLength) {
      processed = processed.slice(0, maxPhoneLength);
    }
    onChange(processed);
  };

  const hasLabel = !!label;

  return (
    <View style={[styles.outerContainer, containerStyle]}>
      <View style={[styles.container, error && { borderColor: "red" }]}>
        <View style={styles.innerContainer}>
          {hasLabel && <Text style={styles.innerLabel}>{label}</Text>}
          <View style={styles.inputRow}>
            {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
            <TextInput
              placeholder={placeholder}
              value={value}
              onChangeText={handleChangeText}
              placeholderTextColor="#767676"
              style={[styles.textInput, hasLabel && styles.textInputWithLabel]}
              autoCapitalize="none"
              secureTextEntry={secureTextEntry}
              autoCorrect={false}
              keyboardType={value?.startsWith("0") ? "phone-pad" : "default"}
              multiline={false}
              textAlignVertical="center"
              underlineColorAndroid="transparent"
            />

            {rightIcon && (
              <TouchableOpacity
                onPress={onPressRightIcon}
                style={styles.iconRight}
              >
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <IconErrorInput />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

export default TextField3;

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    alignSelf: "center",
    paddingBottom: 16,
  },
  container: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#fff",
  },
  innerContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  innerLabel: {
    ...TYPOGRAPHY.B3,
    fontWeight: "400",
    color: "#555555",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
    paddingBottom: 8,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  textInput: {
    flex: 1,
    ...TYPOGRAPHY.B1,
    fontWeight: "400",
    color: "#000",
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    lineHeight: 20,
    height: Platform.OS === "android" ? 36 : undefined,
    includeFontPadding: false,
  },
  textInputWithLabel: {},
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    gap: 6,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    fontWeight: "400",
  },
});
