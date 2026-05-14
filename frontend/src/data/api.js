import axios from 'axios';

// Use your PC's local network IP so Expo Go on a physical device can reach the backend.
// Your PC is at 192.168.1.226 on the local network.
// Make sure your phone is on the same WiFi as your PC.
const BASE_URL = 'http://192.168.1.225:8081';

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