import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import styles from './Auth.module.css';

export default function CompleteProfile() {
  const { user, refreshProfile, profile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    badgeId: '',
    role: '',
    zone: 'Global' // Default for Google users
  });

  // If profile is already complete, redirect back to dashboard
  useEffect(() => {
    if (profile) {
      navigate('/app');
    }
  }, [profile, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.fullName || !formData.badgeId || !formData.role) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      
      const syncData = {
        email: user.email,
        name: formData.fullName,
        badge_id: formData.badgeId,
        role: formData.role,
        zone: formData.zone,
        shift: "Standard"
      };

      await api.syncUser(syncData, token);
      await refreshProfile(user); // Force Refresh context state
      navigate('/app');
    } catch (err) {
      setError('Failed to link profile with ATC records. Contact System Admin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.starfield}></div>
      
      <motion.div 
        className={styles.authCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.authHeader}>
          <div className={styles.logo}>✈ ATC</div>
          <h1 className={styles.title}>Complete Controller Profile</h1>
          <p className={styles.subtitle}>Welcome, {user?.email}. Please link your sector credentials.</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>Full Operational Name</label>
            <input 
              type="text" 
              name="fullName"
              placeholder="Full Name" 
              className={styles.inputField} 
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>Badge ID (ATC-2024-XXX)</label>
            <input 
              type="text" 
              name="badgeId"
              placeholder="Badge ID" 
              className={styles.inputField} 
              value={formData.badgeId}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>Sector Role</label>
            <select name="role" className={styles.inputField} value={formData.role} onChange={handleInputChange} required>
              <option value="" disabled>Select Role...</option>
              <option value="Air Traffic Controller">Air Traffic Controller</option>
              <option value="Senior Controller">Senior Controller</option>
              <option value="Tower Supervisor">Tower Supervisor</option>
              <option value="Area Controller">Area Controller</option>
            </select>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Authorize Control Access"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
