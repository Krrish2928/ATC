import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import styles from './Profile.module.css';

// Reusable counting hook
function useCountUp(end, duration) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile: apiProfile, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Animated numbers
  const flightsMonitored = useCountUp(12847, 2000);
  const activeHours = useCountUp(2340, 2000);
  const incidentsHandled = useCountUp(156, 2000);
  const runwaysManaged = useCountUp(89, 2000);

  const [profile, setProfile] = useState({
    fullName: apiProfile?.name || user?.displayName || 'Controller',
    badgeId: apiProfile?.badge_id || 'ATC-PENDING',
    role: apiProfile?.role || 'Sector Analyst',
    zone: apiProfile?.zone || 'Global Sector',
    shift: apiProfile?.shift || 'Flexible Shift',
    email: user?.email || '',
    phone: '+91 98765 43210'
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const MOCK_ACTIVITY = [
    { id: 1, type: 'normal', text: '✈ Assigned runway 2B to flight AI-302', time: '2 mins ago' },
    { id: 2, type: 'proximity', text: '⚠️ Resolved proximity alert — BA-447 & UA-289', time: '15 mins ago' },
    { id: 3, type: 'lowFuel', text: '⛽ Low fuel protocol initiated for EK-501', time: '32 mins ago' },
    { id: 4, type: 'emergency', text: '🛬 Emergency landing cleared — QF-002', time: '1 hr ago' },
    { id: 5, type: 'normal', text: '✈ Rerouted flight LH-772 due to weather', time: '2 hrs ago' },
    { id: 6, type: 'normal', text: '✈ Handed over sector alpha to Shift B', time: '3 hrs ago' },
    { id: 7, type: 'proximity', text: '⚠️ Warning issued: Vertical separation lost — DL-21 & AF-11', time: '4 hrs ago' },
    { id: 8, type: 'normal', text: '✈ Cleared takeoff for SQ-318', time: '5 hrs ago' },
    { id: 9, type: 'normal', text: '✈ System diagnostics check completed', time: '5.5 hrs ago' },
    { id: 10, type: 'normal', text: '✈ Logged into Control Center', time: '6 hrs ago' }
  ];

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <motion.div 
      className={styles.pageContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className={styles.topNavbar}>
        <a href="/" className={styles.logo}>✈ ATC</a>
        <button className={styles.backBtn} onClick={() => navigate('/app')}>
          ← Back to Dashboard
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout} style={{ marginLeft: '1rem', color: '#ef4444', fontSize: '13px', border: '1px solid currentColor', borderRadius: '4px', padding: '4px 8px' }}>
          Logout Securely
        </button>
      </nav>

      <div className={styles.mainLayout}>
        {/* LEFT COLUMN */}
        <div className={styles.leftColumn}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarCircle}>
                {profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className={styles.statusDot} title="Online"></div>
          </div>
          
          <h2 className={styles.name}>{profile.fullName}</h2>
          <div className={styles.badgeId}>{profile.badgeId}</div>
          
          <div className={styles.pillsRow}>
            <span className={styles.rolePill}>{profile.role}</span>
            <span className={styles.zonePill}>{profile.zone}</span>
          </div>
          
          <div className={styles.shiftInfo}>{profile.shift}</div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{flightsMonitored.toLocaleString()}</div>
              <div className={styles.statLabel}>Flights Monitored</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{activeHours.toLocaleString()}h</div>
              <div className={styles.statLabel}>Active Hours</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{incidentsHandled.toLocaleString()}</div>
              <div className={styles.statLabel}>Incidents Handled</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{runwaysManaged.toLocaleString()}</div>
              <div className={styles.statLabel}>Runways Managed</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
          <div className={styles.tabNav}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'personal' ? styles.active : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Info
              {activeTab === 'personal' && <motion.div layoutId="tabInd" className={styles.tabIndicator} />}
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'activity' ? styles.active : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity Feed
              {activeTab === 'activity' && <motion.div layoutId="tabInd" className={styles.tabIndicator} />}
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
              {activeTab === 'security' && <motion.div layoutId="tabInd" className={styles.tabIndicator} />}
            </button>
          </div>

          <div className={styles.tabContent}>
            <AnimatePresence mode="wait">
              {/* TAB 1: PERSONAL INFO */}
              {activeTab === 'personal' && (
                <motion.div 
                  key="personal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.sectionTitle}>
                    Profile Details
                    {!isEditing ? (
                      <button className={styles.editBtn} onClick={() => setIsEditing(true)}>Edit Profile</button>
                    ) : (
                      <button className={styles.saveBtn} onClick={() => setIsEditing(false)}>Save Changes</button>
                    )}
                  </div>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>Full Name</label>
                      <input name="fullName" value={profile.fullName} onChange={handleInputChange} disabled={!isEditing} className={styles.glassInput} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Badge ID</label>
                      <input name="badgeId" value={profile.badgeId} onChange={handleInputChange} disabled={!isEditing} className={styles.glassInput} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Email Address</label>
                      <input name="email" value={profile.email} onChange={handleInputChange} disabled={!isEditing} className={styles.glassInput} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Phone Number</label>
                      <input name="phone" value={profile.phone} onChange={handleInputChange} disabled={!isEditing} className={styles.glassInput} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Operating Zone</label>
                      <input name="zone" value={profile.zone} onChange={handleInputChange} disabled={!isEditing} className={styles.glassInput} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Assigned Shift</label>
                      <input name="shift" value={profile.shift} onChange={handleInputChange} disabled={!isEditing} className={styles.glassInput} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ACTIVITY FEED */}
              {activeTab === 'activity' && (
                <motion.div 
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.sectionTitle}>Recent Controller Actions</div>
                  <div className={styles.activityList}>
                    {MOCK_ACTIVITY.map(act => (
                      <div key={act.id} className={`${styles.activityItem} ${styles[act.type]}`}>
                        <div className={styles.activityText}>{act.text}</div>
                        <div className={styles.activityTime}>{act.time}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SECURITY */}
              {activeTab === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.sectionTitle}>Security Settings</div>
                  
                  <div className={styles.securityCard}>
                    <h3>Change Password</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label>Current Password</label>
                        <input type="password" placeholder="••••••••" className={styles.glassInput} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <input type="password" placeholder="••••••••" className={styles.glassInput} />
                      </div>
                    </div>
                    <button className={styles.saveBtn} style={{ marginTop: '16px' }}>Update Password</button>
                    
                    <div className={styles.toggleWrapper}>
                      <div className={styles.toggleInfo}>
                        <h4>Two-Factor Authentication</h4>
                        <p>Protect your ATC terminal access with an extra layer of security.</p>
                      </div>
                      <button className={styles.saveBtn} style={{ background: '#3b82f6' }}>Enable 2FA</button>
                    </div>
                  </div>

                  <div className={`${styles.securityCard} ${styles.dangerZone}`}>
                    <h3 className={styles.dangerAlert}>Danger Zone</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                      Last login: Today 06:32 UTC from India
                    </p>
                    
                    {!confirmDelete ? (
                      <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
                        Delete Account
                      </button>
                    ) : (
                      <div className={styles.confirmActions}>
                        <button className={styles.confirmDeleteBtn} onClick={() => navigate('/')}>
                          Yes, delete my account
                        </button>
                        <button className={styles.cancelBtn} onClick={() => setConfirmDelete(false)}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
