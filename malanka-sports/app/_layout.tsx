import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AnimatedSplashScreen } from "./components/animated-splash-screen";
import { AuthProvider, useAuth } from "./context/auth-context";
import { SettingsProvider, useSettings } from "./context/settings-context";

import { initDB } from "./database/db";
import { pollUpdates, syncDataWithBackend } from "./services/api";
import { scheduleDailyReminder } from "./services/notifications";

const POLL_INTERVAL_MS = 5000;

function MainAppContent() {
  const { isSettingsLoaded, isDark } = useSettings();
  const { isAuthLoaded, token, user } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isSettingsLoaded && isAuthLoaded) {
      initDB();
      scheduleDailyReminder();
      SplashScreen.hideAsync();
    }
  }, [isSettingsLoaded, isAuthLoaded]);

  useEffect(() => {
    if (!token || !user) return;
    syncDataWithBackend(token, user.user_id);
    const interval = setInterval(() => {
      pollUpdates(token, user.user_id);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, user]);

  useEffect(() => {
    if (!isAuthLoaded || !isSplashFinished) return;
    const inLogin = segments.some((s) => s === 'login');
    if (!token && !inLogin) {
      router.replace('/login' as any);
    } else if (token && inLogin) {
      router.replace('/(tabs)' as any);
    }
  }, [token, isAuthLoaded, isSplashFinished, segments]);

  if (!isSettingsLoaded || !isAuthLoaded) return null;

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
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="stats" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="about" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="news" options={{ presentation: 'modal', headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </SettingsProvider>
  );
}
