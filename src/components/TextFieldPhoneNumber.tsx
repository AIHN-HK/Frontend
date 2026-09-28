import IconErrorInput from "@/assets/icon/ic_error";
import { COLORS } from "@/utilities/colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
type Props = {
  dataList: { label: string; value: string }[];
  label: string;
  value: string;
  onChange: (item: { label: string; value: string }) => void;
  phoneNumber: string;
  userPhone: string;
  onChangeText: (text: string) => void;
  error?: string;
};

const TextFieldPhoneNumber = ({
  dataList,
  label,
  value,
  onChange,
  phoneNumber,
  error,
  userPhone,
  onChangeText,
}: Props) => {
  return (
    <View style={styles.outerContainer}>
      <View style={[styles.inputWrapper, error && { borderColor: "red" }]}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={dataList}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={label}
          searchPlaceholder="Search..."
          value={value}
          onChange={onChange}
        />
        <TextInput
          style={styles.inputPhone}
          placeholder={"Số điện thoại"}
          keyboardType="phone-pad"
          value={userPhone}
          onChangeText={onChangeText}
          placeholderTextColor="#767676"
        />
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

export default TextFieldPhoneNumber;

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",

    paddingBottom: 12,
  },
  labelPhone: {
    marginBottom: 5,
    fontSize: 14,
    color: "#000",
  },
  inputWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dropdown: {
    width: 70,
    height: 50,
    justifyContent: "center",
    borderColor: COLORS.innershadow,
    borderWidth: 1,
    borderLeftWidth: 0,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: { marginLeft: 4, marginRight: 0 },
  inputPhone: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#000",
    marginLeft: 10,
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
