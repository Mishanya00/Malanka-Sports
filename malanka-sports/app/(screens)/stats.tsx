import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/colors';
import { useAuth } from '../context/auth-context';
import { useSettings } from '../context/settings-context';
import { db } from '../database/db';

type StatsRow = { status: string; c: number };

export default function StatsScreen() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = isDark ? Colors.dark : Colors.light;
  const userId = user?.user_id ?? 0;

  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, pending: 0 });

  useEffect(() => {
    if (!userId) return;
    try {
      const rows = db.getAllSync(
        'SELECT status, COUNT(*) as c FROM exercises WHERE user_id = ? AND is_deleted = 0 GROUP BY status',
        [userId]
      ) as StatsRow[];
      let completed = 0, failed = 0, pending = 0;
      for (const r of rows) {
        if (r.status === 'completed') completed = r.c;
        else if (r.status === 'failed') failed = r.c;
        else pending = r.c;
      }
      setStats({ total: completed + failed + pending, completed, failed, pending });
    } catch (e) {
      console.error(e);
    }
  }, [userId]);

  const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const message = t('statsShareMessage', {
    completed: stats.completed,
    total: stats.total,
    failed: stats.failed,
    pending: stats.pending,
    rate,
  });

  const onShare = async () => {
    try {
      await Share.share({ message });
    } catch (e) {
      console.error(e);
    }
  };

  const onShareTelegram = async () => {
    const url = `tg://msg_url?url=&text=${encodeURIComponent(message)}`;
    const fallback = `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      await Linking.openURL(supported ? url : fallback);
    } catch {
      Alert.alert('Telegram not installed');
    }
  };

  const cards: Array<{ label: string; value: number; color: string; icon: any }> = [
    { label: t('statsTotal'), value: stats.total, color: theme.text, icon: 'list' },
    { label: t('statsCompleted'), value: stats.completed, color: theme.success, icon: 'checkmark-circle' },
    { label: t('statsFailed'), value: stats.failed, color: theme.danger, icon: 'close-circle' },
    { label: t('statsPending'), value: stats.pending, color: theme.textSecondary, icon: 'time' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.rateBlock, { backgroundColor: theme.card }]}>
        <Text style={[styles.rateLabel, { color: theme.textSecondary }]}>{t('statsCompletionRate')}</Text>
        <Text style={[styles.rateValue, { color: theme.malanka }]}>{rate}%</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((c, i) => (
          <View key={i} style={[styles.card, { backgroundColor: theme.card }]}>
            <Ionicons name={c.icon} size={28} color={c.color} style={{ marginBottom: 8 }} />
            <Text style={[styles.cardValue, { color: c.color }]}>{c.value}</Text>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.malanka }]} onPress={onShare}>
        <Ionicons name="share-social" size={20} color="#000" style={{ marginRight: 10 }} />
        <Text style={styles.shareText}>{t('statsShare')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.shareBtn, { backgroundColor: '#0088cc' }]} onPress={onShareTelegram}>
        <Ionicons name="paper-plane" size={20} color="#FFF" style={{ marginRight: 10 }} />
        <Text style={[styles.shareText, { color: '#FFF' }]}>{t('statsShareTelegram')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 24 },
  rateBlock: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  rateLabel: { fontSize: 14, marginBottom: 6 },
  rateValue: { fontSize: 48, fontWeight: 'bold', lineHeight: 52 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    aspectRatio: 1.25,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  cardValue: { fontSize: 32, fontWeight: 'bold' },
  cardLabel: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  spacer: { flex: 1 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    marginTop: 12,
  },
  shareText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
