import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import IconChatbot1 from "@/assets/icon/ic_chatbot1";
import IconChatbot2 from "@/assets/icon/ic_chatbot2";
import IconHistory1 from "@/assets/icon/ic_history1";
import IconHistory2 from "@/assets/icon/ic_history2";
import IconHome1 from "@/assets/icon/ic_home1";
import IconHome2 from "@/assets/icon/ic_home2";
import IconProfile1 from "@/assets/icon/ic_profile";
import IconProfile2 from "@/assets/icon/ic_profile2";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { useSegments } from "expo-router";

const fallbackIcon = {
  active: <IconChatbot2 />,
  inactive: <IconChatbot1 />,
};

const tabIcons: Record<
  string,
  { active: React.ReactNode; inactive: React.ReactNode }
> = {
  home: {
    active: <IconHome2 />,
    inactive: <IconHome1 />,
  },
  recent: {
    active: <IconHistory2 />,
    inactive: <IconHistory1 />,
  },
  chatbot: {
    active: <IconChatbot2 />,
    inactive: <IconChatbot1 />,
  },
  profile: {
    active: <IconProfile2 />,
    inactive: <IconProfile1 />,
  },
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const segments = useSegments() as string[];
  const isChatScreen = segments.includes("chat");
  const isChatScreen2 = segments.includes("testing");
  const isChatScreen3 = segments.includes("result");
  const isChatScreen4 = segments.includes("result_overrall");
  const isChatScreen5 = segments.includes("onboard");

  const isWeb = useIsDesktopWeb();

  if (
    isChatScreen ||
    isChatScreen2 ||
    isChatScreen3 ||
    isChatScreen4 ||
    isChatScreen5
  ) {
    return null;
  }

  return (
    <View
      style={[
        styles.tabBarContainer,
        isWeb && {
          bottom: 16,
          left: 16,
          right: 16,
          alignItems: "center",
        },
      ]}
    >
      <View
        style={[
          styles.tabBar,
          {
            paddingVertical: isWeb ? 12 : 10,
            paddingHorizontal: isWeb ? 12 : 16,
            gap: isWeb ? 8 : 8,
            minWidth: undefined,
            maxWidth: isWeb ? 760 : undefined,
            width: isWeb ? "100%" : undefined,
            borderRadius: isWeb ? 60 : 999,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          if (route.name === "index") return null;

          const { options } = descriptors[route.key];
          const label =
            (options.tabBarLabel as string) ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          console.log("Route name:", route.name.toLowerCase());
          const icons = tabIcons[route.name.toLowerCase()] || fallbackIcon;
          const iconName = isFocused ? icons.active : icons.inactive;
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabFocused,
                isWeb && {
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  gap: 8,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={{ width: 32, height: 32, flexShrink: 0 }}>
                {iconName}
              </View>
              {isFocused && (
                <Text style={[styles.label, isWeb && { fontSize: 15 }]} numberOfLines={1}>
                  {label.toLowerCase() === "chatbot" ||
                  label.toLowerCase() === "chuyengia"
                    ? "Chuyên gia"
                    : label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// styles giữ nguyên như bạn đã có
const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 34 : 20,
    left: 24,
    right: 24,
  },

  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "space-around",
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },

  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    overflow: "visible",
  },

  tabFocused: {
    backgroundColor: "#1C1C1E",
    borderRadius: 999,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
