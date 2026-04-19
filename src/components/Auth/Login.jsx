import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle, loginWithEmail, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthSuccess = async (user) => {
    try {
      const profile = await refreshProfile(user);
      if (profile) {
        const from = location.state?.from?.pathname || '/app';
        navigate(from, { replace: true });
      } else {
        navigate('/complete-profile');
      }
    } catch (err) {
      navigate('/complete-profile');
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await loginWithEmail(email, password);
      await handleAuthSuccess(userCredential.user);
    } catch (err) {
      console.error(err);
      setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password.' : 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const userCredential = await loginWithGoogle();
      await handleAuthSuccess(userCredential.user);
    } catch (err) {
      console.error(err);
      setError('Google Sign-In failed.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.starfield}></div>
      
      <motion.div 
        className={styles.authCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <button className={styles.closeBtn} onClick={() => navigate('/')} title="Go back">
          <X size={20} />
        </button>

        <div className={styles.authHeader}>
          <div className={styles.logo}>✈ ATC</div>
          <h1 className={styles.title}>Welcome Back, Controller</h1>
          <p className={styles.subtitle}>Sign in to access the control center</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <button 
          className={styles.googleBtn} 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.divider}>or continue with email</div>

        <form onSubmit={handleEmailSignIn}>
          <div className={styles.formGroup}>
            <input 
              type="email" 
              placeholder="Controller Email" 
              className={styles.inputField} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className={styles.inputField} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className={styles.guestLink}>
          <Link to="/app">Continue without an account →</Link>
        </div>

        <div className={styles.bottomLink}>
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </motion.div>
    </div>
  );
}
