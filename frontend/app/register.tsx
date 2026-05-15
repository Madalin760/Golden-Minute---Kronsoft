import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { registerUser } from '../src/data/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validări
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Eroare', 'Completează numele, email-ul și parola.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Eroare', 'Parola trebuie să aibă minim 6 caractere.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Eroare', 'Parolele nu coincid.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(name.trim(), email.trim().toLowerCase(), password, phone.trim());
      Alert.alert('✅ Cont creat!', 'Te poți loga acum cu email-ul și parola ta.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Eroare la crearea contului.';
      Alert.alert('⚠️ Eroare', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <Text style={styles.emoji}>🫀</Text>
          <Text style={styles.title}>Creează cont</Text>
          <Text style={styles.subtitle}>Înregistrează-te pentru a salva vieți</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nume complet"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon (opțional)"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Parolă (min. 6 caractere)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmă parola"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.buttonRegister} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonRegisterText}>Creează cont</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonBack} onPress={() => router.replace('/login')}>
            <Text style={styles.buttonBackText}>Am deja un cont → Logare</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: { alignItems: 'center', marginBottom: 36 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D32F2F', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#999', marginTop: 4 },
  form: { gap: 12 },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  buttonRegister: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonRegisterText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonBack: {
    padding: 16,
    alignItems: 'center',
  },
  buttonBackText: { color: '#D32F2F', fontSize: 14, fontWeight: '600' },
});
