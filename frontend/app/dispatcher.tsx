import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function DispatcherScreen() {
  // Date simulate (se vor lega la backend ulterior)
  const victim = { latitude: 45.6427, longitude: 25.5887 };
  const volunteer = { latitude: 45.6455, longitude: 25.5920 };
  const aed = { latitude: 45.6415, longitude: 25.5865 };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DASHBOARD DISPECER</Text>
        <Text style={styles.headerSub}>Incident activ: #042 | Status: În desfășurare</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          ...victim,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        <Marker coordinate={victim} title="Victimă" pinColor="red" />
        <Marker coordinate={volunteer} title="Voluntar: Andrei" pinColor="blue" />
        <Marker coordinate={aed} title="AED: Farmacia Dona" pinColor="green" />

        <Polyline 
          coordinates={[volunteer, victim]} 
          strokeColor="#1976D2" 
          strokeWidth={3} 
          lineDashPattern={[1, 5]} 
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, backgroundColor: '#212121', paddingTop: 50 },
  headerTitle: { color: '#FF5252', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: 'white', fontSize: 14, marginTop: 4 },
  map: { flex: 1 }
});
