import { Stack } from "expo-router";

export default function TestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="testing" />
      <Stack.Screen name="done" />
      <Stack.Screen name="result" />
      <Stack.Screen name="result_overrall" />
    </Stack>
  );
}
