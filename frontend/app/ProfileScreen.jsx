import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { registerVolunteer } from '../src/data/api';

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export default function ProfileScreen() {
  const [registrationStatus, setRegistrationStatus] = useState('idle'); // idle | loading | success | error
  const [volunteer, setVolunteer] = useState(null);

  // On mount: get location and register volunteer with backend
  useEffect(() => {
    registerWithBackend();
  }, []);

  const registerWithBackend = async () => {
    setRegistrationStatus('loading');
    try {
      // Get location
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        setRegistrationStatus('error');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Get Expo Push Token
      let expoPushToken = 'dummy-token-fallback';
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === 'granted') {
          // Expo requires a projectId in recent SDKs. We use a fallback if not configured in app.json
          const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? 'golden-minute-demo';
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          expoPushToken = tokenData.data;
        }
      } catch (e) {
        console.log("Error getting push token", e);
      }

      // Register with backend
      const response = await registerVolunteer(
        'Voluntar',              // Name — replace with real auth data
        expoPushToken,           // REAL Expo Push Token sent to backend
        pos.coords.latitude,
        pos.coords.longitude
      );
      setVolunteer(response.data);
      setRegistrationStatus('success');
    } catch (err) {
      setRegistrationStatus('error');
    }
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  // Status badge color + label
  const statusConfig = {
    idle:    { color: '#999',    bg: '#F5F5F5',  label: 'Neconectat' },
    loading: { color: '#F57C00', bg: '#FFF8E1',  label: 'Se înregistrează...' },
    success: { color: '#388E3C', bg: '#E8F5E9',  label: '✅ Activ în sistem' },
    error:   { color: '#D32F2F', bg: '#FFEBEE',  label: '⚠️ Backend indisponibil' },
  };
  const { color, bg, label } = statusConfig[registrationStatus];

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>Voluntar Golden Minute</Text>
        <Text style={styles.email}>voluntar@goldenminute.ro</Text>

        {/* Certificate badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✅ Certificat valid</Text>
        </View>
      </View>

      {/* Backend connection status */}
      <View style={[styles.connectionCard, { backgroundColor: bg }]}>
        <View style={styles.connectionRow}>
          {registrationStatus === 'loading' ? (
            <ActivityIndicator size="small" color={color} style={{ marginRight: 8 }} />
          ) : (
            <View style={[styles.connectionDot, { backgroundColor: color }]} />
          )}
          <Text style={[styles.connectionLabel, { color }]}>{label}</Text>
          {registrationStatus === 'error' && (
            <TouchableOpacity onPress={registerWithBackend} style={styles.retryButton}>
              <Text style={styles.retryText}>Reîncearcă</Text>
            </TouchableOpacity>
          )}
        </View>
        {volunteer && (
          <Text style={styles.connectionDetail}>
            ID voluntar: #{volunteer.id} · Locație actualizată
          </Text>
        )}
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

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponibil</Text>
          <Text style={[styles.infoValue, { color: '#388E3C' }]}>
            {volunteer?.isAvailable ? '✅ Da' : '—'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Verificat</Text>
          <Text style={[styles.infoValue, { color: volunteer?.isVerified ? '#388E3C' : '#F57C00' }]}>
            {volunteer?.isVerified ? '✅ Da' : '⏳ În așteptare'}
          </Text>
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

        <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
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
  avatarText: { fontSize: 40 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  badge: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Connection status card
  connectionCard: {
    margin: 16,
    borderRadius: 12,
    padding: 14,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  connectionDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    paddingLeft: 16,
  },
  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  retryText: { fontSize: 12, color: '#D32F2F', fontWeight: '600' },

  // Sections
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
  infoLabel: { fontSize: 15, color: '#666' },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#D32F2F' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },

  // Buttons
  buttonEdit: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonEditText: { fontSize: 15, color: '#333', fontWeight: '600' },
  buttonLogout: {
    borderWidth: 2,
    borderColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonLogoutText: { color: '#D32F2F', fontSize: 15, fontWeight: '600' },
});