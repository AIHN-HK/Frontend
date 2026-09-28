import { COLORS } from "@/utilities/colors";
import React from "react";
import { View } from "react-native";
type Props = {
  progress: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  borderRadius?: number;
};

const ProgressBar = ({
  progress,
  height = 8,
  backgroundColor = "#e0e0e0",
  fillColor = COLORS.basegrey || COLORS.green1,
  borderRadius = 4,
}: Props) => {
  const normalizedProgress = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={{
        overflow: "hidden",
        height,
        backgroundColor,
        borderRadius,
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${normalizedProgress * 100}%`,
          backgroundColor: fillColor,
          borderRadius,
        }}
      ></View>
    </View>
  );
};

export default ProgressBar;
