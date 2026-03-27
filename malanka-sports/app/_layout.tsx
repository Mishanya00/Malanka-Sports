import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AnimatedSplashScreen } from "./components/animated-splash-screen";
import { SettingsProvider, useSettings } from "./context/settings-context";
import { initDB } from "./database/db";

function MainAppContent() {
  const { isSettingsLoaded, isDark } = useSettings();
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  useEffect(() => {
    if (isSettingsLoaded) {
      initDB();
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
        contentStyle: { backgroundColor: isDark ? '#000' : '#E6F4FE' }
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="stats" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="about" options={{ presentation: 'modal', headerShown: true }} />
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