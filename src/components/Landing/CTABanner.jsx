import styles from './CTABanner.module.css'

export default function CTABanner() {
  return (
    <section className={styles.section} id="cta" aria-labelledby="cta-heading">
      <div className={styles.inner}>
        {/* Background grid decoration */}
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.glowLeft}  aria-hidden="true" />
        <div className={styles.glowRight} aria-hidden="true" />

        <div className={styles.content}>
          <span className="section-label" style={{ justifyContent: 'center' }}>
            Start Today
          </span>
          <h2 id="cta-heading" className={styles.heading}>
            Ready to see the world<br />from a new perspective?
          </h2>
          <p className={styles.sub}>
            Join 2,400+ organisations already using Orbis to turn global data into
            competitive advantage. Free 14-day trial, no credit card required.
          </p>
          <div className={styles.actions}>
            <a href="#started" className="btn btn-primary" id="cta-primary">
              Get started free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#contact" className="btn btn-outline" id="cta-secondary">
              Talk to sales
            </a>
          </div>
          <p className={styles.fine}>
            No credit card · Cancel anytime · SOC 2 certified
          </p>
        </div>
      </div>
    </section>
  )
}
