import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logout 
} from '../services/firebase';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch/sync profile from backend
  const refreshProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }
    try {
      const token = await firebaseUser.getIdToken();
      const profile = await api.getUserProfile(token);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.warn('Profile not found in Supabase (may need complete-profile)', err);
      setUserProfile(null);
      return null;
    }
  };

  useEffect(() => {
    // Hard timeout: if Firebase hasn't resolved in 3 seconds, unblock the app.
    // This prevents a permanent white screen in production (Vercel) when
    // Firebase Auth is slow to initialize on cold starts.
    const authTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(authTimeout); // Firebase resolved — cancel the timeout
      setCurrentUser(user);
      if (user) {
        await refreshProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  const value = {
    user: currentUser,
    profile: userProfile,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
