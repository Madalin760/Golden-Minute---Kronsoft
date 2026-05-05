import axios from 'axios';

const BASE_URL = 'http://localhost:8081';
// Pe telefon fizic: 'http://IP_COLEG:8081'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// AED-uri din raza ta
export const getAedsNearby = (lat, lng, radius = 5000) => {
  return api.get('/api/aeds/nearest', { params: { lat, lng, radius } });
};

// Trimite SOS
export const createIncident = (lat, lng, type = 'CARDIAC_ARREST') => {
  return api.post('/api/incidents', { latitude: lat, longitude: lng, type });
};

// Înregistrează voluntar (după login)
export const registerVolunteer = (name, fcmToken, lat, lng) => {
  return api.post('/api/volunteers/register', {
    name,
    fcmToken,
    latitude: lat,
    longitude: lng,
    isAvailable: true,
    isVerified: false,
  });
};

// Test conexiune
export const testBackend = () => {
  return api.get('/api/incidents/test');
};

export default api;