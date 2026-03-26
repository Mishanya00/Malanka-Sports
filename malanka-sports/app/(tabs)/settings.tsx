import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';
import { i18n } from '../i18n';

export default function SettingsScreen() {
  const { isDark, toggleTheme, locale, changeLocale } = useSettings();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.row}>
        <Text style={[styles.text, { color: theme.text }]}>{i18n.t('theme')}</Text>
        <Switch 
          value={isDark} 
          onValueChange={toggleTheme} 
          trackColor={{ true: theme.malanka, false: theme.tabIconDefault }} 
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.text, { color: theme.text }]}>{i18n.t('language')}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {['en', 'be'].map((lang) => (
            <TouchableOpacity 
              key={lang}
              onPress={() => changeLocale(lang as 'en' | 'be')} 
              style={[
                styles.langBtn, 
                { borderColor: theme.border },
                locale === lang && { backgroundColor: theme.malanka, borderColor: theme.malanka }
              ]}
            >
              <Text style={{ 
                color: locale === lang ? '#000' : theme.textSecondary,
                fontWeight: locale === lang ? 'bold' : 'normal' 
              }}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  text: { fontSize: 18 },
  langBtn: { padding: 8, borderWidth: 1, borderColor: '#888', borderRadius: 8 },
  langBtnActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
});