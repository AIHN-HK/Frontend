export const COLORS = {
  green1: "#B0F79F",
  grey: "#6C7278",
  innershadow: "#EFF0F6",

  white: "#FFFFFF",
  colortext1: "#3E3E3E",
  colortext2: "#767676",
  basegrey: "#F5F5F5",
  basegrey4: "#C8C8C8",
  grey3: "#A9A9A9",
  black: "#2F2F2F",
  purple1: "#BEB2FF",
  purple2: "#E1DCFF",
  red2: "#FFDDDD",
  yellow2: "#FFF7C6",
  green2: "#DBFED3",
  pink1: "#FF98D3",
  blue1: "#A8CBFF",
  red1: "#FFB6B6",
  yellow1: "#FFF29B",

  blackText: "#1A1A1A",
  gradient_white: "rgba(255,255,255,0.85)",
  gradient_black: "rgba(255,255,255,0)",
};
export const renderColoryCode = (code: string) => {
  switch (code?.trim()?.[0]?.toUpperCase()) {
    case "R":
      return COLORS.purple1;
    case "I":
      return COLORS.green1;
    case "A":
      return COLORS.pink1;
    case "S":
      return COLORS.blue1;
    case "E":
      return COLORS.red1;
    case "C":
      return COLORS.yellow1;
    default:
      return COLORS.purple1;
  }
};
