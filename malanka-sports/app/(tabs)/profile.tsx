import { ScrollView } from "react-native";

import { useSettings } from '../context/settings-context';

export default function CalendarScreen() {
  const { isDark } = useSettings();

  return (
    <ScrollView style={{ backgroundColor: isDark ? '#000' : '#FFF' }}>
    </ScrollView>
  )
}