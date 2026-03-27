import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from '../constants/colors';
import { useSettings } from '../context/settings-context';

export default function ProfileScreen() {
  const { isDark } = useSettings();
  const { t } = useTranslation();
  const router = useRouter();
  const theme = isDark ? Colors.dark : Colors.light;

  const menuItems = [
    { icon: 'bar-chart', title: t('stats'), route: '/stats' },
    { icon: 'person', title: t('profileDetails'), route: '/profile' },
    { icon: 'newspaper', title: t('news'), route: '/news' },
    { icon: 'information-circle', title: t('about'), route: '/about' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={50} color={theme.textSecondary} />
        </View>
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
});