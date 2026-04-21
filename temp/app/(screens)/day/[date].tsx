import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useSettings } from '../../context/settings-context';
import { db } from '../../database/db';

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const theme = isDark ? Colors.dark : Colors.light;

  const [exercises, setExercises] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newReps, setNewReps] = useState('');

  const loadExercises = () => {
    const result = db.getAllSync('SELECT * FROM exercises WHERE date = ?', [date]);
    setExercises(result);
  };

  useEffect(() => { loadExercises(); }, [date]);

  const saveExercise = () => {
    if (!newTitle.trim() || !newReps.trim()) return;
    db.runSync(
      'INSERT INTO exercises (title, reps, date, status) VALUES (?, ?, ?, ?)',
      [newTitle, newReps, date, 'pending']
    );
    setModalVisible(false);
    setNewTitle('');
    setNewReps('');
    loadExercises();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{date}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ padding: 16 }}>
        {exercises.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>No exercises for this day.</Text>
        ) : (
          exercises.map(ex => (
             <View key={ex.id} style={[styles.card, { backgroundColor: theme.card }]}>
               <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold' }}>{ex.title}</Text>
               <Text style={{ color: theme.textSecondary }}>{ex.reps}</Text>
             </View>
          ))
        )}
      </ScrollView>

      {/* Кнопка добавления активна и для прошлых, и для будущих дней */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.malanka }]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add to {date}</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} placeholder="Title" placeholderTextColor={theme.textSecondary} value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} placeholder="Reps" placeholderTextColor={theme.textSecondary} value={newReps} onChangeText={setNewReps} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}><Text style={{ color: theme.textSecondary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveExercise} style={styles.modalBtn}><Text style={{ color: theme.malanka, fontWeight: 'bold' }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 3 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { width: '85%', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { padding: 10, flex: 1, alignItems: 'center' }
});