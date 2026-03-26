import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';
import { i18n } from '../i18n';

export default function TabLayout() {
  const { isDark } = useSettings();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.tabIconSelected,
      tabBarInactiveTintColor: theme.tabIconDefault,
      tabBarStyle: { backgroundColor: theme.card, borderTopColor: isDark ? '#333' : '#eee' },
      headerStyle: { backgroundColor: theme.border },
      headerTintColor: theme.text,
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: i18n.t('today'),
          tabBarIcon: ({ color }) => <Ionicons name="flash" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="calendar" 
        options={{
          title: i18n.t('calendar'),
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          title: i18n.t('settings'),
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: i18n.t('profile'),
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }} 
      />
    </Tabs>
  );
}