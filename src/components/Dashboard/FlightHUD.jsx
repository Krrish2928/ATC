import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

export default function FlightHUD({ flight, map, onClose }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!map || !flight) return;

    const updatePosition = () => {
      const point = map.project([flight.lng, flight.lat]);
      setPos({ x: point.x, y: point.y });
    };

    updatePosition();
    map.on('move', updatePosition);
    map.on('moveend', updatePosition);
    
    // Also update when flight moves (real-time stream)
    updatePosition();

    return () => {
      map.off('move', updatePosition);
      map.off('moveend', updatePosition);
    };
  }, [map, flight, flight.lat, flight.lng]);

  if (!flight) return null;

  return (
    <div 
      className={styles.hudOverlay} 
      style={{ 
        transform: `translate(${pos.x + 20}px, ${pos.y - 120}px)`
      }}
    >
      <div className={styles.hudConnector}></div>
      <div className={styles.hudContainer}>
        {/* Corner Brackets */}
        <div className={`${styles.corner} ${styles.top} ${styles.left}`}></div>
        <div className={`${styles.corner} ${styles.top} ${styles.right}`}></div>
        <div className={`${styles.corner} ${styles.bottom} ${styles.left}`}></div>
        <div className={`${styles.corner} ${styles.bottom} ${styles.right}`}></div>

        <div className={styles.hudHeader}>
          <div className={styles.callsign}>{flight.flightNumber}</div>
          <div className={`${styles.hudStatus} ${styles[flight.status]}`}>
            {flight.status.toUpperCase()}
          </div>
        </div>

        <div className={styles.hudGrid}>
          <div className={styles.hudStat}>
            <span className={styles.hudLabel}>ALT</span>
            <span className={styles.hudValue}>FL{Math.round(flight.altitude / 100)}</span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.hudLabel}>SPD</span>
            <span className={styles.hudValue}>{flight.speed} KT</span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.hudLabel}>HDG</span>
            <span className={styles.hudValue}>{flight.heading.toString().padStart(3, '0')}°</span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.hudLabel}>TYPE</span>
            <span className={styles.hudValue}>B789</span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.hudLabel}>SQK</span>
            <span className={styles.hudValue}>{Math.floor(1000 + Math.random() * 8000)}</span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.hudLabel}>ETA</span>
            <span className={styles.hudValue}>14:25z</span>
          </div>
        </div>

        <div className={styles.hudRoute}>
          <span className={styles.routeCode}>{flight.origin}</span>
          <span className={styles.routeArrow}>→</span>
          <span className={styles.routeCode}>{flight.destination}</span>
        </div>

        <div className={styles.hudActions}>
          <button className={styles.hudBtn}>MONITOR</button>
          <button className={styles.hudBtn}>HISTORY</button>
          <button className={styles.hudBtn} style={{ color: '#ff5252' }}>ALERT</button>
        </div>
      </div>
    </div>
  );
}
