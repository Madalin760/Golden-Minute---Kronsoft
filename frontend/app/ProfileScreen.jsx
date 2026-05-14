import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerVolunteer } from '../src/data/api';

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const [registrationStatus, setRegistrationStatus] = useState('idle');
  const [volunteer, setVolunteer] = useState(null);
  const [user, setUser] = useState(null);

  // Load user data from AsyncStorage
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        registerWithBackend(parsed);
      } else {
        registerWithBackend(null);
      }
    } catch (e) {
      registerWithBackend(null);
    }
  };

  const registerWithBackend = async (userData) => {
    setRegistrationStatus('loading');
    try {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') { setRegistrationStatus('error'); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

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
          const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? 'golden-minute-demo';
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          expoPushToken = tokenData.data;
        }
      } catch (e) {
        console.log("Error getting push token", e);
      }

      const volunteerName = userData?.name || 'Voluntar';
      const userId = userData?.userId || null;

      const response = await registerVolunteer(
        volunteerName,
        expoPushToken,
        pos.coords.latitude,
        pos.coords.longitude,
        userId
      );
      setVolunteer(response.data);

      // Salvăm volunteerId în AsyncStorage pentru accept incident
      if (response.data?.id) {
        await AsyncStorage.setItem('volunteerId', String(response.data.id));
      }

      setRegistrationStatus('success');
    } catch (err) {
      setRegistrationStatus('error');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('volunteerId');
    router.replace('/login');
  };

  const statusConfig = {
    idle:    { color: '#999',    bg: '#F5F5F5',  label: 'Neconectat' },
    loading: { color: '#F57C00', bg: '#FFF8E1',  label: 'Se înregistrează...' },
    success: { color: '#388E3C', bg: '#E8F5E9',  label: '✅ Activ în sistem' },
    error:   { color: '#D32F2F', bg: '#FFEBEE',  label: '⚠️ Backend indisponibil' },
  };
  const { color, bg, label } = statusConfig[registrationStatus];

  const displayName = user?.name || 'Voluntar Golden Minute';
  const displayEmail = user?.email || 'voluntar@goldenminute.ro';
  const displayPhone = user?.phone || '+40 700 000 000';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
        {volunteer?.isVerified && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✅ Voluntar verificat</Text>
          </View>
        )}
        {volunteer && !volunteer.isVerified && (
          <View style={[styles.badge, { backgroundColor: 'rgba(255,193,7,0.3)' }]}>
            <Text style={styles.badgeText}>⏳ Document în așteptare</Text>
          </View>
        )}
      </View>

      <View style={[styles.connectionCard, { backgroundColor: bg }]}>
        <View style={styles.connectionRow}>
          {registrationStatus === 'loading' ? (
            <ActivityIndicator size="small" color={color} style={{ marginRight: 8 }} />
          ) : (
            <View style={[styles.connectionDot, { backgroundColor: color }]} />
          )}
          <Text style={[styles.connectionLabel, { color }]}>{label}</Text>
          {registrationStatus === 'error' && (
            <TouchableOpacity onPress={() => registerWithBackend(user)} style={styles.retryButton}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informații cont</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Telefon</Text><Text style={styles.infoValue}>{displayPhone}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Oraș</Text><Text style={styles.infoValue}>Brașov</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Disponibil</Text><Text style={[styles.infoValue, { color: '#388E3C' }]}>{volunteer?.isAvailable ? '✅ Da' : '—'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Verificat</Text><Text style={[styles.infoValue, { color: volunteer?.isVerified ? '#388E3C' : '#F57C00' }]}>{volunteer?.isVerified ? '✅ Da' : '⏳ În așteptare'}</Text></View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
          <Text style={styles.buttonLogoutText}>Deconectare</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32, backgroundColor: '#D32F2F' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#D32F2F' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  badge: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  connectionCard: { margin: 16, borderRadius: 12, padding: 14 },
  connectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  connectionDot: { width: 8, height: 8, borderRadius: 4 },
  connectionLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
  connectionDetail: { fontSize: 12, color: '#666', marginTop: 6, paddingLeft: 16 },
  retryButton: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#fff', borderRadius: 8 },
  retryText: { fontSize: 12, color: '#D32F2F', fontWeight: '600' },
  section: { paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  infoLabel: { fontSize: 15, color: '#666' },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  buttonLogout: { borderWidth: 2, borderColor: '#D32F2F', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonLogoutText: { color: '#D32F2F', fontSize: 15, fontWeight: '600' },
});