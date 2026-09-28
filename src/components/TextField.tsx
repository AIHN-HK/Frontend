import IconErrorInput from "@/assets/icon/ic_error";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
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

const TextField = ({
  placeholder,
  value,   
  leftIcon,
  rightIcon,
  onChange,
  error,
  onPressRightIcon,
  secureTextEntry = false,
  containerStyle,
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

  return (
    <View style={[styles.outerContainer, containerStyle]}>
      <View style={[styles.container, error && { borderColor: "red" }]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          placeholder={placeholder}
          value={value} 
          onChangeText={handleChangeText} 
          placeholderTextColor="#767676"
          style={styles.textInput}
          autoCapitalize="none"
          secureTextEntry={secureTextEntry}
          autoCorrect={false}
          keyboardType={
            value?.startsWith("0") ? "phone-pad" : "email-address"
          }
        />

        {rightIcon && (
          <TouchableOpacity onPress={onPressRightIcon} style={styles.iconRight}>
            {rightIcon}
          </TouchableOpacity>
        )}
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

export default TextField;

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
});
