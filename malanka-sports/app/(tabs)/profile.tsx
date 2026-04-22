import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSheetIOS, ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/colors';
import { useAuth } from '../context/auth-context';
import { useSettings } from '../context/settings-context';
import { uploadAvatar } from '../services/api';

export default function ProfileScreen() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, token, signOut, setAvatarUrl } = useAuth();
  const theme = isDark ? Colors.dark : Colors.light;

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (uri: string) => {
    setIsUploading(true);
    const uploadResult = await uploadAvatar(uri, token);
    setIsUploading(false);
    if (uploadResult && uploadResult.url) {
      await setAvatarUrl(uploadResult.url);
    } else {
      Alert.alert('Upload failed');
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) await handleUpload(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera permission needed');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) await handleUpload(result.assets[0].uri);
  };

  const chooseAvatarSource = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('cancel'), t('takePhoto'), t('chooseFromLibrary')],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) takePhoto();
          else if (idx === 2) pickFromLibrary();
        }
      );
    } else {
      Alert.alert(t('avatarSource'), undefined, [
        { text: t('takePhoto'), onPress: takePhoto },
        { text: t('chooseFromLibrary'), onPress: pickFromLibrary },
        { text: t('cancel'), style: 'cancel' },
      ]);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(t('signOut'), t('signOut') + '?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('signOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  const avatar = user?.avatar_url ?? null;
  const displayName = user?.username ?? '';

  const menuItems = [
    { icon: 'bar-chart', title: t('stats'), route: '/stats' },
    { icon: 'newspaper', title: t('news'), route: '/news' },
    { icon: 'information-circle', title: t('about'), route: '/about' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.avatarContainer} onPress={chooseAvatarSource} disabled={isUploading}>
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
        <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
      </View>

      <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index !== menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={theme.malanka} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: theme.text }]}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.signOut, { backgroundColor: theme.card }]}
        onPress={confirmSignOut}
      >
        <Ionicons name="log-out-outline" size={22} color={theme.danger} style={{ marginRight: 10 }} />
        <Text style={{ color: theme.danger, fontSize: 16, fontWeight: '600' }}>{t('signOut')}</Text>
      </TouchableOpacity>
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
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 12 },
});
