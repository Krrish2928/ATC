import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import GlobeScene from './components/Globe/GlobeScene.jsx'
import Navbar from './components/UI/Navbar.jsx'
import HeroOverlay from './components/UI/HeroOverlay.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'
import ProfilePage from './components/Profile/ProfilePage.jsx'
import SettingsPage from './components/Settings/SettingsPage.jsx'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx'
import CompleteProfile from './components/Auth/CompleteProfile.jsx'

function MainApp() {
  const [isZoomed, setIsZoomed] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    if (isZoomed) {
      const transitionTimer = setTimeout(() => {
        try {
          if (window.__threeRenderer) {
            console.log("Forcing Three.js context loss before Dashboard mount...");
            if (typeof window.__threeRenderer.forceContextLoss === 'function') {
              window.__threeRenderer.forceContextLoss();
            }
            if (typeof window.__threeRenderer.dispose === 'function') {
              window.__threeRenderer.dispose();
            }
            window.__threeRenderer = null;
          }
        } catch (err) {
          console.warn("Context disposal failed (non-fatal):", err);
        }
        setShowDashboard(true);
      }, 1500);
      return () => clearTimeout(transitionTimer);
    }
  }, [isZoomed]);

  if (showDashboard) {
    return <Navigate to="/app" replace />;
  }

  return (
    <>
      <div className="canvas-wrapper">
        <GlobeScene isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
      </div>
      <div className="vignette" />
      <Navbar />
      <div className="app-wrapper">
        <HeroOverlay 
          isZoomed={isZoomed} 
          onZoomClick={() => setIsZoomed(true)} 
        />
      </div>
    </>
  )
}

export default function App() {
  // Global App Initialization (Theme Syncing)
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          
          <Route path="/app/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
