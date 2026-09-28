import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";

const DESKTOP_BREAKPOINT = 768;

export function useIsDesktopWeb(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (Platform.OS !== "web") return false;
    return Dimensions.get("window").width >= DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setIsDesktop(window.width >= DESKTOP_BREAKPOINT);
    });

    return () => subscription.remove();
  }, []);

  return isDesktop;
}
