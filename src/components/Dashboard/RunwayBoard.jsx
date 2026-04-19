import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { soundService } from '../../utils/SoundService';

export default function RunwayBoard({ runways, onClose, onAutoAssign }) {
  const [selectedAirport, setSelectedAirport] = useState('Mumbai (BOM)');
  const airports = Object.keys(runways);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.runwayBoard}>
        <button className={styles.closeModalBtn} onClick={onClose}>✕</button>
        
        <header className={styles.modalHeader}>
          <h1>Runway Management Center</h1>
          <div className={styles.airportSelector}>
            {airports.map(name => (
              <button 
                key={name}
                className={selectedAirport === name ? styles.active : ''}
                onClick={() => setSelectedAirport(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </header>

        <div className={styles.runwayGrid}>
          {runways[selectedAirport].map(rw => (
            <div key={rw.id} className={styles.runwayCard}>
              <div className={styles.runwayHeader}>
                <h3>Runway {rw.id}</h3>
                <span className={`${styles.rwStatus} ${styles[rw.status.toLowerCase()]}`}>
                  {rw.status}
                </span>
                {rw.status !== 'Maintenance' && (
                  <button 
                    className={styles.clearRwBtn} 
                    onClick={() => soundService.playRunwayCleared(rw.id)}
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className={styles.currentOccupancy}>
                <label>Current Occupant</label>
                <div className={styles.flightRow}>
                  {rw.occupant ? (
                    <>
                      <span className={styles.flightId}>{rw.occupant.id}</span>
                      <span className={styles.timer}>{rw.timer}s remaining</span>
                    </>
                  ) : (
                    <span className={styles.empty}>Available</span>
                  )}
                </div>
              </div>

              <div className={styles.queueSection}>
                <label>Priority Queue</label>
                <div className={styles.queueList}>
                  {rw.queue.map((f, i) => (
                    <div key={i} className={`${styles.queueItem} ${styles[f.status]}`}>
                      <span className={styles.priorityDot}></span>
                      <span className={styles.qFlight}>{f.id}</span>
                      <span className={styles.qType}>{f.airline}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className={styles.modalFooter}>
          <p>Total Queue: {runways[selectedAirport].reduce((acc, r) => acc + r.queue.length, 0)} Flights</p>
          <button className={styles.autoAssignBtn} onClick={() => onAutoAssign(selectedAirport)}>
            Auto-Assign Priority Queue
          </button>
        </footer>
      </div>
    </div>
  );
}
