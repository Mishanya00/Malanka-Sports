import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensurePermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }
  return true;
}

export async function scheduleDailyReminder() {
  const ok = await ensurePermissions();
  if (!ok) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Malanka Sports ⚡',
      body: 'Time to complete your exercises for today!',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });
}

export async function sendTestNotification(): Promise<'sent' | 'denied' | 'not-a-device'> {
  if (!Device.isDevice) return 'not-a-device';
  const ok = await ensurePermissions();
  if (!ok) return 'denied';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Malanka Sports ⚡',
      body: 'Test notification — it works!',
      data: { test: true },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
  return 'sent';
}
