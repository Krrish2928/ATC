import React, { useState } from 'react';
import styles from './Dashboard.module.css';

export default function NotificationPanel({ alerts, onDismiss, onClearAll, onResolveAlert }) {
  const [activeTab, setActiveTab] = useState('unresolved');
  const [resolvingAlert, setResolvingAlert] = useState(null);

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  const displayAlerts = activeTab === 'unresolved' ? unresolvedAlerts : resolvedAlerts;

  const handleResolveClick = (alert) => {
    setResolvingAlert({
      ...alert,
      selectedAction: alert.type === 'proximity' ? 'Reroute Flight 1' 
                      : alert.type === 'emergency' ? 'Assign Priority Runway'
                      : 'Assign Nearest Runway'
    });
  };

  const confirmResolution = () => {
    if (resolvingAlert && onResolveAlert) {
      onResolveAlert(resolvingAlert, resolvingAlert.selectedAction);
    }
    setResolvingAlert(null);
  };

  return (
    <div className={styles.notificationsDropdown}>
      <div className={styles.panelHeader}>
        <h3>Operational Alerts</h3>
        <button className={styles.clearAllBtn} onClick={onClearAll}>Clear All</button>
      </div>
      
      <div className={styles.panelTabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'unresolved' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('unresolved')}
        >
          Unresolved ({unresolvedAlerts.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'resolved' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('resolved')}
        >
          Resolved ({resolvedAlerts.length})
        </button>
      </div>

      <div className={styles.alertsList}>
        {displayAlerts.length === 0 ? (
          <div className={styles.emptyAlerts}>
            {activeTab === 'unresolved' ? 'No active alerts. Airspace clear.' : 'No resolved alerts history.'}
          </div>
        ) : (
          displayAlerts.map(alert => (
            <div key={alert.id} className={`${styles.alertItem} ${styles[alert.type]}`}>
              <div className={styles.alertIcon}>
                {alert.type === 'emergency' && '🚨'}
                {alert.type === 'low-fuel' && '⛽'}
                {alert.type === 'proximity' && '⚠️'}
              </div>
              <div className={styles.alertContent}>
                <p>{alert.message}</p>
                <span>{alert.timestamp}</span>
              </div>
              <div className={styles.alertActionsGroup}>
                {!alert.resolved && (
                  <>
                    <button 
                      className={styles.resolveBtnActive} 
                      onClick={() => handleResolveClick(alert)}
                    >
                      📡 Resolve
                    </button>
                    <button 
                      className={styles.dismissBtnGrey} 
                      onClick={() => onDismiss(alert.id)}
                    >
                      ✕ Dismiss
                    </button>
                  </>
                )}
                {alert.resolved && (
                  <span className={styles.resolvedBadge}>✅ Resolved</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {resolvingAlert && (
        <div className={styles.resolveModalOverlay}>
          <div className={styles.resolveModalCard}>
            <h4>
              {resolvingAlert.type === 'proximity' ? 'Reroute Protocol' : 
               resolvingAlert.type === 'emergency' ? 'Declare Emergency Protocol' : 
               'Low Fuel Protocol'}
            </h4>
            
            <p className={styles.resolveModalMessage}>
              {resolvingAlert.type === 'proximity' 
                ? `Initiate contact with ${resolvingAlert.data.f1} and ${resolvingAlert.data.f2}?`
                : `Initiate protocol for ${resolvingAlert.data.f1}?`
              }
            </p>
            
            <div className={styles.resolveModalOptions}>
              {resolvingAlert.type === 'proximity' ? (
                <>
                  <label className={styles.radioOption}>
                    <input 
                      type="radio" 
                      checked={resolvingAlert.selectedAction === 'Reroute Flight 1'}
                      onChange={() => setResolvingAlert({...resolvingAlert, selectedAction: 'Reroute Flight 1'})} 
                    /> Reroute {resolvingAlert.data.f1}
                  </label>
                  <label className={styles.radioOption}>
                    <input 
                      type="radio" 
                      checked={resolvingAlert.selectedAction === 'Reroute Flight 2'}
                      onChange={() => setResolvingAlert({...resolvingAlert, selectedAction: 'Reroute Flight 2'})} 
                    /> Reroute {resolvingAlert.data.f2}
                  </label>
                </>
              ) : (
                <label className={styles.radioOption}>
                  <input type="radio" checked readOnly/> {resolvingAlert.selectedAction}
                </label>
              )}
            </div>

            <div className={styles.resolveModalFooter}>
              <button className={styles.cancelResolveBtn} onClick={() => setResolvingAlert(null)}>Cancel</button>
              <button className={styles.confirmResolveBtn} onClick={confirmResolution}>Confirm Resolution</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
