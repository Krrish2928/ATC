import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Settings.module.css';

const SECTIONS = [
  { id: 'display', icon: '🖥️', label: 'Display' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'audio', icon: '🔊', label: 'Audio' },
  { id: 'data', icon: '📡', label: 'Data & Refresh' },
  { id: 'map', icon: '🗺️', label: 'Map Preferences' },
  { id: 'security', icon: '🔐', label: 'Security' },
  { id: 'about', icon: 'ℹ️', label: 'About' }
];

const DEFAULT_SETTINGS = {
  themeMode: 'dark',
  themeSelector: 'Dark',
  sidebarPos: 'Left',
  fontSize: 'Medium',
  compactMode: false,
  animSpeed: 'Normal',
  alertEmergency: true,
  alertLowFuel: true,
  alertProximity: true,
  alertRunway: true,
  alertSystem: false,
  alertSound: true,
  voiceMaster: true,
  voiceEmergency: true,
  voiceLowFuel: true,
  voiceProximity: true,
  audioVolume: 80,
  voiceSpeed: 'Normal',
  refreshRate: '5s',
  mapSource: 'Simulated',
  autoCenterEmergency: true,
  showTrails: true,
  trailLength: 'Medium',
  mapStyle: 'Satellite',
  mapZoom: 5,
  showAirports: true,
  showRoutes: false,
  showCollision: true,
  units: 'Kilometers',
  twoFactor: false,
  sessionTimeout: '1hr'
};

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    className={`${styles.toggleSwitch} ${checked ? styles.active : ''}`}
    onClick={() => onChange(!checked)}
  >
    <motion.div 
      className={styles.toggleThumb}
      layout
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
      style={{ marginLeft: checked ? 'auto' : '0' }}
    />
  </div>
);

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('display');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showToast, setShowToast] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('atc_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Update logic with Toast & Theme
  const updateSetting = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('atc_settings', JSON.stringify(next));
      
      if (key === 'themeMode') {
        localStorage.setItem('theme', value);
        if (value === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      }
      return next;
    });

    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  const renderSection = () => {
    switch(activeMenu) {
      case 'display': return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
          <div className={`${styles.settingCard} ${styles.themeCard}`}>
            <div className={styles.settingRow} style={{ border: 'none' }}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName} style={{ fontSize: '18px' }}>Theme Mode</div>
                <div className={styles.settingHint}>Toggle light and dark aesthetics globally via CSS variables.</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>{settings.themeMode === 'light' ? '☀️' : '🌙'}</span>
                <ToggleSwitch 
                  checked={settings.themeMode === 'light'} 
                  onChange={(v) => updateSetting('themeMode', v ? 'light' : 'dark')}
                />
              </div>
            </div>
          </div>

          <div className={styles.settingCard}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Theme Selector</div>
                <div className={styles.settingHint}>Adjust background variations.</div>
              </div>
              <select className={styles.selectDropdown} value={settings.themeSelector} onChange={e=>updateSetting('themeSelector', e.target.value)}>
                <option>Dark</option><option>Darker</option><option>Midnight</option>
              </select>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Sidebar Position</div>
              </div>
              <select className={styles.selectDropdown} value={settings.sidebarPos} onChange={e=>updateSetting('sidebarPos', e.target.value)}>
                <option>Left</option><option>Right</option><option>Both</option>
              </select>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Font Size</div>
              </div>
              <select className={styles.selectDropdown} value={settings.fontSize} onChange={e=>updateSetting('fontSize', e.target.value)}>
                <option>Small</option><option>Medium</option><option>Large</option>
              </select>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Compact Mode</div>
                <div className={styles.settingHint}>Reduces UI padding allowing more data on screen.</div>
              </div>
              <ToggleSwitch checked={settings.compactMode} onChange={v=>updateSetting('compactMode', v)} />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Animation Speed</div>
              </div>
              <select className={styles.selectDropdown} value={settings.animSpeed} onChange={e=>updateSetting('animSpeed', e.target.value)}>
                <option>Slow</option><option>Normal</option><option>Fast</option>
              </select>
            </div>
          </div>
        </motion.div>
      );
      case 'notifications': return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
          <div className={styles.settingCard}>
            {['Emergency', 'LowFuel', 'Proximity', 'Runway', 'System'].map((type) => (
              <div className={styles.settingRow} key={type}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName}>{type.replace(/([A-Z])/g, ' $1').trim()} Alerts</div>
                </div>
                <ToggleSwitch checked={settings[`alert${type}`]} onChange={v=>updateSetting(`alert${type}`, v)} />
              </div>
            ))}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Master Alert Sounds</div>
              </div>
              <ToggleSwitch checked={settings.alertSound} onChange={v=>updateSetting('alertSound', v)} />
            </div>
          </div>
        </motion.div>
      );
      case 'audio': return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
          <div className={styles.settingCard}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Voice Announcements Master</div>
              </div>
              <ToggleSwitch checked={settings.voiceMaster} onChange={v=>updateSetting('voiceMaster', v)} />
            </div>
            <div className={styles.settingRow}>
               <div className={styles.settingInfo}>
                 <div className={styles.settingName}>Volume ({settings.audioVolume}%)</div>
               </div>
               <input type="range" className={styles.rangeSlider} min="0" max="100" value={settings.audioVolume} onChange={e=>updateSetting('audioVolume', parseInt(e.target.value))} />
            </div>
            {['Emergency', 'LowFuel', 'Proximity'].map(type => (
              <div className={styles.settingRow} key={`voice${type}`}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName}>{type.replace(/([A-Z])/g, ' $1').trim()} Voice Toggle</div>
                </div>
                <ToggleSwitch checked={settings[`voice${type}`]} onChange={v=>updateSetting(`voice${type}`, v)} />
              </div>
            ))}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Voice Speed</div>
              </div>
              <select className={styles.selectDropdown} value={settings.voiceSpeed} onChange={e=>updateSetting('voiceSpeed', e.target.value)}>
                <option>Slow</option><option>Normal</option><option>Fast</option>
              </select>
            </div>
            <div className={styles.settingRow}>
              <button className={styles.backBtn} onClick={() => alert('Testing audio output...')}>Play Sample Audio</button>
            </div>
          </div>
        </motion.div>
      );
      case 'data': return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
          <div className={styles.settingCard}>
             <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Flight Data Source</div>
                <div className={styles.settingHint}>Live ADS-B sync coming soon.</div>
              </div>
              <select className={styles.selectDropdown} disabled value="Simulated">
                <option>Simulated</option>
              </select>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Map Refresh Rate</div>
              </div>
              <select className={styles.selectDropdown} value={settings.refreshRate} onChange={e=>updateSetting('refreshRate', e.target.value)}>
                <option>3s</option><option>5s</option><option>10s</option><option>30s</option>
              </select>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>Show Flight Trails</div>
              </div>
              <ToggleSwitch checked={settings.showTrails} onChange={v=>updateSetting('showTrails', v)} />
            </div>
          </div>
        </motion.div>
      );
      case 'map': return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
           <div className={styles.settingCard}>
             <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName}>Default Map Style</div>
                </div>
                <select className={styles.selectDropdown} value={settings.mapStyle} onChange={e=>updateSetting('mapStyle', e.target.value)}>
                  <option>Streets</option><option>Satellite</option><option>Dark</option><option>Outdoors</option>
                </select>
             </div>
             <div className={styles.settingRow}>
               <div className={styles.settingInfo}>
                 <div className={styles.settingName}>Grid Units</div>
               </div>
               <select className={styles.selectDropdown} value={settings.units} onChange={e=>updateSetting('units', e.target.value)}>
                 <option>Kilometers</option><option>Miles</option><option>Nautical Miles</option>
               </select>
             </div>
             <div className={styles.settingRow}>
               <div className={styles.settingInfo}>
                 <div className={styles.settingName}>Base Zoom Level ({settings.mapZoom})</div>
               </div>
               <input type="range" className={styles.rangeSlider} min="2" max="12" value={settings.mapZoom} onChange={e=>updateSetting('mapZoom', parseInt(e.target.value))} />
             </div>
           </div>
        </motion.div>
      );
      case 'security': return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
           <div className={styles.settingCard}>
             <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName}>Two-Factor Authentication</div>
                  <div className={styles.settingHint}>Require OTP device for login.</div>
                </div>
                <ToggleSwitch checked={settings.twoFactor} onChange={v=>updateSetting('twoFactor', v)} />
             </div>
             <div className={styles.settingRow}>
               <div className={styles.settingInfo}>
                 <div className={styles.settingName}>Session Timeout</div>
               </div>
               <select className={styles.selectDropdown} value={settings.sessionTimeout} onChange={e=>updateSetting('sessionTimeout', e.target.value)}>
                 <option>15min</option><option>30min</option><option>1hr</option><option>Never</option>
               </select>
             </div>
           </div>
        </motion.div>
      );
      case 'about': return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
          <div className={styles.settingCard}>
             <div className={styles.settingRow} style={{ borderBottom: 'none' }}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName} style={{ fontSize: '20px', color: '#3b82f6' }}>ATC Terminal Platform v2.0.0</div>
                  <div className={styles.settingHint} style={{ marginTop: '12px', lineHeight: '1.6' }}>
                    Build Target: 2026-X<br/>
                    Engine: React 18 / Node Environment<br/><br/>
                    <strong>Changelog:</strong><br/>
                    • Implemented Native CSS Variable Light/Dark Mode<br/>
                    • Established Proximity Collision Engine limits<br/>
                    • Deployed Global Mapbox Instance
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className={styles.pageContainer}>
      <nav className={styles.topNavbar}>
        <a href="/" className={styles.logo}>✈ ATC</a>
        <button className={styles.backBtn} onClick={() => navigate('/app')}>
          ← Back to Dashboard
        </button>
      </nav>

      <div className={styles.mainLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Settings Menu</div>
          {SECTIONS.map(sec => (
            <button 
              key={sec.id}
              className={`${styles.navItem} ${activeMenu === sec.id ? styles.active : ''}`}
              onClick={() => setActiveMenu(sec.id)}
            >
              <span className={styles.itemIcon}>{sec.icon}</span>
              {sec.label}
            </button>
          ))}
        </div>
        
        <div className={styles.contentArea}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>{SECTIONS.find(s=>s.id === activeMenu).label}</h1>
            <p className={styles.sectionDesc}>Manage preferences and overrides for your control terminal.</p>
          </div>
          
          <AnimatePresence mode="wait">
            {renderSection()}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            className={styles.toast}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            ✅ Changes saved instantly
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
