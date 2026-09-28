import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="resetpassword" />
      <Stack.Screen name="newpassword" />
      <Stack.Screen name="otp-verify" />
    </Stack>
  );
}
