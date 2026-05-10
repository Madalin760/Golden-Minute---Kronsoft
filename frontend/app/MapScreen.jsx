import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { getAedsNearby, createIncident } from '../src/data/api';

const AED_SEARCH_RADIUS = 5000; // 5km

export default function MapScreen() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [aeds, setAeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(null);

  // ── 1. Ask for location permission and get position ──────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permisiunea de localizare a fost refuzată.');
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(pos.coords);
        fetchAeds(pos.coords.latitude, pos.coords.longitude);
      } catch (err) {
        setError('Nu s-a putut obține localizarea.');
        setLoading(false);
      }
    })();
  }, []);

  // ── 2. Fetch AEDs from backend ────────────────────────────────────────────
  const fetchAeds = async (lat, lng) => {
    try {
      const response = await getAedsNearby(lat, lng, AED_SEARCH_RADIUS);
      setAeds(response.data);
      setBackendOnline(true);
    } catch (err) {
      setBackendOnline(false);
      // Don't block the map — just show empty AED list
      setAeds([]);
    } finally {
      setLoading(false);
    }
  };

  // ── 3. SOS — create incident ───────────────────────────────────────────────
  const handleSOS = () => {
    if (!location) {
      Alert.alert('Eroare', 'Localizarea nu este disponibilă. Încearcă din nou.');
      return;
    }

    Alert.alert(
      '🚨 Trimite SOS',
      'Vei alerta voluntarii din raza ta și serviciile de urgență. Continui?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'DA — Trimite SOS',
          style: 'destructive',
          onPress: () => submitSOS(),
        },
      ]
    );
  };

  const submitSOS = async () => {
    setSosLoading(true);
    try {
      const response = await createIncident(
        location.latitude,
        location.longitude,
        'CARDIAC_ARREST'
      );
      const data = response.data;
      const aedCount = data.nearbyAeds ? data.nearbyAeds.length : 0;

      Alert.alert(
        '✅ SOS Trimis',
        `${data.message || 'Voluntarii au fost alertați!'}\n\n` +
          `AED-uri găsite: ${aedCount}\n` +
          `Status voluntari: ${data.volunteerStatus || 'Se procesează...'}`
      );

      // Refresh AED markers after incident
      if (location) fetchAeds(location.latitude, location.longitude);
    } catch (err) {
      Alert.alert(
        '⚠️ Eroare',
        'Nu s-a putut trimite SOS-ul. Verifică conexiunea și încearcă din nou.\n\nSună la 112!'
      );
    } finally {
      setSosLoading(false);
    }
  };

  // ── 4. Center map on user ─────────────────────────────────────────────────
  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Se încarcă harta...</Text>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>📍</Text>
        <Text style={styles.errorTitle}>Localizare indisponibilă</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : {
        // Default: Brașov
        latitude: 45.6427,
        longitude: 25.5887,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: backendOnline ? '#4CAF50' : '#FF5722' }]} />
        <Text style={styles.statusText}>
          {backendOnline === null
            ? 'Se conectează...'
            : backendOnline
            ? `${aeds.length} AED-uri în ${AED_SEARCH_RADIUS / 1000}km rază`
            : 'Backend offline — hartă locală'}
        </Text>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
      >
        {/* Radius circle around user */}
        {location && (
          <Circle
            center={{ latitude: location.latitude, longitude: location.longitude }}
            radius={AED_SEARCH_RADIUS}
            strokeColor="rgba(211, 47, 47, 0.3)"
            fillColor="rgba(211, 47, 47, 0.05)"
          />
        )}

        {/* AED markers */}
        {aeds.map((aed) => (
          <Marker
            key={aed.id}
            coordinate={{ latitude: aed.latitude, longitude: aed.longitude }}
            title={aed.name}
            description={aed.address}
            pinColor="#D32F2F"
          >
            <View style={styles.aedMarker}>
              <Text style={styles.aedMarkerText}>🫀</Text>
            </View>
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{aed.name || 'AED'}</Text>
                <Text style={styles.calloutAddress}>{aed.address || 'Adresă indisponibilă'}</Text>
                <View style={styles.calloutBadge}>
                  <Text style={styles.calloutBadgeText}>⚡ Disponibil</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Center button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
        <Text style={styles.centerButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Refresh AEDs button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => location && fetchAeds(location.latitude, location.longitude)}
      >
        <Text style={styles.refreshButtonText}>🔄</Text>
      </TouchableOpacity>

      {/* SOS button */}
      <View style={styles.sosContainer}>
        <TouchableOpacity
          style={[styles.sosButton, sosLoading && styles.sosButtonDisabled]}
          onPress={handleSOS}
          disabled={sosLoading}
          activeOpacity={0.85}
        >
          {sosLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.sosIcon}>🚨</Text>
              <Text style={styles.sosText}>TRIMITE SOS</Text>
              <Text style={styles.sosSubtext}>Alertează voluntarii</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  errorText: { fontSize: 14, color: '#999', textAlign: 'center' },

  // Status bar
  statusBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 12,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },

  // Map
  map: {
    flex: 1,
  },

  // AED marker
  aedMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#D32F2F',
    shadowColor: '#D32F2F',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  aedMarkerText: {
    fontSize: 18,
  },

  // Callout
  callout: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  calloutBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  calloutBadgeText: {
    fontSize: 11,
    color: '#388E3C',
    fontWeight: '600',
  },

  // Center + Refresh buttons
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    backgroundColor: '#fff',
    borderRadius: 28,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  centerButtonText: { fontSize: 22 },
  refreshButton: {
    position: 'absolute',
    right: 16,
    bottom: 260,
    backgroundColor: '#fff',
    borderRadius: 28,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  refreshButtonText: { fontSize: 22 },

  // SOS button
  sosContainer: {
    position: 'absolute',
    bottom: 90,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  sosButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonDisabled: {
    backgroundColor: '#E57373',
    shadowOpacity: 0.2,
  },
  sosIcon: { fontSize: 28, marginBottom: 4 },
  sosText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sosSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
});
