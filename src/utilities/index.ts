import { Dimensions } from "react-native";
import Toast from "react-native-toast-message";

export const screenWidth = Dimensions.get("window").width;
export const screenHeight = Dimensions.get("window").height;
export const showErrorToast = (title: string, message?: string) => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 5000,
  });
};
export const showSuccessToast = (title: string) => {
  Toast.show({
    type: "success",
    text1: title,
    position: "bottom",
    visibilityTime: 5000,
  });
};
export const capitalizeFirstLetter = (str?: string): string => {
  if (!str?.trim()) return "";
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};
