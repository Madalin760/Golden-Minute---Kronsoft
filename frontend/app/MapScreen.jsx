import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, Platform, Modal, Animated, Vibration,
} from 'react-native';
import MapView, { Marker, Callout, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { getAedsNearby, createIncident, getActiveIncidents, acceptIncident } from '../src/data/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

const AED_SEARCH_RADIUS = 5000;

export default function MapScreen() {
  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [location, setLocation] = useState(null);
  const [aeds, setAeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(null);

  // Alert & navigation state
  const [pendingIncident, setPendingIncident] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [acceptedIncident, setAcceptedIncident] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [volunteerId, setVolunteerId] = useState(null);

  // 1. Location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setError('Permisiunea de localizare a fost refuzată.'); setLoading(false); return; }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(pos.coords);
        fetchAeds(pos.coords.latitude, pos.coords.longitude);
      } catch (err) { setError('Nu s-a putut obține localizarea.'); setLoading(false); }
    })();
  }, []);

  // 1b. Polling for active incidents
  useEffect(() => {
    let lastIncidentId = null;
    const check = async () => {
      try {
        const res = await getActiveIncidents();
        const list = res.data;
        if (list && list.length > 0) {
          const latest = list[list.length - 1];
          if (latest && lastIncidentId !== latest.id) {
            lastIncidentId = latest.id;
            await Notifications.scheduleNotificationAsync({
              content: { title: "🚨 URGENȚĂ MEDICALĂ!", body: "Un pacient are nevoie de ajutor!", data: { incidentId: latest.id }, sound: true },
              trigger: null,
            });
            setPendingIncident(latest);
            setShowAlertModal(true);
            Vibration.vibrate([0, 500, 200, 500]);
          }
        }
      } catch (err) {}
    };
    const id = setInterval(check, 3000);
    return () => clearInterval(id);
  }, []);

  // Pulse animation for alert modal
  useEffect(() => {
    if (showAlertModal) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [showAlertModal]);

  // Get volunteerId from profile registration
  useEffect(() => {
    const fetchVol = async () => {
      try {
        const res = await getActiveIncidents(); // just to test connectivity
        // We'll use volunteerId=1 as fallback for demo
      } catch(e) {}
    };
    fetchVol();
  }, []);

  const fetchAeds = async (lat, lng) => {
    try {
      const response = await getAedsNearby(lat, lng, AED_SEARCH_RADIUS);
      setAeds(response.data); setBackendOnline(true);
    } catch (err) { setBackendOnline(false); setAeds([]); }
    finally { setLoading(false); }
  };

  // Accept incident
  const handleAccept = async () => {
    if (!pendingIncident) return;
    setAcceptLoading(true);
    try {
      // Use volunteer ID from DB (fallback to latest)
      const volId = volunteerId || 4;
      await acceptIncident(pendingIncident.id, volId);
      setAcceptedIncident(pendingIncident);
      setShowAlertModal(false);
      setPendingIncident(null);

      // Animate map to show both user and incident
      if (mapRef.current && location) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: pendingIncident.latitude, longitude: pendingIncident.longitude },
          ],
          { edgePadding: { top: 120, right: 60, bottom: 300, left: 60 }, animated: true }
        );
      }
    } catch (err) {
      const msg = err?.response?.data || 'Eroare la acceptare.';
      Alert.alert('⚠️', typeof msg === 'string' ? msg : 'Incidentul a fost deja preluat.');
      setShowAlertModal(false);
    } finally { setAcceptLoading(false); }
  };

  const handleDecline = () => {
    setShowAlertModal(false);
    setPendingIncident(null);
  };

  const handleSOS = () => {
    if (!location) { Alert.alert('Eroare', 'Localizarea nu este disponibilă.'); return; }
    Alert.alert('🚨 Trimite SOS', 'Vei alerta voluntarii din raza ta. Continui?', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'DA — Trimite SOS', style: 'destructive', onPress: submitSOS },
    ]);
  };

  const submitSOS = async () => {
    setSosLoading(true);
    try {
      const response = await createIncident(location.latitude, location.longitude, 'CARDIAC_ARREST');
      const data = response.data;
      Alert.alert('✅ SOS Trimis',
        `${data.message || 'Voluntarii au fost alertați!'}\n\nAED-uri găsite: ${data.nearbyAeds?.length || 0}\nStatus voluntari: ${data.volunteerStatus || 'Se procesează...'}`
      );
      if (location) fetchAeds(location.latitude, location.longitude);
    } catch (err) {
      Alert.alert('⚠️ Eroare', 'Nu s-a putut trimite SOS-ul.\n\nSună la 112!');
    } finally { setSosLoading(false); }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  if (loading) return (<View style={s.centered}><ActivityIndicator size="large" color="#D32F2F" /><Text style={s.loadingText}>Se încarcă harta...</Text></View>);
  if (error) return (<View style={s.centered}><Text style={{fontSize:48,marginBottom:16}}>📍</Text><Text style={{fontSize:20,fontWeight:'bold',color:'#333'}}>Localizare indisponibilă</Text><Text style={{fontSize:14,color:'#999',textAlign:'center'}}>{error}</Text></View>);

  const initialRegion = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }
    : { latitude: 45.6427, longitude: 25.5887, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  const distToIncident = acceptedIncident && location
    ? Math.round(getDistance(location.latitude, location.longitude, acceptedIncident.latitude, acceptedIncident.longitude))
    : null;

  return (
    <View style={s.container}>
      {/* Status bar */}
      <View style={s.statusBar}>
        <View style={[s.statusDot, { backgroundColor: backendOnline ? '#4CAF50' : '#FF5722' }]} />
        <Text style={s.statusText}>
          {backendOnline === null ? 'Se conectează...' : backendOnline ? `${aeds.length} AED-uri în ${AED_SEARCH_RADIUS/1000}km rază` : 'Backend offline — hartă locală'}
        </Text>
      </View>

      {/* Map */}
      <MapView ref={mapRef} style={s.map} initialRegion={initialRegion} showsUserLocation showsMyLocationButton={false} showsCompass showsScale>
        {location && <Circle center={{latitude: location.latitude, longitude: location.longitude}} radius={AED_SEARCH_RADIUS} strokeColor="rgba(211,47,47,0.3)" fillColor="rgba(211,47,47,0.05)" />}
        {aeds.map((aed) => (
          <Marker key={aed.id} coordinate={{latitude: aed.latitude, longitude: aed.longitude}} title={aed.name} description={aed.address}>
            <View style={s.aedMarker}><Text style={{fontSize:18}}>🫀</Text></View>
            <Callout tooltip><View style={s.callout}><Text style={s.calloutTitle}>{aed.name || 'AED'}</Text><Text style={s.calloutAddr}>{aed.address || 'Adresă indisponibilă'}</Text><View style={s.calloutBadge}><Text style={s.calloutBadgeText}>⚡ Disponibil</Text></View></View></Callout>
          </Marker>
        ))}
        {/* Accepted incident marker + route line */}
        {acceptedIncident && (
          <>
            <Marker coordinate={{latitude: acceptedIncident.latitude, longitude: acceptedIncident.longitude}} title="🚨 Pacient" description="Urgență medicală">
              <View style={s.incidentMarker}><Text style={{fontSize: 24}}>🆘</Text></View>
            </Marker>
            {location && (
              <Polyline
                coordinates={[
                  {latitude: location.latitude, longitude: location.longitude},
                  {latitude: acceptedIncident.latitude, longitude: acceptedIncident.longitude},
                ]}
                strokeColor="#D32F2F"
                strokeWidth={4}
                lineDashPattern={[10, 6]}
              />
            )}
          </>
        )}
      </MapView>

      {/* Navigation info bar (after accepting) */}
      {acceptedIncident && (
        <View style={s.navBar}>
          <View style={s.navIconWrap}><Text style={{fontSize: 28}}>🏃‍♂️</Text></View>
          <View style={{flex:1}}>
            <Text style={s.navTitle}>Navigare către pacient</Text>
            <Text style={s.navSubtitle}>{distToIncident ? `${distToIncident < 1000 ? distToIncident + ' m' : (distToIncident/1000).toFixed(1) + ' km'} distanță` : 'Se calculează...'} · Urgență cardiacă</Text>
          </View>
          <TouchableOpacity style={s.navEndBtn} onPress={() => { setAcceptedIncident(null); Alert.alert('✅ Misiune finalizată', 'Mulțumim pentru intervenție!'); }}>
            <Text style={s.navEndText}>Finalizează</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Center + Refresh buttons */}
      <TouchableOpacity style={s.centerButton} onPress={centerOnUser}><Text style={{fontSize:22}}>📍</Text></TouchableOpacity>
      <TouchableOpacity style={s.refreshButton} onPress={() => location && fetchAeds(location.latitude, location.longitude)}><Text style={{fontSize:22}}>🔄</Text></TouchableOpacity>

      {/* SOS button (hide when navigating) */}
      {!acceptedIncident && (
        <View style={s.sosContainer}>
          <TouchableOpacity style={[s.sosButton, sosLoading && s.sosButtonDisabled]} onPress={handleSOS} disabled={sosLoading} activeOpacity={0.85}>
            {sosLoading ? <ActivityIndicator size="small" color="#fff" /> : (
              <><Text style={s.sosIcon}>🚨</Text><Text style={s.sosText}>TRIMITE SOS</Text><Text style={s.sosSubtext}>Alertează voluntarii</Text></>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ═══ ALERT MODAL ═══ */}
      <Modal visible={showAlertModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Animated.View style={[s.pulseCircle, {transform:[{scale:pulseAnim}]}]}>
              <Text style={{fontSize: 48}}>🚨</Text>
            </Animated.View>
            <Text style={s.modalTitle}>URGENȚĂ MEDICALĂ!</Text>
            <Text style={s.modalSubtitle}>Un pacient are nevoie de ajutor în apropierea ta</Text>
            <View style={s.modalInfo}>
              <View style={s.modalInfoRow}><Text style={s.modalInfoLabel}>Tip</Text><Text style={s.modalInfoVal}>Stop cardiac</Text></View>
              <View style={s.modalInfoRow}><Text style={s.modalInfoLabel}>Distanță</Text><Text style={s.modalInfoVal}>{pendingIncident && location ? `${Math.round(getDistance(location.latitude, location.longitude, pendingIncident.latitude, pendingIncident.longitude))} m` : '...'}</Text></View>
              <View style={s.modalInfoRow}><Text style={s.modalInfoLabel}>Timp estimat</Text><Text style={s.modalInfoVal}>~2 min</Text></View>
            </View>
            <TouchableOpacity style={s.acceptBtn} onPress={handleAccept} disabled={acceptLoading}>
              {acceptLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.acceptBtnText}>✅ ACCEPT — SUNT ÎN DRUM</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.declineBtn} onPress={handleDecline}>
              <Text style={s.declineBtnText}>Nu pot interveni acum</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 32 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  statusBar: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 12, left: 16, right: 16, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, gap: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, color: '#444', fontWeight: '500' },
  map: { flex: 1 },
  aedMarker: { backgroundColor: '#fff', borderRadius: 20, padding: 4, borderWidth: 2, borderColor: '#D32F2F', shadowColor: '#D32F2F', shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  callout: { backgroundColor: '#fff', borderRadius: 12, padding: 12, minWidth: 180, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  calloutTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  calloutAddr: { fontSize: 12, color: '#666', marginBottom: 8 },
  calloutBadge: { backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  calloutBadgeText: { fontSize: 11, color: '#388E3C', fontWeight: '600' },
  incidentMarker: { backgroundColor: '#FFEBEE', borderRadius: 24, padding: 8, borderWidth: 3, borderColor: '#D32F2F', shadowColor: '#D32F2F', shadowOpacity: 0.6, shadowRadius: 8, elevation: 8 },
  // Nav bar
  navBar: { position: 'absolute', bottom: 90, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 8 },
  navIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  navSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  navEndBtn: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  navEndText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  // Buttons
  centerButton: { position: 'absolute', right: 16, bottom: 240, backgroundColor: '#fff', borderRadius: 28, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  refreshButton: { position: 'absolute', right: 16, bottom: 300, backgroundColor: '#fff', borderRadius: 28, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  sosContainer: { position: 'absolute', bottom: 90, left: 24, right: 24, alignItems: 'center' },
  sosButton: { backgroundColor: '#D32F2F', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 32, width: '100%', alignItems: 'center', shadowColor: '#D32F2F', shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  sosButtonDisabled: { backgroundColor: '#E57373', shadowOpacity: 0.2 },
  sosIcon: { fontSize: 28, marginBottom: 4 },
  sosText: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  sosSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center' },
  pulseCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalInfo: { width: '100%', backgroundColor: '#F9F9F9', borderRadius: 12, padding: 14, marginBottom: 20 },
  modalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalInfoLabel: { fontSize: 14, color: '#888' },
  modalInfoVal: { fontSize: 14, fontWeight: '600', color: '#333' },
  acceptBtn: { backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 10, shadowColor: '#4CAF50', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  acceptBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  declineBtn: { paddingVertical: 12 },
  declineBtnText: { color: '#999', fontSize: 14 },
});
