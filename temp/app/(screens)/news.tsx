import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';
import { useNewsViewModel } from '../viewmodels/use-news-view-model';

export default function NewsScreen() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const theme = isDark ? Colors.dark : Colors.light;

  const { news, isLoading, isOffline, fetchNews } = useNewsViewModel();

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const openLink = (url: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {isOffline && (
        <View style={[styles.offlineBanner, { backgroundColor: theme.danger }]}>
          <Ionicons name="cloud-offline" size={20} color="#FFF" />
          <Text style={styles.offlineText}>{t('offlineMode')}</Text>
        </View>
      )}

      {isLoading && news.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.malanka} />
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item, index) => item.url + index}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={fetchNews}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              {item.urlToImage ? (
                <Image source={{ uri: item.urlToImage }} style={styles.image} />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.border }]}>
                  <Ionicons name="image-outline" size={40} color={theme.textSecondary} />
                </View>
              )}
              
              <View style={styles.cardContent}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={3}>
                  {item.description}
                </Text>
                
                <TouchableOpacity onPress={() => openLink(item.url)} style={styles.readMoreBtn}>
                  <Text style={{ color: theme.malanka, fontWeight: 'bold' }}>{t('readMore')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 8 },
  offlineText: { color: '#FFF', fontWeight: 'bold' },
  card: { 
    borderRadius: 12, overflow: 'hidden', marginBottom: 16, elevation: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  image: { width: '100%', height: 180, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 180, justifyContent: 'center', alignItems: 'center' },
  cardContent: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  readMoreBtn: { alignSelf: 'flex-start', paddingVertical: 5 }
});