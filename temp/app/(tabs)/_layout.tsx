import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';

export default function TabLayout() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: isDark ? '#333' : '#eee' },
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: t('today'),
          tabBarLabel: t('today'),
          tabBarIcon: ({ color }) => <Ionicons name="flash" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="calendar" 
        options={{
          title: t('calendar'),
          tabBarLabel: t('calendar'),
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          title: t('settings'),
          tabBarLabel: t('settings'),
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: t('profile'),
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }} 
      />
    </Tabs>
  );
}