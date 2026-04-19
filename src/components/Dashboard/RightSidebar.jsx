import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export default function RightSidebar({ 
  isCollapsed, 
  onToggle, 
  onLayerChange, 
  currentLayer 
}) {
  const navigate = useNavigate();
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const menuItems = [
    { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' },
    { id: 'layers', icon: '🗺️', label: 'Map Layers', action: () => setShowLayerMenu(!showLayerMenu) },
    { id: 'audio', icon: '🔊', label: 'Audio' },
    { id: 'help', icon: '❓', label: 'Help' },
  ];

  const layerOptions = [
    { id: 'streets-v12', label: 'Streets' },
    { id: 'satellite-streets-v12', label: 'Satellite' },
    { id: 'dark-v11', label: 'Dark' },
    { id: 'outdoors-v12', label: 'Outdoors' },
  ];

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <div className={`${styles.rightSidebarWrapper} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.rightSidebarContent}>
        <div className={styles.menuList}>
          {/* Internal Toggle Button */}
          <div 
            className={styles.menuItem} 
            onClick={onToggle}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <span className={styles.menuIcon}>{isCollapsed ? '‹' : '›'}</span>
            {!isCollapsed && <span className={styles.menuLabel}>Collapse Menu</span>}
          </div>

          <div className={styles.menuDivider} />

          {menuItems.map((item) => (
            <div key={item.id} className={styles.menuItemContainer}>
              <div 
                className={styles.menuItem} 
                onClick={() => handleItemClick(item)}
                title={isCollapsed ? item.label : ''}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!isCollapsed && <span className={styles.menuLabel}>{item.label}</span>}
              </div>

              {item.id === 'layers' && showLayerMenu && !isCollapsed && (
                <div className={styles.layerSubMenu}>
                  {layerOptions.map(opt => (
                    <button 
                      key={opt.id}
                      className={`${styles.layerBtn} ${currentLayer.includes(opt.id) ? styles.active : ''}`}
                      onClick={() => onLayerChange(`mapbox://styles/mapbox/${opt.id}`)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.logoutSection}>
          <div className={styles.menuItem} onClick={() => navigate('/')}>
            <span className={styles.menuIcon}>🚪</span>
            {!isCollapsed && <span className={styles.menuLabel}>Logout</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
