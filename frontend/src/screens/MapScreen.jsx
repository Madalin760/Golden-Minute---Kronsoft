import MapView, { Marker } from 'react-native-maps';

export default function Map() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 45.6427,
        longitude: 25.5887,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation={true} // punctul albastru GPS
    >
      {/* Pin AED */}
      <Marker
        coordinate={{ latitude: 45.644, longitude: 25.590 }}
        title="AED - Mall Coresi"
        description="Disponibil 08:00 - 22:00"
        pinColor="red"
      />
    </MapView>
  );
}
=======
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { getAedsNearby } from '../services/api';

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [aeds, setAeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initMap();
  }, []);

  const initMap = async () => {
    try {
      // 1. Cere permisiunea GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Ai nevoie să acorzi permisiunea de locație.');
        setLoading(false);
        return;
      }

      // 2. Obține locația curentă
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      // 3. Fetch AED-uri din backend în raza de 5km
      const response = await getAedsNearby(latitude, longitude, 5000);
      setAeds(response.data);

    } catch (err) {
      console.log('Eroare hartă:', err);
      setError('Nu s-a putut încărca harta. Verifică conexiunea.');
    } finally {
      setLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Se încarcă harta...</Text>
      </View>
    );
  }

  // Error screen
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initMap}>
          <Text style={styles.retryText}>Încearcă din nou</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Harta */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude ?? 45.6427,
          longitude: userLocation?.longitude ?? 25.5887,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Cerc raza 5km în jurul utilizatorului */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={5000}
            strokeColor="rgba(211,47,47,0.3)"
            fillColor="rgba(211,47,47,0.05)"
          />
        )}

        {/* Pin-uri AED din backend */}
        {aeds.map((aed) => (
          <Marker
            key={aed.id}
            coordinate={{
              latitude: aed.latitude,
              longitude: aed.longitude,
            }}
            title={aed.name}
            description={aed.address}
            pinColor="#D32F2F"
            onCalloutPress={() =>
              Alert.alert(
                aed.name,
                `📍 ${aed.address}`,
                [{ text: 'OK' }]
              )
            }
          />
        ))}
      </MapView>

      {/* Counter AED-uri găsite */}
      <View style={styles.aedCounter}>
        <Text style={styles.aedCounterText}>
          🫀 {aeds.length} AED-uri în raza de 5km
        </Text>
      </View>

      {/* Buton SOS */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() =>
          Alert.alert(
            '🆘 Trimite alertă',
            'Ești sigur că vrei să trimiți o alertă de urgență?',
            [
              { text: 'Anulează', style: 'cancel' },
              {
                text: 'Trimite',
                style: 'destructive',
                onPress: () => {
                  // Aici vei lega createIncident() din api.js
                  Alert.alert('Alertă trimisă!', 'Persoanele din apropiere au fost notificate.');
                },
              },
            ]
          )
        }
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  aedCounter: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  aedCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sosButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  sosText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
>>>>>>> fc22c6a (Versiune front-end legata de back-end)
