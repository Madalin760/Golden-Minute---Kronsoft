import axios from 'axios';
import Constants from 'expo-constants';

// Automatically get the IP address of the machine running the Expo packager
const getBaseUrl = () => {
  if (!__DEV__) {
    // Put your production URL here when you deploy
    return 'https://your-production-backend.com';
  }
  
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    // debuggerHost looks like "192.168.1.225:8081"
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8080`;
  }
  
  // Fallback
  return 'http://localhost:8080';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── AUTH ───────────────────────────────────────────────────────────────────

export const registerUser = (name, email, password, phone) =>
  api.post('/api/auth/register', { name, email, password, phone });

export const loginUser = (email, password) =>
  api.post('/api/auth/login', { email, password });

// ─── AED ───────────────────────────────────────────────────────────────────

/**
 * Fetch AED devices within `radius` meters of (lat, lng).
 * GET /api/aeds/nearest?lat=&lng=&radius=
 * Returns: [{ id, name, address, latitude, longitude }]
 */
export const getAedsNearby = (lat, lng, radius = 5000) =>
  api.get('/api/aeds/nearest', { params: { lat, lng, radius } });

// ─── INCIDENTS ─────────────────────────────────────────────────────────────

/**
 * Create a new emergency incident (SOS).
 * POST /api/incidents
 * Body: { latitude, longitude, type }
 * Returns: { incident, nearbyAeds, volunteerStatus, routeStatus, message }
 */
export const createIncident = (lat, lng, type = 'CARDIAC_ARREST') =>
  api.post('/api/incidents', { latitude: lat, longitude: lng, type });

/**
 * Health check.
 * GET /api/incidents/test
 */
export const testBackend = () => api.get('/api/incidents/test');

/**
 * Get all active incidents (for local notification polling)
 * GET /api/incidents/active
 */
export const getActiveIncidents = () => api.get('/api/incidents/active');

/**
 * Accept an incident as a volunteer.
 * POST /api/incidents/{incidentId}/accept?volunteerId=X
 */
export const acceptIncident = (incidentId, volunteerId) =>
  api.post(`/api/incidents/${incidentId}/accept?volunteerId=${volunteerId}`);

// ─── VOLUNTEERS ────────────────────────────────────────────────────────────

/**
 * Register or update a volunteer (upsert by fcmToken).
 * POST /api/volunteers/register
 * Body: { name, fcmToken, latitude, longitude }
 * Returns: Volunteer entity
 */
export const registerVolunteer = (name, fcmToken, lat, lng, userId = null) =>
  api.post('/api/volunteers/register', {
    name,
    fcmToken,
    latitude: lat,
    longitude: lng,
    userId,
  });

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────

/**
 * Send a push notification via Firebase.
 * POST /api/notifications/send
 * Body: { token, title, body }
 */
export const sendNotification = (token, title, body) =>
  api.post('/api/notifications/send', { token, title, body });

export default api;