import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import styles from './Auth.module.css';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    badgeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    zone: ''
  });

  const { registerWithEmail, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (Object.values(formData).some(val => val.trim() === '')) {
      setError('All fields are required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // 1. Firebase Auth Creation
      const userCredential = await registerWithEmail(formData.email, formData.password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // 2. Supabase Profile Sync
      const syncData = {
        email: formData.email,
        name: formData.fullName,
        badge_id: formData.badgeId,
        role: formData.role,
        zone: formData.zone,
        shift: "Standard"
      };

      await api.syncUser(syncData, token);
      await refreshProfile(user); // Sync Context state

      navigate('/app');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else {
        setError('Registration failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
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
          <h1 className={styles.title}>Join the Control Center</h1>
          <p className={styles.subtitle}>Register your credentials to access the grid</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <input 
              type="text" 
              name="fullName"
              placeholder="Full Name" 
              className={styles.inputField} 
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.gridFields}>
            <div className={styles.formGroup}>
              <input 
                type="text" 
                name="badgeId"
                placeholder="Badge ID (ATC-2024-XXX)" 
                className={styles.inputField} 
                value={formData.badgeId}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <select name="role" className={styles.inputField} value={formData.role} onChange={handleInputChange}>
                <option value="" disabled>Select Role...</option>
                <option value="Air Traffic Controller">Air Traffic Controller</option>
                <option value="Senior Controller">Senior Controller</option>
                <option value="Tower Supervisor">Tower Supervisor</option>
                <option value="Area Controller">Area Controller</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <input 
              type="email" 
              name="email"
              placeholder="Controller Email" 
              className={styles.inputField} 
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <select name="zone" className={styles.inputField} value={formData.zone} onChange={handleInputChange}>
              <option value="" disabled>Select Zone...</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia Pacific">Asia Pacific</option>
              <option value="Middle East">Middle East</option>
              <option value="Africa">Africa</option>
              <option value="South America">South America</option>
            </select>
          </div>

          <div className={styles.gridFields}>
            <div className={styles.formGroup}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="Password" 
                className={styles.inputField} 
                value={formData.password}
                onChange={handleInputChange}
              />
              <button 
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.formGroup}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword"
                placeholder="Confirm Password" 
                className={styles.inputField} 
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button 
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Initializing..." : "Create Account"}
          </button>
        </form>

        <div className={styles.bottomLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
