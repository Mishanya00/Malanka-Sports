import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';
import { uploadAvatar } from '../services/api';

export default function ProfileScreen() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const router = useRouter();
  const theme = isDark ? Colors.dark : Colors.light;
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user_avatar').then(url => {
      if (url) setAvatar(url);
    });
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setIsUploading(true);
      const uploadResult = await uploadAvatar(result.assets[0].uri);
      setIsUploading(false);

      if (uploadResult && uploadResult.url) {
        setAvatar(uploadResult.url);
        await AsyncStorage.setItem('user_avatar', uploadResult.url);
      }
    }
  };

  const menuItems = [
    { icon: 'bar-chart', title: t('stats'), route: '/stats' },
    { icon: 'person', title: t('profileDetails'), route: '/profile' },
    { icon: 'newspaper', title: t('news'), route: '/news' },
    { icon: 'information-circle', title: t('about'), route: '/about' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color={theme.malanka} />
          ) : avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          ) : (
            <Ionicons name="person" size={50} color={theme.textSecondary} />
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.malanka }]}>
             <Ionicons name="camera" size={14} color="#000" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.name, { color: theme.text }]}>Michael Budnikau</Text>
      </View>

      <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.menuItem, index !== menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            onPress={() => item.route.startsWith('/') ? router.push(item.route as any) : null}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={theme.malanka} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: theme.text }]}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 3 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#88888840', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  name: { fontSize: 24, fontWeight: 'bold' },
  menuContainer: { marginTop: 20, marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { marginRight: 15 },
  menuText: { fontSize: 16 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' }
});