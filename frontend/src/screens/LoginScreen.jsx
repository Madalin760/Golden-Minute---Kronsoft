import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useState } from 'react';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>

      {/* Logo / Titlu */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🫀</Text>
        <Text style={styles.title}>Golden Minute</Text>
        <Text style={styles.subtitle}>Fiecare secundă contează</Text>
      </View>

      {/* Formular */}
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

        {/* Buton Login */}
        <TouchableOpacity
          style={styles.buttonLogin}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.buttonLoginText}>Intră în cont</Text>
        </TouchableOpacity>

        {/* Buton Register */}
        <TouchableOpacity style={styles.buttonRegister}>
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
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D32F2F',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  form: {
    gap: 12,
  },
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
  buttonLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRegister: {
    borderWidth: 2,
    borderColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonRegisterText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
});