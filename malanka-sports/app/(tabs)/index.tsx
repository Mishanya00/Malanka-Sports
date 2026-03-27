import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';
import { db } from '../database/db';

type Exercise = {
  id: number;
  title: string;
  reps: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
};

export default function TodayScreen() {
  const { isDark } = useSettings();
  const { t, i18n } = useTranslation();
  const theme = isDark ? Colors.dark : Colors.light;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Состояния для полей ввода
  const [newTitle, setNewTitle] = useState('');
  const [newReps, setNewReps] = useState('');
  // Если editingId не null, значит мы редактируем существующую запись
  const [editingId, setEditingId] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadExercises = () => {
    try {
      const result = db.getAllSync('SELECT * FROM exercises WHERE date = ?', [todayStr]) as Exercise[];
      setExercises(result);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(useCallback(() => { loadExercises(); }, []));

  // Открытие модалки для создания
  const openAddModal = () => {
    setEditingId(null);
    setNewTitle('');
    setNewReps('');
    setModalVisible(true);
  };

  // Открытие модалки для редактирования
  const openEditModal = (ex: Exercise) => {
    setEditingId(ex.id);
    setNewTitle(ex.title);
    setNewReps(ex.reps);
    setModalVisible(true);
  };

  const saveExercise = () => {
    if (!newTitle.trim() || !newReps.trim()) return;

    try {
      if (editingId) {
        // РЕДАКТИРОВАНИЕ
        db.runSync(
          'UPDATE exercises SET title = ?, reps = ? WHERE id = ?',
          [newTitle, newReps, editingId]
        );
      } else {
        // СОЗДАНИЕ
        db.runSync(
          'INSERT INTO exercises (title, reps, date, status) VALUES (?, ?, ?, ?)',
          [newTitle, newReps, todayStr, 'pending']
        );
      }
      setModalVisible(false);
      loadExercises();
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = (id: number, status: 'completed' | 'failed' | 'pending') => {
    try {
      db.runSync('UPDATE exercises SET status = ? WHERE id = ?', [status, id]);
      loadExercises();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteExercise = (id: number) => {
    Alert.alert(t('delete'), t('delete') + '?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => {
          db.runSync('DELETE FROM exercises WHERE id = ?', [id]);
          loadExercises();
        }
      }
    ]);
  };

  const formattedDate = new Date().toLocaleDateString(i18n.language === 'be' ? 'be-BY' : 'en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={[styles.dateHeader, { color: theme.text }]}>{formattedDate}</Text>

        {exercises.length === 0 ? (
          <Text style={[styles.noDataText, { color: theme.textSecondary }]}>{t('noExercises')}</Text>
        ) : (
          exercises.map((ex) => (
            <View key={ex.id} style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardInfo}>
                <Text style={[
                  styles.cardTitle, 
                  { color: theme.text },
                  ex.status !== 'pending' && { textDecorationLine: 'line-through', opacity: 0.6 }
                ]}>
                  {ex.title}
                </Text>
                <Text style={{ color: theme.textSecondary }}>{ex.reps}</Text>
                
                {/* Кнопки управления (Изменить/Удалить) снизу текста */}
                <View style={styles.manageButtons}>
                  <TouchableOpacity onPress={() => openEditModal(ex)}>
                    <Ionicons name="create-outline" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteExercise(ex.id)}>
                    <Ionicons name="trash-outline" size={20} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.cardActions}>
                {ex.status === 'pending' ? (
                  <>
                    <TouchableOpacity onPress={() => updateStatus(ex.id, 'completed')} style={[styles.btn, { backgroundColor: theme.success }]}>
                      <Ionicons name="checkmark" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateStatus(ex.id, 'failed')} style={[styles.btn, { backgroundColor: theme.danger }]}>
                      <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity onPress={() => updateStatus(ex.id, 'pending')} style={[styles.btn, { backgroundColor: theme.tabIconDefault }]}>
                    <Ionicons name="refresh" size={20} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.malanka }]} onPress={openAddModal}>
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingId ? t('editExercise') : t('addExercise')}
            </Text>
            
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder={t('title')}
              placeholderTextColor={theme.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder={t('reps')}
              placeholderTextColor={theme.textSecondary}
              value={newReps}
              onChangeText={setNewReps}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveExercise} style={styles.modalBtn}>
                <Text style={{ color: theme.malanka, fontWeight: 'bold' }}>{editingId ? t('save') : t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  dateHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  noDataText: { textAlign: 'center', marginTop: 50, fontSize: 16, fontStyle: 'italic' },
  card: { 
    flexDirection: 'row', justifyContent: 'space-between', padding: 16, 
    borderRadius: 12, marginBottom: 12, elevation: 3, 
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  manageButtons: { flexDirection: 'row', gap: 15, marginTop: 8 }, // Ряд кнопок управления
  cardActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  btn: { padding: 8, borderRadius: 8 },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, 
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { width: '85%', padding: 25, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { padding: 10, flex: 1, alignItems: 'center' }
});