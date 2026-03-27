import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';

export default function SettingsScreen() {
  const { isDark, toggleTheme, changeLocale } = useSettings();
  const { t, i18n } = useTranslation();
  const theme = isDark ? Colors.dark : Colors.light;

  const currentLang = i18n.language;

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  text: { fontSize: 18 },
  langBtn: { padding: 8, borderWidth: 1, borderColor: '#888', borderRadius: 8 },
});