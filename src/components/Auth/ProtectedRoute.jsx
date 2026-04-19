import React from 'react';
import { useAuth } from '../../context/AuthContext';

// Guest mode is always the fallback — no redirect to login.
// Authenticated users get full access; unauthenticated users are treated as guests.
export default function ProtectedRoute({ children }) {
  const { loading } = useAuth();

  // Show a brief spinner only while Firebase resolves auth state.
  // AuthContext enforces a 3-second max so this never hangs in production.
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', fontSize: '24px' }}>✈</div>
          <p>Loading ATC...</p>
        </div>
      </div>
    );
  }

  // Always render — guests land on the dashboard too
  return children;
}
