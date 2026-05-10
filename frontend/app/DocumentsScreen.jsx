import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Certificat Prim Ajutor.pdf',
      date: '12.06.2024',
      status: 'valid',
    },
  ]);

  const handleUpload = () => {
    // Aici vei lega mai târziu cu backend-ul
    Alert.alert('Upload', 'Funcționalitate în curând disponibilă!');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Șterge document',
      'Ești sigur că vrei să ștergi acest document?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => setDocuments(documents.filter(doc => doc.id !== id)),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Documentele mele</Text>
        <Text style={styles.subtitle}>
          Încarcă certificatul de prim ajutor pentru a primi alerte
        </Text>
      </View>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Certificatul tău trebuie să fie în format PDF sau imagine (JPG, PNG).
          Documentele sunt verificate de echipa noastră în maxim 24 de ore.
        </Text>
      </View>

      {/* Lista documente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documente încărcate</Text>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={styles.emptyText}>Niciun document încărcat încă</Text>
          </View>
        ) : (
          documents.map(doc => (
            <View key={doc.id} style={styles.documentCard}>
              <View style={styles.documentIcon}>
                <Text style={{ fontSize: 28 }}>📄</Text>
              </View>

              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text style={styles.documentDate}>Încărcat: {doc.date}</Text>
                <View style={[
                  styles.statusBadge,
                  doc.status === 'valid' ? styles.statusValid : styles.statusPending
                ]}>
                  <Text style={styles.statusText}>
                    {doc.status === 'valid' ? '✅ Verificat' : '⏳ În așteptare'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(doc.id)}
              >
                <Text style={{ fontSize: 20 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Buton upload */}
      <View style={styles.uploadSection}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadIcon}>⬆️</Text>
          <Text style={styles.uploadText}>Încarcă document nou</Text>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#D32F2F',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 10,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    gap: 4,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  documentDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  statusValid: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF8E1',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
  uploadSection: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  uploadButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  uploadIcon: {
    fontSize: 20,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});