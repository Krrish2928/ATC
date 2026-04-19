import React from 'react';
import styles from './Dashboard.module.css';

export default function AnalyticsPanel({ data, onClose }) {
  if (!data) return null;

  return (
    <div className={styles.analyticsPanel}>
      <div className={styles.panelHeader}>
        <h2>Airspace Analytics</h2>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.scrollContent}>
        {/* Stat Cards */}
        <div className={styles.statCards}>
          <div className={styles.statCard}>
            <label>Total Flights</label>
            <div className={styles.statVal}>{data.total}</div>
          </div>
          <div className={styles.statCard}>
            <label>Emergencies</label>
            <div className={`${styles.statVal} ${styles.red}`}>{data.emergencies}</div>
          </div>
          <div className={styles.statCard}>
            <label>Avg Altitude</label>
            <div className={styles.statVal}>{data.avgAlt} ft</div>
          </div>
          <div className={styles.statCard}>
            <label>Avg Speed</label>
            <div className={styles.statVal}>{data.avgSpeed} kts</div>
          </div>
        </div>

        {/* Busiest Routes */}
        <section className={styles.chartSection}>
          <h3>Busiest Flight Routes</h3>
          <div className={styles.barChart}>
            {data.routes.map(r => (
              <div key={r.route} className={styles.barItem}>
                <div className={styles.barLabel}>{r.route}</div>
                <div className={styles.barWrapper}>
                  <div className={styles.barFill} style={{ width: `${r.percent}%` }}></div>
                </div>
                <div className={styles.barCount}>{r.count}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Flights by Region */}
        <section className={styles.chartSection}>
          <h3>Flights by Region</h3>
          <div className={styles.barChart}>
            {Object.entries(data.regions).map(([region, count]) => (
              <div key={region} className={styles.barItem}>
                <div className={styles.barLabel}>{region}</div>
                <div className={styles.barWrapper}>
                  <div className={styles.barFill} style={{ width: `${(count/5000)*100}%`, backgroundColor: '#3b82f6' }}></div>
                </div>
                <div className={styles.barCount}>{count}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Traffic Density - Simplified Line Graph using CSS clip-path or segments */}
        <section className={styles.chartSection}>
          <h3>24hr Traffic Density</h3>
          <div className={styles.trafficGraph}>
            {data.trafficDensity.map((val, i) => (
              <div 
                key={i} 
                className={styles.graphPillar} 
                style={{ height: `${val}%` }}
              >
                <div className={styles.pillarTooltip}>{val}%</div>
              </div>
            ))}
          </div>
          <div className={styles.graphLabels}>
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </section>
      </div>
    </div>
  );
}
