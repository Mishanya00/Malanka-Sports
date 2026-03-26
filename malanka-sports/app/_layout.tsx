import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { AnimatedSplashScreen } from "./components/animated-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!isSplashFinished) {
    return (
      <AnimatedSplashScreen 
        onAnimationFinish={() => setIsSplashFinished(true)} 
      />
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}