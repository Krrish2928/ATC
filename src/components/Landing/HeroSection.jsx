import GlobeScene from '../Globe/GlobeScene.jsx'
import GlobeErrorBoundary from '../Globe/GlobeErrorBoundary.jsx'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  return (
    <section className={styles.hero} id="hero" aria-label="Hero">
      {/* Ambient glow blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      {/* Left: copy */}
      <div className={styles.copy}>
        <span className="section-label anim-fade-up">
          Earth Intelligence Platform
        </span>

        <h1 className={`${styles.headline} anim-fade-up-d1`}>
          See the world<br />
          <span className={styles.gradientText}>differently.</span>
        </h1>

        <p className={`${styles.sub} anim-fade-up-d2`}>
          Real-time intelligence, beautifully visualised. Monitor, analyse, and act
          on global data streams — all in one living view.
        </p>

        <div className={`${styles.ctas} anim-fade-up-d3`}>
          <a href="#started" className="btn btn-primary" id="hero-cta-primary">
            Get started
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="#demo" className="btn btn-outline" id="hero-cta-demo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
            </svg>
            Watch demo
          </a>
        </div>

        <div className={`${styles.stats} anim-fade-up-d4`}>
          {[
            { value: '190+', label: 'Countries tracked' },
            { value: '2ms',  label: 'Avg. latency' },
            { value: '99.9%',label: 'Uptime SLA' },
          ].map(({ value, label }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: 3-D Globe — wrapped in error boundary so missing textures don't crash the page */}
      <div className={`${styles.globeWrapper} anim-fade-in`} aria-label="Interactive 3D Earth globe">
        <GlobeErrorBoundary>
          <GlobeScene />
        </GlobeErrorBoundary>
      </div>
    </section>
  )
}
