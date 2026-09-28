import { screenHeight } from "@/utilities";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const DoneScreen = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const isWeb = useIsDesktopWeb();

  const spacing = {
    paddingTopPercentage: isWeb ? screenHeight * 0.3 : screenHeight * 0.4,
    titleToSubtitle: isWeb ? 24 : 12,
    subtitleToLoader: isWeb ? 120 : 80,
    loaderSize: isWeb ? 160 : 120,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View
        style={[styles.content, { paddingTop: spacing.paddingTopPercentage }]}
      >
        <Text style={styles.title}>BẠN ĐÃ HOÀN THÀNH!</Text>
        <Text
          style={[
            styles.subtitle,
            {
              marginTop: spacing.titleToSubtitle,
              marginBottom: spacing.subtitleToLoader,
            },
          ]}
        >
          Hệ thống đang tính toán kết quả
        </Text>

        <Animated.View
          style={[styles.loaderContainer, { transform: [{ rotate: spin }] }]}
        >
          <Svg
            width={spacing.loaderSize}
            height={spacing.loaderSize}
            viewBox="0 0 100 100"
          >
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={COLORS.green1} stopOpacity="1" />
                <Stop
                  offset="70%"
                  stopColor={COLORS.green1}
                  stopOpacity="0.1"
                />
                <Stop offset="100%" stopColor={COLORS.green1} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#grad)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="180 100"
            />
          </Svg>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default DoneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
