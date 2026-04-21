import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { DateData, Calendar as RNCalendar } from 'react-native-calendars';
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';
import { searchExercises } from '../database/db';

export default function CalendarScreen() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const router = useRouter();
  const theme = isDark ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 1) {
      const results = searchExercises({ query: text });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const onDayPress = (day: DateData) => {
    router.push(`/day/${day.dateString}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t('search') || 'Search exercises...'}
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={[styles.noResults, { color: theme.textSecondary }]}>No results found</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.resultCard, { backgroundColor: theme.card }]}
              onPress={() => router.push(`/day/${item.date}` as any)}
            >
              <Text style={[styles.resultTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={{ color: theme.textSecondary }}>{item.date} • {item.reps}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <RNCalendar
          onDayPress={onDayPress}
          theme={{
            calendarBackground: theme.background,
            textSectionTitleColor: theme.textSecondary,
            selectedDayBackgroundColor: theme.malanka,
            selectedDayTextColor: '#000',
            todayTextColor: theme.malanka,
            dayTextColor: theme.text,
            textDisabledColor: theme.border,
            monthTextColor: theme.text,
            arrowColor: theme.malanka,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12, height: 45, borderRadius: 10, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  noResults: { textAlign: 'center', marginTop: 20 },
  resultCard: { padding: 16, marginHorizontal: 16, marginBottom: 10, borderRadius: 10, elevation: 2 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 }
});