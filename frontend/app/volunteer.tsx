import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function VolunteerScreen() {
  const [status, setStatus] = useState<'idle' | 'accepted' | 'declined'>('idle');

  // Coordonate demo victimă (ex: Centrul Vechi Brașov)
  const victimLocation = { lat: 45.6427, lng: 25.5887 };

  const handleAccept = async () => {
    let { status: permission } = await Location.requestForegroundPermissionsAsync();
    if (permission !== 'granted') {
      Alert.alert('Eroare', 'Avem nevoie de permisiune GPS pentru misiune!');
      return;
    }
    setStatus('accepted');
  };

  const startNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${victimLocation.lat},${victimLocation.lng}`;
    Linking.openURL(url);
  };

  if (status === 'accepted') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>✓ Misiune Acceptată</Text>
        <Text style={styles.info}>Victima se află la 400m.</Text>
        <TouchableOpacity style={styles.navBtn} onPress={startNavigation}>
          <Text style={styles.btnText}>PORNEȘTE NAVIGAREA GPS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#FFF5F5' }]}>
      <Text style={styles.alertIcon}>🚨</Text>
      <Text style={styles.title}>URGENȚĂ GRAD 0</Text>
      <Text style={styles.info}>Stop cardio-respirator raportat în apropiere.</Text>
      
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={handleAccept}>
          <Text style={styles.btnText}>ACCEPT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={() => setStatus('declined')}>
          <Text style={styles.btnText}>REFUZ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertIcon: { fontSize: 70, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#C62828', textAlign: 'center' },
  info: { fontSize: 18, marginVertical: 20, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 15 },
  btn: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, minWidth: 130, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#2E7D32' },
  declineBtn: { backgroundColor: '#757575' },
  navBtn: { backgroundColor: '#0277BD', padding: 20, borderRadius: 10, marginTop: 20 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
