import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../src/data/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eroare', 'Completează email-ul și parola.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email.trim().toLowerCase(), password);
      const user = response.data;

      // Salvăm datele user-ului local
      await AsyncStorage.setItem('user', JSON.stringify({
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }));

      router.replace('/(tabs)');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Email sau parolă greșite.';
      Alert.alert('⚠️ Eroare', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🫀</Text>
        <Text style={styles.title}>Golden Minute</Text>
        <Text style={styles.subtitle}>Fiecare secundă contează</Text>
      </View>

      <View style={styles.form}>
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
          placeholder="Parolă"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.buttonLogin} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonLoginText}>Intră în cont</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonRegister} onPress={() => router.push('/register')}>
          <Text style={styles.buttonRegisterText}>Creează cont nou</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: { alignItems: 'center', marginBottom: 48 },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#D32F2F', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#999', marginTop: 4 },
  form: { gap: 12 },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  buttonLogin: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonLoginText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonRegister: {
    borderWidth: 2,
    borderColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonRegisterText: { color: '#D32F2F', fontSize: 16, fontWeight: '600' },
});