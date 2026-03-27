import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';

export default function StatsScreen() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>{t('stats')} - Work in progress...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' }
});