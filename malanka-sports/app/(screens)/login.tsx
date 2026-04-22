import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '../constants/colors';
import { useAuth } from '../context/auth-context';
import { useSettings } from '../context/settings-context';

export default function LoginScreen() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const { signIn, isAuthenticating } = useAuth();
  const theme = isDark ? Colors.dark : Colors.light;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!username.trim() || !password) {
      setError(t('loginFillBoth'));
      return;
    }
    const result = await signIn(username, password);
    if (!result.ok) {
      setError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.logoRow}>
        <Ionicons name="flash" size={64} color={theme.malanka} />
        <Text style={[styles.logoText, { color: theme.text }]}>Malanka Sports</Text>
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('loginSubtitle')}</Text>

      <View style={[styles.field, { borderColor: theme.border }]}>
        <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={t('username')}
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={[styles.field, { borderColor: theme.border }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={t('password')}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}

      <TouchableOpacity
        style={[styles.submit, { backgroundColor: theme.malanka }]}
        onPress={onSubmit}
        disabled={isAuthenticating}
      >
        {isAuthenticating ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.submitText}>{t('loginOrRegister')}</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.hint, { color: theme.textSecondary }]}>{t('loginHint')}</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  logoRow: { alignItems: 'center', marginBottom: 8 },
  logoText: { fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  subtitle: { textAlign: 'center', marginBottom: 32, fontSize: 14 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 48,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16 },
  error: { marginBottom: 12, textAlign: 'center' },
  submit: { height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  submitText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  hint: { textAlign: 'center', fontSize: 12, marginTop: 18 },
});
