import CustomTabBar from "@/components/CustomBottomBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="recent" options={{ title: "History" }} />
      <Tabs.Screen
        name="chatbot"
        options={{ title: "Chuyên gia", tabBarLabel: "Chat" }}
      />
      <Tabs.Screen name="profile" options={{ title: "Cá nhân" }} />
    </Tabs>
  );
}
