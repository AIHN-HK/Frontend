import { TextStyle } from "react-native";
export const FONT_FAMILY = {
  REGULAR: "Inter-Regular",
  MEDIUM: "Inter-Medium",
  SEMIBOLD: "Inter-SemiBold",
  BOLD: "Inter-Bold",
} as const;

export const TYPOGRAPHY = {
  H1: {
    fontFamily: FONT_FAMILY.SEMIBOLD,
    fontSize: 48,
    lineHeight: 96,
    letterSpacing: 0,
  } as TextStyle,

  H2: {
    fontFamily: FONT_FAMILY.SEMIBOLD,
    fontSize: 40,
    lineHeight: 60,
    letterSpacing: 0,
  } as TextStyle,

  H3: {
    fontFamily: FONT_FAMILY.SEMIBOLD,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  } as TextStyle,

  H4: {
    fontFamily: FONT_FAMILY.SEMIBOLD,
    fontSize: 24,
    lineHeight: 36,
    letterSpacing: 0,
  } as TextStyle,

  H5: {
    fontFamily: FONT_FAMILY.SEMIBOLD,
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0,
  } as TextStyle,

  B1: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  B2: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  B3: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  B4: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  C1: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  C2: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  C3: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,

  C4: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  S1: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,

  S2: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof TYPOGRAPHY;

export const Padding = {
  paddingHorizontal: 24,
};
