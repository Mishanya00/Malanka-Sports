import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';
import { sendTestNotification } from '../services/notifications';

export default function SettingsScreen() {
  const { isDark, toggleTheme, changeLocale } = useSettings();
  const { t, i18n } = useTranslation();
  const theme = isDark ? Colors.dark : Colors.light;

  const currentLang = i18n.language;

  const onTestNotification = async () => {
    const result = await sendTestNotification();
    if (result === 'denied') {
      Alert.alert(t('notificationsDeniedTitle'), t('notificationsDeniedBody'));
    } else if (result === 'not-a-device') {
      Alert.alert(t('notificationsNotDeviceTitle'), t('notificationsNotDeviceBody'));
    } else {
      Alert.alert(t('notificationsSentTitle'), t('notificationsSentBody'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.row}>
        <Text style={[styles.text, { color: theme.text }]}>{t('theme')}</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ true: theme.malanka, false: theme.tabIconDefault }}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.text, { color: theme.text }]}>{t('language')}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {['en', 'be'].map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => changeLocale(lang as 'en' | 'be')}
              style={[
                styles.langBtn,
                { borderColor: theme.border },
                currentLang === lang && { backgroundColor: theme.malanka, borderColor: theme.malanka }
              ]}
            >
              <Text style={{
                color: currentLang === lang ? '#000' : theme.textSecondary,
                fontWeight: currentLang === lang ? 'bold' : 'normal'
              }}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.testBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onTestNotification}
      >
        <Ionicons name="notifications" size={22} color={theme.malanka} style={{ marginRight: 10 }} />
        <Text style={[styles.testBtnText, { color: theme.text }]}>{t('sendTestNotification')}</Text>
      </TouchableOpacity>
      <Text style={[styles.hint, { color: theme.textSecondary }]}>{t('sendTestNotificationHint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  text: { fontSize: 18 },
  langBtn: { padding: 8, borderWidth: 1, borderColor: '#888', borderRadius: 8 },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  testBtnText: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
