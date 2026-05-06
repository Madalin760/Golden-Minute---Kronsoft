import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function DispatcherScreen() {
  // Coordonate fixe pentru demo (Brașov)
  const victim = { latitude: 45.6427, longitude: 25.5887 };
  const aed = { latitude: 45.6415, longitude: 25.5865 };

  // Locația inițială a voluntarului
  const [volunteerLoc, setVolunteerLoc] = useState({ 
    latitude: 45.6470, 
    longitude: 25.5920 
  });

  // Starea pentru ETA (minute până la sosire)
  const [eta, setEta] = useState(5);

  useEffect(() => {
    // Simulăm mișcarea live și update-ul la 5 secunde (Task Jira PAROLA-19)
    const interval = setInterval(() => {
      setVolunteerLoc((prevLoc) => {
        const latDiff = victim.latitude - prevLoc.latitude;
        const lngDiff = victim.longitude - prevLoc.longitude;

        // Dacă a ajuns la destinație, oprim mișcarea
        if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
          setEta(0);
          return prevLoc;
        }

        // Scădem ETA-ul simulat pe măsură ce pin-ul se mișcă
        setEta((prevEta) => (prevEta > 1 ? prevEta - 0.2 : 1));

        // Mutăm voluntarul spre victimă cu 10% din distanța rămasă la fiecare pas
        return {
          latitude: prevLoc.latitude + (latDiff * 0.1),
          longitude: prevLoc.longitude + (lngDiff * 0.1),
        };
      });
    }, 5000); // 5 secunde conform specificațiilor

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header profesional pentru dispecerat */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DASHBOARD DISPECER</Text>
        <Text style={styles.headerSubtitle}>Status: Incident activ în desfășurare</Text>
      </View>
      
      {/* Harta va fi vizibilă doar pe telefon în Expo Go */}
      <MapView
        style={styles.map}
        initialRegion={{ ...victim, latitudeDelta: 0.015, longitudeDelta: 0.015 }}
      >
        <Marker coordinate={victim} title="Victimă" pinColor="red" />
        <Marker coordinate={aed} title="AED Farmacie" description="ETA: 2 min" pinColor="green" />
        
        {/* Markerul Voluntarului cu ETA dinamic */}
        <Marker 
          coordinate={volunteerLoc} 
          title="Voluntar Andrei" 
          description={`ETA: ${Math.round(eta)} min`} 
          pinColor="blue" 
        />
        
        {/* Traseul vizual dintre voluntar și victimă */}
        <Polyline coordinates={[volunteerLoc, victim]} strokeColor="#1976D2" strokeWidth={3} />
      </MapView>

      {/* Panou informativ pentru dispecer (Cerința PAROLA-19) */}
      <View style={styles.etaPanel}>
        <Text style={styles.etaText}>🕒 Sosire Voluntar: <Text style={{fontWeight: 'bold'}}>{Math.round(eta)} min</Text></Text>
        <Text style={styles.etaText}>🕒 Sosire AED: <Text style={{fontWeight: 'bold'}}>2 min</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, backgroundColor: '#1A1A1A', paddingTop: 50 },
  headerTitle: { color: '#FF5252', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  headerSubtitle: { color: '#FFF', fontSize: 13, textAlign: 'center', marginTop: 5 },
  map: { flex: 1 },
  etaPanel: { 
    position: 'absolute', 
    bottom: 40, 
    left: 20, 
    right: 20, 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12,
    elevation: 8, // Umbră pentru Android
    shadowColor: '#000', // Umbră pentru iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  etaText: { fontSize: 17, color: '#333', marginBottom: 5 }
});
