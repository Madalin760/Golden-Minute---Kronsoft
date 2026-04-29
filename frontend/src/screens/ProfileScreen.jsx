import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function ProfileScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>

      {/* Header profil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>Nume Prenume</Text>
        <Text style={styles.email}>email@exemplu.com</Text>

        {/* Badge certificat */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✅ Certificat valid</Text>
        </View>
      </View>

      {/* Informații cont */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informații cont</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Telefon</Text>
          <Text style={styles.infoValue}>+40 700 000 000</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Oraș</Text>
          <Text style={styles.infoValue}>Brașov</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Certificat</Text>
          <Text style={styles.infoValue}>Prim Ajutor Nivel 2</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Valabil până</Text>
          <Text style={styles.infoValue}>12.06.2026</Text>
        </View>
      </View>

      {/* Statistici */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activitate</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Intervenții</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Alerte primite</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>AED-uri raportate</Text>
          </View>
        </View>
      </View>

      {/* Butoane */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonEdit}>
          <Text style={styles.buttonEditText}>✏️ Editează profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonLogout}
          onPress={() => router.replace('/login')}  
        >
          <Text style={styles.buttonLogoutText}>Deconectare</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: '#D32F2F',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  buttonEdit: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonEditText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  buttonLogout: {
    borderWidth: 2,
    borderColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonLogoutText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '600',
  },
});