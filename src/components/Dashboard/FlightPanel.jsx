import styles from './Dashboard.module.css';

export default function FlightPanel({ flight, onClose }) {
  if (!flight) return null;

  return (
    <div className={`${styles.flightDetailPanel} ${flight ? styles.open : ''}`}>
      <button className={styles.closeBtn} onClick={onClose}>&times;</button>
      
      <div className={styles.panelHeader}>
        <h3>{flight.flightNumber}</h3>
        <span className={styles.airlineName}>{flight.airline}</span>
        <br />
        <span className={`${styles.statusBadge} ${styles['badge-' + flight.status]}`}>
          {flight.status.replace('-', ' ')}
        </span>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Altitude</div>
          <div className={styles.statValue}>{flight.altitude.toLocaleString()} ft</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Speed</div>
          <div className={styles.statValue}>{flight.speed} kts</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Heading</div>
          <div className={styles.statValue}>{flight.heading}°</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Fuel Level</div>
          <div className={styles.statValue}>{flight.fuel}%</div>
        </div>
      </div>

      <div className={styles.routeContainer}>
        <div className={styles.routeInfo}>
          <div className={styles.routePoint}>
            <div className={styles.code}>{flight.origin}</div>
            <div className={styles.city}>Departure</div>
          </div>
          <div className={styles.routeArrow}>✈</div>
          <div className={styles.routePoint}>
            <div className={styles.code}>{flight.destination}</div>
            <div className={styles.city}>Arrival</div>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '65%' }}></div>
          </div>
          <div className={styles.etaInfo}>
            <span>ETA: 2h 45m</span>
            <span>65% Complete</span>
          </div>
        </div>
      </div>

      {(flight.status === 'emergency' || flight.status === 'low-fuel') && (
        <div className={styles.runwayInfo}>
          <span style={{ fontSize: '20px' }}>⚠</span>
          <div>
            <strong>Runway 09R Assigned</strong>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>Priority landing cleared by ATC</p>
          </div>
        </div>
      )}

      <div className={styles.panelActions}>
        <button className={styles.sendBtn} style={{ width: '100%', padding: '12px' }}>
          Contact Pilot (Direct)
        </button>
      </div>
    </div>
  );
}
