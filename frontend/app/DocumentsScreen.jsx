import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([]);
  const [isVerified, setIsVerified] = useState(false);

  // Load saved documents from AsyncStorage
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const saved = await AsyncStorage.getItem('documents');
      if (saved) setDocuments(JSON.parse(saved));
    } catch (e) {}
  };

  const saveDocuments = async (docs) => {
    setDocuments(docs);
    await AsyncStorage.setItem('documents', JSON.stringify(docs));
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const newDoc = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        date: new Date().toLocaleDateString('ro-RO'),
        status: 'pending', // pending | valid | rejected
        uri: file.uri,
      };

      const updatedDocs = [...documents, newDoc];
      await saveDocuments(updatedDocs);

      Alert.alert(
        '✅ Document încărcat!',
        `"${file.name}" a fost trimis pentru verificare.\n\nEchipa noastră va verifica documentul în maxim 24 de ore.`
      );
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut încărca documentul.');
    }
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
          onPress: async () => {
            const updated = documents.filter(doc => doc.id !== id);
            await saveDocuments(updated);
          },
        },
      ]
    );
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const statusConfig = {
    valid:    { label: '✅ Verificat',      bg: '#E8F5E9' },
    pending:  { label: '⏳ În așteptare',   bg: '#FFF8E1' },
    rejected: { label: '❌ Respins',        bg: '#FFEBEE' },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documentele mele</Text>
        <Text style={styles.subtitle}>
          Încarcă certificatul de prim ajutor pentru a primi alerte de urgență
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Certificatul tău trebuie să fie în format PDF sau imagine (JPG, PNG).
          Documentele sunt verificate de echipa noastră în maxim 24 de ore.
          După verificare, vei putea interveni la urgențe medicale.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documente încărcate</Text>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={styles.emptyText}>Niciun document încărcat încă</Text>
            <Text style={styles.emptyHint}>Apasă butonul de mai jos pentru a începe</Text>
          </View>
        ) : (
          documents.map(doc => {
            const sc = statusConfig[doc.status] || statusConfig.pending;
            return (
              <View key={doc.id} style={styles.documentCard}>
                <View style={styles.documentIcon}>
                  <Text style={{ fontSize: 28 }}>{doc.name?.endsWith('.pdf') ? '📄' : '🖼️'}</Text>
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                  <Text style={styles.documentDate}>
                    Încărcat: {doc.date} {doc.size ? `· ${formatSize(doc.size)}` : ''}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={styles.statusText}>{sc.label}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(doc.id)}>
                  <Text style={{ fontSize: 20 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

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
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, backgroundColor: '#D32F2F' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  infoBox: { flexDirection: 'row', backgroundColor: '#FFF8E1', margin: 16, padding: 16, borderRadius: 12, alignItems: 'flex-start', gap: 10 },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20 },
  section: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#999' },
  emptyHint: { fontSize: 13, color: '#CCC', marginTop: 4 },
  documentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  documentIcon: { width: 48, height: 48, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  documentInfo: { flex: 1, gap: 4 },
  documentName: { fontSize: 15, fontWeight: '600', color: '#333' },
  documentDate: { fontSize: 12, color: '#999' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#333' },
  deleteButton: { padding: 8 },
  uploadSection: { paddingHorizontal: 16, paddingBottom: 40 },
  uploadButton: { backgroundColor: '#D32F2F', borderRadius: 12, padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  uploadIcon: { fontSize: 20 },
  uploadText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});