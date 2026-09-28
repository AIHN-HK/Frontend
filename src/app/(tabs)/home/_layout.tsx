import { Stack } from "expo-router";
export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboard)" options={{ headerShown: false }} />
      <Stack.Screen name="(test)" options={{ headerShown: false }} />
    </Stack>
  );
}
