const BASE_URL = 'https://atc-ibed.onrender.com/api';
const WS_URL = 'wss://atc-ibed.onrender.com/ws/flights';

/**
 * ATC Backend API Service
 */
export const api = {
  // Flights & Tracking
  getFlights: () => fetch(`${BASE_URL}/flights/`).then(r => r.json()).then(data => Array.isArray(data) ? data : (data?.flights || data?.data || [])),
  
  // Alerts
  getAlerts: () => fetch(`${BASE_URL}/alerts/`).then(r => r.json()).then(data => Array.isArray(data) ? data : (data?.alerts || data?.data || [])),
  resolveAlert: (id) => fetch(`${BASE_URL}/alerts/${id}/resolve/`, { 
    method: 'PUT' 
  }).then(r => r.json()),
  
  // Runways
  getRunways: () => fetch(`${BASE_URL}/runways/`).then(r => r.json()).then(data => Array.isArray(data) ? data : (data?.runways || data?.data || [])),
  assignRunway: (data) => fetch(`${BASE_URL}/runways/assign/`, { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(data) 
  }).then(r => r.json()),
  
  // AI Chat (Groq)
  chat: (message, user_name = null) => fetch(`${BASE_URL}/chat/`, { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({ message, user_name }) 
  }).then(r => r.json()),
  
  // Tracking History — uses /guest for unauthenticated users
  getHistory: (userId = null) => {
    const url = userId ? `${BASE_URL}/history/${userId}/` : `${BASE_URL}/history/guest/`;
    return fetch(url).then(r => r.json()).then(data => Array.isArray(data) ? data : []);
  },
  addHistory: (data) => fetch(`${BASE_URL}/history/`, { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(data) 
  }).then(r => r.json()),

  // Authentication & Profile Sync
  authHeaders: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }),

  syncUser: (userData, token) => fetch(`${BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: api.authHeaders(token),
    body: JSON.stringify(userData)
  }).then(r => r.json()),

  getUserProfile: (token) => fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: api.authHeaders(token)
  }).then(r => r.json()),

  updateProfile: (userData, token) => fetch(`${BASE_URL}/auth/me/`, {
    method: 'PUT',
    headers: api.authHeaders(token),
    body: JSON.stringify(userData)
  }).then(r => r.json()),
};

/**
 * WebSocket Connection for Flight Updates
 * Includes silent auto-reconnect logic
 */
export const connectWebSocket = (onMessage) => {
  let ws;
  let retryDelay = 3000;
  const maxRetryDelay = 30000;
  
  const connect = () => {
    ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('📡 ATC WebSocket Connected');
      retryDelay = 3000; // Reset on successful connection
    };
    
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };
    
    ws.onclose = () => {
      console.log(`📡 ATC WebSocket Disconnected (Retrying in ${retryDelay/1000}s...)`);
      setTimeout(connect, retryDelay);
      
      // Exponential backoff
      retryDelay = Math.min(retryDelay * 2, maxRetryDelay);
    };
    
    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
      ws.close();
    };
    
    return ws;
  };
  
  return connect();
};
