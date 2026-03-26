import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';

export default function TodayScreen() {
  const { isDark, locale } = useSettings();
  const theme = isDark ? Colors.dark : Colors.light;

  const formattedDate = new Date().toLocaleDateString(locale === 'be' ? 'be-BY' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const exercises = [
    { id: 1, title: 'Pull-Ups', reps: '3x20' },
    { id: 2, title: 'Push-Ups', reps: '5x25' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.dateHeader, { color: theme.text }]}>
        {formattedDate}
      </Text>

      {exercises.map((ex) => (
        <View key={ex.id} style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{ex.title}</Text>
            <Text style={{ color: theme.textSecondary }}>{ex.reps}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.success }]}>
              <Ionicons name="checkmark" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.danger }]}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  dateHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  cardInfo: { justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardActions: { flexDirection: 'row', gap: 10 },
  btn: { padding: 8, borderRadius: 8 },
});