import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AnimatedSplashScreen } from "./components/animated-splash-screen";
import { SettingsProvider, useSettings } from "./context/settings-context";

function MainAppContent() {
  const { isSettingsLoaded, isDark, locale } = useSettings();
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  useEffect(() => {
    if (isSettingsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isSettingsLoaded]);

  if (!isSettingsLoaded) return null;

  if (!isSplashFinished) {
    return (
      <AnimatedSplashScreen 
        onAnimationFinish={() => setIsSplashFinished(true)} 
      />
    );
  }

  return (
    <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#000' : '#E6F4FE' } // Фикс мерцания фона
      }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <MainAppContent />
    </SettingsProvider>
  );
}