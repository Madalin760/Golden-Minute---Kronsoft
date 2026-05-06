import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { createIncident, testBackend } from '../services/api';

export default function MapScreen() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test conexiune backend
  const handleTestBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await testBackend();
      setResponse({ type: 'Test Backend', data: res.data });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Creează un incident și vezi răspunsul complet
  const handleCreateIncident = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await createIncident(44.4320, 26.1060, 'CARDIAC_ARREST');
      setResponse({ type: 'Incident Creat', data: res.data });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🩺 Golden Minute - Debug</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleTestBackend}>
          <Text style={styles.buttonText}>🔌 Test Backend</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.sosButton]} onPress={handleCreateIncident}>
          <Text style={styles.buttonText}>🚨 Creează Incident</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#ff4444" style={{ marginTop: 20 }} />}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ Eroare: {error}</Text>
        </View>
      )}

      {response && (
        <ScrollView style={styles.responseBox}>
          <Text style={styles.responseTitle}>{response.type}:</Text>
          <Text style={styles.responseText}>
            {JSON.stringify(response.data, null, 2)}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#0a0a1a',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1a1a3a',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  sosButton: {
    backgroundColor: '#3a0a0a',
    borderColor: '#ff4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#3a0a0a',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: '#ff6666',
    fontSize: 14,
  },
  responseBox: {
    flex: 1,
    marginTop: 16,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  responseTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  responseText: {
    color: '#ccc',
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
