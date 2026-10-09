import { authSession } from '@/helpers/authSession';
import '@/store/ExamStore';
import { Platform } from 'react-native';
import { ThemeWrapper } from "@/components/ThemeWrapper";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

export const unstable_settings = {
  initialRouteName: "(authen)",
};
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    void authSession.initialize().catch(() => authSession.clear());
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'access_token' || event.key === 'USER_ID' || event.key === 'SESSION_SIGNED_OUT' || event.key === null) {
        void authSession.initialize().catch(() => authSession.clear());
      }
    };
    if (Platform.OS === 'web') window.addEventListener('storage', onStorage);
    return () => { if (Platform.OS === 'web') window.removeEventListener('storage', onStorage); };
  }, []);
  const [loaded, error] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Suspense fallback={<StatusBar style="auto" />}>
        <ThemeWrapper>
          <Stack>
            <Stack.Screen name="(authen)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <Toast />
          <StatusBar style="auto" />
        </ThemeWrapper>
      </Suspense>
    </GestureHandlerRootView>
  );
}
