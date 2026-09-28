// src/utilities/spacing.ts
import { Platform } from "react-native";

// Base spacing cho mobile (đơn vị px)
export const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

// Hệ số nhân cho web (làm giãn màn hình lớn hơn mobile)
const webMultiplier = 1.6; // 1.5–2.0 là hợp lý, bạn có thể chỉnh sau

// Hàm lấy spacing responsive
export const getSpacing = (size: keyof typeof baseSpacing) => {
  const baseValue = baseSpacing[size];
  return Platform.OS === "web"
    ? Math.round(baseValue * webMultiplier)
    : baseValue;
};

// Hàm tiện lợi cho margin/padding (dùng object style)
export const spacingStyles = {
  mt: (size: keyof typeof baseSpacing) => ({ marginTop: getSpacing(size) }),
  mb: (size: keyof typeof baseSpacing) => ({ marginBottom: getSpacing(size) }),
  ml: (size: keyof typeof baseSpacing) => ({ marginLeft: getSpacing(size) }),
  mr: (size: keyof typeof baseSpacing) => ({ marginRight: getSpacing(size) }),
  mx: (size: keyof typeof baseSpacing) => ({
    marginHorizontal: getSpacing(size),
  }),
  my: (size: keyof typeof baseSpacing) => ({
    marginVertical: getSpacing(size),
  }),
  pt: (size: keyof typeof baseSpacing) => ({ paddingTop: getSpacing(size) }),
  pb: (size: keyof typeof baseSpacing) => ({ paddingBottom: getSpacing(size) }),
  pl: (size: keyof typeof baseSpacing) => ({ paddingLeft: getSpacing(size) }),
  pr: (size: keyof typeof baseSpacing) => ({ paddingRight: getSpacing(size) }),
  px: (size: keyof typeof baseSpacing) => ({
    paddingHorizontal: getSpacing(size),
  }),
  py: (size: keyof typeof baseSpacing) => ({
    paddingVertical: getSpacing(size),
  }),
  gap: (size: keyof typeof baseSpacing) => ({ gap: getSpacing(size) }),
};
