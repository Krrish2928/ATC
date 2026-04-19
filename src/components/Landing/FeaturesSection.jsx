import styles from './FeaturesSection.module.css'

const features = [
  {
    id: 'realtime',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Real-time Streams',
    desc: 'Ingest and visualise live data feeds from satellites, IoT sensors, and APIs with sub-2ms latency.',
  },
  {
    id: 'analytics',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21H3V3"/>
        <polyline points="7 14 11 10 15 13 19 7"/>
      </svg>
    ),
    title: 'Predictive Analytics',
    desc: 'AI-driven models forecast global trends, climate patterns, and supply chain disruptions before they happen.',
  },
  {
    id: 'security',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Enterprise Security',
    desc: 'SOC 2 Type II certified infrastructure. End-to-end encryption and role-based access keep your data safe.',
  },
]

export default function FeaturesSection() {
  return (
    <section className={styles.section} id="product" aria-labelledby="features-heading">
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">Platform Features</span>
          <h2 id="features-heading" className={styles.heading}>
            Everything you need to<br />
            <span className={styles.accent}>understand our planet</span>
          </h2>
          <p className={styles.sub}>
            From raw data ingestion to executive dashboards — Orbis handles the heavy lifting
            so your team can focus on decisions, not infrastructure.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map(({ id, icon, title, desc }) => (
            <article key={id} className={styles.card} id={`feature-${id}`}>
              <div className={styles.iconWrap} aria-hidden="true">
                {icon}
              </div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{desc}</p>
              <div className={styles.cardGlow} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
